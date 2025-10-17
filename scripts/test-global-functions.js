const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testGlobalFunctions() {
  try {
    console.log('🧪 Testing global functions...');
    
    // Test the API endpoint using curl
    const { stdout } = await execAsync('curl -s http://localhost:3000/api/admin/global-functions');
    const data = JSON.parse(stdout);
    
    if (data.success && data.functions) {
      console.log('✅ Global functions API is working');
      console.log('📝 Functions found:');
      
      const functions = data.functions;
      const functionNames = functions.match(/function\s+(\w+)\s*\(/g);
      
      if (functionNames) {
        functionNames.forEach((func, index) => {
          const name = func.replace('function ', '').replace('(', '');
          console.log(`  ${index + 1}. ${name}`);
        });
      }
      
      // Check for specific functions
      if (functions.includes('getFullQueryString')) {
        console.log('✅ getFullQueryString function found');
      } else {
        console.log('❌ getFullQueryString function not found');
      }
      
      if (functions.includes('goToLogin')) {
        console.log('✅ goToLogin function found');
      } else {
        console.log('❌ goToLogin function not found');
      }
      
      // Check if the function uses window.location.search
      if (functions.includes('window.location.search')) {
        console.log('✅ getFullQueryString uses window.location.search');
      } else {
        console.log('❌ getFullQueryString does not use window.location.search');
      }
      
    } else {
      console.log('❌ Global functions API failed');
    }
    
  } catch (error) {
    console.error('Error testing global functions:', error);
  }
}

testGlobalFunctions(); 