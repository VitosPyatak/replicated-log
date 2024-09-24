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


  private readonly httpMethodToProcessor: Record<HttpMethod, (options: HttpClientRequestProperties) => Promise<any>> = {
    POST: (options) => this.post(options)
  }

  public request = async ({ method, ...rest }: HttpClientGeneralRequestProperties) => {
    const processor = this.httpMethodToProcessor[method];
    if (!processor) {
      throw new Error(`Unsupported method: ${method}`);
    }

    return processor(rest);
  }

  public post = async (options: HttpClientRequestProperties) => {
    return this.processHttpRequest(httpMethods.POST, options);
  };

  private processHttpRequest = async (method: HttpMethod, { host, path, data, headers }: HttpClientRequestProperties) => {
    const request = http.request({
      host: host,
      path,
      method,
      port: 8000,
      headers: { ...defaultAppHeaders, ...(headers || {}) }
    });

    this.logger.info(`Preparing to execture http request with ${host}${path}`);

    if (data) {
      const stringifiedData = JSON.stringify(data);
      request.write(stringifiedData);
    }

    request.end();

    return new Promise(resolve => {
      request.on('response', (response) => {
        response.setEncoding('utf-8');

        response.on('data', (responseData) => {
          resolve(responseData);
        });
      });
    })
  }
}
