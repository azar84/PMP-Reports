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
  Filter,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  Trash,
  CheckCircle,
  Eye,
  Star,
  Calendar,
  Building2 as BuildingIcon,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface SupplierResponse {
  id: number;
  name: string;
  vendorCode: string | null;
  type: string;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  contractValueCapability: number | string | null;
  averageRating: number | null;
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
  vendorCode: string;
  type: 'Supplier' | 'Subcontractor';
  contactPerson: string;
  contactNumber: string;
  email: string;
  contractValueCapability: string;
};

const DEFAULT_FORM: SupplierFormState = {
  name: '',
  vendorCode: '',
  type: 'Supplier',
  contactPerson: '',
  contactNumber: '',
  email: '',
  contractValueCapability: '',
};

export default function SupplierManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();
  const currencySymbol = siteSettings?.currencySymbol || '$';

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
  const [filterTypeOfWorks, setFilterTypeOfWorks] = useState<string[]>([]);
  const [capabilityFrom, setCapabilityFrom] = useState<string>('');
  const [capabilityTo, setCapabilityTo] = useState<string>('');
  const [typeOfWorkSearchTerm, setTypeOfWorkSearchTerm] = useState<string>('');
  const [showTypeOfWorkDropdown, setShowTypeOfWorkDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<SupplierResponse | null>(null);
  const [supplierDetails, setSupplierDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const typeInputRef = useRef<HTMLInputElement | null>(null);
  const typeOfWorkDropdownRef = useRef<HTMLDivElement | null>(null);

  const formatCurrency = useCallback((value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) return '';
    // Format number with commas and add currency symbol from settings
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
    return `${currencySymbol}${formatted}`;
  }, [currencySymbol]);

  const parseCurrencyInput = useCallback((value: string): string => {
    // Remove currency symbols, commas, and spaces, keep only numbers and decimal point
    // Handle common currency symbols and the one from settings
    const currencySymbols = ['$', '€', '£', '¥', currencySymbol].filter(Boolean);
    const regex = new RegExp(`[${currencySymbols.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')},\\s]`, 'g');
    return value.replace(regex, '');
  }, [currencySymbol]);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return suppliers.filter((supplier) => {
      // Filter by vendor type
      if (typeFilter !== 'all' && supplier.type !== typeFilter) {
        return false;
      }

      // Filter by type of works
      if (filterTypeOfWorks.length > 0) {
        const supplierWorkTypes = supplier.typeOfWorks.map((link) => link.typeOfWork.name.toLowerCase());
        const hasMatchingWorkType = filterTypeOfWorks.some((filterWork) =>
          supplierWorkTypes.includes(filterWork.toLowerCase())
        );
        if (!hasMatchingWorkType) {
          return false;
        }
      }

      // Filter by capability range
      if (capabilityFrom || capabilityTo) {
        const supplierCapability = supplier.contractValueCapability
          ? (typeof supplier.contractValueCapability === 'string'
              ? Number.parseFloat(supplier.contractValueCapability)
              : Number(supplier.contractValueCapability))
          : null;

        if (supplierCapability === null) {
          return false; // Exclude suppliers without capability if range filter is set
        }

        const fromValue = capabilityFrom ? Number.parseFloat(parseCurrencyInput(capabilityFrom)) : null;
        const toValue = capabilityTo ? Number.parseFloat(parseCurrencyInput(capabilityTo)) : null;

        if (fromValue !== null && supplierCapability < fromValue) {
          return false;
        }
        if (toValue !== null && supplierCapability > toValue) {
          return false;
        }
      }

      // Filter by search term
      if (term) {
        const fields = [
          supplier.name,
          supplier.vendorCode ?? '',
          supplier.type,
          supplier.contactPerson ?? '',
          supplier.contactNumber ?? '',
          supplier.email ?? '',
          supplier.contractValueCapability ? formatCurrency(
            typeof supplier.contractValueCapability === 'string'
              ? Number.parseFloat(supplier.contractValueCapability)
              : supplier.contractValueCapability
          ) : '',
          ...supplier.typeOfWorks.map((link) => link.typeOfWork.name ?? ''),
        ];
        return fields.some((value) => value.toLowerCase().includes(term));
      }

      return true;
    });
  }, [suppliers, searchTerm, typeFilter, filterTypeOfWorks, capabilityFrom, capabilityTo, formatCurrency, parseCurrencyInput]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeOfWorkDropdownRef.current &&
        !typeOfWorkDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeOfWorkDropdown(false);
      }
    };

    if (showTypeOfWorkDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeOfWorkDropdown]);

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
    const contractValue = supplier.contractValueCapability 
      ? (typeof supplier.contractValueCapability === 'string' 
          ? supplier.contractValueCapability 
          : String(supplier.contractValueCapability))
      : '';
    setFormState({
      name: supplier.name,
      vendorCode: supplier.vendorCode ?? '',
      type: supplier.type === 'Subcontractor' ? 'Subcontractor' : 'Supplier',
      contactPerson: supplier.contactPerson ?? '',
      contactNumber: supplier.contactNumber ?? '',
      email: supplier.email ?? '',
      contractValueCapability: contractValue,
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
          response = await put<{ success: boolean; error?: string }>(`/api/admin/suppliers/${editingSupplierId}`, payload);
        } else {
          response = await post<{ success: boolean; error?: string }>('/api/admin/suppliers', payload);
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

  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/suppliers/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting suppliers data:', error);
      alert('Failed to export suppliers data. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.size === filteredSuppliers.length && filteredSuppliers.length > 0) {
      setSelectedSuppliers(new Set());
    } else {
      const newSelection = new Set(filteredSuppliers.map(supplier => supplier.id));
      setSelectedSuppliers(newSelection);
    }
  };

  const handleSelectSupplier = (supplierId: number) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const handleViewSupplier = async (supplier: SupplierResponse) => {
    setViewingSupplier(supplier);
    setLoadingDetails(true);
    try {
      const response = await get<{ success: boolean; data: any }>(`/api/admin/suppliers/${supplier.id}/details`);
      if (response.success) {
        setSupplierDetails(response.data);
      } else {
        alert('Failed to load vendor details');
      }
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      alert('Failed to load vendor details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewingSupplier ? (
        <>
          {/* Vendor Details View */}
          <div className="space-y-6">
            {/* Detail View Header */}
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => {
                      setViewingSupplier(null);
                      setSupplierDetails(null);
                    }}
                    variant="ghost"
                    className="p-2 hover:bg-opacity-80 transition-all"
                    title="Back to Vendors List"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <BuildingIcon className="w-8 h-8" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {viewingSupplier.name}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ 
                        backgroundColor: viewingSupplier.type === 'Subcontractor' ? 'var(--color-warning)' : 'var(--color-primary)',
                        color: 'var(--color-bg-primary)'
                      }}>
                        {viewingSupplier.type}
                      </span>
                      {viewingSupplier.vendorCode && (
                        <>
                          <span className="text-sm" style={{ color: 'var(--color-border-light)' }}>•</span>
                          <span className="text-sm font-mono px-2 py-1 rounded" style={{ 
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {viewingSupplier.vendorCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => {
                      setViewingSupplier(null);
                      setSupplierDetails(null);
                      handleEditSupplier(viewingSupplier);
                    }}
                    className="flex items-center space-x-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Vendor</span>
                  </Button>
                </div>
              </div>
            </Card>

            {loadingDetails ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
              </div>
            ) : supplierDetails ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar - Basic Info & Summary */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Contact Information */}
                  <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                      <Phone className="w-4 h-4" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-3">
                      {supplierDetails.contactPerson ? (
                        <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <UserIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Contact Person</p>
                            <p className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {supplierDetails.contactPerson}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No contact person provided</p>
                        </div>
                      )}
                      {supplierDetails.contactNumber ? (
                        <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {supplierDetails.contactNumber}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No phone number provided</p>
                        </div>
                      )}
                      {supplierDetails.email ? (
                        <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                            <p className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {supplierDetails.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No email provided</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Type of Works */}
                  {supplierDetails.typeOfWorks && supplierDetails.typeOfWorks.length > 0 && (
                    <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                      <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                        <Tag className="w-4 h-4" />
                        <span>Type of Works</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {supplierDetails.typeOfWorks.map((work: any) => (
                          <span
                            key={work.id}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: 'var(--color-bg-primary)',
                              border: '1px solid var(--color-border-light)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {work.name}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Summary Stats */}
                  <Card className="p-5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                      <BuildingIcon className="w-4 h-4" />
                      <span>Summary</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Total Projects</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                          {supplierDetails.projects?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Feedback Entries</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-info)' }}>
                          {supplierDetails.evaluations?.length || 0}
                        </span>
                      </div>
                      {supplierDetails.contractValueCapability && (
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Capability ({currencySymbol})</span>
                          <span className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                            {formatCurrency(
                              typeof supplierDetails.contractValueCapability === 'string'
                                ? Number.parseFloat(supplierDetails.contractValueCapability)
                                : supplierDetails.contractValueCapability
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Type</span>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            backgroundColor: supplierDetails.type === 'Subcontractor' ? 'var(--color-warning)' : 'var(--color-primary)',
                            color: 'var(--color-bg-primary)'
                          }}
                        >
                          {supplierDetails.type}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Main Content - Projects */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Projects & Performance Feedback */}
                  <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <h3 className="text-lg font-semibold mb-5 flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
                      <BuildingIcon className="w-5 h-5" />
                      <span>Projects & Performance Feedback</span>
                      <span className="text-sm font-normal px-2 py-0.5 rounded-full" style={{ 
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {supplierDetails.projects?.length || 0}
                      </span>
                    </h3>
                    {supplierDetails.projects && supplierDetails.projects.length > 0 ? (
                      <div className="space-y-4">
                        {supplierDetails.projects.map((project: any) => {
                          // Find evaluation for this project
                          const evaluation = supplierDetails.evaluations?.find((evaluationItem: any) => evaluationItem.projectId === project.id);
                          
                          return (
                            <div
                              key={project.id}
                              className="p-6 rounded-xl border transition-all hover:shadow-lg"
                              style={{
                                backgroundColor: 'var(--color-bg-primary)',
                                borderColor: 'var(--color-border-light)',
                              }}
                            >
                              {/* Project Header */}
                              <div className="flex items-start justify-between mb-5 pb-5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-4 mb-3">
                                    <div className="p-3 rounded-xl flex-shrink-0" style={{ 
                                      backgroundColor: 'var(--color-bg-secondary)',
                                      border: '1px solid var(--color-border-light)'
                                    }}>
                                      <BuildingIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
                                          {project.projectName}
                                        </h4>
                                        {project.projectCode && (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold flex-shrink-0" style={{ 
                                            backgroundColor: 'var(--color-info)',
                                            color: 'var(--color-bg-primary)'
                                          }}>
                                            {project.projectCode}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3 text-xs mt-3">
                                        {project.startDate && (
                                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ 
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            color: 'var(--color-text-secondary)'
                                          }}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                        {project.endDate && (
                                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ 
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            color: 'var(--color-text-secondary)'
                                          }}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                        {project.status && (
                                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ 
                                            backgroundColor: project.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                                            color: 'var(--color-bg-primary)'
                                          }}>
                                            {project.status}
                                          </span>
                                        )}
                                      </div>
                                      {project.projectManager && (
                                        <div className="flex items-center gap-2 mt-3 px-2 py-1 rounded-md" style={{ 
                                          backgroundColor: 'var(--color-bg-secondary)'
                                        }}>
                                          <UserIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                            {project.projectManager.staffName}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {project.performanceRating && (
                                  <div className="flex flex-col items-center gap-1 ml-4 flex-shrink-0">
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < project.performanceRating ? 'fill-current' : ''}`}
                                          style={{ color: i < project.performanceRating ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                      {project.performanceRating}/5
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Performance Review from ProjectSupplier */}
                              {project.performanceReview && (
                                <div className="mb-4 p-4 rounded-lg border-l-4 transition-all" style={{ 
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  borderLeftColor: 'var(--color-primary)',
                                  borderLeftWidth: '4px'
                                }}>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-md" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                      <Star className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                      Performance Review
                                    </p>
                                  </div>
                                  <p className="text-sm leading-relaxed pl-8" style={{ color: 'var(--color-text-primary)' }}>
                                    {project.performanceReview}
                                  </p>
                                </div>
                              )}
                              
                              {/* Performance Feedback from ProjectVendorEvaluation */}
                              {evaluation && (
                                <div className="mb-4 p-4 rounded-lg border-l-4 transition-all" style={{ 
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  borderLeftColor: evaluation.rating === 'VERY_GOOD' 
                                    ? 'var(--color-success)' 
                                    : evaluation.rating === 'GOOD' 
                                    ? 'var(--color-primary)' 
                                    : 'var(--color-error)',
                                  borderLeftWidth: '4px'
                                }}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-md" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                        <UserIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                                      </div>
                                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Project Manager Feedback
                                      </p>
                                    </div>
                                    <span
                                      className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                                      style={{
                                        backgroundColor:
                                          evaluation.rating === 'VERY_GOOD'
                                            ? 'var(--color-success)'
                                            : evaluation.rating === 'GOOD'
                                            ? 'var(--color-primary)'
                                            : 'var(--color-error)',
                                        color: 'var(--color-bg-primary)',
                                      }}
                                    >
                                      {evaluation.rating.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {evaluation.notes && (
                                    <p className="text-sm leading-relaxed pl-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                      {evaluation.notes}
                                    </p>
                                  )}
                                  <div className="pl-8 pt-3 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                      {new Date(evaluation.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {project.notes && (
                                <div className="p-4 rounded-lg border" style={{ 
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  borderColor: 'var(--color-border-light)'
                                }}>
                                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    Additional Notes
                                  </p>
                                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{project.notes}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BuildingIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          No projects assigned
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          This vendor hasn't been assigned to any projects yet
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p style={{ color: 'var(--color-text-muted)' }}>Failed to load vendor details</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Main Content */}
          <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Vendors
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your supplier and subcontractor network, contact details, and work categories.
          </p>
        </div>
        <Button
          onClick={handleStartCreate}
          className="flex items-center space-x-2"
          style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </Button>
      </div>

      {/* Combined Filters */}
      <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text-primary)' }}>
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </h3>
          {(typeFilter !== 'all' || filterTypeOfWorks.length > 0 || capabilityFrom || capabilityTo || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setFilterTypeOfWorks([]);
                setCapabilityFrom('');
                setCapabilityTo('');
                setTypeOfWorkSearchTerm('');
                setSearchTerm('');
                setShowTypeOfWorkDropdown(false);
              }}
              className="text-xs transition-colors"
              style={{ color: 'var(--color-error)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-error)';
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-error)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <Input
                type="text"
                placeholder="Search vendors by name, code, type, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {/* Vendor Type Filter */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Vendor Type
            </label>
            <div className="flex items-center space-x-2">
              {(['all', 'Supplier', 'Subcontractor'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTypeFilter(option === 'all' ? 'all' : option)}
                  className="rounded-full px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: typeFilter === option ? 'var(--color-primary)' : 'var(--color-bg-primary)',
                    color: typeFilter === option ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                    border: `1px solid ${typeFilter === option ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                  }}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Type of Works Filter */}
            <div className="relative">
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Type of Works
                </label>
                
                {/* Selected Tags */}
                {filterTypeOfWorks.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {filterTypeOfWorks.map((work) => (
                      <span
                        key={work}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}60`,
                        }}
                      >
                        {work}
                        <button
                          type="button"
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                          onClick={() => setFilterTypeOfWorks(prev => prev.filter(w => w !== work))}
                          aria-label={`Remove ${work}`}
                          style={{ color: colors.primary }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Searchable Dropdown */}
                <div className="relative" ref={typeOfWorkDropdownRef}>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <Input
                      type="text"
                      placeholder="Search type of works..."
                      value={typeOfWorkSearchTerm}
                      onChange={(e) => {
                        setTypeOfWorkSearchTerm(e.target.value);
                        setShowTypeOfWorkDropdown(true);
                      }}
                      onFocus={() => setShowTypeOfWorkDropdown(true)}
                      className="pl-10 pr-10"
                    />
                    {typeOfWorkSearchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setTypeOfWorkSearchTerm('');
                          setShowTypeOfWorkDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showTypeOfWorkDropdown && uniqueTypeOptions.length > 0 && (
                    <div 
                      className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border-light)',
                        border: '1px solid var(--color-border-light)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      {(() => {
                        const searchLower = typeOfWorkSearchTerm.toLowerCase();
                        const filtered = uniqueTypeOptions.filter(option => {
                          const matchesSearch = !searchLower || option.name.toLowerCase().includes(searchLower);
                          const notSelected = !filterTypeOfWorks.includes(option.name);
                          return matchesSearch && notSelected;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                              {typeOfWorkSearchTerm 
                                ? 'No matching work types found' 
                                : filterTypeOfWorks.length > 0 
                                  ? 'All work types selected' 
                                  : 'No work types available'}
                            </div>
                          );
                        }

                        return (
                          <div className="py-1">
                            {filtered.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setFilterTypeOfWorks(prev => [...prev, option.name]);
                                  setTypeOfWorkSearchTerm('');
                                  setShowTypeOfWorkDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-80 transition-colors flex items-center space-x-2"
                                style={{
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-text-primary)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Plus className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                                <span>{option.name}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

            {/* Capability Range Filter */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Capability Range ({currencySymbol})
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-medium whitespace-nowrap min-w-[35px]" style={{ color: 'var(--color-text-primary)' }}>From</label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {currencySymbol}
                    </span>
                    <Input
                      type="text"
                      value={capabilityFrom}
                      onChange={(e) => {
                        const cleaned = parseCurrencyInput(e.target.value);
                        setCapabilityFrom(cleaned);
                      }}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-medium whitespace-nowrap min-w-[20px]" style={{ color: 'var(--color-text-primary)' }}>To</label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {currencySymbol}
                    </span>
                    <Input
                      type="text"
                      value={capabilityTo}
                      onChange={(e) => {
                        const cleaned = parseCurrencyInput(e.target.value);
                        setCapabilityTo(cleaned);
                      }}
                      placeholder="No limit"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Total Vendors
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
                {totalSuppliers}
              </p>
            </div>
            <Users className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Subcontractors
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
                {totalSubcontractors}
              </p>
            </div>
            <Building2 className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Work Categories
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
                {uniqueWorkTypes}
              </p>
            </div>
            <Tag className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          </div>
        </Card>
      </div>

      {(showForm || editingSupplierId !== null) && (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
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
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)',
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

            <Input
              label="Vendor Code"
              value={formState.vendorCode}
              onChange={(event) => handleInputChange('vendorCode', event.target.value)}
              placeholder="e.g., VND-001"
            />

            <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
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
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-light)',
                  color: 'var(--color-text-primary)',
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Capability ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {currencySymbol}
                </span>
                <Input
                  type="text"
                  value={formState.contractValueCapability}
                  onChange={(event) => {
                    const cleaned = parseCurrencyInput(event.target.value);
                    handleInputChange('contractValueCapability', cleaned);
                  }}
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (value && !Number.isNaN(Number.parseFloat(value))) {
                      const formatted = formatCurrency(Number.parseFloat(value));
                      // Store the numeric value but display formatted on blur
                      // We'll keep the numeric value in state for submission
                    }
                  }}
                  placeholder="e.g., 100000"
                  className="pl-8"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Maximum contract value this vendor can undertake
              </p>
            </div>

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
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-light)',
                        color: 'var(--color-text-secondary)',
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
                      backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(var(--color-primary-rgb), 0.4)',
                    }}
                  >
                    {work}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/40"
                      onClick={() => handleRemoveTypeOfWork(work)}
                      aria-label={`Remove ${work}`}
                      style={{ color: 'var(--color-primary)' }}
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

      {/* Vendors Table */}
      <Card className="overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Card Header with Import/Export Actions */}
        <div className="px-6 py-4 border-b flex items-center justify-end" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
        style={{
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to Excel"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Import Vendor Data"
            >
              <Upload className="w-5 h-5" />
            </button>
            {selectedSuppliers.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="p-2 rounded hover:opacity-80 transition-all duration-150"
                style={{ 
                  color: 'var(--color-error)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Delete Selected (${selectedSuppliers.size})`}
              >
                <Trash className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Selection Status */}
        {selectedSuppliers.size > 0 && (
          <div className="px-6 py-3 border-b" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)' }}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {selectedSuppliers.size} vendor(s) selected
          </span>
        </div>
          </div>
        )}

        <div className="overflow-x-auto">
        {filteredSuppliers.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No vendors match the current filters.
              </p>
          </div>
        ) : (
            <table className="w-full table-auto" style={{ tableLayout: 'auto' }}>
              <thead>
                <tr style={{ 
                  borderBottom: '1px solid var(--color-border-light)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}>
                  <th className="w-12 px-2 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        variant="primary"
                        size="sm"
                        checked={selectedSuppliers.size === filteredSuppliers.length && filteredSuppliers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Name
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Rating
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Vendor Code
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Type
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Contact Person
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Phone
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Email
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Capability ({currencySymbol})
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Type of Works
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
            {filteredSuppliers.map((supplier) => (
                  <tr 
                key={supplier.id}
                style={{
                      borderBottom: '1px solid var(--color-border-light)',
                      backgroundColor: 'var(--color-bg-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          variant="primary"
                          size="sm"
                          checked={selectedSuppliers.has(supplier.id)}
                          onChange={() => handleSelectSupplier(supplier.id)}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {supplier.name}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {supplier.averageRating !== null && supplier.averageRating !== undefined ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => {
                              const rating = supplier.averageRating ?? 0;
                              const roundedRating = Math.round(rating);
                              return (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < roundedRating ? 'fill-current' : ''}`}
                                  style={{ 
                                    color: i < roundedRating 
                                      ? 'var(--color-warning)' 
                                      : 'var(--color-text-muted)' 
                                  }}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {supplier.averageRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {supplier.vendorCode ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--color-info)', color: 'var(--color-bg-primary)' }}>
                          {supplier.vendorCode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium" style={{ 
                        backgroundColor: supplier.type === 'Subcontractor' ? 'var(--color-warning)' : 'var(--color-primary)',
                        color: 'var(--color-bg-primary)'
                      }}>
                        {supplier.type}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {supplier.contactPerson || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {supplier.contactNumber || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {supplier.email || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {supplier.contractValueCapability ? (
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(
                            typeof supplier.contractValueCapability === 'string'
                              ? Number.parseFloat(supplier.contractValueCapability)
                              : supplier.contractValueCapability
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1">
                        {supplier.typeOfWorks.slice(0, 2).map((link) => (
                      <span
                            key={`${supplier.id}-${link.typeOfWork.id}`}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                        style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              border: '1px solid var(--color-border-light)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {link.typeOfWork.name}
                      </span>
                        ))}
                        {supplier.typeOfWorks.length > 2 && (
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            +{supplier.typeOfWorks.length - 2}
                          </span>
                        )}
                    </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="p-1.5 rounded hover:opacity-80 transition-all"
                          style={{ color: 'var(--color-info)' }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="p-1.5 rounded hover:opacity-80 transition-all"
                          style={{ color: 'var(--color-primary)' }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-1.5 rounded hover:opacity-80 transition-all"
                          style={{ color: 'var(--color-error)' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
          </div>
        </>
      )}
    </div>
  );
}

