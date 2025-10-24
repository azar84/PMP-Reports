# Database Seeding Scripts

This directory contains scripts for seeding the database with default data.

## Available Scripts

### 1. Full Database Seeding
```bash
npm run db:seed
# or
npx prisma db seed
```
**What it seeds:**
- Admin user (username: admin, password: admin123)
- Site settings
- Design system
- Consultant types
- Positions

### 2. Positions and Consultant Types Only
```bash
npm run db:seed:positions
```
**What it seeds:**
- Consultant types (Project Management, Design, Cost, Supervision)
- 20 default positions with descriptions and monthly rates

## Consultant Types

The following consultant types are created by default:

1. **Project Management** - Project Management Consultant (PMC)
2. **Design** - Design Consultant  
3. **Cost** - Cost Consultant
4. **Supervision** - Supervision Consultant

## Default Positions

The following positions are created with descriptions and monthly rates:

### Leadership & Management
- **Project Director** - Overall project leadership and strategic direction ($15,000/month)
- **Project Manager** - Day-to-day project management and coordination ($12,000/month)
- **Design Manager** - Design coordination and management ($12,000/month)
- **Office Manager** - Office management and administrative oversight ($9,000/month)
- **Finance Manager** - Financial management and accounting ($10,000/month)
- **HR Manager** - Human resources management ($9,500/month)

### Architecture & Design
- **Senior Architect** - Lead architectural design and technical oversight ($14,000/month)
- **Architect** - Architectural design and planning ($11,000/month)
- **Senior Designer** - Senior design development and leadership ($10,500/month)
- **Designer** - Design development and documentation ($8,500/month)

### Engineering
- **Senior Engineer** - Senior engineering and technical leadership ($13,000/month)
- **Engineer** - Engineering design and implementation ($10,000/month)
- **Site Engineer** - On-site engineering and supervision ($9,500/month)

### Quantity Surveying
- **Senior Quantity Surveyor** - Senior cost management and quantity surveying ($11,000/month)
- **Quantity Surveyor** - Cost estimation and quantity calculations ($9,000/month)

### Technical Support
- **Senior CAD Technician** - Senior CAD work and technical support ($8,500/month)
- **CAD Technician** - Computer-aided design and drafting ($7,000/month)
- **IT Support** - Information technology support and maintenance ($7,500/month)

### Coordination & Administration
- **Project Coordinator** - Project coordination and administrative support ($8,000/month)
- **Administrative Assistant** - Administrative support and documentation ($6,000/month)

## Usage Notes

- Scripts are idempotent - they won't create duplicates if data already exists
- Monthly rates are in USD and can be modified after creation
- Position descriptions can be updated through the Positions Manager in the admin panel
- Consultant types can be managed through the admin panel

## Customization

To add more positions or modify existing ones:

1. Edit `prisma/seed.js` for the main seed file
2. Edit `scripts/seed-positions-and-consultants.js` for the standalone script
3. Run the appropriate seeding command

## Database Reset

To completely reset the database and re-seed:

```bash
npm run db:reset
npm run db:seed
```
