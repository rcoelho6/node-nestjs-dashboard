import { NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

export type StatusCode =
  InformationalStatusCode |
  SucessStatusCode |
  RedirectionStatusCode |
  ClientErrorStatusCode |
  ServerErrorStatusCode;

export type InformationalStatusCode =
  100 | 101 | 102;

export type SucessStatusCode =
  200 | 201 | 202 | 203 | 204 |
  205 | 206 | 207 | 208 | 226;

export type RedirectionStatusCode =
  300 | 301 | 302 | 303 |
  304 | 305 | 307 | 308;

export type ClientErrorStatusCode =
  400 | 401 | 402 | 403 | 404 | 405 |
  406 | 407 | 408 | 409 | 410 | 411 |
  412 | 413 | 414 | 415 | 416 | 417 |
  418 | 421 | 422 | 423 | 424 | 426 |
  428 | 429 | 431 | 444 | 451 | 499;

export type ServerErrorStatusCode =
  500 | 501 | 502 | 503 | 504 | 505 |
  506 | 507 | 508 | 510 | 511 | 599;

export function createMockHttpResponse<T>(data: T, status: StatusCode, statusText: string, headers: any = {}): AxiosResponse<T> {
  return {
    data,
    status,
    statusText,
    headers,
    config: {},
  };
}

export function throwNotFoundExceptionIfStatusIs404(response: AxiosResponse<any>, message?: any, error?: string) {
  if (response.status === 404) {
    throw new NotFoundException(message, error);
  }
}

export function throwConflictExceptionIfStatusIs409(response: AxiosResponse<any>, message?: any, error?: string) {
  if (response.status === 409) {
    throw new ConflictException(message, error);
  }
}

export function throwInternalServerErrorIfNotSuccess(response: AxiosResponse<any>, message?: any, error?: string) {
  if (response.status < 200 || response.status >= 300) {
    throw new InternalServerErrorException(message, error);
  }
}
