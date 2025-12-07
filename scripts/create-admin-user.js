#!/usr/bin/env node

/**
 * Script to create or update admin user in the database
 * Can be run manually if seeding didn't work during deployment
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating/updating admin user...');

  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // Ensure default tenant exists
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        name: 'Default Tenant',
        slug: 'default',
      },
    });

    console.log(`✅ Tenant found/created: ${defaultTenant.name} (ID: ${defaultTenant.id})`);

    // Check if admin user exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        tenantId: defaultTenant.id,
        username,
      },
    });

    if (existingAdmin) {
      // Update existing admin user
      const updated = await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash,
          email,
          isActive: true,
          hasAllProjectsAccess: true,
        },
      });
      console.log('✅ Admin user updated successfully!');
      console.log(`   Username: ${updated.username}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Password: admin123 (has been reset)`);
      console.log(`   Active: ${updated.isActive}`);
    } else {
      // Create new admin user
      const admin = await prisma.adminUser.create({
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
      console.log('✅ Admin user created successfully!');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Active: ${admin.isActive}`);
    }

    console.log('\n🎉 Admin user is ready!');
    console.log('   You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

