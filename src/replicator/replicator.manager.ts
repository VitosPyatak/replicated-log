import { AuthManager } from '../auth/auth.manager';
import { HttpClient } from '../http/http.client';
import { HttpClientGeneralRequestProperties } from '../http/http.types';
import { Logger } from '../logger/logger.manager';
import { PORT } from '../server/server.model';
import { ParsedIncommingRequest, RegisterRouteOptions } from '../server/server.types';
import { EnvContext } from '../utils/env.context';
import { ReplicationEntity } from './replicator.types';

const MASTER_CONCERN_REPLICATIONS = 0;

export class ReplicationManager {
    private readonly logger = Logger.forClass(ReplicationManager.name);

    private constructor(
        private readonly httpClient: HttpClient,
        private readonly authManager: AuthManager,
    ) {}

    public static base = () => {
        return new ReplicationManager(HttpClient.get(), AuthManager.get());
    };

    public replicate = async (
        parsedRequest: ParsedIncommingRequest<ReplicationEntity<Record<string, any>>>,
        requestOptions: RegisterRouteOptions,
    ) => {
        const { accessStrategy, path, method } = requestOptions;
        const { data } = parsedRequest;
        const replicationRequestsOptions: HttpClientGeneralRequestProperties[] = EnvContext.getReplicaHostNames().map(
            (host) => {
                const headers: Record<string, string> = accessStrategy
                    ? { authorization: this.authManager.generateAccessToken(accessStrategy) }
                    : {};
                return { host, path, method, data, headers, port: PORT };
            },
        );

        return await this.processReplication(replicationRequestsOptions);
    };

    private processReplication = async (requestOptions: HttpClientGeneralRequestProperties[]) => {
        let replicationsCount = 0;
        const requiredReplicationsCount = this.getRequiredReplicationsCount();

        this.logger.info(`Required replications count: ${requiredReplicationsCount}`);

        return new Promise<void>((resolve) => {
            if (requiredReplicationsCount === MASTER_CONCERN_REPLICATIONS) resolve();

            requestOptions.forEach((options) => {
                this.httpClient.request(options).then(() => {
                    this.logger.info(`Received acknowledgment from ${options.host}`);
                    replicationsCount++;
                    if (replicationsCount === requiredReplicationsCount) {
                        this.logger.info(
                            `Resolving request after receiving acknowledgment from ${replicationsCount} replicas`,
                        );
                        resolve();
                    }
                });
            });
        });
    };

    private getRequiredReplicationsCount = () => {
        const replicationConcern = EnvContext.getReplicationWriteConcern();
        if (replicationConcern === 'master') return MASTER_CONCERN_REPLICATIONS;
        return +replicationConcern;
    };
}
