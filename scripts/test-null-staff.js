const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProjectStaffCreation() {
  console.log('🧪 Testing ProjectStaff creation with null staffId...');
  
  try {
    // Test data
    const testData = {
      projectId: 1,
      staffId: null,
      designation: 'Test Position Direct',
      utilization: 100,
      startDate: null,
      endDate: null,
      status: 'Active',
      notes: null,
    };

    console.log('📝 Test data:', testData);

    // Create the record directly
    const result = await prisma.projectStaff.create({
      data: testData,
      include: {
        staff: true,
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
    });

    console.log('✅ Successfully created:', result);
    console.log('   Staff:', result.staff);
    console.log('   Project:', result.project);

    // Clean up
    await prisma.projectStaff.delete({
      where: { id: result.id }
    });
    console.log('🧹 Cleaned up test record');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProjectStaffCreation();
