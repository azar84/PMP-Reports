const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWithProject() {
  console.log('🧪 Testing with project creation...');
  
  try {
    // Create a test project first
    const project = await prisma.project.create({
      data: {
        projectCode: 'TEST-' + Date.now(),
        projectName: 'Test Project',
        projectDescription: 'Test project for staff testing',
      }
    });
    console.log('✅ Created project:', project.projectName);

    // Now try to create project staff without staffId
    const projectStaff = await prisma.projectStaff.create({
      data: {
        projectId: project.id,
        designation: 'Test Position',
        utilization: 100,
        status: 'Active',
      }
    });
    console.log('✅ Created project staff:', projectStaff);

    // Clean up
    await prisma.project.delete({
      where: { id: project.id }
    });
    console.log('🧹 Cleaned up test project');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWithProject();
