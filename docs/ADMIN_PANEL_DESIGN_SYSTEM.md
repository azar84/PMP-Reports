# PMP Reports Admin Panel Design System Guide

## Overview
This document defines the standardized styling patterns for the PMP Reports admin panel to ensure consistency across all components, forms, and interfaces.

---

## 🎨 Color System

### Background Colors
- **Main Container Background**: `Secondary Background`
- **Card Background**: `Primary Background`
- **Sidebar Background**: `Dark Background`
- **Table Header Background**: `Secondary Background`
- **Table Body Background**: `Primary Background`
- **Modal Background**: `Primary Background`
- **Disabled Background**: `Gray Light`

### Text Colors
- **Primary Text**: `Primary Text`
- **Secondary Text**: `Secondary Text`
- **Muted Text**: `Muted Text`
- **Success Text**: `Success Dark`
- **Error Text**: `Error Dark`
- **Warning Text**: `Warning Dark`
- **Disabled Text**: `Muted Text`

### Placeholder Text
Always use muted color:
```css
::placeholder {
  color: Muted Text;
}
```

### Border Colors
- **Default Border**: `Gray Light`
- **Focus Border**: `Primary`
- **Error Border**: `Error`
- **Success Border**: `Success`

### Button Colors
- **Primary**: `Primary` background, `Primary Background` text
- **Success**: `Success` background, `Primary Background` text
- **Error**: `Error` background, `Primary Background` text
- **Ghost**: `Primary Text` text, `Secondary Background` on hover
- **Disabled**: `Gray Light` background, `Muted Text` text

### Badge Colors
Use appropriate light/dark variants for active, inactive, info, warning, and success states.

---

## 🧩 Component Standards

### Form Labels
Use `Primary Text`

### Section Headers
Use `Primary Text`

### Page Headers
- Title: `Primary Text`
- Description: `Secondary Text`

### Card
- Background: `Primary Background`
- Border: `Gray Light`

### Table
- Header: `Secondary Background` and `Primary Text`
- Rows: `Primary Background`
- Hover: `Secondary Background`

### Input / Select
- Border: `Gray Light`
- Text: `Primary Text`
- Placeholder: `Muted Text`

### Status Messages
- Success: `Success Light` background, `Success Dark` text
- Error: `Error Light` background, `Error Dark` text

### Tab Navigation
- Active: `Primary` background, `Primary Background` text
- Inactive: `Primary Background` background, `Secondary Text` text

### Empty State
- Icon: `Muted Text`
- Title: `Primary Text`
- Description: `Secondary Text`

### Loading State
- Text: `Secondary Text`

### Modal Overlay
```css
background-color: rgba(0, 0, 0, 0.5);
```

### Icons
- Primary: `Primary`
- Secondary: `Secondary Text`
- Muted: `Muted Text`
- Success: `Success`
- Error: `Error`

### Pagination Controls
- Inactive: `Primary Background` background, `Secondary Text` text
- Active: `Primary` background, `Primary Background` text

---

## 🗂️ Tab Navigation — Design Guidelines

### Forms Management Tab Pattern
This is the standard tab pattern used in forms management and similar interfaces:

#### States & Parameters

| **State**        | **Background**         | **Text**             | **Border**           | **Notes**                                                 |
|------------------|------------------------|----------------------|----------------------|-----------------------------------------------------------|
| **Active Tab**   | `transparent`          | `Primary`            | `Primary` (bottom)   | Primary color text with bottom border                     |
| **Inactive Tab** | `transparent`          | `Secondary Text`     | `transparent`        | Muted text with no border                                 |
| **Hover State**  | `transparent`          | `Primary Text`       | —                    | Subtle text emphasis on hover                             |

#### Layout & Spacing
- **Container**: `border-b` with `Gray Light` border
- **Navigation**: `-mb-px flex space-x-8`
- **Tab Items**: `py-4 px-1 border-b-2 font-medium text-sm transition-colors`
- **Icons**: `mr-2 h-5 w-5 transition-colors`
- **Typography**: Medium font weight for clarity

#### Implementation Example
```tsx
<div className="border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
  <nav className="-mb-px flex space-x-8">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          style={{
            borderColor: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <Icon
            className="mr-2 h-5 w-5 transition-colors"
            style={{
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
          />
          {tab.name}
        </button>
      );
    })}
  </nav>
</div>
```

### Content Tab Pattern (Alternative)
For content-heavy interfaces like HTML sections manager:

#### States & Parameters

| **State**        | **Background**         | **Text**             | **Border**           | **Notes**                                                 |
|------------------|------------------------|----------------------|----------------------|-----------------------------------------------------------|
| **Active Tab**   | `Primary`              | `Background Primary` | `Primary` (bottom)   | High-contrast text on emphasized background               |
| **Inactive Tab** | `Background Primary`   | `Secondary Text`     | `transparent`        | Neutral tab background with subdued label                 |
| **Hover State**  | `Secondary Background` | `Primary Text`       | —                    | Slight background lift and increased text emphasis        |

---

## 🃏 Card-in-Card Background Patterns

### Page Builder Card Hierarchy
When cards are nested within other cards (like in page builder), use this background pattern:

#### Container Cards (Outer)
- **Background**: `Secondary Background`
- **Border**: `Gray Light`
- **Padding**: `p-6`
- **Border Radius**: `rounded-xl`
- **Shadow**: `shadow-sm`

#### Content Cards (Inner)
- **Background**: `Primary Background` (when active/visible)
- **Background**: `Secondary Background` (when inactive/hidden)
- **Border**: `Gray Light` (when active)
- **Border**: `Muted Text` (when inactive)
- **Padding**: `p-4`
- **Border Radius**: `rounded-lg`
- **Border Width**: `border-2`

#### Implementation Example
```tsx
// Container Card
<div 
  className="rounded-xl p-6 shadow-sm border"
  style={{ 
    backgroundColor: 'var(--color-bg-secondary)',
    borderColor: 'var(--color-gray-light)'
  }}
>
  {/* Content Cards */}
  <div
    className="rounded-lg border-2 transition-all duration-200"
    style={{
      backgroundColor: section.isVisible 
        ? 'var(--color-bg-primary)' 
        : 'var(--color-bg-secondary)',
      borderColor: section.isVisible 
        ? 'var(--color-gray-light)' 
        : 'var(--color-text-muted)',
      opacity: section.isVisible ? 1 : 0.6
    }}
  >
    {/* Card content */}
  </div>
</div>
```

### Card States
- **Active/Visible**: Full opacity, primary background, gray border
- **Inactive/Hidden**: Reduced opacity (0.6), secondary background, muted border
- **Dragging**: Scale transform (1.05), primary border, 0.9 opacity

---

## 🔁 Usage Rules

### Text Hierarchy
1. Primary – headings, labels
2. Secondary – descriptions
3. Muted – timestamps, placeholders, disabled

### Backgrounds
- Primary – cards, modals
- Secondary – layout backgrounds, table headers
- Dark – sidebar/nav
- Disabled – buttons/inputs

### Borders
- Default: general use
- Focus: active states
- Error/Success: validation feedback

---

## ✅ Implementation Checklist

- [ ] All text uses design tokens
- [ ] All backgrounds use design tokens
- [ ] All borders use design tokens
- [ ] No hardcoded colors
- [ ] Placeholder text uses muted
- [ ] Tabs follow state logic
- [ ] Hover/focus states styled
- [ ] Empty/loading states compliant
- [ ] Card-in-card backgrounds follow hierarchy
- [ ] Tab navigation uses correct pattern for context
