import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError } from './errorHandling';

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

// API Handler options
export interface ApiHandlerOptions<T = any> {
  schema?: z.ZodSchema<T>;
  requireAuth?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

// API Handler function type
export type ApiHandler<T = any> = (
  request: NextRequest,
  validatedData?: T
) => Promise<NextResponse<ApiResponse>>;

// Wrapper function for API handlers
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> = {}
) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse>> => {
    try {
      // Method validation
      if (options.method && request.method !== options.method) {
        return NextResponse.json(
          { success: false, error: `Method ${request.method} not allowed` },
          { status: 405 }
        );
      }

      // Authentication check
      if (options.requireAuth) {
        const token = request.cookies.get('adminToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          );
        }

        // Token validation would go here
        // For now, we'll assume the middleware handles this
      }

      // Data validation
      let validatedData: T | undefined;
      if (options.schema) {
        let data: any;
        
        if (request.method === 'GET') {
          const { searchParams } = new URL(request.url);
          data = Object.fromEntries(searchParams.entries());
        } else {
          try {
            data = await request.json();
          } catch {
            return NextResponse.json(
              { success: false, error: 'Invalid JSON in request body' },
              { status: 400 }
            );
          }
        }

        const validationResult = options.schema.safeParse(data);
        if (!validationResult.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Validation failed',
              details: validationResult.error.errors 
            },
            { status: 400 }
          );
        }
        
        validatedData = validationResult.data;
      }

      // Call the handler
      return await handler(request, validatedData);

    } catch (error) {
      return handleApiError(error, 'API Handler Error');
    }
  };
}

// Utility function for successful responses
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  });
}

// Utility function for error responses
export function errorResponse(
  message: string, 
  status: number = 400, 
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    ...(code && { code })
  }, { status });
} 