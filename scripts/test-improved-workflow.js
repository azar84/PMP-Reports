const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImprovedWorkflow() {
  console.log('🧪 Testing improved staff assignment workflow...');
  
  try {
    // Get existing test data
    const project = await prisma.project.findFirst();
    const staff = await prisma.companyStaff.findMany();
    
    if (!project) {
      console.log('❌ No project found. Please create a project first.');
      return;
    }
    
    if (staff.length === 0) {
      console.log('❌ No staff found. Please add staff first.');
      return;
    }

    console.log(`📁 Using project: ${project.projectName} (ID: ${project.id})`);
    console.log(`👥 Available staff: ${staff.map(s => s.staffName).join(', ')}`);

    // Create an unassigned position
    console.log('\n➕ Creating unassigned position...');
    const position = await prisma.projectStaff.create({
      data: {
        projectId: project.id,
        staffId: null, // Unassigned
        designation: 'Senior Engineer',
        utilization: 100,
        status: 'Active',
      },
      include: {
        staff: true
      }
    });
    console.log(`✅ Created position: ${position.designation} (ID: ${position.id})`);

    // Simulate assigning staff to the position
    console.log('\n🔗 Assigning staff to position...');
    const updatedPosition = await prisma.projectStaff.update({
      where: { id: position.id },
      data: {
        staffId: staff[0].id,
      },
      include: {
        staff: true
      }
    });
    console.log(`✅ Assigned ${updatedPosition.staff?.staffName} to ${updatedPosition.designation}`);

    // Clean up
    await prisma.projectStaff.delete({
      where: { id: position.id }
    });
    console.log('🧹 Cleaned up test position');

    console.log('\n🎉 Improved workflow test completed successfully!');
    console.log('\n📋 New Workflow:');
    console.log('   1. Click "+" button next to unassigned position');
    console.log('   2. Modal opens showing which position is being assigned');
    console.log('   3. Select staff member and click "Assign"');
    console.log('   4. No need to select position again!');

  } catch (error) {
    console.error('❌ Error testing improved workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImprovedWorkflow();
