'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
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
}

interface ProjectStaffMember {
  id: number;
  projectId: number;
  staffId: number | null;
  designation: string;
  utilization: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  staff: Staff | null;
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

  const [staff, setStaff] = useState<Staff[]>([]);
  const [projectStaff, setProjectStaff] = useState<ProjectStaffMember[]>([]);
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

  // Position modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [assigningToPosition, setAssigningToPosition] = useState<number | null>(null);
  const [editingPosition, setEditingPosition] = useState<ProjectStaffMember | null>(null);
  const [editUseFullDuration, setEditUseFullDuration] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchProjectStaff();
  }, []);

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

  const fetchProjectStaff = async () => {
    try {
      const response = await get<{ success: boolean; data: ProjectStaffMember[] }>(`/api/admin/project-staff?projectId=${projectId}`);
      if (response.success) {
        setProjectStaff(response.data);
      }
    } catch (error) {
      console.error('Error fetching project staff:', error);
    } finally {
      setLoading(false);
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

  const handlePositionSelect = async (position: Position) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', {
        projectId: projectId,
        staffId: null, // No staff assigned initially
        designation: position.name,
        utilization: 100,
        status: 'Active',
        startDate: projectStartDate || '',
        endDate: projectEndDate || '',
        notes: null,
      });

      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
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

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${editingPosition.id}`, {
        utilization: editingPosition.utilization,
        startDate: editingPosition.startDate,
        endDate: editingPosition.endDate,
        status: editingPosition.status,
        notes: editingPosition.notes,
      });

      if (response.success) {
        await fetchProjectStaff(); // Refresh project staff
        setEditingPosition(null);
        setEditUseFullDuration(false);
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
    if (confirm('Are you sure you want to unassign staff from this position?')) {
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
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (confirm('Are you sure you want to delete this position?')) {
      try {
        const response = await del(`/api/admin/project-staff/${positionId}`) as { success: boolean };
        if (response.success) {
          await fetchProjectStaff(); // Refresh project staff
        }
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const filteredStaff = staff.filter(member =>
    member.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                {projectStaff.map((member) => (
                  <tr key={member.id} className="border-b" style={{ borderColor: colors.border }}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span style={{ color: colors.textPrimary }}>{member.designation}</span>
                        {member.designation === 'Project Director' && (
                          <Crown className="w-4 h-4" style={{ color: colors.warning }} />
                        )}
                        {member.designation === 'Project Manager' && (
                          <UserCheck className="w-4 h-4" style={{ color: colors.success }} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {member.staff ? (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <div>
                            <p className="font-medium" style={{ color: colors.textPrimary }}>{member.staff.staffName}</p>
                            {member.staff.email && (
                              <div className="flex items-center space-x-1 text-xs" style={{ color: colors.textSecondary }}>
                                <Mail className="w-3 h-3" />
                                <span>{member.staff.email}</span>
                              </div>
                            )}
                            {member.staff.phone && (
                              <div className="flex items-center space-x-1 text-xs" style={{ color: colors.textSecondary }}>
                                <Phone className="w-3 h-3" />
                                <span>{member.staff.phone}</span>
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
                      <span style={{ color: colors.textPrimary }}>{member.utilization}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {member.startDate && member.endDate 
                          ? `${new Date(member.startDate).toLocaleDateString()} - ${new Date(member.endDate).toLocaleDateString()}`
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {member.startDate ? new Date(member.startDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span style={{ color: colors.textPrimary }}>
                        {member.endDate ? new Date(member.endDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          member.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {member.staff ? (
                          <>
                            <Button
                              onClick={() => handleUnassignStaff(member.id)}
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
                              setAssigningToPosition(member.id);
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
                            setEditingPosition(member);
                            setEditUseFullDuration(false);
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePosition(member.id)}
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
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No staff assigned yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Add positions and assign staff to get started
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
                    {projectStaff.find(p => p.id === assigningToPosition)?.designation}
                  </span>
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setAssigningToPosition(null);
                  setSearchTerm('');
                }}
                variant="ghost"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                <Input
                  type="text"
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: colors.backgroundPrimary }}
                />
              </div>

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
                        handleAssignStaffToPosition(assigningToPosition, member.id);
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
                            {member.position && (
                              <span>{member.position}</span>
                            )}
                            {member.email && (
                              <span>{member.email}</span>
                            )}
                            {member.phone && (
                              <span>{member.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Assign</span>
                      </Button>
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
                    {searchTerm ? 'Try adjusting your search terms' : 'Add staff members to the company first'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                    Utilization %
                  </label>
                  <input
                    type="number"
                    value={editingPosition.utilization || 0}
                    onChange={(e) => setEditingPosition(prev => prev ? { ...prev, utilization: parseInt(e.target.value) || 0 } : null)}
                    min="0"
                    max="100"
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