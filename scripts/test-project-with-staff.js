const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProjectCreationWithStaff() {
  console.log('🧪 Testing project creation with director and manager...');
  
  try {
    // Get available staff
    const staff = await prisma.companyStaff.findMany();
    if (staff.length < 2) {
      console.log('❌ Need at least 2 staff members for testing');
      return;
    }

    console.log(`👥 Available staff: ${staff.map(s => s.staffName).join(', ')}`);

    // Test data for project creation
    const projectData = {
      projectCode: 'TEST-' + Date.now(),
      projectName: 'Test Project with Staff',
      projectDescription: 'Testing project creation with director and manager',
      projectDirectorId: staff[0].id, // First staff as director
      projectManagerId: staff[1].id,  // Second staff as manager
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      duration: '12 months',
      projectValue: 100000,
    };

    console.log('📝 Creating project with data:', projectData);

    // Create the project
    const project = await prisma.project.create({
      data: {
        ...projectData,
        startDate: new Date(projectData.startDate),
        endDate: new Date(projectData.endDate),
      },
      include: {
        projectStaff: {
          include: {
            staff: true
          }
        }
      }
    });

    console.log('✅ Project created successfully:', project.projectName);
    console.log('📋 Project staff assignments:');
    project.projectStaff.forEach(ps => {
      console.log(`   👤 ${ps.designation}: ${ps.staff?.staffName || 'Unknown'}`);
    });

    // Clean up - delete the test project (this will cascade delete projectStaff)
    await prisma.project.delete({
      where: { id: project.id }
    });
    console.log('🧹 Cleaned up test project');

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing project creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProjectCreationWithStaff();
