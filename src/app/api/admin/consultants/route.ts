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

// GET - Fetch all consultants
export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      include: {
        ConsultantToConsultantType: {
          include: {
            consultant_types: {
              select: {
                id: true,
                type: true,
                description: true,
              },
            },
          },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: consultants });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultants' },
      { status: 500 }
    );
  }
}

// POST - Create new consultant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = consultantSchema.parse(body);

    const { types, ...consultantData } = validatedData;

    const consultant = await prisma.consultant.create({
      data: {
        ...consultantData,
        ConsultantToConsultantType: {
          create: types.map(typeId => ({
            consultant_types: {
              connect: { id: typeId },
            },
          })),
        },
      },
      include: {
        ConsultantToConsultantType: {
          include: {
            consultant_types: {
              select: {
                id: true,
                type: true,
                description: true,
              },
            },
          },
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
    console.error('Error creating consultant:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create consultant' },
      { status: 500 }
    );
  }
}
