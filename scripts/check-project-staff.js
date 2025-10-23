const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjectStaffStatus() {
  console.log('🔍 Checking current project and staff status...');
  
  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      include: {
        projectStaff: {
          include: {
            staff: true
          }
        }
      }
    });

    console.log(`📊 Found ${projects.length} projects`);

    if (projects.length === 0) {
      console.log('📝 No projects found. The issue might be that projects are being created without director/manager assignments.');
      return;
    }

    console.log('\n📋 Current project staff assignments:');
    projects.forEach(project => {
      console.log(`\n📁 ${project.projectName} (ID: ${project.id}):`);
      if (project.projectStaff.length === 0) {
        console.log('   ❌ No staff assignments');
      } else {
        project.projectStaff.forEach(ps => {
          console.log(`   👤 ${ps.designation}: ${ps.staff?.staffName || 'Unassigned'} (Staff ID: ${ps.staffId || 'null'})`);
        });
      }
    });

    // Check if there are any staff members
    const staffCount = await prisma.companyStaff.count();
    console.log(`\n👥 Total company staff members: ${staffCount}`);

    if (staffCount > 0) {
      const staff = await prisma.companyStaff.findMany({
        take: 5 // Show first 5 staff members
      });
      console.log('\n👤 Available staff members:');
      staff.forEach(s => {
        console.log(`   • ${s.staffName} (ID: ${s.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking project staff status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProjectStaffStatus();
