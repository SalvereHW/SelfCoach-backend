import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  userId?: number;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
  action?: string;
  // Additional properties for health data logging
  sleepMetricId?: number;
  nutritionMetricId?: number;
  activityMetricId?: number;
  dailySummaryId?: number;
  recordCount?: number;
  mealType?: string;
  activityType?: string;
  date?: string;
  found?: boolean;
  daysRequested?: number;
  recordsFound?: number;
  statsGenerated?: boolean;
  summaryGenerated?: boolean;
  [key: string]: any; // Allow additional properties
}

export interface SecurityLogContext extends LogContext {
  action: string;
  resource?: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  info(message: string, context?: LogContext): void {
    const logData = this.sanitizeContext(context);
    this.logger.log(`${message} ${JSON.stringify(logData)}`);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const logData = this.sanitizeContext(context);
    const errorData = error
      ? {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack,
        }
      : {};

    this.logger.error(
      `${message} ${JSON.stringify({ ...logData, error: errorData })}`,
    );
  }

  warn(message: string, context?: LogContext): void {
    const logData = this.sanitizeContext(context);
    this.logger.warn(`${message} ${JSON.stringify(logData)}`);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      const logData = this.sanitizeContext(context);
      this.logger.debug(`${message} ${JSON.stringify(logData)}`);
    }
  }

  // Security-specific logging
  logSecurityEvent(event: SecurityLogContext): void {
    const sanitizedEvent = this.sanitizeContext(event);
    this.logger.log(`SECURITY_EVENT: ${JSON.stringify(sanitizedEvent)}`);
  }

  // API request logging
  logApiRequest(context: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.log(`API_REQUEST: ${JSON.stringify(sanitizedContext)}`);
  }

  // API response logging
  logApiResponse(context: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.log(`API_RESPONSE: ${JSON.stringify(sanitizedContext)}`);
  }

  // Authentication events
  logAuthEvent(
    action: string,
    success: boolean,
    context: LogContext,
    reason?: string,
  ): void {
    this.logSecurityEvent({
      ...context,
      action,
      success,
      reason,
    });
  }

  // Data access logging (for audit purposes)
  logDataAccess(action: string, resource: string, context: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.log(
      `DATA_ACCESS: ${JSON.stringify({
        ...sanitizedContext,
        action,
        resource,
        timestamp: new Date().toISOString(),
      })}`,
    );
  }

  private sanitizeContext(context?: LogContext): any {
    if (!context) return {};

    // Remove or mask sensitive data
    const sanitized = { ...context };

    // Never log passwords, tokens, or sensitive health data
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    // Mask IP addresses in production for privacy
    if (this.isProduction && sanitized.ip) {
      const ipParts = sanitized.ip.split('.');
      if (ipParts.length === 4) {
        sanitized.ip = `${ipParts[0]}.${ipParts[1]}.xxx.xxx`;
      }
    }

    // Add timestamp (as any to avoid TypeScript issues)
    (sanitized as any).timestamp = new Date().toISOString();

    return sanitized;
  }
}
