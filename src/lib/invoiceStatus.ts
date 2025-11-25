import { prisma } from './db';

/**
 * Calculate invoice status based on payments
 * @param invoiceId - The invoice ID
 * @returns Promise<string> - Status: 'paid', 'partially_paid', or 'unpaid'
 */
export async function calculateInvoiceStatus(invoiceId: number): Promise<string> {
  // Get invoice with payment information
  const invoice = await prisma.projectInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      paymentInvoices: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Calculate total paid amount
  const totalPaid = invoice.paymentInvoices.reduce((sum, pi) => {
    return sum + Number(pi.paymentAmount || 0) + Number(pi.vatAmount || 0);
  }, 0);

  const invoiceTotal = Number(invoice.totalAmount || 0);
  const tolerance = 0.01; // Small tolerance for floating point comparison

  // Check if fully paid
  if (totalPaid >= invoiceTotal - tolerance) {
    return 'paid';
  }

  // Check if partially paid
  if (totalPaid > tolerance) {
    return 'partially_paid';
  }

  // Not paid
  return 'unpaid';
}

/**
 * Update invoice status in the database
 * @param invoiceId - The invoice ID
 * @returns Promise<void>
 */
export async function updateInvoiceStatus(invoiceId: number): Promise<void> {
  const status = await calculateInvoiceStatus(invoiceId);
  
  await prisma.projectInvoice.update({
    where: { id: invoiceId },
    data: { status },
  });
}

/**
 * Update status for multiple invoices
 * @param invoiceIds - Array of invoice IDs
 * @returns Promise<void>
 */
export async function updateMultipleInvoiceStatuses(invoiceIds: number[]): Promise<void> {
  await Promise.all(
    invoiceIds.map(invoiceId => updateInvoiceStatus(invoiceId))
  );
}

