import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

const updateLabourSupplySchema = z.object({
  trade: z.string().min(1, 'Trade name is required').optional(),
  numberOfLabour: z.number().int().positive('Number of labour must be positive').optional(),
  pricePerHour: z.number().positive('Price per hour must be positive').optional(),
});

// GET - Fetch single labour supply by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourSupplyId = parseInt(id);

    if (isNaN(labourSupplyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour supply ID' },
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
      console.warn('Invalid token in project labour supply GET request');
    }

    const labourSupply = await prisma.projectLabourSupply.findUnique({
      where: { id: labourSupplyId },
      include: { project: true },
    });

    if (!labourSupply) {
      return NextResponse.json(
        { success: false, error: 'Labour supply not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = await hasProjectAccess(userId, labourSupply.projectId);
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

    return NextResponse.json({ success: true, data: labourSupply });
  } catch (error) {
    console.error('Error fetching project labour supply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project labour supply' },
      { status: 500 }
    );
  }
}

// PUT - Update labour supply
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourSupplyId = parseInt(id);

    if (isNaN(labourSupplyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour supply ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateLabourSupplySchema.parse(body);

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
      console.warn('Invalid token in project labour supply PUT request');
    }

    // First, get the labour supply to check project access
    const existingLabourSupply = await prisma.projectLabourSupply.findUnique({
      where: { id: labourSupplyId },
    });

    if (!existingLabourSupply) {
      return NextResponse.json(
        { success: false, error: 'Labour supply not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = await hasProjectAccess(userId, existingLabourSupply.projectId);
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

    const updatedLabourSupply = await prisma.projectLabourSupply.update({
      where: { id: labourSupplyId },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: updatedLabourSupply });
  } catch (error) {
    console.error('Error updating project labour supply:', error);
    
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
      { success: false, error: 'Failed to update project labour supply' },
      { status: 500 }
    );
  }
}

// DELETE - Delete labour supply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourSupplyId = parseInt(id);

    if (isNaN(labourSupplyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour supply ID' },
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
      console.warn('Invalid token in project labour supply DELETE request');
    }

    // First, get the labour supply to check project access
    const existingLabourSupply = await prisma.projectLabourSupply.findUnique({
      where: { id: labourSupplyId },
    });

    if (!existingLabourSupply) {
      return NextResponse.json(
        { success: false, error: 'Labour supply not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = await hasProjectAccess(userId, existingLabourSupply.projectId);
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

    await prisma.projectLabourSupply.delete({
      where: { id: labourSupplyId },
    });

    return NextResponse.json({ success: true, message: 'Labour supply deleted successfully' });
  } catch (error) {
    console.error('Error deleting project labour supply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project labour supply' },
      { status: 500 }
    );
  }
}
