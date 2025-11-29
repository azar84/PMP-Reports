'use client';

import { useCallback, useEffect, useState, Fragment } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toggle } from '@/components/ui/Toggle';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ArrowLeft, Plus, Save, Edit, Trash2, Tag, X, ChevronRight, ChevronDown, FileText, ShoppingCart, Package, Receipt, Filter, XCircle, CreditCard, Calendar, AlertCircle, Clock, Wallet, File, Upload, Loader2, CheckCircle, Star } from 'lucide-react';
import { formatDateForInput } from '@/lib/dateUtils';
import { formatCurrency, formatCurrencyWithDecimals } from '@/lib/currency';

interface SubcontractorOption {
  id: number;
  name: string;
  vendorCode: string | null;
  type: string;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  typeOfWorks?: Array<{
    typeOfWork: {
      id: number;
      name: string;
    };
  }>;
}

interface ProjectSubcontractor {
  id: number;
  projectId: number;
  subcontractorId: number;
  scopeOfWork: string | null;
  subcontractAgreement: boolean;
  subcontractAgreementDocumentUrl: string | null;
  performanceRating: number | null; // 1-5 stars
  performanceReview: string | null;
  createdAt: string;
  updatedAt: string;
  subcontractor: SubcontractorOption;
}

interface PurchaseOrder {
  id: number;
  projectId: number;
  projectSubcontractorId: number;
  lpoNumber: string;
  lpoDate: string;
  lpoValue: number;
  vatPercent: number;
  lpoValueWithVat: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrdersResponse {
  success: boolean;
  data?: PurchaseOrder[];
  error?: string;
}

interface ChangeOrder {
  id: number;
  projectId: number;
  projectSubcontractorId: number;
  purchaseOrderId: number;
  chRefNo: string;
  chDate: string;
  type: 'addition' | 'omission';
  amount: number;
  vatPercent: number;
  vatAmount: number;
  amountWithVat: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChangeOrdersResponse {
  success: boolean;
  data?: ChangeOrder[];
  error?: string;
}

interface InvoiceChangeOrder {
  id: number;
  invoiceId: number;
  changeOrderId: number;
  changeOrder: ChangeOrder & {
    purchaseOrder: PurchaseOrder;
  };
}

interface Invoice {
  id: number;
  projectId: number;
  projectSubcontractorId: number;
  purchaseOrderId: number | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null; // Due date for the invoice
  paymentType: string; // "Advance Payment", "Progress Payment", or "Retention Release Payment"
  downPayment: number | null;
  changeOrderId: number | null; // For Advance Payment invoices - links to CO
  invoiceAmount: number; // Invoice amount before VAT
  vatAmount: number; // VAT amount at 5%
  downPaymentRecovery: number | null; // Down Payment Recovery (for Progress Payment)
  advanceRecovery: number | null; // Advance Payment Recovery (for Progress Payment) - default 10% of amount
  retention: number | null; // Retention amount (for Progress Payment) - default 10% of payment
  contraChargesAmount: number | null; // Contra Charges amount (for Progress Payment) - deducted from total
  contraChargesDescription: string | null; // Contra Charges description (for Progress Payment)
  totalAmount: number; // Total amount with VAT - Down Payment Recovery - Advance Recovery - Retention - Contra Charges
  status?: string; // "paid", "partially_paid", or "unpaid"
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: PurchaseOrder | null;
  invoiceChangeOrders: InvoiceChangeOrder[];
  paymentInvoices?: PaymentInvoice[]; // Payment invoices linked to this invoice
}

interface InvoicesResponse {
  success: boolean;
  data?: Invoice[];
  error?: string;
}

interface PaymentInvoice {
  id: number;
  paymentId: number;
  invoiceId: number;
  paymentAmount: number;
  vatAmount: number;
  invoice: Invoice;
  payment?: Payment; // Payment information
}

interface Payment {
  id: number;
  projectId: number;
  projectSubcontractorId: number;
  totalPaymentAmount: number;
  totalVatAmount: number;
  paymentMethod: string; // "Post Dated" or "Current Dated"
  paymentType: string | null; // For Post Dated: "PDC", "LC", or "Trust Receipt"
  paymentDate: string; // For Current Dated: payment date, For Post Dated: issue date
  dueDate: string | null; // For Post Dated: due date
  liquidated: boolean; // For Post Dated: indicates if LC/PDC/Trust Receipt has been released
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paymentInvoices: PaymentInvoice[];
}

interface PaymentsResponse {
  success: boolean;
  data?: Payment[];
  error?: string;
}

interface SubcontractorDetailViewProps {
  projectId: number;
  projectName: string;
  subcontractorId: number;
  onBack: () => void;
}

export default function SubcontractorDetailView({ projectId, projectName, subcontractorId, onBack }: SubcontractorDetailViewProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();
  
  // Get VAT percentage from site settings, default to 5%
  const vatPercent = siteSettings?.vatPercent ?? 5;
  const vatMultiplier = 1 + (vatPercent / 100); // e.g., 1.05 for 5%
  const vatDecimal = vatPercent / 100; // e.g., 0.05 for 5%

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectSubcontractor, setProjectSubcontractor] = useState<ProjectSubcontractor | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [showPOForm, setShowPOForm] = useState(false);
  const [changeOrders, setChangeOrders] = useState<Record<number, ChangeOrder[]>>({});
  const [expandedPOs, setExpandedPOs] = useState<Set<number>>(new Set());
  const [editingChangeOrder, setEditingChangeOrder] = useState<ChangeOrder | null>(null);
  const [showChangeOrderForm, setShowChangeOrderForm] = useState<number | null>(null); // poId
  const [changeOrderFormData, setChangeOrderFormData] = useState({
    chRefNo: '',
    chDate: '',
    type: 'addition' as 'addition' | 'omission',
    amount: '',
    vatPercent: vatPercent.toString(),
    vatAmount: '',
    description: '',
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '', // Due date for the invoice
    paymentType: 'Progress Payment' as 'Advance Payment' | 'Progress Payment' | 'Retention Release Payment',
    downPayment: '',
    selectedPurchaseOrderId: null as number | null, // For Advance Payment - PO selection
    selectedChangeOrderId: null as number | null, // For Advance Payment - CO selection
    selectedProgressPOId: null as number | null, // For Progress Payment - PO selection
    progressInvoiceAmount: '', // Manual invoice amount for Progress Payment
    vatAmount: '', // Editable VAT amount
    downPaymentRecovery: '', // Down Payment Recovery (for Progress Payment)
    advanceRecovery: '', // Advance Payment Recovery (for Progress Payment) - default 10% of amount
    retention: '', // Retention amount (for Progress Payment) - default 10% of payment
    contraChargesAmount: '', // Contra Charges amount (for Progress Payment)
    contraChargesDescription: '', // Contra Charges description (for Progress Payment)
  });
  const [hasDownPayment, setHasDownPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'pos' | 'changeOrders' | 'invoices' | 'payments' | 'performance'>('pos');
  const [poFilterId, setPoFilterId] = useState<number | null>(null); // Single PO filter for all tabs and cards
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<{
    selectedInvoiceIds: number[];
    invoicePayments: Record<number, { paymentAmount: string; vatAmount: string }>;
    paymentMethod: 'Post Dated' | 'Current Dated';
    paymentType: 'PDC' | 'LC' | 'Trust Receipt' | null;
    paymentDate: string;
    dueDate: string;
    liquidated: boolean;
    notes: string;
  }>({
    selectedInvoiceIds: [],
    invoicePayments: {},
    paymentMethod: 'Current Dated',
    paymentType: null,
    paymentDate: '',
    dueDate: '',
    liquidated: false,
    notes: '',
  });
  const [poFormData, setPOFormData] = useState({
    lpoNumber: '',
    lpoDate: '',
    lpoValue: '',
    vatPercent: vatPercent.toString(),
    notes: '',
  });
  
  // Agreement document editing state
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);
  const [editingAgreementFile, setEditingAgreementFile] = useState<File | null>(null);
  const [uploadingAgreementDocument, setUploadingAgreementDocument] = useState(false);
  const [tempAgreementDocumentUrl, setTempAgreementDocumentUrl] = useState<string | null>(null);
  const [performanceFormData, setPerformanceFormData] = useState({
    performanceRating: null as number | null,
    performanceReview: '',
  });
  const [isEditingPerformance, setIsEditingPerformance] = useState(false);

  const loadData = useCallback(async () => {
    if (isNaN(projectId) || isNaN(subcontractorId)) {
      setError('Invalid project or subcontractor ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [projectSubcontractorsRes, purchaseOrdersRes] = await Promise.all([
        get<{ success: boolean; data?: ProjectSubcontractor[]; error?: string }>(
          `/api/admin/project-subcontractors?projectId=${projectId}`
        ),
        get<PurchaseOrdersResponse>(
          `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders`
        ),
      ]);

      if (!projectSubcontractorsRes?.success) {
        throw new Error(projectSubcontractorsRes?.error || 'Failed to load project subcontractor');
      }

      const subcontractor = projectSubcontractorsRes.data?.find(ps => ps.id === subcontractorId);
      if (!subcontractor) {
        throw new Error('Project subcontractor not found');
      }

      setProjectSubcontractor(subcontractor);
      
      // Load performance data if available
      if (subcontractor.performanceRating || subcontractor.performanceReview) {
        setPerformanceFormData({
          performanceRating: subcontractor.performanceRating || null,
          performanceReview: subcontractor.performanceReview || '',
        });
      }
      
      const pos = purchaseOrdersRes.data || [];
      setPurchaseOrders(pos);

      // Load Change Orders for all POs
      const changeOrderPromises = pos.map(async (po) => {
        try {
          const chRes = await get<ChangeOrdersResponse>(`/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${po.id}/change-orders`);
          return { poId: po.id, changeOrders: chRes.data || [] };
        } catch (error) {
          console.error(`Failed to load Change Orders for PO ${po.id}:`, error);
          return { poId: po.id, changeOrders: [] };
        }
      });

      const changeOrderResults = await Promise.all(changeOrderPromises);
      const changeOrderMap: Record<number, ChangeOrder[]> = {};
      changeOrderResults.forEach(({ poId, changeOrders }) => {
        changeOrderMap[poId] = changeOrders;
      });
      setChangeOrders(changeOrderMap);

      // Load invoices for this subcontractor
      const invoicesRes = await get<InvoicesResponse>(`/api/admin/project-subcontractors/${subcontractorId}/invoices`);
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }

      // Load payments for this subcontractor (needed for summary cards calculations)
      try {
        const paymentsRes = await get<PaymentsResponse>(`/api/admin/project-subcontractors/${subcontractorId}/payments`);
        if (paymentsRes.success && paymentsRes.data) {
          // Ensure liquidated field is properly set (default to false if null/undefined)
          const paymentsWithLiquidated = paymentsRes.data.map(payment => ({
            ...payment,
            liquidated: payment.liquidated ?? false,
          }));
          setPayments(paymentsWithLiquidated);
        }
      } catch (error) {
        console.error('Failed to load payments on initial load:', error);
        // Don't throw - payments might not exist yet
      }

      // Check if a down payment exists for this project (across all subcontractors)
      // We'll check this by loading all invoices for the project
      try {
        const allProjectInvoicesRes = await get<{ success: boolean; data?: Invoice[] }>(
          `/api/admin/projects/${projectId}/invoices`
        );
        if (allProjectInvoicesRes.success && allProjectInvoicesRes.data) {
          const downPaymentExists = allProjectInvoicesRes.data.some(inv => inv.paymentType === 'Advance Payment');
          setHasDownPayment(downPaymentExists);
        }
      } catch (error) {
        // If the endpoint doesn't exist yet, we'll check when switching to invoices tab
        console.log('Could not check project-wide invoices, will check when loading invoices tab');
      }
    } catch (fetchError: any) {
      console.error('Failed to load subcontractor details:', fetchError);
      setError(fetchError?.message || 'Failed to load subcontractor information.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId, subcontractorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChangeOrders = useCallback(async (poId: number) => {
    try {
      const response = await get<ChangeOrdersResponse>(`/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${poId}/change-orders`);
      if (response.success && response.data) {
        setChangeOrders((prev) => ({
          ...prev,
          [poId]: response.data || [],
        }));
      }
    } catch (error: any) {
      console.error('Failed to load Change Orders:', error);
      setError(error?.message || 'Failed to load Change Orders.');
    }
  }, [get, subcontractorId]);

  const loadInvoices = useCallback(async () => {
    try {
      // Check if a down payment exists for this project (across all subcontractors)
      try {
        const downPaymentCheck = await get<{ success: boolean; data?: Invoice[] }>(`/api/admin/projects/${projectId}/invoices`);
        if (downPaymentCheck.success && downPaymentCheck.data) {
          const downPaymentExists = downPaymentCheck.data.some(inv => inv.paymentType === 'Advance Payment');
          setHasDownPayment(downPaymentExists);
        }
      } catch (error) {
        // If endpoint doesn't exist, will check from subcontractor invoices below
      }

      const response = await get<InvoicesResponse>(`/api/admin/project-subcontractors/${subcontractorId}/invoices`);
      if (response.success && response.data) {
        setInvoices(response.data);
        // Also check if any invoice in this subcontractor is a down payment (fallback)
        if (response.data.some(inv => inv.paymentType === 'Advance Payment')) {
          setHasDownPayment(true);
        }
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      setError(error?.message || 'Failed to load invoices.');
    }
  }, [get, subcontractorId, projectId]);

  const loadPayments = useCallback(async () => {
    try {
      const response = await get<PaymentsResponse>(`/api/admin/project-subcontractors/${subcontractorId}/payments`);
      if (response.success && response.data) {
        // Ensure liquidated field is properly set (default to false if null/undefined)
        const paymentsWithLiquidated = response.data.map(payment => ({
          ...payment,
          liquidated: payment.liquidated ?? false,
        }));
        setPayments(paymentsWithLiquidated);
      }
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      setError(error?.message || 'Failed to load payments.');
    }
  }, [get, subcontractorId]);

  // Helper function to calculate paid amounts from invoice data (from DB)
  // This doesn't depend on payments state being loaded
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

  // Helper function to calculate paid amounts for invoices (from payments state)
  // Used for payment form calculations when editing payments
  const calculateInvoicePaidAmounts = useCallback(() => {
    const paidAmounts: Record<number, { paymentAmount: number; vatAmount: number }> = {};
    
    // Exclude the payment being edited from calculations
    payments
      .filter(payment => editingPayment ? payment.id !== editingPayment.id : true)
      .forEach(payment => {
        payment.paymentInvoices?.forEach(paymentInvoice => {
          const invoiceId = paymentInvoice.invoiceId;
          if (!paidAmounts[invoiceId]) {
            paidAmounts[invoiceId] = { paymentAmount: 0, vatAmount: 0 };
          }
          paidAmounts[invoiceId].paymentAmount += Number(paymentInvoice.paymentAmount || 0);
          paidAmounts[invoiceId].vatAmount += Number(paymentInvoice.vatAmount || 0);
        });
      });
    
    return paidAmounts;
  }, [payments, editingPayment]);

  // Helper function to get invoice status from database or calculate if not available
  const getInvoiceStatus = useCallback((invoice: Invoice): 'paid' | 'partially_paid' | 'unpaid' => {
    // Use status from database if available
    if (invoice.status && ['paid', 'partially_paid', 'unpaid'].includes(invoice.status)) {
      return invoice.status as 'paid' | 'partially_paid' | 'unpaid';
    }
    
    // Fallback calculation if status not in database
    // Use paymentInvoices from invoice data (from DB) instead of payments state
    let totalPaid = 0;
    if (invoice.paymentInvoices && invoice.paymentInvoices.length > 0) {
      totalPaid = invoice.paymentInvoices.reduce((sum, pi) => {
        return sum + Number(pi.paymentAmount || 0) + Number(pi.vatAmount || 0);
      }, 0);
    }
    
    const invoiceTotal = Number(invoice.totalAmount || 0);
    const tolerance = 0.01;
    
    // If fully paid, return 'paid'
    if (totalPaid >= invoiceTotal - tolerance) {
      return 'paid';
    }
    
    // If partially paid, return 'partially_paid'
    if (totalPaid > tolerance) {
      return 'partially_paid';
    }
    
    // Not paid
    return 'unpaid';
  }, []);

  // Helper function to calculate due days (due date - current date or payment date if fully paid)
  // Returns: positive if not yet due, negative if overdue
  const calculateDueDays = useCallback((invoice: Invoice): number | null => {
    if (!invoice.dueDate) {
      return null;
    }
    
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);
    
    // If invoice is fully paid, use the payment date instead of current date
    let referenceDate = new Date();
    const invoiceStatus = getInvoiceStatus(invoice);
    
    // Only use payment date if invoice is fully paid (not partially paid)
    if (invoiceStatus === 'paid' && invoice.paymentInvoices && invoice.paymentInvoices.length > 0) {
      // Get the latest payment date (most recent payment)
      const paymentDates = invoice.paymentInvoices
        .map(pi => pi.payment?.paymentDate)
        .filter(date => date !== undefined)
        .map(date => new Date(date!));
      
      if (paymentDates.length > 0) {
        // Use the most recent payment date
        referenceDate = new Date(Math.max(...paymentDates.map(d => d.getTime())));
      }
    }
    
    referenceDate.setHours(0, 0, 0, 0);
    
    // Calculate difference: due date - reference date (current date or payment date if paid)
    // Positive = days until due, Negative = days overdue
    const diffTime = due.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [getInvoiceStatus]);

  // Get invoices to display in payment form
  // When editing: show invoices from the current payment + unpaid invoices
  // When creating: show only unpaid invoices
  const getInvoicesForPayment = useCallback(() => {
    const paidAmounts = calculateInvoicePaidAmounts();
    
    if (editingPayment) {
      // When editing, include invoices from the current payment
      const paymentInvoiceIds = editingPayment.paymentInvoices?.map(pi => pi.invoiceId) || [];
      const paymentInvoices = invoices.filter(inv => paymentInvoiceIds.includes(inv.id));
      
      // Also include unpaid invoices (excluding those already in the payment)
      const unpaidInvoices = invoices.filter(invoice => {
        if (paymentInvoiceIds.includes(invoice.id)) return false; // Already in payment
        const paid = paidAmounts[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
        const totalPaid = paid.paymentAmount + paid.vatAmount;
        const invoiceTotal = Number(invoice.totalAmount || 0);
        return totalPaid < invoiceTotal;
      });
      
      return [...paymentInvoices, ...unpaidInvoices];
    } else {
      // When creating, show only unpaid invoices
      return invoices.filter(invoice => {
        const paid = paidAmounts[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
        const totalPaid = paid.paymentAmount + paid.vatAmount;
        const invoiceTotal = Number(invoice.totalAmount || 0);
        return totalPaid < invoiceTotal;
      });
    }
  }, [invoices, calculateInvoicePaidAmounts, editingPayment]);

  // Get invoices that are not fully paid (for backward compatibility)
  const getUnpaidInvoices = useCallback(() => {
    return getInvoicesForPayment();
  }, [getInvoicesForPayment]);

  useEffect(() => {
    // Load Change Orders for all POs when switching to Change Orders tab
    if (activeTab === 'changeOrders' && purchaseOrders.length > 0) {
      purchaseOrders.forEach(po => {
        if (!changeOrders[po.id]) {
          loadChangeOrders(po.id);
        }
      });
    }
    // Load invoices when switching to Invoices tab
    if (activeTab === 'invoices') {
      loadInvoices();
    }
    
    // Load payments when switching to Payments tab
    if (activeTab === 'payments') {
      loadPayments();
    }
    
    // Load performance data when switching to Performance tab
    if (activeTab === 'performance' && projectSubcontractor) {
      const hasPerformanceData = projectSubcontractor.performanceRating || projectSubcontractor.performanceReview;
      setPerformanceFormData({
        performanceRating: projectSubcontractor.performanceRating || null,
        performanceReview: projectSubcontractor.performanceReview || '',
      });
      // Only show form if there's no existing data, otherwise show saved view
      setIsEditingPerformance(!hasPerformanceData);
    }
    
    // Don't reset PO filter when switching tabs - it's global
  }, [activeTab, purchaseOrders, changeOrders, loadChangeOrders, loadInvoices, loadPayments, projectSubcontractor]);

  const loadPurchaseOrders = useCallback(async () => {
    try {
      const response = await get<PurchaseOrdersResponse>(
        `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders`
      );
      if (response.success && response.data) {
        setPurchaseOrders(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load purchase orders:', error);
      setError(error?.message || 'Failed to load purchase orders.');
    }
  }, [get, subcontractorId]);

  const handleSavePO = useCallback(async () => {
    if (!poFormData.lpoNumber || !poFormData.lpoDate || !poFormData.lpoValue) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const poData = {
        lpoNumber: poFormData.lpoNumber,
        lpoDate: poFormData.lpoDate,
        lpoValue: parseFloat(poFormData.lpoValue),
        vatPercent: parseFloat(poFormData.vatPercent) || vatPercent,
        notes: poFormData.notes || null,
      };

      if (editingPO) {
        await put<{ success: boolean; data?: PurchaseOrder }>(
          `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${editingPO.id}`,
          poData
        );
      } else {
        await post<{ success: boolean; data?: PurchaseOrder }>(
          `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders`,
          poData
        );
      }

      await loadPurchaseOrders();
      setShowPOForm(false);
      setEditingPO(null);
      setPOFormData({
        lpoNumber: '',
        lpoDate: '',
        lpoValue: '',
        vatPercent: vatPercent.toString(),
        notes: '',
      });
    } catch (submitError: any) {
      console.error('Failed to save purchase order:', submitError);
      setError(submitError?.message || 'Failed to save purchase order.');
    } finally {
      setIsSaving(false);
    }
  }, [poFormData, editingPO, subcontractorId, post, put, loadPurchaseOrders]);

  const handleEditPO = useCallback((po: PurchaseOrder) => {
    setEditingPO(po);
    setShowPOForm(true);
    setPOFormData({
      lpoNumber: po.lpoNumber,
      lpoDate: formatDateForInput(po.lpoDate),
      lpoValue: po.lpoValue.toString(),
      vatPercent: po.vatPercent.toString(),
      notes: po.notes || '',
    });
  }, []);

  const handleDeletePO = useCallback(
    async (poId: number, lpoNumber: string) => {
      if (!confirm(`Delete Purchase Order ${lpoNumber}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${poId}`);
        await loadPurchaseOrders();
      } catch (deleteError: any) {
        console.error('Failed to delete purchase order:', deleteError);
        setError(deleteError?.message || 'Failed to delete purchase order.');
      }
    },
    [del, subcontractorId, loadPurchaseOrders]
  );

  const handleSaveChangeOrder = useCallback(async (poId: number) => {
    if (!changeOrderFormData.chRefNo || !changeOrderFormData.chDate || !changeOrderFormData.amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const amount = parseFloat(changeOrderFormData.amount);
      const vatAmount = changeOrderFormData.vatAmount ? parseFloat(changeOrderFormData.vatAmount) : (amount * (vatPercent / 100));
      const amountWithVat = amount + vatAmount;

      const changeOrderData = {
        chRefNo: changeOrderFormData.chRefNo,
        chDate: changeOrderFormData.chDate,
        type: changeOrderFormData.type,
        amount: amount,
        vatPercent: vatPercent, // Use system VAT rate
        vatAmount: Number(vatAmount.toFixed(2)),
        amountWithVat: Number(amountWithVat.toFixed(2)),
        description: changeOrderFormData.description || null,
      };

      if (editingChangeOrder) {
        await put<{ success: boolean; data?: ChangeOrder }>(
          `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${poId}/change-orders/${editingChangeOrder.id}`,
          changeOrderData
        );
      } else {
        await post<{ success: boolean; data?: ChangeOrder }>(
          `/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${poId}/change-orders`,
          changeOrderData
        );
      }

      await loadChangeOrders(poId);
      setShowChangeOrderForm(null);
      setEditingChangeOrder(null);
      setChangeOrderFormData({
        chRefNo: '',
        chDate: '',
        type: 'addition' as 'addition' | 'omission',
        amount: '',
        vatPercent: vatPercent.toString(),
        vatAmount: '',
        description: '',
      });
    } catch (submitError: any) {
      console.error('Failed to save Change Order:', submitError);
      setError(submitError?.message || 'Failed to save Change Order.');
    } finally {
      setIsSaving(false);
    }
  }, [changeOrderFormData, editingChangeOrder, post, put, loadChangeOrders, subcontractorId]);

  const handleEditChangeOrder = useCallback((changeOrder: ChangeOrder) => {
    setEditingChangeOrder(changeOrder);
    setShowChangeOrderForm(changeOrder.purchaseOrderId);
    setChangeOrderFormData({
      chRefNo: changeOrder.chRefNo,
      chDate: formatDateForInput(changeOrder.chDate),
      type: changeOrder.type,
      amount: changeOrder.amount.toString(),
      vatPercent: vatPercent.toString(), // Always use system rate for display
      vatAmount: (changeOrder.vatAmount || 0).toString(),
      description: changeOrder.description || '',
    });
  }, [vatPercent]);

  const handleDeleteChangeOrder = useCallback(
    async (poId: number, changeOrderId: number, chRefNo: string) => {
      if (!confirm(`Delete Change Order ${chRefNo}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-subcontractors/${subcontractorId}/purchase-orders/${poId}/change-orders/${changeOrderId}`);
        await loadChangeOrders(poId);
      } catch (deleteError: any) {
        console.error('Failed to delete Change Order:', deleteError);
        setError(deleteError?.message || 'Failed to delete Change Order.');
      }
    },
    [del, loadChangeOrders, subcontractorId]
  );

  const togglePOExpand = useCallback((poId: number) => {
    setExpandedPOs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(poId)) {
        newSet.delete(poId);
      } else {
        newSet.add(poId);
        // Load Change Orders if not already loaded
        if (!changeOrders[poId]) {
          loadChangeOrders(poId);
        }
      }
      return newSet;
    });
  }, [changeOrders, loadChangeOrders]);

  // Calculate invoice amounts based on payment type
  const calculateInvoiceAmounts = useCallback(() => {
    let invoiceAmount = 0;

    if (invoiceFormData.paymentType === 'Advance Payment') {
      invoiceAmount = parseFloat(invoiceFormData.downPayment) || 0;
    } else if (invoiceFormData.paymentType === 'Progress Payment') {
      // Progress Payment - manual entry
      invoiceAmount = parseFloat(invoiceFormData.progressInvoiceAmount) || 0;
    } else if (invoiceFormData.paymentType === 'Retention Release Payment') {
      // Retention Release Payment - manual entry
      invoiceAmount = parseFloat(invoiceFormData.progressInvoiceAmount) || 0;
    }

    // Down Payment Recovery (only for Progress Payment) - deducted BEFORE VAT
    const downPaymentRecovery = invoiceFormData.paymentType === 'Progress Payment' 
      ? (parseFloat(invoiceFormData.downPaymentRecovery) || 0) 
      : 0;
    
    // Advance Recovery (only for Progress Payment) - deducted BEFORE VAT
    const advanceRecovery = invoiceFormData.paymentType === 'Progress Payment'
      ? (invoiceFormData.advanceRecovery ? parseFloat(invoiceFormData.advanceRecovery) : 0)
      : 0;
    
    // Retention (only for Progress Payment) - default 10% of invoice amount, deducted BEFORE VAT
    const retention = invoiceFormData.paymentType === 'Progress Payment'
      ? (invoiceFormData.retention ? parseFloat(invoiceFormData.retention) : (invoiceAmount * 0.10))
      : 0;
    
    // Contra Charges (only for Progress Payment) - deducted BEFORE VAT
    const contraChargesAmount = invoiceFormData.paymentType === 'Progress Payment'
      ? (parseFloat(invoiceFormData.contraChargesAmount) || 0)
      : 0;
    
    // Amount after deductions (before VAT)
    const amountAfterDeductions = invoiceAmount - downPaymentRecovery - advanceRecovery - retention - contraChargesAmount;
    
    // Use editable VAT amount if provided, otherwise calculate VAT of amount after deductions
    const vatAmount = invoiceFormData.vatAmount ? parseFloat(invoiceFormData.vatAmount) : (amountAfterDeductions * vatDecimal);
    
    // Total amount = Amount after deductions + VAT
    const totalAmount = amountAfterDeductions + vatAmount;

    return {
      invoiceAmount: Number(invoiceAmount.toFixed(2)),
      downPaymentRecovery: Number(downPaymentRecovery.toFixed(2)),
      advanceRecovery: Number(advanceRecovery.toFixed(2)),
      retention: Number(retention.toFixed(2)),
      contraChargesAmount: Number(contraChargesAmount.toFixed(2)),
      amountAfterDeductions: Number(amountAfterDeductions.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }, [invoiceFormData, vatDecimal]);

  // Helper function to get invoice validation errors (user-friendly messages)
  const getInvoiceValidationErrors = useCallback(() => {
    const errors: string[] = [];
    
    if (!invoiceFormData.invoiceNumber) {
      errors.push('Please enter an invoice number.');
    }
    
    if (!invoiceFormData.invoiceDate) {
      errors.push('Please select an invoice date.');
    }

    if (invoiceFormData.paymentType === 'Advance Payment') {
      if (!invoiceFormData.downPayment || parseFloat(invoiceFormData.downPayment) <= 0) {
        errors.push('Please enter an advance payment amount for Advance Payment type.');
      }
      if (!invoiceFormData.selectedPurchaseOrderId) {
        errors.push('Please select a Purchase Order for Advance Payment type.');
      }
    } else if (invoiceFormData.paymentType === 'Progress Payment' || invoiceFormData.paymentType === 'Retention Release Payment') {
      if (!invoiceFormData.selectedProgressPOId) {
        errors.push(`Please select a Purchase Order for ${invoiceFormData.paymentType} type.`);
      }
      if (!invoiceFormData.progressInvoiceAmount || parseFloat(invoiceFormData.progressInvoiceAmount) <= 0) {
        errors.push(`Please enter an invoice amount for ${invoiceFormData.paymentType} type.`);
      }
      
      if (invoiceFormData.selectedProgressPOId && invoiceFormData.progressInvoiceAmount) {
        const selectedPO = purchaseOrders.find(po => po.id === invoiceFormData.selectedProgressPOId);
        const poCOs = changeOrders[invoiceFormData.selectedProgressPOId || 0] || [];
        
        if (invoiceFormData.paymentType === 'Progress Payment') {
          // Validate that invoice amount doesn't exceed balance to certify (only for Progress Payment)
          // Calculate Previously Certified for Progress Payments only (excluding advance payments and retention release payments)
          const previouslyCertifiedProgress = invoices
            .filter(inv => 
              inv.paymentType === 'Progress Payment' &&
              (!editingInvoice || inv.id !== editingInvoice.id) &&
              inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
            )
            .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
          
          // Calculate Balance to Certify
          const poAmount = selectedPO ? Number(selectedPO.lpoValue || 0) : 0;
          const coAmounts = poCOs.reduce((sum, co) => sum + Number(co.amount || 0), 0);
          const totalPOAndCOAmount = poAmount + coAmounts;
          const balanceToCertify = totalPOAndCOAmount - previouslyCertifiedProgress;
          
          // Calculate net invoice amount (after recovery, retention, and contra charges, before VAT)
          const invoiceAmount = parseFloat(invoiceFormData.progressInvoiceAmount || '0');
          const advanceRecovery = parseFloat(invoiceFormData.advanceRecovery || '0');
          const retention = parseFloat(invoiceFormData.retention || '0');
          const contraChargesAmount = parseFloat(invoiceFormData.contraChargesAmount || '0');
          const netInvoiceAmount = invoiceAmount - advanceRecovery - retention - contraChargesAmount;
          
          if (netInvoiceAmount > balanceToCertify) {
            errors.push(`Invoice amount (after recovery & retention: ${formatCurrencyWithDecimals(netInvoiceAmount)}) exceeds Balance to Certify (${formatCurrencyWithDecimals(balanceToCertify)}). Please adjust the invoice amount.`);
          }
        } else if (invoiceFormData.paymentType === 'Retention Release Payment') {
          // For Retention Release Payment: validate that amount doesn't exceed total retention held
          // Calculate total retention held so far from previous Progress Payment invoices (exclude current if editing)
          const totalRetentionHeld = invoices
            .filter(inv => 
              inv.paymentType === 'Progress Payment' &&
              (!editingInvoice || inv.id !== editingInvoice.id) &&
              inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
            )
            .reduce((sum, inv) => sum + Number(inv.retention || 0), 0);
          
          // Calculate total retention already released from previous Retention Release Payment invoices (exclude current if editing)
          const totalRetentionReleased = invoices
            .filter(inv => 
              inv.paymentType === 'Retention Release Payment' &&
              (!editingInvoice || inv.id !== editingInvoice.id) &&
              inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
            )
            .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
          
          // Available retention to release = Total retention held - Total already released
          const availableRetentionToRelease = totalRetentionHeld - totalRetentionReleased;
          
          const releaseAmount = parseFloat(invoiceFormData.progressInvoiceAmount || '0');
          
          if (releaseAmount > availableRetentionToRelease) {
            errors.push(`Retention release amount (${formatCurrencyWithDecimals(releaseAmount)}) exceeds available retention held (${formatCurrencyWithDecimals(availableRetentionToRelease)}). Please adjust the release amount.`);
          }
        }
      }
    }

    return errors;
  }, [invoiceFormData, purchaseOrders, changeOrders, invoices, editingInvoice]);

  const handleSaveInvoice = useCallback(async () => {
    console.log('handleSaveInvoice called with:', {
      invoiceNumber: invoiceFormData.invoiceNumber,
      invoiceDate: invoiceFormData.invoiceDate,
      paymentType: invoiceFormData.paymentType,
      selectedProgressPOId: invoiceFormData.selectedProgressPOId,
    });
    
    // Get all validation errors
    const validationErrors = getInvoiceValidationErrors();
    
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join('\n• ');
      const fullMsg = 'Please fix the following errors:\n\n• ' + errorMsg;
      console.log('Validation failed:', fullMsg);
      setError(errorMsg);
      alert(fullMsg);
      return;
    }
    
    console.log('All validations passed, proceeding with save...');

    setIsSaving(true);
    setError(null);

    try {
      // Calculate invoice amounts
      const amounts = calculateInvoiceAmounts();
      
      // Down Payment Recovery (only for Progress Payment) - deducted BEFORE VAT
      const finalDownPaymentRecovery = invoiceFormData.paymentType === 'Progress Payment' 
        ? (invoiceFormData.downPaymentRecovery ? parseFloat(invoiceFormData.downPaymentRecovery) : 0)
        : 0;
      
      // Advance Recovery (only for Progress Payment) - default 10% of invoice amount
      const finalAdvanceRecovery = invoiceFormData.paymentType === 'Progress Payment'
        ? amounts.advanceRecovery
        : 0;
      
      // Retention (only for Progress Payment) - default 10% of invoice amount
      const finalRetention = invoiceFormData.paymentType === 'Progress Payment'
        ? amounts.retention
        : 0;
      
      // Contra Charges (only for Progress Payment) - deducted BEFORE VAT
      const finalContraChargesAmount = invoiceFormData.paymentType === 'Progress Payment'
        ? amounts.contraChargesAmount
        : 0;
      
      // Contra Charges Description (only for Progress Payment)
      const finalContraChargesDescription = invoiceFormData.paymentType === 'Progress Payment'
        ? (invoiceFormData.contraChargesDescription || null)
        : null;
      
      // Amount after deductions (before VAT) - this is the Invoice Amount (excluding VAT)
      const amountAfterDeductions = amounts.amountAfterDeductions;
      
      // Use the editable VAT amount if provided, otherwise calculate VAT of amount after deductions
      const finalVatAmount = invoiceFormData.vatAmount && parseFloat(invoiceFormData.vatAmount) > 0 
        ? parseFloat(invoiceFormData.vatAmount) 
        : (amountAfterDeductions * vatDecimal);
      
      // Total amount = Amount after deductions + VAT
      const finalTotalAmount = amountAfterDeductions + finalVatAmount;

      // Invoice Amount should be the base invoice amount (before deductions)
      const finalInvoiceAmount = amounts.invoiceAmount;

      const invoiceData: any = {
        invoiceNumber: invoiceFormData.invoiceNumber,
        invoiceDate: invoiceFormData.invoiceDate,
        dueDate: invoiceFormData.dueDate || null,
        paymentType: invoiceFormData.paymentType,
        downPayment: invoiceFormData.paymentType === 'Advance Payment' ? invoiceFormData.downPayment : undefined,
        invoiceAmount: Number(finalInvoiceAmount.toFixed(2)),
        vatAmount: Number(finalVatAmount.toFixed(2)),
        downPaymentRecovery: invoiceFormData.paymentType === 'Progress Payment' ? Number(finalDownPaymentRecovery.toFixed(2)) : undefined,
        advanceRecovery: invoiceFormData.paymentType === 'Progress Payment' ? Number(finalAdvanceRecovery.toFixed(2)) : undefined,
        retention: invoiceFormData.paymentType === 'Progress Payment' ? Number(finalRetention.toFixed(2)) : undefined,
        contraChargesAmount: invoiceFormData.paymentType === 'Progress Payment' ? Number(finalContraChargesAmount.toFixed(2)) : undefined,
        contraChargesDescription: finalContraChargesDescription,
        totalAmount: Number(finalTotalAmount.toFixed(2)),
      };

      if (invoiceFormData.paymentType === 'Advance Payment') {
        if (invoiceFormData.selectedPurchaseOrderId) {
        invoiceData.purchaseOrderId = invoiceFormData.selectedPurchaseOrderId;
        } else if (invoiceFormData.selectedChangeOrderId) {
          invoiceData.changeOrderId = invoiceFormData.selectedChangeOrderId;
        }
      } else {
        invoiceData.purchaseOrderId = invoiceFormData.selectedProgressPOId;
      }

      console.log('Sending invoice data:', invoiceData);
      
      let response;
      if (editingInvoice) {
        response = await put<{ success: boolean; data?: Invoice; error?: string }>(
          `/api/admin/project-subcontractors/${subcontractorId}/invoices/${editingInvoice.id}`,
          invoiceData
        );
      } else {
        response = await post<{ success: boolean; data?: Invoice; error?: string }>(
          `/api/admin/project-subcontractors/${subcontractorId}/invoices`,
          invoiceData
        );
      }
      
      console.log('Invoice save response:', response);
      
      if (!response.success) {
        const errorMsg = response.error || 'Failed to save invoice';
        console.log('Invoice save failed:', errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      await loadInvoices();
      setShowInvoiceForm(false);
      setEditingInvoice(null);
      setInvoiceFormData({
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        paymentType: hasDownPayment ? 'Progress Payment' : 'Advance Payment',
        downPayment: '',
        selectedPurchaseOrderId: null,
        selectedChangeOrderId: null,
        selectedProgressPOId: null,
        progressInvoiceAmount: '',
        vatAmount: '',
        downPaymentRecovery: '',
        advanceRecovery: '',
        retention: '',
        contraChargesAmount: '',
        contraChargesDescription: '',
      });
    } catch (submitError: any) {
      console.error('Failed to save invoice:', submitError);
      
      // Extract human-readable error message
      // The useAdminApi hook now includes the parsed error message in error.message
      const errorMessage = submitError?.message || 'Failed to save invoice. Please check all fields and try again.';
      
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [invoiceFormData, editingInvoice, subcontractorId, hasDownPayment, post, put, loadInvoices, calculateInvoiceAmounts]);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
    
    // For Progress Payment or Retention Release Payment, get the PO from the invoice
    let progressPOId: number | null = null;
    if ((invoice.paymentType === 'Progress Payment' || invoice.paymentType === 'Retention Release Payment') && invoice.purchaseOrderId) {
      progressPOId = invoice.purchaseOrderId;
    }
    
    setInvoiceFormData({
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: formatDateForInput(invoice.invoiceDate) || '',
      dueDate: invoice.dueDate ? formatDateForInput(invoice.dueDate) : '',
      paymentType: invoice.paymentType as 'Advance Payment' | 'Progress Payment' | 'Retention Release Payment',
      downPayment: invoice.downPayment?.toString() || '',
      selectedPurchaseOrderId: (invoice.paymentType === 'Advance Payment' && invoice.purchaseOrderId) ? invoice.purchaseOrderId : null,
      selectedChangeOrderId: (invoice.paymentType === 'Advance Payment' && invoice.changeOrderId) ? invoice.changeOrderId : null,
      selectedProgressPOId: (invoice.paymentType === 'Progress Payment' || invoice.paymentType === 'Retention Release Payment') ? progressPOId : null,
      progressInvoiceAmount: (invoice.paymentType === 'Progress Payment' || invoice.paymentType === 'Retention Release Payment') ? invoice.invoiceAmount?.toString() || '' : '',
      vatAmount: invoice.vatAmount?.toString() || '',
      downPaymentRecovery: invoice.downPaymentRecovery?.toString() || '',
      advanceRecovery: invoice.advanceRecovery?.toString() || '',
      retention: invoice.retention?.toString() || '',
      contraChargesAmount: invoice.contraChargesAmount?.toString() || '',
      contraChargesDescription: invoice.contraChargesDescription || '',
    });
  }, []);

  const handleDeleteInvoice = useCallback(
    async (invoiceId: number, invoiceNumber: string) => {
      if (!confirm(`Delete Invoice ${invoiceNumber}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-subcontractors/${subcontractorId}/invoices/${invoiceId}`);
        await loadInvoices();
      } catch (deleteError: any) {
        console.error('Failed to delete invoice:', deleteError);
        setError(deleteError?.message || 'Failed to delete invoice.');
      }
    },
    [del, subcontractorId, loadInvoices]
  );

  // Helper function to get validation errors (user-friendly messages)
  const getPaymentValidationErrors = useCallback(() => {
    const errors: string[] = [];
    const selectedInvoiceIds = paymentFormData.selectedInvoiceIds || [];
    
    if (selectedInvoiceIds.length === 0) {
      errors.push('Please select at least one invoice to pay.');
    }

    if (!paymentFormData.paymentDate) {
      errors.push(`Please select a ${paymentFormData.paymentMethod === 'Current Dated' ? 'payment date' : 'issue date'}.`);
    }

    if (paymentFormData.paymentMethod === 'Post Dated') {
      if (!paymentFormData.paymentType) {
        errors.push('Please select a payment type (PDC, LC, or Trust Receipt).');
      }
      if (!paymentFormData.dueDate) {
        errors.push('Please select a due date for the post-dated payment.');
      }
    }

    // Validate each selected invoice has payment amount
    const missingAmounts: string[] = [];
    for (const invoiceId of selectedInvoiceIds) {
      const invoicePayment = paymentFormData.invoicePayments[invoiceId];
      if (!invoicePayment || !invoicePayment.paymentAmount || parseFloat(invoicePayment.paymentAmount) <= 0) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        missingAmounts.push(invoice?.invoiceNumber || `Invoice ${invoiceId}`);
      }
    }
    
    if (missingAmounts.length > 0) {
      errors.push(`Please enter payment amounts for: ${missingAmounts.join(', ')}`);
    }

    return errors;
  }, [paymentFormData, invoices]);

  const handleSavePayment = useCallback(async () => {
    console.log('handleSavePayment called with:', paymentFormData);
    
    // Get all validation errors
    const validationErrors = getPaymentValidationErrors();
    
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join('\n• ');
      const fullMsg = 'Please fix the following errors:\n\n• ' + errorMsg;
      console.log('Validation failed:', fullMsg);
      setError(errorMsg);
      alert(fullMsg);
      return;
    }


    console.log('All validations passed, proceeding with save...');
    setIsSaving(true);
    setError(null);

    try {
      // Build invoice payments array
      const invoicePayments = (paymentFormData.selectedInvoiceIds || []).map(invoiceId => {
        const invoicePayment = paymentFormData.invoicePayments[invoiceId];
        return {
          invoiceId,
          paymentAmount: invoicePayment.paymentAmount,
          vatAmount: invoicePayment.vatAmount || '0',
        };
      });

      console.log('Invoice payments array:', invoicePayments);

      const paymentData: any = {
        invoicePayments,
        paymentMethod: paymentFormData.paymentMethod,
        paymentType: paymentFormData.paymentMethod === 'Post Dated' ? paymentFormData.paymentType : null,
        paymentDate: paymentFormData.paymentDate,
        dueDate: paymentFormData.paymentMethod === 'Post Dated' ? paymentFormData.dueDate : null,
        liquidated: paymentFormData.paymentMethod === 'Post Dated' ? paymentFormData.liquidated : false,
        notes: paymentFormData.notes || null,
      };

      console.log('Sending payment data:', paymentData);

      let response;
      if (editingPayment) {
        console.log('Updating payment:', editingPayment.id);
        response = await put<{ success: boolean; data?: Payment; error?: string }>(
          `/api/admin/project-subcontractors/${subcontractorId}/payments/${editingPayment.id}`,
          paymentData
        );
      } else {
        console.log('Creating new payment');
        response = await post<{ success: boolean; data?: Payment; error?: string }>(
          `/api/admin/project-subcontractors/${subcontractorId}/payments`,
          paymentData
        );
      }

      console.log('Payment save response:', response);

      if (!response.success) {
        const errorMsg = response.error || 'Failed to save payment';
        console.error('Payment save failed:', errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      console.log('Payment saved successfully');
      // Reload both payments and invoices to update status and summary cards
      await Promise.all([loadPayments(), loadInvoices()]);
      setShowPaymentForm(false);
      setEditingPayment(null);
      setPaymentFormData({
        selectedInvoiceIds: [],
        invoicePayments: {},
        paymentMethod: 'Current Dated',
        paymentType: null,
        paymentDate: '',
        dueDate: '',
        liquidated: false,
        notes: '',
      });
    } catch (submitError: any) {
      console.error('Failed to save payment - exception:', submitError);
      const errorMsg = submitError?.response?.data?.error || submitError?.error || submitError?.message || 'Failed to save payment.';
      console.error('Error message:', errorMsg);
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [paymentFormData, editingPayment, subcontractorId, invoices, post, put, loadPayments, loadInvoices]);

  const handleEditPayment = useCallback((payment: Payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
    
    // Build invoice payments object from payment.paymentInvoices
    const invoicePayments: Record<number, { paymentAmount: string; vatAmount: string }> = {};
    const selectedInvoiceIds: number[] = [];
    
    payment.paymentInvoices?.forEach(pi => {
      selectedInvoiceIds.push(pi.invoiceId);
      invoicePayments[pi.invoiceId] = {
        paymentAmount: pi.paymentAmount.toString(),
        vatAmount: (pi.vatAmount || 0).toString(),
      };
    });
    
    setPaymentFormData({
      selectedInvoiceIds,
      invoicePayments,
      paymentMethod: payment.paymentMethod as 'Post Dated' | 'Current Dated',
      paymentType: payment.paymentType as 'PDC' | 'LC' | 'Trust Receipt' | null,
      paymentDate: formatDateForInput(payment.paymentDate),
      dueDate: payment.dueDate ? formatDateForInput(payment.dueDate) : '',
      liquidated: payment.liquidated || false,
      notes: payment.notes || '',
    });
  }, []);

  const handleToggleLiquidated = useCallback(
    async (payment: Payment) => {
      // Only allow toggling for Post Dated payments
      if (payment.paymentMethod !== 'Post Dated') {
        return;
      }

      const newLiquidatedStatus = !payment.liquidated;
      
      try {
        // Build invoice payments array from existing payment
        const invoicePayments = payment.paymentInvoices?.map(pi => ({
          invoiceId: pi.invoiceId,
          paymentAmount: Number(pi.paymentAmount),
          vatAmount: Number(pi.vatAmount || 0),
        })) || [];

        // Format dates for API (convert to input format YYYY-MM-DD)
        const paymentDateFormatted = formatDateForInput(payment.paymentDate);
        const dueDateFormatted = payment.dueDate ? formatDateForInput(payment.dueDate) : null;

        // Update only the liquidated field
        await put<{ success: boolean; data?: Payment; error?: string }>(
          `/api/admin/project-subcontractors/${subcontractorId}/payments/${payment.id}`,
          {
            invoicePayments,
            paymentMethod: payment.paymentMethod,
            paymentType: payment.paymentType,
            paymentDate: paymentDateFormatted,
            dueDate: dueDateFormatted,
            liquidated: newLiquidatedStatus,
            notes: payment.notes || null,
          }
        );

        // Reload both payments and invoices to update status and summary cards
        await Promise.all([loadPayments(), loadInvoices()]);
      } catch (toggleError: any) {
        console.error('Failed to toggle liquidated status:', toggleError);
        setError(toggleError?.message || 'Failed to update liquidated status.');
        alert(`Failed to update liquidated status: ${toggleError?.message || 'Unknown error'}`);
      }
    },
    [put, subcontractorId, loadPayments, loadInvoices]
  );

  const handleDeletePayment = useCallback(
    async (paymentId: number, invoiceNumber: string) => {
      if (!confirm(`Delete payment for invoice ${invoiceNumber}?`)) {
        return;
      }

      try {
        await del(`/api/admin/project-subcontractors/${subcontractorId}/payments/${paymentId}`);
        // Reload both payments and invoices to update status and summary cards
        await Promise.all([loadPayments(), loadInvoices()]);
      } catch (deleteError: any) {
        console.error('Failed to delete payment:', deleteError);
        setError(deleteError?.message || 'Failed to delete payment.');
      }
    },
    [del, subcontractorId, loadPayments, loadInvoices]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: colors.primary }}
        />
        <p style={{ color: colors.textSecondary }}>Loading subcontractor details…</p>
      </div>
    );
  }

  if (!projectSubcontractor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p style={{ color: colors.error }}>Subcontractor not found</p>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const subcontractor = projectSubcontractor.subcontractor;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
        <button
          onClick={onBack}
          className="hover:underline"
          style={{ color: colors.primary }}
        >
          Subcontractors
        </button>
        <ChevronRight className="h-4 w-4" />
        <span style={{ color: colors.textPrimary }}>{subcontractor.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {subcontractor.name}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Subcontractor Details
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: `${colors.error}15`,
            borderColor: `${colors.error}45`,
            color: colors.error,
          }}
        >
          {error}
        </div>
      )}

      {/* Subcontractor Information */}
      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
        }}
      >
        <h2 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
          Subcontractor Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Subcontractor Name
            </label>
            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
              {subcontractor.name}
            </p>
          </div>
          {subcontractor.vendorCode && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Vendor Code
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {subcontractor.vendorCode}
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Type
            </label>
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              {subcontractor.type}
            </p>
          </div>
          {subcontractor.contactPerson && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Contact Person
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {subcontractor.contactPerson}
              </p>
            </div>
          )}
          {subcontractor.contactNumber && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Contact Number
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {subcontractor.contactNumber}
              </p>
            </div>
          )}
          {subcontractor.email && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Email
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {subcontractor.email}
              </p>
            </div>
          )}
        </div>

        {subcontractor.typeOfWorks && subcontractor.typeOfWorks.length > 0 && (
          <div className="mt-6">
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
              Type of Works
            </label>
            <div className="flex flex-wrap gap-2">
              {subcontractor.typeOfWorks.map((link) => (
                <span
                  key={link.typeOfWork.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.textPrimary,
                  }}
                >
                  <Tag className="h-3 w-3" style={{ color: colors.textSecondary }} />
                  {link.typeOfWork.name}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* Subcontract Agreement Section */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold" style={{ color: colors.textPrimary }}>
              Subcontract Agreement
            </label>
            {!isEditingAgreement && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => setIsEditingAgreement(true)}
              >
                {projectSubcontractor.subcontractAgreementDocumentUrl ? 'Edit' : 'Add Document'}
              </Button>
            )}
          </div>
          
          {!isEditingAgreement ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Agreement Status:
                </span>
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  {projectSubcontractor.subcontractAgreement ? 'Yes' : 'No'}
                </span>
              </div>
              {projectSubcontractor.subcontractAgreementDocumentUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                  <File className="h-5 w-5" style={{ color: colors.primary }} />
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<File className="h-4 w-4" />}
                    onClick={() => window.open(`/view-document?url=${encodeURIComponent(projectSubcontractor.subcontractAgreementDocumentUrl!)}`, '_blank')}
                  >
                    View Agreement Document
                  </Button>
                </div>
              ) : projectSubcontractor.subcontractAgreement ? (
                <p className="text-sm text-yellow-600" style={{ color: colors.warning }}>
                  No document uploaded yet. Click "Add Document" to upload the agreement.
                </p>
              ) : (
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  No subcontract agreement for this subcontractor.
                </p>
              )}
          </div>
          ) : (
            <div className="space-y-4">
              {tempAgreementDocumentUrl ? (
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5" style={{ color: colors.success }} />
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      Document ready to save
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempAgreementDocumentUrl(null);
                      setEditingAgreementFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : editingAgreementFile ? (
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                  <span className="text-sm" style={{ color: colors.textPrimary }}>
                    {editingAgreementFile.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={uploadingAgreementDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      onClick={async () => {
                        if (!editingAgreementFile) {
                          setError('No file selected');
                          return;
                        }
                        
                        setUploadingAgreementDocument(true);
                        setError(null);
                        
                        try {
                          console.log('Starting upload for file:', editingAgreementFile.name);
                          const formData = new FormData();
                          formData.append('file', editingAgreementFile);
                          formData.append('folder', 'pmp-reports/subcontract-agreements');
                          
                          const response = await fetch('/api/admin/media-library', {
                            method: 'POST',
                            body: formData,
                          });
                          
                          const result = await response.json();
                          console.log('Upload response:', result);
                          
                          if (result.success && result.data?.publicUrl) {
                            console.log('Upload successful. URL:', result.data.publicUrl);
                            setTempAgreementDocumentUrl(result.data.publicUrl);
                            setError(null);
                          } else {
                            const errorMsg = result.message || result.error || 'Failed to upload document';
                            console.error('Upload failed:', errorMsg);
                            setError(errorMsg);
                          }
                        } catch (uploadError: any) {
                          console.error('Upload error:', uploadError);
                          setError(uploadError.message || 'Failed to upload document. Please try again.');
                        } finally {
                          setUploadingAgreementDocument(false);
                        }
                      }}
                      disabled={uploadingAgreementDocument || !editingAgreementFile}
                      isLoading={uploadingAgreementDocument}
                    >
                      {uploadingAgreementDocument ? 'Uploading...' : 'Upload Document'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAgreementFile(null);
                      }}
                      disabled={uploadingAgreementDocument}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
                    uploadingAgreementDocument ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
                  }`}
                  style={{
                    borderColor: colors.borderLight,
                    backgroundColor: colors.backgroundPrimary,
                  }}
                  onDragOver={(e) => {
                    if (!uploadingAgreementDocument) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];
                      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                      if (!validTypes.includes(file.type)) {
                        setError('Please upload a PDF or Word document');
                        return;
                      }
                      if (file.size > 50 * 1024 * 1024) {
                        setError('File size must be less than 50MB');
                        return;
                      }
                      
                      setEditingAgreementFile(file);
                      setError(null);
                      
                      // Auto-upload the file
                      setUploadingAgreementDocument(true);
                      try {
                        console.log('Auto-uploading dropped file:', file.name);
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('folder', 'pmp-reports/subcontract-agreements');
                        
                        const response = await fetch('/api/admin/media-library', {
                          method: 'POST',
                          body: formData,
                        });
                        
                        const result = await response.json();
                        console.log('Auto-upload response:', result);
                        
                        if (result.success && result.data?.publicUrl) {
                          console.log('Auto-upload successful. URL:', result.data.publicUrl);
                          setTempAgreementDocumentUrl(result.data.publicUrl);
                          setError(null);
                        } else {
                          const errorMsg = result.message || result.error || 'Failed to upload document';
                          console.error('Auto-upload failed:', errorMsg);
                          setError(errorMsg);
                        }
                      } catch (uploadError: any) {
                        console.error('Auto-upload error:', uploadError);
                        setError(uploadError.message || 'Failed to upload document. Please try again.');
                      } finally {
                        setUploadingAgreementDocument(false);
                      }
                    }
                  }}
                >
                  <input
                    type="file"
                    id="agreement-document-upload-edit"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                        if (!validTypes.includes(file.type)) {
                          setError('Please upload a PDF or Word document');
                          return;
                        }
                        if (file.size > 50 * 1024 * 1024) {
                          setError('File size must be less than 50MB');
                          return;
                        }
                        
                        setEditingAgreementFile(file);
                        setError(null);
                        
                        // Auto-upload the file
                        setUploadingAgreementDocument(true);
                        try {
                          console.log('Auto-uploading file:', file.name);
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('folder', 'pmp-reports/subcontract-agreements');
                          
                          const response = await fetch('/api/admin/media-library', {
                            method: 'POST',
                            body: formData,
                          });
                          
                          const result = await response.json();
                          console.log('Auto-upload response:', result);
                          
                          if (result.success && result.data?.publicUrl) {
                            console.log('Auto-upload successful. URL:', result.data.publicUrl);
                            setTempAgreementDocumentUrl(result.data.publicUrl);
                            setError(null);
                          } else {
                            const errorMsg = result.message || result.error || 'Failed to upload document';
                            console.error('Auto-upload failed:', errorMsg);
                            setError(errorMsg);
                          }
                        } catch (uploadError: any) {
                          console.error('Auto-upload error:', uploadError);
                          setError(uploadError.message || 'Failed to upload document. Please try again.');
                        } finally {
                          setUploadingAgreementDocument(false);
                        }
                      }
                    }}
                    disabled={uploadingAgreementDocument}
                  />
                  <label
                    htmlFor="agreement-document-upload-edit"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    {uploadingAgreementDocument ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary }} />
                        <span className="text-sm font-medium" style={{ color: colors.primary }}>
                          Uploading document...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8" style={{ color: colors.textSecondary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          Choose file or drag and drop (PDF or Word, max 50MB)
                        </span>
                      </>
                    )}
                  </label>
          </div>
        )}
              
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (!tempAgreementDocumentUrl && !projectSubcontractor.subcontractAgreementDocumentUrl) {
                      setError('Please upload a document first');
                      return;
                    }
                    
                    setIsSaving(true);
                    setError(null);
                    
                    try {
                      const updateData: any = {
                        subcontractAgreement: true,
                        subcontractAgreementDocumentUrl: tempAgreementDocumentUrl || projectSubcontractor.subcontractAgreementDocumentUrl,
                      };
                      
                      const response = await put<{ success: boolean; data?: ProjectSubcontractor; error?: string }>(
                        `/api/admin/project-subcontractors/${projectSubcontractor.id}`,
                        updateData
                      );
                      
                      if (!response?.success) {
                        throw new Error(response?.error || 'Failed to update agreement document');
                      }
                      
                      // Update local state
                      if (response.data) {
                        setProjectSubcontractor({
                          ...projectSubcontractor,
                          ...response.data,
                        });
                      }
                      
                      setIsEditingAgreement(false);
                      setTempAgreementDocumentUrl(null);
                      setEditingAgreementFile(null);
                      setError(null);
                    } catch (updateError: any) {
                      console.error('Failed to update agreement:', updateError);
                      setError(updateError?.message || 'Failed to update agreement document');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || uploadingAgreementDocument || (!tempAgreementDocumentUrl && !projectSubcontractor.subcontractAgreementDocumentUrl)}
                  isLoading={isSaving}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingAgreement(false);
                    setTempAgreementDocumentUrl(null);
                    setEditingAgreementFile(null);
                    setError(null);
                  }}
                  disabled={isSaving || uploadingAgreementDocument}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* PO Filter - Above Summary Cards */}
      <Card
        className="p-4 mb-6 transition-all duration-200"
        style={{
          backgroundColor: poFilterId ? `${colors.primary}08` : colors.backgroundSecondary,
          borderColor: poFilterId ? `${colors.primary}30` : colors.borderLight,
          borderWidth: poFilterId ? '1.5px' : '1px',
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 transition-colors" style={{ color: poFilterId ? colors.primary : colors.textSecondary }} />
            <h3 className="text-base font-semibold transition-colors" style={{ color: poFilterId ? colors.primary : colors.textPrimary }}>
              Filter by Purchase Order
            </h3>
            {poFilterId && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
              }}>
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={poFilterId || ''}
              onChange={(e) => setPoFilterId(e.target.value ? parseInt(e.target.value) : null)}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: poFilterId ? `${colors.primary}40` : colors.borderLight,
                color: colors.textPrimary,
                outline: 'none',
                minWidth: '250px',
                boxShadow: poFilterId ? `0 0 0 3px ${colors.primary}15` : 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${colors.primary}60`;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = poFilterId ? `${colors.primary}40` : colors.borderLight;
                e.target.style.boxShadow = poFilterId ? `0 0 0 3px ${colors.primary}15` : 'none';
              }}
            >
              <option value="">All Purchase Orders</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                </option>
              ))}
            </select>
            {poFilterId && (() => {
              const selectedPO = purchaseOrders.find(po => po.id === poFilterId);
              return (
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: `${colors.primary}12`,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}25`,
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{selectedPO?.lpoNumber || 'Unknown PO'}</span>
                  <button
                    onClick={() => setPoFilterId(null)}
                    className="ml-1 hover:bg-white/20 rounded p-0.5 transition-all duration-200"
                    style={{ color: colors.primary }}
                    title="Clear filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </Card>

      {/* Payment Summary Cards - Available for all tabs */}
      {(() => {
        // Filter data by PO if filter is set
        const filteredPurchaseOrders = poFilterId 
          ? purchaseOrders.filter(po => po.id === poFilterId)
          : purchaseOrders;

        const filteredInvoices = poFilterId
          ? invoices.filter(invoice => invoice.purchaseOrderId === poFilterId)
          : invoices;

        const filteredPayments = poFilterId
          ? payments.filter(payment => {
              // Check if any invoice in this payment belongs to the selected PO
              return payment.paymentInvoices?.some(pi => {
                const invoice = pi.invoice;
                if (!invoice) return false;
                return invoice.purchaseOrderId === poFilterId;
              });
            })
          : payments;

        // Calculate Total Invoiced (sum of all invoice totalAmount) - filtered
        const totalInvoiced = filteredInvoices.reduce((sum, invoice) => {
          return sum + Number(invoice.totalAmount || 0);
        }, 0);

        // Calculate Total Paid - sum of payments for invoices with status "paid" - filtered
        const totalPaid = filteredInvoices.reduce((sum, invoice) => {
          const invoiceStatus = getInvoiceStatus(invoice);
          // Only count payments for invoices with status "paid"
          if (invoiceStatus === 'paid' && invoice.paymentInvoices && invoice.paymentInvoices.length > 0) {
            const paidForInvoice = invoice.paymentInvoices.reduce((invoiceSum, pi) => {
              return invoiceSum + Number(pi.paymentAmount || 0) + Number(pi.vatAmount || 0);
            }, 0);
            return sum + paidForInvoice;
          }
          return sum;
        }, 0);

        // Calculate Committed Payments - Post Dated payments that are not yet liquidated (from DB) - filtered
        const committedPayments = filteredPayments.reduce((sum, payment) => {
          // Only count Post Dated payments where liquidated is explicitly false or null (not yet liquidated)
          // Handle both false and null cases (null means not set/not liquidated yet)
          const isNotLiquidated = payment.liquidated === false || payment.liquidated === null;
          if (payment.paymentMethod === 'Post Dated' && isNotLiquidated) {
            return sum + Number(payment.totalPaymentAmount || 0) + Number(payment.totalVatAmount || 0);
          }
          return sum;
        }, 0);

        // Calculate Balance to be Paid - only from invoices that are not fully paid - filtered
        const paidAmountsFromDBForBalance = calculatePaidAmountsFromInvoices(filteredInvoices);
        const balanceToBePaid = filteredInvoices.reduce((sum, invoice) => {
          const paid = paidAmountsFromDBForBalance[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
          const totalPaidForInvoice = paid.paymentAmount + paid.vatAmount;
          const invoiceTotal = Number(invoice.totalAmount || 0);
          const remaining = invoiceTotal - totalPaidForInvoice;
          // Only add if there's still a balance to be paid (not fully paid)
          return sum + (remaining > 0 ? remaining : 0);
        }, 0);

        // Calculate PO Amounts separately (without VAT) - filtered
        const totalPOAmountsWithoutVat = filteredPurchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0);
          }, 0);

        // Calculate PO Amounts separately (with VAT) - filtered
        const totalPOAmountsWithVat = filteredPurchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValueWithVat || 0);
        }, 0);

        // Calculate CO Amounts separately (without VAT) - filtered
        const totalCOAmountsWithoutVat = filteredPurchaseOrders.reduce((sum, po) => {
          const poChangeOrders = changeOrders[po.id] || [];
          poChangeOrders.forEach((co) => {
            if (co.type === 'addition') {
              sum += Number(co.amount || 0);
            } else if (co.type === 'omission') {
              sum -= Number(co.amount || 0);
            }
          });
          return sum;
        }, 0);
        
        // Calculate CO Amounts separately (with VAT) - filtered
        const totalCOAmountsWithVat = filteredPurchaseOrders.reduce((sum, po) => {
          const poChangeOrders = changeOrders[po.id] || [];
          poChangeOrders.forEach((co) => {
            if (co.type === 'addition') {
              sum += Number(co.amountWithVat || (co.amount + (co.vatAmount || 0)) || 0);
            } else if (co.type === 'omission') {
              sum -= Number(co.amountWithVat || (co.amount + (co.vatAmount || 0)) || 0);
            }
          });
          return sum;
        }, 0);
        
        // Calculate Total without VAT (PO + CO before VAT)
        const totalAmountWithoutVat = totalPOAmountsWithoutVat + totalCOAmountsWithoutVat;
        
        // Calculate Total Contract Amount (PO + CO with VAT)
        const totalContractAmount = totalPOAmountsWithVat + totalCOAmountsWithVat;
        
        // Calculate VAT Amount = Total with VAT - Total without VAT
        const totalVatAmount = totalContractAmount - totalAmountWithoutVat;

        // Calculate LPO Balance: Total Contract amount (PO + CO with VAT) - Total Invoiced (with VAT) - Contra Charges with VAT - filtered
        // This represents the remaining contract amount that hasn't been invoiced yet
        const totalInvoicedForBalance = filteredInvoices.reduce((sum, invoice) => {
          return sum + Number(invoice.totalAmount || 0); // totalAmount includes VAT
        }, 0);
        
        // Calculate total contra charges from all invoices (filtered)
        const totalContraCharges = filteredInvoices.reduce((sum, invoice) => {
          return sum + Number(invoice.contraChargesAmount || 0);
        }, 0);
        
        // Calculate contra charges with VAT
        const contraChargesWithVat = totalContraCharges * vatMultiplier;
        
        // LPO Balance = Total Contract Amount - Total Invoiced - Contra Charges with VAT
        const lpoBalance = totalContractAmount - totalInvoicedForBalance - contraChargesWithVat;

        // Calculate Due Amount (invoices past due date)
        // Use invoice data directly from DB, not payments state
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate paid amounts from invoice data (from DB) - filtered
        const paidAmountsFromDB = calculatePaidAmountsFromInvoices(filteredInvoices);
        
        const dueAmount = filteredInvoices.reduce((sum, invoice) => {
          if (!invoice.dueDate) return sum;
          
          const dueDate = new Date(invoice.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // Check if invoice is past due date
          if (dueDate < today) {
            // Calculate remaining balance for this invoice using DB data
            const paid = paidAmountsFromDB[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
            const totalPaidForInvoice = paid.paymentAmount + paid.vatAmount;
            const remaining = Number(invoice.totalAmount || 0) - totalPaidForInvoice;
            
            // Only add if there's still a balance to be paid
            return sum + (remaining > 0 ? remaining : 0);
          }
          
          return sum;
        }, 0);

        // Calculate Certified Amount - total of Progress Payment invoices only (excluding VAT, so invoiceAmount)
        const certifiedAmount = filteredInvoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);

        // Calculate Total PO + CO amounts before VAT
        const totalPOAndCOAmountsBeforeVat = filteredPurchaseOrders.reduce((sum, po) => {
          // Start with PO amount before VAT (lpoValue)
          let poAmount = Number(po.lpoValue || 0);
          
          // Add Change Orders amounts before VAT
          const poChangeOrders = changeOrders[po.id] || [];
          poChangeOrders.forEach((co) => {
            if (co.type === 'addition') {
              poAmount += Number(co.amount || 0);
            } else if (co.type === 'omission') {
              poAmount -= Number(co.amount || 0);
            }
          });
          
          return sum + poAmount;
        }, 0);

        // Calculate Balance to Certify = (PO + COs before VAT) - Certified Amount
        const balanceToCertify = totalPOAndCOAmountsBeforeVat - certifiedAmount;

        // Calculate Total Advance Payments (for all filtered POs)
        const totalAdvancePayments = filteredInvoices
          .filter(invoice => invoice.paymentType === 'Advance Payment')
          .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);

        // Calculate Total Advance Recoveries from Progress Payment invoices (for all filtered POs)
        const totalAdvanceRecoveries = filteredInvoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.advanceRecovery || 0), 0);

        // Calculate Remaining AP Recovery = Total Advance Payments - Total Advance Recoveries
        const remainingAPRecovery = totalAdvancePayments - totalAdvanceRecoveries;

        // Calculate Total Retention Held from Progress Payment invoices (for all filtered POs)
        const totalRetentionHeld = filteredInvoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.retention || 0), 0);

        // Calculate Total Contra Charges from Progress Payment invoices (for all filtered POs)
        const totalContraChargesForCertified = filteredInvoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.contraChargesAmount || 0), 0);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card
              className="p-4"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.borderLight,
              }}
            >
              <div className="space-y-3">
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    PO Amounts
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalPOAmountsWithoutVat)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Without VAT
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    CO Amounts
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalCOAmountsWithoutVat)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Without VAT
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalAmountWithoutVat)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    PO + CO (Without VAT)
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    VAT Amount
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.primary }}>
                    {formatCurrencyWithDecimals(totalVatAmount)}
                  </p>
                </div>
                
                <div className="pt-1">
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Contract Amount
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.primary }}>
                    {formatCurrencyWithDecimals(totalContractAmount)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    With VAT
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.borderLight,
              }}
            >
              <div className="space-y-4">
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Invoiced
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalInvoiced)}
                  </p>
                </div>
                
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Due Amount
                  </p>
                  <p className="text-lg font-bold" style={{ color: dueAmount > 0 ? colors.error : colors.success }}>
                    {formatCurrencyWithDecimals(dueAmount)}
                  </p>
                  {dueAmount > 0 && (
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      Past due date
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    LPO Balance
                  </p>
                  <p className="text-lg font-bold" style={{ color: lpoBalance > 0 ? colors.warning : colors.success }}>
                    {formatCurrencyWithDecimals(lpoBalance)}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.borderLight,
              }}
            >
              <div className="space-y-4">
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Paid
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.success }}>
                    {formatCurrencyWithDecimals(totalPaid)}
                  </p>
                </div>
                
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Committed Payments
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.warning }}>
                    {formatCurrencyWithDecimals(committedPayments)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Balance to be Paid
                  </p>
                  <p className="text-lg font-bold" style={{ color: balanceToBePaid > 0 ? colors.warning : colors.success }}>
                    {formatCurrencyWithDecimals(balanceToBePaid)}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.borderLight,
              }}
            >
              <div className="space-y-3">
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Certified Amount
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(certifiedAmount)}
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Balance to Certify
                  </p>
                  <p className="text-base font-bold" style={{ color: balanceToCertify > 0 ? colors.warning : colors.success }}>
                    {formatCurrencyWithDecimals(balanceToCertify)}
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Balance AP Recovery
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(remainingAPRecovery)}
                  </p>
                </div>
                
                <div className="pb-2 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Retention Held
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalRetentionHeld)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Contra Charges
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalContraChargesForCertified)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Contract Value - Tabbed Interface */}
      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Contract Value
          </h2>
          {activeTab === 'pos' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setShowPOForm(true);
              setEditingPO(null);
              setPOFormData({
                lpoNumber: '',
                lpoDate: '',
                lpoValue: '',
                vatPercent: '5',
                notes: '',
              });
            }}
          >
            Add PO
          </Button>
          )}
          {activeTab === 'changeOrders' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                if (purchaseOrders.length === 0) {
                  setError('Please add a Purchase Order first before adding Change Orders.');
                  return;
                }
                // Set the first PO as default for Change Order creation
                setShowChangeOrderForm(purchaseOrders[0].id);
                setEditingChangeOrder(null);
                setChangeOrderFormData({
                  chRefNo: '',
                  chDate: '',
                  type: 'addition',
                  amount: '',
                  vatPercent: vatPercent.toString(),
                  vatAmount: '',
                  description: '',
                });
              }}
            >
              Add CO
            </Button>
          )}
          {activeTab === 'invoices' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setShowInvoiceForm(true);
                setEditingInvoice(null);
                setError(null);
                setInvoiceFormData({
                  invoiceNumber: '',
                  invoiceDate: '',
                  dueDate: '',
                  paymentType: hasDownPayment ? 'Progress Payment' : 'Advance Payment',
                  downPayment: '',
                  selectedPurchaseOrderId: null,
                  selectedChangeOrderId: null,
                  selectedProgressPOId: null,
                  progressInvoiceAmount: '',
                  vatAmount: '',
                  downPaymentRecovery: '',
                  advanceRecovery: '',
                  retention: '',
                  contraChargesAmount: '',
                  contraChargesDescription: '',
                });
              }}
            >
              Add Invoice
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b mb-6" style={{ borderColor: colors.borderLight }}>
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pos')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'pos' ? colors.primary : 'transparent',
                color: activeTab === 'pos' ? colors.primary : colors.textSecondary,
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" style={{
                color: activeTab === 'pos' ? colors.primary : colors.textSecondary,
              }} />
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('changeOrders')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'changeOrders' ? colors.primary : 'transparent',
                color: activeTab === 'changeOrders' ? colors.primary : colors.textSecondary,
              }}
            >
              <FileText className="w-4 h-4 mr-2" style={{
                color: activeTab === 'changeOrders' ? colors.primary : colors.textSecondary,
              }} />
              Change Orders
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'invoices' ? colors.primary : 'transparent',
                color: activeTab === 'invoices' ? colors.primary : colors.textSecondary,
              }}
            >
              <Receipt className="w-4 h-4 mr-2" style={{
                color: activeTab === 'invoices' ? colors.primary : colors.textSecondary,
              }} />
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'payments' ? colors.primary : 'transparent',
                color: activeTab === 'payments' ? colors.primary : colors.textSecondary,
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" style={{
                color: activeTab === 'payments' ? colors.primary : colors.textSecondary,
              }} />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'performance' ? colors.primary : 'transparent',
                color: activeTab === 'performance' ? colors.primary : colors.textSecondary,
              }}
            >
              <Star className="w-4 h-4 mr-2" style={{
                color: activeTab === 'performance' ? colors.primary : colors.textSecondary,
              }} />
              Performance
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'pos' && (
          <>
        {showPOForm && (
          <Card
            className="p-4 mb-6"
            style={{
              backgroundColor: colors.backgroundPrimary,
              borderColor: colors.borderLight,
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {editingPO ? 'Edit Purchase Order' : 'Add Purchase Order'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowPOForm(false);
                    setEditingPO(null);
                    setPOFormData({
                      lpoNumber: '',
                      lpoDate: '',
                      lpoValue: '',
                      vatPercent: '5',
                      notes: '',
                    });
                  }}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                    LPO No. *
                  </label>
                  <Input
                    type="text"
                    value={poFormData.lpoNumber}
                    onChange={(e) => setPOFormData({ ...poFormData, lpoNumber: e.target.value })}
                    placeholder="Enter LPO Number"
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                    LPO Date *
                  </label>
                  <Input
                    type="date"
                    value={poFormData.lpoDate}
                    onChange={(e) => setPOFormData({ ...poFormData, lpoDate: e.target.value })}
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                    LPO Value (A) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={poFormData.lpoValue}
                    onChange={(e) => setPOFormData({ ...poFormData, lpoValue: e.target.value })}
                    placeholder="0.00"
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                    VAT % (B)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={poFormData.vatPercent}
                    onChange={(e) => setPOFormData({ ...poFormData, vatPercent: e.target.value })}
                    placeholder={vatPercent.toString()}
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Notes
                </label>
                <textarea
                  value={poFormData.notes}
                  onChange={(e) => setPOFormData({ ...poFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary,
                  }}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPOForm(false);
                    setEditingPO(null);
                    setPOFormData({
                      lpoNumber: '',
                      lpoDate: '',
                      lpoValue: '',
                      vatPercent: '5',
                      notes: '',
                    });
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSavePO}
                  isLoading={isSaving}
                  disabled={isSaving || !poFormData.lpoNumber || !poFormData.lpoDate || !poFormData.lpoValue}
                >
                  {editingPO ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ borderColor: colors.borderLight }}>
            <thead>
              <tr style={{ backgroundColor: `${colors.primary}20` }}>
                <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  LPO No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  LPO Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  LPO Value (A)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  VAT 5% (B)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  LPO Value with VAT (C)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Filter POs if filter is set
                const filteredPOs = poFilterId 
                  ? purchaseOrders.filter(po => po.id === poFilterId)
                  : purchaseOrders;
                
                return filteredPOs.length > 0 ? (
                  filteredPOs.map((po) => {
                  return (
                      <tr key={po.id} style={{ backgroundColor: `${colors.success}08` }}>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {po.lpoNumber}
                        </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {new Date(po.lpoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(Number(po.lpoValue))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {po.vatPercent}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                        </td>
                        <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPO(po)}
                              className="h-7 w-7"
                              style={{ color: colors.info }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePO(po.id, po.lpoNumber)}
                              className="h-7 w-7"
                              style={{ color: colors.error }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                      {poFilterId ? 'No purchase orders found for the selected filter.' : 'No purchase orders yet. Click "Add PO" to add one.'}
                  </td>
                </tr>
                );
              })()}
            </tbody>
          </table>
                              </div>
          </>
        )}

        {activeTab === 'changeOrders' && (
          <div className="space-y-6">
            {showChangeOrderForm && (
                                <Card
                className="p-4"
                                  style={{
                  backgroundColor: colors.backgroundPrimary,
                                    borderColor: colors.borderLight,
                                  }}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        {editingChangeOrder ? 'Edit CO' : 'Add CO'}
                    </h3>
                          <Button
                            variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setShowChangeOrderForm(null);
                                          setEditingChangeOrder(null);
                                          setChangeOrderFormData({
                                            chRefNo: '',
                                            chDate: '',
                                            type: 'addition',
                                            amount: '',
                                            vatPercent: vatPercent.toString(),
                                            vatAmount: '',
                                            description: '',
                                          });
                                        }}
                      className="h-7 w-7"
                                      >
                      <X className="h-4 w-4" />
                          </Button>
                                    </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                      Purchase Order *
                                        </label>
                    <select
                      value={showChangeOrderForm || ''}
                      onChange={(e) => setShowChangeOrderForm(Number(e.target.value))}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                                          style={{
                        backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                    >
                      <option value="">Select Purchase Order</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.lpoNumber}
                        </option>
                      ))}
                    </select>
                                      </div>
                  {showChangeOrderForm && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          CO Ref. No. *
                                        </label>
                                        <Input
                                          type="text"
                                          value={changeOrderFormData.chRefNo}
                                          onChange={(e) => setChangeOrderFormData({ ...changeOrderFormData, chRefNo: e.target.value })}
                                          placeholder="Enter CO Ref. No."
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          CO Date *
                                        </label>
                                        <Input
                                          type="date"
                                          value={changeOrderFormData.chDate}
                                          onChange={(e) => setChangeOrderFormData({ ...changeOrderFormData, chDate: e.target.value })}
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Type *
                                        </label>
                                        <select
                                          value={changeOrderFormData.type}
                                          onChange={(e) => setChangeOrderFormData({ ...changeOrderFormData, type: e.target.value as 'addition' | 'omission' })}
                                          className="w-full rounded-lg border px-3 py-2 text-sm"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        >
                                          <option value="addition">Addition</option>
                                          <option value="omission">Omission</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Amount *
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={changeOrderFormData.amount}
                                          onChange={(e) => {
                                            const amountValue = e.target.value;
                                            const calculatedVat = amountValue ? (parseFloat(amountValue) * (vatPercent / 100)) : 0;
                                            setChangeOrderFormData({ 
                                              ...changeOrderFormData, 
                                              amount: amountValue,
                                              vatAmount: calculatedVat.toFixed(2)
                                            });
                                          }}
                                          placeholder="0.00"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          VAT Amount *
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={changeOrderFormData.vatAmount}
                                          onChange={(e) => setChangeOrderFormData({ ...changeOrderFormData, vatAmount: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                          Auto-calculated from amount (VAT {vatPercent}%), editable
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Description
                                        </label>
                                        <Input
                                          type="text"
                                          value={changeOrderFormData.description}
                                          onChange={(e) => setChangeOrderFormData({ ...changeOrderFormData, description: e.target.value })}
                                          placeholder="Enter description (optional)"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Amount with VAT
                                        </label>
                                        <div className="p-2 rounded-lg border" style={{
                              backgroundColor: colors.backgroundPrimary,
                                            borderColor: colors.borderLight,
                                          }}>
                                          <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                                            {(() => {
                                              const amount = parseFloat(changeOrderFormData.amount) || 0;
                                              const vat = parseFloat(changeOrderFormData.vatAmount) || 0;
                                              return formatCurrencyWithDecimals(amount + vat);
                                            })()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                <Button
                                        variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                          setShowChangeOrderForm(null);
                                    setEditingChangeOrder(null);
                                    setChangeOrderFormData({
                                      chRefNo: '',
                                      chDate: '',
                                      type: 'addition',
                                      amount: '',
                                      vatPercent: vatPercent.toString(),
                                      vatAmount: '',
                                      description: '',
                                    });
                                  }}
                                        disabled={isSaving}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="primary"
                                        size="sm"
                          leftIcon={<Save className="h-4 w-4" />}
                          onClick={() => showChangeOrderForm && handleSaveChangeOrder(showChangeOrderForm)}
                                        isLoading={isSaving}
                          disabled={isSaving || !showChangeOrderForm || !changeOrderFormData.chRefNo || !changeOrderFormData.chDate || !changeOrderFormData.amount}
                                      >
                                        {editingChangeOrder ? 'Update' : 'Save'}
                                </Button>
                              </div>
                    </>
                  )}
                                  </div>
                                </Card>
                              )}

                              <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ borderColor: colors.borderLight }}>
                                  <thead>
                  <tr style={{ backgroundColor: `${colors.primary}20` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      PO No.
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        CO Ref. No.
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        CO Date
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Type
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Amount (Excl. VAT)
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        VAT Amount
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Amount (Incl. VAT)
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Description
                                      </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                  {Object.keys(changeOrders).length > 0 ? (() => {
                    // Filter Change Orders by selected PO if filter is set
                    const filteredEntries = poFilterId 
                      ? Object.entries(changeOrders).filter(([poId]) => Number(poId) === poFilterId)
                      : Object.entries(changeOrders);
                    
                    if (filteredEntries.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                            {poFilterId ? 'No Change Orders found for the selected PO.' : 'No Change Orders yet. Click "Add CO" to add one.'}
                          </td>
                        </tr>
                      );
                    }
                    
                    return filteredEntries.map(([poId, poChangeOrders]) => {
                      const po = purchaseOrders.find(p => p.id === Number(poId));
                      return poChangeOrders.map((changeOrder) => (
                                        <tr key={changeOrder.id} style={{ backgroundColor: `${colors.info}08` }}>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                            {po?.lpoNumber || '-'}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {changeOrder.chRefNo}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {new Date(changeOrder.chDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                              changeOrder.type === 'addition' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                              {changeOrder.type === 'addition' ? 'Addition' : 'Omission'}
                                            </span>
                                          </td>
                          <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {formatCurrencyWithDecimals(Number(changeOrder.amount || 0))}
                                          </td>
                          <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.primary }}>
                                            {formatCurrencyWithDecimals(Number(changeOrder.vatAmount || 0))}
                                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {formatCurrencyWithDecimals(Number(changeOrder.amountWithVat || (changeOrder.amount + (changeOrder.vatAmount || 0)) || 0))}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {changeOrder.description || '-'}
                                          </td>
                          <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                            <div className="flex items-center justify-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditChangeOrder(changeOrder)}
                                className="h-7 w-7"
                                                style={{ color: colors.info }}
                                              >
                                <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                onClick={() => handleDeleteChangeOrder(changeOrder.purchaseOrderId, changeOrder.id, changeOrder.chRefNo)}
                                className="h-7 w-7"
                                                style={{ color: colors.error }}
                                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                      ));
                    }).flat();
                  })() : (
                                      <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                                          No Change Orders yet. Click "Add CO" to add one.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {showInvoiceForm && (
                                <Card
                className="p-4"
                                  style={{
                  backgroundColor: colors.backgroundPrimary,
                                    borderColor: colors.borderLight,
                                  }}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {editingInvoice ? 'Edit Invoice' : 'Add Invoice'}
                    </h3>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                        setShowInvoiceForm(false);
                        setEditingInvoice(null);
                        setError(null);
                        setInvoiceFormData({
                                            invoiceNumber: '',
                                            invoiceDate: '',
                          dueDate: '',
                          paymentType: hasDownPayment ? 'Progress Payment' : 'Advance Payment',
                          downPayment: '',
                          selectedPurchaseOrderId: null,
                          selectedChangeOrderId: null,
                          selectedProgressPOId: null,
                          progressInvoiceAmount: '',
                          vatAmount: '',
                          downPaymentRecovery: '',
                          advanceRecovery: '',
                          retention: '',
                          contraChargesAmount: '',
                          contraChargesDescription: '',
                                          });
                                        }}
                      className="h-7 w-7"
                                      >
                      <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                  {/* Error Display - Only shown when validation fails on save */}
                  {error && (
                    <div
                      className="rounded-lg border px-3 py-2 text-sm flex items-start gap-2"
                      style={{
                        backgroundColor: `${colors.error}15`,
                        borderColor: `${colors.error}45`,
                        color: colors.error,
                      }}
                    >
                      <span style={{ color: colors.error, fontSize: '16px', lineHeight: '20px' }}>⚠️</span>
                      <div className="flex-1">
                        {error.includes('•') || error.includes('\n') ? (
                          <ul className="list-disc list-inside space-y-1">
                            {error.split(/[\n•]/).filter(msg => msg.trim()).map((msg, idx) => (
                              <li key={idx}>{msg.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <div>{error}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Invoice Number *
                                        </label>
                                        <Input
                                          type="text"
                        value={invoiceFormData.invoiceNumber || ''}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })}
                                          placeholder="Enter Invoice Number"
                                          style={{
                          backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Invoice Date *
                                        </label>
                                        <Input
                                          type="date"
                        value={invoiceFormData.invoiceDate || ''}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })}
                                          style={{
                          backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Due Date
                                        </label>
                                        <Input
                                          type="date"
                        value={invoiceFormData.dueDate || ''}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                                          style={{
                          backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        Payment Type *
                                        </label>
                      <select
                        value={invoiceFormData.paymentType}
                        onChange={(e) => {
                          const newPaymentType = e.target.value as 'Advance Payment' | 'Progress Payment' | 'Retention Release Payment';
                          setInvoiceFormData({
                            ...invoiceFormData,
                            paymentType: newPaymentType,
                            downPayment: (newPaymentType === 'Progress Payment' || newPaymentType === 'Retention Release Payment') ? '' : invoiceFormData.downPayment,
                            selectedPurchaseOrderId: (newPaymentType === 'Progress Payment' || newPaymentType === 'Retention Release Payment') ? null : invoiceFormData.selectedPurchaseOrderId,
                            selectedChangeOrderId: (newPaymentType === 'Progress Payment' || newPaymentType === 'Retention Release Payment') ? null : invoiceFormData.selectedChangeOrderId,
                            selectedProgressPOId: newPaymentType === 'Advance Payment' ? null : invoiceFormData.selectedProgressPOId,
                            progressInvoiceAmount: newPaymentType === 'Advance Payment' ? '' : invoiceFormData.progressInvoiceAmount,
                            vatAmount: '', // Reset VAT when payment type changes
                            advanceRecovery: newPaymentType !== 'Progress Payment' ? '' : invoiceFormData.advanceRecovery,
                            retention: newPaymentType !== 'Progress Payment' ? '' : invoiceFormData.retention,
                            contraChargesAmount: newPaymentType !== 'Progress Payment' ? '' : invoiceFormData.contraChargesAmount,
                            contraChargesDescription: newPaymentType !== 'Progress Payment' ? '' : invoiceFormData.contraChargesDescription,
                          });
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                          style={{
                          backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                      >
                        <option value="Advance Payment">Advance Payment</option>
                        <option value="Progress Payment">Progress Payment</option>
                        <option value="Retention Release Payment">Retention Release Payment</option>
                      </select>
                                      </div>
                    {invoiceFormData.paymentType === 'Advance Payment' && (
                      <>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Purchase Order *
                                        </label>
                          <select
                            value={invoiceFormData.selectedPurchaseOrderId || ''}
                            onChange={(e) => {
                              const poId = e.target.value ? parseInt(e.target.value) : null;
                              if (!poId) {
                                setInvoiceFormData({
                                  ...invoiceFormData,
                                  selectedPurchaseOrderId: null,
                                  selectedChangeOrderId: null,
                                  downPayment: '',
                                  vatAmount: '',
                                });
                                return;
                              }
                              
                              const selectedPO = purchaseOrders.find(po => po.id === poId);
                              if (!selectedPO) return;

                              // Check existing advance payments for this PO (exclude current invoice if editing)
                              const existingAdvancePayments = invoices.filter(
                                inv => inv.paymentType === 'Advance Payment' && 
                                (!editingInvoice || inv.id !== editingInvoice.id) &&
                                (inv.purchaseOrderId === poId || 
                                 (inv.changeOrderId && changeOrders[poId]?.some(co => co.id === inv.changeOrderId)))
                              );

                              // Check if PO base advance payment exists
                              const hasPOAdvance = existingAdvancePayments.some(inv => inv.purchaseOrderId === poId && !inv.changeOrderId);
                              
                              // Get COs for this PO
                              const poCOs = changeOrders[poId] || [];
                              
                              // Find COs that already have advance payments
                              const coIdsWithAdvances = existingAdvancePayments
                                .filter(inv => inv.changeOrderId)
                                .map(inv => inv.changeOrderId);
                              
                              // Find the next CO that doesn't have an advance payment
                              const nextCO = poCOs.find(co => !coIdsWithAdvances.includes(co.id));
                              
                              let advanceAmount = '';
                              let selectedCOId: number | null = null;
                              let advanceTypeLabel = '';

                              if (!hasPOAdvance) {
                                // Create PO base advance payment (10% of PO value before VAT)
                                advanceAmount = (Number(selectedPO.lpoValue) * 0.10).toFixed(2);
                              } else if (nextCO) {
                                // Create advance payment for next CO (10% of CO amount before VAT)
                                advanceAmount = (Number(nextCO.amount) * 0.10).toFixed(2);
                                selectedCOId = nextCO.id;
                              } else {
                                // All advance payments already created
                                alert(`All advance payments for this PO have been created. Maximum allowed: ${1 + poCOs.length} (1 PO + ${poCOs.length} COs)`);
                                return;
                              }

                              setInvoiceFormData({
                                ...invoiceFormData,
                                selectedPurchaseOrderId: poId,
                                selectedChangeOrderId: selectedCOId,
                                downPayment: advanceAmount,
                                vatAmount: '', // Reset VAT to recalculate
                              });
                            }}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                          >
                            <option value="">Select Purchase Order</option>
                            {purchaseOrders.map((po) => (
                              <option key={po.id} value={po.id}>
                                {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                              </option>
                            ))}
                          </select>
                                      </div>
                        {invoiceFormData.selectedPurchaseOrderId && (() => {
                          const selectedPO = purchaseOrders.find(po => po.id === invoiceFormData.selectedPurchaseOrderId);
                          const poCOs = changeOrders[invoiceFormData.selectedPurchaseOrderId || 0] || [];
                          
                          // Check existing advance payments for this PO (exclude current invoice if editing)
                          const existingAdvancePayments = invoices.filter(
                            inv => inv.paymentType === 'Advance Payment' && 
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            (inv.purchaseOrderId === invoiceFormData.selectedPurchaseOrderId || 
                             (inv.changeOrderId && poCOs.some(co => co.id === inv.changeOrderId)))
                          );
                          
                          const hasPOAdvance = existingAdvancePayments.some(inv => inv.purchaseOrderId === invoiceFormData.selectedPurchaseOrderId && !inv.changeOrderId);
                          const coIdsWithAdvances = existingAdvancePayments
                            .filter(inv => inv.changeOrderId)
                            .map(inv => inv.changeOrderId);
                          const nextCO = poCOs.find(co => !coIdsWithAdvances.includes(co.id));
                          
                          const isForCO = invoiceFormData.selectedChangeOrderId !== null;
                          const selectedCO = isForCO ? poCOs.find(co => co.id === invoiceFormData.selectedChangeOrderId) : null;
                          
                          return (
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Advance Payment Amount *
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                            value={invoiceFormData.downPayment || ''}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, downPayment: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                Auto-calculated as 10% of order amount (before VAT). You can edit if needed.
                              </p>
                                      </div>
                          );
                        })()}
                      </>
                    )}
                                      </div>
                  {(invoiceFormData.paymentType === 'Progress Payment' || invoiceFormData.paymentType === 'Retention Release Payment') && (
                    <>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Purchase Order *
                        </label>
                        <select
                          value={invoiceFormData.selectedProgressPOId || ''}
                          onChange={(e) => {
                            const poId = e.target.value ? parseInt(e.target.value) : null;
                            setInvoiceFormData({
                              ...invoiceFormData,
                              selectedProgressPOId: poId,
                              progressInvoiceAmount: '', // Clear invoice amount when PO changes
                            });
                          }}
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.borderLight,
                            color: colors.textPrimary,
                          }}
                        >
                          <option value="">Select Purchase Order</option>
                          {purchaseOrders.map((po) => (
                            <option key={po.id} value={po.id}>
                              {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                            </option>
                          ))}
                        </select>
                      </div>
                      {invoiceFormData.selectedProgressPOId && (() => {
                        // Calculate Previously Certified and Balance to Certify
                        const selectedPO = purchaseOrders.find(po => po.id === invoiceFormData.selectedProgressPOId);
                        const poCOs = changeOrders[invoiceFormData.selectedProgressPOId || 0] || [];
                        
                        // Calculate Previously Certified: sum of Progress Payment invoice amounts only (before VAT) for this PO
                        // Exclude Advance Payment and Retention Release Payment invoices
                        // Exclude current invoice if editing
                        const previouslyCertified = invoices
                          .filter(inv => 
                            inv.paymentType === 'Progress Payment' &&
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                          )
                          .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
                        
                        // Calculate PO + COs total amount (before VAT)
                        const poAmount = selectedPO ? Number(selectedPO.lpoValue || 0) : 0;
                        const coAmounts = poCOs.reduce((sum, co) => sum + Number(co.amount || 0), 0);
                        const totalPOAndCOAmount = poAmount + coAmounts;
                        
                        // Balance to Certify = (PO + COs) - Previously Certified (Progress Payments only, excluding advance payments)
                        const balanceToCertify = totalPOAndCOAmount - previouslyCertified;
                        
                        // Calculate total advance payments for this PO (PO base + CO advances)
                        const advancePayments = invoices
                          .filter(inv => 
                            inv.paymentType === 'Advance Payment' &&
                            (inv.purchaseOrderId === invoiceFormData.selectedProgressPOId ||
                             (inv.changeOrderId && poCOs.some(co => co.id === inv.changeOrderId)))
                          )
                          .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
                        
                        // Calculate total previous advance recoveries from previous invoices (exclude current if editing)
                        const totalPreviousAdvanceRecoveries = invoices
                          .filter(inv => 
                            inv.paymentType === 'Progress Payment' &&
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                          )
                          .reduce((sum, inv) => sum + Number(inv.advanceRecovery || 0), 0);
                        
                        // Amount Remaining to Recover = Total Advance Payments - Total Previous Recoveries
                        const remainingToRecover = advancePayments - totalPreviousAdvanceRecoveries;
                        
                        // Calculate total retention held so far from previous invoices (exclude current if editing)
                        const totalRetentionHeld = invoices
                          .filter(inv => 
                            inv.paymentType === 'Progress Payment' &&
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                          )
                          .reduce((sum, inv) => sum + Number(inv.retention || 0), 0);
                        
                        // Calculate net invoice amount (after recovery and retention, before VAT)
                        const invoiceAmount = parseFloat(invoiceFormData.progressInvoiceAmount || '0');
                        const advanceRecovery = parseFloat(invoiceFormData.advanceRecovery || '0');
                        const retention = parseFloat(invoiceFormData.retention || '0');
                        const netInvoiceAmount = invoiceAmount - advanceRecovery - retention;
                        
                        // For Progress Payment: check if exceeds balance to certify
                        // For Retention Release Payment: check if exceeds available retention held
                        let exceedsBalance = false;
                        let exceedsRetention = false;
                        let availableRetentionToRelease = 0;
                        
                        if (invoiceFormData.paymentType === 'Progress Payment') {
                          exceedsBalance = netInvoiceAmount > balanceToCertify;
                        } else if (invoiceFormData.paymentType === 'Retention Release Payment') {
                          // Calculate total retention already released from previous Retention Release Payment invoices (exclude current if editing)
                          const totalRetentionReleased = invoices
                            .filter(inv => 
                              inv.paymentType === 'Retention Release Payment' &&
                              (!editingInvoice || inv.id !== editingInvoice.id) &&
                              inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                            )
                            .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
                          
                          // Available retention to release = Total retention held - Total already released
                          availableRetentionToRelease = totalRetentionHeld - totalRetentionReleased;
                          exceedsRetention = invoiceAmount > availableRetentionToRelease;
                        }
                        
                                    return (
                          <>
                            {/* Previously Certified, Balance to Certify, Remaining to Recover, and Retention Held Display */}
                            <div className="mb-6 p-4 rounded-lg" style={{
                              backgroundColor: `${colors.primary}08`,
                              border: `1px solid ${colors.primary}20`,
                            }}>
                              <h3 className="text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
                                Certification Summary
                              </h3>
                              <div className="grid grid-cols-2 gap-6">
                                {/* Certification Section */}
                                <div className="space-y-4">
                                  <div className="pb-4 border-b" style={{ borderColor: colors.borderLight }}>
                                    <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                                      Previously Certified
                                    </p>
                                    <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                                      {formatCurrencyWithDecimals(previouslyCertified)}
                                    </p>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                      Progress Payment invoices (before VAT) for this PO
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                                      Balance to Certify
                                    </p>
                                    <p className={`text-2xl font-bold mb-1 ${exceedsBalance ? 'text-red-500' : ''}`} style={{ 
                                      color: exceedsBalance ? colors.error : colors.primary 
                                    }}>
                                      {formatCurrencyWithDecimals(balanceToCertify)}
                                    </p>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                      (PO + COs before VAT) - Progress Payments Certified (excluding advance payments)
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Recovery & Retention Section */}
                                <div className="space-y-4">
                                  <div className="pb-4 border-b" style={{ borderColor: colors.borderLight }}>
                                    <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                                      Remaining AP Recovery
                                    </p>
                                    <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                                      {formatCurrencyWithDecimals(remainingToRecover)}
                                    </p>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                      Advance Payment - Previous Recoveries
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                                      Retention Held So Far
                                    </p>
                                    <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                                      {formatCurrencyWithDecimals(totalRetentionHeld)}
                                    </p>
                                    <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                      Total retention from previous invoices
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                Invoice Amount (Excluding VAT) *
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={invoiceFormData.progressInvoiceAmount}
                                        onChange={(e) => {
                                  const newAmount = e.target.value;
                                  const amountValue = parseFloat(newAmount) || 0;
                                  // Auto-calculate retention and advance recovery (10% of invoice amount each) - only for Progress Payment
                                  if (invoiceFormData.paymentType === 'Progress Payment') {
                                    const defaultRetention = amountValue * 0.10;
                                    const defaultAdvanceRecovery = amountValue * 0.10;
                                            setInvoiceFormData({
                                              ...invoiceFormData,
                                      progressInvoiceAmount: newAmount,
                                      retention: amountValue > 0 ? defaultRetention.toFixed(2) : '',
                                      advanceRecovery: amountValue > 0 ? defaultAdvanceRecovery.toFixed(2) : '',
                                            });
                                          } else {
                                    // For Retention Release Payment, don't auto-calculate retention/advance recovery
                                            setInvoiceFormData({
                                              ...invoiceFormData,
                                      progressInvoiceAmount: newAmount,
                                            });
                                          }
                                        }}
                                placeholder="0.00"
                                        style={{ 
                                  backgroundColor: colors.backgroundSecondary,
                                  borderColor: (exceedsBalance || exceedsRetention) ? colors.error : colors.borderLight,
                                  color: colors.textPrimary,
                                }}
                              />
                              {invoiceFormData.paymentType === 'Progress Payment' && exceedsBalance && (
                                <p className="text-xs mt-1" style={{ color: colors.error }}>
                                  Invoice amount (after recovery & retention: {formatCurrencyWithDecimals(netInvoiceAmount)}) exceeds Balance to Certify ({formatCurrencyWithDecimals(balanceToCertify)})
                                </p>
                              )}
                              {invoiceFormData.paymentType === 'Progress Payment' && !exceedsBalance && netInvoiceAmount > 0 && (
                                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                  Net amount after recovery & retention: {formatCurrencyWithDecimals(netInvoiceAmount)} / {formatCurrencyWithDecimals(balanceToCertify)} available
                              </p>
                            )}
                              {invoiceFormData.paymentType === 'Retention Release Payment' && exceedsRetention && (
                                <p className="text-xs mt-1" style={{ color: colors.error }}>
                                  Retention release amount ({formatCurrencyWithDecimals(invoiceAmount)}) exceeds available retention held ({formatCurrencyWithDecimals(availableRetentionToRelease)})
                                </p>
                              )}
                              {invoiceFormData.paymentType === 'Retention Release Payment' && !exceedsRetention && invoiceAmount > 0 && (
                                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                  Release amount: {formatCurrencyWithDecimals(invoiceAmount)} / {formatCurrencyWithDecimals(availableRetentionToRelease)} available
                                </p>
                              )}
                          </div>
                          </>
                        );
                      })()}
                      {/* Invoice Amount Display for Progress Payment */}
                      {invoiceFormData.selectedProgressPOId && invoiceFormData.progressInvoiceAmount && parseFloat(invoiceFormData.progressInvoiceAmount) > 0 && (
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Invoice Amount (Excluding VAT)
                          </label>
                          <div className="p-3 rounded-lg border" style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                          }}>
                            <span className="text-lg font-bold" style={{ color: colors.primary }}>
                              {formatCurrencyWithDecimals(calculateInvoiceAmounts().invoiceAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Advance Recovery Field - only for Progress Payment */}
                      {invoiceFormData.paymentType === 'Progress Payment' && invoiceFormData.selectedProgressPOId && (() => {
                        // Calculate if certifying 100% and need full AP recovery
                        const selectedPO = purchaseOrders.find(po => po.id === invoiceFormData.selectedProgressPOId);
                        const poCOs = changeOrders[invoiceFormData.selectedProgressPOId || 0] || [];
                        const previouslyCertified = invoices
                          .filter(inv => 
                            inv.paymentType === 'Progress Payment' &&
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                          )
                          .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
                        const poAmount = selectedPO ? Number(selectedPO.lpoValue || 0) : 0;
                        const coAmounts = poCOs.reduce((sum, co) => sum + Number(co.amount || 0), 0);
                        const totalPOAndCOAmount = poAmount + coAmounts;
                        const balanceToCertify = totalPOAndCOAmount - previouslyCertified;
                        const advancePayments = invoices
                          .filter(inv => 
                            inv.paymentType === 'Advance Payment' &&
                            (inv.purchaseOrderId === invoiceFormData.selectedProgressPOId ||
                             (inv.changeOrderId && poCOs.some(co => co.id === inv.changeOrderId)))
                          )
                          .reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
                        const totalPreviousAdvanceRecoveries = invoices
                          .filter(inv => 
                            inv.paymentType === 'Progress Payment' &&
                            (!editingInvoice || inv.id !== editingInvoice.id) &&
                            inv.purchaseOrderId === invoiceFormData.selectedProgressPOId
                          )
                          .reduce((sum, inv) => sum + Number(inv.advanceRecovery || 0), 0);
                        const remainingToRecover = advancePayments - totalPreviousAdvanceRecoveries;
                        
                        return (
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                              Advance Recovery
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={invoiceFormData.advanceRecovery || ''}
                              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, advanceRecovery: e.target.value })}
                              placeholder={invoiceFormData.progressInvoiceAmount ? (parseFloat(invoiceFormData.progressInvoiceAmount) * 0.10).toFixed(2) : '0.00'}
                              style={{
                                backgroundColor: colors.backgroundSecondary,
                                borderColor: colors.borderLight,
                                color: colors.textPrimary,
                              }}
                            />
                            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                              Amount to be deducted from the total invoice amount
                            </p>
                          </div>
                        );
                      })()}
                      {invoiceFormData.paymentType === 'Progress Payment' && !invoiceFormData.selectedProgressPOId && (
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Advance Recovery
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={invoiceFormData.advanceRecovery || ''}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, advanceRecovery: e.target.value })}
                            placeholder={invoiceFormData.progressInvoiceAmount ? (parseFloat(invoiceFormData.progressInvoiceAmount) * 0.10).toFixed(2) : '0.00'}
                            style={{
                              backgroundColor: colors.backgroundSecondary,
                              borderColor: colors.borderLight,
                              color: colors.textPrimary,
                            }}
                          />
                          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            Amount to be deducted from the total invoice amount
                          </p>
                        </div>
                      )}
                      {/* Retention Field - only for Progress Payment */}
                      {invoiceFormData.paymentType === 'Progress Payment' && (
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Retention
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                            value={invoiceFormData.retention || ''}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, retention: e.target.value })}
                            placeholder={invoiceFormData.progressInvoiceAmount ? (parseFloat(invoiceFormData.progressInvoiceAmount) * 0.10).toFixed(2) : '0.00'}
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            Amount to be deducted from the total invoice amount
                          </p>
                                      </div>
                      )}
                      {/* Contra Charges Fields - only for Progress Payment */}
                      {invoiceFormData.paymentType === 'Progress Payment' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                              Contra Charges Amount
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={invoiceFormData.contraChargesAmount || ''}
                              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, contraChargesAmount: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            Amount to be deducted from the total invoice amount
                          </p>
                                      </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                              Contra Charges Description
                            </label>
                            <Input
                              type="text"
                              value={invoiceFormData.contraChargesDescription || ''}
                              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, contraChargesDescription: e.target.value })}
                              placeholder="Enter description for contra charges..."
                              style={{
                                backgroundColor: colors.backgroundSecondary,
                                borderColor: colors.borderLight,
                                color: colors.textPrimary,
                              }}
                            />
                          </div>
                        </>
                      )}
                      {/* VAT Amount Field - shown for Progress Payment and Retention Release Payment */}
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          VAT Amount *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={invoiceFormData.vatAmount ?? calculateInvoiceAmounts().vatAmount.toString()}
                          onChange={(e) => {
                            const vatValue = e.target.value;
                            setInvoiceFormData({
                              ...invoiceFormData,
                              vatAmount: vatValue,
                            });
                          }}
                          placeholder={calculateInvoiceAmounts().vatAmount.toString()}
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.borderLight,
                            color: colors.textPrimary,
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                          {invoiceFormData.paymentType === 'Progress Payment' 
                            ? `Auto-calculated: ${formatCurrencyWithDecimals(calculateInvoiceAmounts().vatAmount)} (5% of amount after recovery)`
                            : `Auto-calculated: ${formatCurrencyWithDecimals(calculateInvoiceAmounts().vatAmount)} (5% of invoice amount)`
                          }
                        </p>
                      </div>
                    </>
                  )}
                  {invoiceFormData.paymentType === 'Advance Payment' && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        VAT Amount *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={invoiceFormData.vatAmount ?? calculateInvoiceAmounts().vatAmount.toString()}
                        onChange={(e) => {
                          const vatValue = e.target.value;
                          setInvoiceFormData({
                            ...invoiceFormData,
                            vatAmount: vatValue,
                          });
                        }}
                        placeholder={calculateInvoiceAmounts().vatAmount.toString()}
                        style={{
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        Auto-calculated: {formatCurrencyWithDecimals(calculateInvoiceAmounts().vatAmount)} (5% of invoice amount)
                      </p>
                    </div>
                  )}
                  {/* Invoice Amount Summary */}
                  {((invoiceFormData.paymentType === 'Advance Payment' && invoiceFormData.downPayment) ||
                    (invoiceFormData.paymentType === 'Progress Payment' && invoiceFormData.progressInvoiceAmount && parseFloat(invoiceFormData.progressInvoiceAmount) > 0) ||
                    (invoiceFormData.paymentType === 'Retention Release Payment' && invoiceFormData.progressInvoiceAmount && parseFloat(invoiceFormData.progressInvoiceAmount) > 0)) && (
                    <div className="border rounded-lg p-4 space-y-2" style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                    }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                        Invoice Summary
                      </h4>
                      <div className={`grid gap-3 ${invoiceFormData.paymentType === 'Progress Payment' ? 'grid-cols-1 md:grid-cols-7' : invoiceFormData.paymentType === 'Retention Release Payment' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {invoiceFormData.paymentType === 'Progress Payment' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Invoice Amount (Excluding VAT)
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(calculateInvoiceAmounts().invoiceAmount)}
                                    </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Advance Recovery
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.warning || '#f59e0b' }}>
                                -{formatCurrencyWithDecimals(calculateInvoiceAmounts().advanceRecovery)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Retention
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.warning || '#f59e0b' }}>
                                -{formatCurrencyWithDecimals(calculateInvoiceAmounts().retention)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Contra Charges
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.warning || '#f59e0b' }}>
                                -{formatCurrencyWithDecimals(calculateInvoiceAmounts().contraChargesAmount)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Amount After Deductions
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(calculateInvoiceAmounts().amountAfterDeductions)}
                              </div>
                            </div>
                          </>
                        )}
                        {invoiceFormData.paymentType === 'Advance Payment' && (
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                              Invoice Amount (Excluding VAT)
                            </label>
                            <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                              {formatCurrencyWithDecimals(calculateInvoiceAmounts().invoiceAmount)}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                            VAT Amount (5%)
                          </label>
                          <div className="text-lg font-semibold" style={{ color: colors.primary }}>
                            {formatCurrencyWithDecimals(calculateInvoiceAmounts().vatAmount)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                            Total Amount
                          </label>
                          <div className="text-lg font-semibold" style={{ color: colors.success }}>
                            {formatCurrencyWithDecimals(calculateInvoiceAmounts().totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                        setShowInvoiceForm(false);
                        setEditingInvoice(null);
                        setError(null);
                        setInvoiceFormData({
                                            invoiceNumber: '',
                                            invoiceDate: '',
                          dueDate: '',
                          paymentType: hasDownPayment ? 'Progress Payment' : 'Advance Payment',
                          downPayment: '',
                          selectedPurchaseOrderId: null,
                          selectedChangeOrderId: null,
                          selectedProgressPOId: null,
                          progressInvoiceAmount: '',
                          vatAmount: '',
                          downPaymentRecovery: '',
                          advanceRecovery: '',
                          retention: '',
                          contraChargesAmount: '',
                          contraChargesDescription: '',
                                          });
                                        }}
                                        disabled={isSaving}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="primary"
                                        size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
                      onClick={handleSaveInvoice}
                                        isLoading={isSaving}
                      disabled={isSaving}
                                      >
                      {editingInvoice ? 'Update' : 'Save'}
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ borderColor: colors.borderLight }}>
                                  <thead>
                  <tr style={{ backgroundColor: `${colors.primary}20` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Invoice Number
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Invoice Date
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Due Date
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Status
                                      </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Due Days
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Payment Type
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Invoice Amount (Excluding VAT)
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Recovered from AP
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Retention Held
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Contra Charges
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      VAT (5%)
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Total Amount
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Purchase Order
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                  {(() => {
                    // Filter invoices by selected PO
                    let filteredInvoices = invoices;
                    
                    if (poFilterId) {
                      filteredInvoices = invoices.filter((invoice) => {
                        return invoice.purchaseOrderId === poFilterId;
                      });
                    }
                    
                    return filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} style={{ backgroundColor: `${colors.success}08` }}>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.invoiceNumber}
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.dueDate 
                            ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : <span style={{ color: colors.textSecondary }}>-</span>
                          }
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight }}>
                          {(() => {
                            const status = getInvoiceStatus(invoice);
                            const statusConfig = {
                              paid: {
                                label: 'Paid',
                                bgColor: `${colors.success}20`,
                                textColor: colors.success,
                              },
                              partially_paid: {
                                label: 'Partially Paid',
                                bgColor: `${colors.warning}20`,
                                textColor: colors.warning,
                              },
                              unpaid: {
                                label: 'Unpaid',
                                bgColor: `${colors.error}20`,
                                textColor: colors.error,
                              },
                            };
                            const config = statusConfig[status];
                            return (
                              <span className="text-xs px-2 py-1 rounded font-medium" style={{
                                backgroundColor: config.bgColor,
                                color: config.textColor,
                              }}>
                                {config.label}
                              </span>
                            );
                          })()}
                                          </td>
                        <td className="px-4 py-3 text-sm text-center border" style={{ borderColor: colors.borderLight }}>
                          {(() => {
                            const dueDays = calculateDueDays(invoice);
                            if (dueDays === null) {
                              return <span style={{ color: colors.textSecondary }}>-</span>;
                            }
                            
                            // Positive = days until due, negative = days overdue
                            const isOverdue = dueDays < 0;
                            const displayDays = Math.abs(dueDays);
                            const invoiceStatus = getInvoiceStatus(invoice);
                            
                            return (
                              <span className="text-xs px-2 py-1 rounded font-medium" style={{
                                backgroundColor: isOverdue ? `${colors.error}20` : `${colors.info}20`,
                                color: isOverdue ? colors.error : colors.info,
                              }}>
                                {isOverdue ? `-${displayDays}` : `+${displayDays}`}
                                {invoiceStatus === 'paid' && (
                                  <span className="ml-1 text-xs" style={{ color: colors.textSecondary }}>
                                    (paid)
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          <span className="text-xs px-2 py-1 rounded font-medium" style={{
                            backgroundColor: invoice.paymentType === 'Advance Payment' ? `${colors.info}20` : invoice.paymentType === 'Retention Release Payment' ? `${colors.warning}20` : `${colors.success}20`,
                            color: invoice.paymentType === 'Advance Payment' ? colors.info : invoice.paymentType === 'Retention Release Payment' ? colors.warning : colors.success,
                          }}>
                            {invoice.paymentType}
                          </span>
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(invoice.invoiceAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.paymentType === 'Progress Payment' && invoice.advanceRecovery ? (
                            formatCurrencyWithDecimals(invoice.advanceRecovery)
                          ) : (
                            <span style={{ color: colors.textSecondary }}>-</span>
                          )}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.paymentType === 'Progress Payment' && invoice.retention ? (
                            formatCurrencyWithDecimals(invoice.retention)
                          ) : (
                            <span style={{ color: colors.textSecondary }}>-</span>
                          )}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.paymentType === 'Progress Payment' && invoice.contraChargesAmount ? (
                            formatCurrencyWithDecimals(invoice.contraChargesAmount)
                          ) : (
                            <span style={{ color: colors.textSecondary }}>-</span>
                          )}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.primary }}>
                          {formatCurrencyWithDecimals(invoice.vatAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold border" style={{ borderColor: colors.borderLight, color: colors.success }}>
                          {formatCurrencyWithDecimals(invoice.totalAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                            {invoice.paymentType === 'Advance Payment' ? (
                            invoice.purchaseOrder ? (
                              <span className="text-xs px-2 py-1 rounded" style={{
                                backgroundColor: colors.backgroundPrimary,
                                color: colors.textPrimary,
                              }}>
                                PO: {invoice.purchaseOrder.lpoNumber}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: colors.textSecondary }}>-</span>
                            )
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {invoice.purchaseOrder?.lpoNumber ? (
                                <span className="text-xs px-2 py-1 rounded" style={{
                                    backgroundColor: colors.backgroundPrimary,
                                    color: colors.textPrimary,
                                  }}>
                                  {invoice.purchaseOrder.lpoNumber}
                                  </span>
                              ) : (
                                <span className="text-xs" style={{ color: colors.textSecondary }}>-</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                          <div className="flex items-center justify-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                              onClick={() => handleEditInvoice(invoice)}
                              className="h-7 w-7"
                                                style={{ color: colors.info }}
                                              >
                              <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                              onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                              className="h-7 w-7"
                                                style={{ color: colors.error }}
                                              >
                              <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                        <td colSpan={11} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                          {poFilterId ? 'No invoices found for the selected PO.' : 'No invoices yet. Click "Add Invoice" to add one.'}
                                        </td>
                                      </tr>
                    );
                  })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            {showPaymentForm && (
              <Card
                className="p-4"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {editingPayment ? 'Edit Payment' : 'Add Payment'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setEditingPayment(null);
                        setError(null);
                        setPaymentFormData({
                          selectedInvoiceIds: [],
                          invoicePayments: {},
                          paymentMethod: 'Current Dated',
                          paymentType: null,
                          paymentDate: '',
                          dueDate: '',
                          notes: '',
                        });
                      }}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Error Display - Only shown when validation fails on save */}
                  {error && (
                    <div
                      className="rounded-lg border px-3 py-2 text-sm flex items-start gap-2"
                      style={{
                        backgroundColor: `${colors.error}15`,
                        borderColor: `${colors.error}45`,
                        color: colors.error,
                      }}
                    >
                      <span style={{ color: colors.error, fontSize: '16px', lineHeight: '20px' }}>⚠️</span>
                      <div className="flex-1">
                        {error.includes('•') || error.includes('\n') ? (
                          <ul className="list-disc list-inside space-y-1">
                            {error.split(/[\n•]/).filter(msg => msg.trim()).map((msg, idx) => (
                              <li key={idx}>{msg.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <div>{error}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        Payment Method *
                      </label>
                      <select
                        value={paymentFormData.paymentMethod}
                        onChange={(e) => {
                          const method = e.target.value as 'Post Dated' | 'Current Dated';
                          setPaymentFormData({
                            ...paymentFormData,
                            paymentMethod: method,
                            paymentType: method === 'Post Dated' ? null : null,
                            dueDate: method === 'Post Dated' ? paymentFormData.dueDate : '',
                            liquidated: false, // Always default to false when changing payment method
                          });
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                        }}
                      >
                        <option value="Current Dated">Current Dated</option>
                        <option value="Post Dated">Post Dated</option>
                      </select>
                    </div>

                    {paymentFormData.paymentMethod === 'Post Dated' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Payment Type *
                          </label>
                          <select
                            value={paymentFormData.paymentType || ''}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value as 'PDC' | 'LC' | 'Trust Receipt' | null })}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            style={{
                              backgroundColor: colors.backgroundSecondary,
                              borderColor: colors.borderLight,
                              color: colors.textPrimary,
                            }}
                          >
                            <option value="">Select Payment Type</option>
                            <option value="PDC">PDC</option>
                            <option value="LC">LC</option>
                            <option value="Trust Receipt">Trust Receipt</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Due Date *
                          </label>
                          <Input
                            type="date"
                            value={paymentFormData.dueDate}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, dueDate: e.target.value })}
                            style={{
                              backgroundColor: colors.backgroundSecondary,
                              borderColor: colors.borderLight,
                              color: colors.textPrimary,
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paymentFormData.liquidated}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, liquidated: e.target.checked })}
                              className="w-4 h-4 rounded"
                              style={{
                                accentColor: colors.primary,
                              }}
                            />
                            <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                              Liquidated (LC/PDC/Trust Receipt has been released)
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        {paymentFormData.paymentMethod === 'Current Dated' ? 'Payment Date *' : 'Issue Date *'}
                      </label>
                      <Input
                        type="date"
                        value={paymentFormData.paymentDate}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                        style={{
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        Notes
                      </label>
                      <textarea
                        value={paymentFormData.notes}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                        }}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>

                  {/* Invoice Selection Spreadsheet - Below Form */}
                  <div className="md:col-span-2 border-t pt-4" style={{ borderColor: colors.borderLight }}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        Select Invoices for Payment *
                      </label>
                      {(() => {
                        const selectedIds = paymentFormData.selectedInvoiceIds || [];
                        const totalPaymentAmount = selectedIds.reduce((sum, invoiceId) => {
                          const invoicePayment = paymentFormData.invoicePayments[invoiceId];
                          if (invoicePayment && invoicePayment.paymentAmount) {
                            return sum + (parseFloat(invoicePayment.paymentAmount) || 0);
                          }
                          return sum;
                        }, 0);
                        const totalVatAmount = selectedIds.reduce((sum, invoiceId) => {
                          const invoicePayment = paymentFormData.invoicePayments[invoiceId];
                          if (invoicePayment && invoicePayment.vatAmount) {
                            return sum + (parseFloat(invoicePayment.vatAmount) || 0);
                          }
                          return sum;
                        }, 0);
                        const grandTotal = totalPaymentAmount + totalVatAmount;
                        
                        return (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <span className="text-xs" style={{ color: colors.textSecondary }}>Total Payment:</span>
                              <span className="ml-2 font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(totalPaymentAmount)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs" style={{ color: colors.textSecondary }}>Total VAT:</span>
                              <span className="ml-2 font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(totalVatAmount)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs" style={{ color: colors.textSecondary }}>Grand Total:</span>
                              <span className="ml-2 font-bold text-lg" style={{ color: colors.primary }}>
                                {formatCurrencyWithDecimals(grandTotal)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: `${colors.primary}15` }}>
                            <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary, width: '50px' }}>
                              <div className="flex justify-center">
                                <Checkbox
                                  variant="primary"
                                  size="md"
                                  checked={getUnpaidInvoices().length > 0 && getUnpaidInvoices().every(inv => (paymentFormData.selectedInvoiceIds || []).includes(inv.id))}
                                  onChange={(e) => {
                                    const unpaidInvoices = getUnpaidInvoices();
                                    const paidAmounts = calculateInvoicePaidAmounts();
                                    
                                    if (e.target.checked) {
                                      // Select all
                                      const newSelectedIds = unpaidInvoices.map(inv => inv.id);
                                      const newInvoicePayments = { ...paymentFormData.invoicePayments };
                                      
                                      unpaidInvoices.forEach(invoice => {
                                        const paid = paidAmounts[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
                                        const totalPaid = paid.paymentAmount + paid.vatAmount;
                                        const invoiceTotal = Number(invoice.totalAmount || 0);
                                        const remaining = invoiceTotal - totalPaid;
                                        
                                        // Calculate remaining base amount and VAT
                                        // remaining is the total with VAT, so we need to split it
                                        // If remaining = 525 (with 5% VAT), base = 525/1.05 = 500, VAT = 25
                                        const remainingBase = remaining > 0 ? remaining / 1.05 : 0;
                                        const remainingVat = remaining - remainingBase;
                                        
                                        newInvoicePayments[invoice.id] = {
                                          paymentAmount: remainingBase > 0 ? remainingBase.toFixed(2) : '0',
                                          vatAmount: remainingVat > 0 ? remainingVat.toFixed(2) : '0',
                                        };
                                      });
                                      
                                      setPaymentFormData({
                                        ...paymentFormData,
                                        selectedInvoiceIds: newSelectedIds,
                                        invoicePayments: newInvoicePayments,
                                      });
                                    } else {
                                      // Deselect all
                                      const newInvoicePayments = { ...paymentFormData.invoicePayments };
                                      unpaidInvoices.forEach(invoice => {
                                        delete newInvoicePayments[invoice.id];
                                      });
                                      
                                      setPaymentFormData({
                                        ...paymentFormData,
                                        selectedInvoiceIds: [],
                                        invoicePayments: newInvoicePayments,
                                      });
                                    }
                                  }}
                                  title="Select/Deselect all invoices"
                                />
                              </div>
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Invoice #
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Invoice Date
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Invoice Total
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Paid Amount
                            </th>
                            {editingPayment && (
                              <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                Registered Payment
                              </th>
                            )}
                            <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Remaining
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Due Days
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              VAT Amount
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold border-b" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                              Payment Amount (including VAT)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getUnpaidInvoices().length === 0 ? (
                            <tr>
                              <td colSpan={editingPayment ? 10 : 9} className="px-4 py-6 text-center text-sm" style={{ color: colors.textSecondary }}>
                                No invoices available.
                          </td>
                        </tr>
                          ) : (
                            getUnpaidInvoices().map((invoice) => {
                              const isSelected = (paymentFormData.selectedInvoiceIds || []).includes(invoice.id);
                              const paidAmounts = calculateInvoicePaidAmounts();
                              const paid = paidAmounts[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
                              const totalPaid = paid.paymentAmount + paid.vatAmount;
                              const invoiceTotal = Number(invoice.totalAmount || 0);
                              const remaining = invoiceTotal - totalPaid;
                              const invoicePayment = paymentFormData.invoicePayments[invoice.id] || { paymentAmount: '', vatAmount: '0' };
                              
                              // Get registered payment amount from the payment being edited
                              const registeredPayment = editingPayment?.paymentInvoices?.find(pi => pi.invoiceId === invoice.id);
                              const registeredPaymentAmount = registeredPayment ? Number(registeredPayment.paymentAmount || 0) : 0;
                              const registeredVatAmount = registeredPayment ? Number(registeredPayment.vatAmount || 0) : 0;
                              const registeredTotal = registeredPaymentAmount + registeredVatAmount;
                              
                              return (
                                <tr 
                                  key={invoice.id} 
                                  className="hover:opacity-80 transition-opacity"
                                  style={{ 
                                    backgroundColor: isSelected ? `${colors.primary}08` : 'transparent',
                                    borderBottom: `1px solid ${colors.borderLight}`
                                  }}
                                >
                                  <td className="px-3 py-2 border-r text-center align-middle" style={{ borderColor: colors.borderLight, width: '50px' }}>
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const currentSelectedIds = paymentFormData.selectedInvoiceIds || [];
                                          const newSelectedIds = e.target.checked
                                            ? [...currentSelectedIds, invoice.id]
                                            : currentSelectedIds.filter(id => id !== invoice.id);
                                          
                                          const newInvoicePayments = { ...paymentFormData.invoicePayments };
                                          if (e.target.checked) {
                                            // Auto-fill payment amount with Remaining amount when checked
                                            // Calculate remaining base amount and VAT
                                            // remaining is the total with VAT, so we need to split it
                                            const remainingBase = remaining > 0 ? remaining / 1.05 : 0;
                                            const remainingVat = remaining - remainingBase;
                                            
                                            newInvoicePayments[invoice.id] = {
                                              paymentAmount: remainingBase > 0 ? remainingBase.toFixed(2) : '0',
                                              vatAmount: remainingVat > 0 ? remainingVat.toFixed(2) : '0',
                                            };
                                          } else {
                                            delete newInvoicePayments[invoice.id];
                                          }
                                          
                                          setPaymentFormData({
                                            ...paymentFormData,
                                            selectedInvoiceIds: newSelectedIds,
                                            invoicePayments: newInvoicePayments,
                                          });
                                        }}
                                        title={isSelected ? 'Uncheck to remove from payment' : 'Check to add invoice to payment'}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-sm font-medium border-r" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                    {invoice.invoiceNumber}
                                  </td>
                                  <td className="px-3 py-2 text-sm border-r" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                    {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-right font-semibold border-r" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                    {formatCurrencyWithDecimals(invoiceTotal)}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-right border-r" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                                    {formatCurrencyWithDecimals(totalPaid)}
                                  </td>
                                  {editingPayment && (
                                    <td className="px-3 py-2 text-sm text-right font-medium border-r" style={{ borderColor: colors.borderLight, color: colors.primary }}>
                                      {registeredTotal > 0 ? (
                                        <div>
                                          <div>{formatCurrencyWithDecimals(registeredPaymentAmount)}</div>
                                          {registeredVatAmount > 0 && (
                                            <div className="text-xs" style={{ color: colors.textSecondary }}>
                                              + VAT: {formatCurrencyWithDecimals(registeredVatAmount)}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                  )}
                                  <td className="px-3 py-2 text-sm text-right font-medium border-r" style={{ borderColor: colors.borderLight, color: remaining > 0 ? colors.warning : colors.success }}>
                                    {formatCurrencyWithDecimals(remaining)}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-center border-r" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                    {(() => {
                                      const dueDays = calculateDueDays(invoice);
                                      if (dueDays === null) return '-';
                                      const color = dueDays < 0 ? colors.error : dueDays <= 7 ? colors.warning : colors.textPrimary;
                                      return (
                                        <span style={{ color, fontWeight: dueDays <= 7 ? 'bold' : 'normal' }}>
                                          {dueDays < 0 ? `-${Math.abs(dueDays)}` : `+${dueDays}`}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="px-3 py-2 border-r" style={{ borderColor: colors.borderLight }}>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={invoicePayment.vatAmount}
                                      onChange={(e) => {
                                        setPaymentFormData({
                                          ...paymentFormData,
                                          invoicePayments: {
                                            ...paymentFormData.invoicePayments,
                                            [invoice.id]: {
                                              ...invoicePayment,
                                              vatAmount: e.target.value,
                                            },
                                          },
                                        });
                                      }}
                                      disabled={!isSelected}
                                      className="w-full text-right text-sm px-2 py-1"
                                      style={{
                                        backgroundColor: isSelected ? colors.backgroundSecondary : colors.backgroundDark,
                                        borderColor: colors.borderLight,
                                        color: colors.textPrimary,
                                      }}
                                      placeholder="0.00"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={invoicePayment.paymentAmount}
                                      onChange={(e) => {
                                        setPaymentFormData({
                                          ...paymentFormData,
                                          invoicePayments: {
                                            ...paymentFormData.invoicePayments,
                                            [invoice.id]: {
                                              ...invoicePayment,
                                              paymentAmount: e.target.value,
                                            },
                                          },
                                        });
                                      }}
                                      disabled={!isSelected}
                                      className="w-full text-right text-sm px-2 py-1"
                                      style={{
                                        backgroundColor: isSelected ? colors.backgroundSecondary : colors.backgroundDark,
                                        borderColor: colors.borderLight,
                                        color: colors.textPrimary,
                                      }}
                                      placeholder="0.00"
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 md:col-span-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setEditingPayment(null);
                        setError(null);
                        setPaymentFormData({
                          selectedInvoiceIds: [],
                          invoicePayments: {},
                          paymentMethod: 'Current Dated',
                          paymentType: null,
                          paymentDate: '',
                          dueDate: '',
                          notes: '',
                        });
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
                      onClick={handleSavePayment}
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      {editingPayment ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                Payment Register
              </h3>
              {activeTab === 'payments' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setShowPaymentForm(true);
                    setEditingPayment(null);
                    setError(null);
                    setPaymentFormData({
                      selectedInvoiceIds: [],
                      invoicePayments: {},
                      paymentMethod: 'Current Dated',
                      paymentType: null,
                      paymentDate: '',
                      dueDate: '',
                      notes: '',
                    });
                  }}
                >
                  Add Payment
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ borderColor: colors.borderLight }}>
                <thead>
                  <tr style={{ backgroundColor: `${colors.primary}20` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Invoices
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Payment Amount (Excluding VAT)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Total VAT Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Total Payment Amount (Including VAT)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Payment Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Payment Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Payment Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Liquidated
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Filter payments by selected PO if filter is set
                    const filteredPayments = poFilterId 
                      ? payments.filter((payment) => {
                          // Check if any invoice in this payment belongs to the selected PO
                          return payment.paymentInvoices?.some(pi => {
                            const invoice = pi.invoice;
                            if (!invoice) return false;
                            return invoice.purchaseOrderId === poFilterId;
                          });
                        })
                      : payments;
                    
                    if (filteredPayments.length === 0) {
                      return (
                        <tr>
                          <td colSpan={10} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                            {poFilterId ? 'No payments found for the selected Purchase Order.' : 'No payments recorded yet. Click "Add Payment" to add one.'}
                  </td>
                </tr>
                      );
                    }
                    
                    return filteredPayments.map((payment) => (
                      <tr key={payment.id} style={{ backgroundColor: `${colors.success}08` }}>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          <div className="space-y-1">
                            {payment.paymentInvoices?.map((pi, index) => (
                              <span key={pi.id} className="font-medium">
                                {pi.invoice.invoiceNumber}
                                {index < (payment.paymentInvoices?.length || 0) - 1 && <span className="mx-1" style={{ color: colors.textSecondary }}>,</span>}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(payment.totalPaymentAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(payment.totalVatAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(parseFloat((Number(payment.totalPaymentAmount) + Number(payment.totalVatAmount)).toFixed(2)))}
                        </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          <span className="text-xs px-2 py-1 rounded font-medium" style={{
                            backgroundColor: payment.paymentMethod === 'Post Dated' ? `${colors.warning || '#f59e0b'}20` : `${colors.success}20`,
                            color: payment.paymentMethod === 'Post Dated' ? colors.warning || '#f59e0b' : colors.success,
                          }}>
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {payment.paymentType || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {payment.dueDate 
                            ? new Date(payment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                          {payment.paymentMethod === 'Post Dated' ? (
                            <div className="flex items-center justify-center" title={payment.liquidated ? 'Liquidated - Toggle to mark as not liquidated' : 'Not liquidated - Toggle to mark as liquidated'}>
                              <Toggle
                                checked={payment.liquidated || false}
                                onChange={() => handleToggleLiquidated(payment)}
                                size="sm"
                                variant={payment.liquidated ? 'success' : 'default'}
                              />
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: colors.textMuted }}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPayment(payment)}
                              className="h-7 w-7"
                              style={{ color: colors.info }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const invoiceNumbers = payment.paymentInvoices?.map(pi => pi.invoice.invoiceNumber).join(', ') || 'payment';
                                handleDeletePayment(payment.id, invoiceNumbers);
                              }}
                              className="h-7 w-7"
                              style={{ color: colors.error }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
            </tbody>
          </table>
        </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {!isEditingPerformance && projectSubcontractor && (projectSubcontractor.performanceRating || projectSubcontractor.performanceReview) ? (
              <Card
                className="p-4"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Performance Review
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                      onClick={() => {
                        setIsEditingPerformance(true);
                        setPerformanceFormData({
                          performanceRating: projectSubcontractor.performanceRating || null,
                          performanceReview: projectSubcontractor.performanceReview || '',
                        });
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      Performance Rating
                    </label>
                    <div className="p-3 rounded-lg border" style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                    }}>
                      {projectSubcontractor.performanceRating ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= projectSubcontractor.performanceRating!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium" style={{ color: colors.textPrimary }}>
                            ({projectSubcontractor.performanceRating}/5)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: colors.textSecondary }}>Not rated</span>
                      )}
                    </div>
                  </div>

                  {projectSubcontractor.performanceReview && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                        Review Description
                      </label>
                      <div className="p-3 rounded-lg border min-h-[100px] whitespace-pre-wrap" style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                      }}>
                        {projectSubcontractor.performanceReview}
                      </div>
                    </div>
                  )}
                </div>
      </Card>
            ) : (
              <Card
                className="p-4"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Performance Review
                    </h3>
                    {isEditingPerformance && projectSubcontractor && (projectSubcontractor.performanceRating || projectSubcontractor.performanceReview) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingPerformance(false);
                          setPerformanceFormData({
                            performanceRating: projectSubcontractor?.performanceRating || null,
                            performanceReview: projectSubcontractor?.performanceReview || '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
    </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: colors.textPrimary }}>
                      Performance Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setPerformanceFormData({
                            ...performanceFormData,
                            performanceRating: star,
                          })}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              performanceFormData.performanceRating && star <= performanceFormData.performanceRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                      {performanceFormData.performanceRating && (
                        <span className="ml-2 text-sm font-medium" style={{ color: colors.textPrimary }}>
                          ({performanceFormData.performanceRating}/5)
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      Click on a star to rate (1 = Poor, 5 = Excellent)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                      Review Description
                    </label>
                    <textarea
                      value={performanceFormData.performanceReview}
                      onChange={(e) => setPerformanceFormData({
                        ...performanceFormData,
                        performanceReview: e.target.value,
                      })}
                      rows={6}
                      className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                      }}
                      placeholder="Enter performance review description..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {isEditingPerformance && projectSubcontractor && (projectSubcontractor.performanceRating || projectSubcontractor.performanceReview) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingPerformance(false);
                          setPerformanceFormData({
                            performanceRating: (projectSubcontractor.performanceRating as 'Bad' | 'Good' | 'Very Good') || '',
                            performanceReview: projectSubcontractor.performanceReview || '',
                          });
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
                    onClick={async () => {
                      if (!performanceFormData.performanceRating) {
                        setError('Please select a performance rating (1-5 stars).');
                        return;
                      }

                      setIsSaving(true);
                      setError(null);

                      try {
                        const response = await put<{ success: boolean; data?: ProjectSubcontractor; error?: string }>(
                          `/api/admin/project-subcontractors/${subcontractorId}`,
                          {
                            performanceRating: performanceFormData.performanceRating || null,
                            performanceReview: performanceFormData.performanceReview || null,
                          }
                        );

                        if (!response.success) {
                          throw new Error(response.error || 'Failed to save performance review');
                        }

                        // Update local state
                        if (response.data) {
                          setProjectSubcontractor({
                            ...projectSubcontractor!,
                            ...response.data,
                          });
                            // Update form data with saved values
                            setPerformanceFormData({
                              performanceRating: response.data.performanceRating || null,
                              performanceReview: response.data.performanceReview || '',
                            });
                        }

                        // Close the form and show saved view
                        setIsEditingPerformance(false);
                        setError(null);
                      } catch (submitError: any) {
                        console.error('Failed to save performance review:', submitError);
                        const errorMessage = submitError?.message || 'Failed to save performance review. Please try again.';
                        setError(errorMessage);
                        alert(errorMessage);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    isLoading={isSaving}
                    disabled={isSaving || !performanceFormData.performanceRating}
                    >
                      Save Performance Review
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}

