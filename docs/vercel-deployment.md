# Vercel Deployment Guide

## Database Configuration

This project uses **SQLite** for local development, but for production on Vercel, you have two options:

### Option 1: PostgreSQL (Recommended for Production)

PostgreSQL is recommended for production deployments on Vercel because:
- Better performance and scalability
- Proper support for concurrent connections
- Better suited for serverless environments

#### Setup Steps:

1. **Add a PostgreSQL database to your Vercel project:**
   - Go to your Vercel project settings
   - Navigate to "Storage" or "Databases"
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Update Prisma schema for production:**
   - Update `prisma/schema.prisma` to use PostgreSQL:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```

3. **Set DATABASE_URL in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

4. **Run migrations:**
   - The build script will automatically run migrations during deployment
   - Or run manually: `npx prisma migrate deploy`

### Option 2: SQLite (Not Recommended for Production)

SQLite can work on Vercel but has limitations:
- File system is read-only except `/tmp`
- Not ideal for concurrent access
- Database file may not persist between deployments

#### Setup Steps:

1. **Set DATABASE_URL in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with SQLite format:
     ```
     file:./prisma/prod.db
     ```
   - Or use a writable location:
     ```
     file:/tmp/prisma/prod.db
     ```

2. **Note:** The database file will be recreated on each deployment unless you use external storage.

## Environment Variables Required

Make sure to set these in Vercel Project Settings → Environment Variables:

### Required:
- `DATABASE_URL` - Database connection string (see above)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)

### Optional:
- `NEXT_PUBLIC_BASE_URL` - Base URL of your application
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email functionality
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `CRON_SECRET` - Secret for cron job authentication

## Build Process

The `vercel-build` script automatically:
1. Checks if `DATABASE_URL` is set
2. Runs database migrations (`prisma migrate deploy`)
3. Seeds the database with initial data
4. Builds the Next.js application

### Migration Safety

**`prisma migrate deploy` is production-safe:**
- ✅ Only applies pending migrations that haven't been run yet
- ✅ Never deletes data or existing tables
- ✅ Never resets the database
- ✅ Safe to run on every deployment
- ✅ Updates schema incrementally without data loss

When you update the Prisma schema and create a new migration:
1. Commit the migration files to Git
2. Push to trigger Vercel deployment
3. The build script automatically applies only the new migration
4. Existing data remains intact

If `DATABASE_URL` is not set, the build will:
- Show a warning
- Skip migrations and seeding
- Still build the application (but it may not work without a database)

## Troubleshooting

### Error: "the URL must start with the protocol `file:`"

This means `DATABASE_URL` is either:
- Not set in Vercel environment variables
- Set incorrectly (not in SQLite format)

**Solution:** Set `DATABASE_URL` in Vercel project settings with the correct format.

### Error: "Migration failed"

Possible causes:
- Database connection issues
- Invalid `DATABASE_URL` format
- Database permissions

**Solution:** 
- Verify `DATABASE_URL` is correct
- Check database is accessible
- For PostgreSQL, ensure SSL is enabled if required

### Build succeeds but app doesn't work

- Check that `DATABASE_URL` is set correctly
- Verify migrations ran successfully (check build logs)
- Ensure seeding completed (check build logs)
- Check database connection at runtime

## Manual Database Setup

If automatic seeding fails, you can manually seed the database:

1. Connect to your database
2. Run migrations: `npx prisma migrate deploy`
3. Run seeds: `npm run db:seed && npm run db:seed:positions`

## Troubleshooting Admin Login Issues

If you cannot login as admin after deployment, check the following:

### Common Causes

1. **DATABASE_URL Not Set**
   - **Symptom:** Build logs show "WARNING: DATABASE_URL is not set"
   - **Solution:** Set `DATABASE_URL` in Vercel environment variables and redeploy

2. **Database Migrations Failed**
   - **Symptom:** Build logs show "Migration failed"
   - **Solution:** Check `DATABASE_URL` is correct, database is accessible, and has proper permissions

3. **Seeding Script Failed**
   - **Symptom:** Build succeeds but admin user doesn't exist
   - **Solution:** Check build logs for seeding errors. Look for "Database seeding (main)" and "Default admin user created" messages

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@example.com`

⚠️ **Important:** Change the default password immediately after first login!

### How to Verify Seeding Ran

Check Vercel build logs for:
- `✅ Database migrations completed`
- `✅ Database seeding (main) completed`
- `✅ Default admin user created (username: admin, password: admin123)`

### Manual Fix: Create Admin User

If seeding failed, you can create the admin user manually using Prisma Studio:

```bash
npx prisma studio
```

Then manually create the admin user with:
- Username: `admin`
- Email: `admin@example.com`
- Password Hash: Generate using `bcrypt.hash('admin123', 12)`
- isActive: `true`

Or create a quick script:

```javascript
// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'Default Tenant', slug: 'default' },
  });

  const admin = await prisma.adminUser.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'admin' } },
    update: { passwordHash, email: 'admin@example.com', isActive: true },
    create: {
      tenantId: tenant.id,
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      name: 'Administrator',
      isActive: true,
      hasAllProjectsAccess: true,
    },
  });

  console.log('✅ Admin user created:', admin.username);
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Run with: `node scripts/create-admin.js`

## Support

For issues with Vercel deployment, check:
- Vercel build logs for detailed error messages
- Database connection status
- Environment variables are set correctly

