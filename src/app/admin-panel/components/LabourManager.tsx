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
  Calendar,
  History,
  Building2,
  ArrowRight,
  AlertCircle,
  Eye,
  FileText
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

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
}

interface ProjectTrade {
  id: number;
  trade: string;
  projectId: number;
}

interface MovementHistory {
  id: number;
  type: 'assignment' | 'movement';
  fromProjectName?: string;
  fromTradeName?: string;
  toProjectName: string;
  toTradeName: string;
  movementDate: string;
  notes?: string;
  movedBy?: string;
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
  vacationStartDate?: string | null;
  vacationEndDate?: string | null;
  monthlyBaseRate?: number | null;
}

export default function LabourManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [labours, setLabours] = useState<Labour[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeSearchTerm, setTradeSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'utilized'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'onLeave'>('all');
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [viewingLabour, setViewingLabour] = useState<Labour | null>(null);
  
  // Move labour modal state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movingLabour, setMovingLabour] = useState<Labour | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [availableTrades, setAvailableTrades] = useState<ProjectTrade[]>([]);
  const [moveNotes, setMoveNotes] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [moveErrorMessage, setMoveErrorMessage] = useState('');
  
  // Movement history state
  const [movementHistory, setMovementHistory] = useState<MovementHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Leave history state
  interface LeaveHistoryEntry {
    id: number;
    leaveStartDate: string;
    leaveEndDate: string;
    returnDate?: string | null;
    isReturned: boolean;
    notes?: string | null;
    createdAt: string;
  }
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryEntry[]>([]);
  const [loadingLeaveHistory, setLoadingLeaveHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<'movement' | 'leave'>('movement');
  
  // Vacation management state
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [markAsReturned, setMarkAsReturned] = useState(false);
  const [updatingVacation, setUpdatingVacation] = useState(false);
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
    fetchProjects();
  }, []);
  
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectTrades(selectedProjectId);
    } else {
      setAvailableTrades([]);
    }
  }, [selectedProjectId]);

  // Fetch leave history when opening a labour details view
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      if (!viewingLabour) return;
      try {
        setLoadingLeaveHistory(true);
        const res = await get<{ success: boolean; data: LeaveHistoryEntry[] }>(`/api/admin/labours/${viewingLabour.id}/leave-history`);
        if (res.success) {
          setLeaveHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch leave history', err);
      } finally {
        setLoadingLeaveHistory(false);
      }
    };

    fetchLeaveHistory();
  }, [viewingLabour]);
  
  useEffect(() => {
    if (viewingLabour) {
      fetchMovementHistory(viewingLabour.id);
    }
  }, [viewingLabour]);

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
  
  const fetchProjects = async () => {
    try {
      const response = await get<{ success: boolean; data: Project[] }>('/api/admin/projects');
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  
  const fetchProjectTrades = async (projectId: number) => {
    try {
      const response = await get<{ success: boolean; data: ProjectTrade[] }>(`/api/admin/project-trades?projectId=${projectId}`);
      if (response.success) {
        setAvailableTrades(response.data);
      }
    } catch (error) {
      console.error('Error fetching project trades:', error);
      setAvailableTrades([]);
    }
  };
  
  const fetchMovementHistory = async (labourId: number) => {
    try {
      setLoadingHistory(true);
      const response = await get<{ success: boolean; data: MovementHistory[] }>(`/api/admin/labours/${labourId}/movement-history`);
      if (response.success) {
        setMovementHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching movement history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenVacationModal = (labour: Labour) => {
    setViewingLabour(labour);
    // Fix timezone issue: use local date strings to avoid day shift
    if (labour.vacationStartDate) {
      const date = new Date(labour.vacationStartDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setVacationStartDate(`${year}-${month}-${day}`);
    } else {
      setVacationStartDate('');
    }
    if (labour.vacationEndDate) {
      const date = new Date(labour.vacationEndDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setVacationEndDate(`${year}-${month}-${day}`);
    } else {
      setVacationEndDate('');
    }
    setReturnDate('');
    setMarkAsReturned(false);
    setShowVacationModal(true);
  };

  const handleSaveVacation = async () => {
    if (!viewingLabour) return;
    
    // Validate dates
    if (!vacationStartDate || !vacationEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const startDate = new Date(vacationStartDate);
    const endDate = new Date(vacationEndDate);

    if (startDate > endDate) {
      alert('End date must be after start date');
      return;
    }

    try {
      setUpdatingVacation(true);
      // If marking as returned, use return date as end date
      const finalEndDate = markAsReturned && returnDate ? returnDate : vacationEndDate;
      const response = await put<{ success: boolean; data: Labour }>(
        `/api/admin/labours/${viewingLabour.id}/vacation`,
        {
          startDate: vacationStartDate || null,
          endDate: finalEndDate || null,
          returnDate: markAsReturned && returnDate ? returnDate : null,
          markAsReturned: markAsReturned,
        }
      );

      if (response.success) {
        await fetchLabours();
        setShowVacationModal(false);
        if (viewingLabour) {
          const updatedLabour = labours.find(l => l.id === viewingLabour.id);
          if (updatedLabour) {
            setViewingLabour({
              ...viewingLabour,
              vacationStartDate: response.data.vacationStartDate,
              vacationEndDate: response.data.vacationEndDate,
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error updating vacation:', error);
      alert('Failed to update vacation dates');
    } finally {
      setUpdatingVacation(false);
    }
  };

  const handleClearVacation = async () => {
    if (!viewingLabour) return;
    
    try {
      setUpdatingVacation(true);
      const response = await put<{ success: boolean; data: Labour }>(
        `/api/admin/labours/${viewingLabour.id}/vacation`,
        {
          startDate: null,
          endDate: null,
        }
      );

      if (response.success) {
        await fetchLabours();
        setVacationStartDate('');
        setVacationEndDate('');
        setShowVacationModal(false);
        if (viewingLabour) {
          const updatedLabour = labours.find(l => l.id === viewingLabour.id);
          if (updatedLabour) {
            setViewingLabour({
              ...viewingLabour,
              vacationStartDate: null,
              vacationEndDate: null,
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error clearing vacation:', error);
      alert('Failed to clear vacation dates');
    } finally {
      setUpdatingVacation(false);
    }
  };
  
  const handleMoveLabour = async () => {
    if (!movingLabour || !selectedProjectId || !selectedTradeId) {
      setMoveErrorMessage('Please select both project and trade');
      return;
    }
    
    // Find the current project assignment
    const currentAssignment = movingLabour.projectLabours?.[0];
    if (!currentAssignment) {
      setMoveErrorMessage('Labour is not currently assigned to any project');
      return;
    }
    
    setIsMoving(true);
    setMoveErrorMessage('');
    
    try {
      const response = await post<{ success: boolean; data: any }>(
        `/api/admin/labours/${movingLabour.id}/move`,
        {
          fromProjectLabourId: currentAssignment.id,
          toProjectId: selectedProjectId,
          toTradeId: selectedTradeId,
          notes: moveNotes || null,
          movementDate: moveDate || new Date().toISOString(),
        }
      );
      
      if (response.success) {
        // Refresh labours list
        await fetchLabours();
        setShowMoveModal(false);
        setMovingLabour(null);
        setSelectedProjectId(null);
        setSelectedTradeId(null);
        setMoveNotes('');
        setMoveDate('');
        setMoveErrorMessage('');
      } else {
        setMoveErrorMessage('Failed to move labour');
      }
    } catch (error: any) {
      console.error('Error moving labour:', error);
      setMoveErrorMessage(error.message || 'Failed to move labour');
    } finally {
      setIsMoving(false);
    }
  };
  
  const handleOpenMoveModal = (labour: Labour) => {
    // Check if labour is assigned to a project
    if (!labour.projectLabours || labour.projectLabours.length === 0) {
      alert('This labour is not assigned to any project. Please assign them to a project first.');
      return;
    }
    
    setMovingLabour(labour);
    setSelectedProjectId(null);
    setSelectedTradeId(null);
    setAvailableTrades([]);
    setMoveNotes('');
    setMoveDate(new Date().toISOString().split('T')[0]); // Set default to today
    setMoveErrorMessage('');
    setShowMoveModal(true);
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
        monthlyBaseRate:
          formData.monthlyBaseRate === undefined || formData.monthlyBaseRate === null
            ? null
            : Number(formData.monthlyBaseRate),
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
        monthlyBaseRate: undefined,
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
      monthlyBaseRate: labour.monthlyBaseRate || undefined,
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

  // Check if labour is currently on leave
  const isOnLeave = (labour: Labour): boolean => {
    if (!labour.vacationStartDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(labour.vacationStartDate);
    startDate.setHours(0, 0, 0, 0);
    // Remains on leave until cleared (dates removed)
    return today >= startDate;
  };

  const filteredLabours = labours.filter(labour => {
    // Apply search filter
    const matchesSearch = labour.labourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labour.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labour.trade?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply availability filter
    let matchesAvailability = true;
    if (availabilityFilter === 'available') {
      matchesAvailability = !labour.isUtilized;
    } else if (availabilityFilter === 'utilized') {
      matchesAvailability = labour.isUtilized === true;
    }

    // Apply active filter
    let matchesActive = true;
    if (activeFilter === 'active') {
      matchesActive = labour.isActive === true && !isOnLeave(labour);
    } else if (activeFilter === 'onLeave') {
      matchesActive = labour.isActive === true && isOnLeave(labour);
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
      {viewingLabour ? (
        <>
          {/* Labour Details View */}
          <div className="space-y-6">
            {/* Detail View Header */}
            <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setViewingLabour(null)}
                    variant="ghost"
                    className="p-2"
                    title="Back to Labour List"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.primary }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      {viewingLabour.labourName}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      {viewingLabour.trade && (
                        <>
                          <p className="text-sm" style={{ color: colors.textMuted }}>
                            {viewingLabour.trade}
                          </p>
                          <span className="text-sm" style={{ color: colors.border }}>•</span>
                        </>
                      )}
                      <p className="text-sm font-mono" style={{ color: colors.textSecondary }}>
                        ID: #{viewingLabour.id}
                      </p>
                      {viewingLabour.employeeNumber && (
                        <>
                          <span className="text-sm" style={{ color: colors.border }}>•</span>
                          <p className="text-sm font-mono" style={{ color: colors.textSecondary }}>
                            {viewingLabour.employeeNumber}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => {
                      setViewingLabour(null);
                      handleEdit(viewingLabour);
                    }}
                    variant="primary"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar - Basic Info & Summary */}
              <div className="lg:col-span-1 space-y-4">
              {/* Contact Information */}
              <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                  <Phone className="w-4 h-4" />
                  <span>Contact Information</span>
                </h3>
                <div className="space-y-3">
                  {viewingLabour.phone ? (
                    <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Phone className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Phone</p>
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          {viewingLabour.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <p className="text-sm" style={{ color: colors.textMuted }}>No phone number provided</p>
                    </div>
                  )}
                  {viewingLabour.employeeNumber && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <User className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Employee Number</p>
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          {viewingLabour.employeeNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Trade Information */}
              {viewingLabour.trade && (
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                    <Wrench className="w-4 h-4" />
                    <span>Trade</span>
                  </h3>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {viewingLabour.trade}
                    </p>
                  </div>
                </Card>
              )}

              {/* Status & Metadata */}
              <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                  <Calendar className="w-4 h-4" />
                  <span>Status</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Status</span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-block"
                      style={{ 
                        backgroundColor: !viewingLabour.isActive ? colors.error :
                                       isOnLeave(viewingLabour) ? colors.warning : colors.success,
                        color: '#FFFFFF'
                      }}
                    >
                      {!viewingLabour.isActive ? 'Inactive' :
                       isOnLeave(viewingLabour) ? 'On Leave' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Created</span>
                    <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                      {new Date(viewingLabour.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Last Updated</span>
                    <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                      {new Date(viewingLabour.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Leave Days (Vacation) Section */}
              <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                  <Calendar className="w-4 h-4" />
                  <span>Leave Days (Vacation)</span>
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <div className="space-y-3">
                        {isOnLeave(viewingLabour) ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" style={{ color: colors.warning }} />
                              <span className="text-sm whitespace-nowrap" style={{ color: colors.textPrimary }}>
                                On Leave
                              </span>
                            </div>
                            <div className="text-sm space-y-1" style={{ color: colors.textSecondary }}>
                              <div>
                                <span className="font-medium">From:</span> {new Date(viewingLabour.vacationStartDate!).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">To:</span> {new Date(viewingLabour.vacationEndDate!).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              Not on leave
                            </span>
                          </div>
                        )}
                        <Button
                          onClick={() => handleOpenVacationModal(viewingLabour)}
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          style={{ color: colors.primary }}
                        >
                          {viewingLabour.vacationStartDate ? 'Update Leave Days' : 'Set Leave Days'}
                        </Button>
                      </div>
                  </div>
                </Card>
              </div>

              {/* Right Content - Project Assignments & History */}
              <div className="lg:col-span-2 space-y-4">
                {/* Project Assignments */}
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                      <Building2 className="w-5 h-5" />
                      <span>Project Assignments</span>
                    </h3>
                    <span className="text-sm font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textSecondary }}>
                      {viewingLabour.projectLabours?.length || 0} {viewingLabour.projectLabours?.length === 1 ? 'project' : 'projects'}
                    </span>
                  </div>

                  {viewingLabour.projectLabours && viewingLabour.projectLabours.length > 0 ? (
                    <div className="space-y-3">
                      {viewingLabour.projectLabours.map((assignment) => (
                        <div 
                          key={assignment.id}
                          className="p-4 rounded-lg border hover:shadow-sm transition-all duration-200"
                          style={{ 
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.border
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold mb-1 truncate" style={{ color: colors.textPrimary }}>
                                {assignment.project.projectName}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="font-mono" style={{ color: colors.textMuted }}>
                                  {assignment.project.projectCode}
                                </span>
                                <span style={{ color: colors.border }}>•</span>
                                <span style={{ color: colors.textSecondary }}>
                                  {assignment.trade.trade}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Single status is shown at labour-level only; omit per-assignment status badge */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Building2 className="w-12 h-12 mb-3" style={{ color: colors.textMuted }} />
                      <h4 className="text-base font-semibold mb-1" style={{ color: colors.textPrimary }}>
                        No Project Assignments
                      </h4>
                      <p className="text-xs text-center max-w-sm" style={{ color: colors.textSecondary }}>
                        This labour is not currently assigned to any projects
                      </p>
                    </div>
                  )}
                </Card>
                
                {/* History Tabs */}
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <div className="mb-4">
                    <div className="flex space-x-1" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <button
                        onClick={() => setHistoryTab('movement')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === 'movement' ? 'border-current' : 'border-transparent'}`}
                        onMouseEnter={(e) => { if (historyTab !== 'movement') { e.currentTarget.style.borderColor = colors.borderLight; } }}
                        onMouseLeave={(e) => { if (historyTab !== 'movement') { e.currentTarget.style.borderColor = 'transparent'; } }}
                        style={{ color: historyTab === 'movement' ? colors.primary : colors.textSecondary, borderBottomColor: historyTab === 'movement' ? colors.primary : 'transparent' }}
                      >
                        Movement History
                      </button>
                      <button
                        onClick={() => setHistoryTab('leave')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === 'leave' ? 'border-current' : 'border-transparent'}`}
                        onMouseEnter={(e) => { if (historyTab !== 'leave') { e.currentTarget.style.borderColor = colors.borderLight; } }}
                        onMouseLeave={(e) => { if (historyTab !== 'leave') { e.currentTarget.style.borderColor = 'transparent'; } }}
                        style={{ color: historyTab === 'leave' ? colors.primary : colors.textSecondary, borderBottomColor: historyTab === 'leave' ? colors.primary : 'transparent' }}
                      >
                        Leave History
                      </button>
                    </div>
                  </div>

                  {historyTab === 'movement' ? (
                    loadingHistory ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: colors.primary }}></div>
                      </div>
                    ) : movementHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${colors.borderLight}` }}>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Date</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>From</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>To</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {movementHistory.map((history) => (
                              <tr key={history.id} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: colors.borderLight }}>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3" style={{ color: colors.textMuted }} />
                                    <span className="text-sm font-mono" style={{ color: colors.textPrimary }}>
                                      {new Date(history.movementDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="text-xs" style={{ color: colors.textMuted }}>
                                    {new Date(history.movementDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {history.fromProjectName ? (
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <Building2 className="w-3 h-3" style={{ color: colors.textMuted }} />
                                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                          {history.fromProjectName}
                                        </span>
                                      </div>
                                      {history.fromTradeName && (
                                        <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textSecondary }}>
                                          {history.fromTradeName}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs" style={{ color: colors.textMuted }}>Initial Assignment</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Building2 className="w-3 h-3" style={{ color: colors.primary }} />
                                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                        {history.toProjectName}
                                      </span>
                                    </div>
                                    <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                                      {history.toTradeName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                                    {history.notes || '-'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm" style={{ color: colors.textSecondary }}>
                        No movement history found
                      </div>
                    )
                  ) : (
                    loadingLeaveHistory ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: colors.primary }}></div>
                      </div>
                    ) : leaveHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${colors.borderLight}` }}>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Start</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>End</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Returned</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaveHistory.map((entry) => (
                              <tr key={entry.id} className="border-b" style={{ borderColor: colors.borderLight }}>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3" style={{ color: colors.textMuted }} />
                                    <span style={{ color: colors.textPrimary }}>
                                      {new Date(entry.leaveStartDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span style={{ color: colors.textPrimary }}>
                                    {new Date(entry.leaveEndDate).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-1 text-xs rounded-full whitespace-nowrap inline-block" style={{ backgroundColor: entry.isReturned ? colors.success : colors.warning, color: '#FFFFFF' }}>
                                    {entry.isReturned ? (entry.returnDate ? `Returned ${new Date(entry.returnDate).toLocaleDateString()}` : 'Returned') : 'On Leave'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span style={{ color: colors.textSecondary }}>
                                    {entry.notes || '-'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm" style={{ color: colors.textSecondary }}>
                        No leave history found
                      </div>
                    )
                  )}
                </Card>
              </div>
            </div>
          </div>
          </>
        ) : (
          <>
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

            {/* Trades Section */}
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
                        monthlyBaseRate: undefined,
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

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Monthly Rate
                      </label>
                      <Input
                        type="number"
                        value={formData.monthlyBaseRate || ''}
                        onChange={(e) => setFormData({ ...formData, monthlyBaseRate: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="e.g., 5000"
                        min="0"
                        step="0.01"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          borderColor: 'rgba(229, 231, 235, 0.1)',
                          color: colors.textPrimary
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                        Monthly salary/rate for this labour
                      </p>
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
                  onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'onLeave')}
                  className="px-4 py-2 border rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="onLeave">On Leave</option>
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
                          <span style={{ color: colors.textPrimary }}>
                            {labour.isUtilized ? '100%' : '0%'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {labour.projectLabours && labour.projectLabours.length > 0 ? (
                            <div className="space-y-1">
                              {labour.projectLabours.slice(0, 2).map((assignment) => (
                                <div key={assignment.id} className="text-sm">
                                  <span style={{ color: colors.textPrimary }}>{assignment.project.projectCode}</span>
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
                          <span
                            className="px-2 py-1 text-xs rounded-full whitespace-nowrap inline-block"
                            style={{
                              backgroundColor: !labour.isActive ? colors.error :
                                             isOnLeave(labour) ? colors.warning : colors.success,
                              color: '#FFFFFF'
                            }}
                          >
                            {!labour.isActive ? 'Inactive' :
                             isOnLeave(labour) ? 'On Leave' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              onClick={() => setViewingLabour(labour)}
                              variant="ghost"
                              size="sm"
                              className="p-1"
                              style={{ color: colors.info }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {labour.projectLabours && labour.projectLabours.length > 0 && (
                              <Button
                                onClick={() => handleOpenMoveModal(labour)}
                                variant="ghost"
                                size="sm"
                                className="p-1"
                                style={{ color: colors.info }}
                                title="Move to another project"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}
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
          </>
        )}
      {/* Modals - Available in both views */}
      {/* Move Labour Modal */}
      {showMoveModal && movingLabour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Move Labour to Another Project
                </h2>
                <Button
                  onClick={() => {
                    setShowMoveModal(false);
                    setMovingLabour(null);
                    setSelectedProjectId(null);
                    setSelectedTradeId(null);
                    setAvailableTrades([]);
                      setMoveNotes('');
                      setMoveDate('');
                      setMoveErrorMessage('');
                    }}
                    variant="ghost"
                    className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" style={{ color: colors.primary }} />
                  <span className="font-medium" style={{ color: colors.textPrimary }}>
                    {movingLabour.labourName}
                  </span>
                  {movingLabour.employeeNumber && (
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      (#{movingLabour.employeeNumber})
                    </span>
                  )}
                </div>
                {movingLabour.projectLabours && movingLabour.projectLabours.length > 0 && (
                  <div className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                    Current: {movingLabour.projectLabours[0].project.projectName} - {movingLabour.projectLabours[0].trade.trade}
                  </div>
                )}
              </div>
              
              {moveErrorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                  {moveErrorMessage}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Target Project *
                  </label>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => {
                      const projectId = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedProjectId(projectId);
                      setSelectedTradeId(null); // Reset trade when project changes
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="">Select a project...</option>
                    {projects
                      .filter(p => !movingLabour.projectLabours?.some(pl => pl.project.id === p.id))
                      .map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.projectCode} - {project.projectName}
                        </option>
                      ))}
                  </select>
                </div>
                
                {selectedProjectId && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                      Target Trade *
                    </label>
                    {availableTrades.length === 0 ? (
                      <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textMuted }}>
                        No trades available for this project. Please add trades to the project first.
                      </div>
                    ) : (
                      <select
                        value={selectedTradeId || ''}
                        onChange={(e) => setSelectedTradeId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          borderColor: colors.border,
                          color: colors.textPrimary
                        }}
                      >
                        <option value="">Select a trade...</option>
                        {availableTrades.map((trade) => (
                          <option key={trade.id} value={trade.id}>
                            {trade.trade}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                      Movement Date *
                    </label>
                    <Input
                      type="date"
                      value={moveDate}
                      onChange={(e) => setMoveDate(e.target.value)}
                      required
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                      Date when the movement occurred
                    </p>
                  </div>
                  
                  <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder="Additional notes about this movement..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowMoveModal(false);
                      setMovingLabour(null);
                      setSelectedProjectId(null);
                      setSelectedTradeId(null);
                      setAvailableTrades([]);
                      setMoveNotes('');
                      setMoveErrorMessage('');
                    }}
                    variant="ghost"
                    disabled={isMoving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMoveLabour}
                    disabled={isMoving || !selectedProjectId || !selectedTradeId || !moveDate}
                    style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                    className="flex items-center space-x-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>{isMoving ? 'Moving...' : 'Move Labour'}</span>
                  </Button>
                </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

      {/* Vacation Modal */}
      {showVacationModal && viewingLabour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-md"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Leave Days Management
                </h2>
                <Button
                  onClick={() => setShowVacationModal(false)}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={vacationStartDate}
                    onChange={(e) => setVacationStartDate(e.target.value)}
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={vacationEndDate}
                    onChange={(e) => setVacationEndDate(e.target.value)}
                    disabled={markAsReturned}
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      opacity: markAsReturned ? 0.6 : 1
                    }}
                  />
                </div>

                {viewingLabour.vacationStartDate && (
                  <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={markAsReturned}
                        onChange={(e) => {
                          setMarkAsReturned(e.target.checked);
                          if (!e.target.checked) {
                            setReturnDate('');
                          }
                        }}
                        className="w-4 h-4 rounded border"
                        style={{
                          borderColor: markAsReturned ? colors.primary : colors.border,
                          backgroundColor: markAsReturned ? colors.primary : 'transparent',
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Mark as Returned from Leave
                      </span>
                    </label>

                    {markAsReturned && (
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                          Return Date *
                        </label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          required={markAsReturned}
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.border,
                            color: colors.textPrimary
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                          This date will be saved to history and used as the end date
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => setShowVacationModal(false)}
                    variant="ghost"
                    disabled={updatingVacation}
                  >
                    Cancel
                  </Button>
                  {viewingLabour.vacationStartDate && (
                    <Button
                      onClick={handleClearVacation}
                      variant="ghost"
                      disabled={updatingVacation}
                      style={{ color: colors.error }}
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveVacation}
                    disabled={updatingVacation || !vacationStartDate || (!markAsReturned && !vacationEndDate) || (markAsReturned && !returnDate)}
                    style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                  >
                    {updatingVacation ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Detailed History Modal */}
      {showHistoryModal && viewingLabour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Assignment History - {viewingLabour.labourName}
              </h2>
              <Button
                onClick={() => setShowHistoryModal(false)}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: colors.primary }}></div>
                </div>
              ) : movementHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.border }}>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>From</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>To</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>Moved By</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textPrimary }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movementHistory.map((history) => (
                        <tr key={history.id} className="border-b" style={{ borderColor: colors.border }}>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              history.type === 'assignment' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {history.type === 'assignment' ? 'Assignment' : 'Movement'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {history.fromProjectName ? (
                              <div>
                                <div style={{ color: colors.textPrimary }}>{history.fromProjectName}</div>
                                {history.fromTradeName && (
                                  <div className="text-xs" style={{ color: colors.textMuted }}>{history.fromTradeName}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: colors.textMuted }}>N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div style={{ color: colors.textPrimary }}>{history.toProjectName}</div>
                            <div className="text-xs" style={{ color: colors.textMuted }}>{history.toTradeName}</div>
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {new Date(history.movementDate).toLocaleDateString()}
                            <div className="text-xs" style={{ color: colors.textMuted }}>
                              {new Date(history.movementDate).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {history.movedBy || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {history.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    No assignment history available
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


