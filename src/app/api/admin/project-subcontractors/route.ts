import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const projectSubcontractorSchema = z.object({
  projectId: z.number(),
  subcontractorId: z.number(),
  scopeOfWork: z.string().optional().nullable(),
  subcontractAgreement: z.boolean().default(false),
  subcontractAgreementDocumentUrl: z.string().optional().nullable(),
});

// GET - Fetch project subcontractors for a specific project
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

    const projectSubcontractors = await prisma.projectSubcontractor.findMany({
      where: {
        projectId: parseInt(projectId),
      },
      include: {
        subcontractor: {
          include: {
            typeOfWorks: {
              include: {
                typeOfWork: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: projectSubcontractors });
  } catch (error: any) {
    console.error('Error fetching project subcontractors:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch project subcontractors' },
      { status: 500 }
    );
  }
}

// POST - Create new project subcontractor relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectSubcontractorSchema.parse(body);

    // Check if the relationship already exists
    const existing = await prisma.projectSubcontractor.findUnique({
      where: {
        projectId_subcontractorId: {
          projectId: validatedData.projectId,
          subcontractorId: validatedData.subcontractorId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Subcontractor is already assigned to this project' },
        { status: 409 }
      );
    }

    const projectSubcontractor = await prisma.projectSubcontractor.create({
      data: {
        projectId: validatedData.projectId,
        subcontractorId: validatedData.subcontractorId,
        scopeOfWork: validatedData.scopeOfWork || null,
        subcontractAgreement: validatedData.subcontractAgreement ?? false,
        subcontractAgreementDocumentUrl: validatedData.subcontractAgreementDocumentUrl || null,
      },
      include: {
        subcontractor: {
          include: {
            typeOfWorks: {
              include: {
                typeOfWork: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: projectSubcontractor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating project subcontractor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project subcontractor' },
      { status: 500 }
    );
  }
}

