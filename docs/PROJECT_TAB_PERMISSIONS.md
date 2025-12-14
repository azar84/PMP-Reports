# Project Tab Permissions

This document describes the RBAC system for controlling access to Project Manager tabs.

## Overview

The Project Manager component has multiple tabs (Overview, IPC, Suppliers, etc.) that can now be controlled via role-based permissions. Users can be granted or denied access to specific tabs based on their role.

## Implementation

### Permission Structure

Each project tab has its own permission key following the pattern: `projects.tab.{tabId}`

Example permissions:
- `projects.tab.overview` - Access to Project Overview tab
- `projects.tab.ipc` - Access to IPC (Interim Payment Certificates) tab
- `projects.tab.suppliers` - Access to Suppliers tab
- `projects.tab.planning` - Access to Planning tab
- etc.

### Available Tab Permissions

The following 18 tab permissions are available:

1. `projects.tab.overview` - Project Overview
2. `projects.tab.checklist` - Project Checklist
3. `projects.tab.staff` - Project Staff
4. `projects.tab.labours` - Project Labours
5. `projects.tab.labourSupply` - Project Labour Supply
6. `projects.tab.plants` - Project Plants
7. `projects.tab.assets` - Project Assets
8. `projects.tab.planning` - Project Planning
9. `projects.tab.quality` - Project Quality
10. `projects.tab.risks` - Project Risks
11. `projects.tab.hse` - Project HSE (Health, Safety, Environment)
12. `projects.tab.pictures` - Project Pictures
13. `projects.tab.closeOut` - Project Close Out
14. `projects.tab.clientFeedback` - Project Client Feedback
15. `projects.tab.commercial` - Project Commercial
16. `projects.tab.ipc` - Project IPC (Interim Payment Certificates)
17. `projects.tab.suppliers` - Project Suppliers
18. `projects.tab.subcontractors` - Project Subcontractors

### Files Modified

1. **`src/data/permission-catalog.json`**
   - Added 18 new special permissions for project tabs
   - These are automatically included in the seed process

2. **`src/lib/projectTabPermissions.ts`** (NEW)
   - Helper functions for checking tab permissions
   - `hasTabPermission()` - Check if user has access to a tab
   - `getAccessibleTabs()` - Get list of accessible tabs
   - `getTabPermission()` - Get permission key for a tab

3. **`src/app/admin-panel/components/ProjectManager.tsx`**
   - All tab buttons wrapped with permission checks
   - Tabs are only visible if user has the corresponding permission
   - Active tab automatically redirects to first accessible tab if current tab is not accessible

## Usage

### For Administrators

1. **Assign Tab Permissions to Roles:**
   - Go to Roles & Permissions section
   - Edit a role
   - Find permissions starting with `projects.tab.`
   - Grant access to desired tabs by allowing the permission

2. **SuperUser/Admin Roles:**
   - Users with `admin.all` permission automatically have access to all tabs
   - No need to assign individual tab permissions

### For Developers

**Check if user can access a tab:**
```typescript
import { hasTabPermission } from '@/lib/projectTabPermissions';

const canAccessIPC = hasTabPermission(permissions, 'ipc');
```

**Get all accessible tabs:**
```typescript
import { getAccessibleTabs } from '@/lib/projectTabPermissions';

const accessibleTabs = getAccessibleTabs(permissions);
// Returns: ['overview', 'ipc', 'suppliers', ...]
```

**Conditional rendering:**
```tsx
{hasTabPermission(permissions, 'ipc') && (
  <button onClick={() => setActiveTab('ipc')}>
    IPC Tab
  </button>
)}
```

## Database Seeding

To add the new tab permissions, simply run:

```bash
npm run db:seed
```

The seed script:
1. Reads all permissions from `permission-catalog.json`
2. Creates/updates all 18 tab permissions in the database (uses `upsert`)
3. Automatically assigns them to SuperUser and Admin roles (if roles exist)

**Note:** The seed script uses `upsert`, so it's safe for existing databases and won't delete data.

### After Adding Permissions

1. The new tab permissions will be available in the database
2. Go to Roles & Permissions UI
3. Edit roles to assign tab permissions as needed
4. SuperUser and Admin roles (if they exist) will already have all permissions if you used `db:seed`

## Behavior

### Tab Visibility
- Tabs are only visible if the user has the corresponding permission
- If a user has no tab permissions, no tabs will be shown (though they should at least have `projects.view` to see projects)

### Active Tab Handling
- If the currently active tab becomes inaccessible (e.g., permissions changed), the user is automatically redirected to the first accessible tab
- If no tabs are accessible, the component may show an error or empty state

### Admin All Permission
- Users with `admin.all` permission bypass all tab permission checks
- They automatically have access to all tabs
- This is handled by the `hasTabPermission()` function

## Example Use Cases

### Scenario 1: Financial Manager Role
**Goal:** Only allow access to financial-related tabs

**Permissions to grant:**
- `projects.tab.overview`
- `projects.tab.commercial`
- `projects.tab.ipc`
- `projects.tab.suppliers`
- `projects.tab.subcontractors`

### Scenario 2: Quality Assurance Role
**Goal:** Only allow access to quality and safety tabs

**Permissions to grant:**
- `projects.tab.overview`
- `projects.tab.quality`
- `projects.tab.hse`
- `projects.tab.risks`
- `projects.tab.pictures`

### Scenario 3: Project Coordinator Role
**Goal:** Allow access to operational tabs but not financial

**Permissions to grant:**
- `projects.tab.overview`
- `projects.tab.checklist`
- `projects.tab.staff`
- `projects.tab.labours`
- `projects.tab.labourSupply`
- `projects.tab.plants`
- `projects.tab.assets`
- `projects.tab.planning`

## Security Notes

⚠️ **Important:** 
- Tab visibility is for UX only - this does not secure the underlying data
- API routes should still enforce proper permissions at the server level
- Users may still be able to access tab content directly via API calls if not properly protected
- Always use `withRBAC()` or similar middleware on API routes

## Future Enhancements

Potential improvements:
1. Add create/update/delete permissions for individual tabs (e.g., `projects.tab.ipc.create`)
2. Tab-level feature permissions (e.g., can view IPC but cannot edit)
3. Project-level tab permissions (different tabs accessible per project)
4. Audit logging for tab access
