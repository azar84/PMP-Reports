'use client';

import { useCallback, useEffect, useState, Fragment, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toggle } from '@/components/ui/Toggle';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ArrowLeft, Plus, Save, Edit, Trash2, Tag, X, ChevronRight, ChevronDown, FileText, ShoppingCart, Package, Receipt, Filter, XCircle, CreditCard, Calendar, AlertCircle, Clock, Wallet, Star } from 'lucide-react';
import { formatDateForInput } from '@/lib/dateUtils';
import { formatCurrencyWithDecimals } from '@/lib/currency';

interface SupplierOption {
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

interface ProjectSupplier {
  id: number;
  projectId: number;
  supplierId: number;
  notes: string | null;
  performanceRating: number | null; // 1-5 stars
  performanceReview: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: SupplierOption;
}

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

interface PurchaseOrdersResponse {
  success: boolean;
  data?: PurchaseOrder[];
  error?: string;
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

interface GRNsResponse {
  success: boolean;
  data?: GRN[];
  error?: string;
}

interface InvoiceGRN {
  id: number;
  invoiceId: number;
  grnId: number;
  grn: GRN & {
    purchaseOrder: PurchaseOrder;
  };
}

interface Invoice {
  id: number;
  projectId: number;
  projectSupplierId: number;
  purchaseOrderId: number | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null; // Due date for the invoice
  paymentType: string; // "Down Payment" or "Progress Payment"
  downPayment: number | null;
  invoiceAmount: number; // Invoice amount before VAT
  vatAmount: number; // VAT amount at 5%
  downPaymentRecovery: number | null; // Down Payment Recovery (for Progress Payment)
  totalAmount: number; // Total amount with VAT - Down Payment Recovery
  status?: string; // "paid", "partially_paid", or "unpaid"
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: PurchaseOrder | null;
  invoiceGRNs: InvoiceGRN[];
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
  projectSupplierId: number;
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

interface SupplierDetailViewProps {
  projectId: number;
  projectName: string;
  supplierId: number;
  onBack: () => void;
}

export default function SupplierDetailView({ projectId, projectName, supplierId, onBack }: SupplierDetailViewProps) {
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
  const [projectSupplier, setProjectSupplier] = useState<ProjectSupplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [showPOForm, setShowPOForm] = useState(false);
  const [grns, setGrns] = useState<Record<number, GRN[]>>({});
  const [expandedPOs, setExpandedPOs] = useState<Set<number>>(new Set());
  const [editingGRN, setEditingGRN] = useState<GRN | null>(null);
  const [showGRNForm, setShowGRNForm] = useState<number | null>(null); // poId
  const [grnFormData, setGrnFormData] = useState({
    grnRefNo: '',
    grnDate: '',
    deliveredAmount: '',
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '', // Due date for the invoice
    paymentType: 'Progress Payment' as 'Down Payment' | 'Progress Payment',
    downPayment: '',
    selectedPurchaseOrderId: null as number | null, // For Down Payment
    selectedProgressPOId: null as number | null, // For Progress Payment - PO selection
    selectedGrnIds: [] as number[],
    vatAmount: '', // Editable VAT amount
    downPaymentRecovery: '', // Down Payment Recovery (for Progress Payment)
  });
  const [hasDownPayment, setHasDownPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'pos' | 'grns' | 'invoices' | 'payments' | 'performance'>('pos');
  const [poFilterId, setPoFilterId] = useState<number | null>(null); // Global PO filter for all tabs and cards
  const [grnFilterPOId, setGrnFilterPOId] = useState<number | null>(null);
  const [invoiceFilterPOId, setInvoiceFilterPOId] = useState<number | null>(null);
  const [paymentFilterPOId, setPaymentFilterPOId] = useState<number | null>(null);
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
  const [performanceFormData, setPerformanceFormData] = useState({
    performanceRating: null as number | null,
    performanceReview: '',
  });
  const [isEditingPerformance, setIsEditingPerformance] = useState(false);

  const loadData = useCallback(async () => {
    if (isNaN(projectId) || isNaN(supplierId)) {
      setError('Invalid project or supplier ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [projectSuppliersRes, purchaseOrdersRes] = await Promise.all([
        get<{ success: boolean; data?: ProjectSupplier[]; error?: string }>(
          `/api/admin/project-suppliers?projectId=${projectId}`
        ),
        get<PurchaseOrdersResponse>(
          `/api/admin/project-suppliers/${supplierId}/purchase-orders`
        ),
      ]);

      if (!projectSuppliersRes?.success) {
        throw new Error(projectSuppliersRes?.error || 'Failed to load project supplier');
      }

      const supplier = projectSuppliersRes.data?.find(ps => ps.id === supplierId);
      if (!supplier) {
        throw new Error('Project supplier not found');
      }

      setProjectSupplier(supplier);
      
      // Load performance data if available
      if (supplier.performanceRating || supplier.performanceReview) {
        setPerformanceFormData({
          performanceRating: supplier.performanceRating || null,
          performanceReview: supplier.performanceReview || '',
        });
      }
      
      const pos = purchaseOrdersRes.data || [];
      setPurchaseOrders(pos);

      // Load GRNs for all POs
      const grnPromises = pos.map(async (po) => {
        try {
          const grnRes = await get<GRNsResponse>(`/api/admin/purchase-orders/${po.id}/grns`);
          return { poId: po.id, grns: grnRes.data || [] };
        } catch (error) {
          console.error(`Failed to load GRNs for PO ${po.id}:`, error);
          return { poId: po.id, grns: [] };
        }
      });

      const grnResults = await Promise.all(grnPromises);
      const grnMap: Record<number, GRN[]> = {};
      grnResults.forEach(({ poId, grns }) => {
        grnMap[poId] = grns;
      });
      setGrns(grnMap);

      // Load invoices for this supplier
      const invoicesRes = await get<InvoicesResponse>(`/api/admin/project-suppliers/${supplierId}/invoices`);
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }

      // Load payments for this supplier (needed for summary cards calculations)
      try {
        const paymentsRes = await get<PaymentsResponse>(`/api/admin/project-suppliers/${supplierId}/payments`);
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

      // Check if a down payment exists for this project (across all suppliers)
      // We'll check this by loading all invoices for the project
      try {
        const allProjectInvoicesRes = await get<{ success: boolean; data?: Invoice[] }>(
          `/api/admin/projects/${projectId}/invoices`
        );
        if (allProjectInvoicesRes.success && allProjectInvoicesRes.data) {
          const downPaymentExists = allProjectInvoicesRes.data.some(inv => inv.paymentType === 'Down Payment');
          setHasDownPayment(downPaymentExists);
        }
      } catch (error) {
        // If the endpoint doesn't exist yet, we'll check when switching to invoices tab
        console.log('Could not check project-wide invoices, will check when loading invoices tab');
      }
    } catch (fetchError: any) {
      console.error('Failed to load supplier details:', fetchError);
      setError(fetchError?.message || 'Failed to load supplier information.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId, supplierId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadGRNs = useCallback(async (poId: number) => {
    try {
      const response = await get<GRNsResponse>(`/api/admin/purchase-orders/${poId}/grns`);
      if (response.success && response.data) {
        setGrns((prev) => ({
          ...prev,
          [poId]: response.data || [],
        }));
      }
    } catch (error: any) {
      console.error('Failed to load GRNs:', error);
      setError(error?.message || 'Failed to load GRNs.');
    }
  }, [get]);

  const loadInvoices = useCallback(async () => {
    try {
      // Check if a down payment exists for this project (across all suppliers)
      try {
        const downPaymentCheck = await get<{ success: boolean; data?: Invoice[] }>(`/api/admin/projects/${projectId}/invoices`);
        if (downPaymentCheck.success && downPaymentCheck.data) {
          const downPaymentExists = downPaymentCheck.data.some(inv => inv.paymentType === 'Down Payment');
          setHasDownPayment(downPaymentExists);
        }
      } catch (error) {
        // If endpoint doesn't exist, will check from supplier invoices below
      }

      const response = await get<InvoicesResponse>(`/api/admin/project-suppliers/${supplierId}/invoices`);
      if (response.success && response.data) {
        setInvoices(response.data);
        // Also check if any invoice in this supplier is a down payment (fallback)
        if (response.data.some(inv => inv.paymentType === 'Down Payment')) {
          setHasDownPayment(true);
        }
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      setError(error?.message || 'Failed to load invoices.');
    }
  }, [get, supplierId, projectId]);

  const loadPayments = useCallback(async () => {
    try {
      const response = await get<PaymentsResponse>(`/api/admin/project-suppliers/${supplierId}/payments`);
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
  }, [get, supplierId]);

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
    // Load GRNs for all POs when switching to GRNs tab
    if (activeTab === 'grns' && purchaseOrders.length > 0) {
      purchaseOrders.forEach(po => {
        if (!grns[po.id]) {
          loadGRNs(po.id);
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
    if (activeTab === 'performance' && projectSupplier) {
      const hasPerformanceData = projectSupplier.performanceRating || projectSupplier.performanceReview;
      setPerformanceFormData({
        performanceRating: projectSupplier.performanceRating || null,
        performanceReview: projectSupplier.performanceReview || '',
      });
      // Only show form if there's no existing data, otherwise show saved view
      setIsEditingPerformance(!hasPerformanceData);
    }
    
    // Reset filters when switching tabs
    if (activeTab !== 'grns') {
      setGrnFilterPOId(null);
    }
    if (activeTab !== 'invoices') {
      setInvoiceFilterPOId(null);
    }
    if (activeTab !== 'payments') {
      setPaymentFilterPOId(null);
    }
  }, [activeTab, purchaseOrders, grns, loadGRNs, loadInvoices, loadPayments]);

  const loadPurchaseOrders = useCallback(async () => {
    try {
      const response = await get<PurchaseOrdersResponse>(
        `/api/admin/project-suppliers/${supplierId}/purchase-orders`
      );
      if (response.success && response.data) {
        setPurchaseOrders(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load purchase orders:', error);
      setError(error?.message || 'Failed to load purchase orders.');
    }
  }, [get, supplierId]);

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
          `/api/admin/project-suppliers/${supplierId}/purchase-orders/${editingPO.id}`,
          poData
        );
      } else {
        await post<{ success: boolean; data?: PurchaseOrder }>(
          `/api/admin/project-suppliers/${supplierId}/purchase-orders`,
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
  }, [poFormData, editingPO, supplierId, post, put, loadPurchaseOrders]);

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
        await del(`/api/admin/project-suppliers/${supplierId}/purchase-orders/${poId}`);
        await loadPurchaseOrders();
      } catch (deleteError: any) {
        console.error('Failed to delete purchase order:', deleteError);
        setError(deleteError?.message || 'Failed to delete purchase order.');
      }
    },
    [del, supplierId, loadPurchaseOrders]
  );

  const handleSaveGRN = useCallback(async (poId: number) => {
    if (!grnFormData.grnRefNo || !grnFormData.grnDate || !grnFormData.deliveredAmount) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const grnData = {
        grnRefNo: grnFormData.grnRefNo,
        grnDate: grnFormData.grnDate,
        deliveredAmount: grnFormData.deliveredAmount,
      };

      if (editingGRN) {
        await put<{ success: boolean; data?: GRN }>(
          `/api/admin/purchase-orders/${poId}/grns/${editingGRN.id}`,
          grnData
        );
      } else {
        await post<{ success: boolean; data?: GRN }>(
          `/api/admin/purchase-orders/${poId}/grns`,
          grnData
        );
      }

      await loadGRNs(poId);
      setShowGRNForm(null);
      setEditingGRN(null);
      setGrnFormData({
        grnRefNo: '',
        grnDate: '',
        deliveredAmount: '',
      });
    } catch (submitError: any) {
      console.error('Failed to save GRN:', submitError);
      setError(submitError?.message || 'Failed to save GRN.');
    } finally {
      setIsSaving(false);
    }
  }, [grnFormData, editingGRN, post, put, loadGRNs]);

  const handleEditGRN = useCallback((grn: GRN) => {
    setEditingGRN(grn);
    setShowGRNForm(grn.purchaseOrderId);
    setGrnFormData({
      grnRefNo: grn.grnRefNo,
      grnDate: formatDateForInput(grn.grnDate),
      deliveredAmount: grn.deliveredAmount.toString(),
    });
  }, []);

  const handleDeleteGRN = useCallback(
    async (poId: number, grnId: number, grnRefNo: string) => {
      if (!confirm(`Delete GRN ${grnRefNo}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/purchase-orders/${poId}/grns/${grnId}`);
        await loadGRNs(poId);
      } catch (deleteError: any) {
        console.error('Failed to delete GRN:', deleteError);
        setError(deleteError?.message || 'Failed to delete GRN.');
      }
    },
    [del, loadGRNs]
  );

  const togglePOExpand = useCallback((poId: number) => {
    setExpandedPOs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(poId)) {
        newSet.delete(poId);
      } else {
        newSet.add(poId);
        // Load GRNs if not already loaded
        if (!grns[poId]) {
          loadGRNs(poId);
        }
      }
      return newSet;
    });
  }, [grns, loadGRNs]);

  // Calculate invoice amounts based on payment type
  const calculateInvoiceAmounts = useCallback(() => {
    let invoiceAmount = 0;

    if (invoiceFormData.paymentType === 'Down Payment') {
      invoiceAmount = parseFloat(invoiceFormData.downPayment) || 0;
    } else {
      // Progress Payment - sum of selected GRN amounts from the selected PO
      if (invoiceFormData.selectedProgressPOId && grns[invoiceFormData.selectedProgressPOId]) {
        invoiceAmount = invoiceFormData.selectedGrnIds.reduce((sum, grnId) => {
          const grn = grns[invoiceFormData.selectedProgressPOId!].find(g => g.id === grnId);
          if (grn) {
            return sum + Number(grn.deliveredAmount);
          }
          return sum;
        }, 0);
      }
    }

    // Down Payment Recovery (only for Progress Payment) - deducted BEFORE VAT
    const downPaymentRecovery = invoiceFormData.paymentType === 'Progress Payment' 
      ? (parseFloat(invoiceFormData.downPaymentRecovery) || 0) 
      : 0;
    
    // Amount after recovery (before VAT)
    const amountAfterRecovery = invoiceAmount - downPaymentRecovery;
    
    // Use editable VAT amount if provided, otherwise calculate VAT of amount after recovery
    const vatAmount = invoiceFormData.vatAmount ? parseFloat(invoiceFormData.vatAmount) : (amountAfterRecovery * vatDecimal);
    
    // Total amount = Amount after recovery + VAT
    const totalAmount = amountAfterRecovery + vatAmount;

    return {
      invoiceAmount: Number(invoiceAmount.toFixed(2)),
      downPaymentRecovery: Number(downPaymentRecovery.toFixed(2)),
      amountAfterRecovery: Number(amountAfterRecovery.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }, [invoiceFormData, grns]);

  // Helper function to get invoice validation errors (user-friendly messages)
  const getInvoiceValidationErrors = useCallback(() => {
    const errors: string[] = [];
    
    if (!invoiceFormData.invoiceNumber) {
      errors.push('Please enter an invoice number.');
    }
    
    if (!invoiceFormData.invoiceDate) {
      errors.push('Please select an invoice date.');
    }

    if (invoiceFormData.paymentType === 'Down Payment') {
      if (!invoiceFormData.downPayment || parseFloat(invoiceFormData.downPayment) <= 0) {
        errors.push('Please enter a down payment amount for Down Payment type.');
      }
      if (!invoiceFormData.selectedPurchaseOrderId) {
        errors.push('Please select a Purchase Order for Down Payment type.');
      }
    } else {
      if (!invoiceFormData.selectedProgressPOId) {
        errors.push('Please select a Purchase Order for Progress Payment type.');
      }
      if (invoiceFormData.selectedGrnIds.length === 0) {
        errors.push('Please select at least one GRN for Progress Payment type.');
      }
    }

    return errors;
  }, [invoiceFormData]);

  const handleSaveInvoice = useCallback(async () => {
    console.log('handleSaveInvoice called with:', {
      invoiceNumber: invoiceFormData.invoiceNumber,
      invoiceDate: invoiceFormData.invoiceDate,
      paymentType: invoiceFormData.paymentType,
      selectedProgressPOId: invoiceFormData.selectedProgressPOId,
      selectedGrnIds: invoiceFormData.selectedGrnIds,
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
      
      // Amount after recovery (before VAT) - this is the Invoice Amount (excluding VAT)
      const amountAfterRecovery = amounts.invoiceAmount - finalDownPaymentRecovery;
      
      // Use the editable VAT amount if provided, otherwise calculate VAT of amount after recovery
      const finalVatAmount = invoiceFormData.vatAmount && parseFloat(invoiceFormData.vatAmount) > 0 
        ? parseFloat(invoiceFormData.vatAmount) 
        : (amountAfterRecovery * vatDecimal);
      
      // Total amount = Amount after recovery + VAT
      const finalTotalAmount = amountAfterRecovery + finalVatAmount;

      // Invoice Amount should be the amount after recovery (excluding VAT)
      const finalInvoiceAmount = invoiceFormData.paymentType === 'Progress Payment' 
        ? amountAfterRecovery 
        : amounts.invoiceAmount;

      const invoiceData: any = {
        invoiceNumber: invoiceFormData.invoiceNumber,
        invoiceDate: invoiceFormData.invoiceDate,
        dueDate: invoiceFormData.dueDate || null,
        paymentType: invoiceFormData.paymentType,
        downPayment: invoiceFormData.paymentType === 'Down Payment' ? invoiceFormData.downPayment : undefined,
        invoiceAmount: Number(finalInvoiceAmount.toFixed(2)),
        vatAmount: Number(finalVatAmount.toFixed(2)),
        downPaymentRecovery: invoiceFormData.paymentType === 'Progress Payment' ? Number(finalDownPaymentRecovery.toFixed(2)) : undefined,
        totalAmount: Number(finalTotalAmount.toFixed(2)),
      };

      if (invoiceFormData.paymentType === 'Down Payment') {
        invoiceData.purchaseOrderId = invoiceFormData.selectedPurchaseOrderId;
      } else {
        invoiceData.grnIds = invoiceFormData.selectedGrnIds;
      }

      console.log('Sending invoice data:', invoiceData);
      
      let response;
      if (editingInvoice) {
        response = await put<{ success: boolean; data?: Invoice; error?: string }>(
          `/api/admin/project-suppliers/${supplierId}/invoices/${editingInvoice.id}`,
          invoiceData
        );
      } else {
        response = await post<{ success: boolean; data?: Invoice; error?: string }>(
          `/api/admin/project-suppliers/${supplierId}/invoices`,
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
        paymentType: hasDownPayment ? 'Progress Payment' : 'Down Payment',
        downPayment: '',
        selectedPurchaseOrderId: null,
        selectedProgressPOId: null,
        selectedGrnIds: [],
        vatAmount: '',
        downPaymentRecovery: '',
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
  }, [invoiceFormData, editingInvoice, supplierId, hasDownPayment, post, put, loadInvoices, calculateInvoiceAmounts]);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
    
    // For Progress Payment, get the PO from the first GRN
    let progressPOId: number | null = null;
    if (invoice.paymentType === 'Progress Payment' && invoice.invoiceGRNs.length > 0) {
      progressPOId = invoice.invoiceGRNs[0].grn.purchaseOrderId;
    }
    
    setInvoiceFormData({
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: formatDateForInput(invoice.invoiceDate) || '',
      dueDate: invoice.dueDate ? formatDateForInput(invoice.dueDate) : '',
      paymentType: invoice.paymentType as 'Down Payment' | 'Progress Payment',
      downPayment: invoice.downPayment?.toString() || '',
      selectedPurchaseOrderId: invoice.paymentType === 'Down Payment' ? (invoice.purchaseOrderId || null) : null,
      selectedProgressPOId: invoice.paymentType === 'Progress Payment' ? progressPOId : null,
      selectedGrnIds: invoice.invoiceGRNs.map(ig => ig.grnId),
      vatAmount: invoice.vatAmount?.toString() || '',
      downPaymentRecovery: invoice.downPaymentRecovery?.toString() || '',
    });
  }, []);

  const handleDeleteInvoice = useCallback(
    async (invoiceId: number, invoiceNumber: string) => {
      if (!confirm(`Delete Invoice ${invoiceNumber}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-suppliers/${supplierId}/invoices/${invoiceId}`);
        await loadInvoices();
      } catch (deleteError: any) {
        console.error('Failed to delete invoice:', deleteError);
        setError(deleteError?.message || 'Failed to delete invoice.');
      }
    },
    [del, supplierId, loadInvoices]
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
          `/api/admin/project-suppliers/${supplierId}/payments/${editingPayment.id}`,
          paymentData
        );
      } else {
        console.log('Creating new payment');
        response = await post<{ success: boolean; data?: Payment; error?: string }>(
          `/api/admin/project-suppliers/${supplierId}/payments`,
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
  }, [paymentFormData, editingPayment, supplierId, invoices, post, put, loadPayments, loadInvoices]);

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
          `/api/admin/project-suppliers/${supplierId}/payments/${payment.id}`,
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
    [put, supplierId, loadPayments, loadInvoices]
  );

  const handleDeletePayment = useCallback(
    async (paymentId: number, invoiceNumber: string) => {
      if (!confirm(`Delete payment for invoice ${invoiceNumber}?`)) {
        return;
      }

      try {
        await del(`/api/admin/project-suppliers/${supplierId}/payments/${paymentId}`);
        // Reload both payments and invoices to update status and summary cards
        await Promise.all([loadPayments(), loadInvoices()]);
      } catch (deleteError: any) {
        console.error('Failed to delete payment:', deleteError);
        setError(deleteError?.message || 'Failed to delete payment.');
      }
    },
    [del, supplierId, loadPayments, loadInvoices]
  );

  // Filtered data calculated once for use throughout component - MUST be before any conditional returns
  const filteredPurchaseOrders = useMemo(() => {
    return poFilterId 
      ? purchaseOrders.filter(po => po.id === poFilterId)
      : purchaseOrders;
  }, [poFilterId, purchaseOrders]);

  const filteredInvoices = useMemo(() => {
    return poFilterId
      ? invoices.filter(invoice => {
          // For Down Payment invoices, check purchaseOrderId
          if (invoice.paymentType === 'Down Payment') {
            return invoice.purchaseOrderId === poFilterId;
          }
          // For Progress Payment invoices, check if any GRN belongs to the selected PO
          if (invoice.paymentType === 'Progress Payment') {
            return invoice.invoiceGRNs?.some(ig => ig.grn?.purchaseOrderId === poFilterId);
          }
          return false;
        })
      : invoices;
  }, [poFilterId, invoices]);

  const filteredPayments = useMemo(() => {
    return poFilterId
      ? payments.filter(payment => {
          // Check if any invoice in this payment has GRNs that belong to the selected PO
          return payment.paymentInvoices?.some(pi => {
            const invoice = pi.invoice;
            if (!invoice) return false;
            
            // For Down Payment invoices, check purchaseOrderId
            if (invoice.paymentType === 'Down Payment') {
              return invoice.purchaseOrderId === poFilterId;
            }
            
            // For Progress Payment invoices, check if any GRN belongs to the selected PO
            if (invoice.paymentType === 'Progress Payment') {
              return invoice.invoiceGRNs?.some(ig => ig.grn?.purchaseOrderId === poFilterId);
            }
            
            return false;
          });
        })
      : payments;
  }, [poFilterId, payments]);

  const filteredGRNs = useMemo(() => {
    return poFilterId
      ? Object.entries(grns).filter(([poId]) => Number(poId) === poFilterId).reduce((acc, [poId, poGrns]) => {
          acc[Number(poId)] = poGrns;
          return acc;
        }, {} as Record<number, GRN[]>)
      : grns;
  }, [poFilterId, grns]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: colors.primary }}
        />
        <p style={{ color: colors.textSecondary }}>Loading supplier details…</p>
      </div>
    );
  }

  if (!projectSupplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p style={{ color: colors.error }}>Supplier not found</p>
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

  const supplier = projectSupplier.supplier;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
        <button
          onClick={onBack}
          className="hover:underline"
          style={{ color: colors.primary }}
        >
          Suppliers
        </button>
        <ChevronRight className="h-4 w-4" />
        <span style={{ color: colors.textPrimary }}>{supplier.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {supplier.name}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Supplier Details
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

      {/* Supplier Information */}
      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
        }}
      >
        <h2 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
          Supplier Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Supplier Name
            </label>
            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
              {supplier.name}
            </p>
          </div>
          {supplier.vendorCode && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Vendor Code
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {supplier.vendorCode}
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Type
            </label>
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              {supplier.type}
            </p>
          </div>
          {supplier.contactPerson && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Contact Person
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {supplier.contactPerson}
              </p>
            </div>
          )}
          {supplier.contactNumber && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Contact Number
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {supplier.contactNumber}
              </p>
            </div>
          )}
          {supplier.email && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Email
              </label>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {supplier.email}
              </p>
            </div>
          )}
        </div>

        {supplier.typeOfWorks && supplier.typeOfWorks.length > 0 && (
          <div className="mt-6">
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
              Type of Works
            </label>
            <div className="flex flex-wrap gap-2">
              {supplier.typeOfWorks.map((link) => (
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

        {projectSupplier.notes && (
          <div className="mt-6">
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Project Notes
            </label>
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              {projectSupplier.notes}
            </p>
          </div>
        )}
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
        // Use filtered data calculated at component level

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

        // Calculate Total Delivered (sum of all GRN deliveredAmount) with VAT - filtered
        const totalDeliveredBase = Object.values(filteredGRNs).reduce((sum, poGrns) => {
          return sum + poGrns.reduce((poSum, grn) => {
            return poSum + Number(grn.deliveredAmount || 0);
          }, 0);
        }, 0);
        const totalDelivered = totalDeliveredBase * vatMultiplier; // Add VAT

        // Calculate Total PO Amounts without VAT - filtered
        const totalPOAmountsWithoutVat = filteredPurchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0);
        }, 0);

        // Calculate Total PO Amounts (with VAT) - filtered
        const totalPOAmountsWithVat = filteredPurchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValueWithVat || 0);
        }, 0);

        // Calculate VAT Amount = Total with VAT - Total without VAT
        const totalPOVatAmount = totalPOAmountsWithVat - totalPOAmountsWithoutVat;

        // Calculate LPO Balance: (Total PO amount - Delivered amount) * VAT multiplier (with VAT) - filtered
        const totalPOAmount = filteredPurchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0); // Use base LPO value without VAT
        }, 0);
        
        const lpoBalanceBeforeVat = totalPOAmount - totalDeliveredBase;
        const lpoBalance = lpoBalanceBeforeVat * vatMultiplier; // Add VAT

        // Calculate Due Amount (invoices past due date) - filtered
        // Use invoice data directly from DB, not payments state
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate paid amounts from invoice data (from DB)
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

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                    PO Amounts
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalPOAmountsWithoutVat)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Without VAT
                  </p>
                </div>
                
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    VAT Amount
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.primary }}>
                    {formatCurrencyWithDecimals(totalPOVatAmount)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total PO Amounts
                  </p>
                  <p className="text-base font-bold" style={{ color: colors.primary }}>
                    {formatCurrencyWithDecimals(totalPOAmountsWithVat)}
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
                    Total Delivered
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalDelivered)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    With VAT
                  </p>
                </div>
                
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    LPO Balance
                  </p>
                  <p className="text-lg font-bold" style={{ color: lpoBalance > 0 ? colors.warning : colors.success }}>
                    {formatCurrencyWithDecimals(lpoBalance)}
                  </p>
                </div>
                
                <div className="pb-3 border-b" style={{ borderColor: colors.borderLight }}>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Invoiced
                  </p>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(totalInvoiced)}
                  </p>
                </div>
                
                <div>
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
          {activeTab === 'grns' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                if (purchaseOrders.length === 0) {
                  setError('Please add a Purchase Order first before adding GRNs.');
                  return;
                }
                // Set the first PO as default for GRN creation
                setShowGRNForm(purchaseOrders[0].id);
                setEditingGRN(null);
                setGrnFormData({
                  grnRefNo: '',
                  grnDate: '',
                  deliveredAmount: '',
                });
              }}
            >
              Add GRN
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
                  paymentType: hasDownPayment ? 'Progress Payment' : 'Down Payment',
                  downPayment: '',
                  selectedPurchaseOrderId: null,
                  selectedGrnIds: [],
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
              onClick={() => setActiveTab('grns')}
              className="inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'grns' ? colors.primary : 'transparent',
                color: activeTab === 'grns' ? colors.primary : colors.textSecondary,
              }}
            >
              <Package className="w-4 h-4 mr-2" style={{
                color: activeTab === 'grns' ? colors.primary : colors.textSecondary,
              }} />
              GRNs
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
              {filteredPurchaseOrders.length > 0 ? (
                filteredPurchaseOrders.map((po) => {
                  const poGrns = filteredGRNs[po.id] || [];
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
                              size="sm"
                              onClick={() => handleEditPO(po)}
                              className="h-7 w-7"
                              style={{ color: colors.info }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
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
              )}
            </tbody>
          </table>
                              </div>
          </>
        )}

        {activeTab === 'grns' && (
          <div className="space-y-6">
            {showGRNForm && (
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
                                        {editingGRN ? 'Edit GRN' : 'Add GRN'}
                    </h3>
                          <Button
                            variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setShowGRNForm(null);
                                          setEditingGRN(null);
                                          setGrnFormData({
                                            grnRefNo: '',
                                            grnDate: '',
                                            advancePayment: '',
                                            deliveredAmount: '',
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
                      value={showGRNForm || ''}
                      onChange={(e) => setShowGRNForm(Number(e.target.value))}
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
                  {showGRNForm && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          GRN Ref. No. *
                                        </label>
                                        <Input
                                          type="text"
                                          value={grnFormData.grnRefNo}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, grnRefNo: e.target.value })}
                                          placeholder="Enter GRN Ref. No."
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          GRN Date *
                                        </label>
                                        <Input
                                          type="date"
                                          value={grnFormData.grnDate}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, grnDate: e.target.value })}
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Delivered Amount (Excluding VAT) *
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={grnFormData.deliveredAmount}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, deliveredAmount: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                              backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                <Button
                                        variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                          setShowGRNForm(null);
                                    setEditingGRN(null);
                                    setGrnFormData({
                                      grnRefNo: '',
                                      grnDate: '',
                                      deliveredAmount: '',
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
                          onClick={() => showGRNForm && handleSaveGRN(showGRNForm)}
                                        isLoading={isSaving}
                          disabled={isSaving || !showGRNForm || !grnFormData.grnRefNo || !grnFormData.grnDate || !grnFormData.deliveredAmount}
                                      >
                                        {editingGRN ? 'Update' : 'Save'}
                                </Button>
                              </div>
                    </>
                  )}
                                  </div>
                                </Card>
                              )}

                              {/* PO Filter for GRNs */}
                                <Card
                                className="p-4 mb-4 transition-all duration-200"
                                style={{
                                  backgroundColor: grnFilterPOId ? `${colors.primary}08` : colors.backgroundPrimary,
                                  borderColor: grnFilterPOId ? `${colors.primary}30` : colors.borderLight,
                                  borderWidth: grnFilterPOId ? '1.5px' : '1px',
                                }}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5 transition-colors" style={{ color: grnFilterPOId ? colors.primary : colors.textSecondary }} />
                                    <h3 className="text-base font-semibold transition-colors" style={{ color: grnFilterPOId ? colors.primary : colors.textPrimary }}>
                                      Filter by Purchase Order
                                    </h3>
                                    {grnFilterPOId && (
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
                                      value={grnFilterPOId || ''}
                                      onChange={(e) => setGrnFilterPOId(e.target.value ? parseInt(e.target.value) : null)}
                                      className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm"
                                  style={{
                                    backgroundColor: colors.backgroundSecondary,
                                        borderColor: grnFilterPOId ? `${colors.primary}40` : colors.borderLight,
                                        color: colors.textPrimary,
                                        outline: 'none',
                                        minWidth: '250px',
                                        boxShadow: grnFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none',
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = `${colors.primary}60`;
                                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = grnFilterPOId ? `${colors.primary}40` : colors.borderLight;
                                        e.target.style.boxShadow = grnFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none';
                                      }}
                                    >
                                      <option value="">All Purchase Orders</option>
                                      {purchaseOrders.map((po) => (
                                        <option key={po.id} value={po.id}>
                                          {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                                        </option>
                                      ))}
                                    </select>
                                    {grnFilterPOId && (() => {
                                      const filteredCount = Object.entries(grns).reduce((count, [poId, poGrns]) => {
                                        return Number(poId) === grnFilterPOId ? count + poGrns.length : count;
                                      }, 0);
                                      const selectedPO = purchaseOrders.find(po => po.id === grnFilterPOId);
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
                                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20` }}>
                                            {filteredCount} {filteredCount === 1 ? 'GRN' : 'GRNs'}
                                          </span>
                                          <button
                                            onClick={() => setGrnFilterPOId(null)}
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

                              <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ borderColor: colors.borderLight }}>
                                  <thead>
                  <tr style={{ backgroundColor: `${colors.primary}20` }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      PO No.
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        GRN Ref. No.
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        GRN Date
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Delivered Amount (Excluding VAT)
                                      </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                  {Object.keys(grns).length > 0 ? (() => {
                    // Filter GRNs by selected PO if filter is set (use global filter if set, otherwise use tab filter)
                    const activeFilterPOId = poFilterId || grnFilterPOId;
                    const filteredEntries = activeFilterPOId 
                      ? Object.entries(grns).filter(([poId]) => Number(poId) === activeFilterPOId)
                      : Object.entries(grns);
                    
                    if (filteredEntries.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                            No GRNs found for the selected PO.
                          </td>
                        </tr>
                      );
                    }
                    
                    return filteredEntries.map(([poId, poGrns]) => {
                      const po = purchaseOrders.find(p => p.id === Number(poId));
                      return poGrns.map((grn) => (
                                        <tr key={grn.id} style={{ backgroundColor: `${colors.info}08` }}>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                            {po?.lpoNumber || '-'}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {grn.grnRefNo}
                                          </td>
                          <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {new Date(grn.grnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {formatCurrencyWithDecimals(Number(grn.deliveredAmount))}
                                          </td>
                          <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                            <div className="flex items-center justify-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditGRN(grn)}
                                className="h-7 w-7"
                                                style={{ color: colors.info }}
                                              >
                                <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                onClick={() => handleDeleteGRN(grn.purchaseOrderId, grn.id, grn.grnRefNo)}
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
                      <td colSpan={5} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                                          No GRNs yet. Click "Add GRN" to add one.
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
                                        size="sm"
                                        onClick={() => {
                        setShowInvoiceForm(false);
                        setEditingInvoice(null);
                        setError(null);
                        setInvoiceFormData({
                                            invoiceNumber: '',
                                            invoiceDate: '',
                          paymentType: hasDownPayment ? 'Progress Payment' : 'Down Payment',
                          downPayment: '',
                          selectedPurchaseOrderId: null,
                          selectedGrnIds: [],
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
                          const newPaymentType = e.target.value as 'Down Payment' | 'Progress Payment';
                          setInvoiceFormData({
                            ...invoiceFormData,
                            paymentType: newPaymentType,
                            downPayment: newPaymentType === 'Progress Payment' ? '' : invoiceFormData.downPayment,
                            selectedPurchaseOrderId: newPaymentType === 'Progress Payment' ? null : invoiceFormData.selectedPurchaseOrderId,
                            selectedProgressPOId: newPaymentType === 'Down Payment' ? null : null,
                            selectedGrnIds: newPaymentType === 'Down Payment' ? [] : invoiceFormData.selectedGrnIds,
                            vatAmount: '', // Reset VAT when payment type changes
                          });
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                          style={{
                          backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                        disabled={hasDownPayment && !editingInvoice}
                      >
                        <option value="Down Payment">Down Payment</option>
                        <option value="Progress Payment">Progress Payment</option>
                      </select>
                      {hasDownPayment && !editingInvoice && (
                        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                          A down payment already exists for this project
                        </p>
                      )}
                                      </div>
                    {invoiceFormData.paymentType === 'Down Payment' && (
                      <>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Purchase Order *
                                        </label>
                          <select
                            value={invoiceFormData.selectedPurchaseOrderId || ''}
                            onChange={(e) => {
                              const poId = e.target.value ? parseInt(e.target.value) : null;
                              setInvoiceFormData({
                                ...invoiceFormData,
                                selectedPurchaseOrderId: poId,
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
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Down Payment Amount *
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
                                      </div>
                      </>
                    )}
                    {/* VAT Amount Field - shown for both payment types */}
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
                                    </div>
                  {invoiceFormData.paymentType === 'Progress Payment' && (
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
                              selectedGrnIds: [], // Clear selected GRNs when PO changes
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
                      {invoiceFormData.selectedProgressPOId && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textPrimary }}>
                            Select GRNs *
                          </label>
                          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto" style={{
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.borderLight,
                          }}>
                            {grns[invoiceFormData.selectedProgressPOId] && grns[invoiceFormData.selectedProgressPOId].length > 0 ? (
                              <div className="space-y-2">
                                {(() => {
                                  // Get all GRN IDs that are already invoiced (excluding the current invoice being edited)
                                  const invoicedGrnIds = new Set<number>();
                                  invoices.forEach(invoice => {
                                    // Exclude the current invoice being edited
                                    if (editingInvoice && invoice.id === editingInvoice.id) {
                                      return;
                                    }
                                    // Add all GRN IDs from this invoice
                                    invoice.invoiceGRNs.forEach(ig => {
                                      invoicedGrnIds.add(ig.grnId);
                                    });
                                  });
                                  
                                  // Filter out already-invoiced GRNs
                                  const availableGrns = grns[invoiceFormData.selectedProgressPOId].filter(grn => 
                                    !invoicedGrnIds.has(grn.id) || invoiceFormData.selectedGrnIds.includes(grn.id)
                                  );
                                  
                                  if (availableGrns.length === 0) {
                                    return (
                                      <p className="text-xs text-center py-4" style={{ color: colors.textSecondary }}>
                                        All GRNs for this Purchase Order have already been invoiced.
                                      </p>
                                    );
                                  }
                                  
                                  return availableGrns.map((grn) => {
                                    const isSelected = invoiceFormData.selectedGrnIds.includes(grn.id);
                                    const isAlreadyInvoiced = invoicedGrnIds.has(grn.id);
                                    return (
                                    <div 
                                      key={grn.id} 
                                      className="flex items-center space-x-3 p-2 hover:bg-opacity-50 transition-colors"
                                      style={{
                                        backgroundColor: isSelected ? `${colors.primary}10` : 'transparent',
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setInvoiceFormData({
                                              ...invoiceFormData,
                                              selectedGrnIds: [...invoiceFormData.selectedGrnIds, grn.id],
                                            });
                                          } else {
                                            setInvoiceFormData({
                                              ...invoiceFormData,
                                              selectedGrnIds: invoiceFormData.selectedGrnIds.filter(id => id !== grn.id),
                                            });
                                          }
                                        }}
                                        className="w-5 h-5 cursor-pointer"
                                        style={{ 
                                          accentColor: colors.primary,
                                          border: isSelected ? `2px solid ${colors.primary}` : `2px solid ${colors.borderLight}`,
                                          borderRadius: '4px',
                                          backgroundColor: isSelected ? colors.primary : 'transparent',
                                        }}
                                      />
                                      <div className="flex-1 flex items-center justify-between">
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                                          {grn.grnRefNo}
                                          {isAlreadyInvoiced && invoiceFormData.selectedGrnIds.includes(grn.id) && (
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ 
                                              backgroundColor: `${colors.warning}20`, 
                                              color: colors.warning 
                                            }}>
                                              (Current Invoice)
                                            </span>
                                          )}
                                        </span>
                                        <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                          {formatCurrencyWithDecimals(Number(grn.deliveredAmount))}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                              </div>
                            ) : (
                              <p className="text-xs text-center py-4" style={{ color: colors.textSecondary }}>
                                No GRNs available for this PO. Please add GRNs first.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Invoice Amount Display for Progress Payment */}
                      {invoiceFormData.selectedProgressPOId && invoiceFormData.selectedGrnIds.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Delivered Amount (Sum of Selected GRNs)
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
                      {/* Down Payment Recovery Field - only for Progress Payment */}
                      {invoiceFormData.paymentType === 'Progress Payment' && (
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Down Payment Recovery
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                            value={invoiceFormData.downPaymentRecovery || ''}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, downPaymentRecovery: e.target.value })}
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
                      )}
                    </>
                  )}
                  {/* Invoice Amount Summary */}
                  {((invoiceFormData.paymentType === 'Down Payment' && invoiceFormData.downPayment) ||
                    (invoiceFormData.paymentType === 'Progress Payment' && invoiceFormData.selectedGrnIds.length > 0)) && (
                    <div className="border rounded-lg p-4 space-y-2" style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                    }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                        Invoice Summary
                      </h4>
                      <div className={`grid gap-3 ${invoiceFormData.paymentType === 'Progress Payment' ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {invoiceFormData.paymentType === 'Progress Payment' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Delivered Amount (Sum of GRNs)
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(calculateInvoiceAmounts().invoiceAmount)}
                                    </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Down Payment Recovery
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.warning || '#f59e0b' }}>
                                -{formatCurrencyWithDecimals(calculateInvoiceAmounts().downPaymentRecovery)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Invoice Amount (Excluding VAT)
                              </label>
                              <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                                {formatCurrencyWithDecimals(calculateInvoiceAmounts().amountAfterRecovery)}
                              </div>
                            </div>
                          </>
                        )}
                        {invoiceFormData.paymentType === 'Down Payment' && (
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
                          paymentType: hasDownPayment ? 'Progress Payment' : 'Down Payment',
                          downPayment: '',
                          selectedPurchaseOrderId: null,
                          selectedGrnIds: [],
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

                              {/* PO Filter for Invoices */}
                              <Card
                                className="p-4 mb-4 transition-all duration-200"
                                style={{
                                  backgroundColor: invoiceFilterPOId ? `${colors.primary}08` : colors.backgroundPrimary,
                                  borderColor: invoiceFilterPOId ? `${colors.primary}30` : colors.borderLight,
                                  borderWidth: invoiceFilterPOId ? '1.5px' : '1px',
                                }}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5 transition-colors" style={{ color: invoiceFilterPOId ? colors.primary : colors.textSecondary }} />
                                    <h3 className="text-base font-semibold transition-colors" style={{ color: invoiceFilterPOId ? colors.primary : colors.textPrimary }}>
                                      Filter by Purchase Order
                                    </h3>
                                    {invoiceFilterPOId && (
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
                                      value={invoiceFilterPOId || ''}
                                      onChange={(e) => setInvoiceFilterPOId(e.target.value ? parseInt(e.target.value) : null)}
                                      className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm"
                                      style={{
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: invoiceFilterPOId ? `${colors.primary}40` : colors.borderLight,
                                        color: colors.textPrimary,
                                        outline: 'none',
                                        minWidth: '250px',
                                        boxShadow: invoiceFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none',
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = `${colors.primary}60`;
                                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = invoiceFilterPOId ? `${colors.primary}40` : colors.borderLight;
                                        e.target.style.boxShadow = invoiceFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none';
                                      }}
                                    >
                                      <option value="">All Purchase Orders</option>
                                      {purchaseOrders.map((po) => (
                                        <option key={po.id} value={po.id}>
                                          {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                                        </option>
                                      ))}
                                    </select>
                                    {invoiceFilterPOId && (() => {
                                      const filteredInvoices = invoices.filter((invoice) => {
                                        if (invoice.paymentType === 'Down Payment') {
                                          return invoice.purchaseOrderId === invoiceFilterPOId;
                                        }
                                        if (invoice.paymentType === 'Progress Payment') {
                                          return invoice.invoiceGRNs.some(ig => ig.grn.purchaseOrderId === invoiceFilterPOId);
                                        }
                                        return false;
                                      });
                                      const selectedPO = purchaseOrders.find(po => po.id === invoiceFilterPOId);
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
                                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20` }}>
                                            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
                                          </span>
                                          <button
                                            onClick={() => setInvoiceFilterPOId(null)}
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
                      VAT (5%)
                                      </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      Total Amount
                                      </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                      PO / GRNs
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                  {(() => {
                    // Use global filter if set, otherwise use tab-specific filter
                    const activeInvoiceFilterPOId = poFilterId || invoiceFilterPOId;
                    let filteredInvoices = invoices;
                    
                    if (activeInvoiceFilterPOId) {
                      filteredInvoices = invoices.filter((invoice) => {
                        // For Down Payment: check if invoice's PO matches
                        if (invoice.paymentType === 'Down Payment') {
                          return invoice.purchaseOrderId === activeInvoiceFilterPOId;
                        }
                        // For Progress Payment: check if any GRN belongs to the selected PO
                        if (invoice.paymentType === 'Progress Payment') {
                          return invoice.invoiceGRNs.some(ig => ig.grn.purchaseOrderId === activeInvoiceFilterPOId);
                        }
                        return false;
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
                            backgroundColor: invoice.paymentType === 'Down Payment' ? `${colors.info}20` : `${colors.success}20`,
                            color: invoice.paymentType === 'Down Payment' ? colors.info : colors.success,
                          }}>
                            {invoice.paymentType}
                          </span>
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {formatCurrencyWithDecimals(invoice.invoiceAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.primary }}>
                          {formatCurrencyWithDecimals(invoice.vatAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold border" style={{ borderColor: colors.borderLight, color: colors.success }}>
                          {formatCurrencyWithDecimals(invoice.totalAmount)}
                                          </td>
                        <td className="px-4 py-3 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                          {invoice.paymentType === 'Down Payment' ? (
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
                              {invoice.invoiceGRNs.length > 0 ? (
                                invoice.invoiceGRNs.map((ig) => (
                                  <span key={ig.id} className="text-xs px-2 py-1 rounded" style={{
                                    backgroundColor: colors.backgroundPrimary,
                                    color: colors.textPrimary,
                                  }}>
                                    {ig.grn.grnRefNo}
                                  </span>
                                ))
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
                                                size="sm"
                              onClick={() => handleEditInvoice(invoice)}
                              className="h-7 w-7"
                                                style={{ color: colors.info }}
                                              >
                              <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
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
                          {invoiceFilterPOId ? 'No invoices found for the selected PO.' : 'No invoices yet. Click "Add Invoice" to add one.'}
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
                            liquidated: method === 'Post Dated' ? paymentFormData.liquidated : false,
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

            {/* PO Filter for Payments */}
            {activeTab === 'payments' && (
              <Card
                className="p-4 mb-4 transition-all duration-200"
                style={{
                  backgroundColor: paymentFilterPOId ? `${colors.primary}08` : colors.backgroundPrimary,
                  borderColor: paymentFilterPOId ? `${colors.primary}30` : colors.borderLight,
                  borderWidth: paymentFilterPOId ? '1.5px' : '1px',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 transition-colors" style={{ color: paymentFilterPOId ? colors.primary : colors.textSecondary }} />
                    <h3 className="text-base font-semibold transition-colors" style={{ color: paymentFilterPOId ? colors.primary : colors.textPrimary }}>
                      Filter by Purchase Order
                    </h3>
                    {paymentFilterPOId && (
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
                      value={paymentFilterPOId || ''}
                      onChange={(e) => setPaymentFilterPOId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm"
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: paymentFilterPOId ? `${colors.primary}40` : colors.borderLight,
                        color: colors.textPrimary,
                        outline: 'none',
                        minWidth: '250px',
                        boxShadow: paymentFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = `${colors.primary}60`;
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = paymentFilterPOId ? `${colors.primary}40` : colors.borderLight;
                        e.target.style.boxShadow = paymentFilterPOId ? `0 0 0 3px ${colors.primary}15` : 'none';
                      }}
                    >
                      <option value="">All Purchase Orders</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.lpoNumber} - {formatCurrencyWithDecimals(Number(po.lpoValueWithVat))}
                        </option>
                      ))}
                    </select>
                    {paymentFilterPOId && (() => {
                      const filteredPayments = payments.filter((payment) => {
                        // Check if any invoice in this payment has GRNs that belong to the selected PO
                        return payment.paymentInvoices?.some(pi => {
                          const invoice = pi.invoice;
                          if (!invoice) return false;
                          
                          // For Down Payment invoices, check purchaseOrderId
                          if (invoice.paymentType === 'Down Payment') {
                            return invoice.purchaseOrderId === paymentFilterPOId;
                          }
                          
                          // For Progress Payment invoices, check if any GRN belongs to the selected PO
                          if (invoice.paymentType === 'Progress Payment') {
                            return invoice.invoiceGRNs?.some(ig => ig.grn?.purchaseOrderId === paymentFilterPOId);
                          }
                          
                          return false;
                        });
                      });
                      const selectedPO = purchaseOrders.find(po => po.id === paymentFilterPOId);
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
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20` }}>
                            {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => setPaymentFilterPOId(null)}
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
            )}

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
                    // Use global filter if set, otherwise use tab-specific filter
                    const activePaymentFilterPOId = poFilterId || paymentFilterPOId;
                    const filteredPayments = activePaymentFilterPOId 
                      ? payments.filter((payment) => {
                          // Check if any invoice in this payment has GRNs that belong to the selected PO
                          return payment.paymentInvoices?.some(pi => {
                            const invoice = pi.invoice;
                            if (!invoice) return false;
                            
                            // For Down Payment invoices, check purchaseOrderId
                            if (invoice.paymentType === 'Down Payment') {
                              return invoice.purchaseOrderId === activePaymentFilterPOId;
                            }
                            
                            // For Progress Payment invoices, check if any GRN belongs to the selected PO
                            if (invoice.paymentType === 'Progress Payment') {
                              return invoice.invoiceGRNs?.some(ig => ig.grn?.purchaseOrderId === activePaymentFilterPOId);
                            }
                            
                            return false;
                          });
                        })
                      : payments;
                    
                    if (filteredPayments.length === 0) {
                      return (
                        <tr>
                          <td colSpan={10} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                            {(poFilterId || paymentFilterPOId) ? 'No payments found for the selected Purchase Order.' : 'No payments recorded yet. Click "Add Payment" to add one.'}
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
                              size="sm"
                              onClick={() => handleEditPayment(payment)}
                              className="h-7 w-7"
                              style={{ color: colors.info }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
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
            {!isEditingPerformance && projectSupplier && (projectSupplier.performanceRating || projectSupplier.performanceReview) ? (
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
                          performanceRating: projectSupplier.performanceRating || null,
                          performanceReview: projectSupplier.performanceReview || '',
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
                      {projectSupplier.performanceRating ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= projectSupplier.performanceRating!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium" style={{ color: colors.textPrimary }}>
                            ({projectSupplier.performanceRating}/5)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: colors.textSecondary }}>Not rated</span>
                      )}
                    </div>
                  </div>

                  {projectSupplier.performanceReview && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                        Review Description
                      </label>
                      <div className="p-3 rounded-lg border min-h-[100px] whitespace-pre-wrap" style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                      }}>
                        {projectSupplier.performanceReview}
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
                    {isEditingPerformance && projectSupplier && (projectSupplier.performanceRating || projectSupplier.performanceReview) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingPerformance(false);
                          setPerformanceFormData({
                            performanceRating: projectSupplier?.performanceRating || null,
                            performanceReview: projectSupplier?.performanceReview || '',
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
                    {isEditingPerformance && projectSupplier && (projectSupplier.performanceRating || projectSupplier.performanceReview) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingPerformance(false);
                          setPerformanceFormData({
                            performanceRating: projectSupplier.performanceRating || null,
                            performanceReview: projectSupplier.performanceReview || '',
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
                          const response = await put<{ success: boolean; data?: ProjectSupplier; error?: string }>(
                            `/api/admin/project-suppliers/${supplierId}`,
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
                            setProjectSupplier({
                              ...projectSupplier!,
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

