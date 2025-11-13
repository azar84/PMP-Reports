import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { z } from 'zod';

async function resolveAuthorizedUser(request: NextRequest, projectId: number) {
  let userId: number | null = null;

  try {
    const token =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }
  } catch (error) {
    console.warn('Invalid token in project picture request');
  }

  if (!userId) {
    return { authorized: false, status: 401, message: 'Unauthorized' as const };
  }

  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    return { authorized: false, status: 403, message: 'Access denied' as const };
  }

  return { authorized: true } as const;
}

const updatePictureSchema = z.object({
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pictureId: string }> }
) {
  try {
    const { id, pictureId } = await params;
    const projectId = parseInt(id, 10);
    const pictureIdNum = parseInt(pictureId, 10);

    if (Number.isNaN(projectId) || Number.isNaN(pictureIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or picture ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    // Verify picture belongs to project
    const existingPicture = await prisma.projectPicture.findFirst({
      where: {
        id: pictureIdNum,
        projectId,
      },
    });

    if (!existingPicture) {
      return NextResponse.json(
        { success: false, error: 'Picture not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updatePictureSchema.parse(body);

    // If setting as featured, unset all other featured pictures for this project
    if (validated.isFeatured === true) {
      await prisma.projectPicture.updateMany({
        where: {
          projectId,
          isFeatured: true,
          id: { not: pictureIdNum },
        },
        data: {
          isFeatured: false,
        },
      });
    }

    const picture = await prisma.projectPicture.update({
      where: { id: pictureIdNum },
      data: {
        ...(validated.caption !== undefined && { caption: validated.caption }),
        ...(validated.sortOrder !== undefined && { sortOrder: validated.sortOrder }),
        ...(validated.isFeatured !== undefined && { isFeatured: validated.isFeatured }),
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        picture,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating project picture:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pictureId: string }> }
) {
  try {
    const { id, pictureId } = await params;
    const projectId = parseInt(id, 10);
    const pictureIdNum = parseInt(pictureId, 10);

    if (Number.isNaN(projectId) || Number.isNaN(pictureIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID or picture ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    // Verify picture belongs to project
    const existingPicture = await prisma.projectPicture.findFirst({
      where: {
        id: pictureIdNum,
        projectId,
      },
    });

    if (!existingPicture) {
      return NextResponse.json(
        { success: false, error: 'Picture not found' },
        { status: 404 }
      );
    }

    await prisma.projectPicture.delete({
      where: { id: pictureIdNum },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Picture deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting project picture:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project picture' },
      { status: 500 }
    );
  }
}

