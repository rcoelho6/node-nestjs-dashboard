import { Injectable, HttpService, Logger, HttpException } from '@nestjs/common';
import { AxiosResponse, AxiosRequestConfig, Method } from 'axios';

@Injectable()
export class CustomHttpService {
  private logger = new Logger(CustomHttpService.name);
  private _baseUrl: string;

  constructor(private http: HttpService) {
    this.setupLoggerInterceptor();
  }

  public set baseUrl(baseUrl: string) {
    while (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }
    this._baseUrl = baseUrl;
  }

  public get baseUrl(): string {
    return this._baseUrl || '';
  }

  get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', endpoint, null, config);
  }

  post<T>(endpoint: string, body: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', endpoint, body, config);
  }

  put<T>(endpoint: string, body: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', endpoint, body, config);
  }

  delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', endpoint, null, config);
  }

  patch<T>(endpoint: string, body: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, config);
  }

  private request<T>(method: Method, endpoint: string, body?: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headersRequest = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    switch (method) {
      case 'GET':
        return this.http.get<T>(url, { headers: headersRequest, ...config }).toPromise();
      case 'POST':
        return this.http.post<T>(url, body, { headers: headersRequest, ...config }).toPromise();
      case 'PUT':
        return this.http.put<T>(url, body, { headers: headersRequest, ...config }).toPromise();
      case 'DELETE':
        return this.http.delete<T>(url, { headers: headersRequest, ...config }).toPromise();
      case 'PATCH':
        return this.http.patch<T>(url, body, { headers: headersRequest, ...config }).toPromise();
      default:
        throw new HttpException('Invalid http verb', 500);
    }
  }

  private setupLoggerInterceptor() {
    this.http.axiosRef.interceptors.request.use(
      (cfg) => this.logOnRequestSuccess(cfg),
      (err) => this.logOnRequestError(err),
    );
    this.http.axiosRef.interceptors.response.use(
      (res) => this.logOnResponseSuccess(res),
      (err) => this.logOnResponseError(err),
    );
  }

  private logOnRequestSuccess(config: AxiosRequestConfig): AxiosRequestConfig {
    this.logger.debug(JSON.stringify(config), `Request to ${config.method.toUpperCase()} ${config.url}`);

    return config;
  }

  private logOnRequestError(error: any): Promise<any> {
    this.logger.error('An error occured', JSON.stringify(error));

    return Promise.reject(error);
  }

  private logOnResponseSuccess(response: AxiosResponse<any>): AxiosResponse<any> {
    this.logger.debug(JSON.stringify({
      request: { ...response.config },
      response: {
        statusText: response.statusText,
        status: response.status,
        body: response.data,
        headers: response.headers,
      },
    }), `Response of ${response.config.method.toUpperCase()} ${response.config.url}`);

    return response;
  }

  private logOnResponseError(error: any): Promise<any> {
    this.logger.error('An error occured', JSON.stringify(error));

    return Promise.reject(error);
  }
}
