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
  User, 
  Phone, 
  Wrench,
  Search,
  X,
  Save,
  Users,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';

interface Trade {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectLabourAssignment {
  id: number;
  status: string;
  project: {
    id: number;
    projectName: string;
    projectCode: string;
  };
  trade: {
    id: number;
    trade: string;
    requiredQuantity: number;
  };
}

interface Labour {
  id: number;
  labourName: string;
  employeeNumber?: string;
  phone?: string;
  trade?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isUtilized?: boolean;
  activeProjectCount?: number;
  projectLabours?: ProjectLabourAssignment[];
}

export default function LabourManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [labours, setLabours] = useState<Labour[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeSearchTerm, setTradeSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'utilized'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active'>('all');
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [viewingLabour, setViewingLabour] = useState<Labour | null>(null);
  const [formData, setFormData] = useState<Partial<Labour & { tradeId?: number }>>({
    labourName: '',
    employeeNumber: '',
    phone: '',
    trade: '',
    tradeId: undefined,
    isActive: true,
  });

  // Trade management state
  const [showTradesSection, setShowTradesSection] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [tradeFormData, setTradeFormData] = useState<Partial<Trade>>({
    name: '',
    description: '',
    monthlyRate: undefined,
    isActive: true,
  });
  const [tradeErrorMessage, setTradeErrorMessage] = useState<string>('');
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [tradeSearchTermForList, setTradeSearchTermForList] = useState('');

  useEffect(() => {
    fetchLabours();
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await get<{ success: boolean; data: Trade[] }>('/api/admin/trades');
      if (response.success) {
        setTrades(response.data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLabours = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Labour[] }>('/api/admin/labours');
      if (response.success) {
        setLabours(response.data);
      }
    } catch (error) {
      console.error('Error fetching labours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the trade name from the selected tradeId
      const selectedTrade = trades.find(t => t.id === formData.tradeId);
      
      const labourData = {
        ...formData,
        employeeNumber: formData.employeeNumber || undefined,
        phone: formData.phone || undefined,
        trade: selectedTrade?.name || formData.trade || undefined,
      };

      // Remove tradeId from the payload
      const { tradeId, ...payloadWithoutTradeId } = labourData;
      const finalPayload = payloadWithoutTradeId;

      if (editingLabour) {
        const response = await put<{ success: boolean; data: Labour }>(`/api/admin/labours/${editingLabour.id}`, finalPayload);
        if (response.success) {
          setLabours(labours.map(l => l.id === editingLabour.id ? response.data : l));
        }
      } else {
        const response = await post<{ success: boolean; data: Labour }>('/api/admin/labours', finalPayload);
        if (response.success) {
          setLabours([response.data, ...labours]);
        }
      }

      setShowForm(false);
      setEditingLabour(null);
      setShowTradeDropdown(false);
      setTradeSearchTerm('');
      setFormData({
        labourName: '',
        employeeNumber: '',
        phone: '',
        trade: '',
        tradeId: undefined,
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving labour:', error);
    }
  };

  const handleEdit = (labour: Labour) => {
    setEditingLabour(labour);
    // Find the tradeId from the trades based on the trade name
    const matchingTrade = trades.find(t => t.name === labour.trade);
    setFormData({
      labourName: labour.labourName,
      tradeId: matchingTrade?.id,
      employeeNumber: labour.employeeNumber || '',
      phone: labour.phone || '',
      trade: labour.trade || '',
      isActive: labour.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this labour?')) {
      try {
        const response = await del(`/api/admin/labours/${id}`) as { success: boolean };
        if (response.success) {
          setLabours(labours.filter(l => l.id !== id));
        }
      } catch (error) {
        console.error('Error deleting labour:', error);
      }
    }
  };

  // Trade management functions
  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeFormData.name?.trim()) {
      setTradeErrorMessage('Trade name is required');
      return;
    }

    setIsSubmittingTrade(true);
    setTradeErrorMessage('');

    try {
      if (editingTrade) {
        const response = await put<{ success: boolean; data: Trade }>(`/api/admin/trades/${editingTrade.id}`, tradeFormData);
        if (response.success) {
          setTrades(trades.map(t => t.id === editingTrade.id ? response.data : t));
          setShowTradeForm(false);
          setEditingTrade(null);
          setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
          // Refresh labours to update trade references
          fetchLabours();
        }
      } else {
        const response = await post<{ success: boolean; data: Trade }>('/api/admin/trades', tradeFormData);
        if (response.success) {
          setTrades([response.data, ...trades]);
          setShowTradeForm(false);
          setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      }
    } catch (error: any) {
      console.error('Error saving trade:', error);
      setTradeErrorMessage(error.message || 'Failed to save trade');
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  const handleTradeEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setTradeFormData({
      name: trade.name,
      description: trade.description || '',
      monthlyRate: trade.monthlyRate,
      isActive: trade.isActive,
    });
    setShowTradeForm(true);
  };

  const handleTradeDelete = async (tradeId: number) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        const response = await del(`/api/admin/trades/${tradeId}`) as { success: boolean };
        if (response.success) {
          setTrades(trades.filter(t => t.id !== tradeId));
          // Refresh labours to update trade references
          fetchLabours();
        }
      } catch (error) {
        console.error('Error deleting trade:', error);
      }
    }
  };

  const filteredTrades = trades.filter(trade =>
    trade.name.toLowerCase().includes(tradeSearchTermForList.toLowerCase()) ||
    (trade.description && trade.description.toLowerCase().includes(tradeSearchTermForList.toLowerCase())) ||
    (trade.monthlyRate && trade.monthlyRate.toString().includes(tradeSearchTermForList))
  );

  const filteredLabours = labours.filter(labour => {
    // Apply search filter
    const matchesSearch = labour.labourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labour.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labour.trade?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply availability filter
    let matchesAvailability = true;
    if (availabilityFilter === 'available') {
      matchesAvailability = !labour.isUtilized || labour.isUtilized === false;
    } else if (availabilityFilter === 'utilized') {
      matchesAvailability = labour.isUtilized === true;
    }

    // Apply active filter
    let matchesActive = true;
    if (activeFilter === 'active') {
      matchesActive = labour.isActive === true;
    }

    return matchesSearch && matchesAvailability && matchesActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Labour Management
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage labour workers and their trades
          </p>
        </div>
        <div className="flex items-center space-x-3">
        <Button
            onClick={() => setShowTradesSection(!showTradesSection)}
            className="flex items-center space-x-2"
            variant="ghost"
            style={{ color: colors.textPrimary, border: `1px solid ${colors.border}` }}
          >
            <Wrench className="w-4 h-4" />
            <span>{showTradesSection ? 'Hide Trades' : 'Manage Trades'}</span>
          </Button>
        <Button
          onClick={() => {
            setFormData({
              labourName: '',
              employeeNumber: '',
              phone: '',
              trade: '',
              tradeId: undefined,
              isActive: true,
            });
            setEditingLabour(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Labour</span>
        </Button>
        </div>
      </div>

      {/* Trades Section - Display at top when enabled */}
      {showTradesSection && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Trades Management
              </h2>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Manage labour trades and their base rates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setShowTradeForm(true);
                  setEditingTrade(null);
                  setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                  setTradeErrorMessage('');
                }}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Trade</span>
              </Button>
              <Button
                onClick={() => setShowTradesSection(false)}
                variant="ghost"
                className="p-2"
                title="Close Trades Section"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Trade Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
            <Input
              type="text"
              placeholder="Search trades..."
              value={tradeSearchTermForList}
              onChange={(e) => setTradeSearchTermForList(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
          </div>

          {/* Trade Form */}
          {showTradeForm && (
            <Card className="p-6 mb-6" style={{ backgroundColor: colors.backgroundPrimary }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  {editingTrade ? 'Edit Trade' : 'Add New Trade'}
                </h3>
                <Button
                  onClick={() => {
                    setShowTradeForm(false);
                    setEditingTrade(null);
                    setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                    setTradeErrorMessage('');
                  }}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Trade Name *
                  </label>
                  <Input
                    type="text"
                    value={tradeFormData.name || ''}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, name: e.target.value })}
                    placeholder="e.g., Carpenter, Electrician, Plumber"
                    required
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Monthly Base Rate
                  </label>
                  <Input
                    type="number"
                    value={tradeFormData.monthlyRate || ''}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    style={{ backgroundColor: colors.backgroundSecondary }}
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
                    value={tradeFormData.description || ''}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, description: e.target.value })}
                    placeholder="Brief description of the trade..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ 
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                </div>

                {tradeErrorMessage && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                    {tradeErrorMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowTradeForm(false);
                      setEditingTrade(null);
                      setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                      setTradeErrorMessage('');
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingTrade}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmittingTrade ? 'Saving...' : editingTrade ? 'Update' : 'Create'}</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Trades List */}
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
                          onClick={() => handleTradeEdit(trade)}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleTradeDelete(trade.id)}
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
                {tradeSearchTermForList ? 'No trades found' : 'No trades yet'}
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                {tradeSearchTermForList ? 'Try adjusting your search terms' : 'Add your first trade to get started'}
              </p>
              {!tradeSearchTermForList && (
                <Button
                  onClick={() => {
                    setShowTradeForm(true);
                    setEditingTrade(null);
                    setTradeFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                    setTradeErrorMessage('');
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
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search labours by name, employee number, or trade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary
          }}
        />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active')}
            className="px-4 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'utilized')}
            className="px-4 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              color: colors.textPrimary
            }}
          >
            <option value="all">All Labours</option>
            <option value="available">Available Only</option>
            <option value="utilized">Utilized Only</option>
          </select>
        </div>
      </div>

      {/* Labour Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingLabour ? 'Edit Labour' : 'Add New Labour'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingLabour(null);
                setShowTradeDropdown(false);
                setTradeSearchTerm('');
                setFormData({
                  labourName: '',
                  employeeNumber: '',
                  phone: '',
                  trade: '',
                  tradeId: undefined,
                  isActive: true,
                });
              }}
              variant="ghost"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Labour Name *
                </label>
                <Input
                  type="text"
                  value={formData.labourName}
                  onChange={(e) => setFormData({ ...formData, labourName: e.target.value })}
                  required
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Employee Number
                </label>
                <Input
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  placeholder="e.g., LAB001, 12345"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Trade
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowTradeDropdown(!showTradeDropdown)}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: 'rgba(229, 231, 235, 0.1)',
                      color: colors.textPrimary
                    }}
                  >
                    <span>
                      {formData.tradeId 
                        ? trades.find(t => t.id === formData.tradeId)?.name 
                        : 'Select a trade...'}
                    </span>
                    <span>{showTradeDropdown ? '▲' : '▼'}</span>
                  </div>
                  
                  {showTradeDropdown && (
                    <div 
                      className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto"
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border
                      }}
                    >
                      <div className="p-2 sticky top-0" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <input
                          type="text"
                          placeholder="Search trades..."
                          value={tradeSearchTerm}
                          onChange={(e) => setTradeSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.border,
                            color: colors.textPrimary
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-auto">
                        {trades
                          .filter(t => t.isActive)
                          .filter(t => t.name.toLowerCase().includes(tradeSearchTerm.toLowerCase()))
                          .map((trade) => (
                            <div
                              key={trade.id}
                              onClick={() => {
                                setFormData({ ...formData, tradeId: trade.id });
                                setShowTradeDropdown(false);
                                setTradeSearchTerm('');
                              }}
                              className="px-3 py-2 hover:opacity-75 cursor-pointer"
                              style={{
                                backgroundColor: formData.tradeId === trade.id ? colors.primary : 'transparent',
                                color: formData.tradeId === trade.id ? '#FFFFFF' : colors.textPrimary
                              }}
                            >
                              {trade.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only"
                  />
                  <div 
                    className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                    style={{
                      borderColor: (formData.isActive ?? true) ? colors.primary : colors.borderLight,
                      backgroundColor: (formData.isActive ?? true) ? colors.primary : 'transparent',
                    }}
                  >
                    {(formData.isActive ?? true) && (
                      <svg 
                        className="w-3 h-3" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#FFFFFF' }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm cursor-pointer" style={{ color: colors.textPrimary }}>
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLabour(null);
                  setShowTradeDropdown(false);
                  setTradeSearchTerm('');
                  setFormData({
                    labourName: '',
                    employeeNumber: '',
                    phone: '',
                    trade: '',
                    tradeId: undefined,
                    isActive: true,
                  });
                }}
                variant="ghost"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
              >
                <Save className="w-4 h-4" />
                <span>{editingLabour ? 'Update' : 'Create'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Labours List */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ 
                backgroundColor: colors.backgroundPrimary,
                borderBottom: `1px solid ${colors.borderLight}`
              }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Name</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Employee ID</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Trade</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Phone</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Utilization</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Projects</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
        {filteredLabours.map((labour) => (
                <tr 
            key={labour.id} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderBottom: `1px solid ${colors.borderLight}`
                  }}
            onClick={() => setViewingLabour(labour)}
          >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textPrimary }}>{labour.labourName}</span>
                </div>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ color: colors.textSecondary }}>
                      {labour.employeeNumber || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {labour.trade ? (
                      <div className="flex items-center space-x-2">
                        <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span style={{ color: colors.textPrimary }}>{labour.trade}</span>
                      </div>
                    ) : (
                      <span style={{ color: colors.textMuted }}>-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {labour.phone ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span style={{ color: colors.textSecondary }}>{labour.phone}</span>
                </div>
                    ) : (
                      <span style={{ color: colors.textMuted }}>-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
              <div className="flex items-center space-x-2">
                      {labour.isUtilized ? (
                        <>
                  <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                          <span style={{ color: colors.success }}>Utilized</span>
                          {labour.activeProjectCount && labour.activeProjectCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                              {labour.activeProjectCount}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.textMuted }}>Available</span>
                        </>
                )}
              </div>
                  </td>
                  <td className="py-3 px-4">
                    {labour.projectLabours && labour.projectLabours.length > 0 ? (
                      <div className="space-y-1">
                        {labour.projectLabours.slice(0, 2).map((assignment) => (
                          <div key={assignment.id} className="text-sm">
                            <span style={{ color: colors.textPrimary }}>{assignment.project.projectName}</span>
                            {assignment.status === 'Active' && (
                              <span className="ml-1 text-xs" style={{ color: colors.success }}>• Active</span>
                            )}
            </div>
                        ))}
                        {labour.projectLabours.length > 2 && (
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            +{labour.projectLabours.length - 2} more
                          </span>
                        )}
                </div>
                    ) : (
                      <span style={{ color: colors.textMuted }}>-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {labour.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                          <span style={{ color: colors.success }}>Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" style={{ color: colors.error }} />
                          <span style={{ color: colors.error }}>Inactive</span>
                        </>
              )}
            </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <Button
                        onClick={() => handleEdit(labour)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                        onClick={() => handleDelete(labour.id)}
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

      {filteredLabours.length === 0 && (
          <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            {searchTerm ? 'No labours found' : 'No labours yet'}
          </h3>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first labour worker'}
          </p>
          <Button
            onClick={() => {
              setFormData({
                labourName: '',
                employeeNumber: '',
                phone: '',
                trade: '',
                tradeId: undefined,
                isActive: true,
              });
              setEditingLabour(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 mx-auto"
            style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Labour</span>
          </Button>
          </div>
      )}
        </Card>

      {/* View Labour Modal */}
      {viewingLabour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Labour Details
              </h2>
              <Button
                onClick={() => setViewingLabour(null)}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Labour Name</label>
                  <p className="text-lg font-semibold mt-1" style={{ color: colors.textPrimary }}>{viewingLabour.labourName}</p>
                </div>

                {viewingLabour.employeeNumber && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Employee Number</label>
                    <p className="mt-1" style={{ color: colors.textPrimary }}>{viewingLabour.employeeNumber}</p>
                  </div>
                )}

                {viewingLabour.trade && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Trade</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Wrench className="w-4 h-4" style={{ color: colors.primary }} />
                      <p style={{ color: colors.textPrimary }}>{viewingLabour.trade}</p>
                    </div>
                  </div>
                )}

                {viewingLabour.phone && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Phone</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <p style={{ color: colors.textPrimary }}>{viewingLabour.phone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Utilization Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {viewingLabour.isUtilized ? (
                      <>
                        <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                        <span style={{ color: colors.success }}>Utilized</span>
                        {viewingLabour.activeProjectCount && viewingLabour.activeProjectCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                            {viewingLabour.activeProjectCount} active project{viewingLabour.activeProjectCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span style={{ color: colors.textMuted }}>Available - Not assigned to any projects</span>
                      </>
                    )}
                  </div>
                </div>

                {viewingLabour.projectLabours && viewingLabour.projectLabours.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-3 block" style={{ color: colors.textMuted }}>Project Assignments</label>
                    <div className="space-y-3">
                      {viewingLabour.projectLabours.map((assignment) => (
                        <Card 
                          key={assignment.id}
                          className="p-4"
                          style={{ backgroundColor: colors.backgroundPrimary }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
                                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                                  {assignment.project.projectName}
                                </p>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.backgroundSecondary, color: colors.textSecondary }}>
                                  {assignment.project.projectCode}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Wrench className="w-3 h-3" style={{ color: colors.textMuted }} />
                                <span style={{ color: colors.textSecondary }}>Trade: {assignment.trade.trade}</span>
                              </div>
                              <div className="mt-2">
                                <span 
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    assignment.status === 'Active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : assignment.status === 'Inactive'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {assignment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium" style={{ color: colors.textMuted }}>Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {viewingLabour.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                        <span style={{ color: colors.success }}>Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" style={{ color: colors.error }} />
                        <span style={{ color: colors.error }}>Inactive</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t" style={{ borderColor: colors.border }}>
                <Button
                  onClick={() => {
                    handleEdit(viewingLabour);
                    setViewingLabour(null);
                  }}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={() => setViewingLabour(null)}
                  variant="ghost"
                  style={{ color: colors.textSecondary }}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

