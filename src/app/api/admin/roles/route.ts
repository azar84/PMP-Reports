import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS, isPermissionKey } from '@/lib/permissionsCatalog';

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional().or(z.literal('')),
  permissions: z.array(z.string()).optional(),
});

export const GET = withRBAC(PERMISSIONS.ROLES_VIEW, async (_request, context) => {
  const roles = await prisma.role.findMany({
    where: { tenantId: context.tenantId },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      userRoles: {
        select: { userId: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const data = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions: role.rolePermissions.map(({ action, permission }) => ({
      key: permission.key,
      action,
    })),
    userCount: role.userRoles.length,
  }));

  return NextResponse.json({ success: true, data });
});

export const POST = withRBAC(PERMISSIONS.ROLES_CREATE, async (request, context) => {
  const body = await request.json();
  const validated = createRoleSchema.parse(body);

  const role = await prisma.role.create({
    data: {
      tenantId: context.tenantId,
      name: validated.name,
      description: validated.description || null,
      isSystem: false,
    },
  });

  if (validated.permissions && validated.permissions.length > 0) {
    const permissionRecords = await prisma.permission.findMany({
      where: {
        tenantId: context.tenantId,
        key: {
          in: validated.permissions.filter(isPermissionKey),
        },
      },
      select: { id: true },
    });

    if (permissionRecords.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionRecords.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
          action: 'allow',
        })),
      });
    }
  }

  const createdRole = await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: createdRole?.id,
        name: createdRole?.name,
        description: createdRole?.description,
        isSystem: createdRole?.isSystem,
        permissions:
          createdRole?.rolePermissions.map(({ action, permission }) => ({
            key: permission.key,
            action,
          })) ?? [],
      },
    },
    { status: 201 }
  );
});

