'use client';

import React, { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wrench,
  DollarSign,
  Users,
  X,
  Save,
  AlertCircle,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface ProjectLabourSupply {
  id: number;
  projectId: number;
  trade: string;
  numberOfLabour: number;
  pricePerHour: number | string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectLabourSupplyProps {
  projectId: number;
  projectName: string;
}

const MONTHLY_HOURS = 260; // Hours per month per labour

export default function ProjectLabourSupply({ projectId, projectName }: ProjectLabourSupplyProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [labourSupplies, setLabourSupplies] = useState<ProjectLabourSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<ProjectLabourSupply | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    trade: '',
    numberOfLabour: '',
    pricePerHour: '',
  });

  useEffect(() => {
    fetchLabourSupplies();
  }, [projectId]);

  const fetchLabourSupplies = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: ProjectLabourSupply[] }>(
        `/api/admin/project-labour-supplies?projectId=${projectId}`
      );
      if (response.success) {
        setLabourSupplies(response.data);
      }
    } catch (error) {
      console.error('Error fetching labour supplies:', error);
      setErrorMessage('Failed to load labour supplies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    const totalTrades = labourSupplies.length;
    
    const totalLabour = labourSupplies.reduce((sum, supply) => {
      const num = typeof supply.numberOfLabour === 'number' 
        ? supply.numberOfLabour 
        : parseInt(String(supply.numberOfLabour || 0));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

    const totalHourlyCost = labourSupplies.reduce((sum, supply) => {
      const numberOfLabour = typeof supply.numberOfLabour === 'number' 
        ? supply.numberOfLabour 
        : parseInt(String(supply.numberOfLabour || 0));
      const pricePerHour = typeof supply.pricePerHour === 'number'
        ? supply.pricePerHour
        : parseFloat(String(supply.pricePerHour || 0));
      
      if (isNaN(numberOfLabour) || isNaN(pricePerHour)) return sum;
      return sum + (numberOfLabour * pricePerHour);
    }, 0);

    // Monthly cost: Each labour works 260 hours per month
    const totalMonthlyCost = labourSupplies.reduce((sum, supply) => {
      const numberOfLabour = typeof supply.numberOfLabour === 'number' 
        ? supply.numberOfLabour 
        : parseInt(String(supply.numberOfLabour || 0));
      const pricePerHour = typeof supply.pricePerHour === 'number'
        ? supply.pricePerHour
        : parseFloat(String(supply.pricePerHour || 0));
      
      if (isNaN(numberOfLabour) || isNaN(pricePerHour)) return sum;
      // Monthly cost = numberOfLabour × pricePerHour × 260 hours
      return sum + (numberOfLabour * pricePerHour * MONTHLY_HOURS);
    }, 0);

    return {
      totalTrades,
      totalLabour,
      totalHourlyCost,
      totalMonthlyCost
    };
  };

  const stats = calculateStatistics();

  const resetForm = () => {
    setFormData({
      trade: '',
      numberOfLabour: '',
      pricePerHour: '',
    });
    setEditingSupply(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.trade.trim()) {
        setErrorMessage('Trade name is required');
        setIsSubmitting(false);
        return;
      }

      const numberOfLabour = parseInt(formData.numberOfLabour);
      if (isNaN(numberOfLabour) || numberOfLabour <= 0) {
        setErrorMessage('Number of labour must be a positive number');
        setIsSubmitting(false);
        return;
      }

      const pricePerHour = parseFloat(formData.pricePerHour);
      if (isNaN(pricePerHour) || pricePerHour <= 0) {
        setErrorMessage('Price per hour must be a positive number');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        projectId,
        trade: formData.trade.trim(),
        numberOfLabour,
        pricePerHour,
      };

      if (editingSupply) {
        // Update existing
        const response = await put<{ success: boolean; data: ProjectLabourSupply }>(
          `/api/admin/project-labour-supplies/${editingSupply.id}`,
          payload
        );

        if (response.success) {
          setLabourSupplies(labourSupplies.map(s => 
            s.id === editingSupply.id ? response.data : s
          ));
          setShowAddForm(false);
          resetForm();
        } else {
          setErrorMessage('Failed to update labour supply. Please try again.');
        }
      } else {
        // Create new
        const response = await post<{ success: boolean; data: ProjectLabourSupply }>(
          '/api/admin/project-labour-supplies',
          payload
        );

        if (response.success) {
          setLabourSupplies([response.data, ...labourSupplies]);
          setShowAddForm(false);
          resetForm();
        } else {
          setErrorMessage('Failed to create labour supply. This trade may already exist for this project.');
        }
      }
    } catch (error: any) {
      console.error('Error saving labour supply:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to save labour supply. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supply: ProjectLabourSupply) => {
    setEditingSupply(supply);
    setFormData({
      trade: supply.trade,
      numberOfLabour: supply.numberOfLabour.toString(),
      pricePerHour: typeof supply.pricePerHour === 'string' 
        ? supply.pricePerHour 
        : supply.pricePerHour.toString(),
    });
    setShowAddForm(true);
    setErrorMessage('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this labour supply?')) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await del<{ success: boolean }>(`/api/admin/project-labour-supplies/${id}`);

      if (response.success) {
        setLabourSupplies(labourSupplies.filter(s => s.id !== id));
      } else {
        setErrorMessage('Failed to delete labour supply. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting labour supply:', error);
      setErrorMessage('Failed to delete labour supply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
  };

  // Calculate values for a single supply
  const calculateHourlyCost = (supply: ProjectLabourSupply) => {
    const numberOfLabour = typeof supply.numberOfLabour === 'number' 
      ? supply.numberOfLabour 
      : parseInt(String(supply.numberOfLabour || 0));
    const pricePerHour = typeof supply.pricePerHour === 'number'
      ? supply.pricePerHour
      : parseFloat(String(supply.pricePerHour || 0));
    
    if (isNaN(numberOfLabour) || isNaN(pricePerHour)) return 0;
    return numberOfLabour * pricePerHour;
  };

  const calculateMonthlyCost = (supply: ProjectLabourSupply) => {
    return calculateHourlyCost(supply) * MONTHLY_HOURS;
  };

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
            Labour Supply
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage labour supply trades, quantities, and pricing for {projectName}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          variant="primary"
          disabled={showAddForm}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Labour Supply</span>
        </Button>
      </div>

      {errorMessage && (
        <Card className="p-4" style={{ backgroundColor: colors.error + '20', borderColor: colors.error }}>
          <div className="flex items-center space-x-2" style={{ color: colors.error }}>
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <Briefcase className="w-6 h-6" style={{ color: colors.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Total Trades
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.totalTrades}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" style={{ color: colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Total Labour
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.totalLabour}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Workers
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6" style={{ color: colors.info }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Total Hourly Cost
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {formatCurrency(stats.totalHourlyCost, siteSettings?.currencySymbol || '$')}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Per hour
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center text-lg font-bold" style={{ color: colors.warning }}>
              {siteSettings?.currencySymbol || '$'}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Total Monthly Cost
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {formatCurrency(stats.totalMonthlyCost, siteSettings?.currencySymbol || '$')}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                @ {MONTHLY_HOURS} hrs/month
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            {editingSupply ? 'Edit Labour Supply' : 'Add New Labour Supply'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Trade <span style={{ color: colors.error }}>*</span>
                </label>
                <Input
                  type="text"
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  placeholder="e.g., Carpenter, Electrician"
                  required
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Number of Labour <span style={{ color: colors.error }}>*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.numberOfLabour}
                  onChange={(e) => setFormData({ ...formData, numberOfLabour: e.target.value })}
                  placeholder="e.g., 5"
                  required
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Price Per Hour <span style={{ color: colors.error }}>*</span>
                </label>
                <div className="relative">
                  <span 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {siteSettings?.currencySymbol || '$'}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                    className="pl-8"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : editingSupply ? 'Update' : 'Add'} Labour Supply
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="ghost"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Labour Supplies Table */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex items-center space-x-3 mb-4">
          <Wrench className="w-5 h-5" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Labour Supply Trades
          </h3>
        </div>
        
        {labourSupplies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Trade</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Number of Labour</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Price Per Hour</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Hourly Cost</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Monthly Cost</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Created</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labourSupplies.map((supply) => {
                  const hourlyCost = calculateHourlyCost(supply);
                  const monthlyCost = calculateMonthlyCost(supply);
                  const pricePerHour = typeof supply.pricePerHour === 'number'
                    ? supply.pricePerHour
                    : parseFloat(String(supply.pricePerHour || 0));

                  return (
                    <tr key={supply.id} className="border-b" style={{ borderColor: colors.border }}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <span className="font-medium" style={{ color: colors.textPrimary }}>
                            {supply.trade}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.textPrimary }}>
                            {supply.numberOfLabour}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span style={{ color: colors.textPrimary }}>
                          {formatCurrency(pricePerHour, siteSettings?.currencySymbol || '$')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span style={{ color: colors.textPrimary }}>
                          {formatCurrency(hourlyCost, siteSettings?.currencySymbol || '$')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="font-semibold" style={{ color: colors.primary }}>
                            {formatCurrency(monthlyCost, siteSettings?.currencySymbol || '$')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          {new Date(supply.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEdit(supply)}
                            variant="secondary"
                            size="sm"
                            disabled={isSubmitting}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(supply.id)}
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting}
                            style={{ color: colors.error }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>
              No Labour Supplies
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Get started by adding labour supply trades for this project.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Labour Supply
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
