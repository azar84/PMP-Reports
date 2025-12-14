'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
} from 'lucide-react';
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
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

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

  // Don't render anything if not authenticated - redirect will happen (after all hooks)
  if (authLoading || !user) {
    return null;
  }

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

  const filteredPlants = plants.filter((plant) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      plant.plantDescription.toLowerCase().includes(searchLower) ||
      plant.plantCode.toLowerCase().includes(searchLower) ||
      (plant.plateNumber && plant.plateNumber.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Plant Manager
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Manage company plants and equipment
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Plant</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search plants by description, code, or plate number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{ backgroundColor: colors.backgroundPrimary }}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundPrimary }}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  {editingPlant ? 'Edit Plant' : 'Add New Plant'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{ color: colors.textSecondary }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMessage && (
                <div
                  className="p-3 rounded-lg flex items-center space-x-2"
                  style={{ backgroundColor: colors.error + '20', color: colors.error }}
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
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  />
                  <Input
                    label="Plant Code"
                    value={formData.plantCode}
                    onChange={(e) => setFormData({ ...formData, plantCode: e.target.value })}
                    required
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  />
                  <Input
                    label="Plate Number"
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="Optional"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  />
                  <Input
                    label="Monthly Cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.monthlyCost || 0}
                    onChange={(e) => setFormData({ ...formData, monthlyCost: Number(e.target.value) })}
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Plant Type
                  </label>
                  <div className="flex space-x-4">
                    {(['direct', 'indirect'] as const).map((type) => (
                      <label key={type} className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                        <input
                          type="radio"
                          checked={formData.plantType === type}
                          onChange={() => setFormData({ ...formData, plantType: type })}
                          className="h-4 w-4 border-2 rounded-full cursor-pointer"
                          style={{ 
                            accentColor: colors.primary,
                            borderColor: colors.borderLight,
                            backgroundColor: formData.plantType === type ? colors.primary : 'transparent',
                          }}
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Ownership
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <input
                        type="radio"
                        checked={formData.isOwned}
                        onChange={() => setFormData({ ...formData, isOwned: true })}
                        className="h-4 w-4 border-2 rounded-full cursor-pointer"
                        style={{ 
                          accentColor: colors.primary,
                          borderColor: colors.borderLight,
                          backgroundColor: formData.isOwned ? colors.primary : 'transparent',
                        }}
                      />
                      <span>Owned</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                      <input
                        type="radio"
                        checked={!formData.isOwned}
                        onChange={() => setFormData({ ...formData, isOwned: false })}
                        className="h-4 w-4 border-2 rounded-full cursor-pointer"
                        style={{ 
                          accentColor: colors.primary,
                          borderColor: colors.borderLight,
                          backgroundColor: !formData.isOwned ? colors.primary : 'transparent',
                        }}
                      />
                      <span>Hired</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 border-2 rounded cursor-pointer"
                    style={{ 
                      accentColor: colors.primary,
                      borderColor: colors.borderLight,
                      backgroundColor: formData.isActive ? colors.primary : 'transparent',
                    }}
                  />
                  <span>Active Plant</span>
                </label>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex items-center space-x-2">
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: colors.primary }}></div>
          <p className="mt-4" style={{ color: colors.textSecondary }}>Loading plants...</p>
        </div>
      ) : (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  borderBottom: `1px solid ${colors.borderLight}`
                }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Description</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Code</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Plate Number</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Type</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Ownership</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Monthly Cost</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr 
                    key={plant.id} 
                    className="hover:opacity-80 transition-opacity"
                    style={{
                      borderBottom: `1px solid ${colors.borderLight}`,
                      opacity: plant.isActive ? 1 : 0.6
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span style={{ color: colors.textPrimary }}>{plant.plantDescription}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textSecondary }}>{plant.plantCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textSecondary }}>
                        {plant.plateNumber || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize" style={{ color: colors.textPrimary }}>
                        {plant.plantType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {plant.isOwned ? 'Owned' : 'Hired'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {formatCurrency(plant.monthlyCost, siteSettings?.currencySymbol || '$')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 text-xs rounded-full whitespace-nowrap inline-block"
                        style={{
                          backgroundColor: plant.isActive ? colors.success : colors.error,
                          color: '#FFFFFF'
                        }}
                      >
                        {plant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEdit(plant)}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(plant.id)}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          style={{ color: colors.error }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPlants.length === 0 && (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p style={{ color: colors.textSecondary }}>
                {searchTerm ? 'No plants found matching your search' : 'No plants found. Add your first plant to get started.'}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

