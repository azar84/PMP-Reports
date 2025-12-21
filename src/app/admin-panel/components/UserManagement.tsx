'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Save, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  User,
  Calendar,
  Activity
} from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string; // Legacy field
  isActive: boolean;
  hasAllProjectsAccess?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{ id: number; name: string; isSystem: boolean }>;
  primaryRole?: string; // Primary role name from RBAC system
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  role: string;
  hasAllProjectsAccess?: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { permissions } = useUserPermissions();
  
  // Permission checks
  const canCreateUsers = hasPermission(permissions, 'users.create');
  const canUpdateUsers = hasPermission(permissions, 'users.update');
  const canDeleteUsers = hasPermission(permissions, 'users.delete');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userProjects, setUserProjects] = useState<Array<{ id: number; projectName: string; projectCode: string }>>([]);
  const [allProjects, setAllProjects] = useState<Array<{ id: number; projectName: string; projectCode: string; createdAt?: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [formData, setFormData] = useState<UserFormData & { hasAllProjectsAccess?: boolean }>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: '',
    hasAllProjectsAccess: false
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRoles(data.data);
          // Set default role to first role if formData.role is empty
          if (!formData.role && data.data.length > 0) {
            setFormData(prev => ({ ...prev, role: data.data[0].name }));
          }
        }
      } else {
        throw new Error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setMessage({ type: 'error', text: 'Failed to fetch roles' });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          hasAllProjectsAccess: formData.hasAllProjectsAccess || false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setShowCreateForm(false);
        const defaultRole = roles.length > 0 ? roles[0].name : '';
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          role: defaultRole
        });
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        hasAllProjectsAccess: formData.hasAllProjectsAccess || false,
        ...(formData.password && { password: formData.password })
      };

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User updated successfully' });
        setEditingUser(null);
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          role: 'admin'
        });
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update user' });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' });
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete user' });
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowPasswordReset(false);
        setResetEmail('');
      } else {
        throw new Error(data.error || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to request password reset' });
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowPasswordReset(false);
        setResetToken('');
        setNewPassword('');
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  // Edit user
  const handleEditUser = async (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.primaryRole || user.role, // Use primaryRole from RBAC system, fallback to legacy role
      hasAllProjectsAccess: user.hasAllProjectsAccess || false
    });
    
    // Load user's project memberships
    setLoadingProjects(true);
    try {
      const membershipsRes = await fetch(`/api/admin/users/${user.id}/project-memberships`);
      if (membershipsRes.ok) {
        const membershipsData = await membershipsRes.json();
        if (membershipsData.success) {
          setUserProjects(membershipsData.data.projects || []);
        }
      }

      // Load all projects and sort by createdAt (recent to oldest)
      const projectsRes = await fetch('/api/admin/projects');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        if (projectsData.success && Array.isArray(projectsData.data)) {
          const sortedProjects = projectsData.data
            .map((p: any) => ({
              id: p.id,
              projectName: p.projectName,
              projectCode: p.projectCode,
              createdAt: p.createdAt,
            }))
            .sort((a: any, b: any) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateB - dateA; // Recent to oldest
            });
          setAllProjects(sortedProjects);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    const defaultRole = roles.length > 0 ? roles[0].name : '';
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      role: defaultRole,
      hasAllProjectsAccess: false
    });
    setUserProjects([]);
    setAllProjects([]);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle toggle for all projects access
  const handleToggleAllProjectsAccess = async (enabled: boolean) => {
    if (!editingUser) return;
    
    setFormData(prev => ({ ...prev, hasAllProjectsAccess: enabled }));
    
    // Update immediately via API
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          hasAllProjectsAccess: enabled,
        }),
      });

      if (response.ok) {
        // Refresh user list
        await fetchUsers();
        
        if (enabled) {
          // Clear project memberships display when enabling all access
          setUserProjects([]);
        } else {
          // Reload project memberships if disabling all access
          const membershipsRes = await fetch(`/api/admin/users/${editingUser.id}/project-memberships`);
          if (membershipsRes.ok) {
            const membershipsData = await membershipsRes.json();
            if (membershipsData.success) {
              setUserProjects(membershipsData.data.projects || []);
            }
          }
        }
      } else {
        // Revert toggle on error
        const data = await response.json();
        setFormData(prev => ({ ...prev, hasAllProjectsAccess: !enabled }));
        setMessage({ type: 'error', text: data.error || 'Failed to update all projects access' });
      }
    } catch (error) {
      console.error('Error updating all projects access:', error);
      // Revert toggle on error
      setFormData(prev => ({ ...prev, hasAllProjectsAccess: !enabled }));
      setMessage({ type: 'error', text: 'Failed to update all projects access' });
    }
  };

  // Assign project to user
  const handleAssignProject = async (projectId: number) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}/project-memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserProjects([...userProjects, data.data]);
        setMessage({ type: 'success', text: 'Project assigned successfully' });
      } else {
        throw new Error(data.error || 'Failed to assign project');
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to assign project' });
    }
  };

  // Unassign project from user
  const handleUnassignProject = async (projectId: number) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}/project-memberships?projectId=${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserProjects(userProjects.filter(p => p.id !== projectId));
        setMessage({ type: 'success', text: 'Project unassigned successfully' });
      } else {
        throw new Error(data.error || 'Failed to unassign project');
      }
    } catch (error) {
      console.error('Error unassigning project:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to unassign project' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>User Management</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage admin users and their permissions</p>
        </div>
        {canCreateUsers && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg-primary)'
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 rounded-lg flex items-center space-x-2" style={{
          backgroundColor: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-error-light)',
          color: message.type === 'success' ? 'var(--color-success-dark)' : 'var(--color-error-dark)',
          border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
        }}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success-dark)' }} />
          ) : (
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-error-dark)' }} />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto"
            style={{ color: message.type === 'success' ? 'var(--color-success-dark)' : 'var(--color-error-dark)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New User</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Username *
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{ 
                    border: '1px solid var(--color-border-light)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-border-strong)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border-light)';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  }}
                  required
                >
                  {!formData.role && (
                    <option value="">Select a role</option>
                  )}
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
                style={{
                  backgroundColor: designSystem?.primaryColor || '#3B82F6'
                }}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Create User</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit User: {editingUser.username}</h3>
            <button
              onClick={handleCancelEdit}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Username *
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{ 
                    border: '1px solid var(--color-border-light)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-border-strong)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border-light)';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
                  }}
                  required
                >
                  {!formData.role && (
                    <option value="">Select a role</option>
                  )}
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Assignments Section */}
            <div className="mt-6 border-t pt-6" style={{ borderColor: 'var(--color-border-light)' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Project Assignments
                </h4>
              </div>
              
              <div className="mb-4">
                <Checkbox
                  checked={formData.hasAllProjectsAccess || false}
                  onChange={(e) => handleToggleAllProjectsAccess(e.target.checked)}
                  variant="primary"
                  size="md"
                  label="All Projects Access"
                  description="When enabled, user has access to all projects (including newly created ones)"
                />
              </div>

              {!formData.hasAllProjectsAccess && (
                <>
                {loadingProjects ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading projects...</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-secondary)' }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-bg-secondary)' }}>
                          <th className="text-left py-3 px-4 text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                            Project Name
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                            Project Code
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                            Assigned
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProjects.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                              <p className="text-sm">No projects available</p>
                            </td>
                          </tr>
                        ) : (
                          allProjects.map((project) => {
                            const isAssigned = userProjects.some(up => up.id === project.id);
                            return (
                              <tr
                                key={project.id}
                                className="border-b hover:bg-opacity-50 transition-colors"
                                style={{
                                  borderBottom: '1px solid var(--color-border-light)',
                                  backgroundColor: 'var(--color-bg-primary)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                                }}
                              >
                                <td className="py-3 px-4">
                                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {project.projectName}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {project.projectCode}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={isAssigned}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          handleAssignProject(project.id);
                                        } else {
                                          handleUnassignProject(project.id);
                                        }
                                      }}
                                      variant="primary"
                                      size="md"
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
                style={{
                  backgroundColor: designSystem?.primaryColor || '#3B82F6'
                }}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update User</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Password Reset Form */}
      {showPasswordReset && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Password Reset</h3>
            <button
              onClick={() => setShowPasswordReset(false)}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Email Address
              </label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter email to send reset link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Reset Token (if you have one)
              </label>
              <Input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Enter reset token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                variant="outline"
              >
                Cancel
              </Button>
              {resetToken && newPassword ? (
                <Button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="flex items-center space-x-2"
                  style={{
                    backgroundColor: designSystem?.primaryColor || '#3B82F6'
                  }}
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>Reset Password</span>
                </Button>
              ) : (
                <Button
                  onClick={handleRequestPasswordReset}
                  disabled={loading || !resetEmail}
                  className="flex items-center space-x-2"
                  style={{
                    backgroundColor: designSystem?.primaryColor || '#3B82F6'
                  }}
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  <span>Send Reset Link</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Admin Users</h3>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
            <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Created
                  </th>
                  {(canUpdateUsers || canDeleteUsers) && (
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: '1px solid var(--color-border-light)',
                      backgroundColor: 'var(--color-bg-primary)'
                    }}
                    className="hover:bg-opacity-50 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <User className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {user.name || user.username}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" style={{ 
                          color: (user.primaryRole || user.role) === 'SuperUser' ? 'var(--color-error)' : 
                          (user.primaryRole || user.role) === 'editor' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                        }} />
                        <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>
                          {user.primaryRole || user.role}
                        </span>
                        {user.roles && user.roles.some(r => r.isSystem) && (
                          <Lock className="w-3 h-3 ml-1" style={{ color: 'var(--color-text-secondary)' }} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                        backgroundColor: user.isActive ? 'var(--color-primary)' : 'var(--color-error-light)',
                        color: user.isActive ? 'var(--color-bg-primary)' : 'var(--color-error-dark)',
                        border: `1px solid ${user.isActive ? 'var(--color-primary)' : 'var(--color-error)'}`
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.lastLoginAt ? (
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {formatDate(user.lastLoginAt)}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    {(canUpdateUsers || canDeleteUsers) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {canUpdateUsers && (
                            <button
                              onClick={() => handleEditUser(user)}
                              style={{ color: 'var(--color-primary)' }}
                              title="Edit user"
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteUsers && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              style={{ color: 'var(--color-error)' }}
                              title="Delete user"
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </Card>
    </div>
  );
} 