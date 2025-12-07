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

## Support

For issues with Vercel deployment, check:
- Vercel build logs for detailed error messages
- Database connection status
- Environment variables are set correctly

