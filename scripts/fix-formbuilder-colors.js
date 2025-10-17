const fs = require('fs');
const path = require('path');

const formBuilderPath = path.join(__dirname, '../src/app/admin-panel/components/FormBuilder.tsx');
let content = fs.readFileSync(formBuilderPath, 'utf8');

// Replace hardcoded colors with design system variables
const replacements = [
  // Text colors
  { from: 'text-gray-700', to: 'style={{ color: \'var(--color-text-primary, #1F2937)\' }}' },
  { from: 'text-gray-900', to: 'style={{ color: \'var(--color-text-primary, #1F2937)\' }}' },
  { from: 'text-gray-500', to: 'style={{ color: \'var(--color-text-muted, #9CA3AF)\' }}' },
  { from: 'text-gray-600', to: 'style={{ color: \'var(--color-text-secondary, #6B7280)\' }}' },
  
  // Background colors
  { from: 'bg-white', to: 'style={{ backgroundColor: \'var(--color-bg-primary, #FFFFFF)\' }}' },
  { from: 'bg-gray-50', to: 'style={{ backgroundColor: \'var(--color-bg-secondary, #F9FAFB)\' }}' },
  { from: 'bg-gray-100', to: 'style={{ backgroundColor: \'var(--color-bg-secondary, #F9FAFB)\' }}' },
  { from: 'bg-blue-50', to: 'style={{ backgroundColor: \'var(--color-info-light, #DBEAFE)\' }}' },
  { from: 'bg-green-50', to: 'style={{ backgroundColor: \'var(--color-success-light, #D1FAE5)\' }}' },
  
  // Border colors
  { from: 'border-gray-200', to: 'style={{ borderColor: \'var(--color-gray-light, #E5E7EB)\' }}' },
  { from: 'border-gray-300', to: 'style={{ borderColor: \'var(--color-gray-light, #E5E7EB)\' }}' },
  { from: 'border-blue-200', to: 'style={{ borderColor: \'var(--color-info-light, #DBEAFE)\' }}' },
  { from: 'border-green-200', to: 'style={{ borderColor: \'var(--color-success-light, #D1FAE5)\' }}' },
  
  // Focus colors
  { from: 'focus:ring-blue-500', to: 'focus:ring-[var(--color-primary,#5243E9)]' },
  { from: 'focus:border-blue-500', to: 'focus:border-[var(--color-primary,#5243E9)]' },
  { from: 'focus:ring-green-500', to: 'focus:ring-[var(--color-success,#10B981)]' },
  { from: 'focus:border-green-500', to: 'focus:border-[var(--color-success,#10B981)]' },
  
  // Hover colors
  { from: 'hover:bg-gray-100', to: 'hover:bg-[var(--color-bg-secondary,#F9FAFB)]' },
  { from: 'hover:border-gray-300', to: 'hover:border-[var(--color-gray-light,#E5E7EB)]' },
  { from: 'hover:bg-blue-100', to: 'hover:bg-[var(--color-info-light,#DBEAFE)]' },
  
  // Text colors for specific elements
  { from: 'text-blue-600', to: 'style={{ color: \'var(--color-primary, #5243E9)\' }}' },
  { from: 'text-blue-700', to: 'style={{ color: \'var(--color-primary, #5243E9)\' }}' },
  { from: 'text-blue-900', to: 'style={{ color: \'var(--color-primary, #5243E9)\' }}' },
  { from: 'text-green-600', to: 'style={{ color: \'var(--color-success, #10B981)\' }}' },
  { from: 'text-red-600', to: 'style={{ color: \'var(--color-error, #EF4444)\' }}' },
  
  // Checkbox and radio colors
  { from: 'checked:bg-blue-600', to: 'checked:bg-[var(--color-primary,#5243E9)]' },
  { from: 'checked:border-blue-600', to: 'checked:border-[var(--color-primary,#5243E9)]' },
  { from: 'checked:bg-green-600', to: 'checked:bg-[var(--color-success,#10B981)]' },
  { from: 'checked:border-green-600', to: 'checked:border-[var(--color-success,#10B981)]' },
  
  // Toggle switch colors
  { from: 'bg-gray-300', to: 'style={{ backgroundColor: \'var(--color-gray-light, #E5E7EB)\' }}' },
  { from: 'bg-blue-600', to: 'style={{ backgroundColor: \'var(--color-primary, #5243E9)\' }}' },
  { from: 'bg-green-600', to: 'style={{ backgroundColor: \'var(--color-success, #10B981)\' }}' },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  const regex = new RegExp(`\\b${from}\\b`, 'g');
  content = content.replace(regex, to);
});

// Write the updated content back
fs.writeFileSync(formBuilderPath, content, 'utf8');

console.log('✅ FormBuilder colors updated with design system variables!'); 