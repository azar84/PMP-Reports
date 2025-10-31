import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const vacationSchema = z.object({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

// PUT - Update vacation dates
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);

    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = vacationSchema.parse(body);

    const parseDateOnly = (dateStr?: string | null) => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    };

    // Check current vacation status to determine if we're setting or clearing vacation
    const currentStaff = await prisma.companyStaff.findUnique({
      where: { id: staffId },
      include: {
        projectStaff: {
          where: {
            status: {
              not: 'Completed'
            }
          },
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
              }
            },
            position: {
              select: {
                id: true,
                designation: true,
              }
            }
          }
        }
      }
    });

    // Determine if we're setting or clearing vacation
    const isSettingVacation = validatedData.startDate && validatedData.endDate;
    const isClearingVacation = !validatedData.startDate && !validatedData.endDate;

    // Use transaction to update vacation dates and leave history atomically (no assignment status changes)
    const result = await prisma.$transaction(async (tx) => {
      // Update staff vacation dates
      // If clearing vacation, set dates to null
      const staff = await tx.companyStaff.update({
        where: { id: staffId },
        data: {
          vacationStartDate: parseDateOnly(validatedData.startDate),
          vacationEndDate: parseDateOnly(validatedData.endDate),
        },
      });

      // Get admin user info (you may need to adjust this based on your auth setup)
      // For now, using a placeholder - you can get actual user from session
      const adminUser = 'Admin'; // TODO: Get from session/auth

      // Create leave history when setting vacation
      if (isSettingVacation && validatedData.startDate && validatedData.endDate) {
        const start = parseDateOnly(validatedData.startDate)!;
        const end = parseDateOnly(validatedData.endDate)!;

        const existingOpen = await (tx as any).leaveHistory.findFirst({
          where: { staffId, isReturned: false },
          orderBy: { createdAt: 'desc' },
        });

        if (existingOpen) {
          await (tx as any).leaveHistory.update({
            where: { id: existingOpen.id },
            data: {
              leaveStartDate: start,
              leaveEndDate: end,
              notes: `On leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
            },
          });
        } else {
          await (tx as any).leaveHistory.create({
            data: {
              entityType: 'staff',
              staffId: staffId,
              leaveStartDate: start,
              leaveEndDate: end,
              returnDate: null,
              isReturned: false,
              notes: `On leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
              createdBy: adminUser,
            },
          });
        }
      }

      return staff;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating vacation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update vacation' },
      { status: 500 }
    );
  }
}

