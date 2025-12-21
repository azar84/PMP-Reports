'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Factory,
  Search,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  Trash,
  Filter,
  Truck
} from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';

interface Plant {
  id: number;
  plantDescription: string;
  plantCode: string;
  plateNumber?: string | null;
  plantType: 'direct' | 'indirect';
  isOwned: boolean;
  monthlyCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PlantManager() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canViewPlants = hasPermission(permissions, 'plants.view');
  const canCreatePlants = hasPermission(permissions, 'plants.create');
  const canUpdatePlants = hasPermission(permissions, 'plants.update');
  const canDeletePlants = hasPermission(permissions, 'plants.delete');

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin-panel/login');
    }
  }, [user, authLoading, router]);

  // All hooks must be called before any conditional returns (Rules of Hooks)
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState<Partial<Plant>>({
    plantDescription: '',
    plantCode: '',
    plateNumber: '',
    plantType: 'direct',
    isOwned: false,
    monthlyCost: 0,
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlants, setSelectedPlants] = useState<Set<number>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'hired'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchPlants = async () => {
    // Don't fetch if not authenticated
    if (!user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Plant[] }>('/api/admin/plants');
      if (response.success) {
        setPlants(response.data);
      }
    } catch (error: any) {
      // Silently handle 401 errors
      if (error?.status === 401) {
        return;
      }
      console.error('Error fetching plants:', error);
      setErrorMessage('Failed to fetch plants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.plantDescription?.trim() || !formData.plantCode?.trim()) {
      setErrorMessage('Plant description and code are required');
      return;
    }

    try {
      if (editingPlant) {
        const response = await put<{ success: boolean; data: Plant }>(
          `/api/admin/plants/${editingPlant.id}`,
          {
            plantDescription: formData.plantDescription.trim(),
            plantCode: formData.plantCode.trim(),
            plateNumber: formData.plateNumber?.trim() || null,
            plantType: formData.plantType || 'direct',
            isOwned: formData.isOwned ?? false,
            monthlyCost: formData.monthlyCost ?? 0,
            isActive: formData.isActive ?? true,
          }
        );

        if (response.success) {
          await fetchPlants();
          resetForm();
        }
      } else {
        const response = await post<{ success: boolean; data: Plant }>(
          '/api/admin/plants',
          {
            plantDescription: formData.plantDescription.trim(),
            plantCode: formData.plantCode.trim(),
            plateNumber: formData.plateNumber?.trim() || null,
            plantType: formData.plantType || 'direct',
            isOwned: formData.isOwned ?? false,
            monthlyCost: formData.monthlyCost ?? 0,
            isActive: formData.isActive ?? true,
          }
        );

        if (response.success) {
          await fetchPlants();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error('Error saving plant:', error);
      setErrorMessage(error.message || 'Failed to save plant');
    }
  };

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      plantDescription: plant.plantDescription,
      plantCode: plant.plantCode,
      plateNumber: plant.plateNumber || '',
      plantType: plant.plantType,
      isOwned: plant.isOwned,
      monthlyCost: plant.monthlyCost,
      isActive: plant.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plant?')) {
      return;
    }

    try {
      const response = await del<{ success: boolean }>(`/api/admin/plants/${id}`);
      if (response.success) {
        await fetchPlants();
      }
    } catch (error: any) {
      console.error('Error deleting plant:', error);
      alert('Failed to delete plant');
    }
  };

  useEffect(() => {
    // Only fetch if authenticated
    if (!authLoading && user) {
      fetchPlants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const resetForm = () => {
    setFormData({
      plantDescription: '',
      plantCode: '',
      plateNumber: '',
      plantType: 'direct',
      isOwned: false,
      monthlyCost: 0,
      isActive: true,
    });
    setEditingPlant(null);
    setShowForm(false);
    setErrorMessage('');
  };

  const filteredPlants = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return plants.filter((plant) => {
      // Search filter
      const matchesSearch = 
        plant.plantDescription.toLowerCase().includes(searchLower) ||
        plant.plantCode.toLowerCase().includes(searchLower) ||
        (plant.plateNumber && plant.plateNumber.toLowerCase().includes(searchLower));
      
      // Type filter
      const matchesType = typeFilter === 'all' || plant.plantType === typeFilter;
      
      // Ownership filter
      const matchesOwnership = ownershipFilter === 'all' || 
        (ownershipFilter === 'owned' && plant.isOwned) ||
        (ownershipFilter === 'hired' && !plant.isOwned);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && plant.isActive) ||
        (statusFilter === 'inactive' && !plant.isActive);
      
      return matchesSearch && matchesType && matchesOwnership && matchesStatus;
    });
  }, [plants, searchTerm, typeFilter, ownershipFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = plants.length;
    const active = plants.filter(p => p.isActive).length;
    const owned = plants.filter(p => p.isOwned).length;
    const hired = plants.filter(p => !p.isOwned).length;
    
    return { total, active, owned, hired };
  }, [plants]);

  // Don't render anything if not authenticated - redirect will happen (after all hooks)
  if (authLoading || !user) {
    return null;
  }

  // Check if user has view permission
  if (!canViewPlants) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Access Denied
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You do not have permission to view plants.
          </p>
        </Card>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedPlants.size === filteredPlants.length && filteredPlants.length > 0) {
      setSelectedPlants(new Set());
    } else {
      const newSelection = new Set(filteredPlants.map(plant => plant.id));
      setSelectedPlants(newSelection);
    }
  };

  const handleSelectPlant = (plantId: number) => {
    const newSelected = new Set(selectedPlants);
    if (newSelected.has(plantId)) {
      newSelected.delete(plantId);
    } else {
      newSelected.add(plantId);
    }
    setSelectedPlants(newSelected);
  };

  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/plants/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plants_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting plants data:', error);
      alert('Failed to export plants data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Plants
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage company plants and equipment
          </p>
        </div>
        {canCreatePlants && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Plant</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Total Plants
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.total}
              </p>
            </div>
            <Factory className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Active Plants
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.active}
              </p>
            </div>
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Owned / Hired
              </p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {stats.owned} / {stats.hired}
              </p>
            </div>
            <Truck className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <Input
          type="text"
          placeholder="Search plants by description, code, or plate number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--color-border-light)' }}>
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            {(['all', 'direct', 'indirect'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTypeFilter(option === 'all' ? 'all' : option)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: typeFilter === option ? 'var(--color-bg-primary)' : 'transparent',
                  color: typeFilter === option ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${typeFilter === option ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                }}
              >
                {option === 'all' ? 'All Types' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {editingPlant ? 'Edit Plant' : 'Add New Plant'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMessage && (
                <div
                  className="p-3 rounded-lg flex items-center space-x-2"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--color-error)', color: 'var(--color-error)', border: '1px solid' }}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Plant Description"
                    value={formData.plantDescription}
                    onChange={(e) => setFormData({ ...formData, plantDescription: e.target.value })}
                    required
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                  <Input
                    label="Plant Code"
                    value={formData.plantCode}
                    onChange={(e) => setFormData({ ...formData, plantCode: e.target.value })}
                    required
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                  <Input
                    label="Plate Number"
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="Optional"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                  <Input
                    label="Monthly Cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.monthlyCost || 0}
                    onChange={(e) => setFormData({ ...formData, monthlyCost: Number(e.target.value) })}
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-light)'
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Plant Type
                  </label>
                  <div className="flex space-x-4">
                    {(['direct', 'indirect'] as const).map((type) => (
                      <label key={type} className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <input
                          type="radio"
                          checked={formData.plantType === type}
                          onChange={() => setFormData({ ...formData, plantType: type })}
                          className="h-4 w-4 border-2 rounded-full cursor-pointer"
                          style={{ 
                            accentColor: 'var(--color-primary)',
                            borderColor: 'var(--color-border-light)',
                          }}
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Ownership
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <input
                        type="radio"
                        checked={formData.isOwned}
                        onChange={() => setFormData({ ...formData, isOwned: true })}
                        className="h-4 w-4 border-2 rounded-full cursor-pointer"
                        style={{ 
                          accentColor: 'var(--color-primary)',
                          borderColor: 'var(--color-border-light)',
                        }}
                      />
                      <span>Owned</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <input
                        type="radio"
                        checked={!formData.isOwned}
                        onChange={() => setFormData({ ...formData, isOwned: false })}
                        className="h-4 w-4 border-2 rounded-full cursor-pointer"
                        style={{ 
                          accentColor: 'var(--color-primary)',
                          borderColor: 'var(--color-border-light)',
                        }}
                      />
                      <span>Hired</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 border-2 rounded cursor-pointer"
                    style={{ 
                      accentColor: 'var(--color-primary)',
                      borderColor: 'var(--color-border-light)',
                    }}
                  />
                  <span>Active Plant</span>
                </label>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={resetForm}
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex items-center space-x-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingPlant ? 'Update' : 'Create'}</span>
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Plants Table */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }}></div>
        </div>
      ) : (
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
              {canCreatePlants && (
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
                  title="Import Plant Data"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
              {selectedPlants.size > 0 && canDeletePlants && (
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
                  title={`Delete Selected (${selectedPlants.size})`}
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Selection Status */}
          {selectedPlants.size > 0 && (
            <div className="px-6 py-3 border-b" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedPlants.size} plant(s) selected
                </span>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            {filteredPlants.length === 0 ? (
              <div className="p-8 text-center">
                <Factory className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {searchTerm ? 'No plants found matching your search' : 'No plants found. Add your first plant to get started.'}
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
                          checked={selectedPlants.size === filteredPlants.length && filteredPlants.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Description
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Code
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Plate Number
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Type
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Ownership
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                      Status
                    </th>
                    {(canUpdatePlants || canDeletePlants) && (
                      <th className="w-24 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                        Actions
                      </th>
                    )}
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr 
                    key={plant.id} 
                    style={{
                        borderBottom: '1px solid var(--color-border-light)',
                        backgroundColor: 'var(--color-bg-primary)',
                        opacity: plant.isActive ? 1 : 0.7
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
                            checked={selectedPlants.has(plant.id)}
                            onChange={() => handleSelectPlant(plant.id)}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Factory className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {plant.plantDescription}
                          </span>
                      </div>
                    </td>
                      <td className="px-2 py-3">
                        <span className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {plant.plantCode}
                        </span>
                    </td>
                      <td className="px-2 py-3">
                        <span style={{ color: 'var(--color-text-primary)' }}>
                        {plant.plateNumber || '-'}
                      </span>
                    </td>
                      <td className="px-2 py-3">
                        <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                          {plant.plantType}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {plant.isOwned ? 'Owned' : 'Hired'}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {plant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {(canUpdatePlants || canDeletePlants) && (
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-center space-x-2">
                            {canUpdatePlants && (
                              <button
                                onClick={() => handleEdit(plant)}
                                className="p-1.5 rounded hover:opacity-80 transition-all"
                                style={{ color: 'var(--color-primary)' }}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {canDeletePlants && (
                              <button
                                onClick={() => handleDelete(plant.id)}
                                className="p-1.5 rounded hover:opacity-80 transition-all"
                                style={{ color: 'var(--color-error)' }}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

