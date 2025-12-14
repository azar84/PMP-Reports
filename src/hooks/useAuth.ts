'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  tenantId?: number;
  hasAllProjectsAccess?: boolean;
  lastLoginAt?: string | Date;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user from API (uses HTTP-only cookies)
  const fetchCurrentUser = useCallback(async () => {
      try {
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
      });

      // Check response status - 401 means not authenticated
      if (response.status === 401) {
        // Explicitly not authenticated - clear everything
        setUser(null);
        localStorage.removeItem('adminUser');
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Store user data in localStorage for UI state (not sensitive)
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          return data.user;
        }
      }
      
      // If we get here, authentication failed
      setUser(null);
      localStorage.removeItem('adminUser');
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      localStorage.removeItem('adminUser');
      return null;
    }
  }, []);

  useEffect(() => {
    // Don't trust localStorage - always verify with server first
    // This prevents expired sessions from showing cached data
    const verifyAuth = async () => {
      const user = await fetchCurrentUser();
      
      // If verification failed, ensure we clear any stale data
      if (!user) {
        setUser(null);
        localStorage.removeItem('adminUser');
        // Redirect to login if session expired
        router.replace('/admin-panel/login');
      }
      
      setIsLoading(false);
    };

    verifyAuth();
  }, [fetchCurrentUser, router]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Cookies are set automatically by the server
        // Fetch user data
        await fetchCurrentUser();
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('adminUser');
      setUser(null);
      router.push('/admin-panel/login');
    }
  };

  // Refresh access token if needed
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    refreshToken,
    fetchCurrentUser,
    isAuthenticated: !!user,
  };
} 