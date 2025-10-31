import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const vacationSchema = z.object({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  returnDate: z.string().nullable().optional(),
  markAsReturned: z.boolean().optional(),
});

// PUT - Update vacation dates
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labourId = parseInt(id);

    if (isNaN(labourId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid labour ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = vacationSchema.parse(body);

    const parseDateOnly = (dateStr?: string | null) => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d); // local date at 00:00
    };

    // Check current vacation status to determine if we're setting or clearing vacation
    const currentLabour = await prisma.labour.findUnique({
      where: { id: labourId },
      include: {
        projectLabours: {
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
            trade: {
              select: {
                id: true,
                trade: true,
              }
            }
          }
        }
      }
    });

    // Determine if we're setting or clearing vacation
    const isSettingVacation = !!(validatedData.startDate && validatedData.endDate);
    const isClearingVacation = !validatedData.startDate && !validatedData.endDate;
    const isMarkingReturned = !!(validatedData.markAsReturned && validatedData.returnDate);

    // Use transaction to update vacation dates, project labour statuses, and history atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update labour vacation dates
      // If marking as returned, clear the vacation dates so it no longer shows as "On Leave"
      const finalEndDate = isMarkingReturned && validatedData.returnDate 
        ? validatedData.returnDate 
        : validatedData.endDate;
      
      const labour = await tx.labour.update({
        where: { id: labourId },
        data: {
          vacationStartDate: isMarkingReturned ? null : parseDateOnly(validatedData.startDate),
          vacationEndDate: isMarkingReturned ? null : parseDateOnly(finalEndDate || null),
        },
      });

      // Get admin user info (you may need to adjust this based on your auth setup)
      // For now, using a placeholder - you can get actual user from session
      const adminUser = 'Admin'; // TODO: Get from session/auth

      // Create or update leave history entries only (do not modify assignment statuses)
      if (currentLabour) {
        if (isMarkingReturned) {
          // Update or create leave history entry with return date
          // First, find the most recent leave entry for this labour
          const existingLeave = await tx.leaveHistory.findFirst({
            where: {
              labourId: labourId,
              isReturned: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (existingLeave) {
            // Update existing leave entry with return date
            await tx.leaveHistory.update({
              where: { id: existingLeave.id },
              data: {
                returnDate: parseDateOnly(validatedData.returnDate),
                isReturned: true,
                leaveEndDate: parseDateOnly(validatedData.returnDate),
                notes: `On leave from ${parseDateOnly(validatedData.startDate)?.toLocaleDateString()} to ${parseDateOnly(validatedData.returnDate)?.toLocaleDateString()}. Returned on ${parseDateOnly(validatedData.returnDate)?.toLocaleDateString()}`,
              },
            });
          } else {
            // Create new leave history entry with return date
            await tx.leaveHistory.create({
              data: {
                entityType: 'labour',
                labourId: labourId,
                leaveStartDate: parseDateOnly(validatedData.startDate)!,
                leaveEndDate: parseDateOnly(validatedData.returnDate)!,
                returnDate: parseDateOnly(validatedData.returnDate)!,
                isReturned: true,
                notes: `On leave from ${parseDateOnly(validatedData.startDate)?.toLocaleDateString()} to ${parseDateOnly(validatedData.returnDate)?.toLocaleDateString()}. Returned on ${parseDateOnly(validatedData.returnDate)?.toLocaleDateString()}`,
                createdBy: adminUser,
              },
            });
          }
        } else if (isSettingVacation) {
          // Update existing open leave entry if present; otherwise create a new one
          const existingOpen = await tx.leaveHistory.findFirst({
            where: { labourId, isReturned: false },
            orderBy: { createdAt: 'desc' },
          });

          const start = parseDateOnly(validatedData.startDate)!;
          const end = parseDateOnly(finalEndDate)!;

          if (existingOpen) {
            await tx.leaveHistory.update({
              where: { id: existingOpen.id },
              data: {
                leaveStartDate: start,
                leaveEndDate: end,
                notes: `On leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
              },
            });
          } else {
            await tx.leaveHistory.create({
              data: {
                entityType: 'labour',
                labourId: labourId,
                leaveStartDate: start,
                leaveEndDate: end,
                returnDate: null,
                isReturned: false,
                notes: `On leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
                createdBy: adminUser,
              },
            });
          }
        } else if (isClearingVacation) {
          // No assignment status changes when clearing
        }
      }

      return labour;
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

