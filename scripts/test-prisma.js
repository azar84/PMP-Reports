const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Prisma connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test a simple query
    const projectCount = await prisma.project.count();
    console.log(`📊 Found ${projectCount} projects`);
    
    // Test ProjectStaff model
    const staffCount = await prisma.projectStaff.count();
    console.log(`👥 Found ${staffCount} project staff records`);
    
    // Test CompanyStaff model
    const companyStaffCount = await prisma.companyStaff.count();
    console.log(`🏢 Found ${companyStaffCount} company staff records`);
    
  } catch (error) {
    console.error('❌ Prisma connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
