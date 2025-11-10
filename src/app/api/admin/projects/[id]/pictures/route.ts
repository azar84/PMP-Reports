import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';
import { z } from 'zod';

const orderByClause = [
  { sortOrder: 'asc' as const },
  { id: 'asc' as const },
];

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
    console.warn('Invalid token in project pictures request');
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

const createPictureSchema = z.object({
  mediaId: z.number().int().positive(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const updatePictureSchema = z.object({
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
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

    const pictures = await prisma.projectPicture.findMany({
      where: { projectId },
      include: {
        media: true,
      },
      orderBy: [
        { createdAt: 'desc' }, // Newest first
        { id: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        pictures,
      },
    });
  } catch (error) {
    console.error('Error fetching project pictures:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project pictures' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
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

    const body = await request.json();
    const validated = createPictureSchema.parse(body);

    // Verify media exists
    const media = await prisma.mediaLibrary.findUnique({
      where: { id: validated.mediaId },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Verify media is an image
    if (media.fileType !== 'image') {
      return NextResponse.json(
        { success: false, error: 'Only images are allowed' },
        { status: 400 }
      );
    }

    const picture = await prisma.projectPicture.create({
      data: {
        projectId,
        mediaId: validated.mediaId,
        caption: validated.caption || null,
        sortOrder: validated.sortOrder,
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
    console.error('Error creating project picture:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project picture' },
      { status: 500 }
    );
  }
}

