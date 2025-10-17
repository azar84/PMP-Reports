const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testHomeHeroRendering() {
  try {
    console.log('🎨 Testing Home Hero Color Rendering...');
    
    // Test the API to see if colors are being returned
    console.log('\n📡 Testing API response...');
    const { stdout: apiResponse } = await execAsync('curl -s http://localhost:3000/api/admin/home-hero');
    const apiData = JSON.parse(apiResponse);
    
    if (apiData.success) {
      console.log('✅ API is returning color fields:');
      console.log(`   Heading Color: ${apiData.data.headingColor}`);
      console.log(`   Subheading Color: ${apiData.data.subheadingColor}`);
      console.log(`   Trust Indicator Text Color: ${apiData.data.trustIndicatorTextColor}`);
      console.log(`   Trust Indicator Background Color: ${apiData.data.trustIndicatorBackgroundColor}`);
    } else {
      console.log('❌ API failed to return data');
      return;
    }
    
    // Test the homepage to see if colors are being applied
    console.log('\n🌐 Testing homepage rendering...');
    const { stdout: pageHtml } = await execAsync('curl -s http://localhost:3000/home');
    
    // Check if the page contains the custom colors
    const hasCustomColors = pageHtml.includes('text-[#') || pageHtml.includes('bg-[#');
    
    if (hasCustomColors) {
      console.log('✅ Custom colors found in rendered page');
      
      // Extract color values from the HTML
      const colorMatches = pageHtml.match(/text-\[([^\]]+)\]/g) || [];
      const bgMatches = pageHtml.match(/bg-\[([^\]]+)\]/g) || [];
      
      console.log('🎨 Colors found in page:');
      [...colorMatches, ...bgMatches].forEach(match => {
        console.log(`   ${match}`);
      });
    } else {
      console.log('⚠️  No custom colors found in rendered page');
      console.log('   This might indicate the colors are not being applied correctly');
    }
    
    // Test the ServerDynamicPageRenderer data
    console.log('\n🔍 Testing ServerDynamicPageRenderer data...');
    
    // Check if the page contains the hero section
    if (pageHtml.includes('Automate Conversations') || pageHtml.includes('hero')) {
      console.log('✅ Hero section found in rendered page');
    } else {
      console.log('❌ Hero section not found in rendered page');
    }
    
    console.log('\n🎉 Color rendering test completed!');
    
  } catch (error) {
    console.error('❌ Error testing home hero rendering:', error);
  }
}

testHomeHeroRendering(); 