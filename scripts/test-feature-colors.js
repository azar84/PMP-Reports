const puppeteer = require('puppeteer');

async function testFeatureColors() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the features page
    await page.goto('http://localhost:3000/features', { waitUntil: 'networkidle0' });

    // Wait for the features section to load
    await page.waitForSelector('h1, h2', { timeout: 10000 });

    // Get the computed styles for the feature elements
    const featureStyles = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2');
      const subheading = document.querySelector('p');
      const featureCards = document.querySelectorAll('.feature-card, .rounded-xl');
      const featureTitles = document.querySelectorAll('h3');
      const featureDescriptions = document.querySelectorAll('p');

      return {
        heading: {
          color: heading ? window.getComputedStyle(heading).color : null,
          text: heading ? heading.textContent : null
        },
        subheading: {
          color: subheading ? window.getComputedStyle(subheading).color : null,
          text: subheading ? subheading.textContent : null
        },
        featureCards: Array.from(featureCards).slice(0, 3).map(card => ({
          backgroundColor: window.getComputedStyle(card).backgroundColor,
          borderColor: window.getComputedStyle(card).borderColor
        })),
        featureTitles: Array.from(featureTitles).slice(0, 3).map(title => ({
          color: window.getComputedStyle(title).color,
          text: title.textContent
        })),
        featureDescriptions: Array.from(featureDescriptions).slice(0, 3).map(desc => ({
          color: window.getComputedStyle(desc).color,
          text: desc.textContent
        }))
      };
    });

    console.log('Feature Styles:', JSON.stringify(featureStyles, null, 2));

    // Check if custom colors are being applied
    const expectedColors = {
      headingColor: '#F59E0B', // From our test data
      subheadingColor: '#10B981', // From our test data
      cardBackgroundColor: '#FFFFFF', // From our test data
      titleColor: '#1F2937', // From our test data
      subtitleColor: '#6B7280' // From our test data
    };

    console.log('\nExpected Colors:', expectedColors);
    console.log('\nColor Application Check:');
    console.log('========================');

    // Check heading color
    if (featureStyles.heading.color) {
      const headingRgb = featureStyles.heading.color;
      console.log('Heading Color:', headingRgb);
      // Convert RGB to hex for comparison (simplified)
      console.log('Heading Text:', featureStyles.heading.text);
    }

    // Check subheading color
    if (featureStyles.subheading.color) {
      const subheadingRgb = featureStyles.subheading.color;
      console.log('Subheading Color:', subheadingRgb);
      console.log('Subheading Text:', featureStyles.subheading.text);
    }

    // Check feature cards
    featureStyles.featureCards.forEach((card, index) => {
      console.log(`Feature Card ${index + 1}:`, {
        backgroundColor: card.backgroundColor,
        borderColor: card.borderColor
      });
    });

    // Check feature titles
    featureStyles.featureTitles.forEach((title, index) => {
      console.log(`Feature Title ${index + 1}:`, {
        color: title.color,
        text: title.text
      });
    });

    // Check feature descriptions
    featureStyles.featureDescriptions.forEach((desc, index) => {
      console.log(`Feature Description ${index + 1}:`, {
        color: desc.color,
        text: desc.text
      });
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFeatureColors(); 