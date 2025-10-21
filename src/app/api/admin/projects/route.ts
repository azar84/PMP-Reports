import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const projectSchema = z.object({
  projectCode: z.string().min(1, 'Project code is required'),
  projectName: z.string().min(1, 'Project name is required'),
  projectDescription: z.string().optional().or(z.literal('')),
  clientId: z.number().optional(),
  projectManagementConsultantId: z.number().optional(),
  designConsultantId: z.number().optional(),
  supervisionConsultantId: z.number().optional(),
  costConsultantId: z.number().optional(),
  projectDirectorId: z.number().optional(),
  projectManagerId: z.number().optional(),
  startDate: z.string().optional().or(z.null()),
  endDate: z.string().optional().or(z.null()),
  duration: z.string().optional().or(z.literal('')),
  eot: z.string().optional().or(z.literal('')),
  projectValue: z.number().positive().optional().or(z.null()),
  contacts: z.array(z.object({
    contactId: z.number(),
    isPrimary: z.boolean().default(false),
    consultantType: z.string().optional(), // 'pmc', 'design', 'supervision', 'cost'
  })).optional().default([]),
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

    // Extract contacts from validated data
    const { contacts, ...projectData } = validatedData;

    // Convert date strings to DateTime objects if provided
    const projectDataWithDates = {
      ...projectData,
      startDate: projectData.startDate ? new Date(projectData.startDate) : null,
      endDate: projectData.endDate ? new Date(projectData.endDate) : null,
    };

    // Use transaction to create project and contacts atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the project first
      const project = await tx.project.create({
        data: projectDataWithDates,
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

      // Create project contacts if any are provided
      if (contacts && contacts.length > 0) {
        // Use upsert to handle potential duplicates
        for (const contact of contacts) {
          await tx.projectContact.upsert({
            where: {
              projectId_contactId: {
                projectId: project.id,
                contactId: contact.contactId,
              },
            },
            update: {
              isPrimary: contact.isPrimary,
              consultantType: contact.consultantType || undefined,
            },
            create: {
              projectId: project.id,
              contactId: contact.contactId,
              isPrimary: contact.isPrimary,
              consultantType: contact.consultantType || undefined,
            },
          });
        }
      }

      return project;
    });

    return NextResponse.json({ success: true, data: result });
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
