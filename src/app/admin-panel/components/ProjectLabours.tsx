'use client';

import React, { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';
import { formatDateForInput, formatDateForDisplay } from '@/lib/dateUtils';
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
  CheckCircle,
  User,
  UserX,
  Briefcase
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
  vacationStartDate?: string | null;
  vacationEndDate?: string | null;
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
  const [dateValidationError, setDateValidationError] = useState<string>('');
  
  // Trade modal state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [assigningToTrade, setAssigningToTrade] = useState<number | null>(null);
  const [editingLabourAssignment, setEditingLabourAssignment] = useState<ProjectLabourAssignment | null>(null);
  const [editingTrade, setEditingTrade] = useState<ProjectTrade | null>(null);
  const [editUseFullDuration, setEditUseFullDuration] = useState(false);
  const [editUseProjectStartDate, setEditUseProjectStartDate] = useState(false);
  const [editUseProjectEndDate, setEditUseProjectEndDate] = useState(false);
  const [editDateValidationError, setEditDateValidationError] = useState<string>('');
  
  // Assignment date selection state
  const [selectedLabourForAssignment, setSelectedLabourForAssignment] = useState<{ labourId: number; tradeId: number } | null>(null);
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
  const [assignmentEndDate, setAssignmentEndDate] = useState('');
  const [useProjectStartDate, setUseProjectStartDate] = useState(true);
  const [useProjectEndDate, setUseProjectEndDate] = useState(true);
  const [assignmentUtilization, setAssignmentUtilization] = useState<number>(100);
  
  // Trade dropdown state for new labour form
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);
  const [tradeSearchTerm, setTradeSearchTerm] = useState('');
  
  const [newLabour, setNewLabour] = useState<Partial<Labour & { tradeId?: number }>>({
    labourName: '',
    employeeNumber: '',
    phone: '',
    trade: '',
    tradeId: undefined,
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

  const handleLabourSelectForAssignment = (tradeId: number, labourId: number) => {
    setSelectedLabourForAssignment({ labourId, tradeId });
    setUseProjectStartDate(true);
    setUseProjectEndDate(true);
    setAssignmentUtilization(100);
    // Initialize with formatted project dates
    const formattedStart = formatDateForInput(projectStartDate) || '';
    const formattedEnd = formatDateForInput(projectEndDate) || '';
    setAssignmentStartDate(formattedStart);
    setAssignmentEndDate(formattedEnd);
    setDateValidationError('');
  };

  // Helper function to check if labour is currently on leave
  const isOnLeave = (labour: Labour): boolean => {
    if (!labour.vacationStartDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(labour.vacationStartDate);
    startDate.setHours(0, 0, 0, 0);
    // Remains on leave until cleared (dates removed)
    return today >= startDate;
  };

  // Helper function to validate dates
  const validateDates = (startDateStr: string, endDateStr: string, isEditForm: boolean = false): string => {
    if (!startDateStr || !endDateStr) return ''; // Don't validate if dates are empty
    
    const startDate = startDateStr.split('T')[0];
    const endDate = endDateStr.split('T')[0];
    
    if (startDate > endDate) {
      return 'End date must be equal to or greater than start date.';
    }
    return '';
  };

  const handleAssignLabourToTrade = async () => {
    if (!selectedLabourForAssignment) return;
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Determine the start date to use (format to YYYY-MM-DD)
      let startDate = '';
      if (useProjectStartDate) {
        startDate = formatDateForInput(projectStartDate) || '';
      } else {
        startDate = assignmentStartDate || formatDateForInput(projectStartDate) || '';
      }
      
      // Determine the end date to use (format to YYYY-MM-DD)
      let endDate = '';
      if (useProjectEndDate) {
        endDate = formatDateForInput(projectEndDate) || '';
      } else {
        endDate = assignmentEndDate || formatDateForInput(projectEndDate) || '';
      }
      
      // Validate that end date is greater than or equal to start date
      if (startDate && endDate && startDate > endDate) {
        setErrorMessage('End date must be equal to or greater than start date.');
        setIsSubmitting(false);
        return;
      }

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-labours', {
        tradeId: selectedLabourForAssignment.tradeId,
        labourId: selectedLabourForAssignment.labourId,
        utilization: Math.max(0, Math.min(100, Math.round(assignmentUtilization))),
        startDate: startDate,
        endDate: endDate,
        status: 'Active',
        notes: null,
      });
      
      if (response.success) {
        await fetchProjectTrades();
        setErrorMessage('');
        setShowAddModal(false);
        setAssigningToTrade(null);
        setSelectedLabourForAssignment(null);
        setAssignmentStartDate('');
        setAssignmentEndDate('');
        setUseProjectStartDate(true);
        setUseProjectEndDate(true);
        setDateValidationError('');
        setAssignmentUtilization(100);
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
      // Determine the actual dates to send based on checkbox states
      // If already in YYYY-MM-DD format, use directly; otherwise format
      let startDate = '';
      if (editUseProjectStartDate) {
        startDate = formatDateForInput(projectStartDate) || '';
      } else {
        const startValue = editingLabourAssignment.startDate;
        if (typeof startValue === 'string' && startValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          startDate = startValue.split('T')[0].split(' ')[0];
        } else {
          startDate = formatDateForInput(startValue) || '';
        }
      }
      
      let endDate = '';
      if (editUseProjectEndDate) {
        endDate = formatDateForInput(projectEndDate) || '';
      } else {
        const endValue = editingLabourAssignment.endDate;
        if (typeof endValue === 'string' && endValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          endDate = endValue.split('T')[0].split(' ')[0];
        } else {
          endDate = formatDateForInput(endValue) || '';
        }
      }
      
      // Validate that end date is greater than or equal to start date
      if (startDate && endDate && startDate > endDate) {
        setErrorMessage('End date must be equal to or greater than start date.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-labours/${editingLabourAssignment.id}`, {
        utilization: Math.max(0, Math.min(100, Math.round(editingLabourAssignment.utilization))),
        startDate: startDate,
        endDate: endDate,
        status: editingLabourAssignment.status,
        notes: editingLabourAssignment.notes,
      });

      if (response.success) {
        await fetchProjectTrades();
        setEditingLabourAssignment(null);
        setEditUseFullDuration(false);
        setEditUseProjectStartDate(false);
        setEditUseProjectEndDate(false);
        setEditDateValidationError('');
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
      // Get the trade name from the selected tradeId
      const selectedTrade = trades.find(t => t.id === newLabour.tradeId);
      
      const labourData = {
        ...newLabour,
        employeeNumber: newLabour.employeeNumber || undefined,
        phone: newLabour.phone || undefined,
        trade: selectedTrade?.name || newLabour.trade || undefined,
      };

      // Remove tradeId from the payload
      const { tradeId, ...payloadWithoutTradeId } = labourData;
      const finalPayload = payloadWithoutTradeId;

      const response = await post<{ success: boolean; data: Labour }>('/api/admin/labours', finalPayload);
      if (response.success) {
        await fetchLabours();
        setNewLabour({
          labourName: '',
          employeeNumber: '',
          phone: '',
          trade: '',
          tradeId: undefined,
          isActive: true,
        });
        setShowTradeDropdown(false);
        setTradeSearchTerm('');
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

  const filteredLabours = labours
    .filter(member => member.isActive === true) // Only show active labours
    .filter(member =>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Trade</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Assigned Labour</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Utilization</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Trade Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Duration</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Start Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>End Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectTrades.map((trade) => {
                  const assignedQuantity = trade.labourAssignments.length;
                  const isQuantityMet = assignedQuantity >= trade.requiredQuantity;
                  const remainingNeeded = Math.max(0, trade.requiredQuantity - assignedQuantity);

                  return (
                    <React.Fragment key={trade.id}>
                      {/* Trade Header Row */}
                      <tr className="border-b" style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}>
                        <td className="py-3 px-4" colSpan={9}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span className="font-medium" style={{ color: colors.textPrimary }}>
                                {trade.trade}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={`text-sm font-medium ${
                                    isQuantityMet ? 'text-green-600' : 'text-orange-600'
                                  }`}
                                >
                                  {isQuantityMet 
                                    ? `Complete (${assignedQuantity}/${trade.requiredQuantity})` 
                                    : `${remainingNeeded} needed`
                                  }
                                </span>
                                {!isQuantityMet && (
                                  <Button
                                    onClick={() => {
                                      setAssigningToTrade(trade.id);
                                      setShowAddModal(true);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1"
                                    title={`Add labour to ${trade.trade}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => {
                                    setEditingTrade(trade);
                                    setErrorMessage('');
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                  title={`Edit ${trade.trade} requirements`}
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
                          </div>
                        </td>
                      </tr>
                      
                      {/* Labour Assignment Rows */}
                      {trade.labourAssignments.length > 0 ? (
                        trade.labourAssignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b" style={{ borderColor: colors.border }}>
                            <td className="py-3 px-4 pl-8">
                              <span style={{ color: colors.textSecondary }}>Labour Assignment</span>
                            </td>
                            <td className="py-3 px-4">
                              {assignment.labour ? (
                                <div className="flex items-center space-x-2">
                                  <HardHat className="w-4 h-4" style={{ color: colors.textMuted }} />
                                  <div>
                                    <p className="font-medium" style={{ color: colors.textPrimary }}>{assignment.labour.labourName}</p>
                                    {assignment.labour.employeeNumber && (
                                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                                        #{assignment.labour.employeeNumber}
                                      </p>
                                    )}
                                    {assignment.labour.phone && (
                                      <div className="flex items-center space-x-1 text-xs" style={{ color: colors.textSecondary }}>
                                        <Phone className="w-3 h-3" />
                                        <span>{assignment.labour.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <UserX className="w-4 h-4" style={{ color: colors.textMuted }} />
                                  <span style={{ color: colors.textSecondary }}>Unassigned</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>{assignment.utilization || 1}%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textSecondary }}>-</span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>
                                {assignment.startDate && assignment.endDate 
                                  ? (() => {
                                      try {
                                        const start = new Date(assignment.startDate);
                                        const end = new Date(assignment.endDate);
                                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
                                        const diffTime = Math.abs(end.getTime() - start.getTime());
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                                      } catch (error) {
                                        return '-';
                                      }
                                    })()
                                  : '-'
                                }
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>
                                {assignment.startDate ? formatDateForDisplay(assignment.startDate) : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>
                                {assignment.endDate ? formatDateForDisplay(assignment.endDate) : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {assignment.labour ? (
                                (() => {
                                  const onLeave = isOnLeave(assignment.labour);
                                  const activeStatus = assignment.labour.isActive && !onLeave;
                                  const statusText = onLeave ? 'On Leave' : (activeStatus ? 'Active' : 'Inactive');
                                  const statusColor = onLeave ? 'bg-yellow-100 text-yellow-800' : 
                                                    (activeStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800');
                                  return (
                                    <span 
                                      className={`px-2 py-1 text-xs rounded-full ${statusColor}`}
                                    >
                                      {statusText}
                                    </span>
                                  );
                                })()
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {assignment.labour ? (
                                  <>
                                    <Button
                                      onClick={() => {
                                        try {
                                          setEditingLabourAssignment(assignment);
                                          setEditUseFullDuration(false);
                                          setErrorMessage('');
                                          // Normalize dates to YYYY-MM-DD strings to avoid timezone issues
                                          const normalizedStartDate = formatDateForInput(assignment.startDate);
                                          const normalizedEndDate = formatDateForInput(assignment.endDate);
                                          // Initialize checkbox states based on current assignment dates
                                          const projectStart = formatDateForInput(projectStartDate);
                                          const projectEnd = formatDateForInput(projectEndDate);
                                          setEditUseProjectStartDate(normalizedStartDate === projectStart && normalizedStartDate !== '');
                                          setEditUseProjectEndDate(normalizedEndDate === projectEnd && normalizedEndDate !== '');
                                          // Validate dates when opening edit form
                                          const validationError = validateDates(normalizedStartDate, normalizedEndDate, true);
                                          setEditDateValidationError(validationError);
                                        } catch (error) {
                                          console.error('Error setting editing labour assignment:', error);
                                        }
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
                                      <UserX className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setAssigningToTrade(trade.id);
                                      setShowAddModal(true);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b" style={{ borderColor: colors.border }}>
                          <td className="py-3 px-4 pl-8 text-center" colSpan={9}>
                            <div className="flex items-center justify-center space-x-2 py-2">
                              <UserX className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span style={{ color: colors.textSecondary }}>No labour assigned</span>
                              <Button
                                onClick={() => {
                                  setAssigningToTrade(trade.id);
                                  setShowAddModal(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
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
                      tradeId: undefined,
                      isActive: true,
                    });
                    setShowTradeDropdown(false);
                    setTradeSearchTerm('');
                    setErrorMessage('');
                    setSelectedLabourForAssignment(null);
                    setAssignmentStartDate('');
                    setAssignmentEndDate('');
                    setUseProjectStartDate(true);
                    setUseProjectEndDate(true);
                    setDateValidationError('');
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

              {!selectedLabourForAssignment ? (
                <>
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
                              onClick={() => handleLabourSelectForAssignment(assigningToTrade!, labour.id)}
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
                          borderColor: colors.border,
                          color: colors.textPrimary
                        }}
                      >
                        <span>
                          {newLabour.tradeId 
                            ? trades.find(t => t.id === newLabour.tradeId)?.name 
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
                                    setNewLabour({ ...newLabour, tradeId: trade.id });
                                    setShowTradeDropdown(false);
                                    setTradeSearchTerm('');
                                  }}
                                  className="px-3 py-2 hover:opacity-75 cursor-pointer"
                                  style={{
                                    backgroundColor: newLabour.tradeId === trade.id ? colors.primary : 'transparent',
                                    color: newLabour.tradeId === trade.id ? '#FFFFFF' : colors.textPrimary
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
                </>
              ) : (
                <>
                  {/* Start Date Selection Form */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <HardHat className="w-5 h-5" style={{ color: colors.primary }} />
                        <div>
                          <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                            {labours.find(l => l.id === selectedLabourForAssignment?.labourId)?.labourName}
                          </h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            Trade: {projectTrades.find(t => t.id === selectedLabourForAssignment?.tradeId)?.trade}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Utilization */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Utilization (%)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={assignmentUtilization}
                          onChange={(e) => setAssignmentUtilization(parseInt(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={assignmentUtilization}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val)) return setAssignmentUtilization(0);
                            setAssignmentUtilization(Math.max(0, Math.min(100, val)));
                          }}
                          min={0}
                          max={100}
                          className="w-24"
                        />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Start Date
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="useProjectStartDateLabour"
                              checked={useProjectStartDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUseProjectStartDate(checked);
                                if (checked) {
                                  const newStartDate = formatDateForInput(projectStartDate) || '';
                                  setAssignmentStartDate(newStartDate);
                                  // Validate dates when checkbox changes
                                  const currentEndDate = useProjectEndDate 
                                    ? (formatDateForInput(projectEndDate) || '') 
                                    : (assignmentEndDate || '');
                                  const validationError = validateDates(newStartDate, currentEndDate);
                                  setDateValidationError(validationError);
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="useProjectStartDateLabour"
                              className="w-4 h-4 rounded cursor-pointer flex items-center justify-center border-2 transition-colors"
                              style={{
                                backgroundColor: useProjectStartDate ? colors.primary : 'transparent',
                                borderColor: useProjectStartDate ? colors.primary : colors.border
                              }}
                            >
                              {useProjectStartDate && (
                                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                          </div>
                          <div 
                            className="text-sm cursor-pointer flex-1" 
                            style={{ color: colors.textPrimary }}
                            onClick={() => {
                              const newValue = !useProjectStartDate;
                              setUseProjectStartDate(newValue);
                              if (newValue) {
                                const newStartDate = formatDateForInput(projectStartDate) || '';
                                setAssignmentStartDate(newStartDate);
                                // Validate dates when checkbox changes
                                const currentEndDate = useProjectEndDate 
                                  ? (formatDateForInput(projectEndDate) || '') 
                                  : (assignmentEndDate || '');
                                const validationError = validateDates(newStartDate, currentEndDate);
                                setDateValidationError(validationError);
                              }
                            }}
                          >
                            Use project start date
                            {projectStartDate && (
                              <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>
                                ({formatDateForDisplay(projectStartDate)})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <input
                          type="date"
                          value={useProjectStartDate 
                            ? (formatDateForInput(projectStartDate) || '') 
                            : (assignmentStartDate || '')}
                          onChange={(e) => {
                            if (!useProjectStartDate) {
                              const selectedDate = e.target.value;
                              setAssignmentStartDate(selectedDate);
                              // Validate dates in real-time
                              const currentEndDate = useProjectEndDate 
                                ? (formatDateForInput(projectEndDate) || '') 
                                : (assignmentEndDate || '');
                              const validationError = validateDates(selectedDate, currentEndDate);
                              setDateValidationError(validationError);
                            }
                          }}
                          disabled={useProjectStartDate}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{
                            backgroundColor: useProjectStartDate ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: useProjectStartDate ? colors.textMuted : colors.textPrimary,
                            borderColor: dateValidationError ? '#ef4444' : colors.border,
                            opacity: useProjectStartDate ? 0.6 : 1,
                            cursor: useProjectStartDate ? 'not-allowed' : 'text'
                          }}
                        />
                        {dateValidationError && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            {dateValidationError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        End Date
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="useProjectEndDateLabour"
                              checked={useProjectEndDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUseProjectEndDate(checked);
                                if (checked) {
                                  const newEndDate = formatDateForInput(projectEndDate) || '';
                                  setAssignmentEndDate(newEndDate);
                                  // Validate dates when checkbox changes
                                  const currentStartDate = useProjectStartDate 
                                    ? (formatDateForInput(projectStartDate) || '') 
                                    : (assignmentStartDate || '');
                                  const validationError = validateDates(currentStartDate, newEndDate);
                                  setDateValidationError(validationError);
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="useProjectEndDateLabour"
                              className="w-4 h-4 rounded cursor-pointer flex items-center justify-center border-2 transition-colors"
                              style={{
                                backgroundColor: useProjectEndDate ? colors.primary : 'transparent',
                                borderColor: useProjectEndDate ? colors.primary : colors.border
                              }}
                            >
                              {useProjectEndDate && (
                                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                          </div>
                          <div 
                            className="text-sm cursor-pointer flex-1" 
                            style={{ color: colors.textPrimary }}
                            onClick={() => {
                              const newValue = !useProjectEndDate;
                              setUseProjectEndDate(newValue);
                              if (newValue) {
                                const newEndDate = formatDateForInput(projectEndDate) || '';
                                setAssignmentEndDate(newEndDate);
                                // Validate dates when checkbox changes
                                const currentStartDate = useProjectStartDate 
                                  ? (formatDateForInput(projectStartDate) || '') 
                                  : (assignmentStartDate || '');
                                const validationError = validateDates(currentStartDate, newEndDate);
                                setDateValidationError(validationError);
                              }
                            }}
                          >
                            Use project end date
                            {projectEndDate && (
                              <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>
                                ({formatDateForDisplay(projectEndDate)})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <input
                          type="date"
                          value={useProjectEndDate 
                            ? (formatDateForInput(projectEndDate) || '') 
                            : (assignmentEndDate || '')}
                          onChange={(e) => {
                            if (!useProjectEndDate) {
                              const selectedDate = e.target.value;
                              setAssignmentEndDate(selectedDate);
                              // Validate dates in real-time
                              const currentStartDate = useProjectStartDate 
                                ? (formatDateForInput(projectStartDate) || '') 
                                : (assignmentStartDate || '');
                              const validationError = validateDates(currentStartDate, selectedDate);
                              setDateValidationError(validationError);
                            }
                          }}
                          disabled={useProjectEndDate}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{
                            backgroundColor: useProjectEndDate ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: useProjectEndDate ? colors.textMuted : colors.textPrimary,
                            borderColor: dateValidationError ? '#ef4444' : colors.border,
                            opacity: useProjectEndDate ? 0.6 : 1,
                            cursor: useProjectEndDate ? 'not-allowed' : 'text'
                          }}
                        />
                        {dateValidationError && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            {dateValidationError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        onClick={() => {
                          setSelectedLabourForAssignment(null);
                          setAssignmentStartDate('');
                          setAssignmentEndDate('');
                          setUseProjectStartDate(true);
                          setUseProjectEndDate(true);
                          setDateValidationError('');
                        }}
                        variant="ghost"
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleAssignLabourToTrade}
                        variant="primary"
                        disabled={
                          isSubmitting ||
                          (!useProjectStartDate && !assignmentStartDate) ||
                          (!useProjectEndDate && !assignmentEndDate) ||
                          !!dateValidationError ||
                          assignmentUtilization < 0 || assignmentUtilization > 100
                        }
                      >
                        {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                      </Button>
                    </div>
                  </div>
                </>
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
                  onClick={() => {
                    setEditingLabourAssignment(null);
                    setEditUseFullDuration(false);
                    setEditUseProjectStartDate(false);
                    setEditUseProjectEndDate(false);
                    setEditDateValidationError('');
                  }}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Utilization (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editingLabourAssignment.utilization}
                      onChange={(e) => setEditingLabourAssignment({ ...editingLabourAssignment, utilization: parseInt(e.target.value) || 0 })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={editingLabourAssignment.utilization}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) return setEditingLabourAssignment({ ...editingLabourAssignment, utilization: 0 });
                        setEditingLabourAssignment({ ...editingLabourAssignment, utilization: Math.max(0, Math.min(100, val)) });
                      }}
                      min={0}
                      max={100}
                      className="w-24"
                    />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>%</span>
                  </div>
                </div>
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

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Duration
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Start Date
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="editUseProjectStartDateLabour"
                              checked={editUseProjectStartDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditUseProjectStartDate(checked);
                                if (checked) {
                                  const newStartDate = formatDateForInput(projectStartDate) || '';
                                  setEditingLabourAssignment({
                                    ...editingLabourAssignment,
                                    startDate: newStartDate || null
                                  });
                                  // Validate dates when checkbox changes
                                  const currentEndDate = editUseProjectEndDate 
                                    ? (formatDateForInput(projectEndDate) || '') 
                                    : (editingLabourAssignment.endDate && typeof editingLabourAssignment.endDate === 'string' && editingLabourAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                      ? editingLabourAssignment.endDate.split('T')[0].split(' ')[0]
                                      : formatDateForInput(editingLabourAssignment.endDate) || '');
                                  const validationError = validateDates(newStartDate, currentEndDate, true);
                                  setEditDateValidationError(validationError);
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="editUseProjectStartDateLabour"
                              className="w-4 h-4 rounded cursor-pointer flex items-center justify-center border-2 transition-colors"
                              style={{
                                backgroundColor: editUseProjectStartDate ? colors.primary : 'transparent',
                                borderColor: editUseProjectStartDate ? colors.primary : colors.border
                              }}
                            >
                              {editUseProjectStartDate && (
                                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                          </div>
                          <div 
                            className="text-sm cursor-pointer flex-1" 
                            style={{ color: colors.textPrimary }}
                            onClick={() => {
                              const newValue = !editUseProjectStartDate;
                              setEditUseProjectStartDate(newValue);
                              if (newValue) {
                                const newStartDate = formatDateForInput(projectStartDate) || '';
                                setEditingLabourAssignment({
                                  ...editingLabourAssignment,
                                  startDate: newStartDate || null
                                });
                                // Validate dates when checkbox changes
                                const currentEndDate = editUseProjectEndDate 
                                  ? (formatDateForInput(projectEndDate) || '') 
                                  : (editingLabourAssignment.endDate && typeof editingLabourAssignment.endDate === 'string' && editingLabourAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                    ? editingLabourAssignment.endDate.split('T')[0].split(' ')[0]
                                    : formatDateForInput(editingLabourAssignment.endDate) || '');
                                const validationError = validateDates(newStartDate, currentEndDate, true);
                                setEditDateValidationError(validationError);
                              }
                            }}
                          >
                            Use project start date
                            {projectStartDate && (
                              <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>
                                ({formatDateForDisplay(projectStartDate)})
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          type="date"
                          onChange={(e) => {
                            if (!editUseProjectStartDate) {
                              const selectedDate = e.target.value;
                              setEditingLabourAssignment({
                                ...editingLabourAssignment,
                                startDate: selectedDate || null
                              });
                              // Validate dates in real-time
                              const currentEndDate = editUseProjectEndDate 
                                ? (formatDateForInput(projectEndDate) || '') 
                                : (editingLabourAssignment.endDate && typeof editingLabourAssignment.endDate === 'string' && editingLabourAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                  ? editingLabourAssignment.endDate.split('T')[0].split(' ')[0]
                                  : formatDateForInput(editingLabourAssignment.endDate) || '');
                              const validationError = validateDates(selectedDate, currentEndDate, true);
                              setEditDateValidationError(validationError);
                            }
                          }}
                          value={editUseProjectStartDate 
                            ? (formatDateForInput(projectStartDate) || '') 
                            : (editingLabourAssignment.startDate && typeof editingLabourAssignment.startDate === 'string' && editingLabourAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                              ? editingLabourAssignment.startDate.split('T')[0].split(' ')[0]
                              : formatDateForInput(editingLabourAssignment.startDate) || '')}
                          disabled={editUseProjectStartDate}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            backgroundColor: editUseProjectStartDate ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: editUseProjectStartDate ? colors.textMuted : colors.textPrimary,
                            borderColor: editDateValidationError ? '#ef4444' : colors.border,
                            opacity: editUseProjectStartDate ? 0.6 : 1,
                            cursor: editUseProjectStartDate ? 'not-allowed' : 'text'
                          }}
                        />
                        {editDateValidationError && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            {editDateValidationError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        End Date
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="editUseProjectEndDateLabour"
                              checked={editUseProjectEndDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditUseProjectEndDate(checked);
                                if (checked) {
                                  const newEndDate = formatDateForInput(projectEndDate) || '';
                                  setEditingLabourAssignment({
                                    ...editingLabourAssignment,
                                    endDate: newEndDate || null
                                  });
                                  // Validate dates when checkbox changes
                                  const currentStartDate = editUseProjectStartDate 
                                    ? (formatDateForInput(projectStartDate) || '') 
                                    : (editingLabourAssignment.startDate && typeof editingLabourAssignment.startDate === 'string' && editingLabourAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                      ? editingLabourAssignment.startDate.split('T')[0].split(' ')[0]
                                      : formatDateForInput(editingLabourAssignment.startDate) || '');
                                  const validationError = validateDates(currentStartDate, newEndDate, true);
                                  setEditDateValidationError(validationError);
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="editUseProjectEndDateLabour"
                              className="w-4 h-4 rounded cursor-pointer flex items-center justify-center border-2 transition-colors"
                              style={{
                                backgroundColor: editUseProjectEndDate ? colors.primary : 'transparent',
                                borderColor: editUseProjectEndDate ? colors.primary : colors.border
                              }}
                            >
                              {editUseProjectEndDate && (
                                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                          </div>
                          <div 
                            className="text-sm cursor-pointer flex-1" 
                            style={{ color: colors.textPrimary }}
                            onClick={() => {
                              const newValue = !editUseProjectEndDate;
                              setEditUseProjectEndDate(newValue);
                              if (newValue) {
                                const newEndDate = formatDateForInput(projectEndDate) || '';
                                setEditingLabourAssignment({
                                  ...editingLabourAssignment,
                                  endDate: newEndDate || null
                                });
                                // Validate dates when checkbox changes
                                const currentStartDate = editUseProjectStartDate 
                                  ? (formatDateForInput(projectStartDate) || '') 
                                  : (editingLabourAssignment.startDate && typeof editingLabourAssignment.startDate === 'string' && editingLabourAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                    ? editingLabourAssignment.startDate.split('T')[0].split(' ')[0]
                                    : formatDateForInput(editingLabourAssignment.startDate) || '');
                                const validationError = validateDates(currentStartDate, newEndDate, true);
                                setEditDateValidationError(validationError);
                              }
                            }}
                          >
                            Use project end date
                            {projectEndDate && (
                              <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>
                                ({formatDateForDisplay(projectEndDate)})
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          type="date"
                          onChange={(e) => {
                            if (!editUseProjectEndDate) {
                              const selectedDate = e.target.value;
                              setEditingLabourAssignment({
                                ...editingLabourAssignment,
                                endDate: selectedDate || null
                              });
                              // Validate dates in real-time
                              const currentStartDate = editUseProjectStartDate 
                                ? (formatDateForInput(projectStartDate) || '') 
                                : (editingLabourAssignment.startDate && typeof editingLabourAssignment.startDate === 'string' && editingLabourAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                  ? editingLabourAssignment.startDate.split('T')[0].split(' ')[0]
                                  : formatDateForInput(editingLabourAssignment.startDate) || '');
                              const validationError = validateDates(currentStartDate, selectedDate, true);
                              setEditDateValidationError(validationError);
                            }
                          }}
                          value={editUseProjectEndDate 
                            ? (formatDateForInput(projectEndDate) || '') 
                            : (editingLabourAssignment.endDate && typeof editingLabourAssignment.endDate === 'string' && editingLabourAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                              ? editingLabourAssignment.endDate.split('T')[0].split(' ')[0]
                              : formatDateForInput(editingLabourAssignment.endDate) || '')}
                          disabled={editUseProjectEndDate}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            backgroundColor: editUseProjectEndDate ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: editUseProjectEndDate ? colors.textMuted : colors.textPrimary,
                            borderColor: editDateValidationError ? '#ef4444' : colors.border,
                            opacity: editUseProjectEndDate ? 0.6 : 1,
                            cursor: editUseProjectEndDate ? 'not-allowed' : 'text'
                          }}
                        />
                        {editDateValidationError && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            {editDateValidationError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      setEditingLabourAssignment(null);
                      setEditUseFullDuration(false);
                      setEditUseProjectStartDate(false);
                      setEditUseProjectEndDate(false);
                      setEditDateValidationError('');
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateLabourAssignment}
                    variant="primary"
                  disabled={isSubmitting || !!editDateValidationError || editingLabourAssignment.utilization < 0 || editingLabourAssignment.utilization > 100}
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

