const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user if it doesn't exist
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.adminUser.findFirst({
    where: { username },
  });

  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        username,
        email,
        passwordHash,
        name: 'Default Admin',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation.');
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