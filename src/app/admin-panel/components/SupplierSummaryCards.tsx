'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FileText, ShoppingCart, Package, Receipt, CreditCard, AlertCircle, Clock, Wallet } from 'lucide-react';
import { formatCurrencyWithDecimals } from '@/lib/currency';

interface PurchaseOrder {
  id: number;
  projectId: number;
  projectSupplierId: number;
  lpoNumber: string;
  lpoDate: string;
  lpoValue: number;
  vatPercent: number;
  lpoValueWithVat: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GRN {
  id: number;
  projectId: number;
  projectSupplierId: number;
  purchaseOrderId: number;
  grnRefNo: string;
  grnDate: string;
  deliveredAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: number;
  projectId: number;
  projectSupplierId: number;
  purchaseOrderId: number | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  paymentType: string;
  downPayment: number | null;
  invoiceAmount: number;
  vatAmount: number;
  downPaymentRecovery: number | null;
  totalAmount: number;
  status: string;
  paymentInvoices?: Array<{
    paymentAmount: number;
    vatAmount: number;
    payment?: {
      paymentDate: string;
      paymentMethod: string;
    };
  }>;
}

interface Payment {
  id: number;
  projectId: number;
  projectSupplierId: number;
  totalPaymentAmount: number;
  totalVatAmount: number;
  paymentMethod: string;
  paymentType: string | null;
  paymentDate: string;
  dueDate: string | null;
  liquidated: boolean | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SupplierSummaryCardsProps {
  projectId: number;
  projectSupplierId: number;
  compact?: boolean; // If true, shows a more compact layout
}

export default function SupplierSummaryCards({ projectId, projectSupplierId, compact = false }: SupplierSummaryCardsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  // Get VAT percentage from site settings, default to 5%
  const vatPercent = siteSettings?.vatPercent ?? 5;
  const vatMultiplier = 1 + (vatPercent / 100); // e.g., 1.05 for 5%

  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Helper function to calculate paid amounts from invoice data
  const calculatePaidAmountsFromInvoices = useCallback((invoiceList: Invoice[]) => {
    const paidAmounts: Record<number, { paymentAmount: number; vatAmount: number }> = {};
    
    invoiceList.forEach(invoice => {
      if (invoice.paymentInvoices && invoice.paymentInvoices.length > 0) {
        const totalPaid = invoice.paymentInvoices.reduce(
          (sum, pi) => ({
            paymentAmount: sum.paymentAmount + Number(pi.paymentAmount || 0),
            vatAmount: sum.vatAmount + Number(pi.vatAmount || 0),
          }),
          { paymentAmount: 0, vatAmount: 0 }
        );
        paidAmounts[invoice.id] = totalPaid;
      } else {
        paidAmounts[invoice.id] = { paymentAmount: 0, vatAmount: 0 };
      }
    });
    
    return paidAmounts;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [posRes, grnsRes, invoicesRes, paymentsRes] = await Promise.all([
        get<{ success: boolean; data?: PurchaseOrder[] }>(`/api/admin/project-suppliers/${projectSupplierId}/purchase-orders`),
        get<{ success: boolean; data?: GRN[] }>(`/api/admin/project-suppliers/${projectSupplierId}/grns`),
        get<{ success: boolean; data?: Invoice[] }>(`/api/admin/project-suppliers/${projectSupplierId}/invoices`),
        get<{ success: boolean; data?: Payment[] }>(`/api/admin/project-suppliers/${projectSupplierId}/payments`),
      ]);

      if (posRes.success) setPurchaseOrders(posRes.data || []);
      if (grnsRes.success) setGrns(grnsRes.data || []);
      if (invoicesRes.success) setInvoices(invoicesRes.data || []);
      if (paymentsRes.success) setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error('Failed to load supplier summary data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [get, projectSupplierId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" style={{ backgroundColor: colors.borderLight }}></div>
              <div className="h-6 bg-gray-200 rounded w-1/2" style={{ backgroundColor: colors.borderLight }}></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate Total Invoiced (sum of all invoice totalAmount)
  const totalInvoiced = invoices.reduce((sum, invoice) => {
    return sum + Number(invoice.totalAmount || 0);
  }, 0);

  // Calculate Total Paid - only count liquidated payments
  const totalPaid = payments.reduce((sum, payment) => {
    const isLiquidated = payment.paymentMethod === 'Current Dated' || 
                         (payment.paymentMethod === 'Post Dated' && payment.liquidated);
    
    if (isLiquidated) {
      return sum + Number(payment.totalPaymentAmount || 0) + Number(payment.totalVatAmount || 0);
    }
    return sum;
  }, 0);

  // Calculate Committed Payments - non-liquidated Post Dated payments
  const committedPayments = payments.reduce((sum, payment) => {
    if (payment.paymentMethod === 'Post Dated' && !payment.liquidated) {
      return sum + Number(payment.totalPaymentAmount || 0) + Number(payment.totalVatAmount || 0);
    }
    return sum;
  }, 0);

  // Calculate Balance to be Paid
  const balanceToBePaid = totalInvoiced - totalPaid;

  // Calculate Total Delivered (sum of all GRN deliveredAmount) with VAT
  const totalDeliveredBase = grns.reduce((sum, grn) => {
    return sum + Number(grn.deliveredAmount || 0);
  }, 0);
  const totalDelivered = totalDeliveredBase * vatMultiplier; // Add VAT

  // Calculate Total PO Amounts (with VAT)
  const totalPOAmountsWithVat = purchaseOrders.reduce((sum, po) => {
    return sum + Number(po.lpoValueWithVat || 0);
  }, 0);

  // Calculate LPO Balance: (Total PO amount - Delivered amount) * VAT multiplier (with VAT)
  const totalPOAmount = purchaseOrders.reduce((sum, po) => {
    return sum + Number(po.lpoValue || 0); // Use base LPO value without VAT
  }, 0);
  
  const lpoBalanceBeforeVat = totalPOAmount - totalDeliveredBase;
  const lpoBalance = lpoBalanceBeforeVat * vatMultiplier; // Add VAT

  // Calculate Due Amount (invoices past due date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const paidAmountsFromDB = calculatePaidAmountsFromInvoices(invoices);
  
  const dueAmount = invoices.reduce((sum, invoice) => {
    if (!invoice.dueDate) return sum;
    
    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      const paid = paidAmountsFromDB[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
      const totalPaidForInvoice = paid.paymentAmount + paid.vatAmount;
      const remaining = Number(invoice.totalAmount || 0) - totalPaidForInvoice;
      
      return sum + (remaining > 0 ? remaining : 0);
    }
    
    return sum;
  }, 0);

  const gridCols = compact ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-8';
  const cardPadding = compact ? 'p-3' : 'p-4';
  const textSize = compact ? 'text-lg' : 'text-xl';

  return (
    <div className={`grid ${gridCols} gap-4 ${compact ? 'mb-4' : 'mb-6'}`}>
      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total PO Amounts
            </p>
            <p className={`${textSize} font-bold`} style={{ color: colors.textPrimary }}>
              {formatCurrencyWithDecimals(totalPOAmountsWithVat)}
            </p>
            {!compact && (
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                With VAT
              </p>
            )}
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <FileText className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: colors.primary }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Delivered
            </p>
            <p className={`${textSize} font-bold`} style={{ color: colors.textPrimary }}>
              {formatCurrencyWithDecimals(totalDelivered)}
            </p>
            {!compact && (
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                With VAT
              </p>
            )}
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${colors.info}20` }}
          >
            <Package className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: colors.info }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              LPO Balance
            </p>
            <p className={`${textSize} font-bold`} style={{ color: lpoBalance > 0 ? colors.warning : colors.success }}>
              {formatCurrencyWithDecimals(lpoBalance)}
            </p>
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${lpoBalance > 0 ? colors.warning : colors.success}20` }}
          >
            <ShoppingCart className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: lpoBalance > 0 ? colors.warning : colors.success }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Invoiced
            </p>
            <p className={`${textSize} font-bold`} style={{ color: colors.textPrimary }}>
              {formatCurrencyWithDecimals(totalInvoiced)}
            </p>
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${colors.info}20` }}
          >
            <Receipt className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: colors.info }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Due Amount
            </p>
            <p className={`${textSize} font-bold`} style={{ color: dueAmount > 0 ? colors.error : colors.success }}>
              {formatCurrencyWithDecimals(dueAmount)}
            </p>
            {!compact && dueAmount > 0 && (
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Past due date
              </p>
            )}
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${dueAmount > 0 ? colors.error : colors.success}20` }}
          >
            <AlertCircle className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: dueAmount > 0 ? colors.error : colors.success }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
        title="Total paid amounts - sum of payments for invoices with status 'paid'"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Paid
            </p>
            <p className={`${textSize} font-bold`} style={{ color: colors.success }}>
              {formatCurrencyWithDecimals(totalPaid)}
            </p>
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${colors.success}20` }}
          >
            <CreditCard className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: colors.success }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
        title="Committed payments (Post Dated payments that are not yet liquidated)"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Committed Payments
            </p>
            <p className={`${textSize} font-bold`} style={{ color: colors.warning }}>
              {formatCurrencyWithDecimals(committedPayments)}
            </p>
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${colors.warning}20` }}
          >
            <Clock className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: colors.warning }} />
          </div>
        </div>
      </Card>

      <Card
        className={cardPadding}
        style={{
          backgroundColor: colors.backgroundPrimary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Balance to be Paid
            </p>
            <p className={`${textSize} font-bold`} style={{ color: balanceToBePaid > 0 ? colors.warning : colors.success }}>
              {formatCurrencyWithDecimals(balanceToBePaid)}
            </p>
          </div>
          <div
            className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
            style={{ backgroundColor: `${balanceToBePaid > 0 ? colors.warning : colors.success}20` }}
          >
            <Wallet className={`${compact ? 'h-5 w-5' : 'h-6 w-6'}`} style={{ color: balanceToBePaid > 0 ? colors.warning : colors.success }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

