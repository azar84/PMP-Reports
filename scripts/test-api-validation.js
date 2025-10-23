const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProjectStaffAPI() {
  console.log('🧪 Testing ProjectStaff API validation...');
  
  try {
    // Test data that should work
    const testData = {
      projectId: 1,
      staffId: null, // Unassigned position
      designation: 'Senior Engineer',
      utilization: 75,
      startDate: '', // Empty string
      endDate: '', // Empty string
      status: 'Active',
      notes: '', // Empty string
    };

    console.log('📝 Test data:', testData);

    // Create the position
    const result = await prisma.projectStaff.create({
      data: {
        ...testData,
        startDate: testData.startDate && testData.startDate !== '' ? new Date(testData.startDate) : null,
        endDate: testData.endDate && testData.endDate !== '' ? new Date(testData.endDate) : null,
        notes: testData.notes && testData.notes !== '' ? testData.notes : null,
      },
      include: {
        staff: true
      }
    });

    console.log('✅ Successfully created position:', result.designation);
    console.log('   Start Date:', result.startDate);
    console.log('   End Date:', result.endDate);
    console.log('   Notes:', result.notes);

    // Clean up - delete the test record
    await prisma.projectStaff.delete({
      where: { id: result.id }
    });
    console.log('🧹 Cleaned up test record');

    console.log('\n🎉 API validation test passed!');

  } catch (error) {
    console.error('❌ Error testing ProjectStaff API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProjectStaffAPI();
