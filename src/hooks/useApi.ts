import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    try {
      // HTTP-only cookies are automatically sent with requests
      // No need to manually set Authorization header
      // Still support Authorization header for backward compatibility
      const token = typeof window !== 'undefined' 
        ? (options.headers as any)?.['Authorization']?.replace('Bearer ', '') || null
        : null;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        credentials: 'include', // Important: include cookies for authentication
        ...options,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized silently - auth guards will redirect
        if (response.status === 401) {
          const error: any = new Error('Unauthorized');
          error.status = 401;
          error.response = response;
          // Don't log 401 errors - they're expected when not authenticated
          throw error;
        }
        
        // Try to parse error response JSON to get human-readable error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If parsing fails, use default error message
        }
        
        // Create an error object with the parsed message and original response
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        
        // Don't log 403 errors (Access denied) - they're expected permission checks
        // Components can handle these gracefully
        if (response.status === 403) {
          error.suppressLog = true;
        }
        
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Don't log 401 or 403 errors - they're expected (unauthorized/access denied)
      if (error?.status !== 401 && error?.status !== 403 && !error?.suppressLog) {
      console.error('API call failed:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generic CRUD operations
  const get = useCallback(<T>(url: string) => apiCall<T>(url), [apiCall]);
  
  const post = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }), [apiCall]);
  
  const put = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), [apiCall]);
  
  const del = useCallback(<T>(url: string) => 
    apiCall<T>(url, { method: 'DELETE' }), [apiCall]);

  return {
    loading,
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}
