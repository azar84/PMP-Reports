import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const consultantSchema = z.object({
  name: z.string().min(1, 'Consultant name is required'),
  officeAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  types: z.array(z.number()).optional().default([]),
});

// GET - Fetch single consultant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consultantId = parseInt(id);
    
    if (isNaN(consultantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultant ID' },
        { status: 400 }
      );
    }

    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId },
      include: {
        ConsultantToConsultantType: {
          include: {
            consultant_types: true
          }
        },
        projectsAsPMC: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
        projectsAsDesign: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
        projectsAsCost: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
        projectsAsSupervision: {
          select: {
            id: true,
            projectName: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!consultant) {
      return NextResponse.json(
        { success: false, error: 'Consultant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: consultant });
  } catch (error) {
    console.error('Error fetching consultant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultant' },
      { status: 500 }
    );
  }
}

// PUT - Update consultant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consultantId = parseInt(id);
    
    if (isNaN(consultantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultant ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = consultantSchema.parse(body);

    const { types, ...consultantData } = validatedData;

    const consultant = await prisma.consultant.update({
      where: { id: consultantId },
      data: {
        ...consultantData,
        ConsultantToConsultantType: {
          deleteMany: {},
          create: types.map(typeId => ({
            consultant_types: {
              connect: { id: typeId }
            }
          })),
        },
      },
      include: {
        ConsultantToConsultantType: {
          include: {
            consultant_types: true
          }
        },
        projectsAsPMC: {
          select: {
            id: true,
            projectName: true,
          },
        },
        projectsAsDesign: {
          select: {
            id: true,
            projectName: true,
          },
        },
        projectsAsCost: {
          select: {
            id: true,
            projectName: true,
          },
        },
        projectsAsSupervision: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: consultant });
  } catch (error) {
    console.error('Error updating consultant:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update consultant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete consultant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consultantId = parseInt(id);
    
    if (isNaN(consultantId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultant ID' },
        { status: 400 }
      );
    }

    // Check if consultant has associated projects
    const projectsCount = await prisma.project.count({
      where: {
        OR: [
          { projectManagementConsultantId: consultantId },
          { designConsultantId: consultantId },
          { supervisionConsultantId: consultantId },
          { costConsultantId: consultantId },
        ],
      },
    });

    if (projectsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete consultant with associated projects' },
        { status: 400 }
      );
    }

    await prisma.consultant.delete({
      where: { id: consultantId },
    });

    return NextResponse.json({ success: true, message: 'Consultant deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete consultant' },
      { status: 500 }
    );
  }
}
