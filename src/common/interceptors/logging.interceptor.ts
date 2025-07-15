import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../logging/logger.service.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Extract user ID from request (if authenticated)
    const userId = request.user?.id || request.user?.sub;
    
    const logContext = {
      userId,
      endpoint: `${request.method} ${request.url}`,
      method: request.method,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      requestId,
    };

    // Log incoming request
    this.loggerService.logApiRequest(logContext);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.loggerService.logApiResponse({
          ...logContext,
          duration,
          statusCode: response.statusCode,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        
        this.loggerService.error(
          `API Error: ${error.message}`,
          error,
          {
            ...logContext,
            duration,
            statusCode,
          }
        );
        
        return throwError(() => error);
      })
    );
  }
}