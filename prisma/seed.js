const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');

const prisma = new PrismaClient();

const permissionCatalog = require(path.join(__dirname, '..', 'src', 'data', 'permission-catalog.json'));


function buildPermissionSeedDefinitions(tenantId) {
  const { menuItems = [], operations = [], specialPermissions = [] } = permissionCatalog;

  const definitions = [];

  for (const special of specialPermissions) {
    definitions.push({
      tenantId,
      key: special.key,
      resource: special.resource || 'admin',
      description: special.description || special.label || special.key,
      isSystem: true,
    });
  }

  for (const menuItem of menuItems) {
    for (const operation of operations) {
      definitions.push({
        tenantId,
        key: `${menuItem.key}.${operation.key}`,
        resource: menuItem.key,
        description: `${operation.label} permission for ${menuItem.label}`,
        isSystem: true,
      });
    }
  }

  return definitions;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user if it doesn't exist
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  // Ensure a default tenant exists
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'default',
    },
  });

  const existingAdmin = await prisma.adminUser.findFirst({
    where: {
      tenantId: defaultTenant.id,
      username,
    },
  });

  // Seed permissions
  const permissionDefinitions = buildPermissionSeedDefinitions(defaultTenant.id);
  if (permissionDefinitions.length > 0) {
    for (const definition of permissionDefinitions) {
      await prisma.permission.upsert({
        where: {
          tenantId_key: {
            tenantId: definition.tenantId,
            key: definition.key,
          },
        },
        update: {
          description: definition.description,
          resource: definition.resource,
          isSystem: definition.isSystem,
        },
        create: definition,
      });
    }
    console.log(`✅ Seeded ${permissionDefinitions.length} permission definitions`);
  }

  const allPermissions = await prisma.permission.findMany({
    where: { tenantId: defaultTenant.id },
  });

  const createRoleWithPermissions = async (name, description, permissionIds, isSystem = false) => {
    const role = await prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId: defaultTenant.id,
          name,
        },
      },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        name,
        description,
        isSystem,
      },
    });

    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: {
          action: 'allow',
        },
        create: {
          roleId: role.id,
          permissionId,
          action: 'allow',
        },
      });
    }

    return role;
  };

  // Create SuperUser role with all permissions
  const allPermissionIds = allPermissions.map((permission) => permission.id);
  const superUserRole = await createRoleWithPermissions(
    'SuperUser',
    'Super user with full access to everything - bypasses all restrictions',
    allPermissionIds,
    true
  );

  // Create Admin role with all permissions (legacy compatibility)
  await createRoleWithPermissions(
    'Admin',
    'Full system administrator with all permissions',
    allPermissionIds,
    true
  );

  // Create Project Manager role with targeted permissions
  const projectManagerPermissionKeys = [
    'projects.view',
    'projects.update',
    'projects.create',
    'clients.view',
    'consultants.view',
    'staff.view',
    'staff.update',
    'labours.view',
    'labours.update',
    'contacts.view',
    'contacts.update',
    'media.view',
    'scheduler.view',
  ];

  const projectManagerPermissionIds = allPermissions
    .filter((permission) => projectManagerPermissionKeys.includes(permission.key))
    .map((permission) => permission.id);

  await createRoleWithPermissions(
    'Project Manager',
    'Project-level access for managing team, resources, and quality logs',
    projectManagerPermissionIds,
    false
  );

  let adminUserRecord = existingAdmin;

  if (!adminUserRecord) {
    adminUserRecord = await prisma.adminUser.create({
      data: {
        tenantId: defaultTenant.id,
        username,
        email,
        passwordHash,
        name: 'Default Admin',
        role: 'admin',
        isActive: true,
        hasAllProjectsAccess: true,
      },
    });
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    // Update existing admin user to ensure password and access are correct
    adminUserRecord = await prisma.adminUser.update({
      where: { id: adminUserRecord.id },
      data: {
        passwordHash, // Always update password hash to ensure it's correct
        email,
        isActive: true,
        hasAllProjectsAccess: true,
      },
    });
    console.log('ℹ️  Admin user already exists, updated password and access.');
  }

  if (adminUserRecord) {
    await prisma.adminUser.update({
      where: { id: adminUserRecord.id },
      data: {
        hasAllProjectsAccess: true,
        userRoles: {
          connectOrCreate: {
            where: {
              userId_roleId: {
                userId: adminUserRecord.id,
                roleId: superUserRole.id,
              },
            },
            create: {
              roleId: superUserRole.id,
            },
          },
        },
      },
    });
  }

  // Create default site settings if they don't exist
  const existingSettings = await prisma.siteSettings.findFirst();

  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        footerCompanyName: 'Your Company',
        footerCompanyDescription: 'Admin panel for managing your application.',
        baseUrl: 'http://localhost:3000',
      },
    });
    console.log('✅ Default site settings created');
  } else {
    console.log('ℹ️  Site settings already exist, skipping creation.');
  }

  // Create default design system if it doesn't exist
  const existingDesignSystem = await prisma.designSystem.findFirst();

  if (!existingDesignSystem) {
    await prisma.designSystem.create({
      data: {
        isActive: true,
      },
    });
    console.log('✅ Default design system created');
  } else {
    console.log('ℹ️  Design system already exists, skipping creation.');
  }

  // Create default consultant types if they don't exist
  const defaultConsultantTypes = [
    { type: 'Project Management', description: 'Project Management Consultant (PMC)' },
    { type: 'Design', description: 'Design Consultant' },
    { type: 'Cost', description: 'Cost Consultant' },
    { type: 'Supervision', description: 'Supervision Consultant' },
  ];

  for (const consultantType of defaultConsultantTypes) {
    const existingType = await prisma.consultantType.findFirst({
      where: { type: consultantType.type },
    });

    if (!existingType) {
      await prisma.consultantType.create({
        data: consultantType,
      });
      console.log(`✅ Default consultant type created: ${consultantType.type}`);
    } else {
      console.log(`ℹ️  Consultant type '${consultantType.type}' already exists, skipping creation.`);
    }
  }

  // Create default positions if they don't exist
  const defaultPositions = [
    { name: 'Project Director', description: 'Overall project leadership and strategic direction', monthlyRate: 15000 },
    { name: 'Project Manager', description: 'Day-to-day project management and coordination', monthlyRate: 12000 },
    { name: 'Senior Architect', description: 'Lead architectural design and technical oversight', monthlyRate: 14000 },
    { name: 'Architect', description: 'Architectural design and planning', monthlyRate: 11000 },
    { name: 'Senior Engineer', description: 'Senior engineering and technical leadership', monthlyRate: 13000 },
    { name: 'Engineer', description: 'Engineering design and implementation', monthlyRate: 10000 },
    { name: 'Site Engineer', description: 'On-site engineering and supervision', monthlyRate: 9500 },
    { name: 'Quantity Surveyor', description: 'Cost estimation and quantity calculations', monthlyRate: 9000 },
    { name: 'Senior Quantity Surveyor', description: 'Senior cost management and quantity surveying', monthlyRate: 11000 },
    { name: 'Design Manager', description: 'Design coordination and management', monthlyRate: 12000 },
    { name: 'Designer', description: 'Design development and documentation', monthlyRate: 8500 },
    { name: 'Senior Designer', description: 'Senior design development and leadership', monthlyRate: 10500 },
    { name: 'CAD Technician', description: 'Computer-aided design and drafting', monthlyRate: 7000 },
    { name: 'Senior CAD Technician', description: 'Senior CAD work and technical support', monthlyRate: 8500 },
    { name: 'Project Coordinator', description: 'Project coordination and administrative support', monthlyRate: 8000 },
    { name: 'Administrative Assistant', description: 'Administrative support and documentation', monthlyRate: 6000 },
    { name: 'Office Manager', description: 'Office management and administrative oversight', monthlyRate: 9000 },
    { name: 'Finance Manager', description: 'Financial management and accounting', monthlyRate: 10000 },
    { name: 'HR Manager', description: 'Human resources management', monthlyRate: 9500 },
    { name: 'IT Support', description: 'Information technology support and maintenance', monthlyRate: 7500 },
  ];

  for (const position of defaultPositions) {
    const existingPosition = await prisma.position.findFirst({
      where: { name: position.name },
    });

    if (!existingPosition) {
      await prisma.position.create({
        data: position,
      });
      console.log(`✅ Default position created: ${position.name}`);
    } else {
      console.log(`ℹ️  Position '${position.name}' already exists, skipping creation.`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 