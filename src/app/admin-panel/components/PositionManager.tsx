'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Save,
  Briefcase,
  Users
} from 'lucide-react';

interface Position {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PositionManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<Partial<Position>>({
    name: '',
    description: '',
    monthlyRate: undefined,
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Position[] }>('/api/admin/positions');
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMessage('Position name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingPosition) {
        // Update existing position
        const response = await put<{ success: boolean; data: Position }>(`/api/admin/positions/${editingPosition.id}`, formData);
        if (response.success) {
          setPositions(positions.map(pos => pos.id === editingPosition.id ? response.data : pos));
          setShowForm(false);
          setEditingPosition(null);
          setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      } else {
        // Create new position
        const response = await post<{ success: boolean; data: Position }>('/api/admin/positions', formData);
        if (response.success) {
          setPositions([response.data, ...positions]);
          setShowForm(false);
          setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      }
    } catch (error: any) {
      console.error('Error saving position:', error);
      setErrorMessage(error.message || 'Failed to save position');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description || '',
      monthlyRate: position.monthlyRate,
      isActive: position.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (positionId: number) => {
    if (confirm('Are you sure you want to delete this position?')) {
      try {
        const response = await del(`/api/admin/positions/${positionId}`) as { success: boolean };
        if (response.success) {
          setPositions(positions.filter(pos => pos.id !== positionId));
        }
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const filteredPositions = positions.filter(position =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (position.description && position.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (position.monthlyRate && position.monthlyRate.toString().includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Position Manager
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage project positions pool
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingPosition(null);
            setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
            setErrorMessage('');
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search positions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{ backgroundColor: colors.backgroundPrimary }}
        />
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingPosition ? 'Edit Position' : 'Add New Position'}
            </h3>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingPosition(null);
                setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                setErrorMessage('');
              }}
              variant="ghost"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Position Name *
              </label>
              <Input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Director, Site Engineer"
                required
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Monthly Base Rate
              </label>
              <Input
                type="number"
                value={formData.monthlyRate || ''}
                onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                Optional monthly base rate for cost estimation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the position..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }}
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPosition(null);
                  setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                  setErrorMessage('');
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : editingPosition ? 'Update' : 'Create'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Positions List */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ 
                backgroundColor: colors.backgroundPrimary,
                borderBottom: `1px solid ${colors.borderLight}`
              }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Position</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Monthly Rate</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Description</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((position) => (
                <tr 
                  key={position.id} 
                  style={{
                    borderBottom: `1px solid ${colors.borderLight}`
                  }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textPrimary }}>{position.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: colors.textSecondary }}>
                      {position.monthlyRate ? `$${position.monthlyRate.toLocaleString()}` : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: colors.textSecondary }}>
                      {position.description || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        position.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {position.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleEdit(position)}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(position.id)}
                        variant="ghost"
                        size="sm"
                        className="p-1"
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

        {filteredPositions.length === 0 && (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              {searchTerm ? 'No positions found' : 'No positions yet'}
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first position to get started'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingPosition(null);
                  setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                  setErrorMessage('');
                }}
                variant="primary"
                className="flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
