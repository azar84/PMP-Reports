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
import PositionSelectorModal from './PositionSelectorModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Users, 
  Search,
  X,
  Mail,
  Phone,
  Briefcase,
  Crown,
  UserCheck,
  UserX,
  CheckCircle,
  Users2,
  UserPlus,
  AlertCircle
} from 'lucide-react';

interface ProjectStaffDetails {
  id: number;
  utilization: number;
  status: string;
  project: {
    id: number;
    projectName: string;
    projectCode: string;
  };
  position: {
    id: number;
    designation: string;
    requiredUtilization: number;
  };
}

interface Staff {
  id: number;
  staffName: string;
  employeeNumber?: string;
  email?: string;
  phone?: string;
  position?: {
    id: number;
    name: string;
    description?: string;
  };
  positionId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalUtilization?: number; // Total utilization across all projects
  remainingCapacity?: number; // Remaining capacity (100% - totalUtilization)
  projectStaff?: ProjectStaffDetails[]; // Current assignments
}

interface ProjectStaffAssignment {
  id: number;
  projectId: number;
  positionId: number;
  staffId: number | null;
  utilization: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  staff: Staff | null;
  position?: ProjectPosition; // Make optional to handle cases where it might not be loaded
}

interface ProjectPosition {
  id: number;
  projectId: number;
  designation: string;
  requiredUtilization: number;
  monthlyRate?: number; // Monthly rate from positions table
  createdAt: string;
  updatedAt: string;
  staffAssignments: ProjectStaffAssignment[];
}

interface Position {
  id: number;
  name: string;
  description?: string;
  monthlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStaffProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

export default function ProjectStaff({ projectId, projectName, projectStartDate, projectEndDate }: ProjectStaffProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [projectPositions, setProjectPositions] = useState<ProjectPosition[]>([]);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'existing' | 'new'>('existing');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [showPositionDropdownInModal, setShowPositionDropdownInModal] = useState(false);
  const [positionSearchTermInModal, setPositionSearchTermInModal] = useState('');

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    staffName: '',
    employeeNumber: '',
    email: '',
    phone: '',
    positionId: undefined,
    isActive: true,
  });

  const [editingData, setEditingData] = useState<Partial<Staff & { positionId?: number }>>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string>('');

  // Position modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [assigningToPosition, setAssigningToPosition] = useState<number | null>(null);
  const [editingStaffAssignment, setEditingStaffAssignment] = useState<ProjectStaffAssignment | null>(null);
  const [editingPosition, setEditingPosition] = useState<ProjectPosition | null>(null);
  const [editUseFullDuration, setEditUseFullDuration] = useState(false);
  const [editUseProjectStartDate, setEditUseProjectStartDate] = useState(false);
  const [editUseProjectEndDate, setEditUseProjectEndDate] = useState(false);
  const [editDateValidationError, setEditDateValidationError] = useState<string>('');
  
  // Assignment date selection state
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState<{ staffId: number; positionId: number } | null>(null);
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
  const [assignmentEndDate, setAssignmentEndDate] = useState('');
  const [useProjectStartDate, setUseProjectStartDate] = useState(true);
  const [useProjectEndDate, setUseProjectEndDate] = useState(true);
  
  // Add new staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffData, setNewStaffData] = useState<Partial<Staff & { positionId?: number }>>({
    staffName: '',
    employeeNumber: '',
    email: '',
    phone: '',
    positionId: undefined,
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
    fetchProjectPositions();
    fetchCompanyPositions();
  }, [projectId]);

  const fetchCompanyPositions = async () => {
    try {
      const response = await get<{ success: boolean; data: Position[] }>('/api/admin/positions');
      if (response.success) {
        setCompanyPositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching company positions:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Staff[] }>('/api/admin/company-staff');
      if (response.success) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectPositions = async () => {
    try {
      const response = await get<{ success: boolean; data: ProjectPosition[] }>(`/api/admin/project-staff?projectId=${projectId}`);
      if (response.success) {
        console.log('Fetched project positions:', response.data);
        // Log assignment dates for debugging
        response.data.forEach(position => {
          position.staffAssignments?.forEach(assignment => {
            console.log(`Assignment ${assignment.id}: startDate=${assignment.startDate}, endDate=${assignment.endDate}`);
          });
        });
        setProjectPositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching project positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelectForAssignment = (positionId: number, staffId: number) => {
    setSelectedStaffForAssignment({ staffId, positionId });
    setUseProjectStartDate(true);
    setUseProjectEndDate(true);
    // Initialize with formatted project dates
    const formattedStart = formatDateForInput(projectStartDate) || '';
    const formattedEnd = formatDateForInput(projectEndDate) || '';
    setAssignmentStartDate(formattedStart);
    setAssignmentEndDate(formattedEnd);
    setDateValidationError('');
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

  const handleAssignStaffToPosition = async () => {
    if (!selectedStaffForAssignment) return;
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Find the staff member to get their remaining capacity
      const staffMember = staff.find(s => s.id === selectedStaffForAssignment.staffId);
      if (!staffMember) {
        throw new Error('Staff member not found');
      }

      // Use remaining capacity or default to 100% if not calculated
      const utilizationToAssign = staffMember.remainingCapacity || 100;

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
      
      console.log('Assigning staff with dates:', { 
        startDate, 
        endDate, 
        projectStartDate, 
        projectEndDate, 
        useProjectStartDate,
        useProjectEndDate,
        assignmentStartDate,
        assignmentEndDate
      });

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', {
        positionId: selectedStaffForAssignment.positionId,
        staffId: selectedStaffForAssignment.staffId,
        utilization: utilizationToAssign,
        startDate: startDate,
        endDate: endDate,
        status: 'Active',
        notes: null,
      });
      
      if (response.success) {
        console.log('Staff assignment created:', response.data);
        // Clear the assignment state first
        setSelectedStaffForAssignment(null);
        setAssignmentStartDate('');
        setAssignmentEndDate('');
        setUseProjectStartDate(true);
        setUseProjectEndDate(true);
        // Then refresh data
        await fetchStaff(); // Refresh staff list to update utilization
        await fetchProjectPositions(); // Refresh project positions to show updated dates
        setErrorMessage('');
        setShowAddModal(false); // Close modal on success
        setAssigningToPosition(null); // Reset position
      } else {
        throw new Error('Failed to assign staff to position');
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      setErrorMessage('Error assigning staff to position. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePositionSelect = async (position: Position) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', {
        projectId: projectId,
        designation: position.name,
        requiredUtilization: 100, // Default to 100%
      });

      if (response.success) {
        await fetchProjectPositions(); // Refresh project positions
        setErrorMessage('');
        setShowPositionModal(false); // Close modal on success
        setSelectedPosition(null); // Reset position
      } else {
        throw new Error('Failed to add position to project');
      }
    } catch (error) {
      console.error('Error adding position:', error);
      setErrorMessage('Error adding position to project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaffAssignment = async () => {
    if (!editingStaffAssignment) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Determine the actual dates to send based on checkbox states
      // If already in YYYY-MM-DD format, use directly; otherwise format
      let startDate = '';
      if (editUseProjectStartDate) {
        startDate = formatDateForInput(projectStartDate) || '';
      } else {
        const startValue = editingStaffAssignment.startDate;
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
        const endValue = editingStaffAssignment.endDate;
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
      
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${editingStaffAssignment.id}`, {
        utilization: editingStaffAssignment.utilization,
        startDate: startDate,
        endDate: endDate,
        status: editingStaffAssignment.status,
        notes: editingStaffAssignment.notes,
      });

      if (response.success) {
        await fetchProjectPositions(); // Refresh project positions
        setEditingStaffAssignment(null);
        setEditUseFullDuration(false);
        setEditUseProjectStartDate(false);
        setEditUseProjectEndDate(false);
        setEditDateValidationError('');
        setErrorMessage('');
      } else {
        throw new Error('Failed to update staff assignment');
      }
    } catch (error) {
      console.error('Error updating staff assignment:', error);
      setErrorMessage('Error updating staff assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-positions/${editingPosition.id}`, {
        requiredUtilization: editingPosition.requiredUtilization,
      });

      if (response.success) {
        await fetchProjectPositions(); // Refresh project positions
        setEditingPosition(null);
        setErrorMessage('');
      } else {
        throw new Error('Failed to update position');
      }
    } catch (error) {
      console.error('Error updating position:', error);
      setErrorMessage('Error updating position. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignStaff = async (staffAssignmentId: number) => {
    if (confirm('Are you sure you want to unassign staff from this position?')) {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const response = await del<{ success: boolean }>(`/api/admin/project-staff/${staffAssignmentId}`);
        
        if (response.success) {
          await fetchStaff(); // Refresh staff list to update utilization
          await fetchProjectPositions(); // Refresh project positions
          setErrorMessage('');
        } else {
          throw new Error('Failed to unassign staff');
        }
      } catch (error) {
        console.error('Error unassigning staff:', error);
        setErrorMessage('Error unassigning staff. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (confirm('Are you sure you want to delete this position and all its staff assignments?')) {
      try {
        // First delete all staff assignments for this position
        const position = projectPositions.find(p => p.id === positionId);
        if (position) {
          for (const assignment of position.staffAssignments) {
            await del(`/api/admin/project-staff/${assignment.id}`);
          }
        }
        
        // Then delete the position itself
        const response = await del(`/api/admin/project-positions/${positionId}`) as { success: boolean };
        
        if (response.success) {
          await fetchProjectPositions();
        }
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const handleAddNewStaff = async () => {
    if (!newStaffData.staffName?.trim()) {
      setErrorMessage('Staff name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Get the position name from the selected positionId
      const selectedPosition = companyPositions.find(p => p.id === newStaffData.positionId);
      
      const staffPayload = {
        ...newStaffData,
        position: selectedPosition?.name || '',
      };
      
      // Remove positionId from the payload since the API expects position as string
      const { positionId, ...payloadWithoutPositionId } = staffPayload;
      const finalPayload = payloadWithoutPositionId;

      const response = await post<{ success: boolean; data: Staff }>('/api/admin/company-staff', finalPayload);
      if (response.success) {
        await fetchStaff(); // Refresh staff list
        setNewStaffData({
          staffName: '',
          employeeNumber: '',
          email: '',
          phone: '',
          positionId: undefined,
          isActive: true,
        });
        setShowPositionDropdownInModal(false);
        setPositionSearchTermInModal('');
        setShowAddStaffModal(false);
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error('Error creating staff:', error);
      setErrorMessage(error.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get position name
  const getPositionName = (member: Staff): string => {
    if (typeof member.position === 'string') {
      return member.position;
    }
    if (member.position && typeof member.position === 'object' && member.position.name) {
      return member.position.name;
    }
    return '';
  };

  // Use company positions for filter dropdown
  const filteredStaff = staff
    .filter(member => member.isActive === true) // Only show active staff
    .filter(member =>
    member.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getPositionName(member).toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(member => {
    // Apply position filter if set
    if (positionFilter && getPositionName(member) && !getPositionName(member).toLowerCase().includes(positionFilter.toLowerCase())) {
      return false;
    }
    // Filter out staff who are already assigned to this project
    return !projectPositions.some(position => 
      position.staffAssignments.some(assignment => assignment.staffId === member.id)
    );
  });

  // Calculate project-specific statistics
  const calculateProjectStatistics = () => {
    const allAssignments = projectPositions.flatMap(position => position.staffAssignments || []);
    
    // Calculate required staff (sum of requiredUtilization divided by 100)
    const requiredStaff = projectPositions.reduce((sum, position) => {
      return sum + (position.requiredUtilization / 100);
    }, 0);
    
    // Calculate assigned staff (sum of assigned utilization divided by 100)
    const assignedStaff = allAssignments.reduce((sum, assignment) => {
      return sum + (assignment.utilization / 100);
    }, 0);
    
    // Calculate involved staff (unique staff working on this project)
    const involvedStaffIds = new Set(allAssignments.map(assignment => assignment.staffId));
    const involvedStaff = involvedStaffIds.size;
    
    // Calculate expected monthly cost using actual position rates from database
    const expectedMonthlyCost = projectPositions.reduce((sum, position) => {
      // Use the monthlyRate from the position if available, otherwise fallback to designation-based lookup
      const positionSalary = position.monthlyRate || getFallbackSalary(position.designation);
      const utilizationFactor = position.requiredUtilization / 100;
      return sum + (positionSalary * utilizationFactor);
    }, 0);
    
    const balanceStaff = requiredStaff - assignedStaff;

    return {
      requiredStaff: Math.round(requiredStaff * 100) / 100,
      assignedStaff: Math.round(assignedStaff * 100) / 100,
      balanceStaff: Math.round(balanceStaff * 100) / 100,
      involvedStaff,
      expectedMonthlyCost: Math.round(expectedMonthlyCost)
    };
  };

  // Fallback salary calculation for positions without monthlyRate
  const getFallbackSalary = (designation: string) => {
    const designationLower = designation.toLowerCase();
    if (designationLower.includes('director') || designationLower.includes('manager')) {
      return 15000; // 15,000/month for directors/managers
      } else if (designationLower.includes('senior') || designationLower.includes('lead')) {
        return 12000; // 12,000/month for senior/lead positions
      } else if (designationLower.includes('engineer') || designationLower.includes('architect')) {
        return 10000; // 10,000/month for engineers/architects
      } else if (designationLower.includes('technician')) {
        return 7000; // 7,000/month for technicians
      } else if (designationLower.includes('assistant') || designationLower.includes('coordinator')) {
        return 5000; // 5,000/month for assistants/coordinators
      } else {
        return 8000; // 8,000/month default
    }
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
            Project Staff
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage staff assignments for {projectName}
          </p>
        </div>
        <Button
          onClick={() => setShowPositionModal(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Button>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <Users2 className="w-6 h-6" style={{ color: colors.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Required Staff
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.requiredStaff}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6" style={{ color: colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Assigned Staff
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.assignedStaff}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" style={{ color: stats.balanceStaff >= 0 ? colors.error : colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Balance Staff
              </p>
              <p className="text-2xl font-bold" style={{ color: stats.balanceStaff >= 0 ? colors.error : colors.success }}>
                {stats.balanceStaff}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {stats.balanceStaff >= 0 ? 'Understaffed' : 'Overstaffed'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6" style={{ color: colors.info }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Involved Staff
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {stats.involvedStaff}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Unique staff
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

      {/* Current Project Staff */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Current Project Staff
          </h3>
        </div>
        
        {projectPositions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Position</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Assigned Staff</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Utilization</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Position Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Duration</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Start Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>End Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectPositions.map((position) => {
                  const totalUtilization = position.staffAssignments.reduce((sum, assignment) => sum + assignment.utilization, 0);
                  const remainingNeeded = Math.max(0, position.requiredUtilization - totalUtilization);
                  const isComplete = totalUtilization >= position.requiredUtilization;

                  return (
                    <React.Fragment key={position.id}>
                      {/* Position Header Row */}
                      <tr className="border-b" style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}>
                        <td className="py-3 px-4" colSpan={8}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span className="font-medium" style={{ color: colors.textPrimary }}>
                                {position.designation}
                              </span>
                              {position.designation === 'Project Director' && (
                                <Crown className="w-4 h-4" style={{ color: colors.warning }} />
                              )}
                              {position.designation === 'Project Manager' && (
                                <UserCheck className="w-4 h-4" style={{ color: colors.success }} />
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={`text-sm font-medium ${
                                    isComplete ? 'text-green-600' : 'text-orange-600'
                                  }`}
                                >
                                  {isComplete 
                                    ? `Complete (${totalUtilization}/${position.requiredUtilization}%)` 
                                    : `${remainingNeeded}% needed`
                                  }
                                </span>
                                {!isComplete && (
                                  <Button
                                    onClick={() => {
                                      setAssigningToPosition(position.id);
                                      setShowAddModal(true);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1"
                                    title={`Add staff to ${position.designation}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => setEditingPosition(position)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                  title={`Edit ${position.designation} requirements`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeletePosition(position.id)}
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
                      
                      {/* Staff Assignment Rows */}
                      {position.staffAssignments.length > 0 ? (
                        position.staffAssignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b" style={{ borderColor: colors.border }}>
                            <td className="py-3 px-4 pl-8">
                              <span style={{ color: colors.textSecondary }}>Staff Assignment</span>
                            </td>
                            <td className="py-3 px-4">
                              {assignment.staff ? (
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                                  <div>
                                    <p className="font-medium" style={{ color: colors.textPrimary }}>{assignment.staff.staffName}</p>
                                    {assignment.staff.email && (
                                      <div className="flex items-center space-x-1 text-xs" style={{ color: colors.textSecondary }}>
                                        <Mail className="w-3 h-3" />
                                        <span>{assignment.staff.email}</span>
                                      </div>
                                    )}
                                    {assignment.staff.phone && (
                                      <div className="flex items-center space-x-1 text-xs" style={{ color: colors.textSecondary }}>
                                        <Phone className="w-3 h-3" />
                                        <span>{assignment.staff.phone}</span>
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
                              <span style={{ color: colors.textPrimary }}>{assignment.utilization}%</span>
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
                              <span 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  assignment.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                  assignment.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {assignment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {assignment.staff ? (
                                  <>
                                    <Button
                                      onClick={() => handleUnassignStaff(assignment.id)}
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
                                      setAssigningToPosition(position.id);
                                      setShowAddModal(true);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="p-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  onClick={() => {
                                    try {
                                      // Find the position for this assignment
                                      const position = projectPositions.find(p => p.id === assignment.positionId);
                                      if (!position) {
                                        console.error('Position not found for assignment:', assignment);
                                        return;
                                      }
                                      
                                      // Normalize dates to YYYY-MM-DD strings to avoid timezone issues
                                      const normalizedStartDate = formatDateForInput(assignment.startDate);
                                      const normalizedEndDate = formatDateForInput(assignment.endDate);
                                      
                                      setEditingStaffAssignment({
                                        ...assignment,
                                        position: position,
                                        startDate: normalizedStartDate || null,
                                        endDate: normalizedEndDate || null
                                      });
                                      setEditUseFullDuration(false);
                                      // Initialize checkbox states based on current assignment dates
                                      const projectStart = formatDateForInput(projectStartDate);
                                      const projectEnd = formatDateForInput(projectEndDate);
                      setEditUseProjectStartDate(normalizedStartDate === projectStart && normalizedStartDate !== '');
                      setEditUseProjectEndDate(normalizedEndDate === projectEnd && normalizedEndDate !== '');
                      // Validate dates when opening edit form
                      const validationError = validateDates(normalizedStartDate, normalizedEndDate, true);
                      setEditDateValidationError(validationError);
                                    } catch (error) {
                                      console.error('Error setting editing staff assignment:', error);
                                    }
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                  title={`Edit ${assignment.staff?.staffName || 'staff'} utilization`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b" style={{ borderColor: colors.border }}>
                          <td className="py-3 px-4 pl-8" colSpan={8}>
                            <div className="flex items-center space-x-2">
                              <UserX className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span style={{ color: colors.textSecondary }}>No staff assigned</span>
                              <Button
                                onClick={() => {
                                  setAssigningToPosition(position.id);
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
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No staff assigned yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Add positions and assign staff to get started. You can assign multiple staff to the same position.
            </p>
            <Button
              onClick={() => setShowPositionModal(true)}
              variant="primary"
              className="flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Position</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  Assign Staff to Position
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Select a staff member to assign to: <span className="font-medium" style={{ color: colors.textPrimary }}>
                    {projectPositions.find(p => p.id === assigningToPosition)?.designation}
                  </span>
                  <br />
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    Only staff not already assigned to this project are shown
                  </span>
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setAssigningToPosition(null);
                  setSearchTerm('');
                  setPositionFilter('');
                  setSelectedStaffForAssignment(null);
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
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  >
                    <option value="">All Positions</option>
                    {companyPositions.filter(p => p.isActive).map((position) => (
                      <option key={position.id} value={position.name}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add New Staff Button */}
              <div className="mb-6">
                <Button
                  onClick={() => {
                    setShowAddStaffModal(true);
                    setNewStaffData({
                      staffName: '',
                      employeeNumber: '',
                      email: '',
                      phone: '',
                      position: '',
                      isActive: true,
                    });
                    setErrorMessage('');
                  }}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Staff Member</span>
                </Button>
              </div>

              {!selectedStaffForAssignment ? (
                <>
                  {/* Staff List */}
                  <div className="space-y-2">
                    {filteredStaff.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.borderLight
                    }}
                    onClick={() => {
                      if (assigningToPosition) {
                        handleStaffSelectForAssignment(assigningToPosition, member.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5" style={{ color: colors.textMuted }} />
                        <div>
                          <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                            {member.staffName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textSecondary }}>
                            {getPositionName(member) && (
                              <span>{getPositionName(member)}</span>
                            )}
                            {member.email && (
                              <span>{member.email}</span>
                            )}
                            {member.phone && (
                              <span>{member.phone}</span>
                            )}
                          </div>
                          {/* Utilization Information */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs" style={{ color: colors.textMuted }}>
                              Total Utilization: {member.totalUtilization || 0}%
                            </span>
                            <span className="text-xs" style={{ color: colors.textMuted }}>
                              Remaining: {member.remainingCapacity || 100}%
                            </span>
                            {member.remainingCapacity && member.remainingCapacity < 100 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                                {member.remainingCapacity}% available
                              </span>
                            )}
                          </div>
                          
                          {/* Show Current Projects */}
                          {member.projectStaff && member.projectStaff.length > 0 && (
                            <div className="mt-2 pt-2 border-t" style={{ borderColor: colors.borderLight }}>
                              <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
                                Currently Assigned To:
                              </p>
                              <div className="space-y-1">
                                {member.projectStaff.map((assignment) => (
                                  <div key={assignment.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <Briefcase className="w-3 h-3" style={{ color: colors.textMuted }} />
                                      <span style={{ color: colors.textPrimary }}>{assignment.project.projectName}</span>
                                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.textSecondary 
                                      }}>
                                        {assignment.position.designation}
                                      </span>
                                    </div>
                                    <span className="font-medium" style={{ color: colors.primary }}>
                                      {assignment.utilization}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center space-x-1"
                          disabled={!member.remainingCapacity || member.remainingCapacity <= 0}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>
                            {member.remainingCapacity && member.remainingCapacity > 0 
                              ? `Assign (${member.remainingCapacity}%)` 
                              : 'Fully Utilized'
                            }
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStaff.length === 0 && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    {searchTerm ? 'No staff found' : 'No staff available'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                    {searchTerm ? 'Try adjusting your search terms' : 'All available staff are already assigned to this project'}
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
                        <User className="w-5 h-5" style={{ color: colors.primary }} />
                        <div>
                          <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                            {staff.find(s => s.id === selectedStaffForAssignment?.staffId)?.staffName}
                          </h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            Position: {projectPositions.find(p => p.id === selectedStaffForAssignment?.positionId)?.designation}
                          </p>
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
                              id="useProjectStartDate"
                              checked={useProjectStartDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUseProjectStartDate(checked);
                                if (checked) {
                                  // When checking, set to formatted project start date
                                  setAssignmentStartDate(formatDateForInput(projectStartDate) || '');
                                }
                                // When unchecking, keep the current assignmentStartDate value (don't reset it)
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="useProjectStartDate"
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
                              id="useProjectEndDate"
                              checked={useProjectEndDate}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUseProjectEndDate(checked);
                                if (checked) {
                                  // When checking, set to formatted project end date
                                  setAssignmentEndDate(formatDateForInput(projectEndDate) || '');
                                }
                                // When unchecking, keep the current assignmentEndDate value (don't reset it)
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="useProjectEndDate"
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
                          setSelectedStaffForAssignment(null);
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
                        onClick={handleAssignStaffToPosition}
                        variant="primary"
                        disabled={isSubmitting || (!useProjectStartDate && !assignmentStartDate) || (!useProjectEndDate && !assignmentEndDate) || !!dateValidationError}
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

      {/* Position Edit Modal */}
      {false && editingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                Edit Position Assignment
              </h2>
              <Button
                onClick={() => {
                  setEditingPosition(null);
                  setEditUseFullDuration(false);
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
                    Position Designation
                  </label>
                  <div
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ 
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textSecondary,
                      borderColor: colors.borderLight
                    }}
                  >
                    {editingPosition.designation}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Position names are managed company-wide and cannot be changed here
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Utilization % (for this project)
                  </label>
                  <input
                    type="number"
                    value={editingPosition.utilization || 0}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, utilization: parseInt(e.target.value) || 0 } : null)}
                    min="0"
                    max=""
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Individual utilization for this project (can exceed 100%)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Status
                  </label>
                  <select
                    value={editingPosition.status || 'Active'}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Full Duration Group */}
                <div className="md:col-span-2">
                  <div 
                    className="p-4 border rounded-lg"
                    style={{ 
                      borderColor: colors.borderLight,
                      backgroundColor: editUseFullDuration ? colors.backgroundSecondary : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="editUseFullDuration"
                        checked={editUseFullDuration}
                        onChange={(e) => {
                          const useFullDuration = e.target.checked;
                          setEditUseFullDuration(useFullDuration);
                          if (useFullDuration) {
                            setEditingPosition(prev => prev ? {
                              ...prev,
                              startDate: projectStartDate || '',
                              endDate: projectEndDate || ''
                            } : null);
                          }
                        }}
                        className="w-4 h-4 rounded border-2"
                        style={{ 
                          accentColor: colors.primary,
                          borderColor: colors.borderStrong,
                          backgroundColor: editUseFullDuration ? colors.primary : 'transparent'
                        }}
                      />
                      <label htmlFor="editUseFullDuration" className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Use Full Project Duration
                      </label>
                    </div>
                    <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
                      Automatically set start and end dates to match project duration
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editingPosition.startDate || ''}
                          onChange={(e) => setEditingPosition(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                          disabled={editUseFullDuration}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          style={{ 
                            backgroundColor: editUseFullDuration ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: colors.textPrimary,
                            borderColor: colors.border
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={editingPosition.endDate || ''}
                          onChange={(e) => setEditingPosition(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                          disabled={editUseFullDuration}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          style={{ 
                            backgroundColor: editUseFullDuration ? colors.backgroundSecondary : colors.backgroundPrimary,
                            color: colors.textPrimary,
                            borderColor: colors.border
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Notes
                  </label>
                  <textarea
                    value={editingPosition.notes || ''}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Additional notes about this position..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ 
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditingPosition(null);
                    setEditUseFullDuration(false);
                    setErrorMessage('');
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-75 disabled:opacity-50"
                  style={{ 
                    color: colors.textSecondary,
                    borderColor: colors.border
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePosition}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-75 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Position Edit Modal */}
      {editingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: colors.border }}
            >
              <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Edit Position Requirements
              </h3>
              <button
                onClick={() => setEditingPosition(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Position
                </label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                    <span style={{ color: colors.textPrimary }}>
                      {editingPosition.designation}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Position names are managed company-wide and cannot be changed here
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Required Utilization %
                </label>
                <input
                  type="number"
                  onChange={(e) => setEditingPosition({
                    ...editingPosition,
                    requiredUtilization: parseInt(e.target.value) || 100
                  })}
                  value={editingPosition.requiredUtilization || 100}
                  min="0"
                  max="1000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.border
                  }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Total utilization required for this position (e.g., 200% means you need 2 staff members at 100% each)
                </p>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Current Status
                </h4>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  <p>Total assigned: {editingPosition.staffAssignments.reduce((sum, assignment) => sum + assignment.utilization, 0)}%</p>
                  <p>Required: {editingPosition.requiredUtilization}%</p>
                  <p>Remaining: {Math.max(0, editingPosition.requiredUtilization - editingPosition.staffAssignments.reduce((sum, assignment) => sum + assignment.utilization, 0))}%</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <Button
                onClick={() => setEditingPosition(null)}
                variant="ghost"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePosition}
                disabled={isSubmitting}
                style={{ backgroundColor: colors.primary }}
              >
                {isSubmitting ? 'Updating...' : 'Update Position'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Edit Modal */}
      {editingStaffAssignment && editingStaffAssignment.position && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: colors.border }}
            >
              <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                Edit Staff Assignment
              </h3>
              <button
                onClick={() => {
                  setEditingStaffAssignment(null);
                  setEditUseFullDuration(false);
                  setEditUseProjectStartDate(false);
                  setEditUseProjectEndDate(false);
                  setEditDateValidationError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Staff Member
                  </label>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textPrimary }}>
                        {editingStaffAssignment.staff?.staffName || 'Unassigned'}
                      </span>
                    </div>
                    {editingStaffAssignment.staff?.email && (
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                        {editingStaffAssignment.staff.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position
                  </label>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span style={{ color: colors.textPrimary }}>
                        {editingStaffAssignment.position?.designation || 'Unknown Position'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Utilization % (for this project)
                </label>
                <input
                  type="number"
                  onChange={(e) => setEditingStaffAssignment({
                    ...editingStaffAssignment,
                    utilization: parseInt(e.target.value) || 0
                  })}
                  value={editingStaffAssignment.utilization || 0}
                  min="0"
                  max="1000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.border
                  }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  How much of this staff member's time is allocated to this project
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Status
                </label>
                <select
                  onChange={(e) => setEditingStaffAssignment({
                    ...editingStaffAssignment,
                    status: e.target.value
                  })}
                  value={editingStaffAssignment.status || 'Active'}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.border
                  }}
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
                            id="editUseProjectStartDate"
                            checked={editUseProjectStartDate}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditUseProjectStartDate(checked);
                              if (checked) {
                                const newStartDate = formatDateForInput(projectStartDate) || '';
                                setEditingStaffAssignment({
                                  ...editingStaffAssignment,
                                  startDate: newStartDate || null
                                });
                                // Validate dates when checkbox changes
                                const currentEndDate = editUseProjectEndDate 
                                  ? (formatDateForInput(projectEndDate) || '') 
                                  : (editingStaffAssignment.endDate && typeof editingStaffAssignment.endDate === 'string' && editingStaffAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                    ? editingStaffAssignment.endDate.split('T')[0].split(' ')[0]
                                    : formatDateForInput(editingStaffAssignment.endDate) || '');
                                const validationError = validateDates(newStartDate, currentEndDate, true);
                                setEditDateValidationError(validationError);
                              }
                            }}
                            className="sr-only"
                          />
                          <label
                            htmlFor="editUseProjectStartDate"
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
                              setEditingStaffAssignment({
                                ...editingStaffAssignment,
                                startDate: newStartDate || null
                              });
                              // Validate dates when checkbox changes
                              const currentEndDate = editUseProjectEndDate 
                                ? (formatDateForInput(projectEndDate) || '') 
                                : (editingStaffAssignment.endDate && typeof editingStaffAssignment.endDate === 'string' && editingStaffAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                  ? editingStaffAssignment.endDate.split('T')[0].split(' ')[0]
                                  : formatDateForInput(editingStaffAssignment.endDate) || '');
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
                            setEditingStaffAssignment({
                              ...editingStaffAssignment,
                              startDate: selectedDate || null
                            });
                            // Validate dates in real-time
                            const currentEndDate = editUseProjectEndDate 
                              ? (formatDateForInput(projectEndDate) || '') 
                              : (editingStaffAssignment.endDate && typeof editingStaffAssignment.endDate === 'string' && editingStaffAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                                ? editingStaffAssignment.endDate.split('T')[0].split(' ')[0]
                                : formatDateForInput(editingStaffAssignment.endDate) || '');
                            const validationError = validateDates(selectedDate, currentEndDate, true);
                            setEditDateValidationError(validationError);
                          }
                        }}
                        value={editUseProjectStartDate 
                          ? (formatDateForInput(projectStartDate) || '') 
                          : (editingStaffAssignment.startDate && typeof editingStaffAssignment.startDate === 'string' && editingStaffAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                            ? editingStaffAssignment.startDate.split('T')[0].split(' ')[0]
                            : formatDateForInput(editingStaffAssignment.startDate) || '')}
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
                            id="editUseProjectEndDate"
                            checked={editUseProjectEndDate}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditUseProjectEndDate(checked);
                              if (checked) {
                                const newEndDate = formatDateForInput(projectEndDate) || '';
                                setEditingStaffAssignment({
                                  ...editingStaffAssignment,
                                  endDate: newEndDate || null
                                });
                                // Validate dates when checkbox changes
                                const currentStartDate = editUseProjectStartDate 
                                  ? (formatDateForInput(projectStartDate) || '') 
                                  : (editingStaffAssignment.startDate && typeof editingStaffAssignment.startDate === 'string' && editingStaffAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                    ? editingStaffAssignment.startDate.split('T')[0].split(' ')[0]
                                    : formatDateForInput(editingStaffAssignment.startDate) || '');
                                const validationError = validateDates(currentStartDate, newEndDate, true);
                                setEditDateValidationError(validationError);
                              }
                            }}
                            className="sr-only"
                          />
                          <label
                            htmlFor="editUseProjectEndDate"
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
                              setEditingStaffAssignment({
                                ...editingStaffAssignment,
                                endDate: newEndDate || null
                              });
                              // Validate dates when checkbox changes
                              const currentStartDate = editUseProjectStartDate 
                                ? (formatDateForInput(projectStartDate) || '') 
                                : (editingStaffAssignment.startDate && typeof editingStaffAssignment.startDate === 'string' && editingStaffAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                  ? editingStaffAssignment.startDate.split('T')[0].split(' ')[0]
                                  : formatDateForInput(editingStaffAssignment.startDate) || '');
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
                            setEditingStaffAssignment({
                              ...editingStaffAssignment,
                              endDate: selectedDate || null
                            });
                            // Validate dates in real-time
                            const currentStartDate = editUseProjectStartDate 
                              ? (formatDateForInput(projectStartDate) || '') 
                              : (editingStaffAssignment.startDate && typeof editingStaffAssignment.startDate === 'string' && editingStaffAssignment.startDate.match(/^\d{4}-\d{2}-\d{2}/)
                                ? editingStaffAssignment.startDate.split('T')[0].split(' ')[0]
                                : formatDateForInput(editingStaffAssignment.startDate) || '');
                            const validationError = validateDates(currentStartDate, selectedDate, true);
                            setEditDateValidationError(validationError);
                          }
                        }}
                        value={editUseProjectEndDate 
                          ? (formatDateForInput(projectEndDate) || '') 
                          : (editingStaffAssignment.endDate && typeof editingStaffAssignment.endDate === 'string' && editingStaffAssignment.endDate.match(/^\d{4}-\d{2}-\d{2}/)
                            ? editingStaffAssignment.endDate.split('T')[0].split(' ')[0]
                            : formatDateForInput(editingStaffAssignment.endDate) || '')}
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Notes
                </label>
                <textarea
                  onChange={(e) => setEditingStaffAssignment({
                    ...editingStaffAssignment,
                    notes: e.target.value || null
                  })}
                  value={editingStaffAssignment.notes || ''}
                  placeholder="Additional notes about this staff assignment..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ 
                    backgroundColor: colors.backgroundPrimary,
                    color: colors.textPrimary,
                    borderColor: colors.border
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <Button
                onClick={() => {
                  setEditingStaffAssignment(null);
                  setEditUseFullDuration(false);
                }}
                variant="ghost"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStaffAssignment}
                disabled={isSubmitting || !!editDateValidationError}
                style={{ backgroundColor: colors.primary }}
              >
                {isSubmitting ? 'Updating...' : 'Update Assignment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                Add New Staff Member
              </h2>
                  <Button
                    onClick={() => {
                      setShowAddStaffModal(false);
                      setShowPositionDropdownInModal(false);
                      setPositionSearchTermInModal('');
                      setNewStaffData({
                        staffName: '',
                        employeeNumber: '',
                        email: '',
                        phone: '',
                        positionId: undefined,
                        isActive: true,
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
                    Staff Name *
                  </label>
                  <Input
                    type="text"
                    value={newStaffData.staffName || ''}
                    onChange={(e) => setNewStaffData({ ...newStaffData, staffName: e.target.value })}
                    placeholder="Enter staff member's full name"
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
                    value={newStaffData.employeeNumber || ''}
                    onChange={(e) => setNewStaffData({ ...newStaffData, employeeNumber: e.target.value })}
                    placeholder="e.g., EMP001, 12345"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newStaffData.email || ''}
                    onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                    placeholder="staff@company.com"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newStaffData.phone || ''}
                    onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>

                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowPositionDropdownInModal(!showPositionDropdownInModal)}
                      className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    >
                      <span>
                        {newStaffData.positionId 
                          ? companyPositions.find(p => p.id === newStaffData.positionId)?.name 
                          : 'Select a position...'}
                      </span>
                      <span>{showPositionDropdownInModal ? '▲' : '▼'}</span>
                    </div>
                    
                    {showPositionDropdownInModal && (
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
                            placeholder="Search positions..."
                            value={positionSearchTermInModal}
                            onChange={(e) => setPositionSearchTermInModal(e.target.value)}
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
                          {companyPositions
                            .filter(p => p.isActive)
                            .filter(p => p.name.toLowerCase().includes(positionSearchTermInModal.toLowerCase()))
                            .map((position) => (
                              <div
                                key={position.id}
                                onClick={() => {
                                  setNewStaffData({ ...newStaffData, positionId: position.id });
                                  setShowPositionDropdownInModal(false);
                                  setPositionSearchTermInModal('');
                                }}
                                className="px-3 py-2 hover:opacity-75 cursor-pointer"
                                style={{
                                  backgroundColor: newStaffData.positionId === position.id ? colors.primary : 'transparent',
                                  color: newStaffData.positionId === position.id ? '#FFFFFF' : colors.textPrimary
                                }}
                              >
                                {position.name}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setShowPositionDropdownInModal(false);
                    setPositionSearchTermInModal('');
                    setNewStaffData({
                      staffName: '',
                      employeeNumber: '',
                      email: '',
                      phone: '',
                      positionId: undefined,
                      isActive: true,
                    });
                    setErrorMessage('');
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-75 disabled:opacity-50"
                  style={{ 
                    color: colors.textSecondary,
                    borderColor: colors.border
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewStaff}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-75 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Position Selector Modal */}
      <PositionSelectorModal
        isOpen={showPositionModal}
        onClose={() => {
          setShowPositionModal(false);
          setSelectedPosition(null);
        }}
        onSelectPosition={handlePositionSelect}
        projectId={projectId}
      />
    </div>
  );
}