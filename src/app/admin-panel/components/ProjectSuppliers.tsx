'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { Plus, Save, Edit, Trash2, Building2, Tag, Mail, User as UserIcon, Phone, Search, X, Eye } from 'lucide-react';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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

        {projectSuppliers.length === 0 ? (
          <div
            className="rounded-lg border px-4 py-6 text-center text-sm"
            style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
          >
            No suppliers assigned to this project yet.
          </div>
        ) : (
          <div className="space-y-4">
            {projectSuppliers.map((projectSupplier) => {
              const supplier = projectSupplier.supplier;
              return (
                <Card
                  key={projectSupplier.id}
                  className="p-5 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                  }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                    </div>

                    <div className="flex flex-row items-center gap-2 md:flex-col md:items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => onViewSupplierDetails?.(projectSupplier.id)}
                        style={{ color: colors.info }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSupplier(projectSupplier.id, supplier.name)}
                        aria-label={`Remove ${supplier.name}`}
                        className="h-9 w-9"
                        style={{
                          color: colors.error,
                        }}
                      >
                        <Trash2 className="h-4 w-4" style={{ color: colors.error }} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

