'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { ArrowLeft, Plus, Save, Edit, Trash2, Building2, Tag, Mail, User as UserIcon, Phone, X } from 'lucide-react';
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

export default function ProjectSupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  const supplierId = parseInt(params.supplierId as string);
  
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
      setPurchaseOrders(purchaseOrdersRes.data || []);
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{ color: colors.primary }}
          />
          <p style={{ color: colors.textSecondary }}>Loading supplier details…</p>
        </div>
      </div>
    );
  }

  if (!projectSupplier) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p style={{ color: colors.error }}>Supplier not found</p>
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const supplier = projectSupplier.supplier;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
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
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((po) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm border" style={{ borderColor: colors.borderLight, color: colors.textSecondary }}>
                    No purchase orders yet. Click "Add PO" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}

