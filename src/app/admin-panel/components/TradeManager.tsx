'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';
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
  Wrench,
  Users
} from 'lucide-react';

interface Trade {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TradeManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [formData, setFormData] = useState<Partial<Trade>>({
    name: '',
    description: '',
    monthlyRate: undefined,
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Trade[] }>('/api/admin/trades');
      if (response.success) {
        setTrades(response.data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMessage('Trade name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingTrade) {
        // Update existing trade
        const response = await put<{ success: boolean; data: Trade }>(`/api/admin/trades/${editingTrade.id}`, formData);
        if (response.success) {
          setTrades(trades.map(t => t.id === editingTrade.id ? response.data : t));
          setShowForm(false);
          setEditingTrade(null);
          setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      } else {
        // Create new trade
        const response = await post<{ success: boolean; data: Trade }>('/api/admin/trades', formData);
        if (response.success) {
          setTrades([response.data, ...trades]);
          setShowForm(false);
          setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      }
    } catch (error: any) {
      console.error('Error saving trade:', error);
      setErrorMessage(error.message || 'Failed to save trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormData({
      name: trade.name,
      description: trade.description || '',
      monthlyRate: trade.monthlyRate,
      isActive: trade.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (tradeId: number) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        const response = await del(`/api/admin/trades/${tradeId}`) as { success: boolean };
        if (response.success) {
          setTrades(trades.filter(t => t.id !== tradeId));
        }
      } catch (error) {
        console.error('Error deleting trade:', error);
      }
    }
  };

  const filteredTrades = trades.filter(trade =>
    trade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trade.description && trade.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (trade.monthlyRate && trade.monthlyRate.toString().includes(searchTerm))
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
            Trade Manager
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage labour trades pool
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingTrade(null);
            setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
            setErrorMessage('');
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search trades..."
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
              {editingTrade ? 'Edit Trade' : 'Add New Trade'}
            </h3>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingTrade(null);
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
                Trade Name *
              </label>
              <Input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Carpenter, Electrician, Plumber"
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
                placeholder="Brief description of the trade..."
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
                  setEditingTrade(null);
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
                <span>{isSubmitting ? 'Saving...' : editingTrade ? 'Update' : 'Create'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Trades List */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ 
                backgroundColor: colors.backgroundPrimary,
                borderBottom: `1px solid ${colors.borderLight}`
              }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Trade</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Monthly Rate</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Description</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr 
                  key={trade.id} 
                  style={{
                    borderBottom: `1px solid ${colors.borderLight}`
                  }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textPrimary }}>{trade.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: colors.textSecondary }}>
                      {trade.monthlyRate ? formatCurrency(trade.monthlyRate, siteSettings?.currencySymbol || '$') : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: colors.textSecondary }}>
                      {trade.description || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        trade.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trade.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleEdit(trade)}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(trade.id)}
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

        {filteredTrades.length === 0 && (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              {searchTerm ? 'No trades found' : 'No trades yet'}
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first trade to get started'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingTrade(null);
                  setFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                  setErrorMessage('');
                }}
                variant="primary"
                className="flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Trade</span>
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

