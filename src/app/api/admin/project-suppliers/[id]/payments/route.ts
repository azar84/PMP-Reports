import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';
import { updateMultipleInvoiceStatuses } from '@/lib/invoiceStatus';

// GET - Fetch all payments for a project supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);
    
    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const payments = await prisma.projectSupplierPayment.findMany({
      where: { projectSupplierId },
      include: {
        paymentInvoices: {
          include: {
            invoice: {
              include: {
                purchaseOrder: true,
                invoiceGRNs: {
                  include: {
                    grn: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Create a new payment with multiple invoices
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSupplierId = parseInt(id);
    
    if (isNaN(projectSupplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project supplier ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { invoicePayments, paymentMethod, paymentType, paymentDate, dueDate, liquidated, notes } = body;

    // Validate required fields
    if (!invoicePayments || !Array.isArray(invoicePayments) || invoicePayments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one invoice with payment details is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !paymentDate) {
      return NextResponse.json(
        { success: false, error: 'Payment method and payment date are required' },
        { status: 400 }
      );
    }

    if (!['Post Dated', 'Current Dated'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Payment method must be "Post Dated" or "Current Dated"' },
        { status: 400 }
      );
    }

    // For Post Dated, validate payment type and due date
    if (paymentMethod === 'Post Dated') {
      if (!paymentType || !['PDC', 'LC', 'Trust Receipt'].includes(paymentType)) {
        return NextResponse.json(
          { success: false, error: 'Payment type must be "PDC", "LC", or "Trust Receipt" for Post Dated payments' },
          { status: 400 }
        );
      }
      if (!dueDate) {
        return NextResponse.json(
          { success: false, error: 'Due date is required for Post Dated payments' },
          { status: 400 }
        );
      }
    }

    // Get the project supplier to get projectId
    const projectSupplier = await prisma.projectSupplier.findUnique({
      where: { id: projectSupplierId },
    });

    if (!projectSupplier) {
      return NextResponse.json(
        { success: false, error: 'Project supplier not found' },
        { status: 404 }
      );
    }

    // Validate all invoices belong to this supplier and calculate totals
    let totalPaymentAmount = 0;
    let totalVatAmount = 0;
    const invoiceIds = invoicePayments.map((ip: any) => ip.invoiceId);

    const invoices = await prisma.projectInvoice.findMany({
      where: {
        id: { in: invoiceIds },
        projectSupplierId,
      },
    });

    if (invoices.length !== invoiceIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more invoices not found or do not belong to this supplier' },
        { status: 400 }
      );
    }

    // Validate payment amounts and calculate totals
    for (const invoicePayment of invoicePayments) {
      const { invoiceId, paymentAmount, vatAmount } = invoicePayment;
      
      if (!invoiceId || !paymentAmount || vatAmount === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each invoice must have invoiceId, paymentAmount, and vatAmount' },
          { status: 400 }
        );
      }

      const paymentAmt = parseFloat(paymentAmount);
      const vatAmt = parseFloat(vatAmount) || 0;

      if (isNaN(paymentAmt) || paymentAmt <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid payment amount for invoice ${invoiceId}` },
          { status: 400 }
        );
      }

      if (isNaN(vatAmt) || vatAmt < 0) {
        return NextResponse.json(
          { success: false, error: `Invalid VAT amount for invoice ${invoiceId}` },
          { status: 400 }
        );
      }

      totalPaymentAmount += paymentAmt;
      totalVatAmount += vatAmt;
    }

    // Create payment with invoice relationships
    const payment = await prisma.projectSupplierPayment.create({
      data: {
        projectId: projectSupplier.projectId,
        projectSupplierId,
        totalPaymentAmount,
        totalVatAmount,
        paymentMethod,
        paymentType: paymentMethod === 'Post Dated' ? paymentType : null,
         paymentDate: parseDateFromInput(paymentDate)!,
         dueDate: paymentMethod === 'Post Dated' && dueDate ? (parseDateFromInput(dueDate) || undefined) : undefined,
        liquidated: paymentMethod === 'Post Dated' ? (liquidated === true) : false,
        notes: notes || null,
        paymentInvoices: {
          create: invoicePayments.map((ip: any) => ({
            invoiceId: ip.invoiceId,
            paymentAmount: parseFloat(ip.paymentAmount),
            vatAmount: parseFloat(ip.vatAmount) || 0,
          })),
        },
      },
      include: {
        paymentInvoices: {
          include: {
            invoice: {
              include: {
                purchaseOrder: true,
                invoiceGRNs: {
                  include: {
                    grn: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update status for all affected invoices
    await updateMultipleInvoiceStatuses(invoiceIds);

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
