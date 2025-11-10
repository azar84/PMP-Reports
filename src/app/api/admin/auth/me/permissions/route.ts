import { NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

export const GET = withRBAC(null, async (_request, context) => {
  const allowedPermissions = new Set(context.permissions.allows);

  if (context.permissions.hasAdminAll) {
    allowedPermissions.add(PERMISSIONS.ADMIN_ALL);
  }

  return NextResponse.json({
    success: true,
    data: {
      permissions: Array.from(allowedPermissions),
      tenantId: context.tenantId,
      userId: context.userId,
    },
  });
});

