import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

// GET - Fetch all GRNs for a purchase order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  try {
    const { poId } = await params;
    const purchaseOrderId = parseInt(poId);
    
    if (isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order ID' },
        { status: 400 }
      );
    }

    const grns = await prisma.projectGRN.findMany({
      where: { purchaseOrderId },
      orderBy: { grnDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: grns });
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GRNs' },
      { status: 500 }
    );
  }
}

// POST - Create a new GRN
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  try {
    const { poId } = await params;
    const purchaseOrderId = parseInt(poId);
    
    if (isNaN(purchaseOrderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { grnRefNo, grnDate, deliveredAmount } = body;

    // Validate required fields
    if (!grnRefNo || !grnDate || deliveredAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the purchase order to get projectId and projectSupplierId
    const purchaseOrder = await prisma.projectPurchaseOrder.findUnique({
      where: { id: purchaseOrderId },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    const grn = await prisma.projectGRN.create({
      data: {
        projectId: purchaseOrder.projectId,
        projectSupplierId: purchaseOrder.projectSupplierId,
        purchaseOrderId,
        grnRefNo,
        grnDate: parseDateFromInput(grnDate)!,
        deliveredAmount: parseFloat(deliveredAmount),
      },
    });

    return NextResponse.json({ success: true, data: grn });
  } catch (error: any) {
    console.error('Error creating GRN:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create GRN' },
      { status: 500 }
    );
  }
}

