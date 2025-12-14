# Session Expiration Fix

## Problem
Users could access pages like Project Manager, Dashboard, Plants etc. even when their session was expired. This happened because:

1. **Client-side caching**: The `useAuth` hook was loading user data from localStorage immediately (for fast UI), then verifying with the server
2. **Race condition**: Components would render with stale cached data before server verification completed
3. **No blocking**: Components didn't prevent rendering until authentication was verified

## Solution

### 1. Fixed useAuth Hook (`src/hooks/useAuth.ts`)
- **Before**: Loaded user from localStorage immediately, then verified
- **After**: Always verifies with server first, then sets user state
- Prevents components from rendering with stale cached data

### 2. Added Auth Guards to Components
Added authentication checks to prevent rendering until auth is verified:

- **ProjectManager** (`src/app/admin-panel/components/ProjectManager.tsx`)
- **PlantManager** (`src/app/admin-panel/components/PlantManager.tsx`)
- **MainDashboard** (`src/app/admin-panel/components/MainDashboard.tsx`)

Each component now:
- Checks `authLoading` and `user` state
- Shows loading screen if auth is being verified
- Redirects to login if not authenticated
- Only renders content after authentication is confirmed

### 3. Improved AdminPanel Auth Check
- Updated the main AdminPanel page to use `router.replace()` instead of `router.push()` to prevent back button issues
- Simplified auth checking logic

## How It Works Now

### Flow:
1. **Page Load**: Middleware checks token on server-side request
2. **Component Mount**: Component calls `useAuth()` hook
3. **Auth Verification**: Hook calls `/api/admin/auth/me` to verify session
4. **State Management**: User state is only set after successful verification
5. **Component Rendering**: Component shows loading until auth verified, then either:
   - Renders content if authenticated
   - Redirects to login if not authenticated

### Protection Layers:
1. **Server-side (Middleware)**: Blocks expired/invalid tokens at the request level
2. **Client-side (Hook)**: Verifies session before setting user state
3. **Component-level (Guards)**: Prevents rendering until auth confirmed

## Testing

To verify the fix works:

1. **Login** to the admin panel
2. **Manually expire session**:
   - Clear cookies via DevTools → Application → Cookies → Delete all cookies
   - Or wait for token expiration (15 minutes for access token, 7 days for refresh token)
   - Or log out from another tab/window
3. **Try to access** Dashboard, Project Manager, or Plants
4. **Expected**: Should immediately redirect to login page (no content visible)

### Test Scenarios

**Scenario 1: Expired Access Token (Refresh Token Still Valid)**
- Access token expires after 15 minutes
- Refresh token is still valid (7 days)
- **Expected**: Middleware auto-refreshes access token, user stays logged in

**Scenario 2: Both Tokens Expired**
- Both access and refresh tokens expired
- **Expected**: Middleware redirects to login, no content shown

**Scenario 3: Logged Out (Tokens Blacklisted)**
- User logs out, tokens are blacklisted
- **Expected**: Middleware and API reject tokens, redirect to login

**Scenario 4: Cleared Cookies**
- Cookies manually deleted
- **Expected**: No tokens found, immediate redirect to login

## Files Modified

1. `src/hooks/useAuth.ts` - Always verify before setting user state
2. `src/app/admin-panel/page.tsx` - Improved redirect logic
3. `src/app/admin-panel/components/ProjectManager.tsx` - Added auth guard
4. `src/app/admin-panel/components/PlantManager.tsx` - Added auth guard
5. `src/app/admin-panel/components/MainDashboard.tsx` - Added auth guard

## Security Notes

⚠️ **Important**: 
- Server-side middleware is the primary protection
- Client-side guards are for UX (prevent flicker/confusion)
- API routes still enforce authentication independently
- Never rely solely on client-side checks for security
