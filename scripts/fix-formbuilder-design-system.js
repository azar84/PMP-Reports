const fs = require('fs');
const path = require('path');

const formBuilderPath = path.join(__dirname, '../src/app/admin-panel/components/FormBuilder.tsx');
let content = fs.readFileSync(formBuilderPath, 'utf8');

// Design System Color Mappings
const designSystemColors = {
  // Text Colors
  'text-gray-900': 'var(--color-text-primary)',      // Primary Text
  'text-gray-700': 'var(--color-text-primary)',      // Primary Text (labels)
  'text-gray-600': 'var(--color-text-secondary)',    // Secondary Text
  'text-gray-500': 'var(--color-text-muted)',        // Muted Text
  'text-gray-400': 'var(--color-text-muted)',        // Muted Text
  
  // Background Colors
  'bg-white': 'var(--color-bg-primary)',             // Primary Background
  'bg-gray-50': 'var(--color-bg-secondary)',         // Secondary Background
  'bg-gray-100': 'var(--color-bg-secondary)',        // Secondary Background
  'bg-gray-300': 'var(--color-gray-light)',          // Gray Light
  'bg-red-100': 'var(--color-error-light)',          // Error Light
  'bg-blue-50': 'var(--color-info-light)',           // Info Light
  'bg-blue-100': 'var(--color-info-light)',          // Info Light
  
  // Border Colors
  'border-gray-200': 'var(--color-gray-light)',      // Gray Light
  'border-gray-300': 'var(--color-gray-light)',      // Gray Light
  
  // Text Colors for specific elements
  'text-red-600': 'var(--color-error)',              // Error
  'text-blue-600': 'var(--color-primary)',           // Primary
  'text-blue-700': 'var(--color-primary)',           // Primary
  'text-blue-900': 'var(--color-primary)',           // Primary
  'text-green-600': 'var(--color-success)',          // Success
  
  // Focus Colors
  'focus:ring-blue-500': 'focus:ring-[var(--color-primary)]',
  'focus:border-blue-500': 'focus:border-[var(--color-primary)]',
  'focus:ring-green-500': 'focus:ring-[var(--color-success)]',
  'focus:border-green-500': 'focus:border-[var(--color-success)]',
  
  // Hover Colors
  'hover:bg-gray-100': 'hover:bg-[var(--color-bg-secondary)]',
  'hover:border-gray-300': 'hover:border-[var(--color-gray-light)]',
  'hover:bg-blue-100': 'hover:bg-[var(--color-info-light)]',
  
  // Checkbox and Radio Colors
  'checked:bg-blue-600': 'checked:bg-[var(--color-primary)]',
  'checked:border-blue-600': 'checked:border-[var(--color-primary)]',
  'checked:bg-green-600': 'checked:bg-[var(--color-success)]',
  'checked:border-green-600': 'checked:border-[var(--color-success)]',
};

// Apply replacements
Object.entries(designSystemColors).forEach(([from, to]) => {
  const regex = new RegExp(`\\b${from}\\b`, 'g');
  content = content.replace(regex, to);
});

// Fix specific patterns that need special handling
content = content.replace(/className="([^"]*?)text-gray-([^"]*?)"/g, (match, before, after) => {
  const colorMap = {
    '900': 'var(--color-text-primary)',
    '700': 'var(--color-text-primary)', 
    '600': 'var(--color-text-secondary)',
    '500': 'var(--color-text-muted)',
    '400': 'var(--color-text-muted)'
  };
  const color = colorMap[after] || 'var(--color-text-muted)';
  return `className="${before}" style={{ color: '${color}' }}`;
});

content = content.replace(/className="([^"]*?)bg-gray-([^"]*?)"/g, (match, before, after) => {
  const bgMap = {
    '50': 'var(--color-bg-secondary)',
    '100': 'var(--color-bg-secondary)',
    '300': 'var(--color-gray-light)'
  };
  const bg = bgMap[after] || 'var(--color-bg-secondary)';
  return `className="${before}" style={{ backgroundColor: '${bg}' }}`;
});

content = content.replace(/className="([^"]*?)border-gray-([^"]*?)"/g, (match, before, after) => {
  const borderMap = {
    '200': 'var(--color-gray-light)',
    '300': 'var(--color-gray-light)'
  };
  const border = borderMap[after] || 'var(--color-gray-light)';
  return `className="${before}" style={{ borderColor: '${border}' }}`;
});

// Write the updated content back
fs.writeFileSync(formBuilderPath, content, 'utf8');

console.log('✅ FormBuilder updated to follow design system properly!');
console.log('Applied design system colors:');
console.log('- Primary Text: var(--color-text-primary)');
console.log('- Secondary Text: var(--color-text-secondary)');
console.log('- Muted Text: var(--color-text-muted)');
console.log('- Primary Background: var(--color-bg-primary)');
console.log('- Secondary Background: var(--color-bg-secondary)');
console.log('- Gray Light: var(--color-gray-light)');
console.log('- Error: var(--color-error)');
console.log('- Success: var(--color-success)');
console.log('- Primary: var(--color-primary)'); 