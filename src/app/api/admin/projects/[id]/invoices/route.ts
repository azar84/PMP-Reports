import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all invoices for a project (across all suppliers)
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

    const invoices = await prisma.projectInvoice.findMany({
      where: { projectId },
      include: {
        purchaseOrder: true,
        invoiceGRNs: {
          include: {
            grn: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching project invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

