const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting positions and consultant types seeding...');

  // Create default consultant types if they don't exist
  const defaultConsultantTypes = [
    { type: 'Project Management', description: 'Project Management Consultant (PMC)' },
    { type: 'Design', description: 'Design Consultant' },
    { type: 'Cost', description: 'Cost Consultant' },
    { type: 'Supervision', description: 'Supervision Consultant' },
  ];

  console.log('\n📋 Creating consultant types...');
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

  console.log('\n👥 Creating positions...');
  for (const position of defaultPositions) {
    const existingPosition = await prisma.position.findFirst({
      where: { name: position.name },
    });

    if (!existingPosition) {
      await prisma.position.create({
        data: position,
      });
      console.log(`✅ Default position created: ${position.name} ($${position.monthlyRate}/month)`);
    } else {
      console.log(`ℹ️  Position '${position.name}' already exists, skipping creation.`);
    }
  }

  console.log('\n🎉 Positions and consultant types seeding completed successfully!');
  
  // Display summary
  const consultantTypeCount = await prisma.consultantType.count();
  const positionCount = await prisma.position.count();
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Consultant Types: ${consultantTypeCount}`);
  console.log(`   - Positions: ${positionCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
