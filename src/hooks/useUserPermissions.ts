'use client';

import { useEffect, useState } from 'react';

export type PermissionKey = string;

interface UseUserPermissionsResult {
  permissions: PermissionKey[];
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_PERMISSIONS: PermissionKey[] = [
  'clients.create',
  'consultants.create',
  'staff.create',
  'labours.create',
  'contacts.create',
];

/**
 * Lightweight permissions hook that keeps the admin panel functional
 * after RBAC modules were removed. Replace with real API wiring when needed.
 */
export function useUserPermissions(): UseUserPermissionsResult {
  const [permissions, setPermissions] = useState<PermissionKey[]>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    // In the simplified admin panel we rely on the baked-in defaults above.
    // If future requirements include runtime permissions, fetch them here and
    // update setPermissions accordingly.
    setIsLoading(false);
  }, []);

  return { permissions, isLoading, error };
}

export function hasPermission(permissions: PermissionKey[] | null | undefined, permission: PermissionKey): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }
  return permissions.includes(permission);
}
