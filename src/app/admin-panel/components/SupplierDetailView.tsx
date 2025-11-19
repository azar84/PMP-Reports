'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { ArrowLeft, Plus, Save, Edit, Trash2, Tag, X, ChevronRight, ChevronDown, FileText } from 'lucide-react';
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
  invoiceNumber: string;
  invoiceDate: string;
  grnRefNo: string;
  grnDate: string;
  advancePayment: number | null;
  deliveredAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface GRNsResponse {
  success: boolean;
  data?: GRN[];
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
    invoiceNumber: '',
    invoiceDate: '',
    grnRefNo: '',
    grnDate: '',
    advancePayment: '',
    deliveredAmount: '',
  });
  const [poFormData, setPOFormData] = useState({
    lpoNumber: '',
    lpoDate: '',
    lpoValue: '',
    vatPercent: '5',
    notes: '',
  });

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
        vatPercent: parseFloat(poFormData.vatPercent) || 5,
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
        vatPercent: '5',
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

  const handleSaveGRN = useCallback(async (poId: number) => {
    if (!grnFormData.invoiceNumber || !grnFormData.invoiceDate || !grnFormData.grnRefNo || !grnFormData.grnDate || !grnFormData.deliveredAmount) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const grnData = {
        invoiceNumber: grnFormData.invoiceNumber,
        invoiceDate: grnFormData.invoiceDate,
        grnRefNo: grnFormData.grnRefNo,
        grnDate: grnFormData.grnDate,
        advancePayment: grnFormData.advancePayment || '0',
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
        invoiceNumber: '',
        invoiceDate: '',
        grnRefNo: '',
        grnDate: '',
        advancePayment: '',
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
      invoiceNumber: grn.invoiceNumber,
      invoiceDate: formatDateForInput(grn.invoiceDate),
      grnRefNo: grn.grnRefNo,
      grnDate: formatDateForInput(grn.grnDate),
      advancePayment: grn.advancePayment?.toString() || '',
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
            size="icon"
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

      {/* Contract Value Table */}
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
        </div>

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
                    placeholder="5"
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
                <th className="px-4 py-3 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                  GRNs
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((po) => {
                  const isExpanded = expandedPOs.has(po.id);
                  const poGrns = grns[po.id] || [];
                  return (
                    <>
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
                        <td className="px-4 py-3 text-center border" style={{ borderColor: colors.borderLight }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePOExpand(po.id)}
                            className="flex items-center gap-1"
                            style={{ color: colors.textPrimary }}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="text-xs">GRNs ({poGrns.length})</span>
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-0 py-4 border" style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}>
                            <div className="px-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                  GRN Details - {po.lpoNumber}
                                </h4>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                                  onClick={() => {
                                    setShowGRNForm(po.id);
                                    setEditingGRN(null);
                                    setGrnFormData({
                                      invoiceNumber: '',
                                      invoiceDate: '',
                                      grnRefNo: '',
                                      grnDate: '',
                                      advancePayment: '',
                                      deliveredAmount: '',
                                    });
                                  }}
                                >
                                  Add GRN
                                </Button>
                              </div>

                              {showGRNForm === po.id && (
                                <Card
                                  className="p-4 mb-4"
                                  style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderColor: colors.borderLight,
                                  }}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                                        {editingGRN ? 'Edit GRN' : 'Add GRN'}
                                      </h5>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setShowGRNForm(null);
                                          setEditingGRN(null);
                                          setGrnFormData({
                                            invoiceNumber: '',
                                            invoiceDate: '',
                                            grnRefNo: '',
                                            grnDate: '',
                                            advancePayment: '',
                                            deliveredAmount: '',
                                          });
                                        }}
                                        className="h-6 w-6"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Invoice Number *
                                        </label>
                                        <Input
                                          type="text"
                                          value={grnFormData.invoiceNumber}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, invoiceNumber: e.target.value })}
                                          placeholder="Enter Invoice Number"
                                          style={{
                                            backgroundColor: colors.backgroundPrimary,
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
                                          value={grnFormData.invoiceDate}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, invoiceDate: e.target.value })}
                                          style={{
                                            backgroundColor: colors.backgroundPrimary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
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
                                            backgroundColor: colors.backgroundPrimary,
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
                                            backgroundColor: colors.backgroundPrimary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Advance Payment (D)
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={grnFormData.advancePayment}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, advancePayment: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                                            backgroundColor: colors.backgroundPrimary,
                                            borderColor: colors.borderLight,
                                            color: colors.textPrimary,
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                                          Delivered Amount (GRN) (E) *
                                        </label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={grnFormData.deliveredAmount}
                                          onChange={(e) => setGrnFormData({ ...grnFormData, deliveredAmount: e.target.value })}
                                          placeholder="0.00"
                                          style={{
                                            backgroundColor: colors.backgroundPrimary,
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
                                            invoiceNumber: '',
                                            invoiceDate: '',
                                            grnRefNo: '',
                                            grnDate: '',
                                            advancePayment: '',
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
                                        leftIcon={<Save className="h-3.5 w-3.5" />}
                                        onClick={() => handleSaveGRN(po.id)}
                                        isLoading={isSaving}
                                        disabled={isSaving || !grnFormData.invoiceNumber || !grnFormData.invoiceDate || !grnFormData.grnRefNo || !grnFormData.grnDate || !grnFormData.deliveredAmount}
                                      >
                                        {editingGRN ? 'Update' : 'Save'}
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm" style={{ borderColor: colors.borderLight }}>
                                  <thead>
                                    <tr style={{ backgroundColor: `${colors.primary}15` }}>
                                      <th className="px-3 py-2 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Invoice Number
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Invoice Date
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        GRN Ref. No.
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        GRN Date
                                      </th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Advance Payment (D)
                                      </th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Delivered Amount (GRN) (E)
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-semibold border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {poGrns.length > 0 ? (
                                      poGrns.map((grn) => (
                                        <tr key={grn.id} style={{ backgroundColor: `${colors.info}08` }}>
                                          <td className="px-3 py-2 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {grn.invoiceNumber}
                                          </td>
                                          <td className="px-3 py-2 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {new Date(grn.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                                          <td className="px-3 py-2 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {grn.grnRefNo}
                                          </td>
                                          <td className="px-3 py-2 text-sm border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {new Date(grn.grnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-right border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {grn.advancePayment ? formatCurrencyWithDecimals(Number(grn.advancePayment)) : '-'}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-right font-medium border" style={{ borderColor: colors.borderLight, color: colors.textPrimary }}>
                                            {formatCurrencyWithDecimals(Number(grn.deliveredAmount))}
                                          </td>
                                          <td className="px-3 py-2 text-center border" style={{ borderColor: colors.borderLight }}>
                                            <div className="flex items-center justify-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditGRN(grn)}
                                                className="h-6 w-6"
                                                style={{ color: colors.info }}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteGRN(po.id, grn.id, grn.grnRefNo)}
                                                className="h-6 w-6"
                                                style={{ color: colors.error }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={7} className="px-3 py-4 text-center text-xs border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                                          No GRNs yet. Click "Add GRN" to add one.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                    No purchase orders yet. Click "Add PO" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

