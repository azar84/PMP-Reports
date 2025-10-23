const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database state...');
  
  try {
    // Check projects
    const projects = await prisma.project.findMany();
    console.log(`📊 Projects: ${projects.length}`);
    projects.forEach(p => console.log(`   - ${p.projectName} (ID: ${p.id})`));

    // Check company staff
    const staff = await prisma.companyStaff.findMany();
    console.log(`👥 Company Staff: ${staff.length}`);
    staff.forEach(s => console.log(`   - ${s.staffName} (ID: ${s.id})`));

    // Check project staff
    const projectStaff = await prisma.projectStaff.findMany();
    console.log(`📋 Project Staff: ${projectStaff.length}`);
    projectStaff.forEach(ps => console.log(`   - ${ps.designation} (Staff ID: ${ps.staffId})`));

    // Try to create a simple project staff record without staffId
    console.log('\n🧪 Testing simple creation...');
    const testRecord = await prisma.projectStaff.create({
      data: {
        projectId: 1,
        designation: 'Test Position',
        utilization: 100,
        status: 'Active',
      }
    });
    console.log('✅ Created test record:', testRecord);

    // Clean up
    await prisma.projectStaff.delete({
      where: { id: testRecord.id }
    });
    console.log('🧹 Cleaned up test record');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
