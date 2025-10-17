const fs = require('fs');
const path = require('path');

const formBuilderPath = path.join(__dirname, '../src/app/admin-panel/components/FormBuilder.tsx');
let content = fs.readFileSync(formBuilderPath, 'utf8');

// Fix malformed className strings first
content = content.replace(/className=\{`([^`]*)style=\{\{([^}]+)\}\}([^`]*)`\}/g, (match, before, styleContent, after) => {
  return `className="${before.trim()} ${after.trim()}" style={{ ${styleContent} }}`;
});

// Fix malformed style attributes in className
content = content.replace(/className="([^"]*)style=\{\{([^}]+)\}\}([^"]*)"/g, (match, before, styleContent, after) => {
  return `className="${before.trim()} ${after.trim()}" style={{ ${styleContent} }}`;
});

// Fix remaining hardcoded colors
const replacements = [
  // Fix remaining border-gray-100
  { from: 'border-gray-100', to: 'style={{ borderColor: \'var(--color-gray-light, #E5E7EB)\' }}' },
  
  // Fix remaining bg-blue-100, text-blue-800, etc.
  { from: 'bg-blue-100', to: 'style={{ backgroundColor: \'var(--color-info-light, #DBEAFE)\' }}' },
  { from: 'text-blue-800', to: 'style={{ color: \'var(--color-info-dark, #1E40AF)\' }}' },
  { from: 'bg-green-100', to: 'style={{ backgroundColor: \'var(--color-success-light, #D1FAE5)\' }}' },
  { from: 'text-green-800', to: 'style={{ color: \'var(--color-success-dark, #065F46)\' }}' },
  
  // Fix remaining border-blue-300
  { from: 'border-blue-300', to: 'style={{ borderColor: \'var(--color-info-light, #DBEAFE)\' }}' },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  const regex = new RegExp(`\\b${from}\\b`, 'g');
  content = content.replace(regex, to);
});

// Write the updated content back
fs.writeFileSync(formBuilderPath, content, 'utf8');

console.log('✅ FormBuilder colors updated with design system variables (v2)!'); 