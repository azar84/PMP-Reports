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
  UserCheck
} from 'lucide-react';

interface CompanyStaff {
  id: number;
  staffName: string;
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

  const [staff, setStaff] = useState<CompanyStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CompanyStaff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<CompanyStaff | null>(null);
  const [formData, setFormData] = useState<Partial<CompanyStaff>>({
    staffName: '',
    email: '',
    phone: '',
    position: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

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
      const staffData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
      };

      if (editingStaff) {
        const response = await put<{ success: boolean; data: CompanyStaff }>(`/api/admin/company-staff/${editingStaff.id}`, staffData);
        if (response.success) {
          setStaff(staff.map(s => s.id === editingStaff.id ? response.data : s));
        }
      } else {
        const response = await post<{ success: boolean; data: CompanyStaff }>('/api/admin/company-staff', staffData);
        if (response.success) {
          setStaff([response.data, ...staff]);
        }
      }

      setShowForm(false);
      setEditingStaff(null);
      setFormData({
        staffName: '',
        email: '',
        phone: '',
        position: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleEdit = (staffMember: CompanyStaff) => {
    setEditingStaff(staffMember);
    setFormData({
      staffName: staffMember.staffName,
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

  const filteredStaff = staff.filter(staffMember =>
    staffMember.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.position?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
          style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
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
                  Position
                </label>
                <Input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Project Director, Project Manager"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: 'rgba(229, 231, 235, 0.1)',
                    color: colors.textPrimary
                  }}
                />
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
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/20" style={{ backgroundColor: colors.backgroundPrimary }}>
                <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Name
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
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {staffMember.staffName}
                      </span>
                    </div>
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
    </div>
  );
}
