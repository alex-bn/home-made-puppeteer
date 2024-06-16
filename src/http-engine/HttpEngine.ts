import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as https from "https";
import * as fs from "fs";

type ApiError = {
  status: number;
  data: any;
};

export default class HttpEngine {
  private baseURL: string;
  private headers: Record<string, string>;
  private instance: AxiosInstance | null = null;
  private pfxPath: string | null = null;
  private pfxPassphrase: string | null = null;

  constructor(
    baseURL: string,
    pfxPath?: string | null,
    pfxPassphrase?: string | null,
    headers?: Record<string, string>
  ) {
    this.baseURL = baseURL;
    this.pfxPath = pfxPath || null;
    this.pfxPassphrase = pfxPassphrase || null;
    this.headers = headers || {}; // default headers
  }

  private get http(): AxiosInstance {
    return this.instance != null ? this.instance : this.initHttp();
  }

  private initHttp() {
    const http = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        pfx: this.pfxPath !== null ? fs.readFileSync(this.pfxPath) : undefined,
        passphrase: this.pfxPassphrase !== null ? this.pfxPassphrase : undefined,
      }),
      baseURL: this.baseURL,
      headers: this.headers,
      timeout: 60000,
    });

    http.interceptors.response.use(
      (response: AxiosResponse) => this.handleResponse(response),
      (error: AxiosError) => this.handleError(error)
    );

    this.instance = http;
    return http;
  }

  private handleError(error: AxiosError): Promise<never> {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data }: ApiError = error.response;
      return Promise.reject({ status, data });
    } else {
      console.error("Unexpected error: ", error.message);
      return Promise.reject(error);
    }
  }

  private handleResponse(response: AxiosResponse) {
    // console.log(response);
    const { status, data } = response;
    return { status, data } as AxiosResponse;
  }

  // https://axios-http.com/docs/req_config
  request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    return this.http.request(config);
  }

  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.get<T, R>(url, config);
  }

  post<T = any, R = AxiosResponse<T>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
    return this.http.post<T, R>(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
    return this.http.put<T, R>(url, data, config);
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.delete<T, R>(url, config);
  }
}
