# Copy Preview Database to Production

This guide explains how to copy data from your preview database to production database.

## Prerequisites

1. You need access to both database URLs:
   - Preview database URL (from Vercel preview environment)
   - Production database URL (from Vercel production environment)

2. Make sure you have a backup of your production database before proceeding!

## Getting Database URLs

### From Vercel Dashboard

1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Find `DATABASE_URL` for both preview and production environments
4. Copy the URLs

### Using Vercel CLI

```bash
# Pull preview environment variables
vercel env pull .env.preview --environment=preview

# Pull production environment variables (if you have access)
vercel env pull .env.production --environment=production
```

## Usage

### Method 1: Using Environment Variables

Set the database URLs as environment variables:

```bash
PREVIEW_DATABASE_URL="postgresql://..." \
PRODUCTION_DATABASE_URL="postgresql://..." \
npm run copy:preview-to-production
```

### Method 2: Using .env File

Create a `.env.copy` file (don't commit this):

```env
PREVIEW_DATABASE_URL="postgresql://user:password@host:port/preview_db"
PRODUCTION_DATABASE_URL="postgresql://user:password@host:port/production_db"
```

Then run:

```bash
source .env.copy && npm run copy:preview-to-production
```

### Method 3: Interactive Mode

The script will prompt you for the database URLs if they're not set:

```bash
npm run copy:preview-to-production
```

## Script Modes

The script offers three modes:

### 1. Dry Run (Recommended First Step)

Preview what will be copied without making any changes:

```
Select mode:
  1. Dry run (preview only, no changes)
  2. Copy with skip existing (safe)
  3. Copy and replace (dangerous)

Enter choice (1-3): 1
```

This shows you exactly what data will be copied without modifying the production database.

### 2. Copy with Skip Existing (Safe)

Copies all data from preview to production, but skips records that already exist:

```
Enter choice (1-3): 2
```

- Safe: Won't overwrite existing production data
- Recommended for most use cases
- Handles duplicate records gracefully

### 3. Copy and Replace (Dangerous)

⚠️ **Not recommended** - This mode is not implemented by default for safety.

## What Gets Copied

The script copies data in the correct order to respect foreign key relationships:

1. **Core Settings**
   - Site Settings
   - Design System
   - Tenants
   - Admin Users
   - Roles & Permissions

2. **Master Data**
   - Clients
   - Consultants
   - Company Staff
   - Suppliers
   - Labours
   - Plants
   - Positions
   - Trades

3. **Projects & Details**
   - Projects
   - Project Planning
   - Project Commercial
   - Project Contacts
   - Checklists, Milestones, Assets, Pictures
   - Areas of Concern, Risks, HSE, NOC
   - Quality logs and checklists

4. **Resources**
   - Project Positions, Staff, Trades
   - Project Labours, Plants, Labour Supplies

5. **Financial Data**
   - Project Suppliers & Subcontractors
   - Purchase Orders, GRNs
   - Invoices & Payments

6. **Reports** (last, as they reference many tables)
   - Project Reports

## Safety Features

- ✅ Asks for confirmation before making changes
- ✅ Shows preview of data counts before copying
- ✅ Handles foreign key relationships automatically
- ✅ Skips duplicate records (in safe mode)
- ✅ Provides detailed progress and summary
- ✅ Can run in dry-run mode first

## Troubleshooting

### Error: "PREVIEW_DATABASE_URL not set"

Make sure you've set the environment variable:
```bash
export PREVIEW_DATABASE_URL="postgresql://..."
```

### Error: "PRODUCTION_DATABASE_URL not set"

Make sure you've set the environment variable:
```bash
export PRODUCTION_DATABASE_URL="postgresql://..."
```

### Error: "Unique constraint violation"

This means a record already exists. The script will skip it automatically in "skip existing" mode.

### Error: "Foreign key constraint violation"

This shouldn't happen as the script copies data in the correct order. If it does, check:
1. Are all migrations applied to production?
2. Is the schema in sync between preview and production?

## Best Practices

1. **Always run dry-run first** to see what will be copied
2. **Backup production database** before copying
3. **Test on a staging environment** first if possible
4. **Copy during low-traffic periods** to minimize impact
5. **Verify data after copying** to ensure everything is correct

## Example Workflow

```bash
# 1. Set environment variables
export PREVIEW_DATABASE_URL="postgresql://preview-db-url"
export PRODUCTION_DATABASE_URL="postgresql://production-db-url"

# 2. Run dry-run first
npm run copy:preview-to-production
# Select option 1 (dry run)

# 3. Review the output, then run actual copy
npm run copy:preview-to-production
# Select option 2 (copy with skip existing)

# 4. Verify the data in production
```

## Notes

- The script preserves relationships between records
- IDs may change (new IDs are generated for production)
- Timestamps (createdAt, updatedAt) are reset to current time
- The script is idempotent - safe to run multiple times in "skip existing" mode


