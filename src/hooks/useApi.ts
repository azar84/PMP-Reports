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
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
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
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
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
