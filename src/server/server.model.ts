import { Server, createServer, ServerResponse, IncomingMessage } from 'http';
import { RegisterRouteOptions } from './server.types';
import { defaultAppHeaders, HttpMethod } from '../constants/http.constants';
import { EnvContext } from '../utils/env.context';
import { HttpClientGeneralRequestProperties } from '../http/http.types';
import { HttpClient } from '../http/http.client';
import { parseIncommingMessageData } from './server.utils';
import { Logger } from '../logger/logger.manager';
import { AuthManager } from '../auth/auth.manager';

const PORT = 8000;

export class ServerFactory {
    private readonly logger = Logger.forClass(ServerFactory.name);

    private routeRegistry: Record<string, RegisterRouteOptions> = {};

    public constructor(
        private readonly server: Server,
        private readonly httpClient: HttpClient,
        private readonly authManager: AuthManager
    ) { }

    public static base = (): ServerFactory => {
        return new ServerFactory(
            createServer(),
            HttpClient.get(),
            AuthManager.get()
        );
    };

    public registerRoute = (options: RegisterRouteOptions): ServerFactory => {
        this.routeRegistry[this.constructRegistryKey(options)] = options;
        return this;
    };

    public run = (): ServerFactory => {
        this.server.on('request', async (request, response) => {
            try {
                return await this.processIncomingRequest(request, response);
            } catch (error: any) {
                response.writeHead(500, error.message);
                return response.end();
            }
        }).listen(PORT, () => {
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
        { path, method, accessStrategy, processor }: RegisterRouteOptions
    ) => {
        const requestData = await parseIncommingMessageData(request);

        const processorResponse = await processor({ data: requestData });
        const replicationRequestsOptions: HttpClientGeneralRequestProperties[] = EnvContext.getReplicaHostNames()
            .map(host => {
                const headers: Record<string, string> = accessStrategy ? { authorization: this.authManager.generateAccessToken(accessStrategy) } : {};
                this.logger.info(JSON.stringify(headers));
                return { host, path, method: method as HttpMethod, data: requestData, headers }
            });

        return Promise
            .all(replicationRequestsOptions.map(this.httpClient.request))
            .then(() => this.processSuccessfullRequest(serverResponse, processorResponse));
    }

    private processSuccessfullRequest = (response: ServerResponse, data: any) => {
        return response
            .writeHead(200, defaultAppHeaders)
            .end(JSON.stringify({ data }))
    }

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
