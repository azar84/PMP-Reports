import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const projectSchema = z.object({
  projectCode: z.string().min(1, 'Project code is required'),
  projectName: z.string().min(1, 'Project name is required'),
  projectDescription: z.string().optional(),
  clientId: z.number().optional(),
  projectManagementConsultantId: z.number().optional(),
  designConsultantId: z.number().optional(),
  supervisionConsultantId: z.number().optional(),
  costConsultantId: z.number().optional(),
  projectDirectorId: z.number().optional(),
  projectManagerId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string().optional(),
  eot: z.string().optional(),
});

// GET - Fetch all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        projectManagementConsultant: true,
        designConsultant: true,
        supervisionConsultant: true,
        costConsultant: true,
        projectDirector: true,
        projectManager: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Convert date strings to DateTime objects if provided
    const projectData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
    };

    const project = await prisma.project.create({
      data: projectData,
      include: {
        client: true,
        projectManagementConsultant: true,
        designConsultant: true,
        supervisionConsultant: true,
        costConsultant: true,
        projectDirector: true,
        projectManager: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
