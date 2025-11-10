import { prisma } from '@/lib/db';
import type { PermissionKey } from '@/lib/permissionsCatalog';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

export type PermissionAction = 'allow' | 'deny';

export interface EffectivePermissions {
  allows: Set<PermissionKey>;
  denies: Set<PermissionKey>;
  hasAdminAll: boolean;
}

export interface RBACContext {
  userId: number;
  tenantId: number;
  permissions: EffectivePermissions;
}

function createEmptyPermissions(): EffectivePermissions {
  return {
    allows: new Set(),
    denies: new Set(),
    hasAdminAll: false,
  };
}

export async function getUserTenant(userId: number): Promise<number | null> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });

  return user?.tenantId ?? null;
}

export async function getUserEffectivePermissions(userId: number): Promise<EffectivePermissions> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: {
      hasAllProjectsAccess: true,
      userRoles: {
        select: {
          role: {
            select: {
              rolePermissions: {
                select: {
                  action: true,
                  permission: {
                    select: { key: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return createEmptyPermissions();
  }

  const effective = createEmptyPermissions();
  effective.hasAdminAll = user.hasAllProjectsAccess;

  user.userRoles.forEach(({ role }) => {
    role.rolePermissions.forEach(({ action, permission }) => {
      if (!permission?.key) return;
      const permissionKey = permission.key as PermissionKey;

      if (permissionKey === PERMISSIONS.ADMIN_ALL && action !== 'deny') {
        effective.hasAdminAll = true;
      }

      if (action === 'deny') {
        effective.denies.add(permissionKey);
        effective.allows.delete(permissionKey);
        return;
      }

      if (!effective.denies.has(permissionKey)) {
        effective.allows.add(permissionKey);
      }
    });
  });

  return effective;
}

export function hasPermission(
  permissions: EffectivePermissions | null | undefined,
  permission: PermissionKey
): boolean {
  if (!permissions) {
    return false;
  }

  if (permissions.hasAdminAll) {
    return true;
  }

  if (permissions.denies.has(permission)) {
    return false;
  }

  if (permissions.allows.has(permission)) {
    return true;
  }

  return false;
}

export function hasAnyPermission(
  permissions: EffectivePermissions | null | undefined,
  permissionKeys: PermissionKey[]
): boolean {
  if (!permissions) {
    return false;
  }

  if (permissions.hasAdminAll) {
    return true;
  }

  return permissionKeys.some((permission) => hasPermission(permissions, permission));
}

export function hasAllPermissions(
  permissions: EffectivePermissions | null | undefined,
  permissionKeys: PermissionKey[]
): boolean {
  if (!permissions) {
    return false;
  }

  if (permissions.hasAdminAll) {
    return true;
  }

  return permissionKeys.every((permission) => hasPermission(permissions, permission));
}

export async function getUserProjectMemberships(userId: number): Promise<number[] | null> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: {
      hasAllProjectsAccess: true,
      projectMemberships: {
        select: { projectId: true },
      },
    },
  });

  if (!user) {
    return [];
  }

  if (user.hasAllProjectsAccess) {
    return null;
  }

  return user.projectMemberships.map((membership) => membership.projectId);
}

export async function hasProjectAccess(userId: number, projectId: number): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: {
      tenantId: true,
      hasAllProjectsAccess: true,
      projectMemberships: {
        select: { projectId: true },
      },
    },
  });

  if (!user) {
    return false;
  }

  if (user.hasAllProjectsAccess) {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });

  if (!project) {
    return false;
  }

  if (project.tenantId !== user.tenantId) {
    return false;
  }

  return user.projectMemberships.some((membership) => membership.projectId === projectId);
}

export async function verifyTenantAccess(userId: number, tenantId: number): Promise<boolean> {
  const userTenantId = await getUserTenant(userId);

  if (userTenantId === null) {
    return false;
  }

  return userTenantId === tenantId;
}
