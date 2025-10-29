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
  Trash
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

export default function CompanyStaffManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [staff, setStaff] = useState<CompanyStaff[]>([]);
  const [companyPositions, setCompanyPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionSearchTerm, setPositionSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'utilized'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active'>('all');
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CompanyStaff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<CompanyStaff | null>(null);
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

  useEffect(() => {
    fetchStaff();
    fetchCompanyPositions();
  }, []);


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
      const response = await get<{ success: boolean; data: CompanyStaff[] }>('/api/admin/company-staff');
      if (response.success) {
        setStaff(response.data);
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
      };

      // Remove positionId from the payload
      const { positionId, ...payloadWithoutPositionId } = staffData;
      const finalPayload = payloadWithoutPositionId;

      if (editingStaff) {
        const response = await put<{ success: boolean; data: CompanyStaff }>(`/api/admin/company-staff/${editingStaff.id}`, finalPayload);
        if (response.success) {
          setStaff(staff.map(s => s.id === editingStaff.id ? response.data : s));
        }
      } else {
        const response = await post<{ success: boolean; data: CompanyStaff }>('/api/admin/company-staff', finalPayload);
        if (response.success) {
          setStaff([response.data, ...staff]);
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
      matchesActive = staffMember.isActive === true;
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

  const handleSelectAll = () => {
    console.log('Select all clicked. Current selection:', selectedStaff.size, 'Total staff:', filteredStaff.length);
    if (selectedStaff.size === filteredStaff.length) {
      setSelectedStaff(new Set());
      console.log('Deselected all staff');
    } else {
      const newSelection = new Set(filteredStaff.map(staff => staff.id));
      setSelectedStaff(newSelection);
      console.log('Selected all staff:', newSelection);
    }
  };

  const handleSelectStaff = (staffId: number) => {
    console.log('Individual checkbox clicked for staff ID:', staffId);
    const newSelected = new Set(selectedStaff);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
      console.log('Deselected staff:', staffId);
    } else {
      newSelected.add(staffId);
      console.log('Selected staff:', staffId);
    }
    setSelectedStaff(newSelected);
    console.log('New selection:', newSelected);
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
          <Button
            onClick={() => handleExport('xlsx')}
            variant="ghost"
            className="flex items-center space-x-2"
            style={{ color: colors.textSecondary }}
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="ghost"
            className="flex items-center space-x-2"
            style={{ color: colors.textSecondary }}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="ghost"
            className="flex items-center space-x-2"
            style={{ color: colors.textSecondary }}
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </Button>
          {selectedStaff.size > 0 && (
            <Button
              onClick={() => setShowBulkDeleteModal(true)}
              variant="ghost"
              className="flex items-center space-x-2"
              style={{ color: colors.error }}
            >
              <Trash className="w-4 h-4" />
              <span>Delete Selected ({selectedStaff.size})</span>
            </Button>
          )}
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
            <option value="all">All Staff</option>
            <option value="available">Available Only</option>
            <option value="utilized">Utilized Only</option>
          </select>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/20" style={{ backgroundColor: colors.backgroundPrimary }}>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  <div className="flex items-center justify-center">
                    <div 
                      className="w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-colors hover:border-opacity-80 hover:bg-opacity-10"
                      style={{ 
                        borderColor: selectedStaff.size === filteredStaff.length && filteredStaff.length > 0 ? colors.primary : '#E5E7EB',
                        backgroundColor: selectedStaff.size === filteredStaff.length && filteredStaff.length > 0 ? colors.primary : 'transparent'
                      }}
                      onClick={handleSelectAll}
                    >
                      {selectedStaff.size === filteredStaff.length && filteredStaff.length > 0 && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>
                      All
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Employee #
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Position
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Phone
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Total Utilization
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember, index) => (
                <tr 
                  key={staffMember.id}
                  className="border-b border-gray-200/10"
                  style={{ 
                    backgroundColor: colors.backgroundSecondary
                  }}
                >
                  <td className="px-6 py-4 text-center">
                    <div 
                      className="w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-colors hover:border-opacity-80 hover:bg-opacity-10 mx-auto"
                      style={{ 
                        borderColor: selectedStaff.has(staffMember.id) ? colors.primary : '#E5E7EB',
                        backgroundColor: selectedStaff.has(staffMember.id) ? colors.primary : 'transparent'
                      }}
                      onClick={() => handleSelectStaff(staffMember.id)}
                    >
                      {selectedStaff.has(staffMember.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {staffMember.staffName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono" style={{ color: colors.textPrimary }}>
                      {staffMember.employeeNumber || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>
                        {staffMember.position || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {staffMember.email || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {staffMember.phone || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {staffMember.totalUtilization || 0}%
                      </span>
                      {staffMember.remainingCapacity !== undefined && staffMember.remainingCapacity > 0 && (
                        <span className="text-xs" style={{ color: colors.textMuted }}>
                          {staffMember.remainingCapacity}% available
                        </span>
                      )}
                      {staffMember.totalUtilization && staffMember.totalUtilization > 100 && (
                        <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: colors.warning, color: '#FFFFFF' }}>
                          Over-allocated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: staffMember.isActive ? colors.success : colors.error,
                        color: '#FFFFFF'
                      }}
                    >
                      {staffMember.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => setViewingStaff(staffMember)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.info }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleEdit(staffMember)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.primary }}
                        title="Edit Staff"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(staffMember.id)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.error }}
                        title="Delete Staff"
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
      </Card>

      {filteredStaff.length === 0 && (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <User className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            No staff members found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first staff member'}
          </p>
        </Card>
      )}

      {/* Staff Details Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2">
          <div 
            className="rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-8 border-b-2"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.backgroundPrimary
              }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-4 rounded-xl shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
                    {viewingStaff.staffName}
                  </h2>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {viewingStaff.position || 'Staff Member'} • ID: #{viewingStaff.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                style={{ color: colors.textMuted }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex">
                {/* Left Sidebar - Basic Info & Summary */}
                <div className="w-1/3 p-8 border-r-2 overflow-y-auto" style={{ borderColor: colors.border }}>
                  {/* Contact Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                      <Mail className="w-4 h-4" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Email</p>
                            <p className="text-sm" style={{ color: colors.textPrimary }}>
                              {viewingStaff.email || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4" style={{ color: colors.primary }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Phone</p>
                            <p className="text-sm" style={{ color: colors.textPrimary }}>
                              {viewingStaff.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center space-x-3">
                          <Briefcase className="w-4 h-4" style={{ color: colors.primary }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Position</p>
                            <p className="text-sm" style={{ color: colors.textPrimary }}>
                              {viewingStaff.position || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Utilization Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                      <Clock className="w-4 h-4" />
                      <span>Workload Summary</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Clock className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Total Utilization
                          </span>
                        </div>
                        <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                          {viewingStaff.totalUtilization || 0}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(viewingStaff.totalUtilization || 0, 100)}%`,
                              backgroundColor: (viewingStaff.totalUtilization || 0) > 100 ? colors.warning : colors.primary
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                          <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Available Capacity
                          </span>
                        </div>
                        <div className="text-2xl font-bold mb-2" style={{ color: colors.success }}>
                          {viewingStaff.remainingCapacity || 100}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${viewingStaff.remainingCapacity || 100}%`,
                              backgroundColor: colors.success
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Users className="w-4 h-4" style={{ color: colors.info }} />
                          <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            Active Projects
                          </span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: colors.info }}>
                          {viewingStaff.projectStaff.length}
                        </div>
                      </div>
                    </div>

                    {viewingStaff.totalUtilization && viewingStaff.totalUtilization > 100 && (
                      <div className="mt-6 p-4 rounded-xl flex items-center space-x-3" style={{ backgroundColor: colors.warning + '20' }}>
                        <AlertCircle className="w-6 h-6" style={{ color: colors.warning }} />
                        <div>
                          <p className="font-semibold" style={{ color: colors.warning }}>
                            Over-allocated
                          </p>
                          <p className="text-sm" style={{ color: colors.warning }}>
                            {viewingStaff.totalUtilization - 100}% over capacity
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Metadata */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: colors.textPrimary }}>
                      <Calendar className="w-4 h-4" />
                      <span>Status & Metadata</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Status</span>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: viewingStaff.isActive ? colors.success : colors.error,
                              color: '#FFFFFF'
                            }}
                          >
                            {viewingStaff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Created</span>
                          <span className="text-xs" style={{ color: colors.textSecondary }}>
                            {new Date(viewingStaff.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Last Updated</span>
                          <span className="text-xs" style={{ color: colors.textSecondary }}>
                            {new Date(viewingStaff.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Project Assignments */}
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold flex items-center space-x-3" style={{ color: colors.textPrimary }}>
                      <Briefcase className="w-5 h-5" />
                      <span>Project Assignments</span>
                    </h3>
                    <div className="text-sm font-medium" style={{ color: colors.textMuted }}>
                      {viewingStaff.projectStaff.length} project{viewingStaff.projectStaff.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {viewingStaff.projectStaff.length > 0 ? (
                    <div className="grid gap-6">
                      {viewingStaff.projectStaff.map((assignment, index) => (
                        <div 
                          key={assignment.id}
                          className="p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-200"
                          style={{ 
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.border
                          }}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                              <div 
                                className="p-3 rounded-xl shadow-md"
                                style={{ backgroundColor: colors.primary }}
                              >
                                <Briefcase className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold mb-1" style={{ color: colors.textPrimary }}>
                                  {assignment.project.projectName}
                                </h4>
                                <p className="text-sm font-medium mb-1" style={{ color: colors.textMuted }}>
                                  {assignment.project.projectCode}
                                </p>
                                <p className="text-sm" style={{ color: colors.textSecondary }}>
                                  {assignment.position.designation}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold mb-1" style={{ color: colors.primary }}>
                                {assignment.utilization}%
                              </div>
                              <div className="text-xs font-medium" style={{ color: colors.textMuted }}>
                                utilization
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                              <div className="flex items-center space-x-2 mb-1">
                                <CheckCircle className="w-3 h-3" style={{ color: colors.info }} />
                                <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Status</span>
                              </div>
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ 
                                  backgroundColor: assignment.status === 'Active' ? colors.success : 
                                                 assignment.status === 'Completed' ? colors.info : colors.warning,
                                  color: '#FFFFFF'
                                }}
                              >
                                {assignment.status}
                              </span>
                            </div>
                            
                            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                              <div className="flex items-center space-x-2 mb-1">
                                <Briefcase className="w-3 h-3" style={{ color: colors.info }} />
                                <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Position</span>
                              </div>
                              <span className="text-xs" style={{ color: colors.textSecondary }}>
                                {assignment.position.designation}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 rounded-xl" style={{ backgroundColor: colors.backgroundPrimary }}>
                      <Briefcase className="w-16 h-16 mb-6" style={{ color: colors.textMuted }} />
                      <h4 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                        No Project Assignments
                      </h4>
                      <p className="text-sm text-center max-w-md" style={{ color: colors.textSecondary }}>
                        This staff member is not currently assigned to any projects
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-between p-8 border-t-2"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.backgroundPrimary
              }}
            >
              <div className="text-xs" style={{ color: colors.textMuted }}>
                Last updated: {new Date(viewingStaff.updatedAt).toLocaleString()}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setViewingStaff(null)}
                  variant="ghost"
                  className="px-4 py-2 text-sm"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewingStaff(null);
                    handleEdit(viewingStaff);
                  }}
                  className="px-6 py-2 text-sm font-semibold"
                  style={{ backgroundColor: colors.primary }}
                >
                  Edit Staff Member
                </Button>
              </div>
            </div>
          </div>
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
