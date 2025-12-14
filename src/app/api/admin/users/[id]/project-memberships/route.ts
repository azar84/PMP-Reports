import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRBAC } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/permissionsCatalog';

// GET - Get user's project memberships
export const GET = withRBAC(PERMISSIONS.USERS_VIEW, async (request: NextRequest, context, routeContext) => {
  try {
    const params = await (routeContext as { params: Promise<{ id: string }> }).params;
    const userId = parseInt(params.id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hasAllProjectsAccess: true,
        projectMemberships: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasAllProjectsAccess: user.hasAllProjectsAccess,
        projects: user.projectMemberships.map((membership) => ({
          id: membership.project.id,
          projectName: membership.project.projectName,
          projectCode: membership.project.projectCode,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user project memberships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project memberships' },
      { status: 500 }
    );
  }
});

// POST - Add project membership (assign project to user)
export const POST = withRBAC(PERMISSIONS.USERS_UPDATE, async (request: NextRequest, context, routeContext) => {
  try {
    const params = await (routeContext as { params: Promise<{ id: string }> }).params;
    const userId = parseInt(params.id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId || typeof projectId !== 'number') {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, tenantId: true, hasAllProjectsAccess: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.hasAllProjectsAccess) {
      return NextResponse.json(
        { error: 'User has access to all projects. Cannot assign individual projects.' },
        { status: 400 }
      );
    }

    // Check if project exists and belongs to same tenant
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Project does not belong to the same tenant' },
        { status: 403 }
      );
    }

    // Create project membership
    const membership = await prisma.projectMembership.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      create: {
        userId,
        projectId,
      },
      update: {},
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: membership.project.id,
        projectName: membership.project.projectName,
        projectCode: membership.project.projectCode,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User is already assigned to this project' },
        { status: 409 }
      );
    }
    console.error('Error adding project membership:', error);
    return NextResponse.json(
      { error: 'Failed to add project membership' },
      { status: 500 }
    );
  }
});

// DELETE - Remove project membership (unassign project from user)
export const DELETE = withRBAC(PERMISSIONS.USERS_UPDATE, async (request: NextRequest, context, routeContext) => {
  try {
    const params = await (routeContext as { params: Promise<{ id: string }> }).params;
    const userId = parseInt(params.id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const projectIdNum = parseInt(projectId, 10);
    if (Number.isNaN(projectIdNum)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Delete project membership
    await prisma.projectMembership.delete({
      where: {
        userId_projectId: {
          userId,
          projectId: projectIdNum,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project membership not found' },
        { status: 404 }
      );
    }
    console.error('Error removing project membership:', error);
    return NextResponse.json(
      { error: 'Failed to remove project membership' },
      { status: 500 }
    );
  }
});
