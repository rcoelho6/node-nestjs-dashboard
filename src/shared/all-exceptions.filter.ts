import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

export type LogLevel = 'none' | 'http' | 'all';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  constructor(private logLevel: LogLevel = 'all') {
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let errorResponse: any;
    let isHttpException = false;

    if (exception instanceof HttpException) {
      isHttpException = true;
      errorResponse = this.getHttpExceptionErrorResponse(exception);
    } else {
      errorResponse = { statusCode: 500, error: 'Internal Server Error' };
    }

    if (this.logLevel === 'all' || (this.logLevel === 'http' && isHttpException)) {
      this.logException(ctx, exception);
    }

    response
      .status(errorResponse.statusCode)
      .json(errorResponse);
  }

  getHttpExceptionErrorResponse(exception: HttpException): any {
    const statusCode = exception.getStatus();
    const { error, message } = exception.message;

    let details = [];
    if (message) {
      if (Array.isArray(message)) {
        details = message.map(m => ({ field: m.property, messages: Object.values(m.constraints) }));
      } else {
        details = [{messages: [message]}];
      }
    }

    return details.length > 0
      ? { statusCode, error, details }
      : { statusCode, error };
  }

  logException(ctx: HttpArgumentsHost, exception: unknown): void {
    const request = ctx.getRequest();
    let exceptionMessage: any;

    try {
      exceptionMessage = (exception as any).message;
    } catch (error) {
      exceptionMessage = exception;
    }

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        exception: exceptionMessage,
      }),
      'AllExceptionsFilter',
    );
  }
}
