const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🔧 Creating test data...');
  
  try {
    // Create a test project
    const project = await prisma.project.create({
      data: {
        projectCode: 'TEST-001',
        projectName: 'Test Project for API',
        projectDescription: 'Test project for API testing',
      }
    });
    console.log('✅ Created project:', project.projectName);

    // Create some test staff
    const staff1 = await prisma.companyStaff.create({
      data: {
        staffName: 'Test Staff 1',
        email: 'staff1@test.com',
        position: 'Engineer',
      }
    });
    console.log('✅ Created staff:', staff1.staffName);

    const staff2 = await prisma.companyStaff.create({
      data: {
        staffName: 'Test Staff 2',
        email: 'staff2@test.com',
        position: 'Manager',
      }
    });
    console.log('✅ Created staff:', staff2.staffName);

    console.log('\n📊 Test data ready:');
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Staff IDs: ${staff1.id}, ${staff2.id}`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
