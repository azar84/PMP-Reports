const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFormSubmissions() {
  try {
    console.log('🔍 Checking form submissions...');
    
    // Get all form submissions
    const submissions = await prisma.formSubmission.findMany({
      orderBy: { id: 'desc' },
      take: 10
    });
    
    console.log(`📊 Found ${submissions.length} form submissions:`);
    submissions.forEach(sub => {
      console.log(`  - ID: ${sub.id}, Form ID: ${sub.formId}, Created: ${sub.createdAt}`);
    });
    
    // Check the sequence
    const maxResult = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM form_submissions`;
    const maxId = maxResult[0]?.max_id || 0;
    console.log(`📈 Max ID: ${maxId}`);
    
    // Check if there are any gaps in the sequence
    if (submissions.length > 0) {
      const ids = submissions.map(s => s.id).sort((a, b) => a - b);
      console.log(`🔢 ID sequence: ${ids.join(', ')}`);
      
      // Check for gaps
      for (let i = 1; i < ids.length; i++) {
        if (ids[i] - ids[i-1] > 1) {
          console.log(`⚠️ Gap detected between ${ids[i-1]} and ${ids[i]}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking form submissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFormSubmissions(); 