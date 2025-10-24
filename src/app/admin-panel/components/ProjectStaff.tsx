'use client';

import React, { useState, useEffect } from 'react';
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
  totalUtilization?: number; // Total utilization across all projects
  remainingCapacity?: number; // Remaining capacity (100% - totalUtilization)
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

  const [staff, setStaff] = useState<Staff[]>([]);
  const [projectPositions, setProjectPositions] = useState<ProjectPosition[]>([]);
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
  const [editingStaffAssignment, setEditingStaffAssignment] = useState<ProjectStaffAssignment | null>(null);
  const [editingPosition, setEditingPosition] = useState<ProjectPosition | null>(null);
  const [editUseFullDuration, setEditUseFullDuration] = useState(false);
  
  // Add new staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffData, setNewStaffData] = useState<Partial<Staff>>({
    staffName: '',
    email: '',
    phone: '',
    position: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
    fetchProjectPositions();
  }, [projectId]);

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
        setProjectPositions(response.data);
      }
    } catch (error) {
      console.error('Error fetching project positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaffToPosition = async (positionId: number, staffId: number) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Find the staff member to get their remaining capacity
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) {
        throw new Error('Staff member not found');
      }

      // Use remaining capacity or default to 100% if not calculated
      const utilizationToAssign = staffMember.remainingCapacity || 100;

      const response = await post<{ success: boolean; data: any }>('/api/admin/project-staff', {
        positionId: positionId,
        staffId: staffId,
        utilization: utilizationToAssign,
        startDate: projectStartDate || '',
        endDate: projectEndDate || '',
        status: 'Active',
        notes: null,
      });
      
      if (response.success) {
        await fetchStaff(); // Refresh staff list to update utilization
        await fetchProjectPositions(); // Refresh project positions
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
      const response = await put<{ success: boolean; data: any }>(`/api/admin/project-staff/${editingStaffAssignment.id}`, {
        utilization: editingStaffAssignment.utilization,
        startDate: editingStaffAssignment.startDate,
        endDate: editingStaffAssignment.endDate,
        status: editingStaffAssignment.status,
        notes: editingStaffAssignment.notes,
      });

      if (response.success) {
        await fetchProjectPositions(); // Refresh project positions
        setEditingStaffAssignment(null);
        setEditUseFullDuration(false);
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
      const response = await post<{ success: boolean; data: Staff }>('/api/admin/company-staff', newStaffData);
      if (response.success) {
        await fetchStaff(); // Refresh staff list
        setNewStaffData({
          staffName: '',
          email: '',
          phone: '',
          position: '',
          isActive: true,
        });
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

  const filteredStaff = staff.filter(member =>
    member.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(member => {
    // Filter out staff who are already assigned to this project
    return !projectPositions.some(position => 
      position.staffAssignments.some(assignment => assignment.staffId === member.id)
    );
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
                                  ? `${new Date(assignment.startDate).toLocaleDateString()} - ${new Date(assignment.endDate).toLocaleDateString()}`
                                  : '-'
                                }
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>
                                {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ color: colors.textPrimary }}>
                                {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}
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
                                      
                                      setEditingStaffAssignment({
                                        ...assignment,
                                        position: position
                                      });
                                      setEditUseFullDuration(false);
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

              {/* Add New Staff Button */}
              <div className="mb-6">
                <Button
                  onClick={() => {
                    setShowAddStaffModal(true);
                    setNewStaffData({
                      staffName: '',
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useFullDuration"
                      checked={editUseFullDuration}
                      onChange={(e) => {
                        setEditUseFullDuration(e.target.checked);
                        if (e.target.checked) {
                          setEditingStaffAssignment({
                            ...editingStaffAssignment,
                            startDate: projectStartDate || null,
                            endDate: projectEndDate || null
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor="useFullDuration" className="text-sm" style={{ color: colors.textPrimary }}>
                      Use full project duration ({projectStartDate ? new Date(projectStartDate).toLocaleDateString() : 'TBD'} - {projectEndDate ? new Date(projectEndDate).toLocaleDateString() : 'TBD'})
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          onChange={(e) => setEditingStaffAssignment({
                            ...editingStaffAssignment,
                            startDate: e.target.value || null
                          })}
                          value={editingStaffAssignment.startDate || ''}
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
                          onChange={(e) => setEditingStaffAssignment({
                            ...editingStaffAssignment,
                            endDate: e.target.value || null
                          })}
                          value={editingStaffAssignment.endDate || ''}
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
                disabled={isSubmitting}
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
                  setNewStaffData({
                    staffName: '',
                    email: '',
                    phone: '',
                    position: '',
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Position
                  </label>
                  <Input
                    type="text"
                    value={newStaffData.position || ''}
                    onChange={(e) => setNewStaffData({ ...newStaffData, position: e.target.value })}
                    placeholder="e.g., Senior Engineer, Project Coordinator"
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setNewStaffData({
                      staffName: '',
                      email: '',
                      phone: '',
                      position: '',
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