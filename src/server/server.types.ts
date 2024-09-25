import { AppAcessStrategies } from '../auth/auth.types';
import { HttpMethod } from '../constants/http.constants';

export type ParsedIncommingRequest<T> = {
    data?: T;
};

export type RegisterRouteOptions = {
    path: string;
    method: HttpMethod;
    processor: (request: ParsedIncommingRequest<any>) => Promise<any>;
    replicateRequest?: boolean;
    accessStrategy?: AppAcessStrategies;
};
