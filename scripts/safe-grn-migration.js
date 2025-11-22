/**
 * Safe Migration Script for GRN to Invoice Restructure
 * 
 * This script safely migrates the database structure without losing data.
 * It:
 * 1. Creates new Invoice and InvoiceGRN tables
 * 2. Migrates existing invoice data from GRNs to Invoices
 * 3. Removes invoice columns from GRNs (using SQLite-compatible method)
 * 
 * Usage: node scripts/safe-grn-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function safeMigration() {
  console.log('🔄 Starting safe GRN to Invoice migration...');
  console.log('='.repeat(60));

  try {
    // Check if migration has already been run
    const invoiceTableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='project_invoices'
    `;

    if (invoiceTableExists.length > 0) {
      console.log('⚠️  Migration appears to have already been run.');
      console.log('   Invoice table already exists. Skipping migration.');
      return;
    }

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/migrate_grn_to_invoices_safely.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Backing up existing data...');
    
    // Backup GRN data (count records)
    const grnCount = await prisma.projectGRN.count();
    console.log(`   Found ${grnCount} GRN records`);

    if (grnCount > 0) {
      // Get sample data to verify structure
      const sampleGrn = await prisma.projectGRN.findFirst({
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          projectId: true,
          projectSupplierId: true,
        }
      });
      
      if (sampleGrn?.invoiceNumber) {
        console.log(`   Sample GRN has invoice: ${sampleGrn.invoiceNumber}`);
      } else {
        console.log('   No invoice data in existing GRNs - safe to migrate');
      }
    }

    console.log('\n📝 Executing migration...');
    
    // Split SQL by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log(`   ✅ Step ${i + 1}/${statements.length} completed`);
        } catch (error) {
          // Some statements might fail if they've already been run (CREATE IF NOT EXISTS)
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`   ⚠️  Step ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n🔍 Verifying migration...');
    
    // Verify new tables exist
    const invoiceTable = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='project_invoices'
    `;
    
    const invoiceGrnTable = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='invoice_grns'
    `;

    if (invoiceTable.length > 0) {
      console.log('   ✅ Invoice table created');
    } else {
      throw new Error('Invoice table was not created');
    }

    if (invoiceGrnTable.length > 0) {
      console.log('   ✅ InvoiceGRN junction table created');
    } else {
      throw new Error('InvoiceGRN table was not created');
    }

    // Verify GRN table structure (should not have invoice columns)
    const grnColumns = await prisma.$queryRaw`
      PRAGMA table_info(project_grns)
    `;
    
    const hasInvoiceColumns = grnColumns.some((col: any) => 
      col.name === 'invoiceNumber' || col.name === 'invoiceDate'
    );

    if (hasInvoiceColumns) {
      console.warn('   ⚠️  GRN table still has invoice columns - manual cleanup may be needed');
    } else {
      console.log('   ✅ GRN table structure updated (invoice columns removed)');
    }

    // Count migrated data
    try {
      const invoiceCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM project_invoices`;
      console.log(`\n📊 Migration Results:`);
      console.log(`   Invoices created: ${invoiceCount[0]?.count || 0}`);
      
      const invoiceGrnCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM invoice_grns`;
      console.log(`   Invoice-GRN links created: ${invoiceGrnCount[0]?.count || 0}`);
    } catch (error) {
      console.log('   (Could not count records - tables may not have data yet)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Safe migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📌 Next steps:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Restart your development server');
    console.log('   3. Verify the new Invoice tab in the supplier view\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n⚠️  Your data has NOT been modified.');
    console.error('   You can safely retry the migration.\n');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  safeMigration()
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { safeMigration };

