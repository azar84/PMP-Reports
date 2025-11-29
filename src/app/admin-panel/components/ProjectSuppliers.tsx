'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Plus, Save, Edit, Trash2, Building2, Tag, Mail, User as UserIcon, Phone, Search, X, Eye, FileText, ShoppingCart, Package, Receipt, CreditCard, AlertCircle, Clock, Wallet, ChevronRight } from 'lucide-react';
import { formatCurrencyWithDecimals } from '@/lib/currency';

interface ProjectSuppliersProps {
  projectId: number;
  projectName: string;
  onViewSupplierDetails?: (supplierId: number) => void;
}

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
  createdAt: string;
  updatedAt: string;
  supplier: SupplierOption;
}

interface SuppliersResponse {
  success: boolean;
  data: {
    suppliers: SupplierOption[];
  };
  error?: string;
}

interface ProjectSuppliersResponse {
  success: boolean;
  data?: ProjectSupplier[];
  error?: string;
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

interface InvoicesResponse {
  success: boolean;
  data?: Invoice[];
  error?: string;
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

interface PaymentsResponse {
  success: boolean;
  data?: Payment[];
  error?: string;
}

export default function ProjectSuppliers({ projectId, projectName, onViewSupplierDetails }: ProjectSuppliersProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, delete: del } = useAdminApi();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectSuppliers, setProjectSuppliers] = useState<ProjectSupplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<SupplierOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilterTerm, setSupplierFilterTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { siteSettings } = useSiteSettings();
  const [summaryData, setSummaryData] = useState<{
    purchaseOrders: PurchaseOrder[];
    grns: GRN[];
    invoices: Invoice[];
    payments: Payment[];
  }>({
    purchaseOrders: [],
    grns: [],
    invoices: [],
    payments: [],
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [projectSuppliersRes, suppliersRes] = await Promise.all([
        get<ProjectSuppliersResponse>(`/api/admin/project-suppliers?projectId=${projectId}`),
        get<SuppliersResponse>('/api/admin/suppliers'),
      ]);

      if (!projectSuppliersRes?.success) {
        throw new Error(projectSuppliersRes?.error || 'Failed to load project suppliers');
      }

      if (!suppliersRes?.success) {
        throw new Error(suppliersRes?.error || 'Failed to load suppliers list');
      }

      setProjectSuppliers(projectSuppliersRes.data || []);
      setAllSuppliers(suppliersRes.data?.suppliers || []);
    } catch (fetchError: any) {
      console.error('Failed to load project suppliers:', fetchError);
      setError(fetchError?.message || 'Failed to load supplier information.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load summary data for all suppliers
  const loadSummaryData = useCallback(async () => {
    if (projectSuppliers.length === 0) {
      setSummaryData({ purchaseOrders: [], grns: [], invoices: [], payments: [] });
      return;
    }

    setIsLoadingSummary(true);
    try {
      const supplierIds = projectSuppliers.map(ps => ps.id);
      
      // Fetch POs, Invoices, and Payments for all suppliers
      const allPOs: PurchaseOrder[] = [];
      const allInvoices: Invoice[] = [];
      const allPayments: Payment[] = [];

      // Fetch data for each supplier, handling errors gracefully
      for (const id of supplierIds) {
        try {
          // Fetch POs
          try {
            const posRes = await get<PurchaseOrdersResponse>(`/api/admin/project-suppliers/${id}/purchase-orders`);
            if (posRes.success && posRes.data) {
              allPOs.push(...posRes.data);
            }
          } catch (error: any) {
            // Ignore 404s - supplier might not have POs yet
            if (error.message?.includes('404')) {
              console.log(`No POs found for supplier ${id}`);
            }
          }

          // Fetch Invoices
          try {
            const invoicesRes = await get<InvoicesResponse>(`/api/admin/project-suppliers/${id}/invoices`);
            if (invoicesRes.success && invoicesRes.data) {
              allInvoices.push(...invoicesRes.data);
            }
          } catch (error: any) {
            if (error.message?.includes('404')) {
              console.log(`No invoices found for supplier ${id}`);
            }
          }

          // Fetch Payments
          try {
            const paymentsRes = await get<PaymentsResponse>(`/api/admin/project-suppliers/${id}/payments`);
            if (paymentsRes.success && paymentsRes.data) {
              // Ensure liquidated field is properly set (default to false if null/undefined)
              const paymentsWithLiquidated = paymentsRes.data.map(payment => ({
                ...payment,
                liquidated: payment.liquidated ?? false,
              }));
              allPayments.push(...paymentsWithLiquidated);
            }
          } catch (error: any) {
            if (error.message?.includes('404')) {
              console.log(`No payments found for supplier ${id}`);
            } else {
              console.error(`Error loading payments for supplier ${id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Failed to load data for supplier ${id}:`, error);
        }
      }

      // Fetch GRNs for each purchase order
      const allGRNs: GRN[] = [];
      for (const po of allPOs) {
        try {
          const grnsRes = await get<GRNsResponse>(`/api/admin/purchase-orders/${po.id}/grns`);
          if (grnsRes.success && grnsRes.data) {
            allGRNs.push(...grnsRes.data);
          }
        } catch (error: any) {
          // Silently ignore 404s - PO might not have GRNs yet
          if (error.message?.includes('404')) {
            console.log(`No GRNs found for PO ${po.id}`);
          }
        }
      }

      setSummaryData({
        purchaseOrders: allPOs,
        grns: allGRNs,
        invoices: allInvoices,
        payments: allPayments,
      });
    } catch (error) {
      console.error('Failed to load summary data:', error);
      // Set empty data on error to avoid breaking the UI
      setSummaryData({ purchaseOrders: [], grns: [], invoices: [], payments: [] });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [get, projectSuppliers]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.supplier-search-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const availableSuppliers = useMemo(() => {
    const usedSupplierIds = new Set(projectSuppliers.map((ps) => ps.supplierId));
    const term = searchTerm.toLowerCase();
    
    return allSuppliers.filter((supplier) => {
      if (usedSupplierIds.has(supplier.id)) return false;
      if (!term) return true;
      
      const searchFields = [
        supplier.name,
        supplier.vendorCode || '',
        supplier.type,
        supplier.contactPerson || '',
        supplier.contactNumber || '',
        supplier.email || '',
      ];
      
      return searchFields.some((field) => field.toLowerCase().includes(term));
    });
  }, [allSuppliers, projectSuppliers, searchTerm]);

  const handleAddSupplier = useCallback(async () => {
    if (!selectedSupplierId) {
      setError('Please select a supplier.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await post<{ success: boolean; data?: ProjectSupplier; error?: string }>(
        '/api/admin/project-suppliers',
        {
          projectId,
          supplierId: parseInt(selectedSupplierId, 10),
          notes: notes.trim() || null,
        }
      );

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to add supplier to project');
      }

      await loadData();
      setSelectedSupplierId('');
      setNotes('');
      setSearchTerm('');
      setShowDropdown(false);
      setShowAddForm(false);
    } catch (submitError: any) {
      console.error('Failed to add supplier:', submitError);
      setError(submitError?.message || 'Failed to add supplier to project.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedSupplierId, notes, projectId, post, loadData]);

  const handleRemoveSupplier = useCallback(
    async (projectSupplierId: number, supplierName: string) => {
      if (!confirm(`Remove ${supplierName} from this project?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-suppliers/${projectSupplierId}`);
        await loadData();
      } catch (deleteError: any) {
        console.error('Failed to remove supplier:', deleteError);
        setError(deleteError?.message || 'Failed to remove supplier from project.');
      }
    },
    [del, loadData]
  );


  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-10 text-center"
        style={{ borderColor: colors.borderLight }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: colors.primary }}
        />
        <p style={{ color: colors.textSecondary }}>Loading project suppliers…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Project Suppliers
        </h2>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Manage suppliers assigned to project <span className="font-medium">{projectName}</span>.
        </p>
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

      {/* Aggregated Summary Cards for All Suppliers */}
      {(() => {
        const vatPercent = siteSettings?.vatPercent ?? 5;
        const vatMultiplier = 1 + (vatPercent / 100);

        // Helper to calculate paid amounts from invoices
        const calculatePaidAmountsFromInvoices = (invoiceList: Invoice[]) => {
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
        };

        // Helper function to get invoice status from database or calculate if not available
        const getInvoiceStatus = (invoice: Invoice): 'paid' | 'partially_paid' | 'unpaid' => {
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
        };

        // Calculate Total Invoiced (sum of all invoice totalAmount)
        const totalInvoiced = summaryData.invoices.reduce((sum, invoice) => {
          return sum + Number(invoice.totalAmount || 0);
        }, 0);

        // Calculate Total Paid - sum of payments for invoices with status "paid"
        const totalPaid = summaryData.invoices.reduce((sum, invoice) => {
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

        // Calculate Committed Payments - Post Dated payments that are not yet liquidated (from DB)
        const committedPayments = summaryData.payments.reduce((sum, payment) => {
          // Only count Post Dated payments where liquidated is explicitly false or null (not yet liquidated)
          // Handle both false and null cases (null means not set/not liquidated yet)
          const isNotLiquidated = payment.liquidated === false || payment.liquidated === null;
          if (payment.paymentMethod === 'Post Dated' && isNotLiquidated) {
            return sum + Number(payment.totalPaymentAmount || 0) + Number(payment.totalVatAmount || 0);
          }
          return sum;
        }, 0);

        // Calculate Balance to be Paid - only from invoices that are not fully paid
        const paidAmountsFromDBForBalance = calculatePaidAmountsFromInvoices(summaryData.invoices);
        const balanceToBePaid = summaryData.invoices.reduce((sum, invoice) => {
          const paid = paidAmountsFromDBForBalance[invoice.id] || { paymentAmount: 0, vatAmount: 0 };
          const totalPaidForInvoice = paid.paymentAmount + paid.vatAmount;
          const invoiceTotal = Number(invoice.totalAmount || 0);
          const remaining = invoiceTotal - totalPaidForInvoice;
          // Only add if there's still a balance to be paid (not fully paid)
          return sum + (remaining > 0 ? remaining : 0);
        }, 0);

        // Calculate Total Delivered (sum of all GRN deliveredAmount) with VAT
        const totalDeliveredBase = summaryData.grns.reduce((sum, grn) => {
          return sum + Number(grn.deliveredAmount || 0);
        }, 0);
        const totalDelivered = totalDeliveredBase * vatMultiplier; // Add VAT

        // Calculate Total PO Amounts without VAT
        const totalPOAmountsWithoutVat = summaryData.purchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0);
        }, 0);

        // Calculate Total PO Amounts (with VAT)
        const totalPOAmountsWithVat = summaryData.purchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValueWithVat || 0);
        }, 0);

        // Calculate VAT Amount = Total with VAT - Total without VAT
        const totalPOVatAmount = totalPOAmountsWithVat - totalPOAmountsWithoutVat;

        // Calculate LPO Balance: (Total PO amount - Delivered amount) * VAT multiplier (with VAT)
        const totalPOAmount = summaryData.purchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0); // Use base LPO value without VAT
        }, 0);
        
        const lpoBalanceBeforeVat = totalPOAmount - totalDeliveredBase;
        const lpoBalance = lpoBalanceBeforeVat * vatMultiplier; // Add VAT

        // Calculate Due Amount (invoices past due date)
        // Use invoice data directly from DB, not payments state
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate paid amounts from invoice data (from DB)
        const paidAmountsFromDB = calculatePaidAmountsFromInvoices(summaryData.invoices);
        
        const dueAmount = summaryData.invoices.reduce((sum, invoice) => {
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

        if (isLoadingSummary) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
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

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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

      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Add Supplier
          </h3>
          {!showAddForm && (
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddForm(true)}
            >
              Add Supplier
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="space-y-4 p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Select a supplier from your company vendors
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedSupplierId('');
                  setNotes('');
                  setSearchTerm('');
                  setShowDropdown(false);
                  setError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Search & Select Supplier *
                </label>
                <div className="relative supplier-search-dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10" style={{ color: colors.textSecondary }} />
                    <Input
                      type="text"
                      placeholder="Search by name, code, type, or contact..."
                      value={selectedSupplierId ? availableSuppliers.find(s => s.id.toString() === selectedSupplierId)?.name || searchTerm : searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedSupplierId('');
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="pl-10"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                      }}
                      disabled={isSaving}
                    />
                    {selectedSupplierId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSupplierId('');
                          setSearchTerm('');
                          setShowDropdown(true);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: colors.textSecondary }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {showDropdown && (
                    <>
                      {availableSuppliers.length > 0 ? (
                        <div
                          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                          }}
                        >
                          {availableSuppliers.map((supplier) => (
                            <div
                              key={supplier.id}
                              onClick={() => {
                                setSelectedSupplierId(supplier.id.toString());
                                setSearchTerm(supplier.name);
                                setShowDropdown(false);
                              }}
                              className="px-4 py-3 cursor-pointer hover:opacity-75 border-b last:border-b-0"
                              style={{
                                backgroundColor: selectedSupplierId === supplier.id.toString() 
                                  ? `${colors.primary}15` 
                                  : colors.backgroundPrimary,
                                borderColor: colors.borderLight,
                                color: colors.textPrimary,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{supplier.name}</div>
                                  <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                    {supplier.vendorCode && `Code: ${supplier.vendorCode} • `}
                                    Type: {supplier.type}
                                    {supplier.contactPerson && ` • Contact: ${supplier.contactPerson}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchTerm ? (
                        <div
                          className="absolute z-20 w-full mt-1 rounded-lg border px-4 py-3 text-sm"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                            color: colors.textSecondary,
                          }}
                        >
                          No suppliers found matching "{searchTerm}"
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary,
                  }}
                  placeholder="Add any notes about this supplier for this project"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedSupplierId('');
                    setNotes('');
                    setSearchTerm('');
                    setShowDropdown(false);
                    setError(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleAddSupplier}
                  isLoading={isSaving}
                  disabled={isSaving || !selectedSupplierId}
                >
                  Add Supplier
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Assigned Suppliers
          </h3>
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            {projectSuppliers.length} supplier{projectSuppliers.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Supplier Name Filter */}
        {projectSuppliers.length > 0 && (
          <Card
            className="p-4 mb-4 shadow-sm"
            style={{
              backgroundColor: colors.backgroundPrimary,
              borderColor: supplierFilterTerm ? colors.primary : colors.borderLight,
              borderWidth: supplierFilterTerm ? '2px' : '1px',
              transition: 'all 0.2s ease',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{
                backgroundColor: supplierFilterTerm ? colors.primary : `${colors.primary}15`,
                color: supplierFilterTerm ? colors.secondary : colors.primary,
              }}>
                <Search className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Filter by Supplier Name
                </label>
                <Input
                  type="text"
                  value={supplierFilterTerm}
                  onChange={(e) => setSupplierFilterTerm(e.target.value)}
                  placeholder="Search by supplier name..."
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: supplierFilterTerm ? colors.primary : colors.borderLight,
                    borderWidth: supplierFilterTerm ? '2px' : '1px',
                    color: colors.textPrimary,
                    outline: 'none',
                    boxShadow: supplierFilterTerm ? `0 0 0 3px ${colors.primary}20` : 'none',
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              {supplierFilterTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSupplierFilterTerm('')}
                  className="h-10 w-10 hover:bg-opacity-20 transition-all"
                  style={{ 
                    color: colors.primary,
                    backgroundColor: `${colors.primary}10`,
                  }}
                  title="Clear filter"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            {supplierFilterTerm && (() => {
              const filteredCount = projectSuppliers.filter((ps) => 
                ps.supplier.name.toLowerCase().includes(supplierFilterTerm.toLowerCase())
              ).length;
              return (
                <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: colors.borderLight }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Filter active:
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                    }}>
                      "{supplierFilterTerm}"
                    </span>
                  </div>
                  <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    {filteredCount} {filteredCount === 1 ? 'supplier' : 'suppliers'} found
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {(() => {
          // Filter suppliers by name if filter term is set
          const filteredSuppliers = supplierFilterTerm
            ? projectSuppliers.filter((ps) => 
                ps.supplier.name.toLowerCase().includes(supplierFilterTerm.toLowerCase())
              )
            : projectSuppliers;

          if (filteredSuppliers.length === 0) {
            return (
          <div
            className="rounded-lg border px-4 py-6 text-center text-sm"
            style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
          >
                {supplierFilterTerm 
                  ? `No suppliers found matching "${supplierFilterTerm}".`
                  : 'No suppliers assigned to this project yet.'
                }
          </div>
            );
          }

          return (
          <div className="space-y-4">
              {filteredSuppliers.map((projectSupplier) => {
              const supplier = projectSupplier.supplier;
              
              // Calculate totals for this specific supplier
              const supplierPOs = summaryData.purchaseOrders.filter(po => po.projectSupplierId === projectSupplier.id);
              const supplierInvoices = summaryData.invoices.filter(inv => inv.projectSupplierId === projectSupplier.id);
              
              // Calculate Total Order Amount (Total PO amounts with VAT)
              const totalOrderAmount = supplierPOs.reduce((sum, po) => {
                return sum + Number(po.lpoValueWithVat || 0);
              }, 0);
              
              // Calculate Total Due Amount (invoices past due date)
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Helper to calculate paid amounts from invoices
              const calculatePaidAmountsFromInvoices = (invoiceList: Invoice[]) => {
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
              };
              
              const paidAmountsFromDB = calculatePaidAmountsFromInvoices(supplierInvoices);
              
              const totalDueAmount = supplierInvoices.reduce((sum, invoice) => {
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
                <Card
                  key={projectSupplier.id}
                  className="p-5 transition-all duration-200 cursor-pointer group relative"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                  }}
                  onClick={() => onViewSupplierDetails?.(projectSupplier.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}15`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.borderLight;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Action buttons - positioned absolutely to avoid interfering with card click */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSupplier(projectSupplier.id, supplier.name);
                      }}
                      aria-label={`Remove ${supplier.name}`}
                      className="h-8 w-8 hover:bg-red-50 transition-colors"
                      style={{
                        color: colors.error,
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pr-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                          {supplier.name}
                        </h4>
                        {supplier.vendorCode && (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: `${colors.info}15`,
                              color: colors.info,
                              border: `1px solid ${colors.info}30`,
                            }}
                          >
                            <Tag className="h-3 w-3" style={{ color: colors.info }} />
                            {supplier.vendorCode}
                          </span>
                        )}
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            border: `1px solid ${colors.primary}30`,
                          }}
                        >
                          <Building2 className="h-3 w-3" style={{ color: colors.primary }} />
                          {supplier.type}
                        </span>
                      </div>

                      {(supplier.contactPerson || supplier.contactNumber || supplier.email) && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {supplier.contactPerson && (
                            <div className="flex items-center gap-2.5 text-sm">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: `${colors.primary}10`,
                                  color: colors.primary,
                                }}
                              >
                                <UserIcon className="h-4 w-4" style={{ color: colors.primary }} />
                              </div>
                              <span style={{ color: colors.textSecondary }}>
                                {supplier.contactPerson}
                              </span>
                            </div>
                          )}
                          {supplier.contactNumber && (
                            <div className="flex items-center gap-2.5 text-sm">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: `${colors.success}10`,
                                  color: colors.success,
                                }}
                              >
                                <Phone className="h-4 w-4" style={{ color: colors.success }} />
                              </div>
                              <span style={{ color: colors.textSecondary }}>
                                {supplier.contactNumber}
                              </span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-2.5 text-sm">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: `${colors.info}10`,
                                  color: colors.info,
                                }}
                              >
                                <Mail className="h-4 w-4" style={{ color: colors.info }} />
                              </div>
                              <span style={{ color: colors.textSecondary }}>{supplier.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {supplier.typeOfWorks && supplier.typeOfWorks.length > 0 && (
                        <div>
                          <p
                            className="mb-2 text-xs font-medium uppercase tracking-wide"
                            style={{ color: colors.textSecondary }}
                          >
                            Type of Works
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {supplier.typeOfWorks.map((link) => (
                              <span
                                key={link.typeOfWork.id}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                                style={{
                                  backgroundColor: colors.backgroundSecondary,
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
                        <div>
                          <p
                            className="mb-1 text-xs font-medium uppercase tracking-wide"
                            style={{ color: colors.textSecondary }}
                          >
                            Notes
                          </p>
                          <p className="text-sm" style={{ color: colors.textPrimary }}>
                            {projectSupplier.notes}
                          </p>
                        </div>
                      )}

                      {/* Total Order Amount and Total Due Amount */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: colors.borderLight }}>
                        <div>
                          <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                            Total Order Amount
                          </p>
                          <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                            {formatCurrencyWithDecimals(totalOrderAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                            Total Due Amount
                          </p>
                          <p className="text-base font-semibold" style={{ color: totalDueAmount > 0 ? colors.error : colors.success }}>
                            {formatCurrencyWithDecimals(totalDueAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle hint that card is clickable */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-200" style={{ color: colors.primary }}>
                    <span className="font-medium">View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </Card>
              );
            })}
          </div>
          );
        })()}
      </Card>
    </div>
  );
}

