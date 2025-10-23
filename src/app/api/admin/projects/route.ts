import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Default checklist template
const defaultChecklistTemplate = [
  { phase: 'Project LOA (Letter of Award)', isSubItem: false },
  { phase: 'Commencement Date', isSubItem: false },
  { phase: 'Budget Kick-Off Between Project Manager and Tendering Revenue, Budget, Gross', isSubItem: false },
  { phase: 'Contract Signing Between Kabri and Client', isSubItem: false },
  { phase: 'Project Facilities Approval from the Bank', isSubItem: false },
  { phase: 'Submission of Project Bonds and Insurances', isSubItem: false },
  { phase: 'Performance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Advance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Insurances', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Project Program of Work with Client', isSubItem: false },
  { phase: 'Project Program of Work with Internal Target', isSubItem: false },
  { phase: 'Project Organizational Chart', isSubItem: false },
  { phase: 'Project Resources Sheet', isSubItem: false },
  { phase: 'Design Tracker', isSubItem: false },
  { phase: 'Authority NOCs Tracker (No Objection Certificates)', isSubItem: false },
  { phase: 'Project Detailed Budget', isSubItem: false },
  { phase: 'Project Cash Flow', isSubItem: false },
  { phase: 'Project Code and ERP Matrix', isSubItem: false },
  { phase: 'Engineering Phase Submissions (E1 Log Sheet)', isSubItem: false },
  { phase: 'Procurement Phase Long Lead Items (E2 Log Sheet)', isSubItem: false },
  { phase: 'Project Quality', isSubItem: false },
  { phase: 'Project Risk Matrix', isSubItem: false },
  { phase: 'Project Close-Out', isSubItem: false },
];

// Get checklist template (from database or fallback to default)
async function getChecklistTemplate() {
  try {
    const activeTemplate = await prisma.checklistTemplate.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (activeTemplate && activeTemplate.items) {
      return activeTemplate.items as any[];
    }
  } catch (error) {
    console.error('Error fetching checklist template:', error);
  }

  return defaultChecklistTemplate;
}

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
        projectStaff: {
          include: {
            staff: true,
          },
        },
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

    // Extract contacts and staff fields from validated data
    const { contacts, projectDirectorId, projectManagerId, ...projectData } = validatedData;

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
          projectStaff: {
            include: {
              staff: true,
            },
          },
        },
      });

      // Create project contacts if any are provided
      if (contacts && contacts.length > 0) {
        // Use upsert to handle potential duplicates
        for (const contact of contacts) {
          await tx.projectContact.upsert({
            where: {
              projectId_contactId_consultantType: {
                projectId: project.id,
                contactId: contact.contactId,
                consultantType: contact.consultantType || 'pmc', // Default to 'pmc' if not specified
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

      // Auto-initialize checklist for the new project
      const checklistTemplate = await getChecklistTemplate();
      const createdItems: { [key: string]: number } = {}; // Store created item IDs by phase name
      
      // Create items in template order to maintain proper hierarchy
      let orderCounter = 0;
      for (const template of checklistTemplate) {
        if (!template.isSubItem) {
          // Create parent item
          const item = await tx.projectChecklistItem.create({
            data: {
              projectId: project.id,
              itemNumber: '', // Empty item number since we're not using numbers
              phase: template.phase,
              status: 'Pending',
              isSubItem: false,
              parentItemId: null,
              order: orderCounter++,
            },
          });
          createdItems[template.phase] = item.id;
        } else if (template.isSubItem && template.parentPhase) {
          // Create sub-item immediately after its parent
          const parentId = createdItems[template.parentPhase];
          if (parentId) {
            await tx.projectChecklistItem.create({
              data: {
                projectId: project.id,
                itemNumber: '', // Empty item number since we're not using numbers
                phase: template.phase,
                status: 'Pending',
                isSubItem: true,
                parentItemId: parentId,
                order: orderCounter++,
              },
            });
          }
        }
      }

      // Create ProjectStaff entries for director and manager if provided
      if (projectDirectorId) {
        await tx.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: projectDirectorId,
            designation: 'Project Director',
            utilization: 100,
            status: 'Active',
          },
        });
      }

      if (projectManagerId) {
        await tx.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: projectManagerId,
            designation: 'Project Manager',
            utilization: 100,
            status: 'Active',
          },
        });
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
