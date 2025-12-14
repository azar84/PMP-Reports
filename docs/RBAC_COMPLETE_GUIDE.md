# RBAC Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Permission System](#permission-system)
4. [Roles and Default Roles](#roles-and-default-roles)
5. [Getting Started](#getting-started)
6. [API Route Protection](#api-route-protection)
7. [Project Access Control](#project-access-control)
8. [Client-Side Permission Checks](#client-side-permission-checks)
9. [Admin UI Components](#admin-ui-components)
10. [Sidebar Menu Filtering](#sidebar-menu-filtering)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The RBAC (Role-Based Access Control) system provides comprehensive, tenant-scoped access control for the PMP Reports application. It features:

- **Tenant Isolation**: All resources are scoped to tenants
- **Menu-Based CRUD Permissions**: Granular permissions for each menu item (Create, View, Update, Delete)
- **Role-Based Access**: Users get permissions through role assignments
- **Project-Level Control**: Users can be restricted to specific projects or granted access to all projects
- **SuperUser Role**: Special role with `admin.all` permission that bypasses all checks
- **Audit Logging**: Security-relevant actions are logged
- **Dynamic UI**: Sidebar and UI elements adapt based on user permissions

---

## Architecture

### Database Schema

The RBAC system uses the following tables:

- **`Tenant`**: Represents companies/organizations (multi-tenant support)
- **`Permission`**: Catalog of available permissions (49 total)
- **`Role`**: Roles that group permissions (tenant-scoped)
- **`RolePermission`**: Maps permissions to roles with allow/deny actions
- **`UserRole`**: Assigns roles to users (one role per user)
- **`ProjectMembership`**: Links users to specific projects (for visibility control)
- **`AuditLog`**: Security event logging

All resource models include `tenantId` for tenant isolation:
- AdminUser
- Project
- Client
- Consultant
- CompanyStaff
- Labour

### Permission Evaluation Flow

1. User authenticates → JWT access and refresh tokens issued (stored in HTTP-only cookies)
   - Access token includes: `userId`, `tenantId`, `role`, `username`, `hasAllProjectsAccess`
   - Access token expires in 15 minutes, refresh token in 7 days
2. Request arrives → Middleware extracts and verifies access token
   - If expired, automatically refreshes using refresh token
   - Checks token blacklist (for logged-out tokens)
3. Extract user ID and tenant ID from verified token
4. Get user's role → Load role for user in tenant
5. Get role permissions → Load all permissions for the role
6. Check `admin.all` → If present, grant all permissions (bypass checks)
7. Check permission → Verify user has required permission (allow vs deny)
8. Check context → Apply constraints (project membership, tenant match, etc.)
9. Allow/deny → Grant or deny access, log decision

### Authentication Security

The system now includes enhanced security features:

- **HTTP-only cookies**: Tokens stored securely, protected from XSS attacks
- **Token refresh**: Short-lived access tokens automatically refreshed
- **Token blacklisting**: Immediate invalidation on logout
- **Rate limiting**: Login endpoint protected against brute force
- **CSRF protection**: SameSite cookie attribute prevents CSRF attacks

For more details, see `AUTHENTICATION_IMPROVEMENTS.md` in the project root.

### Core Services

- **`src/lib/rbac.ts`**: Permission evaluation engine
  - `getUserEffectivePermissions()`: Get user's effective permissions
  - `hasPermission()`: Check single permission
  - `hasAnyPermission()`: OR logic (user needs at least one)
  - `hasAllPermissions()`: AND logic (user needs all)
  - `getUserProjectMemberships()`: Get user's accessible projects
  - `getUserTenant()`: Get user's tenant ID
  - `hasProjectAccess()`: Check if user can access a specific project
  - `verifyTenantAccess()`: Verify tenant matches

- **`src/lib/audit.ts`**: Security event logging
  - `auditLog()`: Generic logging
  - `auditPermissionDenial()`: Log permission denials
  - `auditStaffMovement()`: Staff movement tracking
  - `auditLabourMovement()`: Labour movement tracking
  - `auditRoleChange()`: Role/permission changes

- **`src/middleware/rbac.ts`**: API route protection
  - `withRBAC()`: Permission wrapper for routes
  - `withProjectScope()`: Project-scoped actions (deprecated in favor of manual checks)

- **`src/lib/permissions-catalog.ts`**: Permission catalog definition
  - `MENU_ITEMS`: List of all menu items
  - `CRUD_OPERATIONS`: List of CRUD operations
  - `getPermissionKey()`: Generate permission key
  - `getDefaultPermissions()`: Get all default permissions

---

## Permission System

### Menu-Based CRUD Permissions

The system uses a menu-based permission structure where each menu item has 4 CRUD operations:

#### Menu Items (12 total)

1. **Projects** (`projects`)
2. **Clients** (`clients`)
3. **Consultants** (`consultants`)
4. **Staff** (`staff`)
5. **Labours** (`labours`)
6. **Contacts** (`contacts`)
7. **Media Library** (`media`)
8. **Users** (`users`)
9. **Roles & Permissions** (`roles`)
10. **Scheduler** (`scheduler`)
11. **Design System** (`design-system`)
12. **Settings** (`settings`)

#### CRUD Operations (4 per menu item)

- **Create** (`create`): Create new resources
- **View** (`view`): View/list resources
- **Update** (`update`): Edit existing resources
- **Delete** (`delete`): Delete resources

#### Permission Keys

Permissions are formatted as: `{menuItem}.{operation}`

Examples:
- `projects.create` - Create new projects
- `projects.view` - View projects list
- `projects.update` - Edit existing projects
- `projects.delete` - Delete projects
- `staff.create` - Create new staff members
- `clients.view` - View clients list

#### Special Permission

- **`admin.all`**: Full administrative access that bypasses all permission checks. Users with this permission have access to everything.

### Total Permissions

- 1 special permission (`admin.all`)
- 12 menu items × 4 CRUD operations = 48 permissions
- **Total: 49 permissions**

### Permission Evaluation Rules

1. **Default Deny**: If a permission is not granted, access is denied
2. **Deny Wins**: If a permission has both `allow` and `deny`, `deny` takes precedence
3. **Admin All Bypass**: Users with `admin.all` permission bypass all checks
4. **Tenant Isolation**: All permission checks are scoped to the user's tenant

---

## Roles and Default Roles

### Default Roles Created on Seed

When you run `npm run db:seed`, the following roles are created:

#### 1. SuperUser (System Role)

- **Permissions**: ALL 49 permissions (including `admin.all`)
- **Access**: Full system access with no restrictions
- **Project Access**: All projects (hasAllProjectsAccess = true)
- **Auto-Assigned**: Automatically assigned to the default admin user (username: `admin`)
- **Description**: "Super user with full access to everything - bypasses all restrictions"
- **Protected**: Cannot be deleted or edited (isSystem = true)

#### 2. Admin (System Role)

- **Permissions**: ALL 49 permissions (including `admin.all`)
- **Access**: Full system access (same as SuperUser, kept for backward compatibility)
- **Description**: "Full system administrator with all permissions"
- **Protected**: Cannot be deleted or edited (isSystem = true)

#### 3. Project Manager (Custom Role)

- **Permissions**: Various project and resource management permissions
- **Visibility**: Can be configured per user (project memberships)
- **Description**: Can be customized after creation

#### 4. Custom Roles

You can create custom roles with specific permission sets as needed.

### Role Assignment Rules

- **One Role Per User**: Each user can have only one role at a time
- **System Roles**: Cannot be deleted or edited (marked with `isSystem = true`)
- **Role Deletion**: Cannot delete roles that have users assigned

---

## Getting Started

### Step 1: Database Migration

```bash
# Apply migrations
npx prisma migrate deploy

# Regenerate Prisma Client (IMPORTANT!)
npx prisma generate

# Seed default data (tenant, permissions, roles, admin user)
npm run db:seed
```

### Step 2: Verify Setup

After seeding, you should have:

- ✅ Default tenant (ID: 1, name: "Default Company")
- ✅ 49 permissions created
- ✅ SuperUser role with all permissions
- ✅ Admin role with all permissions
- ✅ Default admin user (username: `admin`, password: `admin123`)
- ✅ Admin user assigned SuperUser role
- ✅ Admin user has `hasAllProjectsAccess = true`

### Step 3: Test Login

```bash
# Start development server
npm run dev

# Login with:
# Username: admin
# Password: admin123
```

### Default Admin User

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`
- **Role**: SuperUser (with `admin.all` permission)
- **Project Access**: All projects
- **Permissions**: All 49 permissions (full access)

---

## API Route Protection

### Using `withRBAC` Middleware

#### Basic Permission Check

```typescript
// src/app/api/admin/projects/route.ts
import { withRBAC, RBACRequest } from '@/middleware/rbac';
import { PERMISSIONS } from '@/lib/rbac';

export const GET = withRBAC(
  PERMISSIONS.PROJECTS_VIEW,
  async (request: RBACRequest, context) => {
    // context contains: { userId, tenantId }
    
    const projects = await prisma.project.findMany({
      where: {
        tenantId: context.tenantId, // Always scope by tenant
      },
    });

    return NextResponse.json({ success: true, data: projects });
  }
);
```

#### Multiple Permissions (OR Logic)

```typescript
export const GET = withRBAC(
  [PERMISSIONS.PROJECTS_VIEW, PERMISSIONS.CLIENTS_VIEW],
  async (request: RBACRequest, context) => {
    // User needs at least one of these permissions
  }
);
```

#### POST Route (Create)

```typescript
export const POST = withRBAC(
  PERMISSIONS.PROJECTS_CREATE,
  async (request: RBACRequest, context) => {
    const body = await request.json();
    
    const project = await prisma.project.create({
      data: {
        tenantId: context.tenantId, // Always include tenantId
        ...body,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  }
);
```

#### PUT Route (Update)

```typescript
export const PUT = withRBAC(
  PERMISSIONS.PROJECTS_UPDATE,
  async (request: RBACRequest, context, { params }) => {
    const { id } = await params;
    const body = await request.json();
    
    const project = await prisma.project.update({
      where: {
        id: parseInt(id),
        tenantId: context.tenantId, // Verify tenant match
      },
      data: body,
    });

    return NextResponse.json({ success: true, data: project });
  }
);
```

#### DELETE Route

```typescript
export const DELETE = withRBAC(
  PERMISSIONS.PROJECTS_DELETE,
  async (request: RBACRequest, context, { params }) => {
    const { id } = await params;
    
    await prisma.project.delete({
      where: {
        id: parseInt(id),
        tenantId: context.tenantId, // Verify tenant match
      },
    });

    return NextResponse.json({ success: true });
  }
);
```

### Manual Permission Checks (Complex Logic)

For complex scenarios where you need more control:

```typescript
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { getUserTenant } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  // Authenticate (use existing auth middleware)
  const user = await authenticate(request);
  
  const tenantId = await getUserTenant(user.id);
  const body = await request.json();

  // Check permission manually
  const result = await hasPermission(
    PERMISSIONS.STAFF_CREATE,
    {
      userId: user.id,
      tenantId: tenantId!,
      projectId: body.projectId,
      staffId: body.staffId,
    }
  );

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: result.reason },
      { status: 403 }
    );
  }

  // Proceed with operation
}
```

### Tenant Scoping (CRITICAL)

**Always filter by tenant in all queries:**

```typescript
// ✅ Correct
const projects = await prisma.project.findMany({
  where: {
    tenantId: context.tenantId,
    // ... other filters
  },
});

// ❌ Wrong - missing tenant filter
const projects = await prisma.project.findMany({
  where: {
    // Missing tenantId!
  },
});
```

---

## Project Access Control

### Project Access Model

Users can have two types of project access:

1. **All Projects Access** (`hasAllProjectsAccess = true`): User can access all projects in their tenant
2. **Specific Projects Access** (`hasAllProjectsAccess = false`): User can only access projects they're assigned to via `ProjectMembership`

### Checking Project Access

```typescript
import { getUserProjectMemberships, hasProjectAccess } from '@/lib/rbac';

// Get user's accessible project IDs
// Returns:
// - null: User has access to all projects (hasAllProjectsAccess = true OR has admin.all)
// - []: User has no project access
// - [1, 2, 3]: User has access to specific projects
const projectIds = await getUserProjectMemberships(userId);

// Check if user can access a specific project
const canAccess = await hasProjectAccess(userId, projectId);
// Returns true if:
// - User has admin.all permission
// - User has hasAllProjectsAccess = true
// - User has a ProjectMembership for the project
```

### Filtering Projects by Access

```typescript
import { getUserProjectMemberships } from '@/lib/rbac';

export const GET = withRBAC(
  PERMISSIONS.PROJECTS_VIEW,
  async (request: RBACRequest, context) => {
    const projectIds = await getUserProjectMemberships(context.userId);
    
    const where: any = {
      tenantId: context.tenantId,
    };

    // Filter by project access (if not all projects)
    if (projectIds !== null) {
      // User has specific project access
      where.id = { in: projectIds };
    }
    // If projectIds is null, user has access to all projects (no filter needed)

    const projects = await prisma.project.findMany({
      where,
    });

    return NextResponse.json({ success: true, data: projects });
  }
);
```

### Managing Project Access

API endpoint: `PUT /api/admin/users/[id]/projects`

```typescript
// Grant access to all projects
{
  hasAllProjectsAccess: true,
  projectIds: [] // Ignored when hasAllProjectsAccess is true
}

// Grant access to specific projects
{
  hasAllProjectsAccess: false,
  projectIds: [1, 2, 3]
}
```

---

## Client-Side Permission Checks

### Using `useUserPermissions` Hook

```typescript
// In a React component
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';

function MyComponent() {
  const { permissions, loading } = useUserPermissions();
  
  // Check if user has permission
  const canCreateProjects = hasPermission(permissions, 'projects.create');
  const canViewStaff = hasPermission(permissions, 'staff.view');
  
  // Check multiple permissions (OR logic)
  const canAccessReports = hasAnyPermission(permissions, [
    'projects.view',
    'reports.view'
  ]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {canCreateProjects && (
        <button>Create Project</button>
      )}
      {canViewStaff && (
        <StaffList />
      )}
    </div>
  );
}
```

### Conditional UI Rendering

Example from `ProjectManager.tsx`:

```typescript
const { permissions } = useUserPermissions();
const canCreateClients = hasPermission(permissions, 'clients.create');
const canCreateConsultants = hasPermission(permissions, 'consultants.create');
const canCreateStaff = hasPermission(permissions, 'staff.create');
const canCreateLabours = hasPermission(permissions, 'labours.create');
const canCreateContacts = hasPermission(permissions, 'contacts.create');

// Conditionally render create buttons
{canCreateClients && (
  <Button onClick={() => setShowClientForm(true)}>
    New Client
  </Button>
)}

{canCreateStaff && (
  <section>
    <h3>Additional Staff</h3>
    <p>Add new staff members...</p>
    <Button>Add Staff Member</Button>
  </section>
)}
```

### Important Security Note

⚠️ **Client-side checks are for UX only!**

- Always enforce permissions on the **server side** (API routes)
- Client-side filtering prevents confusion but doesn't secure
- Users can bypass UI if they know URLs
- All API routes must use `withRBAC()` middleware

---

## Admin UI Components

### Role Manager

**Location**: `/admin-panel` → "Roles & Permissions" section

**Features**:
- View all roles with permission and user counts
- Create new roles
- Edit role name and description (system roles are protected)
- Delete roles (system roles and roles with users cannot be deleted)
- Manage permissions with inline permission matrix
- "All" checkbox for each menu item to toggle all CRUD permissions at once
- Search/filter roles

**Permission Required**: `roles.view` to see, `roles.create/update/delete` to manage

**API Endpoints**:
- `GET /api/admin/roles` - List all roles
- `POST /api/admin/roles` - Create role
- `GET /api/admin/roles/[id]` - Get role details
- `PUT /api/admin/roles/[id]` - Update role
- `DELETE /api/admin/roles/[id]` - Delete role
- `PUT /api/admin/roles/[id]/permissions` - Update permissions (bulk)

### User Management

**Location**: `/admin-panel` → "Users" section

**Features**:
- View all users with role assignments
- Create new users
- Edit user details (username, email, password, name)
- Assign roles to users (radio button selection - one role per user)
- Manage project access (all projects or specific projects)
- Activate/deactivate users
- Reset passwords

**Permission Required**: `users.view` to see, `users.create/update/delete` to manage

**API Endpoints**:
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `PUT /api/admin/users/[id]/projects` - Manage project access
- `POST /api/admin/user-roles` - Assign role to user
- `DELETE /api/admin/user-roles?userId=X&roleId=Y` - Remove role from user

### Permission Matrix

The permission matrix in Role Manager shows:
- All menu items in rows
- CRUD operations (Create, View, Update, Delete) in columns
- "All" checkbox column to toggle all CRUD permissions per menu item
- State indicators:
  - ✅ **Green/Checked** = Allow
  - ❌ **Red/Checked** = Deny
  - ⚪ **Unchecked** = Not set (default deny)

---

## Sidebar Menu Filtering

### Overview

The sidebar menu items are dynamically filtered based on user permissions using the menu-based CRUD permission system. Users will only see menu items they have the `*.view` permission to access. This provides a clean, permission-aware navigation experience.

### How It Works

The sidebar filtering is implemented using:

1. **Client-Side Hook**: `useUserPermissions()` hook fetches and caches user's effective permissions
2. **API Endpoint**: `GET /api/admin/user-permissions` returns user's permission keys
3. **Navigation Filtering**: `getNavigationItems()` filters menu items based on permissions
4. **Permission Check**: Each menu item checks if user has the required `*.view` permission

### Menu Items and Required Permissions

Each menu item in the sidebar requires a specific `*.view` permission to be visible:

| Menu Item | Required Permission | Notes |
|-----------|-------------------|-------|
| Dashboard/Home | None (always visible) | Always shown |
| Projects | `projects.view` | View projects list |
| Clients | `clients.view` | View clients list |
| Consultants | `consultants.view` | View consultants list |
| Staff | `staff.view` | View staff members |
| Labours | `labours.view` | View labours list |
| Contacts | `contacts.view` | View contacts list |
| Media Library | `media.view` | View media library |
| Users | `users.view` | View users list |
| Roles & Permissions | `roles.view` | View roles and permissions |
| Scheduler | `scheduler.view` | View scheduler |
| Design System | `design-system.view` | View design system |
| Settings | `settings.view` | View settings |

### Implementation Details

#### Navigation Configuration

The sidebar menu is configured in `src/app/admin-panel/page.tsx`:

```typescript
const NAVIGATION_CONFIG = [
  { id: 'dashboard', name: 'Home', icon: Home, permission: null }, // Always visible
  { id: 'projects', name: 'Projects', icon: FileText, permission: 'projects.view' },
  { id: 'clients', name: 'Clients', icon: Building2, permission: 'clients.view' },
  { id: 'consultants', name: 'Consultants', icon: Users, permission: 'consultants.view' },
  { id: 'company-staff', name: 'Staff', icon: User, permission: 'staff.view' },
  { id: 'labours', name: 'Labours', icon: HardHat, permission: 'labours.view' },
  { id: 'contacts', name: 'Contacts', icon: Users, permission: 'contacts.view' },
  { id: 'media-library', name: 'Media Library', icon: FolderOpen, permission: 'media.view' },
  { id: 'users', name: 'Users', icon: Users, permission: 'users.view' },
  { id: 'roles', name: 'Roles & Permissions', icon: Shield, permission: 'roles.view' },
  { id: 'scheduler', name: 'Scheduler', icon: Clock, permission: 'scheduler.view' },
  { id: 'design-system', name: 'Design System', icon: Layers, permission: 'design-system.view' },
  { id: 'site-settings', name: 'Settings', icon: Settings, permission: 'settings.view' },
];
```

#### Filtering Logic

The `getNavigationItems()` function filters menu items:

```typescript
const getNavigationItems = (designSystem: any, userPermissions: string[] = []) => {
  return NAVIGATION_CONFIG.filter(item => {
    // Always show dashboard
    if (!item.permission) return true;
    
    // Check if user has admin.all (sees everything)
    if (userPermissions.includes('admin.all')) return true;
    
    // Check if user has specific permission
    return userPermissions.includes(item.permission);
  });
};
```

### Adding New Menu Items

To add a new menu item with permission control:

1. **Add to NAVIGATION_CONFIG:**
```typescript
{ 
  id: 'new-section', 
  name: 'New Section', 
  icon: IconName, 
  permission: 'new-section.view' // Use *.view permission
}
```

2. **Add to Section type:**
```typescript
type Section = '...' | 'new-section';
```

3. **Add case in render function:**
```typescript
case 'new-section':
  return <NewSectionComponent />;
```

4. **Ensure permission exists** in the permissions catalog (it will be created automatically on seed)

### Examples

#### User with Limited Permissions (e.g., Project Manager Role)
- ✅ Dashboard (always visible)
- ✅ Projects (`projects.view`)
- ✅ Clients (`clients.view`)
- ✅ Consultants (`consultants.view`)
- ✅ Contacts (`contacts.view`)
- ✅ Media Library (`media.view`)
- ❌ Staff (no `staff.view`)
- ❌ Labours (no `labours.view`)
- ❌ Users (no `users.view`)
- ❌ Roles & Permissions (no `roles.view`)
- ❌ Settings (no `settings.view`)

#### User with SuperUser Role (has `admin.all`)
- ✅ All menu items (has `admin.all` which grants all permissions including all `*.view` permissions)

### Best Practices

#### Permission Assignment
- **Use view permissions**: Each menu item requires its specific `*.view` permission (e.g., `projects.view`, `staff.view`)
- **Be specific**: Use granular permissions (e.g., `staff.view` vs `admin.all`)
- **Admin-only sections**: Use `admin.all` or restrict `design-system.view` and `settings.view` for sensitive sections
- **SuperUser bypass**: Users with `admin.all` permission see all menu items automatically

#### Security Note
⚠️ **Client-side filtering is for UX only!**

- Always enforce permissions on the **server side** (API routes)
- Client-side filtering prevents confusion but doesn't secure
- Users can bypass UI if they know URLs
- All API routes must use `withRBAC()` middleware

### Testing

To test permission filtering:

1. Assign a user a role with limited permissions
2. Log in as that user
3. Check sidebar - should only show permitted items
4. Verify API routes also enforce permissions
5. Test with SuperUser role - should see all menu items

---

## Best Practices

### Security

1. **Always enforce on server** - UI permissions are for UX only
2. **Default deny** - If permission not granted, deny access
3. **Deny wins** - Explicit denies override allows
4. **Tenant isolation** - Never mix tenants, always filter by `tenantId`
5. **Audit everything** - Log security-relevant actions
6. **Context checks** - Verify project memberships, assignments, etc.

### Permission Assignment

1. **Be specific**: Use granular permissions (e.g., `staff.create` vs `admin.all`)
2. **Principle of least privilege**: Only grant permissions users need
3. **Group related items**: Use same permission pattern for related features
4. **Admin-only sections**: Use `admin.all` or restrict sensitive sections (Settings, Design System)

### API Route Development

1. ✅ Wrap route handlers with `withRBAC()`
2. ✅ Add `tenantId` filter to all queries
3. ✅ Add visibility filtering for non-admin users (project access)
4. ✅ Add audit logging for critical actions
5. ✅ Test with different roles
6. ✅ Verify tenant isolation

### Role Management

1. **Create specific roles** for different user types
2. **Use SuperUser sparingly** - Only for true super administrators
3. **Document role purposes** - Use descriptions to explain role intent
4. **Review permissions regularly** - Ensure roles have appropriate permissions

---

## Troubleshooting

### Permission Denied Errors

**Problem**: User gets 403 Forbidden errors

**Solutions**:
1. Check user has required role assigned
2. Check role has required permission (allow action)
3. Check no explicit deny exists (deny wins over allow)
4. Check context constraints (project membership, tenant match)
5. Verify user has `admin.all` permission if expecting full access

### Users Can't See Projects

**Problem**: User can't see projects they should have access to

**Solutions**:
1. Check user has `projects.view` permission
2. Verify project membership exists (`ProjectMembership` table)
3. Check `hasAllProjectsAccess` setting for user
4. If user has `admin.all`, they should see all projects
5. Check tenant IDs match (user's tenant vs project's tenant)

### SuperUser Role Not Visible

**Problem**: SuperUser role doesn't appear in Roles & Permissions manager

**Solutions**:
1. Verify role exists in database (run seed script)
2. Refresh the page (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
3. Clear search filter if active
4. Check browser console for errors
5. Verify API endpoint returns the role: `GET /api/admin/roles`

### Role Assignment Fails

**Problem**: Cannot assign role to user

**Solutions**:
1. Check you have `users.update` permission
2. Verify role exists in the same tenant as user
3. Check user doesn't already have the role
4. Verify user and role belong to same tenant
5. Check browser console for API errors

### Migration Issues

**Problem**: Migration fails or schema out of sync

**Solutions**:
1. Run `npx prisma generate` to regenerate Prisma Client
2. Check migration status: `npx prisma migrate status`
3. Resolve pending migrations: `npx prisma migrate resolve --applied <migration_name>`
4. Reset database if in development: `npx prisma migrate reset` (⚠️ deletes all data)

### Permission Checks Not Working

**Problem**: Permission checks always return false or true incorrectly

**Solutions**:
1. Verify user has a role assigned
2. Check role has permissions assigned (not just created)
3. Verify `admin.all` permission is set correctly for SuperUser
4. Check tenant IDs match between user and resources
5. Review permission evaluation logic in `src/lib/rbac.ts`

---

## API Reference

### User Permissions Endpoint

**GET** `/api/admin/user-permissions`

Returns the current user's effective permissions.

**Response**:
```json
{
  "success": true,
  "data": {
    "permissions": [
      "admin.all",
      "projects.create",
      "projects.view",
      ...
    ]
  }
}
```

### Roles Endpoints

- **GET** `/api/admin/roles` - List all roles (requires `roles.view`)
- **POST** `/api/admin/roles` - Create role (requires `roles.create`)
- **GET** `/api/admin/roles/[id]` - Get role details (requires `roles.view`)
- **PUT** `/api/admin/roles/[id]` - Update role (requires `roles.update`)
- **DELETE** `/api/admin/roles/[id]` - Delete role (requires `roles.delete`)
- **PUT** `/api/admin/roles/[id]/permissions` - Update role permissions (requires `roles.update`)

### User Role Assignment Endpoints

- **POST** `/api/admin/user-roles` - Assign role to user (requires `users.update`)
  ```json
  {
    "userId": 1,
    "roleId": 2
  }
  ```
- **DELETE** `/api/admin/user-roles?userId=1&roleId=2` - Remove role from user (requires `users.update`)

### User Project Access Endpoint

- **PUT** `/api/admin/users/[id]/projects` - Manage user's project access (requires `users.update`)
  ```json
  {
    "hasAllProjectsAccess": true,
    "projectIds": []
  }
  ```
  or
  ```json
  {
    "hasAllProjectsAccess": false,
    "projectIds": [1, 2, 3]
  }
  ```

---

## Summary

The RBAC system provides:

✅ **49 menu-based CRUD permissions** for granular access control  
✅ **Tenant isolation** ensuring data separation  
✅ **Project-level access control** with specific project assignments  
✅ **SuperUser role** with `admin.all` for full system access  
✅ **Dynamic UI** that adapts to user permissions  
✅ **Comprehensive audit logging** for security events  
✅ **Admin UI components** for role and permission management  
✅ **Client-side permission checks** for enhanced UX  

The system is production-ready and can be extended as needed. Always remember to enforce permissions on the server side and use client-side checks only for UX improvements.

