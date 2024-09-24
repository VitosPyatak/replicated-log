import { HttpMethod } from '../constants/http.constants';

export type HttpClientRequestProperties = {
  host: string;
  path: string;
  data?: any;
}

export type HttpClientGeneralRequestProperties = HttpClientRequestProperties & {
  method: HttpMethod;
}
