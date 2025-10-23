const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProjectStaffCreation() {
  console.log('🔍 Debugging ProjectStaff creation...');
  
  try {
    // Test the exact same data that the API is trying to create
    const testData = {
      projectId: 1,
      staffId: null,
      designation: 'Test Engineer',
      utilization: 100,
      startDate: null,
      endDate: null,
      status: 'Active',
      notes: null,
    };

    console.log('📝 Test data:', testData);

    // Try to create the record directly
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
    
    // Clean up
    await prisma.projectStaff.delete({
      where: { id: result.id }
    });
    console.log('🧹 Cleaned up test record');

  } catch (error) {
    console.error('❌ Error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    // Check if it's a Prisma error
    if (error.code) {
      console.error('❌ Prisma error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugProjectStaffCreation();
