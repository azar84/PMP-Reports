const { PrismaClient } = require('@prisma/client');

// Vercel database connection
const vercelPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://neondb_owner:npg_kYwWniTG9CS4@ep-steep-truth-adhpdp39-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function verifyVercelMedia() {
  try {
    console.log('🔍 Verifying current Vercel Media Library...');
    
    await vercelPrisma.$connect();
    console.log('✅ Connected to Vercel database');
    
    console.log('\n📊 Current Vercel Media Library:');
    console.log('==================================');
    
    // Check MediaLibrary
    const mediaLibrary = await vercelPrisma.mediaLibrary.findMany({
      orderBy: { id: 'asc' }
    });
    console.log(`📊 MediaLibrary: ${mediaLibrary.length} entries`);
    
    if (mediaLibrary.length > 0) {
      console.log('\n📋 MediaLibrary Details:');
      mediaLibrary.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}`);
        console.log(`     Filename: ${item.filename}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     File Type: ${item.fileType}`);
        console.log(`     Original URL: ${item.originalUrl}`);
        console.log(`     Public URL: ${item.publicUrl}`);
        console.log(`     File Size: ${item.fileSize}`);
        console.log(`     Width: ${item.width}, Height: ${item.height}`);
        console.log(`     Is Active: ${item.isActive}`);
        console.log(`     Is Public: ${item.isPublic}`);
        console.log(`     Created At: ${item.createdAt}`);
        console.log('     ---');
      });
    }

    // Check MediaFolder
    const mediaFolder = await vercelPrisma.mediaFolder.findMany();
    console.log(`\n📊 MediaFolder: ${mediaFolder.length} entries`);
    
    if (mediaFolder.length > 0) {
      console.log('\n📋 MediaFolder Details:');
      mediaFolder.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}`);
        console.log(`     Name: ${item.name}`);
        console.log(`     Description: ${item.description}`);
        console.log(`     Color: ${item.color}`);
        console.log(`     Parent ID: ${item.parentId}`);
        console.log(`     Is Active: ${item.isActive}`);
        console.log('     ---');
      });
    }

    // Check MediaUsage
    const mediaUsage = await vercelPrisma.mediaUsage.findMany();
    console.log(`\n📊 MediaUsage: ${mediaUsage.length} entries`);
    
    if (mediaUsage.length > 0) {
      console.log('\n📋 MediaUsage Details:');
      mediaUsage.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}`);
        console.log(`     Media ID: ${item.mediaId}`);
        console.log(`     Entity Type: ${item.entityType}`);
        console.log(`     Entity ID: ${item.entityId}`);
        console.log(`     Field Name: ${item.fieldName}`);
        console.log('     ---');
      });
    }

    // Check if there are any issues with the data
    console.log('\n🔍 Checking for potential issues:');
    
    const inactiveMedia = mediaLibrary.filter(item => !item.isActive);
    if (inactiveMedia.length > 0) {
      console.log(`⚠️ Found ${inactiveMedia.length} inactive media items:`);
      inactiveMedia.forEach(item => {
        console.log(`   - ${item.filename} (ID: ${item.id})`);
      });
    }

    const nullUrls = mediaLibrary.filter(item => !item.publicUrl || item.publicUrl === '');
    if (nullUrls.length > 0) {
      console.log(`⚠️ Found ${nullUrls.length} media items with null/empty URLs:`);
      nullUrls.forEach(item => {
        console.log(`   - ${item.filename} (ID: ${item.id})`);
      });
    }

    console.log('\n✅ Vercel Media Library verification completed!');

  } catch (error) {
    console.error('❌ Error verifying Vercel media library:', error);
  } finally {
    await vercelPrisma.$disconnect();
  }
}

verifyVercelMedia(); 