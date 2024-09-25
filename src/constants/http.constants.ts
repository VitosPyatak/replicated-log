export const defaultAppHeaders = {
    'Content-Type': 'application/json',
} as const;

export const httpMethods = {
    POST: 'POST',
    GET: 'GET',
} as const;

export type HttpMethod = (typeof httpMethods)[keyof typeof httpMethods];
