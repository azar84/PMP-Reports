'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAuth } from '@/hooks/useAuth';
import { useAdminApi } from '@/hooks/useApi';
import { 
  User, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader,
  Mail,
  Lock,
  UserCircle,
  LogOut
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileManager() {
  const { user, logout } = useAuth();
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { put } = useAdminApi();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate password if new password is provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to change password' });
          setLoading(false);
          return;
        }

        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
          setLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New password and confirm password do not match' });
          setLoading(false);
          return;
        }
      }

      // Prepare update payload - only name, email, and password (no role or other fields)
      const updatePayload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Only include password if new password is provided
      if (formData.newPassword) {
        updatePayload.password = formData.newPassword;
      }

      await put(`/api/admin/users/${user?.id}`, updatePayload);

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      // Refresh user data after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>My Profile</h2>
          <p style={{ color: colors.textSecondary }}>Manage your personal information and password</p>
        </div>
        <Button
          type="button"
          onClick={() => logout()}
          className="flex items-center space-x-2"
          style={{
            backgroundColor: 'transparent',
            borderColor: colors.error,
            color: colors.error,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.error;
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.error;
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
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
        </div>
      )}

      {/* Profile Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.borderLight }}>
                <UserCircle className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Personal Information
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Update your name and email address
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Username
                </label>
                <Input
                  type="text"
                  value={user.username}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                    color: colors.textSecondary
                  }}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Username cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6" style={{ borderColor: colors.borderLight }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.borderLight }}>
                <Lock className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Change Password
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Leave blank to keep current password
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Required only if changing password
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: colors.textMuted }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: colors.textMuted }} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: colors.borderLight }}>
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
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
