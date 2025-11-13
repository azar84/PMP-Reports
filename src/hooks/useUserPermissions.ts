'use client';

import { useEffect, useState } from 'react';
import type { PermissionKey } from '@/lib/permissionsCatalog';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

interface UseUserPermissionsResult {
  permissions: PermissionKey[];
  isLoading: boolean;
  error: Error | null;
}

const FALLBACK_PERMISSIONS: PermissionKey[] = [
  'projects.view',
  'clients.view',
  'consultants.view',
  'staff.view',
  'labours.view',
  'contacts.view',
] as PermissionKey[];

export function useUserPermissions(): UseUserPermissionsResult {
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

        if (!token) {
          if (isMounted) {
            setPermissions([]);
          }
          return;
        }

        const response = await fetch('/api/admin/auth/me/permissions', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired - clear it and let user re-login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            throw new Error('Session expired. Please log in again.');
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
        console.error('Failed to load user permissions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user permissions'));
        setPermissions(FALLBACK_PERMISSIONS);
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
  }, []);

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
