const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.saski' });

// Source database (saski-ai-website)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.saski_DATABASE_URL
    }
  }
});

// Target database (local)
const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Define tables with their descriptions and dependencies
const tables = [
  {
    name: 'SiteSettings',
    description: 'Site configuration and settings',
    dependencies: []
  },
  {
    name: 'DesignSystem',
    description: 'Design system colors and styling',
    dependencies: []
  },
  {
    name: 'AdminUser',
    description: 'Admin users',
    dependencies: []
  },
  {
    name: 'ServiceAccountCredentials',
    description: 'Google service account credentials',
    dependencies: []
  },
  {
    name: 'Menu',
    description: 'Navigation menus',
    dependencies: []
  },
  {
    name: 'HeaderConfig',
    description: 'Header configuration',
    dependencies: []
  },
  {
    name: 'CTA',
    description: 'Call-to-action buttons',
    dependencies: []
  },
  {
    name: 'GlobalFunctions',
    description: 'Global JavaScript functions',
    dependencies: []
  },
  {
    name: 'GlobalFeature',
    description: 'Global feature settings',
    dependencies: []
  },
  {
    name: 'FeatureGroup',
    description: 'Feature groups and categories',
    dependencies: []
  },
  {
    name: 'FAQCategory',
    description: 'FAQ categories',
    dependencies: []
  },
  {
    name: 'FAQ',
    description: 'FAQ questions and answers',
    dependencies: ['FAQCategory']
  },
  {
    name: 'FAQSection',
    description: 'FAQ sections',
    dependencies: []
  },
  {
    name: 'Plan',
    description: 'Pricing plans',
    dependencies: []
  },
  {
    name: 'BillingCycle',
    description: 'Billing cycle options',
    dependencies: []
  },
  {
    name: 'PlanFeatureType',
    description: 'Plan feature types',
    dependencies: []
  },
  {
    name: 'PlanFeatureLimit',
    description: 'Plan feature limits',
    dependencies: ['PlanFeatureType']
  },
  {
    name: 'PlanPricing',
    description: 'Plan pricing information',
    dependencies: ['Plan', 'BillingCycle']
  },
  {
    name: 'MediaLibrary',
    description: 'Media library items',
    dependencies: []
  },
  {
    name: 'PricingSection',
    description: 'Pricing sections',
    dependencies: []
  },
  {
    name: 'Form',
    description: 'Custom forms',
    dependencies: []
  },
  {
    name: 'FormField',
    description: 'Form fields',
    dependencies: ['Form']
  },
  {
    name: 'HtmlSection',
    description: 'HTML sections',
    dependencies: []
  },
  {
    name: 'Page',
    description: 'Website pages and content',
    dependencies: []
  },
  {
    name: 'SitemapSubmissionLog',
    description: 'Sitemap submission logs',
    dependencies: []
  }
];

async function copyTable(tableInfo) {
  const { name, description, dependencies } = tableInfo;
  
  console.log(`\n📋 Copying ${name} (${description})...`);
  console.log(`   └─ Dependencies: ${dependencies.length > 0 ? dependencies.join(', ') : 'None'}`);
  
  try {
    // Check if table exists in source
    const sourceCount = await sourcePrisma[name].count();
    console.log(`   📊 Source records: ${sourceCount}`);
    
    if (sourceCount === 0) {
      console.log(`   ⚠️  No data found in source ${name}`);
      return { success: true, copied: 0, errors: 0, message: 'No data to copy' };
    }

    // Get data from source
    const sourceData = await sourcePrisma[name].findMany();
    console.log(`   📥 Retrieved ${sourceData.length} records from source`);

    // Clear existing data in target
    const deletedCount = await targetPrisma[name].deleteMany({});
    console.log(`   🗑️  Cleared ${deletedCount.count} existing records from target`);

    // Insert data into target
    const result = await targetPrisma[name].createMany({
      data: sourceData,
      skipDuplicates: true
    });

    console.log(`   ✅ Successfully copied ${result.count} records`);
    
    // Verify the copy
    const targetCount = await targetPrisma[name].count();
    console.log(`   🔍 Verification: ${targetCount} records in target (should match ${sourceData.length})`);
    
    if (targetCount === sourceData.length) {
      console.log(`   ✅ Verification passed!`);
    } else {
      console.log(`   ⚠️  Verification failed: expected ${sourceData.length}, got ${targetCount}`);
    }

    return { 
      success: true, 
      copied: result.count, 
      errors: 0, 
      message: `Successfully copied ${result.count} records` 
    };

  } catch (error) {
    console.error(`   ❌ Error copying ${name}:`, error.message);
    return { 
      success: false, 
      copied: 0, 
      errors: 1, 
      message: error.message 
    };
  }
}

async function copyAllTables() {
  console.log('🚀 Starting table-by-table copy from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    // Test connections
    console.log('📡 Testing database connections...');
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    let totalCopied = 0;
    let totalErrors = 0;
    let successfulTables = [];
    let failedTables = [];

    // Copy tables in order (respecting dependencies)
    for (const tableInfo of tables) {
      const result = await copyTable(tableInfo);
      
      if (result.success) {
        totalCopied += result.copied;
        successfulTables.push({
          name: tableInfo.name,
          copied: result.copied,
          message: result.message
        });
      } else {
        totalErrors++;
        failedTables.push({
          name: tableInfo.name,
          error: result.message
        });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 COPY SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total records copied: ${totalCopied}`);
    console.log(`Successful tables: ${successfulTables.length}`);
    console.log(`Failed tables: ${failedTables.length}`);
    console.log(`Success rate: ${((successfulTables.length / tables.length) * 100).toFixed(1)}%`);

    if (successfulTables.length > 0) {
      console.log('\n✅ SUCCESSFUL TABLES:');
      successfulTables.forEach(table => {
        console.log(`   • ${table.name}: ${table.copied} records - ${table.message}`);
      });
    }

    if (failedTables.length > 0) {
      console.log('\n❌ FAILED TABLES:');
      failedTables.forEach(table => {
        console.log(`   • ${table.name}: ${table.error}`);
      });
    }

    console.log('\n🎯 Copy completed!');
    console.log('🌐 You can now run the development server to see the copied data.');

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Check if specific table is requested
const tableName = process.argv[2];
if (tableName) {
  const tableInfo = tables.find(t => t.name === tableName);
  if (tableInfo) {
    console.log(`🎯 Copying specific table: ${tableName}`);
    copyTable(tableInfo).then(result => {
      console.log(`\n📊 Summary: ${result.copied} records copied, ${result.errors} errors`);
      process.exit(result.success ? 0 : 1);
    }).catch(console.error);
  } else {
    console.log(`❌ Table "${tableName}" not found. Available tables:`);
    tables.forEach(table => console.log(`   • ${table.name}: ${table.description}`));
    process.exit(1);
  }
} else {
  // Copy all tables
  copyAllTables().catch(console.error);
} 