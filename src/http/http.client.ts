import http from 'http';
import { HttpMethod, httpMethods, defaultAppHeaders } from '../constants/http.constants';
import { HttpClientGeneralRequestProperties, HttpClientRequestProperties } from './http.types';
import { Logger } from '../logger/logger.manager';

export class HttpClient {
    private readonly logger = Logger.forClass(HttpClient.name);

    private static instance = new HttpClient();

    public static get = () => {
        return this.instance;
    };

    private readonly httpMethodToProcessor: Record<HttpMethod, (options: HttpClientRequestProperties) => Promise<any>> =
        {
            POST: (options) => this.post(options),
            GET: (options) => this.get(options),
        };

    public request = async ({ method, ...rest }: HttpClientGeneralRequestProperties) => {
        const processor = this.httpMethodToProcessor[method];
        if (!processor) {
            throw new Error(`Unsupported method: ${method}`);
        }

        return processor(rest);
    };

    public post = async (options: HttpClientRequestProperties) => {
        return this.processHttpRequest(httpMethods.POST, options);
    };

    public get = async (options: HttpClientRequestProperties) => {
        return this.processHttpRequest(httpMethods.GET, options);
    };

    private processHttpRequest = async (
        method: HttpMethod,
        { host, path, data, headers, port }: HttpClientRequestProperties,
    ) => {
        const request = http.request({
            host,
            path,
            method,
            port,
            headers: { ...defaultAppHeaders, ...(headers || {}) },
        });

        this.logger.info(`Preparing to execute http request to ${host}${path}`);

        if (data) {
            const stringifiedData = JSON.stringify(data);
            request.write(stringifiedData);
        }

        request.end();

        return new Promise((resolve) => {
            request.on('response', (response) => {
                response.setEncoding('utf-8');

                response.on('data', (responseData) => {
                    resolve(responseData);
                });
            });
        });
    };
}
