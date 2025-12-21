import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch detailed vendor information including projects and feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = Number.parseInt(id, 10);

    if (Number.isNaN(supplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    // Fetch supplier with all related data
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        typeOfWorks: {
          include: {
            typeOfWork: true,
          },
        },
        projectSuppliers: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
                startDate: true,
                endDate: true,
                status: true,
                projectManager: {
                  select: {
                    id: true,
                    staffName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        projectEvaluations: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      ...supplier,
      typeOfWorks: supplier.typeOfWorks.map((tw) => tw.typeOfWork),
      projects: supplier.projectSuppliers.map((ps) => ({
        id: ps.project.id,
        projectName: ps.project.projectName,
        projectCode: ps.project.projectCode,
        startDate: ps.project.startDate,
        endDate: ps.project.endDate,
        status: ps.project.status,
        projectManager: ps.project.projectManager,
        performanceRating: ps.performanceRating,
        performanceReview: ps.performanceReview,
        notes: ps.notes,
        assignedAt: ps.createdAt,
        updatedAt: ps.updatedAt,
      })),
      evaluations: supplier.projectEvaluations.map((evaluation) => ({
        id: evaluation.id,
        projectId: evaluation.project.id,
        projectName: evaluation.project.projectName,
        projectCode: evaluation.project.projectCode,
        rating: evaluation.rating,
        notes: evaluation.notes,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching supplier details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier details' },
      { status: 500 }
    );
  }
}

