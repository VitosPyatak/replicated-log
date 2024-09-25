import { AuthManager } from '../auth/auth.manager';
import { HttpClient } from '../http/http.client';
import { HttpClientGeneralRequestProperties } from '../http/http.types';
import { Logger } from '../logger/logger.manager';
import { PORT } from '../server/server.model';
import { ParsedIncommingRequest, RegisterRouteOptions } from '../server/server.types';
import { EnvContext } from '../utils/env.context';

export class ReplicationManager {
    private readonly logger = Logger.forClass(ReplicationManager.name);

    private constructor(
        private readonly httpClient: HttpClient,
        private readonly authManager: AuthManager,
    ) {}

    public static base = () => {
        return new ReplicationManager(HttpClient.get(), AuthManager.get());
    };

    public replicate = async (parsedRequest: ParsedIncommingRequest<any>, requestOptions: RegisterRouteOptions) => {
        const { accessStrategy, path, method } = requestOptions;
        const replicationRequestsOptions: HttpClientGeneralRequestProperties[] = EnvContext.getReplicaHostNames().map(
            (host) => {
                const headers: Record<string, string> = accessStrategy
                    ? { authorization: this.authManager.generateAccessToken(accessStrategy) }
                    : {};
                return { host, path, method, data: parsedRequest.data, headers, port: PORT };
            },
        );

        return Promise.all(replicationRequestsOptions.map(this.httpClient.request));
    };
}
