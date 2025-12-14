'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PermissionKey } from '@/lib/permissionsCatalog';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

interface UseUserPermissionsResult {
  permissions: PermissionKey[];
  isLoading: boolean;
  error: Error | null;
}

export function useUserPermissions(): UseUserPermissionsResult {
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Tokens are now in HTTP-only cookies, sent automatically
        const response = await fetch('/api/admin/auth/me/permissions', {
          method: 'GET',
          credentials: 'include', // Important: include cookies
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Session expired - redirect immediately to login
            localStorage.removeItem('adminUser');
            router.replace('/admin-panel/login');
            return;
          }
          throw new Error(`Failed to load permissions (${response.status})`);
        }

        const payload = await response.json();
        const granted: PermissionKey[] = Array.isArray(payload?.data?.permissions)
          ? payload.data.permissions
          : [];

        if (isMounted) {
          setPermissions(granted);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }
        
        // If it's a 401 error, redirect to login (handled above, but catch just in case)
        if (err instanceof Error && err.message.includes('Session expired')) {
          router.replace('/admin-panel/login');
          return;
        }
        
        console.error('Failed to load user permissions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user permissions'));
        // Don't set fallback permissions - if we can't load, user should be redirected
        setPermissions([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [router]);

  return { permissions, isLoading, error };
}

export function hasPermission(
  permissions: PermissionKey[] | null | undefined,
  permission: PermissionKey
): boolean {
  if (!permissions) {
    return false;
  }

  if (permissions.includes(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: PermissionKey[] | null | undefined,
  required: PermissionKey[]
): boolean {
  if (!permissions) {
    return false;
  }

  const permissionSet = new Set(permissions ?? []);

  if (permissionSet.has(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return required.some((permission) => permissionSet.has(permission));
}

export function hasAllPermissions(
  permissions: PermissionKey[] | null | undefined,
  required: PermissionKey[]
): boolean {
  if (!permissions) {
    return false;
  }

  const permissionSet = new Set(permissions ?? []);

  if (permissionSet.has(PERMISSIONS.ADMIN_ALL)) {
    return true;
  }

  return required.every((permission) => permissionSet.has(permission));
}
