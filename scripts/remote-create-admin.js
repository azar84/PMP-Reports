#!/usr/bin/env node

/**
 * Script to create admin user that can be run via Vercel CLI
 * Usage: vercel env pull .env.local && node scripts/remote-create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating/updating admin user...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Please set it in your environment.');
    process.exit(1);
  }

  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Ensure default tenant exists
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        name: 'Default Tenant',
        slug: 'default',
      },
    });

    console.log(`✅ Tenant: ${defaultTenant.name} (ID: ${defaultTenant.id})`);

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
      console.log('\n✅ Admin user UPDATED successfully!');
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
      console.log('\n✅ Admin user CREATED successfully!');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Active: ${admin.isActive}`);
    }

    console.log('\n🎉 Admin user is ready!');
    console.log('   Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

