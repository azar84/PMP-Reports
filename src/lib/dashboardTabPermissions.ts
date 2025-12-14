/**
 * Dashboard Tab Permissions
 * Maps Dashboard tab IDs to their corresponding permission keys
 */

export type DashboardTabId = 'projects' | 'commercial';

/**
 * Maps tab IDs to their permission keys
 */
export const DASHBOARD_TAB_PERMISSION_MAP: Record<DashboardTabId, string> = {
  projects: 'dashboard.tab.projects',
  commercial: 'dashboard.tab.commercial',
};

/**
 * Get the permission key for a dashboard tab
 */
export function getDashboardTabPermission(tabId: DashboardTabId): string {
  return DASHBOARD_TAB_PERMISSION_MAP[tabId];
}

/**
 * Check if user has permission to access a specific dashboard tab
 */
export function hasDashboardTabPermission(
  permissions: string[] | null | undefined,
  tabId: DashboardTabId
): boolean {
  if (!permissions) {
    return false;
  }

  // Users with admin.all have access to all tabs
  if (permissions.includes('admin.all')) {
    return true;
  }

  // Check for the specific tab permission
  const permissionKey = getDashboardTabPermission(tabId);
  return permissions.includes(permissionKey);
}

/**
 * Filter tabs based on user permissions
 * Returns an array of tab IDs that the user has access to
 */
export function getAccessibleDashboardTabs(
  permissions: string[] | null | undefined
): DashboardTabId[] {
  if (!permissions) {
    return [];
  }

  // Users with admin.all have access to all tabs
  if (permissions.includes('admin.all')) {
    return Object.keys(DASHBOARD_TAB_PERMISSION_MAP) as DashboardTabId[];
  }

  // Filter tabs based on permissions
  return (Object.keys(DASHBOARD_TAB_PERMISSION_MAP) as DashboardTabId[]).filter((tabId) =>
    hasDashboardTabPermission(permissions, tabId)
  );
}
