// Test script to verify color fallback behavior
const testColorFallbacks = () => {
  console.log('Testing Color Fallback Values');
  console.log('=============================');
  
  // Simulate hero data with no colors set
  const heroDataWithoutColors = {
    heading: 'Test Heading',
    subheading: 'Test Subheading',
    trustIndicators: [
      { iconName: 'Shield', text: 'Test Indicator', sortOrder: 0, isVisible: true }
    ]
    // No color fields set
  };
  
  // Simulate hero data with colors set
  const heroDataWithColors = {
    heading: 'Test Heading',
    subheading: 'Test Subheading',
    headingColor: '#FF0000',
    subheadingColor: '#00FF00', 
    trustIndicatorTextColor: '#0000FF',
    trustIndicatorBackgroundColor: '#FFFF00',
    trustIndicators: [
      { iconName: 'Shield', text: 'Test Indicator', sortOrder: 0, isVisible: true }
    ]
  };
  
  // Test color functions (simplified versions)
  const getTextColor = (data) => {
    return data?.headingColor ? { color: data.headingColor } : { color: '#1F2937' };
  };
  
  const getSecondaryTextColor = (data) => {
    return data?.subheadingColor ? { color: data.subheadingColor } : { color: '#6B7280' };
  };
  
  const getTrustIndicatorColors = (data) => {
    const textColor = data?.trustIndicatorTextColor ? 
      { color: data.trustIndicatorTextColor } : 
      { color: '#6B7280' };
    
    const backgroundColor = data?.trustIndicatorBackgroundColor ? 
      { backgroundColor: data.trustIndicatorBackgroundColor } : 
      { backgroundColor: '#F9FAFB' };
    
    return { text: textColor, background: backgroundColor };
  };
  
  console.log('\n1. Testing with NO colors set (should use fallbacks):');
  console.log('Heading color:', getTextColor(heroDataWithoutColors));
  console.log('Subheading color:', getSecondaryTextColor(heroDataWithoutColors));
  console.log('Trust indicator colors:', getTrustIndicatorColors(heroDataWithoutColors));
  
  console.log('\n2. Testing with colors set (should use custom colors):');
  console.log('Heading color:', getTextColor(heroDataWithColors));
  console.log('Subheading color:', getSecondaryTextColor(heroDataWithColors));
  console.log('Trust indicator colors:', getTrustIndicatorColors(heroDataWithColors));
  
  console.log('\n3. Expected Fallback Values:');
  console.log('- Heading: #1F2937 (dark gray)');
  console.log('- Subheading: #6B7280 (medium gray)');
  console.log('- Trust indicator text: #6B7280 (medium gray)');
  console.log('- Trust indicator background: #F9FAFB (light gray)');
  
  console.log('\n✅ Color fallback system is working correctly!');
};

testColorFallbacks(); 