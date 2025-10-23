const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProjectStaffCreation() {
  console.log('🧪 Testing ProjectStaff creation...');
  
  try {
    // Get the first project
    const project = await prisma.project.findFirst();
    if (!project) {
      console.log('❌ No projects found. Please create a project first.');
      return;
    }

    console.log(`📁 Testing with project: ${project.projectName} (ID: ${project.id})`);

    // Get available staff
    const staff = await prisma.companyStaff.findMany();
    if (staff.length === 0) {
      console.log('❌ No staff members found. Please add staff first.');
      return;
    }

    console.log(`👥 Available staff: ${staff.map(s => s.staffName).join(', ')}`);

    // Create Project Director position
    console.log('\n➕ Creating Project Director position...');
    const directorPosition = await prisma.projectStaff.create({
      data: {
        projectId: project.id,
        staffId: staff[0].id,
        designation: 'Project Director',
        utilization: 100,
        status: 'Active',
      },
      include: {
        staff: true
      }
    });
    console.log(`✅ Created: ${directorPosition.designation} - ${directorPosition.staff?.staffName}`);

    // Create Project Manager position
    console.log('\n➕ Creating Project Manager position...');
    const managerPosition = await prisma.projectStaff.create({
      data: {
        projectId: project.id,
        staffId: staff[1].id,
        designation: 'Project Manager',
        utilization: 100,
        status: 'Active',
      },
      include: {
        staff: true
      }
    });
    console.log(`✅ Created: ${managerPosition.designation} - ${managerPosition.staff?.staffName}`);

    // Verify the assignments
    console.log('\n🔍 Verifying assignments...');
    const projectStaff = await prisma.projectStaff.findMany({
      where: { projectId: project.id },
      include: { staff: true }
    });

    console.log(`📋 Project staff assignments for ${project.projectName}:`);
    projectStaff.forEach(ps => {
      console.log(`   👤 ${ps.designation}: ${ps.staff?.staffName || 'Unassigned'} (Utilization: ${ps.utilization}%)`);
    });

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing ProjectStaff creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProjectStaffCreation();
