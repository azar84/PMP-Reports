const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting Admin role removal...');

  try {
    // Get default tenant
    const defaultTenant = await prisma.tenant.findFirst({
      where: { slug: 'default' },
    });

    if (!defaultTenant) {
      console.error('❌ Default tenant not found');
      process.exit(1);
    }

    // Find SuperUser role
    const superUserRole = await prisma.role.findFirst({
      where: {
        tenantId: defaultTenant.id,
        name: 'SuperUser',
      },
    });

    if (!superUserRole) {
      console.error('❌ SuperUser role not found. Please run seed script first.');
      process.exit(1);
    }

    // Find Admin role
    const adminRole = await prisma.role.findFirst({
      where: {
        tenantId: defaultTenant.id,
        name: 'Admin',
      },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!adminRole) {
      console.log('ℹ️  Admin role not found. Nothing to remove.');
      process.exit(0);
    }

    console.log(`📋 Found Admin role with ${adminRole.userRoles.length} user(s) assigned.`);

    // Reassign users from Admin to SuperUser
    if (adminRole.userRoles.length > 0) {
      console.log(`   Reassigning ${adminRole.userRoles.length} user(s) from Admin to SuperUser role...`);
      
      for (const userRole of adminRole.userRoles) {
        const userName = userRole.user.username;
        
        // Check if user already has SuperUser role
        const existingSuperUserRole = await prisma.userRole.findUnique({
          where: {
            userId_roleId: {
              userId: userRole.userId,
              roleId: superUserRole.id,
            },
          },
        });

        // Delete Admin role assignment
        await prisma.userRole.delete({
          where: {
            userId_roleId: {
              userId: userRole.userId,
              roleId: adminRole.id,
            },
          },
        });

        // Assign SuperUser role if not already assigned
        if (!existingSuperUserRole) {
          await prisma.userRole.create({
            data: {
              userId: userRole.userId,
              roleId: superUserRole.id,
            },
          });
          console.log(`   ✅ ${userName} reassigned to SuperUser role`);
        } else {
          console.log(`   ℹ️  ${userName} already has SuperUser role, removed Admin role only`);
        }
      }
    }

    // Remove RolePermission relationships
    const permissionCount = await prisma.rolePermission.count({
      where: { roleId: adminRole.id },
    });
    
    if (permissionCount > 0) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: adminRole.id },
      });
      console.log(`   ✅ Removed ${permissionCount} permission(s) from Admin role`);
    }

    // Delete the Admin role
    await prisma.role.delete({
      where: { id: adminRole.id },
    });

    console.log('✅ Admin role successfully removed from database');
    console.log('✅ Only SuperUser remains as a system role');
  } catch (error) {
    console.error('❌ Error removing Admin role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
