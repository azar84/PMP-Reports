// Client-side error handling utilities
import { NextResponse } from 'next/server';

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Predefined error types
export const ErrorTypes = {
  VALIDATION_ERROR: (message: string, details?: any) => 
    new AppError(message, 400, 'VALIDATION_ERROR', details),
  
  NOT_FOUND: (resource: string = 'Resource') => 
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  
  UNAUTHORIZED: (message: string = 'Unauthorized access') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  FORBIDDEN: (message: string = 'Forbidden access') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  NETWORK_ERROR: (message: string = 'Network error occurred') => 
    new AppError(message, 0, 'NETWORK_ERROR'),
  
  SERVER_ERROR: (message: string = 'Internal server error') => 
    new AppError(message, 500, 'SERVER_ERROR'),
} as const;

// Error handler for fetch requests
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: any = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // Response doesn't contain JSON, use status text
    }

    const statusCode = response.status;
    let errorCode = 'HTTP_ERROR';

    switch (statusCode) {
      case 400:
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        break;
      case 422:
        errorCode = 'VALIDATION_ERROR';
        break;
      case 500:
        errorCode = 'SERVER_ERROR';
        break;
    }

    throw new AppError(errorMessage, statusCode, errorCode, errorDetails);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AppError('Invalid JSON response', 500, 'PARSE_ERROR');
  }
}

// Enhanced fetch wrapper with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Network or other fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw ErrorTypes.NETWORK_ERROR('Unable to connect to server');
    }

    // Unknown error
    throw ErrorTypes.SERVER_ERROR(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

// Error logging utility
export function logError(error: Error | AppError, context?: string) {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    }),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, etc.
  // sentry.captureException(error, { extra: errorInfo });
}

// Hook for error handling in React components
export function useErrorHandler() {
  return (error: Error | AppError, context?: string) => {
    logError(error, context);
    
    // You could also show a toast notification here
    // toast.error(error.message);
    
    // Re-throw to let error boundaries handle it
    throw error;
  };
}

// Utility to safely execute async operations
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (onError) {
      onError(err);
    } else {
      logError(err, 'safeAsync operation');
    }

    return fallback;
  }
}

// Server-side error handler for API routes
export function handleApiError(error: unknown, context: string = 'API Error') {
  console.error(`${context}:`, error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details })
      },
      { status: error.statusCode }
    );
  }
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            message: 'A record with this information already exists',
            code: 'DUPLICATE_ERROR'
          },
          { status: 400 }
        );
      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            message: 'Record not found',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Database error occurred',
            code: 'DATABASE_ERROR'
          },
          { status: 500 }
        );
    }
  }
  
  // Handle validation errors
  if (error instanceof Error && error.message.includes('Validation failed')) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: 'VALIDATION_ERROR'
      },
      { status: 400 }
    );
  }
  
  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      success: false,
      message,
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}

// Utility to get user-friendly error messages
export function getFriendlyErrorMessage(error: Error | AppError): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'NOT_FOUND':
        return 'The requested item could not be found.';
      case 'UNAUTHORIZED':
        return 'You need to log in to access this feature.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'SERVER_ERROR':
        return 'Something went wrong on our end. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  return error.message || 'An unexpected error occurred.';
}

// Retry utility for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}