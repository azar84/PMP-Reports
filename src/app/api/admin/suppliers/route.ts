import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Prisma } from '@prisma/client';

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeDecimal(value: unknown): Prisma.Decimal | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    return new Prisma.Decimal(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    // Remove currency symbols and commas
    const cleaned = trimmed.replace(/[$,\s]/g, '');
    const num = Number.parseFloat(cleaned);
    if (Number.isNaN(num)) return null;
    return new Prisma.Decimal(num);
  }
  return null;
}

async function resolveUserId(request: NextRequest): Promise<number | null> {
  try {
    const token =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded?.userId ?? null;
  } catch {
    return null;
  }
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function resolveTypeOfWorks(values: unknown): Promise<{ id: number; name: string }[]> {
  if (!Array.isArray(values)) {
    throw new Error('Type of works must be an array');
  }

  const uniqueNames = Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0)
    )
  );

  if (uniqueNames.length === 0) {
    throw new Error('At least one type of work is required');
  }

  const records = [];
  for (const rawName of uniqueNames) {
    const normalized = toTitleCase(rawName);
    const existing = await prisma.typeOfWork.findFirst({
      where: { name: normalized },
    });
    if (existing) {
      records.push(existing);
    } else {
      const created = await prisma.typeOfWork.create({
        data: { name: normalized },
      });
      records.push(created);
    }
  }

  return records;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [suppliers, typeOfWorks] = await Promise.all([
      prisma.supplier.findMany({
        include: { 
          typeOfWorks: { include: { typeOfWork: true } },
          projectSuppliers: {
            select: {
              performanceRating: true,
            },
          },
          projectSubcontractors: {
            select: {
              performanceRating: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.typeOfWork.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    // Calculate average star rating for each supplier (from both suppliers and subcontractors)
    const suppliersWithRating = suppliers.map((supplier) => {
      const supplierRatings = supplier.projectSuppliers
        .map((ps) => ps.performanceRating)
        .filter((rating): rating is number => rating !== null && rating !== undefined);
      
      const subcontractorRatings = supplier.projectSubcontractors
        .map((ps) => ps.performanceRating)
        .filter((rating): rating is number => rating !== null && rating !== undefined);
      
      const allRatings = [...supplierRatings, ...subcontractorRatings];
      
      const averageRating = allRatings.length > 0
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
        : null;

      // Remove projectSuppliers and projectSubcontractors from response, add averageRating
      const { projectSuppliers, projectSubcontractors, ...supplierData } = supplier;
      return {
        ...supplierData,
        averageRating: averageRating ? Number(averageRating.toFixed(1)) : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        suppliers: suppliersWithRating,
        typeOfWorks,
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = sanitizeString(body?.name);
    const type = sanitizeString(body?.type);
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const typeOfWorks = await resolveTypeOfWorks(body?.typeOfWorks);

    const supplier = await prisma.supplier.create({
      data: {
        name,
        vendorCode: sanitizeString(body?.vendorCode),
        type,
        contactPerson: sanitizeString(body?.contactPerson),
        contactNumber: sanitizeString(body?.contactNumber),
        email: sanitizeString(body?.email),
        contractValueCapability: sanitizeDecimal(body?.contractValueCapability),
        typeOfWorks: {
          create: typeOfWorks.map((work) => ({
            typeOfWork: { connect: { id: work.id } },
          })),
        },
      },
      include: {
        typeOfWorks: { include: { typeOfWork: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Unique constraint violation: (tenantId, name)
      return NextResponse.json(
        { success: false, error: 'A supplier with this name already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

