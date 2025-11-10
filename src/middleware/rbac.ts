import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import {
  getUserEffectivePermissions,
  getUserTenant,
  hasAllPermissions,
  hasAnyPermission,
  type EffectivePermissions,
  type RBACContext,
} from '@/lib/rbac';
import type { PermissionKey } from '@/lib/permissionsCatalog';

type PermissionRequirement =
  | PermissionKey
  | PermissionKey[]
  | { all: PermissionKey[] }
  | { any: PermissionKey[] }
  | null;

type RBACHandler<T = any> = (
  request: NextRequest,
  context: RBACContext,
  routeContext: T
) => Promise<NextResponse>;

function extractToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('adminToken')?.value;
  if (cookieToken) return cookieToken;

  const headerToken = request.headers.get('authorization');
  if (headerToken?.startsWith('Bearer ')) {
    return headerToken.replace('Bearer ', '').trim();
  }

  return null;
}

function normalizePermissionRequirement(requirement: PermissionRequirement): {
  list: PermissionKey[];
  mode: 'all' | 'any';
} {
  if (!requirement) {
    return { list: [], mode: 'all' };
  }

  if (Array.isArray(requirement)) {
    return { list: requirement, mode: 'all' };
  }

  if (typeof requirement === 'object' && 'all' in requirement) {
    return { list: requirement.all, mode: 'all' };
  }

  if (typeof requirement === 'object' && 'any' in requirement) {
    return { list: requirement.any, mode: 'any' };
  }

  return { list: [requirement], mode: 'all' };
}

async function buildRBACContext(userId: number): Promise<{
  tenantId: number | null;
  permissions: EffectivePermissions;
}> {
  const [tenantId, permissions] = await Promise.all([
    getUserTenant(userId),
    getUserEffectivePermissions(userId),
  ]);

  return { tenantId, permissions };
}

export function withRBAC<T = any>(
  requirement: PermissionRequirement,
  handler: RBACHandler<T>,
  options: { mode?: 'all' | 'any' } = {}
) {
  return async (request: NextRequest, routeContext: T): Promise<NextResponse> => {
    try {
      const token = extractToken(request);
      if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded?.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const { tenantId, permissions } = await buildRBACContext(decoded.userId);
      if (!tenantId) {
        return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 403 });
      }

      const normalizedRequirement = normalizePermissionRequirement(requirement);
      const mode = options.mode ?? normalizedRequirement.mode;

      const hasRequiredPermissions =
        normalizedRequirement.list.length === 0 ||
        (mode === 'all'
          ? hasAllPermissions(permissions, normalizedRequirement.list)
          : hasAnyPermission(permissions, normalizedRequirement.list));

      if (!hasRequiredPermissions) {
        return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
      }

      const context: RBACContext = {
        userId: decoded.userId,
        tenantId,
        permissions,
      };

      return handler(request, context, routeContext);
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  };
}

