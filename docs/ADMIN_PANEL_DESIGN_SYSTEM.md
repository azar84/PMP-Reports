# PMP Reports Admin Panel Design System Guide

## Overview
This document defines the standardized styling patterns for the PMP Reports admin panel to ensure consistency across all components, forms, and interfaces.

---

## 🎨 Color System

### Background Colors
- **Main Container Background**: `Primary Background` (`#fafafa`)
- **Card Background**: `Secondary Background` (`#ffffff`)
- **Sidebar Background**: `Sidebar Background` (`#ffffff`)
- **Sidebar Header Background**: `Sidebar Header Background` (`#ff2600`)
- **Header Background**: `Header Background` (`#ff2600`)
- **Table Header Background**: `Secondary Background`
- **Table Body Background**: `Primary Background`
- **Modal Background**: `Secondary Background`
- **Disabled Background**: `Border Light`

### Text Colors
- **Primary Text**: `Primary Text` (`#4B5563`)
- **Secondary Text**: `Secondary Text` (`#9CA3AF`)
- **Muted Text**: `Muted Text` (`#D1D5DB`)
- **Header Text**: `Header Text` (`#ffffff`)
- **Sidebar Text**: `Sidebar Text` (`#000000`)
- **Sidebar Header Text**: `Sidebar Header` (`#ffffff`)
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
- **Default Border**: `Border Light` (`var(--color-border-light)`)
- **Focus Border**: `Border Strong` (`var(--color-border-strong)`)
- **Error Border**: `Error`
- **Success Border**: `Success`

### Button Colors
- **Primary**: `Primary` background (`#ff2600`), `Primary Background` text (`#fafafa`)
- **Secondary**: `Secondary` background (`#ff9300`), `Primary Background` text (`#fafafa`)
- **Success**: `Success` background, `Primary Background` text
- **Error**: `Error` background, `Primary Background` text
- **Ghost**: `Primary Text` text, `Secondary Background` on hover
- **Disabled**: `Border Light` background, `Muted Text` text

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
- Background: `Secondary Background` (`var(--color-bg-secondary)`)
- Border: `Border Light` (`var(--color-border-light)`)
- Shadow: `0 1px 2px rgba(0, 0, 0, 0.03)` (subtle elevation)

### Table
- Header: `Secondary Background` and `Primary Text`
- Rows: `Primary Background`
- Hover: `Secondary Background`

### Input / Select
- Background: `Primary Background` (`var(--color-bg-primary)`)
- Border: `Border Light` (`var(--color-border-light)`)
- Text: `Primary Text` (`var(--color-text-primary)`)
- Placeholder: `Muted Text` (`var(--color-text-muted)`)
- Hover: `Secondary Background` (`var(--color-bg-secondary)`)
- Focus: `Border Strong` (`var(--color-border-strong)`) + Blue ring (`rgba(59, 130, 246, 0.1)`)

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

## 🎯 Professional Guidelines (Linear/Notion/Stripe Quality)

### Background Layering Rules
1. **BG 1 (Primary)**: `var(--color-bg-primary)` - Main page/canvas backgrounds
2. **BG 2 (Secondary)**: `var(--color-bg-secondary)` - Cards, panels, elevated containers  
3. **BG 3 (Dark)**: `var(--color-bg-dark)` - Sidebar, header strips, quiet sections
4. **BG 4 (Header)**: `var(--color-header-bg)` - Main header background
5. **BG 5 (Sidebar)**: `var(--color-sidebar-bg)` - Sidebar navigation background
6. **BG 6 (Sidebar Header)**: `var(--color-sidebar-header-bg)` - Sidebar header (logo area) background

### Border Usage Rules
1. **Light Borders**: `var(--color-border-light)` - Subtle dividers, hover states, card borders
2. **Strong Borders**: `var(--color-border-strong)` - Major separators, focus states, structural dividers

### Component State Rules
1. **Input States**: Default → Hover → Focus progression with proper color transitions
2. **Button Focus**: Accessible blue rings (`#3B82F6`) for keyboard navigation
3. **Card Elevation**: Subtle shadows (`0 1px 2px rgba(0, 0, 0, 0.03)`) for premium feel

### Structural Separator Rules
1. **Sidebar ↔ Main**: Strong border (`var(--color-border-strong)`) - major layout boundary
2. **Header ↔ Main**: Light border (`var(--color-border-light)`) - content hierarchy
3. **Sidebar Header ↔ Sidebar Menu**: Light border (`var(--color-border-light)`) - subtle hierarchy within sidebar

### Text Color Rules
1. **Header Text**: `var(--color-header-text-color)` - High contrast on header background
2. **Sidebar Text**: `var(--color-sidebar-text-color)` - High contrast on sidebar background  
3. **Sidebar Header Text**: `var(--color-sidebar-header-color)` - High contrast on sidebar header background
4. **Primary Text**: `var(--color-text-primary)` - Main content text
5. **Secondary Text**: `var(--color-text-secondary)` - Supporting text
6. **Muted Text**: `var(--color-text-muted)` - Placeholders and subtle information

### Accessibility Compliance
- **Focus Indicators**: 2px blue outline (`#3B82F6`) with 2px offset
- **Contrast Ratios**: WCAG AA compliant (4.5:1 minimum)
- **Keyboard Navigation**: All interactive elements accessible via keyboard

### Implementation Examples
```css
/* Input Field States */
input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
}
input:hover {
  background-color: var(--color-bg-secondary);
}
input:focus {
  border-color: var(--color-border-strong);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Button Focus States */
.btn:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Card Elevation */
.card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
```

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
- [ ] **Professional Guidelines Compliance**:
  - [ ] Background layering follows BG 1 → BG 2 → BG 3 → BG 4 → BG 5 → BG 6 hierarchy
  - [ ] Border usage follows Light vs Strong rules
  - [ ] Input states implement Default → Hover → Focus progression
  - [ ] Button focus rings use accessible blue (`#3B82F6`)
  - [ ] Card elevation uses subtle shadows
  - [ ] Structural separators use correct border weights
  - [ ] Text colors use appropriate contrast for their backgrounds
  - [ ] Header and sidebar colors are properly applied
  - [ ] Accessibility compliance (WCAG AA contrast ratios)
  - [ ] Keyboard navigation support
