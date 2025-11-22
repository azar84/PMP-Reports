# Safe Migration Instructions: GRN to Invoice Restructure

## Overview

This migration will:
1. ✅ **Preserve all existing data**
2. Create new `ProjectInvoice` table
3. Create new `InvoiceGRN` junction table
4. Migrate existing invoice data from GRNs to Invoices (if any exists)
5. Remove invoice columns from GRNs (using SQLite-compatible method)

## ⚠️ Important Notes

- **All existing data will be preserved**
- SQLite doesn't support dropping columns directly, so we'll recreate the GRN table
- The migration script includes data backup and verification steps

## Method 1: Using Prisma DB Push (Recommended for Development)

This is the safest and simplest method:

```bash
# 1. Make sure your Prisma schema is correct
npx prisma format

# 2. Push schema changes (this preserves data)
npx prisma db push

# 3. Generate Prisma Client
npx prisma generate
```

**What `db push` does:**
- ✅ Analyzes schema changes
- ✅ Creates new tables
- ✅ Migrates data safely
- ✅ Recreates tables when columns need to be removed (SQLite limitation)
- ⚠️ Does NOT create migration history (use for dev only)

## Method 2: Using Custom Migration Script (For Production)

If you need migration history or are in production:

```bash
# Run the safe migration script
npm run migrate:grn-invoices

# Or manually:
node scripts/safe-grn-migration.js
```

The script will:
1. Check if migration has already been run
2. Back up existing data (counts records)
3. Execute migration step by step
4. Verify all tables were created correctly
5. Report migration results

## Method 3: Manual Prisma Migration (If shadow DB works)

If the shadow database works in your environment:

```bash
# Create migration file
npx prisma migrate dev --name restructure_grns_and_invoices --create-only

# Review the generated migration file
# Edit if needed to preserve data

# Apply migration
npx prisma migrate dev
```

## After Migration

1. **Verify the migration:**
   ```bash
   # Check that new tables exist
   sqlite3 prisma/dev.db ".tables" | grep invoice
   
   # Check GRN table structure (should NOT have invoice columns)
   sqlite3 prisma/dev.db "PRAGMA table_info(project_grns)"
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Restart your development server**

4. **Test the new Invoice functionality:**
   - Go to Project Manager → Suppliers tab
   - Click on a supplier
   - Verify you see three tabs: PO's, GRN's, and Invoices
   - Try creating a new invoice with GRNs

## Data Migration Details

If you have existing GRNs with invoice data:
- Each unique `invoiceNumber` + `invoiceDate` combination will become an `Invoice`
- All GRNs with the same invoice will be linked via `InvoiceGRN` table
- Original GRN data (GRN ref, date, amounts) remains unchanged

## Rollback (If Needed)

If something goes wrong, you can restore from backup:

```sql
-- SQLite commands to check data
-- Check GRN count
SELECT COUNT(*) FROM project_grns;

-- Check Invoice count
SELECT COUNT(*) FROM project_invoices;

-- Check links
SELECT COUNT(*) FROM invoice_grns;
```

## Troubleshooting

**Error: "Migration already run"**
- The migration script checks if tables exist before running
- If tables exist, migration is skipped
- This is safe - you can run the script multiple times

**Error: "Shadow database error"**
- This is common with SQLite
- Use Method 1 (`prisma db push`) instead
- Or use the custom migration script (Method 2)

**Data not appearing**
- Make sure you ran `npx prisma generate` after migration
- Restart your development server
- Clear browser cache

## Need Help?

If you encounter any issues:
1. Check the migration script output for error messages
2. Verify your database file exists: `ls -la prisma/dev.db`
3. Try running in development mode first
4. Create a database backup before migration: `cp prisma/dev.db prisma/dev.db.backup`

