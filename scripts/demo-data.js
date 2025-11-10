'use strict';

const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureTenant() {
  return prisma.tenant.upsert({
    where: { slug: 'default' },
    update: { name: 'Default Tenant', isActive: true },
    create: { name: 'Default Tenant', slug: 'default', isActive: true },
  });
}

async function ensureTrades() {
  const tradeDefinitions = [
    {
      key: 'carpentry',
      name: 'Carpentry',
      description: 'Formwork and carpentry crews for structural works.',
      monthlyRate: 8500,
    },
    {
      key: 'electrical',
      name: 'Electrical',
      description: 'Electrical fit-out, cabling, and commissioning.',
      monthlyRate: 9200,
    },
  ];

  const trades = {};
  for (const def of tradeDefinitions) {
    const trade = await prisma.trade.upsert({
      where: { name: def.name },
      update: {
        description: def.description,
        monthlyRate: def.monthlyRate,
        isActive: true,
      },
      create: {
        name: def.name,
        description: def.description,
        monthlyRate: def.monthlyRate,
        isActive: true,
      },
    });
    trades[def.key] = trade;
  }

  return trades;
}

async function ensureClients(tenantId) {
  const definitions = [
    {
      key: 'northwind',
      name: 'Northwind Developments',
      officeAddress: '200 Harbour Street, Dubai Marina, UAE',
      phone: '+971 4 123 4567',
      email: 'contact@northwind.dev',
      contacts: [
        {
          key: 'northwindPrimary',
          firstName: 'Laura',
          lastName: 'Chen',
          email: 'laura.chen@northwind.dev',
          phone: '+971 50 111 3344',
          position: 'Director of Development',
        },
        {
          key: 'northwindFinance',
          firstName: 'Ibrahim',
          lastName: 'Hassan',
          email: 'ibrahim.hassan@northwind.dev',
          phone: '+971 52 888 9911',
          position: 'Finance Manager',
        },
      ],
    },
    {
      key: 'aurora',
      name: 'Aurora Estates',
      officeAddress: 'Level 18, Vision Tower, Business Bay, UAE',
      phone: '+971 4 456 7890',
      email: 'hello@auroraestates.com',
      contacts: [
        {
          key: 'auroraPrimary',
          firstName: 'Sophie',
          lastName: 'Khan',
          email: 'sophie.khan@auroraestates.com',
          phone: '+971 55 555 0199',
          position: 'Client Representative',
        },
      ],
    },
  ];

  const clients = {};
  const contacts = {};

  for (const def of definitions) {
    const data = {
      tenantId,
      name: def.name,
      officeAddress: def.officeAddress,
      phone: def.phone,
      email: def.email,
      isActive: true,
    };

    const existing = await prisma.client.findFirst({ where: { email: def.email } });
    const client = existing
      ? await prisma.client.update({ where: { id: existing.id }, data })
      : await prisma.client.create({ data });

    clients[def.key] = client;

    for (const contactDef of def.contacts) {
      const contactData = {
        firstName: contactDef.firstName,
        lastName: contactDef.lastName,
        email: contactDef.email,
        phone: contactDef.phone,
        position: contactDef.position,
        entityType: 'client',
        entityId: client.id,
        isActive: true,
      };

      const existingContact = await prisma.contact.findFirst({ where: { email: contactDef.email } });
      const contact = existingContact
        ? await prisma.contact.update({ where: { id: existingContact.id }, data: contactData })
        : await prisma.contact.create({ data: contactData });

      contacts[contactDef.key] = contact;
    }
  }

  return { clients, contacts };
}

async function ensureConsultants(tenantId) {
  const typeNames = ['Project Management', 'Design', 'Supervision', 'Cost'];
  const consultantTypes = {};

  for (const type of typeNames) {
    const record = await prisma.consultantType.upsert({
      where: { type },
      update: { description: undefined },
      create: { type },
    });
    consultantTypes[type] = record;
  }

  const definitions = [
    {
      key: 'pm',
      name: 'Horizon Project Managers',
      officeAddress: 'Suite 1205, Marina Plaza, Dubai',
      phone: '+971 4 222 7788',
      email: 'info@horizonpm.com',
      type: 'Project Management',
      contacts: [
        {
          key: 'pmPrimary',
          firstName: 'Andre',
          lastName: 'Silva',
          email: 'andre.silva@horizonpm.com',
          phone: '+971 56 123 4560',
          position: 'Senior Project Manager',
        },
      ],
    },
    {
      key: 'design',
      name: 'ArcForm Studio',
      officeAddress: 'Units 4-5, Design District, Dubai',
      phone: '+971 4 667 2211',
      email: 'hello@arcformstudio.com',
      type: 'Design',
      contacts: [
        {
          key: 'designPrimary',
          firstName: 'Meera',
          lastName: 'Rao',
          email: 'meera.rao@arcformstudio.com',
          phone: '+971 58 101 2223',
          position: 'Lead Architect',
        },
      ],
    },
    {
      key: 'supervision',
      name: 'Beacon Supervision Engineers',
      officeAddress: '8th Floor, Horizon Tower, Abu Dhabi',
      phone: '+971 2 345 6677',
      email: 'contact@beaconsupervision.com',
      type: 'Supervision',
      contacts: [
        {
          key: 'supervisionPrimary',
          firstName: 'Faisal',
          lastName: 'Rahman',
          email: 'faisal.rahman@beaconsupervision.com',
          phone: '+971 56 333 2210',
          position: 'Resident Engineer',
        },
      ],
    },
    {
      key: 'cost',
      name: 'Summit Cost Consulting',
      officeAddress: 'Office 606, The Grid, Dubai',
      phone: '+971 4 778 9900',
      email: 'support@summitcost.com',
      type: 'Cost',
      contacts: [
        {
          key: 'costPrimary',
          firstName: 'Hannah',
          lastName: 'Lee',
          email: 'hannah.lee@summitcost.com',
          phone: '+971 55 789 3201',
          position: 'Senior Quantity Surveyor',
        },
      ],
    },
  ];

  const consultants = {};
  const contacts = {};

  for (const def of definitions) {
    const data = {
      tenantId,
      name: def.name,
      officeAddress: def.officeAddress,
      phone: def.phone,
      email: def.email,
      isActive: true,
    };

    const existing = await prisma.consultant.findFirst({ where: { email: def.email } });
    const consultant = existing
      ? await prisma.consultant.update({ where: { id: existing.id }, data })
      : await prisma.consultant.create({ data });

    const typeRecord = consultantTypes[def.type];
    await prisma.consultantToConsultantType.upsert({
      where: {
        A_B: {
          A: consultant.id,
          B: typeRecord.id,
        },
      },
      update: {},
      create: {
        A: consultant.id,
        B: typeRecord.id,
      },
    });

    consultants[def.key] = consultant;

    for (const contactDef of def.contacts) {
      const contactData = {
        firstName: contactDef.firstName,
        lastName: contactDef.lastName,
        email: contactDef.email,
        phone: contactDef.phone,
        position: contactDef.position,
        entityType: 'consultant',
        entityId: consultant.id,
        isActive: true,
      };

      const existingContact = await prisma.contact.findFirst({ where: { email: contactDef.email } });
      const contact = existingContact
        ? await prisma.contact.update({ where: { id: existingContact.id }, data: contactData })
        : await prisma.contact.create({ data: contactData });

      contacts[contactDef.key] = contact;
    }
  }

  return { consultants, contacts, consultantTypes };
}

async function ensureStaff(tenantId) {
  const definitions = [
    {
      key: 'director',
      staffName: 'Lina Torres',
      email: 'lina.torres@pmpdemo.com',
      phone: '+971 55 441 2277',
      position: 'Project Director',
      employeeNumber: 'STF-1001',
      monthlyBaseRate: '18000',
    },
    {
      key: 'manager',
      staffName: 'Omar Haddad',
      email: 'omar.haddad@pmpdemo.com',
      phone: '+971 50 332 1199',
      position: 'Project Manager',
      employeeNumber: 'STF-1002',
      monthlyBaseRate: '15500',
    },
    {
      key: 'engineer',
      staffName: 'Sara Al Mansouri',
      email: 'sara.almansouri@pmpdemo.com',
      phone: '+971 52 220 4488',
      position: 'Site Engineer',
      employeeNumber: 'STF-1003',
      monthlyBaseRate: '11000',
    },
  ];

  const staff = {};

  for (const def of definitions) {
    const data = {
      tenantId,
      staffName: def.staffName,
      email: def.email,
      phone: def.phone,
      position: def.position,
      employeeNumber: def.employeeNumber,
      isActive: true,
      monthlyBaseRate: def.monthlyBaseRate ? new Prisma.Decimal(def.monthlyBaseRate) : null,
    };

    const existing = await prisma.companyStaff.findFirst({ where: { email: def.email } });
    const record = existing
      ? await prisma.companyStaff.update({ where: { id: existing.id }, data })
      : await prisma.companyStaff.create({ data });

    staff[def.key] = record;
  }

  return staff;
}

async function ensureLabours(tenantId) {
  const definitions = [
    {
      key: 'carpenterLead',
      labourName: 'Ravi Patel',
      employeeNumber: 'LAB-2001',
      phone: '+971 52 222 4477',
      trade: 'Carpentry',
      monthlyBaseRate: '6800',
    },
    {
      key: 'electricianLead',
      labourName: 'Emily Johnson',
      employeeNumber: 'LAB-2002',
      phone: '+971 58 118 9902',
      trade: 'Electrical',
      monthlyBaseRate: '7200',
    },
  ];

  const labours = {};

  for (const def of definitions) {
    const data = {
      tenantId,
      labourName: def.labourName,
      employeeNumber: def.employeeNumber,
      phone: def.phone,
      trade: def.trade,
      isActive: true,
      monthlyBaseRate: def.monthlyBaseRate ? new Prisma.Decimal(def.monthlyBaseRate) : null,
    };

    const existing = await prisma.labour.findFirst({ where: { employeeNumber: def.employeeNumber } });
    const record = existing
      ? await prisma.labour.update({ where: { id: existing.id }, data })
      : await prisma.labour.create({ data });

    labours[def.key] = record;
  }

  return labours;
}

async function createDemoProject({
  tenant,
  clients,
  contacts,
  consultants,
  staff,
  labours,
  trades,
  consultantContacts,
}) {
  const projectCode = 'DEMO-001';
  console.log(`→ Preparing project ${projectCode}...`);

  await prisma.project.deleteMany({ where: { projectCode } });

  const startDate = new Date('2024-02-01');
  const endDate = new Date('2025-12-15');

  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      projectCode,
      projectName: 'Coastal Heights Residential Tower',
      projectDescription: 'Demo project showcasing PMP Reports capabilities.',
      clientId: clients.clients.northwind.id,
      projectManagementConsultantId: consultants.consultants.pm.id,
      designConsultantId: consultants.consultants.design.id,
      supervisionConsultantId: consultants.consultants.supervision.id,
      costConsultantId: consultants.consultants.cost.id,
      projectDirectorId: staff.director.id,
      projectManagerId: staff.manager.id,
      startDate,
      endDate,
      projectValue: new Prisma.Decimal('12500000'),
      duration: '22 months',
    },
  });

  const positions = [
    {
      designation: 'Project Manager',
      requiredUtilization: 100,
      staffKey: 'manager',
    },
    {
      designation: 'Site Engineer',
      requiredUtilization: 100,
      staffKey: 'engineer',
    },
  ];

  for (const pos of positions) {
    const position = await prisma.projectPosition.create({
      data: {
        projectId: project.id,
        designation: pos.designation,
        requiredUtilization: pos.requiredUtilization,
        startDate,
        endDate,
      },
    });

    await prisma.projectStaff.create({
      data: {
        projectId: project.id,
        positionId: position.id,
        staffId: staff[pos.staffKey].id,
        utilization: pos.requiredUtilization,
        startDate,
        endDate,
        status: 'Active',
      },
    });
  }

  const clientPrimaryContact = contacts.contacts.northwindPrimary;
  if (clientPrimaryContact) {
    await prisma.projectContact.create({
      data: {
        projectId: project.id,
        contactId: clientPrimaryContact.id,
        isPrimary: true,
      },
    });
  }

  const pmContact = consultantContacts.pmPrimary;
  if (pmContact) {
    await prisma.projectContact.create({
      data: {
        projectId: project.id,
        contactId: pmContact.id,
        consultantType: 'Project Management',
        isPrimary: false,
      },
    });
  }

  const carpentryTrade = await prisma.projectTrade.create({
    data: {
      projectId: project.id,
      trade: trades.carpentry.name,
      requiredQuantity: 12,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-31'),
    },
  });

  await prisma.projectLabour.create({
    data: {
      projectId: project.id,
      tradeId: carpentryTrade.id,
      labourId: labours.carpenterLead.id,
      utilization: 100,
      startDate: new Date('2024-03-05'),
      endDate: new Date('2024-12-31'),
      status: 'Active',
    },
  });

  const electricalTrade = await prisma.projectTrade.create({
    data: {
      projectId: project.id,
      trade: trades.electrical.name,
      requiredQuantity: 8,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-06-30'),
    },
  });

  await prisma.projectLabour.create({
    data: {
      projectId: project.id,
      tradeId: electricalTrade.id,
      labourId: labours.electricianLead.id,
      utilization: 100,
      startDate: new Date('2024-04-10'),
      endDate: new Date('2025-06-30'),
      status: 'Active',
    },
  });

  console.log(`✅ Demo project ${project.projectCode} created with related assignments.`);
  return project;
}

async function main() {
  console.log('🌱 Creating demo dataset...');
  const tenant = await ensureTenant();
  const trades = await ensureTrades();
  const clients = await ensureClients(tenant.id);
  const consultants = await ensureConsultants(tenant.id);
  const staff = await ensureStaff(tenant.id);
  const labours = await ensureLabours(tenant.id);
  await createDemoProject({
    tenant,
    clients,
    contacts: clients,
    consultants,
    staff,
    labours,
    trades,
    consultantContacts: consultants.contacts,
  });
  console.log('🎉 Demo data generation complete!');
}

main()
  .catch((error) => {
    console.error('❌ Failed to create demo data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
