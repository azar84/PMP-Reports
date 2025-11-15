import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hasProjectAccess } from '@/lib/rbac';

async function resolveAuthorizedUser(request: NextRequest, projectId: number) {
  let userId: number | null = null;

  try {
    const token =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }
  } catch (error) {
    console.warn('Invalid token in project commercial request');
  }

  if (!userId) {
    return { authorized: false, status: 401, message: 'Unauthorized' as const };
  }

  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    return { authorized: false, status: 403, message: 'Access denied' as const };
  }

  return { authorized: true } as const;
}

function parseDecimal(value: any): Prisma.Decimal | null {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return null;
  return new Prisma.Decimal(num);
}

function convertDecimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  return null;
}

function formatCommercialResponse(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    projectId: data.projectId,
    contractValue: convertDecimalToNumber(data.contractValue),
    provisionalSum: convertDecimalToNumber(data.provisionalSum),
    instructedProvisionalSum: convertDecimalToNumber(data.instructedProvisionalSum),
    variations: convertDecimalToNumber(data.variations),
    omission: convertDecimalToNumber(data.omission),
    dayworks: convertDecimalToNumber(data.dayworks),
    preliminaries: convertDecimalToNumber(data.preliminaries),
    subContractors: convertDecimalToNumber(data.subContractors),
    suppliersMaterial: convertDecimalToNumber(data.suppliersMaterial),
    machinery: convertDecimalToNumber(data.machinery),
    labors: convertDecimalToNumber(data.labors),
    vat: convertDecimalToNumber(data.vat),
    prolongationCostExpectedValue: convertDecimalToNumber(data.prolongationCostExpectedValue),
    budgetUpToDate: convertDecimalToNumber(data.budgetUpToDate),
    totalActualCostToDate: convertDecimalToNumber(data.totalActualCostToDate),
    forecastedBudgetAtCompletion: convertDecimalToNumber(data.forecastedBudgetAtCompletion),
    forecastedCostAtCompletion: convertDecimalToNumber(data.forecastedCostAtCompletion),
    overallStatus: data.overallStatus || null,
    projectProgressPercentage: convertDecimalToNumber(data.projectProgressPercentage),
    projectRevenuePercentage: convertDecimalToNumber(data.projectRevenuePercentage),
    projectCostPercentage: convertDecimalToNumber(data.projectCostPercentage),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// GET - Fetch commercial data for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const commercial = await prisma.projectCommercial.findUnique({
      where: { projectId },
    });

    return NextResponse.json({
      success: true,
      data: formatCommercialResponse(commercial),
    });
  } catch (error) {
    console.error('Error fetching project commercial data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project commercial data' },
      { status: 500 }
    );
  }
}

// POST/PUT - Create or update commercial data for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const commercialData = {
      contractValue: parseDecimal(body.contractValue),
      provisionalSum: parseDecimal(body.provisionalSum),
      instructedProvisionalSum: parseDecimal(body.instructedProvisionalSum),
      variations: parseDecimal(body.variations),
      omission: parseDecimal(body.omission),
      dayworks: parseDecimal(body.dayworks),
      preliminaries: parseDecimal(body.preliminaries),
      subContractors: parseDecimal(body.subContractors),
      suppliersMaterial: parseDecimal(body.suppliersMaterial),
      machinery: parseDecimal(body.machinery),
      labors: parseDecimal(body.labors),
      vat: parseDecimal(body.vat),
      prolongationCostExpectedValue: parseDecimal(body.prolongationCostExpectedValue),
      budgetUpToDate: parseDecimal(body.budgetUpToDate),
      totalActualCostToDate: parseDecimal(body.totalActualCostToDate),
      forecastedBudgetAtCompletion: parseDecimal(body.forecastedBudgetAtCompletion),
      forecastedCostAtCompletion: parseDecimal(body.forecastedCostAtCompletion),
      overallStatus: body.overallStatus || null,
      projectProgressPercentage: parseDecimal(body.projectProgressPercentage),
      projectRevenuePercentage: parseDecimal(body.projectRevenuePercentage),
      projectCostPercentage: parseDecimal(body.projectCostPercentage),
    };

    const result = await prisma.projectCommercial.upsert({
      where: { projectId },
      update: commercialData,
      create: {
        projectId,
        ...commercialData,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatCommercialResponse(result),
    });
  } catch (error) {
    console.error('Error saving project commercial data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save project commercial data' },
      { status: 500 }
    );
  }
}

// PUT - Update commercial data for a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const auth = await resolveAuthorizedUser(request, projectId);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const commercialData = {
      contractValue: parseDecimal(body.contractValue),
      provisionalSum: parseDecimal(body.provisionalSum),
      instructedProvisionalSum: parseDecimal(body.instructedProvisionalSum),
      variations: parseDecimal(body.variations),
      omission: parseDecimal(body.omission),
      dayworks: parseDecimal(body.dayworks),
      preliminaries: parseDecimal(body.preliminaries),
      subContractors: parseDecimal(body.subContractors),
      suppliersMaterial: parseDecimal(body.suppliersMaterial),
      machinery: parseDecimal(body.machinery),
      labors: parseDecimal(body.labors),
      vat: parseDecimal(body.vat),
      prolongationCostExpectedValue: parseDecimal(body.prolongationCostExpectedValue),
      budgetUpToDate: parseDecimal(body.budgetUpToDate),
      totalActualCostToDate: parseDecimal(body.totalActualCostToDate),
      forecastedBudgetAtCompletion: parseDecimal(body.forecastedBudgetAtCompletion),
      forecastedCostAtCompletion: parseDecimal(body.forecastedCostAtCompletion),
      overallStatus: body.overallStatus || null,
      projectProgressPercentage: parseDecimal(body.projectProgressPercentage),
      projectRevenuePercentage: parseDecimal(body.projectRevenuePercentage),
      projectCostPercentage: parseDecimal(body.projectCostPercentage),
    };

    const result = await prisma.projectCommercial.upsert({
      where: { projectId },
      update: commercialData,
      create: {
        projectId,
        ...commercialData,
      },
    });

    return NextResponse.json({
      success: true,
      data: formatCommercialResponse(result),
    });
  } catch (error) {
    console.error('Error updating project commercial data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project commercial data' },
      { status: 500 }
    );
  }
}

