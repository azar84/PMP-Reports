const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIProjectCreation() {
  console.log('🧪 Testing API project creation with director and manager...');
  
  try {
    // Test data for project creation
    const projectData = {
      projectCode: 'API-TEST-' + Date.now(),
      projectName: 'API Test Project with Staff',
      projectDescription: 'Testing API project creation with director and manager',
      projectDirectorId: 1,
      projectManagerId: 2,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      duration: '12 months',
      projectValue: 100000
    };

    console.log('📝 Creating project with data:', projectData);

    // Create the project using the same logic as the API
    const result = await prisma.$transaction(async (tx) => {
      // Create the project first
      const project = await tx.project.create({
        data: {
          projectCode: projectData.projectCode,
          projectName: projectData.projectName,
          projectDescription: projectData.projectDescription,
          startDate: new Date(projectData.startDate),
          endDate: new Date(projectData.endDate),
          duration: projectData.duration,
          projectValue: projectData.projectValue,
        },
        include: {
          projectStaff: {
            include: {
              staff: true,
            },
          },
        },
      });

      // Create ProjectStaff entries for director and manager if provided
      if (projectData.projectDirectorId) {
        await tx.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: projectData.projectDirectorId,
            designation: 'Project Director',
            utilization: 100,
            status: 'Active',
          },
        });
      }

      if (projectData.projectManagerId) {
        await tx.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: projectData.projectManagerId,
            designation: 'Project Manager',
            utilization: 100,
            status: 'Active',
          },
        });
      }

      // Return updated project with fresh staff data
      return await tx.project.findUnique({
        where: { id: project.id },
        include: {
          projectStaff: {
            include: {
              staff: true,
            },
          },
        },
      });
    });

    console.log('✅ Project created successfully:', result.projectName);
    console.log('📋 Project staff assignments:');
    result.projectStaff.forEach(ps => {
      console.log(`   👤 ${ps.designation}: ${ps.staff?.staffName || 'Unknown'}`);
    });

    // Clean up - delete the test project (this will cascade delete projectStaff)
    await prisma.project.delete({
      where: { id: result.id }
    });
    console.log('🧹 Cleaned up test project');

    console.log('\n🎉 API test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing API project creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAPIProjectCreation();
