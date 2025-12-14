/**
 * Project Tab Permissions
 * Maps Project Manager tab IDs to their corresponding permission keys
 */

export type ProjectTabId =
  | 'overview'
  | 'checklist'
  | 'staff'
  | 'labours'
  | 'labourSupply'
  | 'plants'
  | 'assets'
  | 'planning'
  | 'quality'
  | 'risks'
  | 'hse'
  | 'pictures'
  | 'closeOut'
  | 'clientFeedback'
  | 'commercial'
  | 'ipc'
  | 'suppliers'
  | 'subcontractors';

/**
 * Maps tab IDs to their permission keys
 */
export const TAB_PERMISSION_MAP: Record<ProjectTabId, string> = {
  overview: 'projects.tab.overview',
  checklist: 'projects.tab.checklist',
  staff: 'projects.tab.staff',
  labours: 'projects.tab.labours',
  labourSupply: 'projects.tab.labourSupply',
  plants: 'projects.tab.plants',
  assets: 'projects.tab.assets',
  planning: 'projects.tab.planning',
  quality: 'projects.tab.quality',
  risks: 'projects.tab.risks',
  hse: 'projects.tab.hse',
  pictures: 'projects.tab.pictures',
  closeOut: 'projects.tab.closeOut',
  clientFeedback: 'projects.tab.clientFeedback',
  commercial: 'projects.tab.commercial',
  ipc: 'projects.tab.ipc',
  suppliers: 'projects.tab.suppliers',
  subcontractors: 'projects.tab.subcontractors',
};

/**
 * Get the permission key for a project tab
 */
export function getTabPermission(tabId: ProjectTabId): string {
  return TAB_PERMISSION_MAP[tabId];
}

/**
 * Check if user has permission to access a specific project tab
 */
export function hasTabPermission(
  permissions: string[] | null | undefined,
  tabId: ProjectTabId
): boolean {
  if (!permissions) {
    return false;
  }

  // Users with admin.all have access to all tabs
  if (permissions.includes('admin.all')) {
    return true;
  }

  // Check for the specific tab permission
  const permissionKey = getTabPermission(tabId);
  return permissions.includes(permissionKey);
}

/**
 * Filter tabs based on user permissions
 * Returns an array of tab IDs that the user has access to
 */
export function getAccessibleTabs(
  permissions: string[] | null | undefined
): ProjectTabId[] {
  if (!permissions) {
    return [];
  }

  // Users with admin.all have access to all tabs
  if (permissions.includes('admin.all')) {
    return Object.keys(TAB_PERMISSION_MAP) as ProjectTabId[];
  }

  // Filter tabs based on permissions
  return (Object.keys(TAB_PERMISSION_MAP) as ProjectTabId[]).filter((tabId) =>
    hasTabPermission(permissions, tabId)
  );
}
