import { AuthManager } from '../auth/auth.manager';
import { HttpClient } from '../http/http.client';
import { HttpClientGeneralRequestProperties } from '../http/http.types';
import { Logger } from '../logger/logger.manager';
import { PORT } from '../server/server.model';
import { ParsedIncommingRequest, RegisterRouteOptions } from '../server/server.types';
import { EnvContext } from '../utils/env.context';
import events from 'events';
import crypto from 'crypto';

export const eventEmitter = new events.EventEmitter();

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

        if (this.isMajorReplication()) {
            return await this.executeMajorReplication(replicationRequestsOptions);
        }

        return this.executeWriteConcernReplication(replicationRequestsOptions);
    };

    private executeWriteConcernReplication = async (requestOptions: HttpClientGeneralRequestProperties[]) => {
        let replicationsCount = 0;

        const eventId = crypto.randomUUID();

        return new Promise((resolve) => {
            eventEmitter.on(eventId, (replicaName) => {
                replicationsCount++;
                this.logger.info(`Received acknowledgment from ${replicaName}`);
                if (replicationsCount === EnvContext.getReplicationWriteConcern()) {
                    eventEmitter.removeAllListeners(eventId);
                    resolve(requestOptions);
                }
            });

            requestOptions.forEach((options) => {
                this.httpClient.request(options).then(() => {
                    eventEmitter.emit(eventId, options.host);
                });
            });
        });
    };

    private executeMajorReplication = async (requestOptions: HttpClientGeneralRequestProperties[]) => {
        await Promise.all(requestOptions.map(this.httpClient.request));
        this.logger.info('Received acknowledgment from all replicas');
    };

    private isMajorReplication = () => {
        return EnvContext.getNumberOfReplicas() === EnvContext.getReplicationWriteConcern();
    };
}
