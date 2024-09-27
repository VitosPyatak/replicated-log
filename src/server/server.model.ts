import { Server, createServer, ServerResponse, IncomingMessage } from 'http';
import { RegisterRouteOptions } from './server.types';
import { defaultAppHeaders } from '../constants/http.constants';
import { parseIncommingMessageData } from './server.utils';
import { Logger } from '../logger/logger.manager';
import { AuthManager } from '../auth/auth.manager';
import { ReplicationManager } from '../replicator/replicator.manager';
import { ReplicationIdStore } from '../replicator/replication-id.store';
import { ReplicationEntity } from '../replicator/replicator.types';

export const PORT = 8000;

export class ServerFactory {
    private readonly logger = Logger.forClass(ServerFactory.name);

    private routeRegistry: Record<string, RegisterRouteOptions> = {};

    private replicationIdStores: Record<string, ReplicationIdStore> = {};

    public constructor(
        private readonly server: Server,
        private readonly replicationManager: ReplicationManager,
        private readonly authManager: AuthManager,
    ) {}

    public static base = (): ServerFactory => {
        return new ServerFactory(createServer(), ReplicationManager.base(), AuthManager.get());
    };

    public registerRoute = (options: RegisterRouteOptions): ServerFactory => {
        const key = this.constructRegistryKey(options);

        if (options.replication?.doReplicate) {
            this.replicationIdStores[key] = new ReplicationIdStore();
        }

        this.routeRegistry[key] = options;
        return this;
    };

    public run = (): ServerFactory => {
        this.server
            .on('request', async (request, response) => {
                try {
                    return await this.processIncomingRequest(request, response);
                } catch (error: any) {
                    response.writeHead(500, error.message);
                    return response.end();
                }
            })
            .listen(PORT, () => {
                this.logger.info(`Listening on ${PORT}`);
            });
        return this;
    };

    private processIncomingRequest = async (request: IncomingMessage, response: ServerResponse) => {
        const key = this.constructRegistryKeyFromRequest(request);

        const options = this.routeRegistry[key];
        if (!options) return this.handleNotFound(response);

        this.authManager.validate(request, options);

        if (options.replication?.doReplicate) {
            const replicationId = this.replicationIdStores[key].next();
            return this.processRequestReplication(request, response, options, replicationId);
        }

        const requestData = await parseIncommingMessageData(request);
        const data = await options.processor({ data: requestData });
        return this.processSuccessfullRequest(response, data);
    };

    private processRequestReplication = async (
        request: IncomingMessage,
        serverResponse: ServerResponse,
        requestOptions: RegisterRouteOptions,
        replicationId: number,
    ) => {
        const requestData = await parseIncommingMessageData<Record<string, any>>(request);
        const data: ReplicationEntity<Record<string, any>> = { ...requestData, _replicationId: replicationId };

        const actualResponse = await requestOptions.processor({ data });
        await this.replicationManager.replicate({ data }, requestOptions);

        return this.processSuccessfullRequest(serverResponse, actualResponse);
    };

    private processSuccessfullRequest = (response: ServerResponse, data: any) => {
        return response.writeHead(200, defaultAppHeaders).end(JSON.stringify({ data }));
    };

    private handleNotFound = (response: ServerResponse) => {
        response.writeHead(404);
        return response.end();
    };

    private constructRegistryKey = ({ path, method }: RegisterRouteOptions) => {
        return `${path}_${method}`;
    };

    private constructRegistryKeyFromRequest = ({ url, method }: IncomingMessage) => {
        return `${url}_${method}`;
    };
}
