'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Plus, Save, Edit, Trash2, Building2, Tag, Mail, User as UserIcon, Phone, Search, X, Eye, FileText, ShoppingCart, Package, Receipt, CreditCard, AlertCircle, Clock, Wallet, Upload, File, Loader2, ChevronRight } from 'lucide-react';
import { formatCurrencyWithDecimals } from '@/lib/currency';

interface ProjectSubcontractorsProps {
  projectId: number;
  projectName: string;
  onViewSubcontractorDetails?: (subcontractorId: number) => void;
}

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
  createdAt: string;
  updatedAt: string;
  subcontractor: SubcontractorOption;
}

interface SubcontractorsResponse {
  success: boolean;
  data: {
    subcontractors: SubcontractorOption[];
  };
  error?: string;
}

interface ProjectSubcontractorsResponse {
  success: boolean;
  data?: ProjectSubcontractor[];
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
  vatPercent?: number;
  vatAmount?: number;
  amountWithVat?: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
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
  changeOrders?: ChangeOrder[];
}

interface PurchaseOrdersResponse {
  success: boolean;
  data?: PurchaseOrder[];
  error?: string;
}

interface Invoice {
  id: number;
  projectId: number;
  projectSubcontractorId: number;
  purchaseOrderId: number | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  paymentType: string;
  downPayment: number | null;
  invoiceAmount: number;
  vatAmount: number;
  downPaymentRecovery: number | null;
  advanceRecovery?: number | null;
  retention?: number | null;
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
  projectSubcontractorId: number;
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

export default function ProjectSubcontractors({ projectId, projectName, onViewSubcontractorDetails }: ProjectSubcontractorsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, delete: del } = useAdminApi();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectSubcontractors, setProjectSubcontractors] = useState<ProjectSubcontractor[]>([]);
  const [allSubcontractors, setAllSubcontractors] = useState<SubcontractorOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subcontractorFilterTerm, setSubcontractorFilterTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string>('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [subcontractAgreement, setSubcontractAgreement] = useState<boolean | null>(null);
  const [agreementDocumentFile, setAgreementDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { siteSettings } = useSiteSettings();
  const [summaryData, setSummaryData] = useState<{
    purchaseOrders: PurchaseOrder[];
    invoices: Invoice[];
    payments: Payment[];
  }>({
    purchaseOrders: [],
    invoices: [],
    payments: [],
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [projectSubcontractorsRes, subcontractorsRes] = await Promise.all([
        get<ProjectSubcontractorsResponse>(`/api/admin/project-subcontractors?projectId=${projectId}`),
        get<SubcontractorsResponse>('/api/admin/subcontractors'),
      ]);

      if (!projectSubcontractorsRes?.success) {
        throw new Error(projectSubcontractorsRes?.error || 'Failed to load project subcontractors');
      }

      if (!subcontractorsRes?.success) {
        throw new Error(subcontractorsRes?.error || 'Failed to load subcontractors list');
      }

      setProjectSubcontractors(projectSubcontractorsRes.data || []);
      setAllSubcontractors(subcontractorsRes.data?.subcontractors || []);
      
      // Debug: Log subcontractor data to check document URLs
      if (projectSubcontractorsRes.data && projectSubcontractorsRes.data.length > 0) {
        console.log('Loaded subcontractors:', projectSubcontractorsRes.data.map(ps => ({
          id: ps.id,
          subcontractAgreement: ps.subcontractAgreement,
          subcontractAgreementDocumentUrl: ps.subcontractAgreementDocumentUrl
        })));
      }
    } catch (fetchError: any) {
      console.error('Failed to load project subcontractors:', fetchError);
      setError(fetchError?.message || 'Failed to load subcontractor information.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load summary data for all subcontractors
  const loadSummaryData = useCallback(async () => {
    if (projectSubcontractors.length === 0) {
      setSummaryData({ purchaseOrders: [], invoices: [], payments: [] });
      return;
    }

    setIsLoadingSummary(true);
    try {
      const subcontractorIds = projectSubcontractors.map(ps => ps.id);
      
      // Fetch POs, Invoices, and Payments for all subcontractors
      const allPOs: PurchaseOrder[] = [];
      const allInvoices: Invoice[] = [];
      const allPayments: Payment[] = [];

      // Fetch data for each subcontractor, handling errors gracefully
      for (const id of subcontractorIds) {
        try {
          // Fetch POs (which now include changeOrders)
          try {
            const posRes = await get<PurchaseOrdersResponse>(`/api/admin/project-subcontractors/${id}/purchase-orders`);
            if (posRes.success && posRes.data) {
              allPOs.push(...posRes.data);
            }
          } catch (error: any) {
            // Ignore 404s - subcontractor might not have POs yet
            if (error.message?.includes('404')) {
              console.log(`No POs found for subcontractor ${id}`);
            }
          }

          // Fetch Invoices
          try {
            const invoicesRes = await get<InvoicesResponse>(`/api/admin/project-subcontractors/${id}/invoices`);
            if (invoicesRes.success && invoicesRes.data) {
              allInvoices.push(...invoicesRes.data);
            }
          } catch (error: any) {
            if (error.message?.includes('404')) {
              console.log(`No invoices found for subcontractor ${id}`);
            }
          }

          // Fetch Payments
          try {
            const paymentsRes = await get<PaymentsResponse>(`/api/admin/project-subcontractors/${id}/payments`);
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
              console.log(`No payments found for subcontractor ${id}`);
            } else {
              console.error(`Error loading payments for subcontractor ${id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Failed to load data for subcontractor ${id}:`, error);
        }
      }

      setSummaryData({
        purchaseOrders: allPOs,
        invoices: allInvoices,
        payments: allPayments,
      });
    } catch (error) {
      console.error('Failed to load summary data:', error);
      // Set empty data on error to avoid breaking the UI
      setSummaryData({ purchaseOrders: [], invoices: [], payments: [] });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [get, projectSubcontractors]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.subcontractor-search-dropdown')) {
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

  const availableSubcontractors = useMemo(() => {
    const usedSubcontractorIds = new Set(projectSubcontractors.map((ps) => ps.subcontractorId));
    const term = searchTerm.toLowerCase();
    
    return allSubcontractors.filter((subcontractor) => {
      if (usedSubcontractorIds.has(subcontractor.id)) return false;
      if (!term) return true;
      
      const searchFields = [
        subcontractor.name,
        subcontractor.vendorCode || '',
        subcontractor.type,
        subcontractor.contactPerson || '',
        subcontractor.contactNumber || '',
        subcontractor.email || '',
      ];
      
      return searchFields.some((field) => field.toLowerCase().includes(term));
    });
  }, [allSubcontractors, projectSubcontractors, searchTerm]);

  const handleAddSubcontractor = useCallback(async () => {
    if (!selectedSubcontractorId) {
      setError('Please select a subcontractor.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Log what we're sending
      console.log('Submitting subcontractor with document URL:', {
        subcontractAgreement,
        documentUrl,
        subcontractAgreementDocumentUrl: documentUrl || null
      });

      const response = await post<{ success: boolean; data?: ProjectSubcontractor; error?: string }>(
        '/api/admin/project-subcontractors',
        {
          projectId,
          subcontractorId: parseInt(selectedSubcontractorId, 10),
          scopeOfWork: scopeOfWork.trim() || null,
          subcontractAgreement: subcontractAgreement ?? false,
          subcontractAgreementDocumentUrl: documentUrl || null,
        }
      );

      console.log('Response from API:', response);
      console.log('Created subcontractor data:', response.data);
      if (response.data) {
        console.log('Document URL in response:', response.data.subcontractAgreementDocumentUrl);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to add subcontractor to project');
      }

      await loadData();
      // Reset form state
      setSelectedSubcontractorId('');
      setScopeOfWork('');
      setSubcontractAgreement(null);
      setAgreementDocumentFile(null);
      setDocumentUrl(null);
      setSearchTerm('');
      setShowDropdown(false);
      setShowAddForm(false);
    } catch (submitError: any) {
      console.error('Failed to add subcontractor:', submitError);
      setError(submitError?.message || 'Failed to add subcontractor to project.');
    } finally {
      setIsSaving(false);
    }
    }, [selectedSubcontractorId, scopeOfWork, subcontractAgreement, documentUrl, projectId, post, loadData]);

  const handleRemoveSubcontractor = useCallback(
    async (projectSubcontractorId: number, subcontractorName: string) => {
      if (!confirm(`Remove ${subcontractorName} from this project?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/project-subcontractors/${projectSubcontractorId}`);
        await loadData();
      } catch (deleteError: any) {
        console.error('Failed to remove subcontractor:', deleteError);
        setError(deleteError?.message || 'Failed to remove subcontractor from project.');
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
        <p style={{ color: colors.textSecondary }}>Loading project subcontractors…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Project Subcontractors
        </h2>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Manage subcontractors assigned to project <span className="font-medium">{projectName}</span>.
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

      {/* Aggregated Summary Cards for All Subcontractors */}
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

        // Calculate PO Amounts without VAT
        const totalPOAmountsWithoutVat = summaryData.purchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValue || 0);
        }, 0);

        // Calculate CO Amounts without VAT
        const totalCOAmountsWithoutVat = summaryData.purchaseOrders.reduce((sum, po) => {
          if (po.changeOrders && po.changeOrders.length > 0) {
            po.changeOrders.forEach((co) => {
              if (co.type === 'addition') {
                sum += Number(co.amount || 0);
              } else if (co.type === 'omission') {
                sum -= Number(co.amount || 0);
              }
            });
          }
          return sum;
        }, 0);

        // Calculate Total without VAT (PO + CO before VAT)
        const totalAmountWithoutVat = totalPOAmountsWithoutVat + totalCOAmountsWithoutVat;

        // Calculate PO Amounts with VAT
        const totalPOAmountsWithVat = summaryData.purchaseOrders.reduce((sum, po) => {
          return sum + Number(po.lpoValueWithVat || 0);
        }, 0);

        // Calculate CO Amounts with VAT
        const totalCOAmountsWithVat = summaryData.purchaseOrders.reduce((sum, po) => {
          if (po.changeOrders && po.changeOrders.length > 0) {
            po.changeOrders.forEach((co) => {
              if (co.type === 'addition') {
                sum += Number(co.amountWithVat || (co.amount + (co.vatAmount || 0)) || 0);
              } else if (co.type === 'omission') {
                sum -= Number(co.amountWithVat || (co.amount + (co.vatAmount || 0)) || 0);
              }
            });
          }
          return sum;
        }, 0);

        // Calculate Total Contract Amount (PO + CO with VAT)
        const totalContractAmount = totalPOAmountsWithVat + totalCOAmountsWithVat;
        
        // Calculate VAT Amount = Total with VAT - Total without VAT
        const totalVatAmount = totalContractAmount - totalAmountWithoutVat;
        
        // Calculate LPO Balance: Total Contract amount (PO + CO with VAT) - Total Invoiced (with VAT) - Contra Charges with VAT
        const totalInvoicedForBalance = summaryData.invoices.reduce((sum, invoice) => {
          return sum + Number(invoice.totalAmount || 0); // totalAmount includes VAT
        }, 0);
        
        // Calculate total contra charges from all invoices
        const totalContraCharges = summaryData.invoices.reduce((sum, invoice) => {
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

        // Calculate Certified Amount - total of Progress Payment invoices only (excluding VAT, so invoiceAmount)
        const certifiedAmount = summaryData.invoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);

        // Calculate Total PO + CO amounts before VAT
        const totalPOAndCOAmountsBeforeVat = summaryData.purchaseOrders.reduce((sum, po) => {
          // Start with PO amount before VAT (lpoValue)
          let poAmount = Number(po.lpoValue || 0);
          
          // Add Change Orders amounts before VAT
          if (po.changeOrders && po.changeOrders.length > 0) {
            po.changeOrders.forEach((co) => {
              if (co.type === 'addition') {
                poAmount += Number(co.amount || 0);
              } else if (co.type === 'omission') {
                poAmount -= Number(co.amount || 0);
              }
            });
          }
          
          return sum + poAmount;
        }, 0);

        // Calculate Balance to Certify = (PO + COs before VAT) - Certified Amount
        const balanceToCertify = totalPOAndCOAmountsBeforeVat - certifiedAmount;

        // Calculate Total Advance Payments (for all subcontractors)
        const totalAdvancePayments = summaryData.invoices
          .filter(invoice => invoice.paymentType === 'Advance Payment')
          .reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0);

        // Calculate Total Advance Recoveries from Progress Payment invoices (for all subcontractors)
        const totalAdvanceRecoveries = summaryData.invoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.advanceRecovery || 0), 0);

        // Calculate Remaining AP Recovery = Total Advance Payments - Total Advance Recoveries
        const remainingAPRecovery = totalAdvancePayments - totalAdvanceRecoveries;

        // Calculate Total Retention Held from Progress Payment invoices (for all subcontractors)
        const totalRetentionHeld = summaryData.invoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.retention || 0), 0);

        // Calculate Total Contra Charges from Progress Payment invoices (for all subcontractors)
        const totalContraChargesForCertified = summaryData.invoices
          .filter(invoice => invoice.paymentType === 'Progress Payment')
          .reduce((sum, invoice) => sum + Number(invoice.contraChargesAmount || 0), 0);

        if (isLoadingSummary) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}>
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
            Add Subcontractor
          </h3>
          {!showAddForm && (
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddForm(true)}
            >
              Add Subcontractor
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="space-y-4 p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Select a subcontractor from your company vendors
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedSubcontractorId('');
                  setScopeOfWork('');
                  setSubcontractAgreement(null);
                  setAgreementDocumentFile(null);
                  setDocumentUrl(null);
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
                  Search & Select Subcontractor *
                </label>
                <div className="relative subcontractor-search-dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10" style={{ color: colors.textSecondary }} />
                    <Input
                      type="text"
                      placeholder="Search by name, code, type, or contact..."
                      value={selectedSubcontractorId ? availableSubcontractors.find(s => s.id.toString() === selectedSubcontractorId)?.name || searchTerm : searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedSubcontractorId('');
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
                    {selectedSubcontractorId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubcontractorId('');
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
                      {availableSubcontractors.length > 0 ? (
                        <div
                          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight,
                          }}
                        >
                          {availableSubcontractors.map((subcontractor) => (
                            <div
                              key={subcontractor.id}
                              onClick={() => {
                                setSelectedSubcontractorId(subcontractor.id.toString());
                                setSearchTerm(subcontractor.name);
                                setShowDropdown(false);
                              }}
                              className="px-4 py-3 cursor-pointer hover:opacity-75 border-b last:border-b-0"
                              style={{
                                backgroundColor: selectedSubcontractorId === subcontractor.id.toString() 
                                  ? `${colors.primary}15` 
                                  : colors.backgroundPrimary,
                                borderColor: colors.borderLight,
                                color: colors.textPrimary,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{subcontractor.name}</div>
                                  <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                    {subcontractor.vendorCode && `Code: ${subcontractor.vendorCode} • `}
                                    Type: {subcontractor.type}
                                    {subcontractor.contactPerson && ` • Contact: ${subcontractor.contactPerson}`}
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
                          No subcontractors found matching "{searchTerm}"
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Scope of Work
                </label>
                <textarea
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textPrimary,
                  }}
                  placeholder="Describe the scope of work for this subcontractor"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Subcontract Agreement
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Radio
                      name="subcontractAgreement"
                      checked={subcontractAgreement === true}
                      onChange={() => setSubcontractAgreement(true)}
                      disabled={isSaving || uploadingDocument}
                      colors={colors}
                      size="md"
                    />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Radio
                      name="subcontractAgreement"
                      checked={subcontractAgreement === false}
                      onChange={() => setSubcontractAgreement(false)}
                      disabled={isSaving || uploadingDocument}
                      colors={colors}
                      size="md"
                    />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>No</span>
                  </label>
                </div>
                {subcontractAgreement === true && (
                  <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                      Upload Subcontract Agreement Document
                    </label>
                    <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                      Upload PDF or Word document (max 50MB)
                    </p>
                    {documentUrl ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }}>
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5" style={{ color: colors.primary }} />
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                            style={{ color: colors.primary }}
                          >
                            View Document
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDocumentUrl(null);
                            setAgreementDocumentFile(null);
                          }}
                          disabled={isSaving || uploadingDocument}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file type
                              const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                              if (!validTypes.includes(file.type)) {
                                setError('Please upload a PDF or Word document');
                                return;
                              }
                              // Validate file size (50MB)
                              if (file.size > 50 * 1024 * 1024) {
                                setError('File size must be less than 50MB');
                                return;
                              }
                              setAgreementDocumentFile(file);
                              setError(null);
                            }
                          }}
                          disabled={isSaving || uploadingDocument}
                          className="hidden"
                          id="agreement-document-upload"
                        />
                        <label
                          htmlFor="agreement-document-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                          style={{
                            borderColor: colors.borderLight,
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.textSecondary,
                          }}
                        >
                          <Upload className="h-5 w-5" />
                          <span className="text-sm">
                            {agreementDocumentFile ? agreementDocumentFile.name : 'Choose file or drag and drop'}
                          </span>
                        </label>
                        {agreementDocumentFile && !documentUrl && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={async () => {
                                if (!agreementDocumentFile) return;
                                
                                setUploadingDocument(true);
                                setError(null);
                                
                                try {
                                  const formData = new FormData();
                                  formData.append('file', agreementDocumentFile);
                                  formData.append('folder', 'pmp-reports/subcontract-agreements');
                                  
                                  const response = await fetch('/api/admin/media-library', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  const result = await response.json();
                                  console.log('Upload response:', result);
                                  
                                  if (result.success && result.data) {
                                    const url = result.data.publicUrl;
                                    console.log('Document uploaded successfully. URL:', url);
                                    if (!url) {
                                      console.error('No publicUrl in response data:', result.data);
                                      setError('Document uploaded but URL is missing. Please try again.');
                                      return;
                                    }
                                    setDocumentUrl(url);
                                    setError(null);
                                  } else {
                                    const errorMsg = result.message || result.error || 'Failed to upload document';
                                    console.error('Upload failed:', errorMsg);
                                    setError(errorMsg);
                                  }
                                } catch (uploadError: any) {
                                  console.error('Upload error:', uploadError);
                                  setError(uploadError.message || 'Failed to upload document');
                                } finally {
                                  setUploadingDocument(false);
                                }
                              }}
                              disabled={isSaving || uploadingDocument}
                              isLoading={uploadingDocument}
                            >
                              {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAgreementDocumentFile(null);
                                setError(null);
                              }}
                              disabled={isSaving || uploadingDocument}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedSubcontractorId('');
                    setScopeOfWork('');
                    setSubcontractAgreement(false);
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
                  onClick={handleAddSubcontractor}
                  isLoading={isSaving}
                  disabled={isSaving || !selectedSubcontractorId}
                >
                  Add Subcontractor
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
            Assigned Subcontractors
          </h3>
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            {projectSubcontractors.length} subcontractor{projectSubcontractors.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Subcontractor Name Filter */}
        {projectSubcontractors.length > 0 && (
          <Card
            className="p-4 mb-4 shadow-sm"
            style={{
              backgroundColor: colors.backgroundPrimary,
              borderColor: subcontractorFilterTerm ? colors.primary : colors.borderLight,
              borderWidth: subcontractorFilterTerm ? '2px' : '1px',
              transition: 'all 0.2s ease',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{
                backgroundColor: subcontractorFilterTerm ? colors.primary : `${colors.primary}15`,
                color: subcontractorFilterTerm ? colors.secondary : colors.primary,
              }}>
                <Search className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Filter by Subcontractor Name
                </label>
                <Input
                  type="text"
                  value={subcontractorFilterTerm}
                  onChange={(e) => setSubcontractorFilterTerm(e.target.value)}
                  placeholder="Search by subcontractor name..."
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: subcontractorFilterTerm ? colors.primary : colors.borderLight,
                    borderWidth: subcontractorFilterTerm ? '2px' : '1px',
                    color: colors.textPrimary,
                    outline: 'none',
                    boxShadow: subcontractorFilterTerm ? `0 0 0 3px ${colors.primary}20` : 'none',
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              {subcontractorFilterTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSubcontractorFilterTerm('')}
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
            {subcontractorFilterTerm && (() => {
              const filteredCount = projectSubcontractors.filter((ps) => 
                ps.subcontractor.name.toLowerCase().includes(subcontractorFilterTerm.toLowerCase())
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
                      "{subcontractorFilterTerm}"
                    </span>
                  </div>
                  <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    {filteredCount} {filteredCount === 1 ? 'subcontractor' : 'subcontractors'} found
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {(() => {
          // Filter subcontractors by name if filter term is set
          const filteredSubcontractors = subcontractorFilterTerm
            ? projectSubcontractors.filter((ps) => 
                ps.subcontractor.name.toLowerCase().includes(subcontractorFilterTerm.toLowerCase())
              )
            : projectSubcontractors;

          if (filteredSubcontractors.length === 0) {
            return (
              <div
                className="rounded-lg border px-4 py-6 text-center text-sm"
                style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
              >
                {subcontractorFilterTerm 
                  ? `No subcontractors found matching "${subcontractorFilterTerm}".`
                  : 'No subcontractors assigned to this project yet.'
                }
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {filteredSubcontractors.map((projectSubcontractor) => {
              const subcontractor = projectSubcontractor.subcontractor;
              
              // Calculate totals for this specific subcontractor
              const subcontractorPOs = summaryData.purchaseOrders.filter(po => po.projectSubcontractorId === projectSubcontractor.id);
              const subcontractorInvoices = summaryData.invoices.filter(inv => inv.projectSubcontractorId === projectSubcontractor.id);
              
              // Calculate Total Order Amount (PO + CO amounts with VAT)
              // First, get all POs and their associated Change Orders
              const totalOrderAmount = subcontractorPOs.reduce((sum, po) => {
                // Add PO amount with VAT
                let poAmount = Number(po.lpoValueWithVat || 0);
                
                // Add Change Orders amounts with VAT for this PO (changeOrders are included in PO object)
                if (po.changeOrders && po.changeOrders.length > 0) {
                  po.changeOrders.forEach((co) => {
                    if (co.type === 'addition') {
                      // Add CO amount with VAT (amount + vatAmount or amountWithVat)
                      poAmount += Number(co.amountWithVat || (Number(co.amount || 0) + Number(co.vatAmount || 0)));
                    } else if (co.type === 'omission') {
                      // Subtract CO amount with VAT for omissions
                      poAmount -= Number(co.amountWithVat || (Number(co.amount || 0) + Number(co.vatAmount || 0)));
                    }
                  });
                }
                
                return sum + poAmount;
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
              
              const paidAmountsFromDB = calculatePaidAmountsFromInvoices(subcontractorInvoices);
              
              const totalDueAmount = subcontractorInvoices.reduce((sum, invoice) => {
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
                  key={projectSubcontractor.id}
                  className="p-5 transition-all duration-200 cursor-pointer group relative"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                  }}
                  onClick={() => onViewSubcontractorDetails?.(projectSubcontractor.id)}
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
                        handleRemoveSubcontractor(projectSubcontractor.id, subcontractor.name);
                      }}
                      aria-label={`Remove ${subcontractor.name}`}
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
                          {subcontractor.name}
                        </h4>
                        {subcontractor.vendorCode && (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: `${colors.info}15`,
                              color: colors.info,
                              border: `1px solid ${colors.info}30`,
                            }}
                          >
                            <Tag className="h-3 w-3" style={{ color: colors.info }} />
                            {subcontractor.vendorCode}
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
                          {subcontractor.type}
                        </span>
                      </div>

                      {(subcontractor.contactPerson || subcontractor.contactNumber || subcontractor.email) && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {subcontractor.contactPerson && (
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
                                {subcontractor.contactPerson}
                              </span>
                            </div>
                          )}
                          {subcontractor.contactNumber && (
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
                                {subcontractor.contactNumber}
                              </span>
                            </div>
                          )}
                          {subcontractor.email && (
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
                              <span style={{ color: colors.textSecondary }}>{subcontractor.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {subcontractor.typeOfWorks && subcontractor.typeOfWorks.length > 0 && (
                        <div>
                          <p
                            className="mb-2 text-xs font-medium uppercase tracking-wide"
                            style={{ color: colors.textSecondary }}
                          >
                            Type of Works
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {subcontractor.typeOfWorks.map((link) => (
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

                      {projectSubcontractor.scopeOfWork && (
                        <div>
                          <p
                            className="mb-1 text-xs font-medium uppercase tracking-wide"
                            style={{ color: colors.textSecondary }}
                          >
                            Scope of Work
                          </p>
                          <p className="text-sm" style={{ color: colors.textPrimary }}>
                            {projectSubcontractor.scopeOfWork}
                          </p>
                        </div>
                      )}
                      <div>
                        <p
                          className="mb-2 text-xs font-medium uppercase tracking-wide"
                          style={{ color: colors.textSecondary }}
                        >
                          Subcontract Agreement
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            {projectSubcontractor.subcontractAgreement ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

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

