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
  Users, 
  Search,
  X,
  Mail,
  Phone,
  Briefcase,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react';

interface Staff {
  id: number;
  staffName: string;
  email?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ProjectStaff specific fields
  projectStaffId?: number;
  utilization?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  notes?: string;
}

interface ProjectStaffProps {
  projectId: number;
  projectName: string;
}

export default function ProjectStaff({ projectId, projectName }: ProjectStaffProps) {
  const { get, post, put, delete: del } = useAdminApi();
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [projectStaff, setProjectStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'existing' | 'new'>('existing');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    staffName: '',
    email: '',
    phone: '',
    position: '',
    isActive: true,
  });

  const [editingData, setEditingData] = useState<Partial<Staff>>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddPositionForm, setShowAddPositionForm] = useState(false);
  const [newPosition, setNewPosition] = useState({
    designation: '',
    utilization: 100,
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: ''
  });
  const [assigningToPosition, setAssigningToPosition] = useState<number | null>(null);
  const [editingPosition, setEditingPosition] = useState<Staff | null>(null);

  useEffect(() => {
    fetchProjectStaff();
  }, [projectId]);

  const fetchStaff = async () => {
    try {
      const response = await get<{ success: boolean; data: Staff[] }>('/api/admin/company-staff');
      if (response.success) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchCompanyStaffForPool = async () => {
    try {
      const response = await get<{ success: boolean; data: Staff[] }>('/api/admin/company-staff');
      if (response.success) {
        // Filter out staff already assigned to this project
        const assignedStaffIds = projectStaff
          .filter(ps => ps.id !== 0) // Only consider assigned staff (id !== 0 means staff is assigned)
          .map(ps => ps.id);
        const availableStaff = response.data.filter(s => !assignedStaffIds.includes(s.id));
        setStaff(availableStaff);
      }
    } catch (error) {
      console.error('Error fetching company staff:', error);
    }
  };

  const fetchProjectStaff = async () => {
    try {
      const response = await get<{ success: boolean; data: any }>(`/api/admin/project-staff?projectId=${projectId}`);
      if (response.success) {
        // Transform the ProjectStaff data to match the Staff interface
        const projectStaffList: Staff[] = response.data.map((ps: any) => ({
          id: ps.staff?.id || 0, // Handle null staff for unassigned positions
          staffName: ps.staff?.staffName || 'Unassigned',
          email: ps.staff?.email || '',
          phone: ps.staff?.phone || '',
          position: ps.designation, // Use designation as position
          isActive: ps.staff?.isActive || false,
          createdAt: ps.staff?.createdAt || ps.createdAt,
          updatedAt: ps.staff?.updatedAt || ps.updatedAt,
          // Add ProjectStaff specific data
          projectStaffId: ps.id,
          utilization: ps.utilization,
          startDate: ps.startDate,
          endDate: ps.endDate,
          status: ps.status,
          notes: ps.notes,
        }));
        
        setProjectStaff(projectStaffList);
      }
    } catch (error) {
      console.error('Error fetching project staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = async () => {
    // Validate required fields
    if (!newPosition.designation?.trim()) {
      setErrorMessage('Position designation is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const positionData = {
        projectId: projectId,
        staffId: null, // No staff assigned yet
        designation: newPosition.designation.trim(),
        utilization: newPosition.utilization,
        startDate: newPosition.startDate || null,
        endDate: newPosition.endDate || null,
        status: newPosition.status,
        notes: newPosition.notes.trim() || null,
      };

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', positionData);
      if (response.success) {
        setNewPosition({
          designation: '',
          utilization: 100,
          startDate: '',
          endDate: '',
          status: 'Active',
          notes: ''
        });
        setShowAddPositionForm(false);
        setErrorMessage('');
        // Refresh project staff to show the new position
        await fetchProjectStaff();
      } else {
        throw new Error('Failed to create position');
      }
    } catch (error) {
      console.error('Error adding position:', error);
      setErrorMessage('Error creating position. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStaffToPosition = async (positionId: number, staffId: number) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${positionId}`, {
        staffId: staffId
      });
      
      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
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

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${editingPosition.projectStaffId}`, {
        designation: editingPosition.position,
        utilization: editingPosition.utilization,
        startDate: editingPosition.startDate || '',
        endDate: editingPosition.endDate || '',
        status: editingPosition.status,
        notes: editingPosition.notes || '',
      });
      
      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
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

  const handleUnassignStaff = async (positionId: number) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${positionId}`, {
        staffId: null
      });
      
      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
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
  };

  const handleAddStaff = async () => {
    // Validate required fields
    if (!newStaff.staffName?.trim()) {
      setErrorMessage('Staff name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const staffData = {
        ...newStaff,
        staffName: newStaff.staffName?.trim() || '',
        email: newStaff.email?.trim() || '',
        phone: newStaff.phone?.trim() || '',
        position: newStaff.position?.trim() || '',
        isActive: newStaff.isActive ?? true,
      };

      // First create the staff member
      const staffResponse = await post<{ success: boolean; data: Staff }>('/api/admin/company-staff', staffData);
      if (staffResponse.success) {
        // Then assign them to the project with a default designation
        const projectStaffData = {
          projectId: projectId,
          staffId: staffResponse.data.id,
          designation: newStaff.position || 'Team Member',
          utilization: 100,
          status: 'Active',
        };

        const projectStaffResponse = await post<{ success: boolean; data: any }>('/api/admin/project-staff', projectStaffData);
        if (projectStaffResponse.success) {
          setNewStaff({
            staffName: '',
            email: '',
            phone: '',
            position: '',
            isActive: true,
          });
          setShowAddModal(false);
          setModalTab('existing');
          setErrorMessage('');
          // Refresh project staff to show the new staff member
          await fetchProjectStaff();
        } else {
          throw new Error('Failed to assign staff to project');
        }
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      setErrorMessage('Error adding staff. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async (staffId: number) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) return;

      const updateData = {
        ...staffMember,
        ...editingData,
      };

      const response = await put<{ success: boolean; data: Staff }>(`/api/admin/company-staff/${staffId}`, updateData);
      if (response.success) {
        setStaff(prev => prev.map(s => s.id === staffId ? response.data : s));
        setEditingStaff(null);
        setEditingData({});
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await del(`/api/admin/company-staff/${staffId}`) as { success: boolean };
      if (response.success) {
        setStaff(prev => prev.filter(s => s.id !== staffId));
        setProjectStaff(prev => prev.filter(s => s.id !== staffId));
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleAddFromPool = async (staffId: number, role: 'director' | 'manager') => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const designation = role === 'director' ? 'Project Director' : 'Project Manager';
      
      const projectStaffData = {
        projectId: projectId,
        staffId: staffId,
        designation: designation,
        utilization: 100,
        status: 'Active',
      };

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', projectStaffData);
      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
        setShowAddModal(false);
        setModalTab('existing');
        setStaff([]); // Clear the pool
        setErrorMessage('');
      } else {
        throw new Error('Failed to assign staff to project');
      }
    } catch (error) {
      console.error('Error adding staff from pool:', error);
      setErrorMessage('Error adding staff to project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStaff = async (projectStaffId: number) => {
    try {
      const response = await del(`/api/admin/project-staff/${projectStaffId}`) as { success: boolean };
      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
      }
    } catch (error) {
      console.error('Error removing staff:', error);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <p style={{ color: colors.textSecondary }}>Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Project Staff Management
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage staff assignments for {projectName}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddPositionForm(true);
            setErrorMessage('');
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Button>
      </div>

      {/* Current Project Staff */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5" style={{ color: colors.textMuted }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Current Project Staff
          </h3>
        </div>
        
        {projectStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Position</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Assigned Staff</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Utilization</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Duration</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Start Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>End Date</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectStaff.map((position) => (
                  <tr 
                    key={`${position.projectStaffId || position.id}`}
                    className="border-b transition-colors hover:opacity-75"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                          {position.position === 'Project Director' ? (
                            <Crown className="w-4 h-4" style={{ color: colors.primary }} />
                          ) : (
                            <UserCheck className="w-4 h-4" style={{ color: colors.primary }} />
                          )}
                        </div>
                        <span className="font-medium" style={{ color: colors.textPrimary }}>
                          {position.position}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {position.id !== 0 ? (
                        <div className="flex items-center space-x-2">
                          <span style={{ color: colors.textPrimary }}>{position.staffName}</span>
                          <div className="flex items-center space-x-1">
                            <Button
                              onClick={() => {
                                setShowAddModal(true);
                                setModalTab('existing');
                                setSearchTerm('');
                                setErrorMessage('');
                                setAssigningToPosition(position.projectStaffId || position.id);
                                fetchCompanyStaffForPool();
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Change Staff"
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to unassign ${position.staffName} from this position?`)) {
                                  handleUnassignStaff(position.projectStaffId || position.id);
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Unassign Staff"
                            >
                              <UserX className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm italic" style={{ color: colors.textMuted }}>
                            Unassigned
                          </span>
                          <Button
                            onClick={() => {
                              setShowAddModal(true);
                              setModalTab('existing');
                              setSearchTerm('');
                              setErrorMessage('');
                              setAssigningToPosition(position.projectStaffId || position.id);
                              fetchCompanyStaffForPool();
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {position.utilization || 100}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {position.startDate && position.endDate 
                          ? `${new Date(position.startDate).toLocaleDateString()} - ${new Date(position.endDate).toLocaleDateString()}`
                          : 'Not specified'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {position.startDate ? new Date(position.startDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {position.endDate ? new Date(position.endDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: position.status === 'Active' ? colors.success + '20' : 
                                          position.status === 'Inactive' ? colors.error + '20' : 
                                          colors.textMuted + '20',
                          color: position.status === 'Active' ? colors.success : 
                                position.status === 'Inactive' ? colors.error : 
                                colors.textMuted
                        }}
                      >
                        {position.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setEditingPosition(position);
                            setErrorMessage('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveStaff(position.projectStaffId!)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        ) : (
          <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
            No staff assigned to this project
          </p>
        )}
      </Card>


      {/* Add Position Form */}
      {showAddPositionForm && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Add New Position
            </h3>
            <Button
              onClick={() => {
                setShowAddPositionForm(false);
                setNewPosition({
                  designation: '',
                  utilization: 100,
                  startDate: '',
                  endDate: '',
                  status: 'Active',
                  notes: ''
                });
                setErrorMessage('');
              }}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

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
                Position Designation *
              </label>
              <input
                type="text"
                value={newPosition.designation}
                onChange={(e) => setNewPosition(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="e.g., Project Manager, Senior Engineer, etc."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Utilization %
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newPosition.utilization}
                onChange={(e) => setNewPosition(prev => ({ ...prev, utilization: parseInt(e.target.value) || 100 }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Status
              </label>
              <select
                value={newPosition.status}
                onChange={(e) => setNewPosition(prev => ({ ...prev, status: e.target.value }))}
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
                Start Date
              </label>
              <input
                type="date"
                value={newPosition.startDate}
                onChange={(e) => setNewPosition(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
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
                value={newPosition.endDate}
                onChange={(e) => setNewPosition(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Notes
              </label>
              <textarea
                value={newPosition.notes}
                onChange={(e) => setNewPosition(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this position..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textPrimary,
                  borderColor: colors.border
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setShowAddPositionForm(false);
                setNewPosition({
                  designation: '',
                  utilization: 100,
                  startDate: '',
                  endDate: '',
                  status: 'Active',
                  notes: ''
                });
                setErrorMessage('');
              }}
              variant="ghost"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPosition}
              variant="primary"
              disabled={!newPosition.designation?.trim() || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creating...' : 'Create Position'}</span>
            </Button>
          </div>
        </Card>
      )}

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
                {assigningToPosition && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    Position: {projectStaff.find(p => (p.projectStaffId || p.id) === assigningToPosition)?.position || 'Unknown'}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setModalTab('existing');
                  setStaff([]);
                  setSearchTerm('');
                  setErrorMessage('');
                  setAssigningToPosition(null);
                }}
                className="p-2 hover:opacity-75 rounded-full transition-colors"
                style={{ color: colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `1px solid ${colors.error}` }}>
                <p className="text-sm" style={{ color: colors.error }}>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div>
                <div>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                      <input
                        type="text"
                        placeholder="Search staff by name, email, or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: colors.backgroundPrimary,
                          color: colors.textPrimary,
                          borderColor: colors.border
                        }}
                      />
                    </div>
                  </div>

                  {/* Staff List */}
                  {filteredStaff.length > 0 ? (
                    <div className="space-y-3">
                      {filteredStaff.map((staff) => (
                        <div 
                          key={staff.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                          style={{ 
                            backgroundColor: colors.backgroundPrimary,
                            borderColor: colors.border
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary + '20' }}
                            >
                              <User className="w-5 h-5" style={{ color: colors.primary }} />
                            </div>
                            <div>
                              <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                                {staff.staffName}
                              </h3>
                              {staff.email && (
                                <p className="text-sm" style={{ color: colors.textSecondary }}>
                                  {staff.email}
                                </p>
                              )}
                              {staff.position && (
                                <span 
                                  className="inline-block px-2 py-1 text-xs rounded-full mt-1"
                                  style={{ 
                                    backgroundColor: colors.primary + '20',
                                    color: colors.primary
                                  }}
                                >
                                  {staff.position}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => {
                                if (assigningToPosition) {
                                  handleAssignStaffToPosition(assigningToPosition, staff.id);
                                } else {
                                  setErrorMessage('No position selected for assignment');
                                }
                              }}
                              variant="primary"
                              size="sm"
                              disabled={isSubmitting}
                              className="px-4 py-2"
                            >
                              {isSubmitting ? 'Assigning...' : 'Assign'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
                      <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>
                        {searchTerm ? 'No staff found' : 'No available staff'}
                      </p>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {searchTerm 
                          ? 'Try adjusting your search terms' 
                          : 'All staff members are already assigned to this project'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setStaff([]);
                  setSearchTerm('');
                  setErrorMessage('');
                  setAssigningToPosition(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-75 disabled:opacity-50"
                style={{ 
                  color: colors.textSecondary,
                  borderColor: colors.border
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Edit Staff Member
            </h3>
            <Button
              onClick={() => setEditingStaff(null)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Staff Name *
              </label>
              <Input
                type="text"
                value={editingData.staffName || editingStaff.staffName}
                onChange={(e) => setEditingData(prev => ({ ...prev, staffName: e.target.value }))}
                placeholder="Enter staff name"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Email
              </label>
              <Input
                type="email"
                value={editingData.email !== undefined ? editingData.email : editingStaff.email}
                onChange={(e) => setEditingData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Phone
              </label>
              <Input
                type="tel"
                value={editingData.phone !== undefined ? editingData.phone : editingStaff.phone}
                onChange={(e) => setEditingData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Position
              </label>
              <Input
                type="text"
                value={editingData.position !== undefined ? editingData.position : editingStaff.position}
                onChange={(e) => setEditingData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Enter position"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setEditingStaff(null)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateStaff(editingStaff.id)}
              variant="primary"
              disabled={!editingData.staffName && !editingStaff.staffName}
            >
              Update Staff
            </Button>
          </div>
        </Card>
      )}

      {/* Position Edit Modal */}
      {editingPosition && (
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
                Edit Position Details
              </h2>
              <button
                onClick={() => {
                  setEditingPosition(null);
                  setErrorMessage('');
                }}
                className="p-2 hover:opacity-75 rounded-full transition-colors"
                style={{ color: colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `1px solid ${colors.error}` }}>
                <p className="text-sm" style={{ color: colors.error }}>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position Designation
                  </label>
                  <Input
                    value={editingPosition.position}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, position: e.target.value } : null)}
                    placeholder="Enter position designation"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Utilization (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingPosition.utilization || 100}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, utilization: parseInt(e.target.value) || 100 } : null)}
                    placeholder="Enter utilization percentage"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={editingPosition.startDate ? new Date(editingPosition.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={editingPosition.endDate ? new Date(editingPosition.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Status
                  </label>
                  <select
                    value={editingPosition.status || 'Active'}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="w-full p-3 rounded-lg border"
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Notes
                  </label>
                  <textarea
                    value={editingPosition.notes || ''}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Enter any additional notes"
                    rows={3}
                    className="w-full p-3 rounded-lg border resize-none"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.border
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex justify-end space-x-3 p-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={() => {
                  setEditingPosition(null);
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
                disabled={isSubmitting || !editingPosition?.position?.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-75 disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {isSubmitting ? 'Updating...' : 'Update Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
