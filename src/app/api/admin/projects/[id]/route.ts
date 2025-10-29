import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

// GET - Fetch single project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        projectManagementConsultant: true,
        designConsultant: true,
        supervisionConsultant: true,
        costConsultant: true,
        projectDirector: true,
        projectManager: true,
        projectPositions: {
          include: {
            staffAssignments: {
              include: {
                staff: true,
              },
            },
          },
        },
        projectContacts: true,
        projectChecklistItems: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Extract staff fields that need special handling
    const { projectDirectorId, projectManagerId, ...validBody } = body;
    
    // Convert date strings to DateTime objects if provided (parsed as date-only, no timezone conversion)
    const projectData: any = {
      ...validBody,
      startDate: parseDateFromInput(validBody.startDate),
      endDate: parseDateFromInput(validBody.endDate),
    };

    // Add director and manager IDs to project data if provided
    if (projectDirectorId !== undefined) {
      projectData.projectDirectorId = projectDirectorId || null;
    }
    if (projectManagerId !== undefined) {
      projectData.projectManagerId = projectManagerId || null;
    }

    // Use transaction to update project and handle staff assignments atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update the project
      const project = await tx.project.update({
        where: { id: projectId },
        data: projectData,
        include: {
          client: true,
          projectManagementConsultant: true,
          designConsultant: true,
          supervisionConsultant: true,
          costConsultant: true,
          projectDirector: true,
          projectManager: true,
          projectPositions: {
            include: {
              staffAssignments: {
                include: {
                  staff: true,
                },
              },
            },
          },
          projectContacts: true,
          projectChecklistItems: true,
        },
      });

      // Handle Project Director assignment
      if (projectDirectorId !== undefined) {
        // Find or create the Project Director position
        let directorPosition = await tx.projectPosition.findFirst({
          where: {
            projectId: projectId,
            designation: 'Project Director',
          },
        });

        if (!directorPosition) {
          directorPosition = await tx.projectPosition.create({
            data: {
              projectId: projectId,
              designation: 'Project Director',
              requiredUtilization: 100,
            },
          });
        }

        // Remove any existing staff assignments for this position
        await tx.projectStaff.deleteMany({
          where: {
            projectId: projectId,
            positionId: directorPosition.id,
          },
        });

        // If a new director is provided, create the assignment
        if (projectDirectorId) {
          await tx.projectStaff.create({
            data: {
              projectId: projectId,
              positionId: directorPosition.id,
              staffId: projectDirectorId,
              utilization: 100,
              status: 'Active',
              startDate: projectData.startDate,
              endDate: projectData.endDate,
            },
          });
        }
      }

      // Handle Project Manager assignment
      if (projectManagerId !== undefined) {
        // Find or create the Project Manager position
        let managerPosition = await tx.projectPosition.findFirst({
          where: {
            projectId: projectId,
            designation: 'Project Manager',
          },
        });

        if (!managerPosition) {
          managerPosition = await tx.projectPosition.create({
            data: {
              projectId: projectId,
              designation: 'Project Manager',
              requiredUtilization: 100,
            },
          });
        }

        // Remove any existing staff assignments for this position
        await tx.projectStaff.deleteMany({
          where: {
            projectId: projectId,
            positionId: managerPosition.id,
          },
        });

        // If a new manager is provided, create the assignment
        if (projectManagerId) {
          await tx.projectStaff.create({
            data: {
              projectId: projectId,
              positionId: managerPosition.id,
              staffId: projectManagerId,
              utilization: 100,
              status: 'Active',
              startDate: projectData.startDate,
              endDate: projectData.endDate,
            },
          });
        }
      }

      // Return updated project with fresh staff data
      return await tx.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          projectManagementConsultant: true,
          designConsultant: true,
          supervisionConsultant: true,
          costConsultant: true,
          projectDirector: true,
          projectManager: true,
          projectPositions: {
            include: {
              staffAssignments: {
                include: {
                  staff: true,
                },
              },
            },
          },
          projectContacts: true,
          projectChecklistItems: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}