'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, ShieldCheck, Trash2, Check, X, Layout, Lock } from 'lucide-react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { PERMISSIONS, type PermissionDefinition } from '@/lib/permissionsCatalog';
import { TAB_PERMISSION_MAP, ProjectTabId } from '@/lib/projectTabPermissions';
import { DASHBOARD_TAB_PERMISSION_MAP, DashboardTabId } from '@/lib/dashboardTabPermissions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface ApiRole {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Array<{
    key: string;
    action: 'allow' | 'deny';
  }>;
  userCount: number;
}

interface PermissionGroup {
  resource: string;
  label: string;
  permissions: PermissionDefinition[];
}

const defaultRoleForm = {
  name: '',
  description: '',
};

// Tab display configuration
const TAB_DISPLAY_CONFIG: Record<ProjectTabId, { icon?: string; label: string }> = {
  overview: { label: 'Overview' },
  checklist: { label: 'Checklist' },
  staff: { label: 'Staff' },
  labours: { label: 'Labours' },
  labourSupply: { label: 'Labour Supply' },
  plants: { label: 'Plants' },
  assets: { label: 'Assets' },
  planning: { label: 'Planning' },
  quality: { label: 'Quality' },
  risks: { label: 'Risks' },
  hse: { label: 'HSE' },
  pictures: { label: 'Pictures' },
  closeOut: { label: 'Close Out' },
  clientFeedback: { label: 'Client Feedback' },
  commercial: { label: 'Commercial' },
  ipc: { label: 'IPC' },
  suppliers: { label: 'Suppliers' },
  subcontractors: { label: 'Subcontractors' },
};

// Dashboard tab display configuration
const DASHBOARD_TAB_DISPLAY_CONFIG: Record<DashboardTabId, { icon?: string; label: string }> = {
  projects: { label: 'Projects' },
  commercial: { label: 'Commercial' },
};

export default function RolesManager() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { permissions: userPermissions, isLoading: permissionsLoading } = useUserPermissions();

  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleForm, setRoleForm] = useState(defaultRoleForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canCreateRoles = hasPermission(userPermissions, PERMISSIONS.ROLES_CREATE);
  const canUpdateRoles = hasPermission(userPermissions, PERMISSIONS.ROLES_UPDATE);
  const canDeleteRoles = hasPermission(userPermissions, PERMISSIONS.ROLES_DELETE);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  // Optimistic state for permissions (updates immediately, syncs with server)
  // This is the source of truth for what the user sees
  const [optimisticPermissions, setOptimisticPermissions] = useState<Set<string> | null>(null);
  
  // Track if we're currently updating to prevent interference
  const isUpdatingPermissionsRef = useRef(false);

  // Initialize optimistic permissions from selected role (only when role ID changes)
  const prevSelectedRoleIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only initialize if role ID actually changed (user selected different role)
    if (prevSelectedRoleIdRef.current === selectedRoleId) {
      return;
    }
    
    prevSelectedRoleIdRef.current = selectedRoleId;
    
    // Don't reset if we're in the middle of updating permissions
    if (isUpdatingPermissionsRef.current) {
      return;
    }

    if (selectedRole) {
      const serverPermissions = new Set(
        selectedRole.permissions
          .filter((permission) => permission.action !== 'deny')
          .map((permission) => permission.key)
      );
      setOptimisticPermissions(serverPermissions);
      latestOptimisticPermissionsRef.current = serverPermissions;
    } else {
      setOptimisticPermissions(null);
      latestOptimisticPermissionsRef.current = new Set();
    }
  }, [selectedRoleId, selectedRole]);

  // activePermissionKeys always uses optimisticPermissions if available
  const activePermissionKeys = useMemo(() => {
    if (!selectedRole) {
      return new Set<string>();
    }
    
    // Always use optimistic permissions if they exist (they're the source of truth)
    if (optimisticPermissions !== null) {
      return optimisticPermissions;
    }
    
    // Fallback to server permissions (should only happen on initial load)
    return new Set(
      selectedRole.permissions
        .filter((permission) => permission.action !== 'deny')
        .map((permission) => permission.key)
    );
  }, [selectedRole, optimisticPermissions]);

  // Separate permissions into categories
  const tabPermissions = useMemo(() => {
    return permissionDefinitions.filter((def) => def.key.startsWith('projects.tab.'));
  }, [permissionDefinitions]);

  const dashboardTabPermissions = useMemo(() => {
    return permissionDefinitions.filter((def) => def.key.startsWith('dashboard.tab.'));
  }, [permissionDefinitions]);

  // Settings submenu items: Users, Roles, Design System, Site Settings
  // Note: Scheduler is only accessible to superusers (admin.all)
  const settingsSubmenuResources = ['users', 'roles', 'design-system', 'settings'];
  
  const settingsPermissions = useMemo(() => {
    return permissionDefinitions.filter((def) => 
      settingsSubmenuResources.includes(def.resource)
    );
  }, [permissionDefinitions]);

  const otherPermissions = useMemo(() => {
    return permissionDefinitions.filter(
      (def) => 
        !def.key.startsWith('projects.tab.') && 
        !def.key.startsWith('dashboard.tab.') &&
        !settingsSubmenuResources.includes(def.resource) &&
        def.key !== 'admin.all'
    );
  }, [permissionDefinitions]);

  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    const grouped = new Map<string, PermissionGroup>();

    otherPermissions.forEach((definition) => {
      // Skip admin.all - handle separately
      if (definition.key === 'admin.all') {
        return;
      }

      const existing = grouped.get(definition.resource);
      const groupLabel = definition.resource
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');

      if (existing) {
        existing.permissions.push(definition);
      } else {
        grouped.set(definition.resource, {
          resource: definition.resource,
          label: groupLabel,
          permissions: [definition],
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [otherPermissions]);

  const fetchRoles = async () => {
    const response = await get<{ success: boolean; data: ApiRole[] }>('/api/admin/roles');
    setRoles(response.data);
    if (!selectedRoleId && response.data.length > 0) {
      setSelectedRoleId(response.data[0].id);
    }
  };

  const fetchPermissionDefinitions = async () => {
    const response = await get<{ success: boolean; data: PermissionDefinition[] }>(
      '/api/admin/permissions'
    );
    setPermissionDefinitions(response.data);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchRoles(), fetchPermissionDefinitions()]);
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'Failed to load roles');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setRoleForm({
        name: selectedRole.name,
        description: selectedRole.description ?? '',
      });
    } else {
      setRoleForm(defaultRoleForm);
    }
  }, [selectedRole]);

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreateRoles) return;
    if (!roleForm.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
      };

      const response = await post<{ success: boolean; data: ApiRole }>('/api/admin/roles', payload);
      if (response.success) {
        await fetchRoles();
        setSelectedRoleId(response.data.id);
        setRoleForm(defaultRoleForm);
        setSuccessMessage('Role created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Save role details
      await put(`/api/admin/roles/${selectedRole.id}`, {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
      });

      // Also save permissions if there are unsaved changes
      if (hasUnsavedChanges && optimisticPermissions !== null) {
        const permissionsToSave = Array.from(optimisticPermissions).map((key) => ({
          key,
          action: 'allow' as const,
        }));
        
        const response = await put<{ success: boolean; data: Array<{ key: string; action: 'allow' | 'deny' }> }>(
          `/api/admin/roles/${selectedRole.id}/permissions`,
          {
            permissions: permissionsToSave,
          }
        );
        
        if (response.success && response.data) {
          // Update the role in the roles array with server response
          setRoles(prevRoles => prevRoles.map(role => 
            role.id === selectedRole.id 
              ? { ...role, permissions: response.data as Array<{ key: string; action: 'allow' | 'deny' }> }
              : role
          ));
          
          // Sync optimistic state with saved permissions
          const savedPermissions = new Set(response.data.map(p => p.key));
          setOptimisticPermissions(savedPermissions);
          latestOptimisticPermissionsRef.current = savedPermissions;
        }
      }

      await fetchRoles();
      setSuccessMessage('Role updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || !canDeleteRoles) {
      return;
    }

    if (selectedRole.isSystem) {
      setError('System roles cannot be deleted.');
      return;
    }

    if (!confirm(`Delete role "${selectedRole.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      await del(`/api/admin/roles/${selectedRole.id}`);
      setSelectedRoleId(null);
      await fetchRoles();
      setSuccessMessage('Role deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  // Track the latest optimistic permissions
  const latestOptimisticPermissionsRef = useRef<Set<string>>(new Set());

  const handleTogglePermission = (permissionKey: string) => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    // Get current permissions from optimistic state (source of truth)
    const currentPermissions = optimisticPermissions !== null
      ? optimisticPermissions
      : activePermissionKeys;
    
    const updatedPermissions = new Set(currentPermissions);
    if (updatedPermissions.has(permissionKey)) {
      updatedPermissions.delete(permissionKey);
    } else {
      updatedPermissions.add(permissionKey);
    }

    // Update optimistic state immediately (this is what user sees)
    setOptimisticPermissions(new Set(updatedPermissions));
    latestOptimisticPermissionsRef.current = new Set(updatedPermissions);
      setError(null);
  };

  const handleSelectAllTabs = () => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    const allTabKeys = tabPermissions.map((perm) => perm.key);
    const currentPermissions = optimisticPermissions !== null ? optimisticPermissions : activePermissionKeys;
    const updatedPermissions = new Set(currentPermissions);
    allTabKeys.forEach((key) => updatedPermissions.add(key));

    // Optimistic update only (no auto-save)
    setOptimisticPermissions(new Set(updatedPermissions));
    latestOptimisticPermissionsRef.current = new Set(updatedPermissions);
    setError(null);
  };

  const handleDeselectAllTabs = () => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    const allTabKeys = tabPermissions.map((perm) => perm.key);
    const currentPermissions = optimisticPermissions !== null ? optimisticPermissions : activePermissionKeys;
    const updatedPermissions = new Set(currentPermissions);
    allTabKeys.forEach((key) => updatedPermissions.delete(key));

    // Optimistic update only (no auto-save)
    setOptimisticPermissions(new Set(updatedPermissions));
    latestOptimisticPermissionsRef.current = new Set(updatedPermissions);
    setError(null);
  };

  const handleSelectAllDashboardTabs = () => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    const allTabKeys = dashboardTabPermissions.map((perm) => perm.key);
    const currentPermissions = optimisticPermissions !== null ? optimisticPermissions : activePermissionKeys;
    const updatedPermissions = new Set(currentPermissions);
    allTabKeys.forEach((key) => updatedPermissions.add(key));

    // Optimistic update only (no auto-save)
    setOptimisticPermissions(new Set(updatedPermissions));
    latestOptimisticPermissionsRef.current = new Set(updatedPermissions);
    setError(null);
  };

  const handleDeselectAllDashboardTabs = () => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    const allTabKeys = dashboardTabPermissions.map((perm) => perm.key);
    const currentPermissions = optimisticPermissions !== null ? optimisticPermissions : activePermissionKeys;
    const updatedPermissions = new Set(currentPermissions);
    allTabKeys.forEach((key) => updatedPermissions.delete(key));

    // Optimistic update only (no auto-save)
    setOptimisticPermissions(new Set(updatedPermissions));
    latestOptimisticPermissionsRef.current = new Set(updatedPermissions);
    setError(null);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!selectedRole || optimisticPermissions === null) {
      return false;
    }
    const serverPermissions = new Set(
      selectedRole.permissions
        .filter((permission) => permission.action !== 'deny')
        .map((permission) => permission.key)
    );
    if (optimisticPermissions.size !== serverPermissions.size) {
      return true;
    }
    for (const key of optimisticPermissions) {
      if (!serverPermissions.has(key)) {
        return true;
      }
    }
    for (const key of serverPermissions) {
      if (!optimisticPermissions.has(key)) {
        return true;
      }
    }
    return false;
  }, [selectedRole, optimisticPermissions]);

  const selectedTabsCount = useMemo(() => {
    return tabPermissions.filter((perm) => activePermissionKeys.has(perm.key)).length;
  }, [tabPermissions, activePermissionKeys]);

  const selectedDashboardTabsCount = useMemo(() => {
    return dashboardTabPermissions.filter((perm) => activePermissionKeys.has(perm.key)).length;
  }, [dashboardTabPermissions, activePermissionKeys]);

  const hasAdminAll = activePermissionKeys.has('admin.all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            Roles & Permissions
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Manage role definitions, assign permissions, and control user access across the admin panel.
          </p>
        </div>
        {canCreateRoles && (
          <Button
            onClick={() => {
              setSelectedRoleId(null);
              setRoleForm(defaultRoleForm);
              setError(null);
              setSuccessMessage(null);
            }}
            className="flex items-center space-x-2 px-4 py-2"
            style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
          >
            <Plus className="w-5 h-5" />
            <span>New Role</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div
          className="rounded-lg border p-4 flex items-center justify-between"
          style={{
            borderColor: colors.error,
            backgroundColor: `${colors.error}15`,
          }}
        >
          <span className="text-sm" style={{ color: colors.error }}>
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="ml-4"
            style={{ color: colors.error }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className="rounded-lg border p-4 flex items-center justify-between"
          style={{
            borderColor: colors.success,
            backgroundColor: `${colors.success}15`,
          }}
        >
          <span className="text-sm" style={{ color: colors.success }}>
            {successMessage}
          </span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-4"
            style={{ color: colors.success }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {(loading || permissionsLoading) && (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: colors.primary }}></div>
          <p className="text-sm mt-4" style={{ color: colors.textSecondary }}>
            Loading roles and permissions...
          </p>
        </div>
      )}

      {!loading && !permissionsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles List */}
          <Card
            className="p-0 border overflow-hidden"
            style={{
              borderColor: colors.borderLight,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <div
              className="p-4 border-b"
              style={{
                borderColor: colors.borderLight,
                backgroundColor: colors.backgroundPrimary,
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Roles
              </h3>
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                {roles.length} {roles.length === 1 ? 'role' : 'roles'}
              </p>
            </div>
            <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto" style={{ borderColor: colors.borderLight }}>
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected ? 'font-semibold' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}20` : 'transparent',
                      color: isSelected ? colors.primary : colors.textPrimary,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p>{role.name}</p>
                      {role.isSystem && (
                            <Lock className="w-3 h-3" style={{ color: colors.textSecondary }} />
                      )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                          {role.isSystem ? 'System role' : `${role.userCount} user${role.userCount !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {roles.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: colors.textSecondary }}>
                  No roles found. Create your first role to get started.
                </div>
              )}
            </div>
          </Card>

          {/* Role Details & Permissions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Role Form */}
            <Card
              className="p-6 border"
              style={{
                borderColor: colors.borderLight,
                backgroundColor: colors.backgroundSecondary,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                    {selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
                </h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {selectedRole
                      ? 'Update role details and permissions'
                      : 'Define a new role with custom permissions'}
                  </p>
                </div>
                {selectedRole && canDeleteRoles && !selectedRole.isSystem && (
                  <Button
                    variant="ghost"
                    onClick={handleDeleteRole}
                    className="flex items-center space-x-2"
                    style={{ color: colors.error }}
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>

              <form
                className="space-y-4"
                onSubmit={selectedRole ? (e) => e.preventDefault() : handleCreateRole}
              >
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.textPrimary }}
                  >
                    Role Name *
                  </label>
                  <Input
                    value={roleForm.name}
                    onChange={(event) =>
                      setRoleForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="e.g., Project Manager, Site Engineer"
                    disabled={saving || (selectedRole?.isSystem ?? false)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.textPrimary }}
                  >
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(event) =>
                      setRoleForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Describe the responsibilities and access level of this role"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                    rows={3}
                    disabled={saving || (selectedRole?.isSystem ?? false)}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  {selectedRole ? (
                    <Button
                      type="button"
                      onClick={handleUpdateRole}
                      disabled={!canUpdateRoles || saving || selectedRole.isSystem}
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.backgroundPrimary,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!canCreateRoles || saving}
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.backgroundPrimary,
                      }}
                    >
                      {saving ? 'Creating...' : 'Create Role'}
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Permissions Section */}
            {selectedRole && (
              <div className="space-y-6">
                {hasUnsavedChanges && (
              <Card
                    className="p-3 border"
                    style={{
                      borderColor: colors.warning || colors.primary,
                      backgroundColor: `${colors.warning || colors.primary}15`,
                    }}
                  >
                    <p className="text-sm" style={{ color: colors.textPrimary }}>
                      You have unsaved permission changes. Click "Save Changes" above to save them.
                    </p>
                  </Card>
                )}
                {/* Superuser Access */}
                {permissionDefinitions.find((p) => p.key === 'admin.all') && (
                  <Card
                    className="p-6 border"
                    style={{
                      borderColor: hasAdminAll ? colors.primary : colors.borderLight,
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <ShieldCheck
                          className="w-5 h-5"
                          style={{ color: hasAdminAll ? colors.primary : colors.textSecondary }}
                        />
                        <div>
                          <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
                            Superuser Access
                          </h4>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            Grants full administrative access to all modules and features
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={hasAdminAll}
                          onChange={() => handleTogglePermission('admin.all')}
                          disabled={!canUpdateRoles || selectedRole.isSystem}
                        />
                        <div
                          className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 bg-gray-300"
                        ></div>
                      </label>
                    </div>
                  </Card>
                )}

                {/* Project Tabs Section */}
                {!hasAdminAll && (
              <Card
                    className="p-6 border"
                style={{
                  borderColor: colors.borderLight,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Layout className="w-5 h-5" style={{ color: colors.primary }} />
                <div>
                          <h4 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                            Project Manager Tabs
                          </h4>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                            Control access to specific tabs in the Project Manager
                            {selectedTabsCount > 0 && (
                              <span className="ml-1 font-medium" style={{ color: colors.primary }}>
                                ({selectedTabsCount} selected)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={handleSelectAllTabs}
                          disabled={!canUpdateRoles || selectedRole.isSystem}
                          className="text-xs px-3 py-1"
                          style={{ color: colors.primary }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleDeselectAllTabs}
                          disabled={!canUpdateRoles || selectedRole.isSystem}
                          className="text-xs px-3 py-1"
                          style={{ color: colors.textSecondary }}
                        >
                          Clear All
                        </Button>
                      </div>
                </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {tabPermissions.map((tabPerm) => {
                        const tabId = tabPerm.key.replace('projects.tab.', '') as ProjectTabId;
                        const tabConfig = TAB_DISPLAY_CONFIG[tabId];
                        const isChecked = activePermissionKeys.has(tabPerm.key);

                        return (
                          <button
                            key={tabPerm.key}
                            onClick={() => {
                              if (!selectedRole.isSystem && canUpdateRoles) {
                                handleTogglePermission(tabPerm.key);
                              }
                            }}
                            disabled={!canUpdateRoles || selectedRole.isSystem}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isChecked ? 'shadow-md' : ''
                            } ${
                              !selectedRole.isSystem && canUpdateRoles
                                ? 'cursor-pointer hover:shadow-md'
                                : 'cursor-not-allowed opacity-60'
                            }`}
                            style={{
                              borderColor: isChecked ? colors.primary : colors.borderLight,
                              backgroundColor: isChecked
                                ? `${colors.primary}10`
                                : colors.backgroundPrimary,
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="font-medium text-sm"
                                style={{ color: isChecked ? colors.primary : colors.textPrimary }}
                              >
                                {tabConfig?.label || tabPerm.label.replace('Project ', '').replace(' Tab', '')}
                              </span>
                              {isChecked && (
                                <Check
                                  className="w-4 h-4 flex-shrink-0"
                                  style={{ color: colors.primary }}
                                />
                              )}
                            </div>
                            <p
                              className="text-xs line-clamp-2"
                              style={{ color: colors.textSecondary }}
                            >
                              {tabPerm.description}
                        </p>
                          </button>
                        );
                      })}
                      </div>
                  </Card>
                )}

                {/* Dashboard Tabs Section */}
                {!hasAdminAll && dashboardTabPermissions.length > 0 && (
                  <Card
                    className="p-6 border"
                    style={{
                      borderColor: colors.borderLight,
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Layout className="w-5 h-5" style={{ color: colors.primary }} />
                        <div>
                          <h4 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                            Dashboard Tabs
                          </h4>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            Control access to specific tabs in the Dashboard
                            {selectedDashboardTabsCount > 0 && (
                              <span className="ml-1 font-medium" style={{ color: colors.primary }}>
                                ({selectedDashboardTabsCount} selected)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={handleSelectAllDashboardTabs}
                          disabled={!canUpdateRoles || selectedRole.isSystem}
                          className="text-xs px-3 py-1"
                          style={{ color: colors.primary }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleDeselectAllDashboardTabs}
                          disabled={!canUpdateRoles || selectedRole.isSystem}
                          className="text-xs px-3 py-1"
                          style={{ color: colors.textSecondary }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {dashboardTabPermissions.map((tabPerm) => {
                        const tabId = tabPerm.key.replace('dashboard.tab.', '') as DashboardTabId;
                        const tabConfig = DASHBOARD_TAB_DISPLAY_CONFIG[tabId];
                        const isChecked = activePermissionKeys.has(tabPerm.key);

                          return (
                          <button
                            key={tabPerm.key}
                            onClick={() => {
                              if (!selectedRole.isSystem && canUpdateRoles) {
                                handleTogglePermission(tabPerm.key);
                              }
                            }}
                            disabled={!canUpdateRoles || selectedRole.isSystem}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isChecked ? 'shadow-md' : ''
                            } ${
                              !selectedRole.isSystem && canUpdateRoles
                                ? 'cursor-pointer hover:shadow-md'
                                : 'cursor-not-allowed opacity-60'
                            }`}
                            style={{
                              borderColor: isChecked ? colors.primary : colors.borderLight,
                              backgroundColor: isChecked
                                ? `${colors.primary}10`
                                : colors.backgroundPrimary,
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="font-medium text-sm"
                                style={{ color: isChecked ? colors.primary : colors.textPrimary }}
                              >
                                {tabConfig?.label || tabPerm.label.replace('Dashboard ', '').replace(' Tab', '')}
                              </span>
                              {isChecked && (
                                <Check
                                  className="w-4 h-4 flex-shrink-0"
                                  style={{ color: colors.primary }}
                                />
                              )}
                            </div>
                            <p
                              className="text-xs line-clamp-2"
                              style={{ color: colors.textSecondary }}
                            >
                              {tabPerm.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Settings Permissions - Submenu Access */}
                {!hasAdminAll && settingsPermissions.length > 0 && (
                  <Card
                    className="p-6 border"
                    style={{
                      borderColor: colors.borderLight,
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <ShieldCheck className="w-5 h-5" style={{ color: colors.primary }} />
                        <h4 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                          Settings Submenu Access
                        </h4>
                      </div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Control access to submenu items under Settings (Users, Roles, Scheduler, Design System, Site Settings)
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className="border-b"
                            style={{ borderColor: colors.borderLight }}
                          >
                            <th
                              className="text-left py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Submenu Item
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              View
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Create
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Update
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Delete
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {settingsSubmenuResources.map((resource) => {
                            const resourcePermissions = settingsPermissions.filter(
                              (p) => p.resource === resource
                            );
                            if (resourcePermissions.length === 0) return null;

                            const viewPerm = resourcePermissions.find((p) => p.key.endsWith('.view'));
                            const createPerm = resourcePermissions.find((p) => p.key.endsWith('.create'));
                            const updatePerm = resourcePermissions.find((p) => p.key.endsWith('.update'));
                            const deletePerm = resourcePermissions.find((p) => p.key.endsWith('.delete'));

                            // Settings and Design System only have View permission
                            const isViewOnly = resource === 'settings' || resource === 'design-system';
                            
                            // Skip Create, Update, Delete for view-only resources
                            const showCreate = createPerm && !isViewOnly;
                            const showUpdate = updatePerm && !isViewOnly;
                            const showDelete = deletePerm && !isViewOnly;

                            const resourceLabel = resource
                              .split('-')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');

                            return (
                              <tr
                                key={resource}
                                className="border-b hover:bg-opacity-50 transition-colors"
                                style={{
                                  borderColor: colors.borderLight,
                                  backgroundColor: 'transparent',
                                }}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                                    {resourceLabel}
                                </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {viewPerm && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(viewPerm.key)}
                                        onChange={() => handleTogglePermission(viewPerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {showCreate && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(createPerm.key)}
                                        onChange={() => handleTogglePermission(createPerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {showUpdate && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(updatePerm.key)}
                                        onChange={() => handleTogglePermission(updatePerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {showDelete && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(deletePerm.key)}
                                        onChange={() => handleTogglePermission(deletePerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                          );
                        })}
                        </tbody>
                      </table>
                      </div>
                  </Card>
                )}

                {/* General Permissions - Tabular Format */}
                {!hasAdminAll && permissionGroups.length > 0 && (
                  <Card
                    className="p-6 border"
                    style={{
                      borderColor: colors.borderLight,
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                        General Permissions
                      </h4>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Manage access to different modules and operations across the system
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className="border-b"
                            style={{ borderColor: colors.borderLight }}
                          >
                            <th
                              className="text-left py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Module
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              View
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Create
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Update
                            </th>
                            <th
                              className="text-center py-3 px-4 text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              Delete
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissionGroups.map((group) => {
                            const viewPerm = group.permissions.find((p) => p.key.endsWith('.view'));
                            const createPerm = group.permissions.find((p) => p.key.endsWith('.create'));
                            const updatePerm = group.permissions.find((p) => p.key.endsWith('.update'));
                            const deletePerm = group.permissions.find((p) => p.key.endsWith('.delete'));

                            return (
                              <tr
                                key={group.resource}
                                className="border-b hover:bg-opacity-50 transition-colors"
                                style={{
                                  borderColor: colors.borderLight,
                                  backgroundColor: 'transparent',
                                }}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                                    {group.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {viewPerm && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(viewPerm.key)}
                                        onChange={() => handleTogglePermission(viewPerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {createPerm && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(createPerm.key)}
                                        onChange={() => handleTogglePermission(createPerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {updatePerm && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(updatePerm.key)}
                                        onChange={() => handleTogglePermission(updatePerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {deletePerm && (
                                    <div className="flex justify-center">
                                      <Checkbox
                                        variant="primary"
                                        size="md"
                                        checked={activePermissionKeys.has(deletePerm.key)}
                                        onChange={() => handleTogglePermission(deletePerm.key)}
                                        disabled={!canUpdateRoles || selectedRole.isSystem}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                </div>
                  </Card>
                )}
              </div>
            )}

            {!selectedRole && (
              <Card
                className="p-12 border text-center"
                style={{
                  borderColor: colors.borderLight,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textSecondary }} />
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Select a role from the list or create a new one to manage permissions
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
