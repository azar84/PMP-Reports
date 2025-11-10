import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').optional(),
  description: z.string().optional().or(z.literal('')).optional(),
});

async function getRoleById(roleId: number, tenantId: number) {
  return prisma.role.findFirst({
    where: {
      id: roleId,
      tenantId,
    },
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
  });
}

export const GET = withRBAC(PERMISSIONS.ROLES_VIEW, async (_request, context, routeContext) => {
  const params = (routeContext as { params: { id: string } }).params;
  const roleId = parseInt(params.id, 10);

  if (Number.isNaN(roleId)) {
    return NextResponse.json({ success: false, error: 'Invalid role id' }, { status: 400 });
  }

  const role = await getRoleById(roleId, context.tenantId);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.rolePermissions.map(({ action, permission }) => ({
        key: permission.key,
        action,
      })),
      userCount: role.userRoles.length,
    },
  });
});

export const PUT = withRBAC(PERMISSIONS.ROLES_UPDATE, async (request, context, routeContext) => {
  const params = (routeContext as { params: { id: string } }).params;
  const roleId = parseInt(params.id, 10);

  if (Number.isNaN(roleId)) {
    return NextResponse.json({ success: false, error: 'Invalid role id' }, { status: 400 });
  }

  const role = await getRoleById(roleId, context.tenantId);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ success: false, error: 'System roles cannot be modified' }, { status: 400 });
  }

  const body = await request.json();
  const validated = updateRoleSchema.parse(body);

  const updatedRole = await prisma.role.update({
    where: { id: role.id },
    data: {
      name: validated.name ?? role.name,
      description: validated.description ?? role.description,
    },
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
    data: {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      isSystem: updatedRole.isSystem,
      permissions: updatedRole.rolePermissions.map(({ action, permission }) => ({
        key: permission.key,
        action,
      })),
    },
  });
});

export const DELETE = withRBAC(PERMISSIONS.ROLES_DELETE, async (_request, context, routeContext) => {
  const params = (routeContext as { params: { id: string } }).params;
  const roleId = parseInt(params.id, 10);

  if (Number.isNaN(roleId)) {
    return NextResponse.json({ success: false, error: 'Invalid role id' }, { status: 400 });
  }

  const role = await getRoleById(roleId, context.tenantId);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ success: false, error: 'System roles cannot be deleted' }, { status: 400 });
  }

  if (role.userRoles.length > 0) {
    return NextResponse.json(
      { success: false, error: 'Cannot delete role with assigned users' },
      { status: 400 }
    );
  }

  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  });

  await prisma.role.delete({
    where: { id: role.id },
  });

  return NextResponse.json({ success: true });
});

