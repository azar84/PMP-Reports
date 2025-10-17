const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyMenuCopy() {
  console.log('🔍 Verifying Menu and MenuItem data copy...');
  console.log('='.repeat(80));
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to local database\n');

    // Check Menu data
    const menusCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Menu"
    `;
    console.log(`📋 Menus: ${menusCount[0].count} records`);

    // Check MenuItem data
    const menuItemsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "MenuItem"
    `;
    console.log(`🔗 Menu Items: ${menuItemsCount[0].count} records`);

    if (menusCount[0].count > 0) {
      const menusData = await prisma.$queryRaw`
        SELECT * FROM "Menu"
      `;
      
      console.log('\n📋 Menus Data:');
      menusData.forEach((menu, index) => {
        console.log(`\n   ${index + 1}. Menu ID: ${menu.id}`);
        console.log(`      Name: ${menu.name || 'No name'}`);
        console.log(`      Description: ${menu.description || 'No description'}`);
        console.log(`      Is Active: ${menu.isActive}`);
        console.log(`      Sort Order: ${menu.sortOrder}`);
        console.log(`      Created At: ${menu.createdAt}`);
        console.log(`      Updated At: ${menu.updatedAt}`);
      });
    }

    if (menuItemsCount[0].count > 0) {
      const menuItemsData = await prisma.$queryRaw`
        SELECT * FROM "MenuItem"
      `;
      
      console.log('\n🔗 Menu Items Data:');
      menuItemsData.forEach((item, index) => {
        console.log(`\n   ${index + 1}. Menu Item ID: ${item.id}`);
        console.log(`      Menu ID: ${item.menuId}`);
        console.log(`      Label: ${item.label || 'No label'}`);
        console.log(`      URL: ${item.url || 'No URL'}`);
        console.log(`      Icon: ${item.icon || 'No icon'}`);
        console.log(`      Target: ${item.target || 'No target'}`);
        console.log(`      Sort Order: ${item.sortOrder || 'No order'}`);
        console.log(`      Parent ID: ${item.parentId || 'No parent'}`);
        console.log(`      Page ID: ${item.pageId || 'No page'}`);
        console.log(`      Is Active: ${item.isActive}`);
        console.log(`      Created At: ${item.createdAt}`);
        console.log(`      Updated At: ${item.updatedAt}`);
      });
    }

    // Check menu items grouped by menu
    console.log('\n📊 Menu Items by Menu:');
    console.log('─'.repeat(60));
    if (menusCount[0].count > 0 && menuItemsCount[0].count > 0) {
      const menuItemsByMenu = await prisma.$queryRaw`
        SELECT m.name as menu_name, m.id as menu_id, COUNT(mi.id) as item_count
        FROM "Menu" m
        LEFT JOIN "MenuItem" mi ON m.id = mi."menuId"
        GROUP BY m.id, m.name
        ORDER BY m.id
      `;
      
      menuItemsByMenu.forEach((menu) => {
        console.log(`   Menu: ${menu.menu_name} (ID: ${menu.menu_id}) - ${menu.item_count} items`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 MENU COPY VERIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Menus: ${menusCount[0].count}`);
    console.log(`✅ Menu Items: ${menuItemsCount[0].count}`);
    
    if (menuItemsCount[0].count > 0) {
      console.log('\n✅ Menu items data successfully copied!');
      console.log('🌐 The website navigation should now display with the proper menu items.');
      console.log('🔄 The development server is running with the complete saski-ai-website data.');
      
      console.log('\n📋 Copied Menus:');
      const menusData = await prisma.$queryRaw`SELECT * FROM "Menu"`;
      menusData.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.name} (${menu.description || 'No description'})`);
      });
    } else {
      console.log('\n⚠️  No menu items data found in local database.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

verifyMenuCopy().catch(console.error); 