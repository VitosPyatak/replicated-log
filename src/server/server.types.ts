import { AppAcessStrategies } from '../auth/auth.types';
import { HttpMethod } from '../constants/http.constants';
import { ReplicationIdStore } from '../replicator/replication-id.store';

export type ParsedIncommingRequest<T> = {
    data?: T;
};

export type RegisterRouteOptions = {
    path: string;
    method: HttpMethod;
    processor: (request: ParsedIncommingRequest<any>) => Promise<Record<string, any>>;
    replication?: {
        doReplicate: boolean;
    };
    accessStrategy?: AppAcessStrategies;
};
