const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductionSequence() {
  try {
    console.log('🔧 Fixing production form submission sequence...');
    
    // Get the current max ID
    const maxResult = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM form_submissions`;
    const maxId = maxResult[0]?.max_id || 0;
    
    console.log(`📊 Current max ID: ${maxId}`);
    
    // Get the current sequence value
    const sequenceResult = await prisma.$queryRaw`SELECT last_value FROM form_submissions_id_seq`;
    const currentSequence = sequenceResult[0]?.last_value || 0;
    
    console.log(`📈 Current sequence value: ${currentSequence}`);
    
    if (maxId > currentSequence) {
      console.log(`⚠️ Sequence is behind! Max ID (${maxId}) > Sequence (${currentSequence})`);
      
      // Reset the sequence to the next value after the max ID
      await prisma.$executeRaw`ALTER SEQUENCE form_submissions_id_seq RESTART WITH ${maxId + 1}`;
      console.log(`✅ Sequence reset to start from ${maxId + 1}`);
    } else if (maxId === 0 && currentSequence > 0) {
      console.log(`⚠️ No submissions but sequence is ahead! Resetting to 1`);
      await prisma.$executeRaw`ALTER SEQUENCE form_submissions_id_seq RESTART WITH 1`;
      console.log(`✅ Sequence reset to start from 1`);
    } else {
      console.log(`✅ Sequence is already correct`);
    }
    
    // Verify the fix
    const verifyResult = await prisma.$queryRaw`SELECT last_value FROM form_submissions_id_seq`;
    const newSequence = verifyResult[0]?.last_value || 0;
    console.log(`✅ New sequence value: ${newSequence}`);
    
    console.log('✅ Production sequence fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing production sequence:', error);
    
    // Try alternative approach for different database systems
    try {
      console.log('🔄 Trying alternative sequence reset...');
      
      // Get the current max ID
      const maxResult = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM form_submissions`;
      const maxId = maxResult[0]?.max_id || 0;
      
      // Try to reset using a different approach
      await prisma.$executeRaw`SELECT setval('form_submissions_id_seq', ${maxId + 1}, false)`;
      console.log(`✅ Alternative sequence reset completed`);
      
    } catch (altError) {
      console.error('❌ Alternative approach also failed:', altError);
      console.log('💡 Manual intervention may be required');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionSequence(); 