const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.saski' });

// Source database (saski-ai-website)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.saski_DATABASE_URL
    }
  }
});

// Target database (local)
const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function copyMenuItems() {
  console.log('📋 Copying Menu and MenuItem data from saski-ai-website to local database...');
  console.log('='.repeat(80));
  
  try {
    await sourcePrisma.$connect();
    console.log('✅ Source database connected');
    await targetPrisma.$connect();
    console.log('✅ Target database connected');
    console.log('');

    // Copy Menu data
    console.log('📋 Copying Menu data...');
    try {
      const menusCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Menu"
      `;
      console.log(`   📊 Found ${menusCount[0].count} menus in source`);

      if (menusCount[0].count > 0) {
        // Get menu data with raw SQL
        const sourceMenus = await sourcePrisma.$queryRaw`
          SELECT * FROM "Menu"
        `;
        
        console.log(`   📥 Retrieved ${sourceMenus.length} menus from source`);

        // Clear existing menus in target
        await targetPrisma.$queryRaw`
          DELETE FROM "Menu"
        `;
        console.log(`   🗑️  Cleared existing menus from target`);

        // Insert menus into target
        let menuSuccessCount = 0;
        for (const menu of sourceMenus) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO "Menu" (
                id, name, location, "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${menu.id}, ${menu.name}, ${menu.location}, ${menu.isActive},
                ${menu.createdAt}, ${menu.updatedAt}
              )
            `;
            menuSuccessCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting menu ${menu.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${menuSuccessCount} menus`);
      } else {
        console.log(`   ⚠️  No menus found in source`);
      }
    } catch (error) {
      console.log(`   ❌ Error copying Menus: ${error.message}`);
    }

    // Copy MenuItem data
    console.log('\n🔗 Copying MenuItem data...');
    try {
      const menuItemsCount = await sourcePrisma.$queryRaw`
        SELECT COUNT(*) as count FROM "MenuItem"
      `;
      console.log(`   📊 Found ${menuItemsCount[0].count} menu items in source`);

      if (menuItemsCount[0].count > 0) {
        // Get menu items data with raw SQL
        const sourceMenuItems = await sourcePrisma.$queryRaw`
          SELECT * FROM "MenuItem"
        `;
        
        console.log(`   📥 Retrieved ${sourceMenuItems.length} menu items from source`);

        // Clear existing menu items in target
        await targetPrisma.$queryRaw`
          DELETE FROM "MenuItem"
        `;
        console.log(`   🗑️  Cleared existing menu items from target`);

        // Insert menu items into target
        let menuItemSuccessCount = 0;
        for (const item of sourceMenuItems) {
          try {
            await targetPrisma.$queryRaw`
              INSERT INTO "MenuItem" (
                id, "menuId", text, url, "order", "parentId", "isActive", "createdAt", "updatedAt"
              ) VALUES (
                ${item.id}, ${item.menuId}, ${item.text}, ${item.url}, ${item.order},
                ${item.parentId}, ${item.isActive}, ${item.createdAt}, ${item.updatedAt}
              )
            `;
            menuItemSuccessCount++;
          } catch (error) {
            console.log(`   ❌ Error inserting menu item ${item.id}: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully copied ${menuItemSuccessCount} menu items`);
        return { menus: menuSuccessCount, menuItems: menuItemSuccessCount };
      } else {
        console.log(`   ⚠️  No menu items found in source`);
        return { menus: menuSuccessCount, menuItems: 0 };
      }
    } catch (error) {
      console.log(`   ❌ Error copying MenuItems: ${error.message}`);
      return { menus: menuSuccessCount, menuItems: 0 };
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
    return { menus: 0, menuItems: 0 };
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the copy
copyMenuItems().then((counts) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MENU COPY SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total menus copied: ${counts.menus}`);
  console.log(`Total menu items copied: ${counts.menuItems}`);
  console.log('✅ Menu data copy completed!');

  if (counts.menuItems > 0) {
    console.log('\n🎯 Menu items data has been successfully copied!');
    console.log('🌐 The website navigation should now display with the proper menu items.');
    console.log('🔄 You may need to restart the development server to see the changes.');
  }
}).catch(console.error); 