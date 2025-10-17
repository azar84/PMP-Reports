'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
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
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'admin'
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

  useEffect(() => {
    fetchUsers();
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setShowCreateForm(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          role: 'admin'
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
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      role: 'admin'
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>User Management</h2>
          <p style={{ color: colors.textSecondary }}>Manage admin users and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPasswordReset(true)}
            className="flex items-center space-x-2"
            style={{
              backgroundColor: designSystem?.primaryColor || '#3B82F6'
            }}
          >
            <Lock className="w-4 h-4" />
            <span>Password Reset</span>
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
            style={{
              backgroundColor: designSystem?.primaryColor || '#3B82F6'
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto"
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
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                      <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.grayLight }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
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
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                      <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.grayLight }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
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
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
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
                    <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
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
          <div className="text-sm" style={{ color: colors.textMuted }}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2" style={{ color: colors.textSecondary }}>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.textMuted }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: colors.grayLight }}>
              <thead style={{ backgroundColor: colors.backgroundSecondary }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: colors.backgroundPrimary }}>
                {users.map((user) => (
                  <tr key={user.id} style={{ backgroundColor: colors.backgroundPrimary }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.grayLight }}>
                            <User className="w-5 h-5" style={{ color: colors.textSecondary }} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            {user.name || user.username}
                          </div>
                          <div className="text-sm" style={{ color: colors.textSecondary }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" style={{ 
                          color: user.role === 'admin' ? colors.error : 
                          user.role === 'editor' ? colors.primary : colors.textSecondary
                        }} />
                        <span className="text-sm capitalize" style={{ color: colors.textPrimary }}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                        backgroundColor: user.isActive ? colors.success : colors.error,
                        color: user.isActive ? colors.textPrimary : colors.textPrimary
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textSecondary }}>
                      {user.lastLoginAt ? (
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {formatDate(user.lastLoginAt)}
                        </div>
                      ) : (
                        <span style={{ color: colors.textMuted }}>Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textSecondary }}>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          style={{ color: colors.primary }}
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ color: colors.error }}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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