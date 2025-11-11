'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Save,
  Edit,
  X,
  Trash2,
  Building2,
  Users,
  Tag,
  Mail,
  User as UserIcon,
  Phone,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface SupplierResponse {
  id: number;
  name: string;
  type: string;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  typeOfWorks: Array<{
    typeOfWork: {
      id: number;
      name: string;
    };
  }>;
  createdAt: string;
}

interface TypeOfWorkOption {
  id: number;
  name: string;
}

interface SuppliersApiResponse {
  success: boolean;
  data: {
    suppliers: SupplierResponse[];
    typeOfWorks: TypeOfWorkOption[];
  };
  error?: string;
}

type SupplierFormState = {
  name: string;
  type: 'Supplier' | 'Subcontractor';
  contactPerson: string;
  contactNumber: string;
  email: string;
};

const DEFAULT_FORM: SupplierFormState = {
  name: '',
  type: 'Supplier',
  contactPerson: '',
  contactNumber: '',
  email: '',
};

export default function SupplierManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [typeOptions, setTypeOptions] = useState<TypeOfWorkOption[]>([]);
  const [formState, setFormState] = useState<SupplierFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Supplier' | 'Subcontractor'>('all');
  const [selectedTypeOfWorks, setSelectedTypeOfWorks] = useState<string[]>([]);
  const [typeOfWorkInput, setTypeOfWorkInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const typeInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return suppliers.filter((supplier) => {
      if (typeFilter !== 'all' && supplier.type !== typeFilter) {
        return false;
      }
      if (!term) return true;
      const fields = [
        supplier.name,
        supplier.type,
        supplier.contactPerson ?? '',
        supplier.contactNumber ?? '',
        supplier.email ?? '',
        ...supplier.typeOfWorks.map((link) => link.typeOfWork.name ?? ''),
      ];
      return fields.some((value) => value.toLowerCase().includes(term));
    });
  }, [suppliers, searchTerm, typeFilter]);

  const totalSuppliers = suppliers.length;
  const totalSubcontractors = suppliers.filter((supplier) => supplier.type === 'Subcontractor')
    .length;
  const uniqueWorkTypes = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((supplier) => {
      supplier.typeOfWorks.forEach((link) => {
        if (link.typeOfWork?.name) {
          set.add(link.typeOfWork.name);
        }
      });
    });
    return set.size;
  }, [suppliers]);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setSaveError(null);
    try {
      const response = await get<SuppliersApiResponse>('/api/admin/suppliers');
      if (!response.success) {
        throw new Error(response.error || 'Failed to load suppliers');
      }

      setSuppliers(response.data.suppliers ?? []);
      setTypeOptions(response.data.typeOfWorks ?? []);
    } catch (error: any) {
      console.error('Failed to fetch suppliers:', error);
      setSaveError(error?.message || 'Failed to load vendors.');
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleInputChange = useCallback(
    (field: keyof SupplierFormState, value: string) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState(DEFAULT_FORM);
    setEditingSupplierId(null);
    setSelectedTypeOfWorks([]);
    setTypeOfWorkInput('');
    setSaveError(null);
    setShowForm(false);
  }, []);

  const handleStartCreate = useCallback(() => {
    setShowForm(true);
    setSaveError(null);
    setEditingSupplierId(null);
    setFormState(DEFAULT_FORM);
    setSelectedTypeOfWorks([]);
    setTypeOfWorkInput('');
    requestAnimationFrame(() => {
      typeInputRef.current?.focus();
    });
  }, []);

  const handleEditSupplier = useCallback((supplier: SupplierResponse) => {
    setShowForm(true);
    setSaveError(null);
    setEditingSupplierId(supplier.id);
    setFormState({
      name: supplier.name,
      type: supplier.type === 'Subcontractor' ? 'Subcontractor' : 'Supplier',
      contactPerson: supplier.contactPerson ?? '',
      contactNumber: supplier.contactNumber ?? '',
      email: supplier.email ?? '',
    });
    setSelectedTypeOfWorks(
      supplier.typeOfWorks.map((link) => link.typeOfWork.name).filter((name) => !!name)
    );
    setTypeOfWorkInput('');
    requestAnimationFrame(() => {
      typeInputRef.current?.focus();
    });
  }, []);

  const handleDeleteSupplier = useCallback(
    async (supplierId: number) => {
      if (!confirm('Are you sure you want to delete this vendor?')) {
        return;
      }

      try {
        await del(`/api/admin/suppliers/${supplierId}`);
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== supplierId));
      } catch (error) {
        console.error('Failed to delete vendor:', error);
        setSaveError('Failed to delete vendor. Please try again.');
      }
    },
    [del]
  );

  const uniqueTypeOptions = useMemo(() => {
    const names = new Set<string>();
    const unique: TypeOfWorkOption[] = [];
    typeOptions.forEach((option) => {
      if (!names.has(option.name)) {
        names.add(option.name);
        unique.push(option);
      }
    });
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [typeOptions]);

  const addTypeOfWork = useCallback((value: string) => {
    const candidate = value.trim();
    if (!candidate) return;
    setSelectedTypeOfWorks((prev) => {
      if (prev.some((item) => item.toLowerCase() === candidate.toLowerCase())) {
        return prev;
      }
      return [...prev, candidate];
    });
  }, []);

  const handleAddTypeOfWork = useCallback(() => {
    const raw = typeOfWorkInput.trim();
    if (!raw) return;
    const exactMatch = uniqueTypeOptions.find(
      (option) => option.name.toLowerCase() === raw.toLowerCase()
    );
    const partialMatch = uniqueTypeOptions.find((option) =>
      option.name.toLowerCase().includes(raw.toLowerCase())
    );
    const valueToAdd = exactMatch?.name ?? partialMatch?.name ?? raw;
    addTypeOfWork(valueToAdd);
    setTypeOfWorkInput('');
  }, [addTypeOfWork, typeOfWorkInput, uniqueTypeOptions]);

  const handleRemoveTypeOfWork = useCallback((value: string) => {
    setSelectedTypeOfWorks((prev) =>
      prev.filter((item) => item.toLowerCase() !== value.toLowerCase())
    );
  }, []);

  const handleTypeOfWorkInputChange = useCallback((value: string) => {
    setTypeOfWorkInput(value);
  }, []);

  const filteredTypeOfWorkSuggestions = useMemo(() => {
    const input = typeOfWorkInput.trim().toLowerCase();
    if (!input) return [];
    return uniqueTypeOptions
      .filter(
        (option) =>
          option.name.toLowerCase().includes(input) &&
          !selectedTypeOfWorks.some(
            (value) => value.toLowerCase() === option.name.toLowerCase()
          )
      )
      .slice(0, 6);
  }, [selectedTypeOfWorks, typeOfWorkInput, uniqueTypeOptions]);

  const handleTypeOfWorkKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const firstSuggestion = filteredTypeOfWorkSuggestions[0];
        if (firstSuggestion) {
          addTypeOfWork(firstSuggestion.name);
          setTypeOfWorkInput('');
        } else {
          handleAddTypeOfWork();
        }
      }
    },
    [addTypeOfWork, filteredTypeOfWorkSuggestions, handleAddTypeOfWork]
  );

  const handleSelectTypeSuggestion = useCallback(
    (name: string) => {
      addTypeOfWork(name);
      setTypeOfWorkInput('');
      typeInputRef.current?.focus();
    },
    [addTypeOfWork]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSaving(true);
      setSaveError(null);

      const payload = {
        ...formState,
        typeOfWorks: selectedTypeOfWorks,
      };

      try {
        let response;
        if (editingSupplierId) {
          response = await put(`/api/admin/suppliers/${editingSupplierId}`, payload);
        } else {
          response = await post('/api/admin/suppliers', payload);
        }

        if (!response?.success) {
          throw new Error(response?.error || 'Unknown error');
        }

        await fetchSuppliers();
        resetForm();
      } catch (error: any) {
        console.error('Failed to save supplier:', error);
        setSaveError(error?.message || 'Failed to save vendor. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [editingSupplierId, fetchSuppliers, formState, post, put, resetForm, selectedTypeOfWorks]
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
        <p style={{ color: colors.textSecondary }}>Loading vendors…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Vendors
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage your supplier and subcontractor network, contact details, and work categories.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: colors.borderLight }}
          >
            <Filter className="h-4 w-4" style={{ color: colors.textSecondary }} />
            {(['all', 'Supplier', 'Subcontractor'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTypeFilter(option === 'all' ? 'all' : option)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor:
                    typeFilter === option
                      ? colors.backgroundPrimary
                      : `${colors.backgroundPrimary}40`,
                  color: typeFilter === option ? colors.primary : colors.textSecondary,
                  border: `1px solid ${
                    typeFilter === option ? colors.primary : colors.borderLight
                  }`,
                  boxShadow: typeFilter === option ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {option === 'all' ? 'All' : option}
              </button>
            ))}
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.borderLight,
                color: colors.textPrimary,
              }}
              className="w-full md:w-64"
            />
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleStartCreate}
              className="flex items-center gap-2 whitespace-nowrap px-4"
              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
            >
              + Add Vendor
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="p-4"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight,
            color: colors.textPrimary,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Total Vendors
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: colors.primary }}>
                {totalSuppliers}
              </p>
            </div>
            <Users className="h-8 w-8" style={{ color: colors.primary }} />
          </div>
        </Card>
        <Card
          className="p-4"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight,
            color: colors.textPrimary,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Subcontractors
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: colors.primary }}>
                {totalSubcontractors}
              </p>
            </div>
            <Building2 className="h-8 w-8" style={{ color: colors.primary }} />
          </div>
        </Card>
        <Card
          className="p-4"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight,
            color: colors.textPrimary,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Work Categories
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: colors.primary }}>
                {uniqueWorkTypes}
              </p>
            </div>
            <Tag className="h-8 w-8" style={{ color: colors.primary }} />
          </div>
        </Card>
      </div>

      {(showForm || editingSupplierId !== null) && (
        <Card
          className="p-6"
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.borderLight,
            color: colors.textPrimary,
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingSupplierId ? 'Edit Vendor' : 'Add Vendor'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              leftIcon={<X className="h-4 w-4" />}
            >
              {editingSupplierId ? 'Cancel Edit' : 'Close'}
            </Button>
          </div>

          {saveError && (
            <div
              className="mb-4 rounded-lg border px-4 py-3 text-sm"
              style={{
                backgroundColor: `${colors.error}15`,
                borderColor: `${colors.error}45`,
                color: colors.error,
              }}
            >
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Company Name"
              required
              value={formState.name}
              onChange={(event) => handleInputChange('name', event.target.value)}
            />

            <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
              Vendor Type
              <select
                value={formState.type}
                onChange={(event) =>
                  handleInputChange(
                    'type',
                    event.target.value === 'Subcontractor' ? 'Subcontractor' : 'Supplier'
                  )
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                  color: colors.textPrimary,
                }}
              >
                <option value="Supplier">Supplier</option>
                <option value="Subcontractor">Subcontractor</option>
              </select>
            </label>

            <Input
              label="Contact Person"
              value={formState.contactPerson}
              onChange={(event) => handleInputChange('contactPerson', event.target.value)}
            />

            <Input
              label="Contact Number"
              value={formState.contactNumber}
              onChange={(event) => handleInputChange('contactNumber', event.target.value)}
            />

            <Input
              label="Email"
              type="email"
              value={formState.email}
              onChange={(event) => handleInputChange('email', event.target.value)}
            />

            <div className="md:col-span-1">
              <Input
                label="Type of Works"
                ref={typeInputRef}
                list="type-of-work-options"
                required={selectedTypeOfWorks.length === 0}
                value={typeOfWorkInput}
                onChange={(event) => handleTypeOfWorkInputChange(event.target.value)}
                onKeyDown={handleTypeOfWorkKeyDown}
                onBlur={() => {
                  if (typeOfWorkInput.trim()) {
                    handleAddTypeOfWork();
                  }
                }}
                placeholder="Type to search or press Enter to add"
              />
              <datalist id="type-of-work-options">
                {uniqueTypeOptions.map((option) => (
                  <option key={option.id} value={option.name} />
                ))}
              </datalist>
              {filteredTypeOfWorkSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {filteredTypeOfWorkSuggestions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectTypeSuggestion(option.name)}
                      className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        border: `1px solid ${colors.borderLight}`,
                        color: colors.textSecondary,
                      }}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {selectedTypeOfWorks.map((work) => (
                  <span
                    key={work.toLowerCase()}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}40`,
                    }}
                  >
                    {work}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/40"
                      onClick={() => handleRemoveTypeOfWork(work)}
                      aria-label={`Remove ${work}`}
                      style={{ color: colors.primary }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="h-3 w-3" />}
                  onClick={handleAddTypeOfWork}
                  disabled={!typeOfWorkInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={isSaving}
                disabled={isSaving}
              >
                {editingSupplierId ? 'Update Vendor' : 'Add Vendor'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Vendor Records
          </h2>
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            {filteredSuppliers.length} results
          </span>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div
            className="rounded-lg border px-4 py-6 text-center text-sm"
            style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
          >
            No vendors match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="p-4"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                  color: colors.textPrimary,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {supplier.name}
                      </h3>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}30`,
                        }}
                      >
                        {supplier.type}
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap gap-4 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> {supplier.contactPerson || '—'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {supplier.contactNumber || '—'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> {supplier.email || '—'}
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.textSecondary }}
                      >
                        Type of Works
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {supplier.typeOfWorks.length > 0 ? (
                          supplier.typeOfWorks.map((link) => (
                            <span
                              key={`${supplier.id}-${link.typeOfWork.id}`}
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: colors.backgroundSecondary,
                                border: `1px solid ${colors.borderLight}`,
                                color: colors.textSecondary,
                              }}
                            >
                              <Tag className="h-3 w-3" /> {link.typeOfWork.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm" style={{ color: colors.textSecondary }}>
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditSupplier(supplier)}
                      aria-label="Edit vendor"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      aria-label="Delete vendor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

