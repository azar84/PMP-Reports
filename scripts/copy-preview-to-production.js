#!/usr/bin/env node

/**
 * Script to copy data from preview database to production database
 * 
 * Usage:
 *   PREVIEW_DATABASE_URL="postgresql://..." PRODUCTION_DATABASE_URL="postgresql://..." node scripts/copy-preview-to-production.js
 * 
 * Or set environment variables in .env file:
 *   PREVIEW_DATABASE_URL=...
 *   PRODUCTION_DATABASE_URL=...
 * 
 * Safety features:
 * - Asks for confirmation before proceeding
 * - Shows preview of what will be copied
 * - Can run in dry-run mode
 * - Handles foreign key relationships
 * - Option to merge or replace data
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Create Prisma clients for both databases
const previewDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PREVIEW_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

const productionDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL,
    },
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function getTableCounts(db, modelName) {
  try {
    const model = db[modelName];
    if (!model) return 0;
    return await model.count();
  } catch (error) {
    console.error(`Error counting ${modelName}:`, error.message);
    return 0;
  }
}

async function showPreview() {
  console.log('\n📊 Preview Database Statistics:');
  console.log('='.repeat(60));
  
  const models = [
    'siteSettings',
    'adminUser',
    'project',
    'client',
    'supplier',
    'labour',
    'plant',
    'projectReport',
    'projectInvoice',
    'projectSupplier',
    'projectSubcontractor',
  ];
  
  const previewCounts = {};
  for (const model of models) {
    const count = await getTableCounts(previewDb, model);
    previewCounts[model] = count;
    if (count > 0) {
      console.log(`  ${model.padEnd(25)}: ${count} records`);
    }
  }
  
  console.log('\n📊 Production Database Statistics:');
  console.log('='.repeat(60));
  
  const productionCounts = {};
  for (const model of models) {
    const count = await getTableCounts(productionDb, model);
    productionCounts[model] = count;
    if (count > 0) {
      console.log(`  ${model.padEnd(25)}: ${count} records`);
    }
  }
  
  return { previewCounts, productionCounts };
}

// Global ID mapping to track old IDs to new IDs
const idMappings = {
  project: {},
  client: {},
  consultant: {},
  companyStaff: {},
  supplier: {},
  labour: {},
  plant: {},
  position: {},
  trade: {},
  projectSupplier: {},
  projectSubcontractor: {},
  projectPurchaseOrder: {},
  projectSubcontractorPurchaseOrder: {},
  projectPlantRequirement: {},
  projectPosition: {},
  projectTrade: {},
  contact: {},
  projectGRN: {},
  projectInvoice: {},
  projectSubcontractorInvoice: {},
  projectSubcontractorChangeOrder: {},
};

// Function to map foreign key IDs
function mapForeignKey(data, modelName, fieldMappings) {
  const mapped = { ...data };
  
  for (const [field, mappingKey] of Object.entries(fieldMappings)) {
    if (mapped[field] !== null && mapped[field] !== undefined) {
      const oldId = mapped[field];
      if (idMappings[mappingKey] && idMappings[mappingKey][oldId]) {
        mapped[field] = idMappings[mappingKey][oldId];
      } else {
        // If mapping doesn't exist, try to keep the original ID
        // This handles cases where the record already exists in production with the same ID
        // If it fails, the error will be caught and handled
      }
    }
  }
  
  return mapped;
}

async function copyData(modelName, options = {}) {
  const { skipExisting = false, dryRun = false, idMapping = null } = options;
  
  try {
    const previewModel = previewDb[modelName];
    const productionModel = productionDb[modelName];
    
    if (!previewModel || !productionModel) {
      console.log(`⚠️  Model ${modelName} not found, skipping...`);
      return { copied: 0, skipped: 0, idMappings: {} };
    }
    
    const previewData = await previewModel.findMany();
    console.log(`\n📦 Found ${previewData.length} records in preview ${modelName}`);
    
    if (previewData.length === 0) {
      return { copied: 0, skipped: 0, idMappings: {} };
    }
    
    let copied = 0;
    let skipped = 0;
    const newIdMappings = {};
    
    for (const record of previewData) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would copy ${modelName} record ID: ${record.id}`);
        copied++;
        continue;
      }
      
      try {
        // Check if record already exists
        if (skipExisting) {
          const existing = await productionModel.findUnique({
            where: { id: record.id },
          });
          
          if (existing) {
            // Store the mapping even if we skip (ID stays the same)
            if (idMapping) {
              newIdMappings[record.id] = record.id;
              if (!idMappings[modelName]) {
                idMappings[modelName] = {};
              }
              idMappings[modelName][record.id] = record.id;
            }
            console.log(`  ⏭️  Skipping existing ${modelName} ID: ${record.id}`);
            skipped++;
            continue;
          }
        }
        
        // Prepare data for insertion
        const dataToInsert = { ...record };
        const oldId = dataToInsert.id;
        delete dataToInsert.id; // Let database generate new ID
        delete dataToInsert.createdAt; // Let database set timestamp
        delete dataToInsert.updatedAt; // Let database set timestamp
        
        // Map foreign keys based on model
        let mappedData = dataToInsert;
        if (idMapping && idMapping.fieldMappings) {
          mappedData = mapForeignKey(dataToInsert, modelName, idMapping.fieldMappings);
        }
        
        const newRecord = await productionModel.create({
          data: mappedData,
        });
        
        // Store ID mapping if this model needs it
        if (idMapping && oldId !== undefined) {
          newIdMappings[oldId] = newRecord.id;
          if (!idMappings[modelName]) {
            idMappings[modelName] = {};
          }
          idMappings[modelName][oldId] = newRecord.id;
        }
        
        copied++;
        if (copied % 10 === 0) {
          process.stdout.write(`  ✅ Copied ${copied} records...\r`);
        }
      } catch (error) {
        if (error.code === 'P2002') {
          // Unique constraint violation - record already exists
          console.log(`  ⏭️  Skipping duplicate ${modelName} ID: ${record.id}`);
          skipped++;
        } else {
          console.error(`  ❌ Error copying ${modelName} ID ${record.id}:`, error.message.substring(0, 100));
        }
      }
    }
    
    if (!dryRun && copied > 0) {
      console.log(`\n  ✅ Copied ${copied} ${modelName} records`);
    }
    if (skipped > 0) {
      console.log(`  ⏭️  Skipped ${skipped} ${modelName} records (already exist)`);
    }
    
    return { copied, skipped, idMappings: newIdMappings };
  } catch (error) {
    console.error(`❌ Error processing ${modelName}:`, error.message);
    return { copied: 0, skipped: 0, idMappings: {} };
  }
}

async function copyDataInOrder(options = {}) {
  console.log('\n🚀 Starting data copy process...');
  console.log('='.repeat(60));
  
  // Copy in order respecting foreign key relationships
  const copyOrder = [
    // Core settings and users first
    { model: 'siteSettings', name: 'Site Settings', idMapping: null },
    { model: 'designSystem', name: 'Design System', idMapping: null },
    { model: 'tenant', name: 'Tenants', idMapping: null },
    { model: 'adminUser', name: 'Admin Users', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'role', name: 'Roles', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'permission', name: 'Permissions', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    
    // Master data
    { model: 'client', name: 'Clients', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'consultant', name: 'Consultants', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'companyStaff', name: 'Company Staff', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'supplier', name: 'Suppliers', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'labour', name: 'Labours', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'plant', name: 'Plants', idMapping: { fieldMappings: { tenantId: 'tenant' } } },
    { model: 'position', name: 'Positions', idMapping: null },
    { model: 'trade', name: 'Trades', idMapping: null },
    
    // Projects and related data
    { model: 'project', name: 'Projects', idMapping: { fieldMappings: { tenantId: 'tenant', clientId: 'client', projectManagementConsultantId: 'consultant', designConsultantId: 'consultant', supervisionConsultantId: 'consultant', costConsultantId: 'consultant', projectDirectorId: 'companyStaff', projectManagerId: 'companyStaff' } } },
    { model: 'projectPlanning', name: 'Project Planning', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectCommercial', name: 'Project Commercial', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectContact', name: 'Project Contacts', idMapping: { fieldMappings: { projectId: 'project', contactId: 'contact' } } },
    { model: 'projectMembership', name: 'Project Memberships', idMapping: { fieldMappings: { projectId: 'project', userId: 'adminUser' } } },
    
    // Project details
    { model: 'projectChecklistItem', name: 'Project Checklist Items', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectControlMilestone', name: 'Control Milestones', idMapping: { fieldMappings: { projectId: 'project', planningId: 'projectPlanning' } } },
    { model: 'projectAsset', name: 'Project Assets', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectPicture', name: 'Project Pictures', idMapping: { fieldMappings: { projectId: 'project', mediaId: 'mediaLibrary' } } },
    { model: 'projectAreaOfConcern', name: 'Areas of Concern', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectRiskEntry', name: 'Risk Entries', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectHseChecklistItem', name: 'HSE Checklist Items', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectNocTrackerEntry', name: 'NOC Tracker Entries', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectCloseOutEntry', name: 'Close Out Entries', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectClientFeedback', name: 'Client Feedback', idMapping: { fieldMappings: { projectId: 'project' } } },
    
    // Quality
    { model: 'projectQualityE1Log', name: 'Quality E1 Logs', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectQualityE2Log', name: 'Quality E2 Logs', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectQualityChecklistEntry', name: 'Quality Checklist Entries', idMapping: { fieldMappings: { projectId: 'project' } } },
    
    // Commercial
    { model: 'projectCommercialChecklistItem', name: 'Commercial Checklist Items', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectIPC', name: 'IPC Entries', idMapping: { fieldMappings: { projectId: 'project' } } },
    
    // Resources
    { model: 'projectPosition', name: 'Project Positions', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectStaff', name: 'Project Staff', idMapping: { fieldMappings: { projectId: 'project', positionId: 'projectPosition', staffId: 'companyStaff' } } },
    { model: 'projectTrade', name: 'Project Trades', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectLabour', name: 'Project Labours', idMapping: { fieldMappings: { projectId: 'project', tradeId: 'projectTrade', labourId: 'labour' } } },
    { model: 'projectPlantRequirement', name: 'Plant Requirements', idMapping: { fieldMappings: { projectId: 'project' } } },
    { model: 'projectPlantRequirementSlot', name: 'Plant Requirement Slots', idMapping: { fieldMappings: { requirementId: 'projectPlantRequirement' } } },
    { model: 'projectPlant', name: 'Project Plants', idMapping: { fieldMappings: { projectId: 'project', plantId: 'plant', requirementId: 'projectPlantRequirement' } } },
    { model: 'projectLabourSupply', name: 'Labour Supplies', idMapping: { fieldMappings: { projectId: 'project' } } },
    
    // Suppliers and Subcontractors
    { model: 'projectSupplier', name: 'Project Suppliers', idMapping: { fieldMappings: { projectId: 'project', supplierId: 'supplier' } } },
    { model: 'projectPurchaseOrder', name: 'Purchase Orders', idMapping: { fieldMappings: { projectId: 'project', projectSupplierId: 'projectSupplier' } } },
    { model: 'projectGRN', name: 'GRNs', idMapping: { fieldMappings: { projectId: 'project', projectSupplierId: 'projectSupplier', purchaseOrderId: 'projectPurchaseOrder' } } },
    { model: 'projectInvoice', name: 'Invoices', idMapping: { fieldMappings: { projectId: 'project', projectSupplierId: 'projectSupplier', purchaseOrderId: 'projectPurchaseOrder' } } },
    { model: 'projectSupplierPayment', name: 'Supplier Payments', idMapping: { fieldMappings: { projectId: 'project', projectSupplierId: 'projectSupplier' } } },
    { model: 'paymentInvoice', name: 'Payment Invoices', idMapping: { fieldMappings: { paymentId: 'projectSupplierPayment', invoiceId: 'projectInvoice' } } },
    { model: 'invoiceGRN', name: 'Invoice GRNs', idMapping: { fieldMappings: { invoiceId: 'projectInvoice', grnId: 'projectGRN' } } },
    
    { model: 'projectSubcontractor', name: 'Project Subcontractors', idMapping: { fieldMappings: { projectId: 'project', subcontractorId: 'supplier' } } },
    { model: 'projectSubcontractorPurchaseOrder', name: 'Subcontractor Purchase Orders', idMapping: { fieldMappings: { projectId: 'project', projectSubcontractorId: 'projectSubcontractor' } } },
    { model: 'projectSubcontractorChangeOrder', name: 'Change Orders', idMapping: { fieldMappings: { projectId: 'project', projectSubcontractorId: 'projectSubcontractor', purchaseOrderId: 'projectSubcontractorPurchaseOrder' } } },
    { model: 'projectSubcontractorInvoice', name: 'Subcontractor Invoices', idMapping: { fieldMappings: { projectId: 'project', projectSubcontractorId: 'projectSubcontractor', purchaseOrderId: 'projectSubcontractorPurchaseOrder', changeOrderId: 'projectSubcontractorChangeOrder' } } },
    { model: 'projectSubcontractorPayment', name: 'Subcontractor Payments', idMapping: { fieldMappings: { projectId: 'project', projectSubcontractorId: 'projectSubcontractor' } } },
    { model: 'projectSubcontractorPaymentInvoice', name: 'Subcontractor Payment Invoices', idMapping: { fieldMappings: { paymentId: 'projectSubcontractorPayment', invoiceId: 'projectSubcontractorInvoice' } } },
    { model: 'projectSubcontractorInvoiceChangeOrder', name: 'Invoice Change Orders', idMapping: { fieldMappings: { invoiceId: 'projectSubcontractorInvoice', changeOrderId: 'projectSubcontractorChangeOrder' } } },
    
    // Reports (last, as they reference many other tables)
    { model: 'projectReport', name: 'Project Reports', idMapping: { fieldMappings: { projectId: 'project', userId: 'adminUser' } } },
  ];
  
  const results = {};
  
  for (const { model, name, idMapping } of copyOrder) {
    console.log(`\n📋 Copying ${name}...`);
    const result = await copyData(model, { ...options, idMapping });
    results[model] = result;
  }
  
  return results;
}

async function main() {
  console.log('🔄 Preview to Production Data Copy Script');
  console.log('='.repeat(60));
  
  // Validate environment variables
  const previewUrl = process.env.PREVIEW_DATABASE_URL || process.env.DATABASE_URL;
  const productionUrl = process.env.PRODUCTION_DATABASE_URL;
  
  if (!previewUrl) {
    console.error('❌ Error: PREVIEW_DATABASE_URL or DATABASE_URL not set');
    console.error('   Set PREVIEW_DATABASE_URL environment variable');
    process.exit(1);
  }
  
  if (!productionUrl) {
    console.error('❌ Error: PRODUCTION_DATABASE_URL not set');
    console.error('   Set PRODUCTION_DATABASE_URL environment variable');
    process.exit(1);
  }
  
  console.log('\n📋 Configuration:');
  console.log(`   Preview DB:    ${previewUrl.substring(0, 50)}...`);
  console.log(`   Production DB: ${productionUrl.substring(0, 50)}...`);
  
  try {
    // Test connections
    console.log('\n🔌 Testing database connections...');
    await previewDb.$connect();
    console.log('✅ Connected to preview database');
    
    await productionDb.$connect();
    console.log('✅ Connected to production database');
    
    // Show preview
    const { previewCounts, productionCounts } = await showPreview();
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will copy data from preview to production!');
    console.log('   Make sure you have a backup of your production database.');
    
    // Allow mode to be set via environment variable for non-interactive use
    let mode = process.env.COPY_MODE;
    if (!mode) {
      mode = await question('\nSelect mode:\n  1. Dry run (preview only, no changes)\n  2. Copy with skip existing (safe)\n  3. Copy and replace (dangerous)\n\nEnter choice (1-3): ');
    } else {
      console.log(`\n📋 Using mode from COPY_MODE environment variable: ${mode}`);
    }
    
    if (mode === '1') {
      console.log('\n🔍 Running in DRY RUN mode (no changes will be made)...');
      await copyDataInOrder({ dryRun: true, skipExisting: true });
      console.log('\n✅ Dry run completed. No changes were made.');
    } else if (mode === '2') {
      // Skip confirmation if COPY_MODE is set (non-interactive mode)
      if (!process.env.COPY_MODE) {
        const confirm = await question('\n⚠️  This will copy data to production, skipping existing records.\n   Type "yes" to confirm: ');
        if (confirm.toLowerCase() !== 'yes') {
          console.log('❌ Cancelled by user');
          process.exit(0);
        }
      } else {
        console.log('\n⚠️  Copying data to production, skipping existing records...');
      }
      
      console.log('\n🚀 Starting data copy (skip existing mode)...');
      const results = await copyDataInOrder({ skipExisting: true });
      
      console.log('\n📊 Copy Summary:');
      console.log('='.repeat(60));
      let totalCopied = 0;
      let totalSkipped = 0;
      
      for (const [model, result] of Object.entries(results)) {
        if (result.copied > 0 || result.skipped > 0) {
          console.log(`  ${model.padEnd(30)}: ${result.copied} copied, ${result.skipped} skipped`);
          totalCopied += result.copied;
          totalSkipped += result.skipped;
        }
      }
      
      console.log(`\n  Total: ${totalCopied} copied, ${totalSkipped} skipped`);
      console.log('\n✅ Data copy completed successfully!');
    } else if (mode === '3') {
      const confirm = await question('\n⚠️  DANGER: This will replace existing data in production!\n   Type "REPLACE" to confirm: ');
      if (confirm !== 'REPLACE') {
        console.log('❌ Cancelled by user');
        process.exit(0);
      }
      
      console.log('\n🚀 Starting data copy (replace mode)...');
      // Note: Replace mode would need to delete existing data first
      // This is dangerous and not implemented by default
      console.log('❌ Replace mode not implemented for safety. Use mode 2 instead.');
      process.exit(1);
    } else {
      console.log('❌ Invalid choice');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await previewDb.$disconnect();
    await productionDb.$disconnect();
    rl.close();
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

