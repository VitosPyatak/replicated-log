export const defaultAppHeaders = {
  'Content-Type': 'application/json'
} as const;

export const httpMethods = {
  POST: 'POST'
} as const;

export type HttpMethod = typeof httpMethods[keyof typeof httpMethods];
