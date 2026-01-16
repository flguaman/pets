import { ERROR_MESSAGES } from './constants';

export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
  retryable: boolean;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  static createError(
    message: string, 
    code?: string, 
    retryable: boolean = true,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      message,
      code,
      timestamp: Date.now(),
      retryable,
      context
    };

    this.logError(error);
    return error;
  }

  static handleSupabaseError(error: any, operation: string): AppError {
    console.error(`Supabase error in ${operation}:`, error);

    let message = ERROR_MESSAGES.SERVER_ERROR;
    let retryable = true;
    let code = error?.code;

    // Handle specific Supabase errors
    switch (error?.code) {
      case 'PGRST116':
        message = ERROR_MESSAGES.NOT_FOUND;
        retryable = false;
        break;
      case '401':
      case 'PGRST301':
        message = ERROR_MESSAGES.AUTH_ERROR;
        retryable = false;
        break;
      case '403':
        message = ERROR_MESSAGES.PERMISSION_ERROR;
        retryable = false;
        break;
      case '23505':
        message = 'Ya existe un registro con estos datos';
        retryable = false;
        break;
      case '23503':
        message = 'Error de referencia en la base de datos';
        retryable = false;
        break;
      default:
        if (error?.message?.includes('fetch')) {
          message = ERROR_MESSAGES.NETWORK_ERROR;
          retryable = true;
        } else if (error?.message) {
          message = error.message;
        }
    }

    return this.createError(message, code, retryable, { operation, originalError: error });
  }

  static handleNetworkError(error: any, operation: string): AppError {
    console.error(`Network error in ${operation}:`, error);

    let message = ERROR_MESSAGES.NETWORK_ERROR;
    let retryable = true;

    if (error?.name === 'AbortError') {
      message = 'Operación cancelada por timeout';
      retryable = true;
    } else if (!navigator.onLine) {
      message = 'Sin conexión a internet';
      retryable = true;
    }

    return this.createError(message, 'NETWORK_ERROR', retryable, { operation });
  }

  static handleValidationError(errors: string[]): AppError {
    const message = `Datos inválidos: ${errors.join(', ')}`;
    return this.createError(message, 'VALIDATION_ERROR', false, { validationErrors: errors });
  }

  private static logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static getErrorsByOperation(operation: string): AppError[] {
    return this.errorLog.filter(error => error.context?.operation === operation);
  }
}