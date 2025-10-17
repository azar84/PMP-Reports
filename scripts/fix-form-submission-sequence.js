const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFormSubmissionSequence() {
  try {
    console.log('🔧 Fixing form submission ID sequence...');
    
    // Get the current max ID
    const maxResult = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM form_submissions`;
    const maxId = maxResult[0]?.max_id || 0;
    
    console.log(`📊 Current max ID: ${maxId}`);
    
    // Reset the sequence to the next value
    if (maxId > 0) {
      await prisma.$executeRaw`ALTER SEQUENCE form_submissions_id_seq RESTART WITH ${maxId + 1}`;
      console.log(`✅ Sequence reset to start from ${maxId + 1}`);
    } else {
      console.log('ℹ️ No existing submissions found, sequence should start from 1');
    }
    
    console.log('✅ Form submission sequence fixed!');
  } catch (error) {
    console.error('❌ Error fixing sequence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFormSubmissionSequence(); 