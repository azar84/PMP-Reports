import { NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS, getPermissionDefinitions } from '@/lib/permissionsCatalog';

export const GET = withRBAC(PERMISSIONS.ROLES_VIEW, async () => {
  const permissions = getPermissionDefinitions();

  return NextResponse.json({
    success: true,
    data: permissions,
  });
});

