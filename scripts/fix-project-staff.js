const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProjectStaffAssignments() {
  console.log('🔍 Checking for projects with director/manager assignments but no ProjectStaff records...');
  
  try {
    // Find all projects that have director or manager assignments
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { projectDirectorId: { not: null } },
          { projectManagerId: { not: null } }
        ]
      },
      include: {
        projectStaff: true
      }
    });

    console.log(`📊 Found ${projects.length} projects with director/manager assignments`);

    let fixedCount = 0;

    for (const project of projects) {
      console.log(`\n🔧 Processing project: ${project.projectName} (ID: ${project.id})`);
      
      const existingStaffDesignations = project.projectStaff.map(ps => ps.designation);
      console.log(`   Existing staff designations: ${existingStaffDesignations.join(', ') || 'None'}`);

      // Check for Project Director
      if (project.projectDirectorId && !existingStaffDesignations.includes('Project Director')) {
        console.log(`   ➕ Creating Project Director assignment for staff ID: ${project.projectDirectorId}`);
        
        await prisma.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: project.projectDirectorId,
            designation: 'Project Director',
            utilization: 100,
            status: 'Active',
          }
        });
        
        fixedCount++;
        console.log(`   ✅ Project Director assignment created`);
      }

      // Check for Project Manager
      if (project.projectManagerId && !existingStaffDesignations.includes('Project Manager')) {
        console.log(`   ➕ Creating Project Manager assignment for staff ID: ${project.projectManagerId}`);
        
        await prisma.projectStaff.create({
          data: {
            projectId: project.id,
            staffId: project.projectManagerId,
            designation: 'Project Manager',
            utilization: 100,
            status: 'Active',
          }
        });
        
        fixedCount++;
        console.log(`   ✅ Project Manager assignment created`);
      }

      if (!project.projectDirectorId && !project.projectManagerId) {
        console.log(`   ⏭️  No director/manager assignments to fix`);
      }
    }

    console.log(`\n🎉 Fix completed! Created ${fixedCount} ProjectStaff records`);
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedProjects = await prisma.project.findMany({
      where: {
        OR: [
          { projectDirectorId: { not: null } },
          { projectManagerId: { not: null } }
        ]
      },
      include: {
        projectStaff: {
          include: {
            staff: true
          }
        }
      }
    });

    console.log('\n📋 Updated project staff assignments:');
    updatedProjects.forEach(project => {
      console.log(`\n📁 ${project.projectName}:`);
      project.projectStaff.forEach(ps => {
        console.log(`   👤 ${ps.designation}: ${ps.staff?.staffName || 'Unknown Staff'}`);
      });
    });

  } catch (error) {
    console.error('❌ Error fixing project staff assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProjectStaffAssignments();
