'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { formatCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Briefcase,
  Search,
  X,
  Save,
  Users,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  UserCheck,
  Download,
  Upload,
  FileSpreadsheet,
  Trash,
  ArrowRight,
  History,
  Building2
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

interface CompanyStaff {
  id: number;
  staffName: string;
  employeeNumber?: string;
  email?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalUtilization?: number;
  remainingCapacity?: number;
  vacationStartDate?: string | null;
  vacationEndDate?: string | null;
  monthlyBaseRate?: number | null;
  projectStaff: Array<{
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
  }>;
}

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
}

interface ProjectPosition {
  id: number;
  designation: string;
  projectId: number;
}

interface MovementHistory {
  id: number;
  fromProjectName?: string;
  fromPositionName?: string;
  toProjectName: string;
  toPositionName: string;
  movementDate: string;
  notes?: string;
}

export default function CompanyStaffManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();
  const { permissions } = useUserPermissions();
  
  const canCreateStaff = hasPermission(permissions, 'staff.create');
  const canUpdateStaff = hasPermission(permissions, 'staff.update');
  const canDeleteStaff = hasPermission(permissions, 'staff.delete');

  const [staff, setStaff] = useState<CompanyStaff[]>([]);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionSearchTerm, setPositionSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'utilized'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'onLeave'>('all');
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CompanyStaff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<CompanyStaff | null>(null);
  
  // Move staff modal state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movingStaff, setMovingStaff] = useState<CompanyStaff | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [availablePositions, setAvailablePositions] = useState<ProjectPosition[]>([]);
  const [moveNotes, setMoveNotes] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [moveErrorMessage, setMoveErrorMessage] = useState('');
  
  // Movement history state
  const [movementHistory, setMovementHistory] = useState<MovementHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
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

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      if (!viewingStaff) return;
      try {
        setLoadingLeaveHistory(true);
        const res = await get<{ success: boolean; data: LeaveHistoryEntry[] }>(`/api/admin/company-staff/${viewingStaff.id}/leave-history`);
        if (res.success) setLeaveHistory(res.data);
      } catch (e) {
        console.error('Failed to fetch staff leave history', e);
      } finally {
        setLoadingLeaveHistory(false);
      }
    };
    fetchLeaveHistory();
  }, [viewingStaff]);
  
  // Vacation management state
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [updatingVacation, setUpdatingVacation] = useState(false);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyStaff & { positionId?: number }>>({
    staffName: '',
    employeeNumber: '',
    email: '',
    phone: '',
    position: '',
    positionId: undefined,
    isActive: true,
    monthlyBaseRate: undefined,
  });

  // Position management state
  const [showPositionsSection, setShowPositionsSection] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [positionFormData, setPositionFormData] = useState<Partial<Position>>({
    name: '',
    description: '',
    monthlyRate: undefined,
    isActive: true,
  });
  const [positionErrorMessage, setPositionErrorMessage] = useState<string>('');
  const [isSubmittingPosition, setIsSubmittingPosition] = useState(false);
  const [positionSearchTermForList, setPositionSearchTermForList] = useState('');

  const normalizeStaffMember = (member: CompanyStaff): CompanyStaff => ({
    ...member,
    monthlyBaseRate:
      member.monthlyBaseRate !== undefined && member.monthlyBaseRate !== null
        ? Number(member.monthlyBaseRate)
        : null,
  });

  useEffect(() => {
    fetchStaff();
    fetchCompanyPositions();
    fetchProjects();
  }, []);
  
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectPositions(selectedProjectId);
    } else {
      setAvailablePositions([]);
    }
  }, [selectedProjectId]);
  
  useEffect(() => {
    if (viewingStaff) {
      fetchMovementHistory(viewingStaff.id);
    }
  }, [viewingStaff]);


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
  
  const fetchProjectPositions = async (projectId: number) => {
    try {
      const response = await get<{ success: boolean; data: ProjectPosition[] }>(`/api/admin/project-staff?projectId=${projectId}`);
      if (response.success) {
        setAvailablePositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching project positions:', error);
      setAvailablePositions([]);
    }
  };
  
  const fetchMovementHistory = async (staffId: number) => {
    try {
      setLoadingHistory(true);
      const response = await get<{ success: boolean; data: MovementHistory[] }>(`/api/admin/company-staff/${staffId}/movement-history`);
      if (response.success) {
        setMovementHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching movement history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenVacationModal = (staff: CompanyStaff) => {
    setViewingStaff(staff);
    // Fix timezone issue: use local date strings to avoid day shift
    if (staff.vacationStartDate) {
      const date = new Date(staff.vacationStartDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setVacationStartDate(`${year}-${month}-${day}`);
    } else {
      setVacationStartDate('');
    }
    if (staff.vacationEndDate) {
      const date = new Date(staff.vacationEndDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setVacationEndDate(`${year}-${month}-${day}`);
    } else {
      setVacationEndDate('');
    }
    setShowVacationModal(true);
  };

  const handleSaveVacation = async () => {
    if (!viewingStaff) return;
    
    // Validate dates
    if (!vacationStartDate || !vacationEndDate) {
      alert('Please provide both start and end dates');
      return;
    }

    const startDate = new Date(vacationStartDate);
    const endDate = new Date(vacationEndDate);

    if (startDate > endDate) {
      alert('End date must be after start date');
      return;
    }
    
    console.log('Saving vacation for staff', viewingStaff.id, vacationStartDate, vacationEndDate);

    try {
      setUpdatingVacation(true);
      const response = await put<{ success: boolean; data: CompanyStaff; error?: string }>(
        `/api/admin/company-staff/${viewingStaff.id}/vacation`,
        {
          startDate: vacationStartDate || null,
          endDate: vacationEndDate || null,
        }
      );

      if (response.success) {
        await fetchStaff();
        setShowVacationModal(false);
        if (viewingStaff) {
          const updatedStaff = staff.find(s => s.id === viewingStaff.id);
          if (updatedStaff) {
            setViewingStaff({
              ...viewingStaff,
              vacationStartDate: response.data.vacationStartDate,
              vacationEndDate: response.data.vacationEndDate,
            });
          } else {
            setViewingStaff(normalizeStaffMember(response.data));
          }
        }
      } else {
        alert(response.error || 'Failed to update vacation dates');
      }
    } catch (error: any) {
      console.error('Error updating vacation:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update vacation dates';
      alert(errorMessage);
    } finally {
      setUpdatingVacation(false);
    }
  };

  const handleClearVacation = async () => {
    if (!viewingStaff) return;
    
    try {
      setUpdatingVacation(true);
      const response = await put<{ success: boolean; data: CompanyStaff }>(
        `/api/admin/company-staff/${viewingStaff.id}/vacation`,
        {
          startDate: null,
          endDate: null,
        }
      );

      if (response.success) {
        await fetchStaff();
        setVacationStartDate('');
        setVacationEndDate('');
        if (viewingStaff) {
          const updatedStaff = staff.find(s => s.id === viewingStaff.id);
          if (updatedStaff) {
            setViewingStaff({
              ...viewingStaff,
              vacationStartDate: null,
              vacationEndDate: null,
            });
          } else {
            setViewingStaff(normalizeStaffMember(response.data));
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
  
  const handleMoveStaff = async () => {
    if (!movingStaff || !selectedProjectId || !selectedPositionId) {
      setMoveErrorMessage('Please select both project and position');
      return;
    }
    
    // Find the current project assignment
    const currentAssignment = movingStaff.projectStaff?.[0];
    if (!currentAssignment) {
      setMoveErrorMessage('Staff is not currently assigned to any project');
      return;
    }
    
    setIsMoving(true);
    setMoveErrorMessage('');
    
    try {
      const response = await post<{ success: boolean; data: any }>(
        `/api/admin/company-staff/${movingStaff.id}/move`,
        {
          fromProjectStaffId: currentAssignment.id,
          toProjectId: selectedProjectId,
          toPositionId: selectedPositionId,
          notes: moveNotes || null,
          movementDate: moveDate || new Date().toISOString(),
        }
      );
      
      if (response.success) {
        // Refresh staff list
        await fetchStaff();
        setShowMoveModal(false);
        setMovingStaff(null);
        setSelectedProjectId(null);
        setSelectedPositionId(null);
        setAvailablePositions([]);
        setMoveNotes('');
        setMoveDate('');
        setMoveErrorMessage('');
      } else {
        setMoveErrorMessage('Failed to move staff');
      }
    } catch (error: any) {
      console.error('Error moving staff:', error);
      setMoveErrorMessage(error.message || 'Failed to move staff');
    } finally {
      setIsMoving(false);
    }
  };
  
  const handleOpenMoveModal = (staffMember: CompanyStaff) => {
    // Check if staff is assigned to a project
    if (!staffMember.projectStaff || staffMember.projectStaff.length === 0) {
      alert('This staff member is not assigned to any project. Please assign them to a project first.');
      return;
    }
    
    setMovingStaff(staffMember);
    setSelectedProjectId(null);
    setSelectedPositionId(null);
    setAvailablePositions([]);
    setMoveNotes('');
    setMoveDate(new Date().toISOString().split('T')[0]); // Set default to today
    setMoveErrorMessage('');
    setShowMoveModal(true);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: CompanyStaff[] }>('/api/admin/company-staff');
      if (response.success) {
        const normalized = response.data.map(normalizeStaffMember);
        setStaff(normalized);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the position name from the selected positionId
      const selectedPosition = companyPositions.find(p => p.id === formData.positionId);
      
      const staffData = {
        ...formData,
        employeeNumber: formData.employeeNumber || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        position: selectedPosition?.name || formData.position || undefined,
        monthlyBaseRate:
          formData.monthlyBaseRate === undefined || formData.monthlyBaseRate === null
            ? null
            : Number(formData.monthlyBaseRate),
      };

      if (editingStaff) {
        const response = await put<{ success: boolean; data: CompanyStaff }>(
          `/api/admin/company-staff/${editingStaff.id}`,
          staffData
        );
        if (response.success) {
          const updated = normalizeStaffMember(response.data);
          setStaff(staff.map((s) => (s.id === editingStaff.id ? updated : s)));
        }
      } else {
        const response = await post<{ success: boolean; data: CompanyStaff }>(
          '/api/admin/company-staff',
          staffData
        );
        if (response.success) {
          const created = normalizeStaffMember(response.data);
          setStaff([created, ...staff]);
        }
      }

      setShowForm(false);
      setEditingStaff(null);
      setShowPositionDropdown(false);
      setPositionSearchTerm('');
      setFormData({
        staffName: '',
        employeeNumber: '',
        email: '',
        phone: '',
        position: '',
        positionId: undefined,
        isActive: true,
        monthlyBaseRate: undefined,
      });
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleEdit = (staffMember: CompanyStaff) => {
    setEditingStaff(staffMember);
    // Find the positionId from the companyPositions based on the position name
    const matchingPosition = companyPositions.find(p => p.name === staffMember.position);
    setFormData({
      staffName: staffMember.staffName,
      positionId: matchingPosition?.id,
      employeeNumber: staffMember.employeeNumber || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      position: staffMember.position || '',
      isActive: staffMember.isActive,
    monthlyBaseRate:
      staffMember.monthlyBaseRate !== undefined && staffMember.monthlyBaseRate !== null
        ? Number(staffMember.monthlyBaseRate)
        : undefined,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await del(`/api/admin/company-staff/${id}`) as { success: boolean };
        if (response.success) {
          setStaff(staff.filter(s => s.id !== id));
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const getTotalProjects = (staffMember: CompanyStaff) => {
    return staffMember.projectStaff?.length || 0;
  };

  const getProjectAssignments = (staffMember: CompanyStaff) => {
    const assignments = staffMember.projectStaff || [];
    const designations = assignments.reduce((acc, assignment) => {
      acc[assignment.position.designation] = (acc[assignment.position.designation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return designations;
  };

  // Check if staff member is currently on leave
  const isOnLeave = (staffMember: CompanyStaff): boolean => {
    if (!staffMember.vacationStartDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(staffMember.vacationStartDate);
    startDate.setHours(0, 0, 0, 0);
    // Remains on leave until cleared (dates removed)
    return today >= startDate;
  };

  // Position management functions
  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionFormData.name?.trim()) {
      setPositionErrorMessage('Position name is required');
      return;
    }

    setIsSubmittingPosition(true);
    setPositionErrorMessage('');

    try {
      if (editingPosition) {
        const response = await put<{ success: boolean; data: Position }>(`/api/admin/positions/${editingPosition.id}`, positionFormData);
        if (response.success) {
          setCompanyPositions(companyPositions.map(p => p.id === editingPosition.id ? response.data : p));
          setShowPositionForm(false);
          setEditingPosition(null);
          setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
          // Refresh staff to update position references
          fetchStaff();
        }
      } else {
        const response = await post<{ success: boolean; data: Position }>('/api/admin/positions', positionFormData);
        if (response.success) {
          setCompanyPositions([response.data, ...companyPositions]);
          setShowPositionForm(false);
          setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
        }
      }
    } catch (error: any) {
      console.error('Error saving position:', error);
      setPositionErrorMessage(error.message || 'Failed to save position');
    } finally {
      setIsSubmittingPosition(false);
    }
  };

  const handlePositionEdit = (position: Position) => {
    setEditingPosition(position);
    setPositionFormData({
      name: position.name,
      description: position.description || '',
      monthlyRate: position.monthlyRate,
      isActive: position.isActive,
    });
    setShowPositionForm(true);
  };

  const handlePositionDelete = async (positionId: number) => {
    if (confirm('Are you sure you want to delete this position?')) {
      try {
        const response = await del(`/api/admin/positions/${positionId}`) as { success: boolean };
        if (response.success) {
          setCompanyPositions(companyPositions.filter(p => p.id !== positionId));
          // Refresh staff to update position references
          fetchStaff();
        }
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const filteredPositions = companyPositions.filter(position =>
    position.name.toLowerCase().includes(positionSearchTermForList.toLowerCase()) ||
    (position.description && position.description.toLowerCase().includes(positionSearchTermForList.toLowerCase())) ||
    (position.monthlyRate && position.monthlyRate.toString().includes(positionSearchTermForList))
  );

  const filteredStaff = staff.filter(staffMember => {
    // Apply search filter
    const matchesSearch = staffMember.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.position?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply availability filter
    let matchesAvailability = true;
    const isAvailable = (staffMember.totalUtilization === 0 || staffMember.totalUtilization === undefined) && 
                        (staffMember.remainingCapacity === 100 || staffMember.remainingCapacity === undefined);
    
    if (availabilityFilter === 'available') {
      matchesAvailability = isAvailable;
    } else if (availabilityFilter === 'utilized') {
      matchesAvailability = !isAvailable;
    }

    // Apply active filter
    let matchesActive = true;
    if (activeFilter === 'active') {
      matchesActive = staffMember.isActive === true && !isOnLeave(staffMember);
    } else if (activeFilter === 'onLeave') {
      matchesActive = staffMember.isActive === true && isOnLeave(staffMember);
    }

    return matchesSearch && matchesAvailability && matchesActive;
  });

  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/company-staff/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_data_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting staff data:', error);
      alert('Failed to export staff data. Please try again.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/company-staff/template');
      
      if (!response.ok) {
        throw new Error('Template download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/admin/company-staff/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      console.log('Import result:', result);

      if (result.success) {
        setImportResult(result.data);
        console.log('Import successful, refreshing staff list...');
        await fetchStaff(); // Refresh staff list
        console.log('Staff list refreshed');
        setImportFile(null);
        setShowImportModal(false);
      } else {
        console.log('Import failed:', result.error);
        setImportResult({ error: result.error, details: result.details });
      }
    } catch (error) {
      console.error('Error importing staff data:', error);
      setImportResult({ error: 'Failed to import staff data. Please try again.' });
    } finally {
      setImporting(false);
    }
  };

  const handleSelectAll = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedStaff.size === filteredStaff.length && filteredStaff.length > 0) {
      setSelectedStaff(new Set());
    } else {
      const newSelection = new Set(filteredStaff.map(staff => staff.id));
      setSelectedStaff(newSelection);
    }
  };

  const handleSelectStaff = (staffId: number) => {
    const newSelected = new Set(selectedStaff);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedStaff(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedStaff.size === 0) {
      alert('Please select staff members to delete');
      return;
    }

    setBulkDeleting(true);

    try {
      const response = await fetch('/api/admin/company-staff/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffIds: Array.from(selectedStaff)
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchStaff(); // Refresh staff list
        setSelectedStaff(new Set());
        setShowBulkDeleteModal(false);
        alert(`Successfully deleted ${result.data.deletedCount} staff member(s)`);
      } else {
        alert(`Failed to delete staff: ${result.error}`);
      }
    } catch (error) {
      console.error('Error bulk deleting staff:', error);
      alert('Failed to delete staff members. Please try again.');
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ 
          borderColor: 'var(--color-border-light)',
          borderTopColor: 'var(--color-primary)'
        }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewingStaff ? (
        <>
          {/* Staff Details View */}
          <div className="space-y-6">
            {/* Detail View Header */}
            <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setViewingStaff(null)}
                    variant="ghost"
                    className="p-2"
                    title="Back to Staff List"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.primary }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      {viewingStaff.staffName}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        {viewingStaff.position || 'Staff Member'}
                      </p>
                      <span className="text-sm" style={{ color: colors.border }}>•</span>
                      <p className="text-sm font-mono" style={{ color: colors.textSecondary }}>
                        ID: #{viewingStaff.id}
                      </p>
                      {viewingStaff.employeeNumber && (
                        <>
                          <span className="text-sm" style={{ color: colors.border }}>•</span>
                          <p className="text-sm font-mono" style={{ color: colors.textSecondary }}>
                            {viewingStaff.employeeNumber}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => {
                      setViewingStaff(null);
                      handleEdit(viewingStaff);
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
                    <Mail className="w-4 h-4" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Email</p>
                        <p className="text-sm truncate" style={{ color: colors.textPrimary }}>
                          {viewingStaff.email || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Phone className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Phone</p>
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          {viewingStaff.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                  <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Monthly Base Rate</p>
                    <p className="text-sm" style={{ color: colors.textPrimary }}>
                      {viewingStaff.monthlyBaseRate !== undefined && viewingStaff.monthlyBaseRate !== null
                        ? formatCurrency(viewingStaff.monthlyBaseRate, siteSettings?.currencySymbol || '$')
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                  </div>
                </Card>

                {/* Utilization Summary */}
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                    <Clock className="w-4 h-4" />
                    <span>Workload Summary</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Total Utilization
                        </span>
                        <span className="text-lg font-bold" style={{ color: colors.primary }}>
                          {viewingStaff.totalUtilization || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(viewingStaff.totalUtilization || 0, 100)}%`,
                            backgroundColor: (viewingStaff.totalUtilization || 0) > 100 ? colors.warning : colors.primary
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Available Capacity
                        </span>
                        <span className="text-lg font-bold" style={{ color: colors.success }}>
                          {viewingStaff.remainingCapacity !== undefined ? viewingStaff.remainingCapacity : 100}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${viewingStaff.remainingCapacity !== undefined ? viewingStaff.remainingCapacity : 100}%`,
                            backgroundColor: colors.success
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Active Projects
                        </span>
                        <span className="text-lg font-bold" style={{ color: colors.info }}>
                          {viewingStaff.projectStaff.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {viewingStaff.totalUtilization && viewingStaff.totalUtilization > 100 && (
                    <div className="mt-4 p-3 rounded-lg flex items-center space-x-2" style={{ backgroundColor: colors.warning + '15', borderLeft: `3px solid ${colors.warning}` }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.warning }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: colors.warning }}>
                          Over-allocated by {viewingStaff.totalUtilization - 100}%
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

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
                          backgroundColor: !viewingStaff.isActive ? colors.error :
                                         isOnLeave(viewingStaff) ? colors.warning : colors.success,
                          color: '#FFFFFF'
                        }}
                      >
                        {!viewingStaff.isActive ? 'Inactive' : 
                         isOnLeave(viewingStaff) ? 'On Leave' : 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Created</span>
                      <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                        {new Date(viewingStaff.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Last Updated</span>
                      <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                        {new Date(viewingStaff.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Vacation Section */}
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <h3 className="text-base font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                    <Calendar className="w-4 h-4" />
                    <span>Leave Days (Vacation)</span>
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                    {isOnLeave(viewingStaff) ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" style={{ color: colors.warning }} />
                          <span className="text-sm" style={{ color: colors.textPrimary }}>
                            On Vacation
                          </span>
                        </div>
                        <div className="text-sm space-y-1" style={{ color: colors.textSecondary }}>
                          <div>
                            <span className="font-medium">From:</span> {viewingStaff.vacationStartDate ? new Date(viewingStaff.vacationStartDate).toLocaleDateString() : '-'}
                          </div>
                          <div>
                            <span className="font-medium">To:</span> {viewingStaff.vacationEndDate ? new Date(viewingStaff.vacationEndDate).toLocaleDateString() : '-'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          Not on vacation
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={() => handleOpenVacationModal(viewingStaff)}
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      style={{ color: colors.primary }}
                    >
                      {viewingStaff.vacationStartDate ? 'Update Leave Days' : 'Mark on Leave'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Content - Project Assignments & History */}
              <div className="lg:col-span-2 space-y-4">
                {/* Project Assignments */}
                <Card className="p-5" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                      <Briefcase className="w-5 h-5" />
                      <span>Project Assignments</span>
                    </h3>
                    <span className="text-sm font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textSecondary }}>
                      {viewingStaff.projectStaff.length} {viewingStaff.projectStaff.length === 1 ? 'project' : 'projects'}
                    </span>
                  </div>

                  {viewingStaff.projectStaff.length > 0 ? (
                    <div className="space-y-3">
                      {viewingStaff.projectStaff.map((assignment) => (
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
                                  {assignment.position.designation}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                              <div className="text-right">
                                <div className="text-base font-bold mb-1" style={{ color: colors.primary }}>
                                  {assignment.utilization}%
                                </div>
                                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full"
                                    style={{ 
                                      width: `${Math.min(assignment.utilization, 100)}%`,
                                      backgroundColor: colors.primary
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Single status is shown at staff-level only; omit per-assignment status badge */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Briefcase className="w-12 h-12 mb-3" style={{ color: colors.textMuted }} />
                      <h4 className="text-base font-semibold mb-1" style={{ color: colors.textPrimary }}>
                        No Project Assignments
                      </h4>
                      <p className="text-xs text-center max-w-sm" style={{ color: colors.textSecondary }}>
                        This staff member is not currently assigned to any projects
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
                                      {history.fromPositionName && (
                                        <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textSecondary }}>
                                          {history.fromPositionName}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm italic" style={{ color: colors.textMuted }}>
                                      Initial Assignment
                                    </span>
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
                                    {history.toPositionName && (
                                      <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                                        {history.toPositionName}
                                      </span>
                                    )}
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
                Company Staff Management
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Manage your company staff members and their roles
              </p>
            </div>
            <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowPositionsSection(!showPositionsSection)}
            className="flex items-center space-x-2"
            variant="ghost"
            style={{ color: colors.textPrimary, border: `1px solid ${colors.border}` }}
          >
            <Briefcase className="w-4 h-4" />
            <span>{showPositionsSection ? 'Hide Positions' : 'Manage Positions'}</span>
          </Button>
          {canCreateStaff && (
            <Button
              onClick={() => {
                setFormData({
                  staffName: '',
                  employeeNumber: '',
                  email: '',
                  phone: '',
                  position: '',
                  positionId: undefined,
                  isActive: true,
                  monthlyBaseRate: undefined,
                });
                setEditingStaff(null);
                setShowForm(true);
              }}
              className="flex items-center space-x-2"
              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </Button>
          )}
        </div>
      </div>

      {/* Positions Section - Display at top when enabled */}
      {showPositionsSection && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Positions Management
              </h2>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Manage staff positions and their base rates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setShowPositionForm(true);
                  setEditingPosition(null);
                  setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                  setPositionErrorMessage('');
                }}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </Button>
              <Button
                onClick={() => setShowPositionsSection(false)}
                variant="ghost"
                className="p-2"
                title="Close Positions Section"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Position Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
            <Input
              type="text"
              placeholder="Search positions..."
              value={positionSearchTermForList}
              onChange={(e) => setPositionSearchTermForList(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
          </div>

          {/* Position Form */}
          {showPositionForm && (
            <Card className="p-6 mb-6" style={{ backgroundColor: colors.backgroundPrimary }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  {editingPosition ? 'Edit Position' : 'Add New Position'}
                </h3>
                <Button
                  onClick={() => {
                    setShowPositionForm(false);
                    setEditingPosition(null);
                    setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                    setPositionErrorMessage('');
                  }}
                  variant="ghost"
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handlePositionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position Name *
                  </label>
                  <Input
                    type="text"
                    value={positionFormData.name || ''}
                    onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                    placeholder="e.g., Project Director, Site Engineer"
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
                    value={positionFormData.monthlyRate || ''}
                    onChange={(e) => setPositionFormData({ ...positionFormData, monthlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                    value={positionFormData.description || ''}
                    onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                    placeholder="Brief description of the position..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ 
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                </div>

                {positionErrorMessage && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
                    {positionErrorMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPositionForm(false);
                      setEditingPosition(null);
                      setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                      setPositionErrorMessage('');
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingPosition}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmittingPosition ? 'Saving...' : editingPosition ? 'Update' : 'Create'}</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Positions List */}
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
                        {position.monthlyRate ? formatCurrency(position.monthlyRate, siteSettings?.currencySymbol || '$') : '-'}
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
                          onClick={() => handlePositionEdit(position)}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handlePositionDelete(position.id)}
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
                {positionSearchTermForList ? 'No positions found' : 'No positions yet'}
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                {positionSearchTermForList ? 'Try adjusting your search terms' : 'Add your first position to get started'}
              </p>
              {!positionSearchTermForList && (
                <Button
                  onClick={() => {
                    setShowPositionForm(true);
                    setEditingPosition(null);
                    setPositionFormData({ name: '', description: '', monthlyRate: undefined, isActive: true });
                    setPositionErrorMessage('');
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
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
            <Input
              type="text"
              placeholder="Search staff members..."
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
              <option value="all">All Staff</option>
              <option value="available">Available Only</option>
              <option value="utilized">Utilized Only</option>
            </select>
          </div>
        </div>
        
      </div>

      {/* Staff Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingStaff(null);
                setFormData({
                  staffName: '',
                  employeeNumber: '',
                  email: '',
                  phone: '',
                  position: '',
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
                  Staff Name *
                </label>
                <Input
                  type="text"
                  value={formData.staffName}
                  onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
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
                  placeholder="e.g., EMP001, 12345"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Position
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: 'rgba(229, 231, 235, 0.1)',
                      color: colors.textPrimary
                    }}
                  >
                    <span>
                      {formData.positionId 
                        ? companyPositions.find(p => p.id === formData.positionId)?.name 
                        : 'Select a position...'}
                    </span>
                    <span>{showPositionDropdown ? '▲' : '▼'}</span>
                  </div>
                  
                  {showPositionDropdown && (
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
                          value={positionSearchTerm}
                          onChange={(e) => setPositionSearchTerm(e.target.value)}
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
                          .filter(p => p.name.toLowerCase().includes(positionSearchTerm.toLowerCase()))
                          .map((position) => (
                            <div
                              key={position.id}
                              onClick={() => {
                                setFormData({ ...formData, positionId: position.id });
                                setShowPositionDropdown(false);
                                setPositionSearchTerm('');
                              }}
                              className="px-3 py-2 hover:opacity-75 cursor-pointer"
                              style={{
                                backgroundColor: formData.positionId === position.id ? colors.primary : 'transparent',
                                color: formData.positionId === position.id ? '#FFFFFF' : colors.textPrimary
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
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
                  Monthly Base Rate
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyBaseRate ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyBaseRate: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder={`e.g., ${siteSettings?.currencySymbol || '$'}5000`}
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary,
                  }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Optional staff-specific base rate used for cost projections.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActiveStaff"
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
                  <span className="ml-2 text-sm font-medium cursor-pointer" style={{ color: colors.textPrimary }}>
                    Active Staff Member
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                className="flex items-center space-x-2"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
              >
                <Save className="w-4 h-4" />
                <span>{editingStaff ? 'Update Staff Member' : 'Create Staff Member'}</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStaff(null);
                }}
                variant="ghost"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Staff Table */}
      <Card className="overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
        {/* Card Header with Import/Export Actions */}
        <div className="px-6 py-4 border-b flex items-center justify-end" style={{ borderColor: colors.border }}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: colors.primary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to Excel"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded hover:opacity-80 transition-all duration-150"
              style={{ 
                color: colors.primary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            {canCreateStaff && (
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 rounded hover:opacity-80 transition-all duration-150"
                style={{ 
                  color: colors.primary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Import Staff Data"
              >
                <Upload className="w-5 h-5" />
              </button>
            )}
            {selectedStaff.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="p-2 rounded hover:opacity-80 transition-all duration-150"
                style={{ 
                  color: colors.error,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Delete Selected (${selectedStaff.size})`}
              >
                <Trash className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Selection Status */}
        {selectedStaff.size > 0 && (
          <div className="px-6 py-3 border-b" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                {selectedStaff.size} staff member(s) selected
              </span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full table-auto" style={{ tableLayout: 'auto' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid var(--color-border-light)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}>
                <th className="w-12 px-2 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      variant="primary"
                      size="sm"
                      checked={selectedStaff.size === filteredStaff.length && filteredStaff.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Name
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Emp #
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Position
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Email
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Phone
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Rate
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Util
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  Status
                </th>
                {(canUpdateStaff || canDeleteStaff) && (
                  <th className="w-24 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember, index) => (
                <tr 
                  key={staffMember.id}
                  style={{ 
                    borderBottom: '1px solid var(--color-border-light)',
                    backgroundColor: 'var(--color-bg-primary)'
                  }}
                  className="transition-all duration-150"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        variant="primary"
                        size="sm"
                        checked={selectedStaff.has(staffMember.id)}
                        onChange={() => handleSelectStaff(staffMember.id)}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ 
                        backgroundColor: 'var(--color-bg-secondary)'
                      }}>
                        <User className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {staffMember.staffName}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-xs font-mono truncate block" style={{ color: 'var(--color-text-secondary)' }}>
                      {staffMember.employeeNumber || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {staffMember.position || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-xs truncate block" style={{ color: 'var(--color-text-primary)' }}>
                      {staffMember.email || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-xs truncate block" style={{ color: 'var(--color-text-primary)' }}>
                      {staffMember.phone || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <span className="text-xs font-medium truncate block" style={{ color: 'var(--color-text-primary)' }}>
                      {staffMember.monthlyBaseRate !== undefined && staffMember.monthlyBaseRate !== null
                        ? formatCurrency(staffMember.monthlyBaseRate, siteSettings?.currencySymbol || '$')
                        : '-'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center space-y-0.5">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {staffMember.totalUtilization || 0}%
                      </span>
                      {staffMember.totalUtilization && staffMember.totalUtilization > 100 && (
                        <span className="text-xs px-1 py-0.5 rounded font-medium" style={{ 
                          backgroundColor: 'var(--color-warning)',
                          color: 'var(--color-bg-primary)'
                        }}>
                          Over
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span 
                      className="px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block"
                      style={{ 
                        backgroundColor: !staffMember.isActive ? 'var(--color-error)' :
                                       isOnLeave(staffMember) ? 'var(--color-warning)' : 'var(--color-primary)',
                        color: 'var(--color-bg-primary)'
                      }}
                    >
                      {!staffMember.isActive ? 'Inactive' : 
                       isOnLeave(staffMember) ? 'Leave' : 'Active'}
                    </span>
                  </td>
                  {(canUpdateStaff || canDeleteStaff) && (
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setViewingStaff(staffMember)}
                          className="p-1.5 rounded hover:opacity-80 transition-all duration-150"
                          style={{ 
                            color: 'var(--color-info)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canUpdateStaff && staffMember.projectStaff && staffMember.projectStaff.length > 0 && (
                          <button
                            onClick={() => handleOpenMoveModal(staffMember)}
                            className="p-1.5 rounded hover:opacity-80 transition-all duration-150"
                            style={{ 
                              color: 'var(--color-info)',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Move to another project"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canUpdateStaff && (
                          <button
                            onClick={() => handleEdit(staffMember)}
                            className="p-1.5 rounded hover:opacity-80 transition-all duration-150"
                            style={{ 
                              color: 'var(--color-primary)',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Edit Staff"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDeleteStaff && (
                          <button
                            onClick={() => handleDelete(staffMember.id)}
                            className="p-1.5 rounded hover:opacity-80 transition-all duration-150"
                            style={{ 
                              color: 'var(--color-error)',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Delete Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

          {filteredStaff.length === 0 && (
            <Card className="p-12 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                backgroundColor: 'var(--color-bg-primary)'
              }}>
                <User className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                No staff members found
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first staff member'}
              </p>
            </Card>
          )}
        </>
      )}
      
      {/* Move Staff Modal */}
      {showMoveModal && movingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Move Staff to Another Project
                </h2>
                <Button
                  onClick={() => {
                    setShowMoveModal(false);
                    setMovingStaff(null);
                    setSelectedProjectId(null);
                    setSelectedPositionId(null);
                    setAvailablePositions([]);
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
                    {movingStaff.staffName}
                  </span>
                  {movingStaff.employeeNumber && (
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      (#{movingStaff.employeeNumber})
                    </span>
                  )}
                </div>
                {movingStaff.projectStaff && movingStaff.projectStaff.length > 0 && (
                  <div className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                    Current: {movingStaff.projectStaff[0].project.projectName} - {movingStaff.projectStaff[0].position.designation}
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
                      setSelectedPositionId(null); // Reset position when project changes
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
                      .filter(p => !movingStaff.projectStaff?.some(ps => ps.project.id === p.id))
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
                      Target Position *
                    </label>
                    {availablePositions.length === 0 ? (
                      <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textMuted }}>
                        No positions available for this project. Please add positions to the project first.
                      </div>
                    ) : (
                      <select
                        value={selectedPositionId || ''}
                        onChange={(e) => setSelectedPositionId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: colors.backgroundPrimary,
                          borderColor: colors.border,
                          color: colors.textPrimary
                        }}
                      >
                        <option value="">Select a position...</option>
                        {availablePositions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.designation}
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
                      setMovingStaff(null);
                      setSelectedProjectId(null);
                      setSelectedPositionId(null);
                      setAvailablePositions([]);
                      setMoveDate('');
                      setMoveNotes('');
                      setMoveErrorMessage('');
                    }}
                    variant="ghost"
                    disabled={isMoving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMoveStaff}
                    disabled={isMoving || !selectedProjectId || !selectedPositionId || !moveDate}
                    style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                    className="flex items-center space-x-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>{isMoving ? 'Moving...' : 'Move Staff'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
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
                  Import Staff Data
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Upload an Excel file to import staff members
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Download Template */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                      Download Template
                    </h3>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Download the Excel template with sample data and instructions
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Template</span>
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Select Excel File
                </label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundPrimary
                  }}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="import-file"
                  />
                  <label 
                    htmlFor="import-file"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8" style={{ color: colors.textMuted }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {importFile ? importFile.name : 'Click to select file'}
                      </p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        Excel (.xlsx, .xls) or CSV files only
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Import Results */}
              {importResult && (
                <div className="mb-6">
                  {importResult.error ? (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `1px solid ${colors.error}` }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: colors.error }}>
                        Import Failed
                      </h4>
                      <p className="text-sm mb-2" style={{ color: colors.error }}>
                        {importResult.error}
                      </p>
                      {importResult.details && (
                        <div className="text-xs" style={{ color: colors.error }}>
                          <pre className="whitespace-pre-wrap">{JSON.stringify(importResult.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.success + '20', border: `1px solid ${colors.success}` }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: colors.success }}>
                        Import Successful
                      </h4>
                      <div className="text-sm space-y-1" style={{ color: colors.success }}>
                        <p>Total processed: {importResult.totalProcessed}</p>
                        <p>Created: {importResult.created}</p>
                        <p>Updated: {importResult.updated}</p>
                        {importResult.errors > 0 && (
                          <p>Errors: {importResult.errors}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Instructions */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundPrimary }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Import Instructions
                </h3>
                <ul className="text-xs space-y-1" style={{ color: colors.textSecondary }}>
                  <li>• Staff Name is required for all records</li>
                  <li>• Employee Number, Email, Phone, and Position are optional</li>
                  <li>• Status must be "Active" or "Inactive" (defaults to Active)</li>
                  <li>• Existing staff with same name or employee number will be updated</li>
                  <li>• Download the template above for the correct format</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <Button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                variant="ghost"
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || importing}
                style={{ backgroundColor: colors.primary }}
              >
                {importing ? 'Importing...' : 'Import Staff'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && viewingStaff && (
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
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => setShowVacationModal(false)}
                    variant="ghost"
                    type="button"
                    disabled={updatingVacation}
                  >
                    Cancel
                  </Button>
                  {viewingStaff.vacationStartDate && (
                    <Button
                      onClick={handleClearVacation}
                      variant="ghost"
                      type="button"
                      disabled={updatingVacation}
                      style={{ color: colors.error }}
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveVacation}
                    type="button"
                    disabled={updatingVacation}
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl w-full max-w-md"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: colors.border }}
            >
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                  Confirm Bulk Delete
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  This action cannot be undone
                </p>
              </div>
              <Button
                onClick={() => setShowBulkDeleteModal(false)}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />
                  <span className="text-sm font-medium" style={{ color: colors.error }}>
                    Warning
                  </span>
                </div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  You are about to delete <strong>{selectedStaff.size}</strong> staff member(s). 
                  Staff members with project assignments cannot be deleted.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Selected Staff Members:
                </h3>
                <div className="max-h-32 overflow-y-auto">
                  {Array.from(selectedStaff).map(staffId => {
                    const staff = filteredStaff.find(s => s.id === staffId);
                    return staff ? (
                      <div key={staffId} className="text-sm py-1" style={{ color: colors.textSecondary }}>
                        • {staff.staffName} {staff.employeeNumber && `(${staff.employeeNumber})`}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <Button
                onClick={() => setShowBulkDeleteModal(false)}
                variant="ghost"
                disabled={bulkDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                style={{ backgroundColor: colors.error, color: '#FFFFFF' }}
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedStaff.size} Staff`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
