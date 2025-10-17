const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDesignSystem() {
  try {
    console.log('🔍 Checking Design System...');
    
    const designSystem = await prisma.designSystem.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (designSystem) {
      console.log('✅ Found Design System:');
      console.log('ID:', designSystem.id);
      console.log('Primary Color:', designSystem.primaryColor);
      console.log('Secondary Color:', designSystem.secondaryColor);
      console.log('Background Primary:', designSystem.backgroundPrimary);
      console.log('Background Secondary:', designSystem.backgroundSecondary);
      console.log('Background Dark:', designSystem.backgroundDark);
      console.log('Text Primary:', designSystem.textPrimary);
      console.log('Text Secondary:', designSystem.textSecondary);
      console.log('Text Muted:', designSystem.textMuted);
      console.log('Gray Light:', designSystem.grayLight);
      console.log('Is Active:', designSystem.isActive);
      console.log('Created At:', designSystem.createdAt);
      console.log('Updated At:', designSystem.updatedAt);
    } else {
      console.log('❌ No active design system found');
    }
  } catch (error) {
    console.error('❌ Error checking design system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDesignSystem(); 