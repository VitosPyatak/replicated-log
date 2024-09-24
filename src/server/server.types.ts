export type ParsedIncommingRequest<T> = {
    data?: T
}

export type RegisterRouteOptions = {
    path: string;
    method: string;
    processor: (request: ParsedIncommingRequest<any>) => Promise<any>;
    replicateRequest?: boolean;
};

