import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseDateFromInput } from '@/lib/dateUtils';
import { updateSubcontractorInvoiceStatus } from '@/lib/invoiceStatus';

// Helper function to get VAT percentage from site settings
async function getVatPercent(): Promise<number> {
  const siteSettings = await prisma.siteSettings.findFirst();
  return siteSettings?.vatPercent ? Number(siteSettings.vatPercent) : 5; // Default to 5%
}

// GET - Fetch all invoices for a project subcontractor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);
    
    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const invoices = await prisma.projectSubcontractorInvoice.findMany({
      where: { projectSubcontractorId },
      include: {
        purchaseOrder: true,
        changeOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
        paymentInvoices: {
          include: {
            payment: true,
          },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create a new invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectSubcontractorId = parseInt(id);
    
    if (isNaN(projectSubcontractorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project subcontractor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { invoiceNumber, invoiceDate, dueDate, purchaseOrderId, changeOrderId, changeOrderIds, paymentType, downPayment, invoiceAmount, vatAmount, downPaymentRecovery, advanceRecovery, retention, contraChargesAmount, contraChargesDescription, totalAmount } = body;

    // Validate required fields
    if (!invoiceNumber || !invoiceDate) {
      return NextResponse.json(
        { success: false, error: 'Invoice number and date are required' },
        { status: 400 }
      );
    }

    if (!paymentType || !['Advance Payment', 'Progress Payment', 'Retention Release Payment'].includes(paymentType)) {
      return NextResponse.json(
        { success: false, error: 'Payment type must be "Advance Payment", "Progress Payment", or "Retention Release Payment"' },
        { status: 400 }
      );
    }

    // Get the project subcontractor to get projectId
    const projectSubcontractor = await prisma.projectSubcontractor.findUnique({
      where: { id: projectSubcontractorId },
    });

    if (!projectSubcontractor) {
      return NextResponse.json(
        { success: false, error: 'Project subcontractor not found' },
        { status: 404 }
      );
    }

    // Validate advance payment
    if (paymentType === 'Advance Payment') {
      if (!downPayment || parseFloat(downPayment) <= 0) {
        return NextResponse.json(
          { success: false, error: 'Advance payment amount is required for Advance Payment type' },
          { status: 400 }
        );
      }

      // Purchase Order is always required for Advance Payment
      if (!purchaseOrderId) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order is required for Advance Payment type' },
          { status: 400 }
        );
      }

      // Verify the PO belongs to this subcontractor
      const po = await prisma.projectSubcontractorPurchaseOrder.findFirst({
        where: {
          id: purchaseOrderId,
          projectSubcontractorId,
        },
        include: {
          changeOrders: true,
        },
      });

      if (!po) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order not found or does not belong to this subcontractor' },
          { status: 400 }
        );
      }

      // Get all COs for this PO
      const poCOs = po.changeOrders || [];
      const maxAdvancePayments = 1 + poCOs.length; // 1 for PO base + number of COs

      // Count existing advance payments for this PO (PO base + CO advances)
      const existingAdvancePayments = await prisma.projectSubcontractorInvoice.findMany({
        where: {
          purchaseOrderId: purchaseOrderId,
          paymentType: 'Advance Payment',
        },
      });

      // Also count CO-based advance payments linked to COs of this PO
      const coIds = poCOs.map(co => co.id);
      const coAdvancePayments = coIds.length > 0 ? await prisma.projectSubcontractorInvoice.findMany({
        where: {
          changeOrderId: { in: coIds },
          paymentType: 'Advance Payment',
        },
      }) : [];

      // Count unique advance payments (PO base + CO advances)
      const poBaseAdvance = existingAdvancePayments.find(inv => inv.purchaseOrderId === purchaseOrderId && !inv.changeOrderId);
      const coAdvances = coAdvancePayments.filter(inv => inv.changeOrderId && coIds.includes(inv.changeOrderId));
      const totalExisting = (poBaseAdvance ? 1 : 0) + coAdvances.length;

      if (totalExisting >= maxAdvancePayments) {
        return NextResponse.json(
          { success: false, error: `All advance payments for this PO have been created. Maximum allowed: ${maxAdvancePayments} (1 PO base + ${poCOs.length} COs)` },
          { status: 400 }
        );
      }

      // Validate specific advance payment type
      if (changeOrderId) {
        // Creating advance payment for a CO
        // Check if advance payment already exists for this CO
        const existingCOAdvance = await prisma.projectSubcontractorInvoice.findFirst({
          where: {
            changeOrderId: changeOrderId,
            paymentType: 'Advance Payment',
          },
        });

        if (existingCOAdvance) {
          return NextResponse.json(
            { success: false, error: 'An advance payment already exists for this Change Order' },
            { status: 400 }
          );
        }

        // Verify the CO belongs to the selected PO
        const co = poCOs.find(co => co.id === changeOrderId);
        if (!co) {
          return NextResponse.json(
            { success: false, error: 'Change Order does not belong to the selected Purchase Order' },
            { status: 400 }
          );
        }
      } else {
        // Creating PO base advance payment
        // Check if PO base advance payment already exists
        if (poBaseAdvance) {
          return NextResponse.json(
            { success: false, error: 'An advance payment already exists for this Purchase Order base. Please create advance payments for Change Orders.' },
            { status: 400 }
          );
        }
      }
    } else if (paymentType === 'Progress Payment' || paymentType === 'Retention Release Payment') {
      // Progress Payment or Retention Release Payment - down payment should be null
      if (downPayment) {
        return NextResponse.json(
          { success: false, error: 'Advance payment amount should not be provided for Progress Payment or Retention Release Payment type' },
          { status: 400 }
        );
      }

      if (!purchaseOrderId) {
        return NextResponse.json(
          { success: false, error: 'Purchase Order is required for Progress Payment and Retention Release Payment types' },
          { status: 400 }
        );
      }

      // For Progress Payment, Change Orders are optional (can be manual entry)
      // For Retention Release Payment, no Change Orders needed
      if (changeOrderIds && Array.isArray(changeOrderIds) && changeOrderIds.length > 0) {
        // Verify all Change Orders belong to the same project subcontractor
        const changeOrders = await prisma.projectSubcontractorChangeOrder.findMany({
          where: {
            id: { in: changeOrderIds },
            projectSubcontractorId,
          },
        });

        if (changeOrders.length !== changeOrderIds.length) {
          return NextResponse.json(
            { success: false, error: 'One or more Change Orders not found or do not belong to this subcontractor' },
            { status: 400 }
          );
        }
      }
    }

    // Get VAT percentage from site settings
    const vatPercent = await getVatPercent();
    const vatDecimal = vatPercent / 100; // e.g., 0.05 for 5%
    const vatMultiplier = 1 + vatDecimal; // e.g., 1.05 for 5%

    // Calculate invoice amounts if not provided (for backward compatibility)
    let finalInvoiceAmount = invoiceAmount;
    let finalVatAmount = vatAmount;
    let finalTotalAmount = totalAmount;

    if (paymentType === 'Advance Payment') {
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        const baseAmount = parseFloat(downPayment);
        finalInvoiceAmount = baseAmount;
        finalVatAmount = baseAmount * vatDecimal;
        finalTotalAmount = baseAmount * vatMultiplier;
      }
    } else if (paymentType === 'Progress Payment' || paymentType === 'Retention Release Payment') {
      // Progress Payment or Retention Release Payment - use provided invoiceAmount or calculate
      if (finalInvoiceAmount === undefined || finalVatAmount === undefined || finalTotalAmount === undefined) {
        // Use provided invoiceAmount (manual entry)
        const baseAmount = invoiceAmount ? parseFloat(invoiceAmount) : 0;
        
        // Deductions (all deducted BEFORE VAT)
        const recovery = downPaymentRecovery ? parseFloat(downPaymentRecovery) : 0;
        const advRecovery = advanceRecovery ? parseFloat(advanceRecovery) : (paymentType === 'Progress Payment' ? baseAmount * 0.10 : 0);
        const ret = retention ? parseFloat(retention) : (paymentType === 'Progress Payment' ? baseAmount * 0.10 : 0);
        const contraCharges = contraChargesAmount ? parseFloat(contraChargesAmount) : 0;
        
        const amountAfterDeductions = baseAmount - recovery - advRecovery - ret - contraCharges;
        
        // Invoice Amount is the base amount (before deductions)
        finalInvoiceAmount = baseAmount;
        finalVatAmount = amountAfterDeductions * vatDecimal;
        finalTotalAmount = amountAfterDeductions + finalVatAmount;
      }
    }

    // Handle deductions
    const finalDownPaymentRecovery = (paymentType === 'Progress Payment' && downPaymentRecovery) 
      ? parseFloat(downPaymentRecovery) 
      : null;
    const finalAdvanceRecovery = (paymentType === 'Progress Payment' && advanceRecovery) 
      ? parseFloat(advanceRecovery) 
      : (paymentType === 'Progress Payment' && invoiceAmount) 
        ? parseFloat(invoiceAmount) * 0.10 
        : null;
    const finalRetention = (paymentType === 'Progress Payment' && retention) 
      ? parseFloat(retention) 
      : (paymentType === 'Progress Payment' && invoiceAmount) 
        ? parseFloat(invoiceAmount) * 0.10 
        : null;
    const finalContraChargesAmount = (paymentType === 'Progress Payment' && contraChargesAmount) 
      ? parseFloat(contraChargesAmount) 
      : null;
    const finalContraChargesDescription = (paymentType === 'Progress Payment' && contraChargesDescription) 
      ? contraChargesDescription 
      : null;

    // Create invoice with appropriate relationships
    const invoiceData: any = {
      projectId: projectSubcontractor.projectId,
      projectSubcontractorId,
      invoiceNumber,
      invoiceDate: parseDateFromInput(invoiceDate),
      dueDate: dueDate ? parseDateFromInput(dueDate) : null,
      paymentType,
      downPayment: paymentType === 'Advance Payment' ? parseFloat(downPayment) : null,
      purchaseOrderId: (paymentType === 'Advance Payment' && purchaseOrderId) ? purchaseOrderId : (paymentType !== 'Advance Payment' ? (purchaseOrderId || null) : null),
      changeOrderId: (paymentType === 'Advance Payment' && changeOrderId) ? changeOrderId : null,
      invoiceAmount: parseFloat(finalInvoiceAmount.toFixed(2)),
      vatAmount: parseFloat(finalVatAmount.toFixed(2)),
      downPaymentRecovery: finalDownPaymentRecovery ? parseFloat(finalDownPaymentRecovery.toFixed(2)) : null,
      advanceRecovery: finalAdvanceRecovery ? parseFloat(finalAdvanceRecovery.toFixed(2)) : null,
      retention: finalRetention ? parseFloat(finalRetention.toFixed(2)) : null,
      contraChargesAmount: finalContraChargesAmount ? parseFloat(finalContraChargesAmount.toFixed(2)) : null,
      contraChargesDescription: finalContraChargesDescription,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
    };

    if (paymentType === 'Progress Payment' && changeOrderIds && Array.isArray(changeOrderIds) && changeOrderIds.length > 0) {
      invoiceData.invoiceChangeOrders = {
        create: changeOrderIds.map((changeOrderId: number) => ({
          changeOrderId,
        })),
      };
    }

    const invoice = await prisma.projectSubcontractorInvoice.create({
      data: invoiceData,
      include: {
        purchaseOrder: true,
        changeOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
    });

    // Calculate and update invoice status
    await updateSubcontractorInvoiceStatus(invoice.id);

    // Fetch updated invoice with status
    const updatedInvoice = await prisma.projectSubcontractorInvoice.findUnique({
      where: { id: invoice.id },
      include: {
        purchaseOrder: true,
        changeOrder: true,
        invoiceChangeOrders: {
          include: {
            changeOrder: {
              include: {
                purchaseOrder: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An invoice with this number already exists for this subcontractor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

