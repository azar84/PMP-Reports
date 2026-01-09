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
        projectSubcontractors: {
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

    // Combine projects from both projectSuppliers and projectSubcontractors
    // Use a Map to deduplicate by project ID (in case vendor is both supplier and subcontractor for same project)
    const projectsMap = new Map();

    // Add projects from projectSuppliers
    supplier.projectSuppliers.forEach((ps) => {
      projectsMap.set(ps.project.id, {
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
        role: 'Supplier',
      });
    });

    // Add projects from projectSubcontractors (will overwrite if same project, keeping subcontractor data)
    supplier.projectSubcontractors.forEach((psc) => {
      const existing = projectsMap.get(psc.project.id);
      if (existing) {
        // If project already exists, merge the data (prefer subcontractor performanceRating if available)
        existing.performanceRating = psc.performanceRating ?? existing.performanceRating;
        existing.performanceReview = psc.performanceReview ?? existing.performanceReview;
        // Note: ProjectSubcontractor doesn't have a notes field, so keep existing notes from ProjectSupplier
        existing.role = 'Both'; // Vendor is both supplier and subcontractor
        existing.assignedAt = psc.createdAt < existing.assignedAt ? psc.createdAt : existing.assignedAt;
        existing.updatedAt = psc.updatedAt > existing.updatedAt ? psc.updatedAt : existing.updatedAt;
      } else {
        projectsMap.set(psc.project.id, {
          id: psc.project.id,
          projectName: psc.project.projectName,
          projectCode: psc.project.projectCode,
          startDate: psc.project.startDate,
          endDate: psc.project.endDate,
          status: psc.project.status,
          projectManager: psc.project.projectManager,
          performanceRating: psc.performanceRating,
          performanceReview: psc.performanceReview,
          notes: null, // ProjectSubcontractor doesn't have a notes field
          assignedAt: psc.createdAt,
          updatedAt: psc.updatedAt,
          role: 'Subcontractor',
        });
      }
    });

    // Convert map to array and sort by assignedAt (most recent first)
    const allProjects = Array.from(projectsMap.values()).sort((a, b) => {
      const dateA = new Date(a.assignedAt).getTime();
      const dateB = new Date(b.assignedAt).getTime();
      return dateB - dateA;
    });

    // Format the response
    const response = {
      ...supplier,
      typeOfWorks: supplier.typeOfWorks.map((tw) => tw.typeOfWork),
      projects: allProjects,
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

