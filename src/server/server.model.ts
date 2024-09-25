import { Server, createServer, ServerResponse, IncomingMessage } from 'http';
import { RegisterRouteOptions } from './server.types';
import { defaultAppHeaders } from '../constants/http.constants';
import { parseIncommingMessageData } from './server.utils';
import { Logger } from '../logger/logger.manager';
import { AuthManager } from '../auth/auth.manager';
import { ReplicationManager } from '../replicator/replicator.manager';

export const PORT = 8000;

export class ServerFactory {
    private readonly logger = Logger.forClass(ServerFactory.name);

    private routeRegistry: Record<string, RegisterRouteOptions> = {};

    public constructor(
        private readonly server: Server,
        private readonly replicationManager: ReplicationManager,
        private readonly authManager: AuthManager,
    ) {}

    public static base = (): ServerFactory => {
        return new ServerFactory(createServer(), ReplicationManager.base(), AuthManager.get());
    };

    public registerRoute = (options: RegisterRouteOptions): ServerFactory => {
        this.routeRegistry[this.constructRegistryKey(options)] = options;
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

        if (options.replicateRequest) {
            return this.processRequestReplication(request, response, options);
        }

        const requestData = await parseIncommingMessageData(request);
        const data = await options.processor({ data: requestData });
        return this.processSuccessfullRequest(response, data);
    };

    private processRequestReplication = async (
        request: IncomingMessage,
        serverResponse: ServerResponse,
        requestOptions: RegisterRouteOptions,
    ) => {
        const requestData = await parseIncommingMessageData(request);

        const processorResponse = await requestOptions.processor({ data: requestData });
        await this.replicationManager.replicate({ data: requestData }, requestOptions);

        return this.processSuccessfullRequest(serverResponse, processorResponse);
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
