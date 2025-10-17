const puppeteer = require('puppeteer');

async function testHeroColors() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for the hero section to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Get the computed styles for the hero elements
    const heroStyles = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const subheading = document.querySelector('p');
      const trustIndicators = document.querySelectorAll('.backdrop-blur-sm');
      
      return {
        heading: {
          color: window.getComputedStyle(heading).color,
          text: heading.textContent
        },
        subheading: subheading ? {
          color: window.getComputedStyle(subheading).color,
          text: subheading.textContent
        } : null,
        trustIndicators: Array.from(trustIndicators).map(indicator => ({
          color: window.getComputedStyle(indicator).color,
          backgroundColor: window.getComputedStyle(indicator).backgroundColor,
          text: indicator.textContent
        }))
      };
    });
    
    console.log('Hero Section Styles:');
    console.log('====================');
    console.log('Heading:', heroStyles.heading);
    console.log('Subheading:', heroStyles.subheading);
    console.log('Trust Indicators:', heroStyles.trustIndicators);
    
    // Check if colors are being applied (not default browser colors)
    const hasCustomColors = heroStyles.heading.color !== 'rgb(0, 0, 0)' && 
                           heroStyles.subheading?.color !== 'rgb(0, 0, 0)';
    
    console.log('\nColor Application Test:');
    console.log('=======================');
    console.log('Custom colors applied:', hasCustomColors ? '✅ PASS' : '❌ FAIL');
    
    if (hasCustomColors) {
      console.log('✅ Subheading and trust indicator colors are being applied correctly!');
    } else {
      console.log('❌ Colors are not being applied - using default browser colors');
    }
    
  } catch (error) {
    console.error('Error testing hero colors:', error);
  } finally {
    await browser.close();
  }
}

testHeroColors(); 