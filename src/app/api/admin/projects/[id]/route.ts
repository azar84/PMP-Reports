import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput, formatDateForInput } from '@/lib/dateUtils';
import { Prisma } from '@prisma/client';

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
        projectSuppliers: {
          include: {
            supplier: true,
            purchaseOrders: true,
            invoices: true,
          },
        },
        projectSubcontractors: {
          include: {
            subcontractor: true,
            purchaseOrders: true,
            invoices: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert DateTime fields to date-only strings (YYYY-MM-DD) to avoid timezone issues
    const projectData = {
      ...project,
      startDate: project.startDate ? formatDateForInput(project.startDate) : null,
      endDate: project.endDate ? formatDateForInput(project.endDate) : null,
    };

    return NextResponse.json({ success: true, data: projectData });
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
    
    // Filter out undefined values to avoid Prisma errors
    const cleanedBody = Object.fromEntries(
      Object.entries(validBody).filter(([_, value]) => value !== undefined)
    );
    
    // Convert date strings to DateTime objects if provided (parsed as date-only, no timezone conversion)
    // Only include date fields if they're explicitly provided in the request
    const projectData: any = {
      ...cleanedBody,
    };
    
    // Only set startDate if it's provided in the request
    if ('startDate' in cleanedBody) {
      projectData.startDate = parseDateFromInput(cleanedBody.startDate as string | null | undefined);
    }
    
    // Only set endDate if it's provided in the request
    if ('endDate' in cleanedBody) {
      projectData.endDate = parseDateFromInput(cleanedBody.endDate as string | null | undefined);
    }
    
    // Convert Decimal fields explicitly to ensure proper storage
    if ('advancePaymentPercentage' in projectData && projectData.advancePaymentPercentage !== null) {
      projectData.advancePaymentPercentage = new Prisma.Decimal(projectData.advancePaymentPercentage);
    }
    if ('retentionPercentage' in projectData && projectData.retentionPercentage !== null) {
      projectData.retentionPercentage = new Prisma.Decimal(projectData.retentionPercentage);
    }
    
    // Add director and manager IDs to project data if provided
    if (projectDirectorId !== undefined) {
      projectData.projectDirectorId = projectDirectorId || null;
    }
    if (projectManagerId !== undefined) {
      projectData.projectManagerId = projectManagerId || null;
    }

    // Check for conflicts BEFORE starting the transaction
    // Only check for conflicts on the fields that are actually being changed
    let conflictInfo: any = null;
    
    // Get current project to compare with new values
    const currentProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        projectName: true, 
        projectCode: true,
        projectDirectorId: true,
        projectManagerId: true,
      },
    });

    if (!currentProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check for director conflict only if director is being changed
    if (projectDirectorId !== undefined && projectDirectorId !== currentProject.projectDirectorId) {
      const existingAssignmentInProject = await prisma.projectStaff.findFirst({
        where: {
          projectId: projectId,
          staffId: projectDirectorId,
        },
        include: {
          position: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
      });

      const existingAssignmentOtherProject = await prisma.projectStaff.findFirst({
        where: {
          staffId: projectDirectorId,
          projectId: { not: projectId },
        },
        include: {
          position: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
      });

      if (existingAssignmentInProject || existingAssignmentOtherProject) {
        const conflict = existingAssignmentOtherProject || existingAssignmentInProject;
        const isSameProject = existingAssignmentInProject?.projectId === projectId;
        const staff = await prisma.companyStaff.findUnique({ 
          where: { id: projectDirectorId }, 
          select: { staffName: true } 
        });
        
        conflictInfo = {
          staffId: projectDirectorId,
          staffName: staff?.staffName || 'Unknown',
          type: 'director',
          existingAssignment: {
            projectId: conflict?.project.id,
            projectName: conflict?.project.projectName,
            projectCode: conflict?.project.projectCode,
            positionId: conflict?.positionId,
            positionName: conflict?.position.designation,
            isSameProject: isSameProject,
          },
          newAssignment: {
            projectId: projectId,
            projectName: currentProject.projectName,
            projectCode: currentProject.projectCode,
            positionName: 'Project Director',
          },
        };
      }
    }

    // Check for manager conflict only if manager is being changed AND no director conflict exists
    if (!conflictInfo && projectManagerId !== undefined && projectManagerId !== currentProject.projectManagerId) {
      const existingAssignmentInProject = await prisma.projectStaff.findFirst({
        where: {
          projectId: projectId,
          staffId: projectManagerId,
        },
        include: {
          position: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
      });

      const existingAssignmentOtherProject = await prisma.projectStaff.findFirst({
        where: {
          staffId: projectManagerId,
          projectId: { not: projectId },
        },
        include: {
          position: true,
          project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
      });

      if (existingAssignmentInProject || existingAssignmentOtherProject) {
        const conflict = existingAssignmentOtherProject || existingAssignmentInProject;
        const isSameProject = existingAssignmentInProject?.projectId === projectId;
        const staff = await prisma.companyStaff.findUnique({ 
          where: { id: projectManagerId }, 
          select: { staffName: true } 
        });
        
        conflictInfo = {
          staffId: projectManagerId,
          staffName: staff?.staffName || 'Unknown',
          type: 'manager',
          existingAssignment: {
            projectId: conflict?.project.id,
            projectName: conflict?.project.projectName,
            projectCode: conflict?.project.projectCode,
            positionId: conflict?.positionId,
            positionName: conflict?.position.designation,
            isSameProject: isSameProject,
          },
          newAssignment: {
            projectId: projectId,
            projectName: currentProject.projectName,
            projectCode: currentProject.projectCode,
            positionName: 'Project Manager',
          },
        };
      }
    }

    // If there's a conflict, return it for user confirmation
    if (conflictInfo) {
      return NextResponse.json({
        success: false,
        requiresConfirmation: true,
        conflict: conflictInfo,
      });
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

        // If a new director is provided, create or update the assignment
        if (projectDirectorId) {
          // Remove any existing assignments for this staff member in this project
          // (to handle case where they might be assigned to a different position)
          await tx.projectStaff.deleteMany({
            where: {
              projectId: projectId,
              staffId: projectDirectorId,
            },
          });

          // Also remove any existing assignments for this position (in case position changed)
        await tx.projectStaff.deleteMany({
          where: {
            projectId: projectId,
            positionId: directorPosition.id,
          },
        });

          // Create the new assignment
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
        } else {
          // If no director is provided, remove any existing assignments for this position
          await tx.projectStaff.deleteMany({
            where: {
              projectId: projectId,
              positionId: directorPosition.id,
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

        // If a new manager is provided, create or update the assignment
        if (projectManagerId) {
          // Remove any existing assignments for this staff member in this project
          // (to handle case where they might be assigned to a different position)
          await tx.projectStaff.deleteMany({
            where: {
              projectId: projectId,
              staffId: projectManagerId,
            },
          });

          // Also remove any existing assignments for this position (in case position changed)
        await tx.projectStaff.deleteMany({
          where: {
            projectId: projectId,
            positionId: managerPosition.id,
          },
        });

          // Create the new assignment
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
        } else {
          // If no manager is provided, remove any existing assignments for this position
          await tx.projectStaff.deleteMany({
            where: {
              projectId: projectId,
              positionId: managerPosition.id,
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

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert DateTime fields to date-only strings (YYYY-MM-DD) to avoid timezone issues
    const formattedProject = {
      ...result,
      startDate: result.startDate ? formatDateForInput(result.startDate) : null,
      endDate: result.endDate ? formatDateForInput(result.endDate) : null,
    };

    return NextResponse.json({ success: true, data: formattedProject });
  } catch (error: any) {
    console.error('Error updating project:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update project';
    if ((error as any)?.code === 'P2002') {
      errorMessage = 'A project with this code or name already exists';
    } else if ((error as any)?.code === 'P2025') {
      errorMessage = 'Project not found';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
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