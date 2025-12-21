import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for bulk delete request
const bulkDeleteSchema = z.object({
  labourIds: z.array(z.number().int().positive()).min(1, 'At least one labour ID is required'),
});

// POST - Bulk delete labours
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);

    const { labourIds } = validatedData;

    // Check if any labours have project assignments
    const laboursWithAssignments = await prisma.labour.findMany({
      where: {
        id: { in: labourIds },
        projectLabours: {
          some: {}
        }
      },
      select: {
        id: true,
        labourName: true,
        _count: {
          select: {
            projectLabours: true
          }
        }
      }
    });

    if (laboursWithAssignments.length > 0) {
      const labourNames = laboursWithAssignments.map(l => l.labourName).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete labours with project assignments: ${labourNames}. Please remove all project assignments first.` 
        },
        { status: 400 }
      );
    }

    // Delete labours
    const deleteResult = await prisma.labour.deleteMany({
      where: {
        id: { in: labourIds }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} labour(s)`,
      data: {
        deletedCount: deleteResult.count,
        deletedIds: labourIds
      }
    });

  } catch (error) {
    console.error('Error bulk deleting labours:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete labours' },
      { status: 500 }
    );
  }
}

