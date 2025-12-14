# Token Troubleshooting Guide

## "Invalid token" Error - Solutions

### Quick Fix: Re-login

The most common cause is an expired or invalid token. **Try this first:**

1. **Log out** from the admin panel
2. **Log back in** with your credentials
3. This generates fresh access and refresh tokens

> **Note**: Tokens are now stored in HTTP-only cookies for security. The system automatically refreshes expired access tokens using refresh tokens. Manual token management is no longer needed.

### Root Causes

#### 1. **JWT_SECRET Mismatch**
**Problem:** Token was signed with one secret but verified with another.

**Solution:**
```bash
# Add JWT_SECRET to .env file
echo "JWT_SECRET=your-strong-secret-key-at-least-32-characters-long" >> .env

# Then restart your dev server
npm run dev
```

**After setting JWT_SECRET:**
- Log out and log back in (old tokens won't work)

#### 2. **Expired Token**
**Problem:** Access token expired (default: 15 minutes)

**Solution:**
- The system automatically refreshes expired access tokens using the refresh token (valid for 7 days)
- If refresh token is also expired, log out and log back in
- Middleware handles token refresh automatically - no action needed in most cases

#### 3. **Token Format Issue**
**Problem:** Token not being sent correctly

**Check:**
- Open browser DevTools → Application → Cookies
- Check if cookies exist: `adminToken` and `adminRefreshToken`
- Check Network tab → Request Headers → Cookies should be sent automatically (HttpOnly)
- For API calls, check if `credentials: 'include'` is set in fetch requests

**Note**: Tokens are stored in HTTP-only cookies and sent automatically. JavaScript cannot access them directly for security reasons.

#### 4. **Migration Not Run**
**Problem:** Database tables don't exist yet

**Solution:**
```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

### Diagnostic Steps

1. **Check Cookies in Browser:**
   - Open DevTools → Application → Cookies
   - Verify `adminToken` and `adminRefreshToken` cookies exist
   - Check cookie expiration dates
   - Note: Cookie values cannot be read from JavaScript (HttpOnly)

2. **Check Server Logs:**
   - Look for "Token verification failed" messages
   - Check for JWT error details
   - Look for "Token is blacklisted" messages (logout invalidates tokens)

3. **Test Authentication:**
   - Call `/api/admin/auth/me` to verify current authentication status
   - Check response for user data or error messages
   - Try accessing `/api/admin/rbac-status` (doesn't require RBAC)

4. **Test Token Refresh:**
   - Call `/api/admin/auth/refresh` to manually refresh access token
   - Should return new access token if refresh token is valid

### Security Improvements Implemented

✅ **HTTP-only cookies** - Tokens stored in secure, HttpOnly cookies (prevents XSS)
✅ **Token refresh mechanism** - Short-lived access tokens (15min) with long-lived refresh tokens (7 days)
✅ **Automatic token refresh** - Middleware automatically refreshes expired tokens
✅ **Token blacklisting** - Tokens are blacklisted on logout for immediate invalidation
✅ **Rate limiting** - Login endpoint protected against brute force (5 attempts per 15 minutes)
✅ **Enhanced API protection** - All protected routes verify tokens and check blacklist
✅ **Centralized auth utilities** - All token operations use `src/lib/auth.ts`
✅ **Better error messages** - Clear hints when token fails

### Environment Setup

Create or update `.env` file:

```bash
# Required
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters
DATABASE_URL=file:./dev.db

# Optional (defaults to JWT_SECRET + '-refresh' if not set)
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters

# Optional
NODE_ENV=development
```

### After Fixing

1. **Set JWT_SECRET in .env**
2. **Restart dev server:** `npm run dev`
3. **Log out and log back in**
4. **Try Role Manager again**

---

**Still having issues?** Check:
- Browser console for errors
- Server terminal for JWT errors
- Network tab for request/response details
- Application → Cookies to verify tokens exist
- Try calling `/api/admin/auth/me` to check authentication status
- Clear cookies and log in again if refresh token is expired

### New Authentication Features

#### Token Refresh
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Middleware automatically refreshes expired access tokens
- Manual refresh endpoint: `POST /api/admin/auth/refresh`

#### Token Blacklisting
- Tokens are blacklisted when user logs out
- Blacklisted tokens are immediately rejected
- Prevents use of stolen tokens after logout

#### Rate Limiting
- Login endpoint limited to 5 attempts per 15 minutes (per username+IP)
- Prevents brute force attacks
- Rate limit headers included in responses

#### Current User Info
- Endpoint: `GET /api/admin/auth/me`
- Returns current authenticated user information
- Useful for checking authentication status

