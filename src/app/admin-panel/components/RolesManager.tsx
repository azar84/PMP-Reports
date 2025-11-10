'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { PERMISSIONS, type PermissionDefinition } from '@/lib/permissionsCatalog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

  const activePermissionKeys = useMemo(() => {
    if (!selectedRole) {
      return new Set<string>();
    }
    return new Set(
      selectedRole.permissions
        .filter((permission) => permission.action !== 'deny')
        .map((permission) => permission.key)
    );
  }, [selectedRole]);

  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    const grouped = new Map<string, PermissionGroup>();

    permissionDefinitions.forEach((definition) => {
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
  }, [permissionDefinitions]);

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

      await put(`/api/admin/roles/${selectedRole.id}`, {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
      });

      await fetchRoles();
      setSuccessMessage('Role updated successfully');
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
      await del(`/api/admin/roles/${selectedRole.id}`);
      setSelectedRoleId(null);
      await fetchRoles();
      setSuccessMessage('Role deleted successfully');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePermission = async (permissionKey: string) => {
    if (!selectedRole || !canUpdateRoles) {
      return;
    }

    const updatedPermissions = new Set(activePermissionKeys);
    if (updatedPermissions.has(permissionKey)) {
      updatedPermissions.delete(permissionKey);
    } else {
      updatedPermissions.add(permissionKey);
    }

    try {
      setSaving(true);
      setError(null);
      await put(`/api/admin/roles/${selectedRole.id}/permissions`, {
        permissions: Array.from(updatedPermissions).map((key) => ({
          key,
          action: 'allow',
        })),
      });
      await fetchRoles();
      setSuccessMessage('Role permissions updated successfully');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Roles & Permissions
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage role definitions, assign permissions, and control user access across the admin
            panel.
          </p>
        </div>
        {canCreateRoles && (
          <Button
            onClick={() => {
              setSelectedRoleId(null);
              setRoleForm(defaultRoleForm);
            }}
            className="flex items-center space-x-2"
            style={{ backgroundColor: colors.primary, color: colors.backgroundPrimary }}
          >
            <Plus className="w-4 h-4" />
            <span>New Role</span>
          </Button>
        )}
      </div>

      {(loading || permissionsLoading) && (
        <div className="rounded-lg border p-6 text-sm" style={{ borderColor: colors.borderLight }}>
          Loading roles and permissions...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: colors.error }}>
          {error}
        </div>
      )}

      {!loading && successMessage && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: colors.success }}>
          {successMessage}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            className="p-0 border overflow-hidden"
            style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }}
          >
            <div className="p-4 border-b" style={{ borderColor: colors.borderLight }}>
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Roles
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: colors.borderLight }}>
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected ? 'bg-opacity-70' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? colors.borderStrong : 'transparent',
                      color: colors.textPrimary,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {role.isSystem ? 'System role' : `${role.userCount} assigned users`}
                        </p>
                      </div>
                      {role.isSystem && (
                        <ShieldCheck className="w-4 h-4" style={{ color: colors.success }} />
                      )}
                    </div>
                  </button>
                );
              })}
              {roles.length === 0 && (
                <div className="px-4 py-6 text-sm" style={{ color: colors.textSecondary }}>
                  No roles found. Create your first role to get started.
                </div>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card
              className="p-6 border"
              style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  {selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create Role'}
                </h3>
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

              <form className="space-y-4" onSubmit={selectedRole ? (e) => e.preventDefault() : handleCreateRole}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Role Name
                  </label>
                  <Input
                    value={roleForm.name}
                    onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter role name"
                    disabled={saving || (selectedRole?.isSystem ?? false)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(event) =>
                      setRoleForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Describe the responsibilities and access level of this role"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.borderLight,
                      color: colors.textPrimary,
                    }}
                    rows={3}
                    disabled={saving || (selectedRole?.isSystem ?? false)}
                  />
                </div>

                <div className="flex justify-end space-x-2">
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

            {selectedRole && (
              <Card
                className="p-6 border space-y-4"
                style={{
                  borderColor: colors.borderLight,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    Permissions
                  </h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Toggle permissions to determine what this role can access. View permissions control
                    navigation visibility; create/update/delete unlock actions.
                  </p>
                </div>

                <div className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div key={group.resource} className="border rounded-lg" style={{ borderColor: colors.borderLight }}>
                      <div
                        className="px-4 py-2 border-b"
                        style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                      >
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {group.label}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        {group.permissions.map((definition) => {
                          const isChecked = activePermissionKeys.has(definition.key);
                          return (
                            <label
                              key={definition.key}
                              className="flex items-start space-x-3 text-sm cursor-pointer"
                              style={{ color: colors.textPrimary }}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(definition.key)}
                                disabled={!canUpdateRoles || saving || selectedRole.isSystem}
                              />
                              <span>
                                <span className="font-medium block">{definition.label}</span>
                                <span className="text-xs" style={{ color: colors.textSecondary }}>
                                  {definition.description}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

