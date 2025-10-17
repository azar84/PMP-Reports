const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testHeroColorsUpdate() {
  try {
    console.log('🎨 Testing Hero Colors Update...');
    
    // First, get current colors
    console.log('\n📡 Getting current colors...');
    const { stdout: currentResponse } = await execAsync('curl -s http://localhost:3000/api/admin/home-hero');
    const currentData = JSON.parse(currentResponse);
    
    console.log('Current colors:');
    console.log(`  Heading: ${currentData.data.headingColor}`);
    console.log(`  Subheading: ${currentData.data.subheadingColor}`);
    console.log(`  Trust Text: ${currentData.data.trustIndicatorTextColor}`);
    console.log(`  Trust Background: ${currentData.data.trustIndicatorBackgroundColor}`);
    
    // Update colors with new values
    console.log('\n🔄 Updating colors...');
    const updatePayload = {
      id: currentData.data.id,
      headingColor: '#FF0000',
      subheadingColor: '#00FF00',
      trustIndicatorTextColor: '#0000FF',
      trustIndicatorBackgroundColor: '#FFFF00'
    };
    
    const { stdout: updateResponse } = await execAsync(`curl -s -X PUT http://localhost:3000/api/admin/home-hero -H "Content-Type: application/json" -d '${JSON.stringify(updatePayload)}'`);
    
    let updateData;
    try {
      updateData = JSON.parse(updateResponse);
    } catch (e) {
      console.log('Raw response:', updateResponse);
      throw e;
    }
    
    if (updateData.success) {
      console.log('✅ Colors updated successfully!');
      console.log('Updated colors:');
      console.log(`  Heading: ${updateData.data.headingColor}`);
      console.log(`  Subheading: ${updateData.data.subheadingColor}`);
      console.log(`  Trust Text: ${updateData.data.trustIndicatorTextColor}`);
      console.log(`  Trust Background: ${updateData.data.trustIndicatorBackgroundColor}`);
    } else {
      console.log('❌ Failed to update colors:', updateData.message);
    }
    
    // Verify the update by fetching again
    console.log('\n🔍 Verifying update...');
    const { stdout: verifyResponse } = await execAsync('curl -s http://localhost:3000/api/admin/home-hero');
    const verifyData = JSON.parse(verifyResponse);
    
    console.log('Verified colors:');
    console.log(`  Heading: ${verifyData.data.headingColor}`);
    console.log(`  Subheading: ${verifyData.data.subheadingColor}`);
    console.log(`  Trust Text: ${verifyData.data.trustIndicatorTextColor}`);
    console.log(`  Trust Background: ${verifyData.data.trustIndicatorBackgroundColor}`);
    
    // Check if colors are applied in rendered page
    console.log('\n🌐 Checking rendered page...');
    const { stdout: pageHtml } = await execAsync('curl -s http://localhost:3000/home');
    
    const hasNewColors = pageHtml.includes('text-[#FF0000]') || 
                        pageHtml.includes('text-[#00FF00]') || 
                        pageHtml.includes('text-[#0000FF]') || 
                        pageHtml.includes('bg-[#FFFF00]');
    
    if (hasNewColors) {
      console.log('✅ New colors found in rendered page!');
      
      // Extract the new colors from the page
      const colorMatches = pageHtml.match(/text-\[#[^]]*\]/g) || [];
      const bgMatches = pageHtml.match(/bg-\[#[^]]*\]/g) || [];
      
      console.log('Colors found in page:');
      [...colorMatches, ...bgMatches].forEach(match => {
        if (match.includes('#FF0000') || match.includes('#00FF00') || 
            match.includes('#0000FF') || match.includes('#FFFF00')) {
          console.log(`  ${match}`);
        }
      });
    } else {
      console.log('⚠️  New colors not found in rendered page');
    }
    
    console.log('\n🎉 Color update test completed!');
    
  } catch (error) {
    console.error('❌ Error testing hero colors update:', error);
  }
}

testHeroColorsUpdate(); 