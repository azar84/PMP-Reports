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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supplierId = Number.parseInt(id, 10);
    if (Number.isNaN(supplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
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

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name,
        vendorCode: sanitizeString(body?.vendorCode),
        type,
        contactPerson: sanitizeString(body?.contactPerson),
        contactNumber: sanitizeString(body?.contactNumber),
        email: sanitizeString(body?.email),
        contractValueCapability: sanitizeDecimal(body?.contractValueCapability),
        typeOfWorks: {
          deleteMany: {},
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
      data: updated,
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supplierId = Number.parseInt(id, 10);
    if (Number.isNaN(supplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
