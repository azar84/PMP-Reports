const fetch = require('node-fetch');

async function testHeroColorsAPI() {
  try {
    console.log('Testing Home Hero API...');
    console.log('========================');
    
    // Test GET request to fetch current hero data
    const getResponse = await fetch('http://localhost:3000/api/admin/home-hero');
    const getData = await getResponse.json();
    
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data:', JSON.stringify(getData, null, 2));
    
    if (getData.success && getData.data) {
      const heroData = getData.data;
      console.log('\nColor Fields Check:');
      console.log('==================');
      console.log('headingColor:', heroData.headingColor);
      console.log('subheadingColor:', heroData.subheadingColor);
      console.log('trustIndicatorTextColor:', heroData.trustIndicatorTextColor);
      console.log('trustIndicatorBackgroundColor:', heroData.trustIndicatorBackgroundColor);
      
      // Check if color fields are present
      const hasColorFields = heroData.headingColor && 
                           heroData.subheadingColor && 
                           heroData.trustIndicatorTextColor && 
                           heroData.trustIndicatorBackgroundColor;
      
      console.log('\nColor Fields Present:', hasColorFields ? '✅ YES' : '❌ NO');
      
      if (hasColorFields) {
        console.log('✅ Color configuration is being saved and retrieved correctly!');
      } else {
        console.log('❌ Some color fields are missing from the API response');
      }
    } else {
      console.log('❌ Failed to fetch hero data from API');
    }
    
  } catch (error) {
    console.error('Error testing hero colors API:', error);
  }
}

testHeroColorsAPI(); 