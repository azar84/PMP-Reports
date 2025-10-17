const fetch = require('node-fetch');

async function testFeatureColorsAPI() {
  try {
    console.log('Testing Feature Groups Color API...');
    console.log('==================================');

    // Test GET request to fetch current feature group data
    const getResponse = await fetch('http://localhost:3000/api/admin/feature-groups');
    const getData = await getResponse.json();

    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data:', JSON.stringify(getData, null, 2));

    if (getData.success && getData.data && getData.data.length > 0) {
      const featureGroup = getData.data[0];
      console.log('\nColor Fields Check:');
      console.log('==================');
      console.log('headingColor:', featureGroup.headingColor);
      console.log('subheadingColor:', featureGroup.subheadingColor);
      console.log('cardBackgroundColor:', featureGroup.cardBackgroundColor);
      console.log('titleColor:', featureGroup.titleColor);
      console.log('subtitleColor:', featureGroup.subtitleColor);

      // Test the features page to see if colors are applied
      console.log('\nTesting Features Page...');
      console.log('=======================');
      
      const pageResponse = await fetch('http://localhost:3000/features');
      console.log('Features Page Status:', pageResponse.status);
      
      if (pageResponse.ok) {
        console.log('✅ Features page is accessible');
        console.log('📝 Check the browser at http://localhost:3000/features');
        console.log('🎨 Look for the following colors:');
        console.log('   - Heading color:', featureGroup.headingColor);
        console.log('   - Subheading color:', featureGroup.subheadingColor);
        console.log('   - Card background color:', featureGroup.cardBackgroundColor);
        console.log('   - Title color:', featureGroup.titleColor);
        console.log('   - Subtitle color:', featureGroup.subtitleColor);
      } else {
        console.log('❌ Features page is not accessible');
      }

    } else {
      console.error('Failed to fetch feature group data or data is empty.');
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testFeatureColorsAPI(); 