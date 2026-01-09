'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  monthlyBaseRate?: number | null;
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
  startDate?: string | null;
  endDate?: string | null;
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
  const [showAddLabourModal, setShowAddLabourModal] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string>('');
  const [showCostBreakdown, setShowCostBreakdown] = useState<'required' | 'assigned' | null>(null);
  
  // Trade modal state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [newTradeStartDate, setNewTradeStartDate] = useState('');
  const [newTradeEndDate, setNewTradeEndDate] = useState('');
  const [tradeDateValidationError, setTradeDateValidationError] = useState<string>('');
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
    monthlyBaseRate: undefined,
  });

  useEffect(() => {
    fetchProjectTrades();
    fetchLabours();
    fetchTrades();
  }, [projectId]);

  const selectableTrades = useMemo(() => {
    const usedTradeNames = new Set(projectTrades.map((t) => t.trade.trim().toLowerCase()));
    return trades.filter((trade) => {
      if (!trade.isActive) return false;
      const nameKey = trade.name.trim().toLowerCase();
      return !usedTradeNames.has(nameKey);
    });
  }, [projectTrades, trades]);

  useEffect(() => {
    if (!showTradeModal) return;
    const formattedStart = formatDateForInput(projectStartDate) || '';
    const formattedEnd = formatDateForInput(projectEndDate) || '';
    setNewTradeStartDate(formattedStart);
    setNewTradeEndDate(formattedEnd);
    setTradeDateValidationError(validateDates(formattedStart, formattedEnd));
  }, [showTradeModal, projectStartDate, projectEndDate]);

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
      const fallbackStart = formatDateForInput(projectStartDate) || '';
      const fallbackEnd = formatDateForInput(projectEndDate) || '';
      const startDate = (newTradeStartDate || fallbackStart || '').split('T')[0];
      const endDate = (newTradeEndDate || fallbackEnd || '').split('T')[0];

      const validation = validateDates(startDate, endDate);
      if (validation) {
        setErrorMessage(validation);
        setIsSubmitting(false);
        return;
      }

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-trades', {
        projectId: projectId,
        trade: trade.name,
        requiredQuantity: 1,
        startDate: startDate || null,
        endDate: endDate || null,
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
      const fallbackStart = formatDateForInput(projectStartDate) || '';
      const fallbackEnd = formatDateForInput(projectEndDate) || '';
      const startDate = (formatDateForInput(editingTrade.startDate) || fallbackStart || '').split('T')[0];
      const endDate = (formatDateForInput(editingTrade.endDate) || fallbackEnd || '').split('T')[0];

      const validation = validateDates(startDate, endDate);
      if (validation) {
        setErrorMessage(validation);
        setIsSubmitting(false);
        return;
      }

      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-trades/${editingTrade.id}`, {
        requiredQuantity: editingTrade.requiredQuantity,
        startDate: startDate || null,
        endDate: endDate || null,
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
        monthlyBaseRate:
          newLabour.monthlyBaseRate === undefined || newLabour.monthlyBaseRate === null
            ? null
            : Number(newLabour.monthlyBaseRate),
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
          monthlyBaseRate: undefined,
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

  const filteredProjectTrades = useMemo(() => {
    if (!tradeFilter) return projectTrades;
    return projectTrades.filter(trade => trade.trade === tradeFilter);
  }, [projectTrades, tradeFilter]);

  const calculateProjectStatistics = () => {
    const allAssignments = filteredProjectTrades.flatMap(trade => trade.labourAssignments || []);
    
    const requiredLabour = filteredProjectTrades.reduce((sum, trade) => {
      return sum + trade.requiredQuantity;
    }, 0);
    
    const assignedLabour = allAssignments.length;
    
    const involvedLabourIds = new Set(allAssignments.map(assignment => assignment.labourId));
    const involvedLabour = involvedLabourIds.size;
    
    // Calculate required labours cost: trade rate × required quantity
    const expectedMonthlyCost = filteredProjectTrades.reduce((sum, trade) => {
      const tradeData = trades.find(t => t.name === trade.trade);
      const tradeRate = tradeData?.monthlyRate || 5000;
      return sum + (tradeRate * trade.requiredQuantity);
    }, 0);
    
    // Calculate assigned labours cost: labour base rate × utilization percentage
    const assignedMonthlyCost = allAssignments.reduce((sum, assignment) => {
      if (!assignment.labour) return sum;
      
      // Use labour's monthlyBaseRate if available, otherwise fall back to trade rate
      const labourRate = assignment.labour.monthlyBaseRate 
        ? Number(assignment.labour.monthlyBaseRate)
        : (() => {
            const trade = filteredProjectTrades.find(t => 
              t.labourAssignments.some(a => a.id === assignment.id)
            );
            const tradeData = trades.find(t => t.name === trade?.trade);
            return tradeData?.monthlyRate || 5000;
          })();
      
      // Calculate cost: labour rate × (utilization / 100)
      return sum + (labourRate * (assignment.utilization / 100));
    }, 0);
    
    const balanceLabour = requiredLabour - assignedLabour;

    return {
      requiredLabour,
      assignedLabour,
      balanceLabour,
      involvedLabour,
      expectedMonthlyCost: Math.round(expectedMonthlyCost),
      assignedMonthlyCost: Math.round(assignedMonthlyCost)
    };
  };

  const stats = useMemo(() => calculateProjectStatistics(), [filteredProjectTrades, trades, labours]);

  const projectDurationMonths = useMemo(() => {
    if (!projectStartDate || !projectEndDate) {
      return null;
    }

    const start = new Date(projectStartDate);
    const end = new Date(projectEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      return 0;
    }

    const months = diffMs / (1000 * 60 * 60 * 24 * 30);
    return Math.max(1, Math.round(months));
  }, [projectStartDate, projectEndDate]);

  // Required cost breakdown (trade rates × required quantity)
  const requiredCostBreakdown = useMemo(() => {
    const details = filteredProjectTrades.map((trade) => {
      const tradeData = trades.find(t => t.name === trade.trade);
      const tradeRate = tradeData?.monthlyRate || 5000;
      const requiredQuantity = trade.requiredQuantity;
      
      // Calculate monthly cost based on required quantity
      const monthlyCost = tradeRate * requiredQuantity;
      const totalCost = projectDurationMonths ? monthlyCost * projectDurationMonths : null;

      return {
        trade: trade.trade,
        tradeRate,
        requiredQuantity,
        monthlyCost,
        totalCost,
      };
    });

    const monthlyTotal = details.reduce((sum, detail) => sum + detail.monthlyCost, 0);
    const totalCost = details.reduce((sum, detail) => sum + (detail.totalCost ?? 0), 0);

    return {
      details,
      monthlyTotal,
      totalCost: projectDurationMonths ? totalCost : null,
      durationMonths: projectDurationMonths,
    };
  }, [filteredProjectTrades, trades, projectDurationMonths]);

  // Assigned cost breakdown (labour rates × utilization)
  const assignedCostBreakdown = useMemo(() => {
    const allAssignments = filteredProjectTrades.flatMap(trade => 
      trade.labourAssignments.map(assignment => ({
        ...assignment,
        tradeName: trade.trade,
      }))
    );

    const details = allAssignments.map((assignment) => {
      if (!assignment.labour) return null;

      // Use labour's monthlyBaseRate if available, otherwise fall back to trade rate
      const trade = filteredProjectTrades.find(t => 
        t.labourAssignments.some(a => a.id === assignment.id)
      );
      const tradeData = trades.find(t => t.name === trade?.trade);
      const tradeRate = tradeData?.monthlyRate || 5000;
      
      const labourRate = assignment.labour.monthlyBaseRate 
        ? Number(assignment.labour.monthlyBaseRate)
        : tradeRate;
      
      // Calculate cost: labour rate × (utilization / 100)
      const monthlyCost = labourRate * (assignment.utilization / 100);
      const totalCost = projectDurationMonths ? monthlyCost * projectDurationMonths : null;

      return {
        labourName: assignment.labour.labourName,
        trade: assignment.tradeName || trade?.trade || '',
        labourRate,
        utilization: assignment.utilization,
        monthlyCost,
        totalCost,
      };
    }).filter((detail): detail is NonNullable<typeof detail> => detail !== null);

    const monthlyTotal = details.reduce((sum, detail) => sum + detail.monthlyCost, 0);
    const totalCost = details.reduce((sum, detail) => sum + (detail.totalCost ?? 0), 0);

    return {
      details,
      monthlyTotal,
      totalCost: projectDurationMonths ? totalCost : null,
      durationMonths: projectDurationMonths,
    };
  }, [filteredProjectTrades, trades, projectDurationMonths]);

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

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
            Filter by Trade:
          </label>
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: colors.backgroundPrimary,
              color: colors.textPrimary,
              borderColor: colors.borderLight
            }}
          >
            <option value="">All Trades</option>
            {filteredProjectTrades.map((trade) => (
              <option key={trade.id} value={trade.trade}>
                {trade.trade}
              </option>
            ))}
          </select>
        </div>
        {tradeFilter && (
          <Button
            onClick={() => setTradeFilter('')}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

        <Card
          className="p-4 cursor-pointer transition-colors"
          style={{ backgroundColor: colors.backgroundSecondary }}
          onClick={() => requiredCostBreakdown.details.length > 0 && setShowCostBreakdown('required')}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center text-lg font-bold" style={{ color: colors.warning }}>
              {siteSettings?.currencySymbol || '$'}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Required Labours Cost
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {Number.isFinite(stats.expectedMonthlyCost)
                  ? Number(stats.expectedMonthlyCost).toLocaleString()
                  : '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer transition-colors"
          style={{ backgroundColor: colors.backgroundSecondary }}
          onClick={() => assignedCostBreakdown.details.length > 0 && setShowCostBreakdown('assigned')}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center text-lg font-bold" style={{ color: colors.info }}>
              {siteSettings?.currencySymbol || '$'}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Assigned Labours Cost
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {Number.isFinite(stats.assignedMonthlyCost)
                  ? Number(stats.assignedMonthlyCost).toLocaleString()
                  : '0'}
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
        
        {filteredProjectTrades.length > 0 ? (
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
                {filteredProjectTrades.map((trade) => {
                  const assignedQuantity = trade.labourAssignments.length;
                  const isQuantityMet = assignedQuantity >= trade.requiredQuantity;
                  const remainingNeeded = Math.max(0, trade.requiredQuantity - assignedQuantity);
                  const tradeStartLabel = trade.startDate
                    ? formatDateForDisplay(trade.startDate)
                    : projectStartDate
                      ? formatDateForDisplay(projectStartDate)
                      : '-';
                  const tradeEndLabel = trade.endDate
                    ? formatDateForDisplay(trade.endDate)
                    : projectEndDate
                      ? formatDateForDisplay(projectEndDate)
                      : '-';

                  return (
                    <React.Fragment key={trade.id}>
                      {/* Trade Header Row */}
                      <tr className="border-b" style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                            <span className="font-medium" style={{ color: colors.textPrimary }}>
                              {trade.trade}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">{assignedQuantity}/{trade.requiredQuantity}</span>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">—</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-medium ${
                              isQuantityMet ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {isQuantityMet ? 'Complete' : `${remainingNeeded} needed`}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">—</span>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">{tradeStartLabel}</span>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">{tradeEndLabel}</span>
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          <span className="text-sm">—</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
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
                            <Button
                              onClick={() => {
                                const fallbackStart = formatDateForInput(projectStartDate) || '';
                                const fallbackEnd = formatDateForInput(projectEndDate) || '';
                                setEditingTrade({
                                  ...trade,
                                  startDate: formatDateForInput(trade.startDate) || fallbackStart || null,
                                  endDate: formatDateForInput(trade.endDate) || fallbackEnd || null,
                                });
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
                              title={`Delete ${trade.trade}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6 border-b" style={{ borderColor: colors.borderLight }}>
              <div className="flex items-center justify-between">
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
            </div>

            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                  {errorMessage}
                </div>
              )}

              <Card
                className="p-4 mb-4"
                style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.borderLight }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Trade duration
                    </p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Defaults to the project start/end dates.
                    </p>
                  </div>
                  {tradeDateValidationError && (
                    <span className="text-xs font-medium" style={{ color: colors.error }}>
                      {tradeDateValidationError}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Start Date"
                    type="date"
                    value={newTradeStartDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setNewTradeStartDate(next);
                      setTradeDateValidationError(validateDates(next, newTradeEndDate));
                    }}
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={newTradeEndDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setNewTradeEndDate(next);
                      setTradeDateValidationError(validateDates(newTradeStartDate, next));
                    }}
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </Card>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectableTrades.map((trade) => (
                  <button
                    key={trade.id}
                    onClick={() => handleTradeSelect(trade)}
                    className="w-full p-4 text-left rounded-lg border transition-colors"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: colors.backgroundPrimary
                    }}
                    disabled={isSubmitting || !!tradeDateValidationError}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                    }}
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: colors.border }}
            >
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Assign Labour to Trade
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Select a labour to assign to: <span className="font-medium" style={{ color: colors.textPrimary }}>
                    {projectTrades.find(t => t.id === assigningToTrade)?.trade}
                  </span>
                  <br />
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    Only labours not already assigned to this project are shown
                  </span>
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setAssigningToTrade(null);
                  setSearchTerm('');
                  setTradeFilter('');
                  setSelectedLabourForAssignment(null);
                  setAssignmentStartDate('');
                  setAssignmentEndDate('');
                  setUseProjectStartDate(true);
                  setUseProjectEndDate(true);
                }}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <Input
                    type="text"
                    placeholder="Search by name, employee number, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <select
                    value={tradeFilter}
                    onChange={(e) => setTradeFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  >
                    <option value="">All Trades</option>
                    {selectableTrades.map((trade) => (
                      <option key={trade.id} value={trade.name}>
                        {trade.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add New Labour Button */}
              <div className="mb-6">
                <Button
                  onClick={() => {
                    setShowAddLabourModal(true);
                    setNewLabour({
                      labourName: '',
                      employeeNumber: '',
                      phone: '',
                      trade: '',
                      tradeId: undefined,
                      isActive: true,
                    });
                    setErrorMessage('');
                  }}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Labour</span>
                </Button>
              </div>

              {!selectedLabourForAssignment ? (
                <>
                  {/* Labour List */}
                  <div className="space-y-2">
                    {filteredLabours.map((member) => {
                      const isAlreadyAssigned = projectTrades.some(trade =>
                        trade.labourAssignments.some(assignment => assignment.labourId === member.id)
                      );

                      return (
                        <div
                          key={member.id}
                          className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          style={{ 
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.borderLight
                          }}
                          onClick={() => {
                            if (!isAlreadyAssigned && assigningToTrade) {
                              handleLabourSelectForAssignment(assigningToTrade, member.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <HardHat className="w-5 h-5 mt-1" style={{ color: colors.textMuted }} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                                    {member.labourName}
                                  </h3>
                                  {!isAlreadyAssigned && (
                                    <div className="flex items-center ml-4">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                        disabled={isAlreadyAssigned}
                                      >
                                        <UserCheck className="w-4 h-4" />
                                        <span>Assign</span>
                                      </Button>
                                    </div>
                                  )}
                                  {isAlreadyAssigned && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                      Already Assigned
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textSecondary }}>
                                  {member.employeeNumber && (
                                    <span>#{member.employeeNumber}</span>
                                  )}
                                  {member.phone && (
                                    <span>{member.phone}</span>
                                  )}
                                  {member.trade && (
                                    <span>{member.trade}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredLabours.length === 0 && (
                    <div className="text-center py-8">
                      <HardHat className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                        {searchTerm ? 'No labours found' : 'No labours available'}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'All available labours are already assigned to this project'}
                      </p>
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
                      <div className="flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={assignmentUtilization}
                          onChange={(e) => setAssignmentUtilization(parseInt(e.target.value) || 0)}
                          className="flex-1 mr-3"
                        />
                        <div className="flex items-center">
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
                          <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>%</span>
                        </div>
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
          </div>
        </div>
      )}

      {/* Add New Labour Modal */}
      {showAddLabourModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: colors.border }}
            >
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Add New Labour
              </h2>
              <Button
                onClick={() => {
                  setShowAddLabourModal(false);
                  setShowTradeDropdown(false);
                  setTradeSearchTerm('');
                  setNewLabour({
                    labourName: '',
                    employeeNumber: '',
                    phone: '',
                    trade: '',
                    tradeId: undefined,
                    isActive: true,
                    monthlyBaseRate: undefined,
                  });
                  setErrorMessage('');
                }}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `1px solid ${colors.error}` }}>
                  <p className="text-sm" style={{ color: colors.error }}>
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Labour Name *
                  </label>
                  <Input
                    type="text"
                    value={newLabour.labourName || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, labourName: e.target.value })}
                    placeholder="Enter labour's full name"
                    required
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Employee Number
                  </label>
                  <Input
                    type="text"
                    value={newLabour.employeeNumber || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, employeeNumber: e.target.value })}
                    placeholder="e.g., EMP001, 12345"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newLabour.phone || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Monthly Rate
                  </label>
                  <Input
                    type="number"
                    value={newLabour.monthlyBaseRate || ''}
                    onChange={(e) => setNewLabour({ ...newLabour, monthlyBaseRate: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    Monthly salary/rate for this labour
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Trade
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowTradeDropdown(!showTradeDropdown)}
                      className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
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
                          borderColor: colors.borderLight
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
                              borderColor: colors.borderLight,
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
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => {
                    setShowAddLabourModal(false);
                    setShowTradeDropdown(false);
                    setTradeSearchTerm('');
                    setNewLabour({
                      labourName: '',
                      employeeNumber: '',
                      phone: '',
                      trade: '',
                      tradeId: undefined,
                      isActive: true,
                    });
                    setErrorMessage('');
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      setErrorMessage('');
                      
                      const response = await post<{ success: boolean; data: any; error?: string }>('/api/admin/labours', {
                        labourName: newLabour.labourName,
                        employeeNumber: newLabour.employeeNumber || undefined,
                        phone: newLabour.phone || undefined,
                        trade: newLabour.tradeId ? trades.find(t => t.id === newLabour.tradeId)?.name : undefined,
                        isActive: true,
                        monthlyBaseRate:
                          newLabour.monthlyBaseRate === undefined || newLabour.monthlyBaseRate === null
                            ? null
                            : Number(newLabour.monthlyBaseRate),
                      });

                      if (response.success && response.data) {
                        // Refresh labours list
                        const laboursResponse = await get<{ success: boolean; data: Labour[] }>('/api/admin/labours');
                        if (laboursResponse.success) {
                          setLabours(laboursResponse.data);
                        }
                        
                        setShowAddLabourModal(false);
                        setShowTradeDropdown(false);
                        setTradeSearchTerm('');
                        setNewLabour({
                          labourName: '',
                          employeeNumber: '',
                          phone: '',
                          trade: '',
                          tradeId: undefined,
                          isActive: true,
                        });
                      } else {
                        setErrorMessage(response.error || 'Failed to add labour');
                      }
                    } catch (error: any) {
                      console.error('Error adding labour:', error);
                      setErrorMessage(error.message || 'Failed to add labour');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  variant="primary"
                  disabled={isSubmitting || !newLabour.labourName}
                >
                  {isSubmitting ? 'Adding...' : 'Add Labour'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Utilization Modal */}
      {editingLabourAssignment && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6 border-b flex-shrink-0" style={{ borderColor: colors.borderLight }}>
              <div className="flex items-center justify-between">
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
            </div>

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
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
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editingLabourAssignment.utilization}
                      onChange={(e) => setEditingLabourAssignment({ ...editingLabourAssignment, utilization: parseInt(e.target.value) || 0 })}
                      className="flex-1 mr-3"
                    />
                    <div className="flex items-center">
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
                      <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>%</span>
                    </div>
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
              </div>
            </div>

            <div className="p-6 border-t flex-shrink-0" style={{ borderColor: colors.borderLight }}>
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
          </Card>
        </div>
      )}

      {/* Edit Trade Modal */}
      {editingTrade && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b flex-shrink-0"
              style={{ borderColor: colors.borderLight }}
            >
              <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Edit Trade Requirements
              </h3>
              <button
                onClick={() => setEditingTrade(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Trade
                </label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4" style={{ color: colors.textMuted }} />
                    <span style={{ color: colors.textPrimary }}>
                      {editingTrade.trade}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Trade names are managed company-wide and cannot be changed here
                  </p>
                </div>
              </div>

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
                  style={{ backgroundColor: colors.backgroundPrimary }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Number of labourers required for this trade
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Trade Start Date
                  </label>
                  <Input
                    type="date"
                    value={formatDateForInput(editingTrade.startDate) || ''}
                    onChange={(e) => setEditingTrade({ ...editingTrade, startDate: e.target.value })}
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Defaults to the project start date.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Trade End Date
                  </label>
                  <Input
                    type="date"
                    value={formatDateForInput(editingTrade.endDate) || ''}
                    onChange={(e) => setEditingTrade({ ...editingTrade, endDate: e.target.value })}
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Defaults to the project end date.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Current Status
                </h4>
                <div className="text-sm space-y-1" style={{ color: colors.textSecondary }}>
                  <p>Total assigned: {editingTrade?.labourAssignments?.length || 0} labourer{editingTrade?.labourAssignments?.length !== 1 ? 's' : ''}</p>
                  <p>Required: {editingTrade.requiredQuantity} labourer{editingTrade.requiredQuantity !== 1 ? 's' : ''}</p>
                  <p>Remaining: {Math.max(0, editingTrade.requiredQuantity - (editingTrade?.labourAssignments?.length || 0))} labourer{Math.max(0, editingTrade.requiredQuantity - (editingTrade?.labourAssignments?.length || 0)) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end space-x-3 p-6 border-t flex-shrink-0"
              style={{ borderColor: colors.borderLight }}
            >
              <Button
                onClick={() => setEditingTrade(null)}
                variant="ghost"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTrade}
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Trade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Required Cost Breakdown Modal */}
      {showCostBreakdown === 'required' && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: colors.backgroundPrimary,
              color: colors.textPrimary,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: colors.borderLight }}
            >
              <div>
                <h3 className="text-xl font-semibold">Required Labours Cost Breakdown</h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Review trade rates and required quantities across the project duration.
                </p>
              </div>
              <button
                onClick={() => setShowCostBreakdown(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.textSecondary }}
                aria-label="Close cost breakdown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="px-6 py-4 space-y-4"
              style={{
                overflowY: 'auto',
                flex: '1 1 auto',
              }}
            >
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.textSecondary }}>
                <span>
                  Monthly total:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {formatCurrency(requiredCostBreakdown.monthlyTotal, siteSettings?.currencySymbol || '$')}
                  </span>
                </span>
                <span>
                  Project duration:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {requiredCostBreakdown.durationMonths !== null
                      ? requiredCostBreakdown.durationMonths === 1
                        ? '1 month'
                        : `${requiredCostBreakdown.durationMonths} months`
                      : 'Not specified'}
                  </span>
                </span>
                <span>
                  Full-duration cost:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {requiredCostBreakdown.totalCost !== null
                      ? formatCurrency(requiredCostBreakdown.totalCost, siteSettings?.currencySymbol || '$')
                      : 'N/A'}
                  </span>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                      {['Trade', 'Trade Rate', 'Required Quantity', 'Monthly Cost', 'Total Cost'].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2 text-left font-semibold"
                          style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requiredCostBreakdown.details.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-4 text-center"
                          style={{ color: colors.textSecondary }}
                        >
                          No trades found for this project yet.
                        </td>
                      </tr>
                    ) : (
                      requiredCostBreakdown.details.map((detail, index) => (
                        <tr
                          key={`${detail.trade}-${index}`}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? colors.backgroundPrimary : colors.backgroundSecondary,
                          }}
                        >
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.trade}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {formatCurrency(detail.tradeRate, siteSettings?.currencySymbol || '$')}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.requiredQuantity}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {formatCurrency(detail.monthlyCost, siteSettings?.currencySymbol || '$')}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.totalCost !== null
                              ? formatCurrency(detail.totalCost, siteSettings?.currencySymbol || '$')
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="flex justify-end"
                style={{
                  flex: '0 0 auto',
                  paddingTop: '0.5rem',
                }}
              >
                <Button onClick={() => setShowCostBreakdown(null)} style={{ backgroundColor: colors.primary }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Cost Breakdown Modal */}
      {showCostBreakdown === 'assigned' && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: colors.backgroundPrimary,
              color: colors.textPrimary,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: colors.borderLight }}
            >
              <div>
                <h3 className="text-xl font-semibold">Assigned Labours Cost Breakdown</h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Review assigned labours' rates and utilization across the project duration.
                </p>
              </div>
              <button
                onClick={() => setShowCostBreakdown(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.textSecondary }}
                aria-label="Close cost breakdown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="px-6 py-4 space-y-4"
              style={{
                overflowY: 'auto',
                flex: '1 1 auto',
              }}
            >
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.textSecondary }}>
                <span>
                  Monthly total:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {formatCurrency(assignedCostBreakdown.monthlyTotal, siteSettings?.currencySymbol || '$')}
                  </span>
                </span>
                <span>
                  Project duration:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {assignedCostBreakdown.durationMonths !== null
                      ? assignedCostBreakdown.durationMonths === 1
                        ? '1 month'
                        : `${assignedCostBreakdown.durationMonths} months`
                      : 'Not specified'}
                  </span>
                </span>
                <span>
                  Full-duration cost:{' '}
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {assignedCostBreakdown.totalCost !== null
                      ? formatCurrency(assignedCostBreakdown.totalCost, siteSettings?.currencySymbol || '$')
                      : 'N/A'}
                  </span>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                      {['Labour Name', 'Trade', 'Labour Rate', 'Utilization', 'Monthly Cost', 'Total Cost'].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2 text-left font-semibold"
                          style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignedCostBreakdown.details.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center"
                          style={{ color: colors.textSecondary }}
                        >
                          No assigned labours found for this project yet.
                        </td>
                      </tr>
                    ) : (
                      assignedCostBreakdown.details.map((detail, index) => (
                        <tr
                          key={`${detail.labourName}-${detail.trade}-${index}`}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? colors.backgroundPrimary : colors.backgroundSecondary,
                          }}
                        >
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.labourName}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.trade}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {formatCurrency(detail.labourRate, siteSettings?.currencySymbol || '$')}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.utilization}%
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {formatCurrency(detail.monthlyCost, siteSettings?.currencySymbol || '$')}
                          </td>
                          <td className="px-4 py-2" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            {detail.totalCost !== null
                              ? formatCurrency(detail.totalCost, siteSettings?.currencySymbol || '$')
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="flex justify-end"
                style={{
                  flex: '0 0 auto',
                  paddingTop: '0.5rem',
                }}
              >
                <Button onClick={() => setShowCostBreakdown(null)} style={{ backgroundColor: colors.primary }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

