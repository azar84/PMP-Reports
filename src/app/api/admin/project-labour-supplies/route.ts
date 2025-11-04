import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const labourSupplySchema = z.object({
  projectId: z.number().int().positive(),
  trade: z.string().min(1, 'Trade name is required'),
  numberOfLabour: z.number().int().positive('Number of labour must be positive'),
  pricePerHour: z.number().positive('Price per hour must be positive'),
});

// GET - Fetch all labour supplies for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectIdNum = parseInt(projectId);
    if (isNaN(projectIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Get user ID from token for access control
    let userId: number | null = null;
    try {
      const token = request.cookies.get('adminToken')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = verifyToken(token);
        userId = decoded?.userId || null;
      }
    } catch (error) {
      console.warn('Invalid token in project labour supplies GET request');
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = await hasProjectAccess(userId, projectIdNum);
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Access denied. You do not have permission to view this project.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const labourSupplies = await prisma.projectLabourSupply.findMany({
      where: { projectId: projectIdNum },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: labourSupplies });
  } catch (error) {
    console.error('Error fetching project labour supplies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project labour supplies' },
      { status: 500 }
    );
  }
}

// POST - Create new labour supply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = labourSupplySchema.parse(body);

    // Get user ID from token for access control
    let userId: number | null = null;
    try {
      const token = request.cookies.get('adminToken')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = verifyToken(token);
        userId = decoded?.userId || null;
      }
    } catch (error) {
      console.warn('Invalid token in project labour supplies POST request');
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = await hasProjectAccess(userId, validatedData.projectId);
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Access denied. You do not have permission to modify this project.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const labourSupply = await prisma.projectLabourSupply.create({
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: labourSupply });
  } catch (error) {
    console.error('Error creating project labour supply:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation (duplicate trade for project)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A labour supply for this trade already exists for this project' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create project labour supply' },
      { status: 500 }
    );
  }
}
