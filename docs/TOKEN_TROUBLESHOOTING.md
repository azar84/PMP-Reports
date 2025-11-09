# Token Troubleshooting Guide

## "Invalid token" Error - Solutions

### Quick Fix: Re-login

The most common cause is an expired or invalid token. **Try this first:**

1. **Log out** from the admin panel
2. **Log back in** with your credentials
3. This generates a fresh token

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
**Problem:** Token expired (default: 24 hours)

**Solution:**
- Log out and log back in

#### 3. **Token Format Issue**
**Problem:** Token not being sent correctly

**Check:**
- Open browser DevTools → Console
- Check if token exists: `localStorage.getItem('adminToken')`
- Check Network tab → Request Headers → Should have `Authorization: Bearer <token>`

#### 4. **Migration Not Run**
**Problem:** Database tables don't exist yet

**Solution:**
```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

### Diagnostic Steps

1. **Check Token in Browser:**
   ```javascript
   // In browser console:
   const token = localStorage.getItem('adminToken');
   console.log('Token:', token?.substring(0, 20) + '...');
   ```

2. **Check Server Logs:**
   - Look for "Token verification failed" messages
   - Check for JWT error details

3. **Test Token Validity:**
   - Try accessing `/api/admin/rbac-status` (doesn't require RBAC)
   - Check response for errors

### What I Fixed

✅ **Centralized JWT handling** - All token operations now use `src/lib/jwt.ts`
✅ **Consistent secret usage** - Same secret for signing and verification
✅ **Better error messages** - Clear hints when token fails
✅ **Migration detection** - Warns if tables don't exist
✅ **Fallback handling** - Graceful degradation if migration not run

### Environment Setup

Create or update `.env` file:

```bash
# Required
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters
DATABASE_URL=file:./dev.db

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
- Make sure you're logged in (check localStorage)

