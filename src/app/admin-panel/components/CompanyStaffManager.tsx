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
  Users
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
  projectStaff: Array<{
    id: number;
    designation: string;
    utilization: number;
    status: string;
    project: {
      id: number;
      projectName: string;
      projectCode: string;
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
      acc[assignment.designation] = (acc[assignment.designation] || 0) + 1;
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
                  Projects
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
                        {getTotalProjects(staffMember)}
                      </span>
                      {getTotalProjects(staffMember) > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {Object.entries(getProjectAssignments(staffMember)).map(([designation, count]) => (
                            <span 
                              key={designation}
                              className="px-1 py-0.5 text-xs rounded"
                              style={{ 
                                backgroundColor: designation.toLowerCase().includes('director') ? colors.info : 
                                               designation.toLowerCase().includes('manager') ? colors.success : 
                                               colors.primary, 
                                color: '#FFFFFF' 
                              }}
                            >
                              {count} {designation}
                            </span>
                          ))}
                        </div>
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
                        onClick={() => handleEdit(staffMember)}
                        variant="ghost"
                        className="p-2"
                        style={{ color: colors.primary }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(staffMember.id)}
                        variant="ghost"
                        className="p-2"
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
    </div>
  );
}
