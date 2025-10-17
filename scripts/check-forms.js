const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkForms() {
  try {
    console.log('🔍 Checking forms...');
    
    // Get all forms
    const forms = await prisma.form.findMany({
      include: {
        fields: true,
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${forms.length} forms:`);
    forms.forEach(form => {
      console.log(`  - ID: ${form.id}, Name: ${form.name}, Active: ${form.isActive}, Submissions: ${form._count.submissions}`);
      console.log(`    Fields: ${form.fields.length}`);
    });
    
    if (forms.length === 0) {
      console.log('⚠️ No forms found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking forms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkForms(); 