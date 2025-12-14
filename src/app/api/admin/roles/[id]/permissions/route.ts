import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS, isPermissionKey } from '@/lib/permissionsCatalog';

const updateRolePermissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        key: z.string(),
        action: z.enum(['allow', 'deny']).optional().default('allow'),
      })
    )
    .min(1, 'At least one permission is required'),
});

export const PUT = withRBAC(PERMISSIONS.ROLES_UPDATE, async (request, context, routeContext) => {
  const params = await (routeContext as { params: Promise<{ id: string }> }).params;
  const roleId = parseInt(params.id, 10);

  if (Number.isNaN(roleId)) {
    return NextResponse.json({ success: false, error: 'Invalid role id' }, { status: 400 });
  }

  const role = await prisma.role.findFirst({
    where: { id: roleId, tenantId: context.tenantId },
    include: { rolePermissions: true },
  });

  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ success: false, error: 'System roles cannot be modified' }, { status: 400 });
  }

  const body = await request.json();
  const validated = updateRolePermissionsSchema.parse(body);

  const normalizedPermissions = validated.permissions.filter(({ key }) => isPermissionKey(key));

  if (normalizedPermissions.length === 0) {
    return NextResponse.json({ success: false, error: 'No valid permissions provided' }, { status: 400 });
  }

  // Get existing permissions and create missing ones
  const permissionRecords = await prisma.permission.findMany({
    where: {
      tenantId: context.tenantId,
      key: {
        in: normalizedPermissions.map(({ key }) => key),
      },
    },
    select: {
      id: true,
      key: true,
      resource: true,
      description: true,
    },
  });

  const permissionMap = new Map(permissionRecords.map((permission) => [permission.key, permission.id]));

  // Get permission definitions to create missing permissions
  const { getPermissionDefinitions } = await import('@/lib/permissionsCatalog');
  const permissionDefinitions = getPermissionDefinitions();
  const permissionDefMap = new Map(permissionDefinitions.map((def) => [def.key, def]));

  // Create missing permissions
  const missingPermissions = normalizedPermissions.filter(({ key }) => !permissionMap.has(key));
  if (missingPermissions.length > 0) {
    const permissionsToCreate = missingPermissions
      .map(({ key }) => {
        const def = permissionDefMap.get(key);
        if (!def) return null;
        return {
          tenantId: context.tenantId,
          key,
          resource: def.resource,
          description: def.description || def.label || key,
          isSystem: true,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (permissionsToCreate.length > 0) {
      await prisma.permission.createMany({
        data: permissionsToCreate,
        skipDuplicates: true,
      });

      // Refresh permission records
      const newPermissionRecords = await prisma.permission.findMany({
        where: {
          tenantId: context.tenantId,
          key: {
            in: normalizedPermissions.map(({ key }) => key),
          },
        },
        select: {
          id: true,
          key: true,
        },
      });

      newPermissionRecords.forEach((permission) => {
        permissionMap.set(permission.key, permission.id);
      });
    }
  }

  const rolePermissionData = normalizedPermissions
    .map(({ key, action }) => {
      const permissionId = permissionMap.get(key);
      if (!permissionId) {
        console.warn(`Permission "${key}" not found in database and could not be created`);
        return null;
      }
      return {
        roleId: role.id,
        permissionId,
        action: action ?? 'allow',
      };
    })
    .filter(Boolean) as { roleId: number; permissionId: number; action: string }[];

  const transactionSteps = [
    prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    }),
  ];

  if (rolePermissionData.length > 0) {
    transactionSteps.push(
      prisma.rolePermission.createMany({
        data: rolePermissionData,
      })
    );
  }

  await prisma.$transaction(transactionSteps);

  const updatedRole = await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: updatedRole?.rolePermissions.map(({ action, permission }) => ({
      key: permission.key,
      action,
    })) ?? [],
  });
});

