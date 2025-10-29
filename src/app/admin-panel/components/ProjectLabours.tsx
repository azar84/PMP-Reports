'use client';

import React, { useState, useEffect } from 'react';
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
  Wrench,
  HardHat,
  Search,
  X,
  Phone,
  AlertCircle,
  UserCheck,
  Users2,
  UserPlus,
  CheckCircle
} from 'lucide-react';

interface Labour {
  id: number;
  labourName: string;
  employeeNumber?: string;
  phone?: string;
  trade?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectLabourAssignment {
  id: number;
  projectId: number;
  tradeId: number;
  labourId: number | null;
  utilization: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  labour: Labour | null;
  trade?: ProjectTrade;
}

interface ProjectTrade {
  id: number;
  projectId: number;
  trade: string;
  requiredQuantity: number;
  createdAt: string;
  updatedAt: string;
  labourAssignments: ProjectLabourAssignment[];
}

interface Trade {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectLaboursProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

export default function ProjectLabours({ projectId, projectName, projectStartDate, projectEndDate }: ProjectLaboursProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [labours, setLabours] = useState<Labour[]>([]);
  const [projectTrades, setProjectTrades] = useState<ProjectTrade[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'existing' | 'new'>('existing');
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Trade modal state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [assigningToTrade, setAssigningToTrade] = useState<number | null>(null);
  const [editingLabourAssignment, setEditingLabourAssignment] = useState<ProjectLabourAssignment | null>(null);
  const [editingTrade, setEditingTrade] = useState<ProjectTrade | null>(null);
  const [editUseFullDuration, setEditUseFullDuration] = useState(false);
  
  const [newLabour, setNewLabour] = useState<Partial<Labour>>({
    labourName: '',
    employeeNumber: '',
    phone: '',
    trade: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProjectTrades();
    fetchLabours();
    fetchTrades();
  }, [projectId]);

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
      const response = await get<{ success: boolean; data: Labour[] }>('/api/admin/labours');
      if (response.success) {
        setLabours(response.data);
      }
    } catch (error) {
      console.error('Error fetching labours:', error);
    }
  };

  const fetchProjectTrades = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: ProjectTrade[] }>(`/api/admin/project-trades?projectId=${projectId}`);
      if (response.success) {
        setProjectTrades(response.data);
      }
    } catch (error) {
      console.error('Error fetching project trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLabourToTrade = async (tradeId: number, labourId: number) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: any }>('/api/admin/project-labours', {
        tradeId: tradeId,
        labourId: labourId,
        utilization: 1,
        startDate: projectStartDate || '',
        endDate: projectEndDate || '',
        status: 'Active',
        notes: null,
      });
      
      if (response.success) {
        await fetchProjectTrades();
        setErrorMessage('');
        setShowAddModal(false);
        setAssigningToTrade(null);
      } else {
        throw new Error('Failed to assign labour to trade');
      }
    } catch (error) {
      console.error('Error assigning labour:', error);
      setErrorMessage('Error assigning labour to trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTradeSelect = async (trade: Trade) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: any }>('/api/admin/project-trades', {
        projectId: projectId,
        trade: trade.name,
        requiredQuantity: 1,
      });

      if (response.success) {
        await fetchProjectTrades();
        setErrorMessage('');
        setShowTradeModal(false);
        setSelectedTrade(null);
      } else {
        throw new Error('Failed to add trade to project');
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      setErrorMessage('Error adding trade to project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLabourAssignment = async () => {
    if (!editingLabourAssignment) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-labours/${editingLabourAssignment.id}`, {
        startDate: editingLabourAssignment.startDate,
        endDate: editingLabourAssignment.endDate,
        status: editingLabourAssignment.status,
        notes: editingLabourAssignment.notes,
      });

      if (response.success) {
        await fetchProjectTrades();
        setEditingLabourAssignment(null);
        setEditUseFullDuration(false);
        setErrorMessage('');
      } else {
        throw new Error('Failed to update labour assignment');
      }
    } catch (error) {
      console.error('Error updating labour assignment:', error);
      setErrorMessage('Error updating labour assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTrade = async () => {
    if (!editingTrade) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-trades/${editingTrade.id}`, {
        requiredQuantity: editingTrade.requiredQuantity,
      });

      if (response.success) {
        await fetchProjectTrades();
        setEditingTrade(null);
        setErrorMessage('');
      } else {
        throw new Error('Failed to update trade');
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      setErrorMessage('Error updating trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignLabour = async (labourAssignmentId: number) => {
    if (confirm('Are you sure you want to unassign labour from this trade?')) {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const response = await del<{ success: boolean }>(`/api/admin/project-labours/${labourAssignmentId}`);
        
        if (response.success) {
          await fetchProjectTrades();
          setErrorMessage('');
        } else {
          throw new Error('Failed to unassign labour');
        }
      } catch (error) {
        console.error('Error unassigning labour:', error);
        setErrorMessage('Error unassigning labour. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteTrade = async (tradeId: number) => {
    if (confirm('Are you sure you want to delete this trade and all its labour assignments?')) {
      try {
        await del(`/api/admin/project-trades/${tradeId}`);
        await fetchProjectTrades();
      } catch (error) {
        console.error('Error deleting trade:', error);
      }
    }
  };

  const handleAddNewLabour = async () => {
    if (!newLabour.labourName?.trim()) {
      setErrorMessage('Labour name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: Labour }>('/api/admin/labours', newLabour);
      if (response.success) {
        await fetchLabours();
        setNewLabour({
          labourName: '',
          employeeNumber: '',
          phone: '',
          trade: '',
          isActive: true,
        });
        setShowAddModal(false);
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error('Error creating labour:', error);
      setErrorMessage(error.message || 'Failed to create labour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLabours = labours.filter(member =>
    member.labourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone && member.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.trade && member.trade.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(member => {
    if (tradeFilter && member.trade && !member.trade.toLowerCase().includes(tradeFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const calculateProjectStatistics = () => {
    const allAssignments = projectTrades.flatMap(trade => trade.labourAssignments || []);
    
    const requiredLabour = projectTrades.reduce((sum, trade) => {
      return sum + trade.requiredQuantity;
    }, 0);
    
    const assignedLabour = allAssignments.length;
    
    const involvedLabourIds = new Set(allAssignments.map(assignment => assignment.labourId));
    const involvedLabour = involvedLabourIds.size;
    
    const expectedMonthlyCost = projectTrades.reduce((sum, trade) => {
      const tradeData = trades.find(t => t.name === trade.trade);
      const tradeRate = tradeData?.monthlyRate || 5000;
      return sum + (tradeRate * trade.requiredQuantity);
    }, 0);
    
    const balanceLabour = requiredLabour - assignedLabour;

    return {
      requiredLabour,
      assignedLabour,
      balanceLabour,
      involvedLabour,
      expectedMonthlyCost: Math.round(expectedMonthlyCost)
    };
  };

  const stats = calculateProjectStatistics();

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
            Project Labours
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage labour assignments for {projectName}
          </p>
        </div>
        <Button
          onClick={() => setShowTradeModal(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </Button>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <Users2 className="w-6 h-6" style={{ color: colors.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Required Labour
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.requiredLabour}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6" style={{ color: colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Assigned Labour
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.assignedLabour}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" style={{ color: stats.balanceLabour >= 0 ? colors.error : colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Balance Labour
              </p>
              <p className="text-2xl font-bold" style={{ color: stats.balanceLabour >= 0 ? colors.error : colors.success }}>
                {stats.balanceLabour}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {stats.balanceLabour >= 0 ? 'Understaffed' : 'Overstaffed'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6" style={{ color: colors.info }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Involved Labour
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.involvedLabour}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Unique workers
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
                Monthly Cost
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.expectedMonthlyCost.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Expected cost
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Project Labours */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex items-center space-x-3 mb-4">
          <HardHat className="w-5 h-5" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Current Project Labours
          </h3>
        </div>
        
        {projectTrades.length > 0 ? (
          <div className="space-y-6">
            {projectTrades.map((trade) => {
              const assignedQuantity = trade.labourAssignments.length;
              const isQuantityMet = assignedQuantity >= trade.requiredQuantity;

              return (
                <div key={trade.id} className="border rounded-lg" style={{ borderColor: colors.border }}>
                  <div className="p-4 flex items-center justify-between" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <div className="flex items-center space-x-3">
                      <Wrench className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
                          {trade.trade}
                        </h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Required: {trade.requiredQuantity} | Assigned: {assignedQuantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${isQuantityMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {isQuantityMet ? 'Covered' : 'Understaffed'}
                      </span>
                      <Button
                        onClick={() => {
                          setAssigningToTrade(trade.id);
                          setShowAddModal(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Labour</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingTrade(trade);
                          setErrorMessage('');
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTrade(trade.id)}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {trade.labourAssignments && trade.labourAssignments.length > 0 && (
                    <div className="p-4 space-y-2">
                      {trade.labourAssignments.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          className="flex items-center justify-between py-2 px-3 rounded-lg"
                          style={{ backgroundColor: colors.backgroundSecondary }}
                        >
                          <div className="flex items-center space-x-3">
                            <HardHat className="w-4 h-4" style={{ color: colors.textMuted }} />
                            <div>
                              <p className="font-medium" style={{ color: colors.textPrimary }}>
                                {assignment.labour?.labourName || 'Unassigned'}
                              </p>
                              {assignment.labour?.employeeNumber && (
                                <p className="text-xs" style={{ color: colors.textMuted }}>
                                  #{assignment.labour.employeeNumber}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              {assignment.status === 'Active' ? (
                                <>
                                  <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                                  <span className="text-sm" style={{ color: colors.success }}>Active</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4" style={{ color: colors.error }} />
                                  <span className="text-sm" style={{ color: colors.error }}>Inactive</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => {
                                  setEditingLabourAssignment(assignment);
                                  setEditUseFullDuration(false);
                                  setErrorMessage('');
                                }}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleUnassignLabour(assignment.id)}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No trades assigned yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Add trades to this project to start managing labours
            </p>
            <Button
              onClick={() => setShowTradeModal(true)}
              variant="primary"
              className="flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Trade</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Select Trade
                </h2>
                <Button
                  onClick={() => {
                    setShowTradeModal(false);
                    setSelectedTrade(null);
                    setErrorMessage('');
                  }}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {trades.filter(t => t.isActive).map((trade) => (
                  <button
                    key={trade.id}
                    onClick={() => handleTradeSelect(trade)}
                    className="w-full p-4 text-left rounded-lg border transition-colors hover:border-current"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {trade.name}
                        </p>
                        {trade.description && (
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {trade.description}
                          </p>
                        )}
                        {trade.monthlyRate && (
                          <p className="text-sm font-medium" style={{ color: colors.primary }}>
                            {formatCurrency(trade.monthlyRate, siteSettings?.currencySymbol || '$')}/month
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Labour Modal */}
      {showAddModal && assigningToTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  {modalTab === 'new' ? 'Add New Labour' : 'Assign Labour'}
                </h2>
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    setModalTab('existing');
                    setAssigningToTrade(null);
                    setEditingLabour(null);
                    setNewLabour({
                      labourName: '',
                      employeeNumber: '',
                      phone: '',
                      trade: '',
                      isActive: true,
                    });
                    setErrorMessage('');
                  }}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 border-b" style={{ borderColor: colors.border }}>
                <button
                  onClick={() => setModalTab('existing')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    modalTab === 'existing' ? 'border-current' : 'border-transparent'
                  }`}
                  style={{ 
                    color: modalTab === 'existing' ? colors.primary : colors.textSecondary,
                    borderBottomColor: modalTab === 'existing' ? colors.primary : 'transparent'
                  }}
                >
                  Existing Labour
                </button>
                <button
                  onClick={() => setModalTab('new')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    modalTab === 'new' ? 'border-current' : 'border-transparent'
                  }`}
                  style={{ 
                    color: modalTab === 'new' ? colors.primary : colors.textSecondary,
                    borderBottomColor: modalTab === 'new' ? colors.primary : 'transparent'
                  }}
                >
                  New Labour
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                  {errorMessage}
                </div>
              )}

              {modalTab === 'existing' ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLabours.length === 0 ? (
                    <div className="text-center py-8">
                      <HardHat className="w-12 h-12 mx-auto mb-2" style={{ color: colors.textMuted }} />
                      <p style={{ color: colors.textSecondary }}>No labours found</p>
                    </div>
                  ) : (
                    filteredLabours.map((labour) => {
                      const isAlreadyAssigned = projectTrades.some(trade =>
                        trade.labourAssignments.some(assignment => assignment.labourId === labour.id)
                      );

                      return (
                        <button
                          key={labour.id}
                          onClick={() => handleAssignLabourToTrade(assigningToTrade, labour.id)}
                          disabled={isAlreadyAssigned || isSubmitting}
                          className={`w-full p-4 text-left rounded-lg border transition-colors ${
                            isAlreadyAssigned 
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:border-current'
                          }`}
                          style={{ borderColor: colors.border }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium" style={{ color: colors.textPrimary }}>
                                {labour.labourName}
                              </p>
                              {labour.employeeNumber && (
                                <p className="text-sm" style={{ color: colors.textSecondary }}>
                                  #{labour.employeeNumber}
                                </p>
                              )}
                              {labour.phone && (
                                <p className="text-sm flex items-center space-x-1" style={{ color: colors.textMuted }}>
                                  <Phone className="w-3 h-3" />
                                  <span>{labour.phone}</span>
                                </p>
                              )}
                              {labour.trade && (
                                <p className="text-sm" style={{ color: colors.textMuted }}>
                                  Trade: {labour.trade}
                                </p>
                              )}
                            </div>
                            {isAlreadyAssigned && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                Already Assigned
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Labour Name *"
                    value={newLabour.labourName || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, labourName: e.target.value })}
                    placeholder="e.g., John Smith"
                  />

                  <Input
                    type="text"
                    label="Employee Number"
                    value={newLabour.employeeNumber || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, employeeNumber: e.target.value })}
                    placeholder="e.g., EMP001"
                  />

                  <Input
                    type="tel"
                    label="Phone"
                    value={newLabour.phone || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, phone: e.target.value })}
                    placeholder="e.g., +1 234 567 8900"
                  />

                  <Input
                    type="text"
                    label="Trade"
                    value={newLabour.trade || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, trade: e.target.value })}
                    placeholder="e.g., Carpenter"
                  />

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddNewLabour}
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Labour'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Edit Utilization Modal */}
      {editingLabourAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-md"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Edit Labour Assignment
                </h2>
                <Button
                  onClick={() => setEditingLabourAssignment(null)}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Status
                  </label>
                  <select
                    value={editingLabourAssignment.status}
                    onChange={(e) => setEditingLabourAssignment({ ...editingLabourAssignment, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border, color: colors.textPrimary }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setEditingLabourAssignment(null)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateLabourAssignment}
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Trade Modal */}
      {editingTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-md"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Edit Trade Utilization
                </h2>
                <Button
                  onClick={() => setEditingTrade(null)}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Required Quantity
                  </label>
                  <Input
                    type="number"
                    value={editingTrade.requiredQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const clampedVal = Math.max(1, val);
                      setEditingTrade({ ...editingTrade, requiredQuantity: clampedVal });
                    }}
                    min="1"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setEditingTrade(null)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateTrade}
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

