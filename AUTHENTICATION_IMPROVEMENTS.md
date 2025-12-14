# Authentication System Improvements

This document outlines the security improvements made to the authentication system.

## Summary of Changes

### ✅ 1. Token Refresh Mechanism
**Status**: Implemented

- **Access Tokens**: Short-lived (15 minutes) for security
- **Refresh Tokens**: Long-lived (7 days) stored in HTTP-only cookies
- **Auto-refresh**: Middleware automatically refreshes expired access tokens using refresh tokens
- **New Endpoint**: `/api/admin/auth/refresh` for manual token refresh

**Files Changed**:
- `src/lib/auth.ts` - Token generation and verification functions
- `src/app/api/admin/auth/refresh/route.ts` - New refresh endpoint
- `middleware.ts` - Auto-refresh logic

### ✅ 2. HTTP-Only Cookies
**Status**: Implemented

- **Migration**: Tokens now stored in HTTP-only cookies instead of localStorage
- **Security**: Prevents XSS attacks from stealing tokens
- **Backward Compatibility**: Still supports Authorization header for API calls
- **Cookie Settings**:
  - `HttpOnly`: JavaScript cannot access
  - `Secure`: HTTPS only in production
  - `SameSite=Lax`: CSRF protection

**Files Changed**:
- `src/app/api/admin/auth/login/route.ts` - Sets cookies on login
- `src/app/api/admin/auth/logout/route.ts` - Clears cookies on logout
- `src/hooks/useAuth.ts` - Removed localStorage token storage
- `src/hooks/useApi.ts` - Added `credentials: 'include'` for cookie support

### ✅ 3. Token Blacklist/Invalidation
**Status**: Implemented

- **Blacklist System**: In-memory Map storing blacklisted tokens with expiration
- **Logout**: Tokens are blacklisted when user logs out
- **Middleware Check**: All authenticated requests check blacklist before allowing access
- **Auto-cleanup**: Expired tokens are automatically removed from blacklist

**Note**: For production with multiple instances, consider using Redis for shared blacklist.

**Files Changed**:
- `src/lib/auth.ts` - Blacklist functions
- `src/app/api/admin/auth/logout/route.ts` - Blacklists tokens on logout
- `middleware.ts` - Checks blacklist before allowing access

### ✅ 4. Rate Limiting
**Status**: Implemented

- **Login Protection**: 5 attempts per 15 minutes per username+IP combination
- **Response Headers**: Includes `Retry-After`, `X-RateLimit-*` headers
- **In-memory Storage**: Uses Map for rate limit tracking

**Note**: For production with multiple instances, consider using Redis for shared rate limiting.

**Files Changed**:
- `src/lib/rateLimit.ts` - Rate limiting utilities
- `src/app/api/admin/auth/login/route.ts` - Rate limiting on login

### ✅ 5. Enhanced API Route Protection
**Status**: Implemented

- **Explicit Auth Checks**: `createApiHandler` now validates tokens and checks blacklist
- **Better Error Messages**: More specific error responses
- **Token Verification**: Each protected route verifies token validity

**Files Changed**:
- `src/lib/apiHandler.ts` - Enhanced auth validation

## New API Endpoints

### GET /api/admin/auth/me
Get current authenticated user information.

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "name": "Admin User",
    "tenantId": 1,
    "hasAllProjectsAccess": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/admin/auth/refresh
Refresh access token using refresh token.

**Response**:
```json
{
  "success": true,
  "token": "new_access_token"
}
```

## Migration Guide

### Frontend Changes
1. **useAuth Hook**: Now uses cookies automatically - no manual token handling needed
2. **API Calls**: Must include `credentials: 'include'` to send cookies
3. **User Data**: Still cached in localStorage for UI state (not sensitive data)

### Backend Changes
1. **Environment Variables**: Optional `JWT_REFRESH_SECRET` (defaults to `JWT_SECRET + '-refresh'`)
2. **Middleware**: Now handles token refresh automatically
3. **API Routes**: Should use `createApiHandler` with `requireAuth: true`

## Security Improvements

1. **XSS Protection**: HTTP-only cookies prevent JavaScript from accessing tokens
2. **CSRF Protection**: SameSite cookie attribute prevents CSRF attacks
3. **Token Expiration**: Short-lived access tokens reduce attack window
4. **Logout Security**: Blacklisted tokens are immediately invalidated
5. **Rate Limiting**: Prevents brute force attacks on login

## Production Considerations

### For Multi-Instance Deployments:
1. **Redis for Blacklist**: Replace in-memory Map with Redis for shared blacklist
2. **Redis for Rate Limiting**: Replace in-memory Map with Redis for shared rate limiting
3. **Load Balancer**: Ensure cookies work correctly with load balancing

### Environment Variables:
```env
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters (optional)
```

## Testing Checklist

- [ ] Login creates access and refresh tokens in cookies
- [ ] Access token expires after 15 minutes
- [ ] Expired access token is auto-refreshed by middleware
- [ ] Refresh token endpoint works correctly
- [ ] Logout blacklists tokens and clears cookies
- [ ] Blacklisted tokens are rejected by middleware
- [ ] Rate limiting blocks excessive login attempts
- [ ] `/api/admin/auth/me` returns current user
- [ ] Frontend auth hook works with cookies
- [ ] API calls include cookies automatically

## Backward Compatibility

- Authorization header still supported for API calls
- Existing clients can continue using headers while migrating to cookies
- Frontend gracefully handles both cookie and header authentication
