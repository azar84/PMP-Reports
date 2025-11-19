import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';
import { verifyToken } from '@/lib/jwt';

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return decoded;
}

// POST - Confirm staff movement and record history
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { projectDirectorId, projectManagerId, conflict } = body;

    if (!conflict) {
      return NextResponse.json(
        { success: false, error: 'Conflict information is required' },
        { status: 400 }
      );
    }

    // Use transaction to handle movement and record history
    const result = await prisma.$transaction(async (tx) => {
      const existingAssignment = conflict.existingAssignment;
      const newAssignment = conflict.newAssignment;
      const isMovingBetweenProjects = !existingAssignment.isSameProject;

      // If moving between projects, record movement history
      if (isMovingBetweenProjects && existingAssignment.projectId) {
        // Get the existing project staff assignment to get positionId
        const existingProjectStaff = await tx.projectStaff.findFirst({
          where: {
            projectId: existingAssignment.projectId,
            staffId: conflict.staffId,
          },
          include: {
            position: true,
          },
        });

        if (existingProjectStaff) {
          // Record movement history
          await tx.staffMovementHistory.create({
            data: {
              staffId: conflict.staffId,
              type: 'movement',
              fromProjectId: existingAssignment.projectId,
              fromProjectName: existingAssignment.projectName,
              fromPositionId: existingProjectStaff.positionId,
              fromPositionName: existingProjectStaff.position.designation,
              toProjectId: newAssignment.projectId,
              toProjectName: newAssignment.projectName,
              toPositionId: existingProjectStaff.positionId, // Will be updated after assignment
              toPositionName: newAssignment.positionName,
              movedBy: user.name || user.username || 'System',
              notes: `Moved from ${existingAssignment.projectName} (${existingAssignment.positionName}) to ${newAssignment.projectName} (${newAssignment.positionName})`,
            },
          });
        }
      }

      // Now proceed with the assignment
      // Find or create the position
      const positionName = conflict.type === 'director' ? 'Project Director' : 'Project Manager';
      let position = await tx.projectPosition.findFirst({
        where: {
          projectId: projectId,
          designation: positionName,
        },
      });

      if (!position) {
        position = await tx.projectPosition.create({
          data: {
            projectId: projectId,
            designation: positionName,
            requiredUtilization: 100,
          },
        });
      }

      // Remove existing assignment from other project if moving
      if (isMovingBetweenProjects && existingAssignment.projectId) {
        await tx.projectStaff.deleteMany({
          where: {
            projectId: existingAssignment.projectId,
            staffId: conflict.staffId,
          },
        });
      }

      // Remove any existing assignments for this staff member in this project
      await tx.projectStaff.deleteMany({
        where: {
          projectId: projectId,
          staffId: conflict.staffId,
        },
      });

      // Remove any existing assignments for this position
      await tx.projectStaff.deleteMany({
        where: {
          projectId: projectId,
          positionId: position.id,
        },
      });

      // Create the new assignment
      const newProjectStaff = await tx.projectStaff.create({
        data: {
          projectId: projectId,
          positionId: position.id,
          staffId: conflict.staffId,
          utilization: 100,
          status: 'Active',
        },
        include: {
          position: true,
        },
      });

      // Update movement history with the new position ID
      if (isMovingBetweenProjects) {
        const latestMovement = await tx.staffMovementHistory.findFirst({
          where: {
            staffId: conflict.staffId,
            toProjectId: projectId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (latestMovement) {
          await tx.staffMovementHistory.update({
            where: { id: latestMovement.id },
            data: {
              toPositionId: position.id,
              projectStaffId: newProjectStaff.id,
            },
          });
        }
      }

      // Update project with director/manager IDs
      const updateData: any = {};
      if (conflict.type === 'director') {
        updateData.projectDirectorId = conflict.staffId;
      } else if (conflict.type === 'manager') {
        updateData.projectManagerId = conflict.staffId;
      }

      const project = await tx.project.update({
        where: { id: projectId },
        data: updateData,
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

      return project;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error confirming staff movement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm staff movement' },
      { status: 500 }
    );
  }
}

