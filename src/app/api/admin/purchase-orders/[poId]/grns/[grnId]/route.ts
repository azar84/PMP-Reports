import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';

// PUT - Update a GRN
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ poId: string; grnId: string }> }
) {
  try {
    const { poId, grnId } = await params;
    const purchaseOrderId = parseInt(poId);
    const grnIdNum = parseInt(grnId);
    
    if (isNaN(purchaseOrderId) || isNaN(grnIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase order or GRN ID' },
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

    const grn = await prisma.projectGRN.update({
      where: { id: grnIdNum },
      data: {
        grnRefNo,
        grnDate: parseDateFromInput(grnDate),
        deliveredAmount: parseFloat(deliveredAmount),
      },
    });

    return NextResponse.json({ success: true, data: grn });
  } catch (error: any) {
    console.error('Error updating GRN:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update GRN' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a GRN
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ poId: string; grnId: string }> }
) {
  try {
    const { poId, grnId } = await params;
    const grnIdNum = parseInt(grnId);
    
    if (isNaN(grnIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid GRN ID' },
        { status: 400 }
      );
    }

    await prisma.projectGRN.delete({
      where: { id: grnIdNum },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting GRN:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete GRN' },
      { status: 500 }
    );
  }
}

