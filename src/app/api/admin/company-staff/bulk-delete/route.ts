import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for bulk delete request
const bulkDeleteSchema = z.object({
  staffIds: z.array(z.number().int().positive()).min(1, 'At least one staff ID is required'),
});

// POST - Bulk delete staff members
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);

    const { staffIds } = validatedData;

    // Check if any staff have project assignments
    const staffWithAssignments = await prisma.companyStaff.findMany({
      where: {
        id: { in: staffIds },
        projectStaff: {
          some: {}
        }
      },
      select: {
        id: true,
        staffName: true,
        _count: {
          select: {
            projectStaff: true
          }
        }
      }
    });

    if (staffWithAssignments.length > 0) {
      const staffNames = staffWithAssignments.map(s => s.staffName).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete staff with project assignments: ${staffNames}. Please remove all project assignments first.` 
        },
        { status: 400 }
      );
    }

    // Delete staff members
    const deleteResult = await prisma.companyStaff.deleteMany({
      where: {
        id: { in: staffIds }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} staff member(s)`,
      data: {
        deletedCount: deleteResult.count,
        deletedIds: staffIds
      }
    });

  } catch (error) {
    console.error('Error bulk deleting staff:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff members' },
      { status: 500 }
    );
  }
}
