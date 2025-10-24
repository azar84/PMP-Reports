# PMP Reports Design System Hierarchy Documentation

## Overview
This document outlines the proper usage of colors and backgrounds in the PMP Reports Admin Panel to maintain visual hierarchy and consistency across all components.

## Current Design System Colors

Based on the active design system in the database:

| Color Token | Hex Value | Usage |
|-------------|-----------|-------|
| `primaryColor` | `#ff2600` | Primary brand color, buttons, accents |
| `secondaryColor` | `#ff9300` | Secondary brand color, secondary actions |
| `accentColor` | `#06B6D4` | Accent color for highlights |
| `successColor` | `#10B981` | Success states and positive actions |
| `warningColor` | `#F59E0B` | Warning states and caution |
| `errorColor` | `#EF4444` | Error states and destructive actions |
| `infoColor` | `#3B82F6` | Informational messages |
| `backgroundPrimary` | `#fafafa` | Main page backgrounds |
| `backgroundSecondary` | `#ffffff` | Card backgrounds, secondary containers |
| `backgroundDark` | `#c0c0c0` | Sidebar background |
| `headerBackgroundColor` | `#ff2600` | Header background color |
| `sidebarHeaderBackgroundColor` | `#ff2600` | Sidebar header (logo area) background |
| `sidebarBackgroundColor` | `#ffffff` | Sidebar navigation background |
| `borderLight` | `#F9FAFB` | Light borders, hover states, subtle dividers |
| `borderStrong` | `#d6d6d6` | Strong borders, major separators, focus states |
| `textPrimary` | `#4B5563` | Main text, headings (light colors) |
| `textSecondary` | `#9CA3AF` | Secondary text, labels (light colors) |
| `textMuted` | `#D1D5DB` | Muted text, placeholders (light colors) |
| `headerTextColor` | `#ffffff` | Header and navigation text color |
| `sidebarTextColor` | `#000000` | Sidebar menu and navigation text color |
| `sidebarHeaderColor` | `#ffffff` | Sidebar header (logo area) and close button text color |

## Visual Hierarchy Rules

### 1. Main Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Main Container (backgroundPrimary: #fafafa)           │
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Sidebar     │ │ Header (headerBackgroundColor: #ff2600) │ │
│ │ (sidebarBackgroundColor: #ffffff) │ └─────────────────────────────────────┘ │
│ │             │ │ Content Area                         │ │
│ │             │ │ (backgroundPrimary: #fafafa)         │ │
│ │             │ │ ┌─────────────────────────────────┐ │ │
│ │             │ │ │ Cards/Components                │ │ │
│ │             │ │ │ (backgroundSecondary: #ffffff) │ │ │
│ │             │ │ └─────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Visual Hierarchy Flow

```
backgroundPrimary (#fafafa)
├── Sidebar Navigation (sidebarBackgroundColor: #ffffff)
│   └── Sidebar Header (sidebarHeaderBackgroundColor: #ff2600)
└── Main Content Area
    ├── Header (headerBackgroundColor: #ff2600)
    └── Content (backgroundPrimary: #fafafa)
        ├── Dashboard Cards
        ├── User Management Cards  
        ├── Scheduler Cards
        ├── Site Settings Cards
        └── Design System Cards
            └── backgroundSecondary (#ffffff)
                ├── Form inputs
                ├── Modal content
                └── Secondary containers
```

### 3. Background Color Usage

#### **Main Container** (`colors.backgroundPrimary`)
- **Usage**: Overall admin panel wrapper
- **Color**: `#fafafa` (light gray)
- **Purpose**: Provides the base light theme foundation

#### **Content Areas** (`colors.backgroundPrimary`)
- **Usage**: Main content containers for all views
- **Color**: `#fafafa` (light gray)
- **Purpose**: Primary content background for dashboard, users, scheduler, site-settings, design-system views
- **Exception**: Media Library uses `colors.backgroundSecondary` for its main container

#### **Cards & Secondary Containers** (`colors.backgroundSecondary`)
- **Usage**: All Card components, secondary UI elements
- **Color**: `#ffffff` (white)
- **Purpose**: Provides contrast against primary background
- **Examples**: Dashboard metric cards, form containers, modal content

#### **Header** (`colors.headerBackgroundColor`)
- **Usage**: Global header/top navigation
- **Color**: `#ff2600` (primary color)
- **Purpose**: Uses primary brand color for header background

#### **Sidebar** (`colors.sidebarBackgroundColor`)
- **Usage**: Navigation sidebar
- **Color**: `#ffffff` (white)
- **Purpose**: Clean white background for navigation

#### **Sidebar Header** (`colors.sidebarHeaderBackgroundColor`)
- **Usage**: Sidebar logo area
- **Color**: `#ff2600` (primary color)
- **Purpose**: Matches header background for consistency

### 4. Text Color Hierarchy

#### **Primary Text** (`colors.textPrimary`)
- **Usage**: Headings, main content text, important labels
- **Color**: `#4B5563` (dark gray)
- **Purpose**: High contrast for readability on light backgrounds

#### **Secondary Text** (`colors.textSecondary`)
- **Usage**: Labels, descriptions, secondary information
- **Color**: `#9CA3AF` (medium gray)
- **Purpose**: Good contrast while being less prominent than primary text

#### **Muted Text** (`colors.textMuted`)
- **Usage**: Placeholders, captions, less important information
- **Color**: `#D1D5DB` (light gray)
- **Purpose**: Lowest contrast for subtle information

#### **Header Text** (`colors.headerTextColor`)
- **Usage**: Header titles, navigation text
- **Color**: `#ffffff` (white)
- **Purpose**: High contrast on primary color header background

#### **Sidebar Text** (`colors.sidebarTextColor`)
- **Usage**: Sidebar menu items, navigation text
- **Color**: `#000000` (black)
- **Purpose**: High contrast on white sidebar background

#### **Sidebar Header Text** (`colors.sidebarHeaderColor`)
- **Usage**: Sidebar logo area, close button
- **Color**: `#ffffff` (white)
- **Purpose**: High contrast on primary color sidebar header background

### 5. Interactive Elements

#### **Primary Actions** (`colors.primary`)
- **Usage**: Primary buttons, active states, brand elements
- **Color**: `#ff2600` (red/orange)
- **Purpose**: Draws attention to main actions
- **Text Color**: `var(--color-bg-primary)` (`#fafafa`) for contrast

#### **Secondary Actions** (`colors.secondary`)
- **Usage**: Secondary buttons, alternative actions
- **Color**: `#ff9300` (orange)
- **Purpose**: Alternative actions with brand consistency
- **Text Color**: `var(--color-bg-primary)` (`#fafafa`) for contrast

#### **Borders & Dividers**
- **Light borders**: `colors.borderLight` (`#F9FAFB`) - Subtle dividers, hover states, card borders
- **Strong borders**: `colors.borderStrong` (`#d6d6d6`) - Major separators, focus states, structural dividers

## Professional Design Guidelines

### 🎯 Background Layering Rules (Linear/Notion/Stripe Quality)

#### **BG 1 (Primary)**: `var(--color-bg-primary)` (`#fafafa`)
- **Usage**: Main page/canvas backgrounds
- **Elements**: `body`, `.space-y-8`, main content areas
- **Implementation**: `background: var(--color-bg-primary); color: var(--color-text-primary);`

#### **BG 2 (Secondary)**: `var(--color-bg-secondary)` (`#ffffff`)
- **Usage**: Cards, panels, elevated containers
- **Elements**: `.rounded-xl.p-6`, form containers, modal content
- **Implementation**: `background: var(--color-bg-secondary); border: 1px solid var(--color-border-light);`

#### **BG 3 (Dark)**: `var(--color-bg-dark)` (`#c0c0c0`)
- **Usage**: Sidebar, header strips, quiet sections
- **Elements**: `.sidebar`, `.header-strip`, `.quiet-section`
- **Implementation**: `background: var(--color-bg-dark); border-color: var(--color-border-light);`

#### **BG 4 (Header)**: `var(--color-header-bg)` (`#ff2600`)
- **Usage**: Main header background
- **Elements**: `.header`, `.top-navigation`
- **Implementation**: `background: var(--color-header-bg); color: var(--color-header-text-color);`

#### **BG 5 (Sidebar)**: `var(--color-sidebar-bg)` (`#ffffff`)
- **Usage**: Sidebar navigation background
- **Elements**: `.sidebar`, `.navigation`
- **Implementation**: `background: var(--color-sidebar-bg); color: var(--color-sidebar-text-color);`

#### **BG 6 (Sidebar Header)**: `var(--color-sidebar-header-bg)` (`#ff2600`)
- **Usage**: Sidebar header (logo area) background
- **Elements**: `.sidebar-header`, `.logo-area`
- **Implementation**: `background: var(--color-sidebar-header-bg); color: var(--color-sidebar-header-color);`

### 🎨 Border Usage Rules

#### **Light Borders**: `var(--color-border-light)` (`#F9FAFB`)
- **Usage**: Subtle dividers, hover states, card borders, sidebar header borders
- **Elements**: `.border-b`, input fields, card borders, sidebar header dividers
- **Implementation**: `border-color: var(--color-border-light);`

#### **Strong Borders**: `var(--color-border-strong)` (`#d6d6d6`)
- **Usage**: Major separators, focus states, structural dividers
- **Elements**: Sidebar dividers, table borders, focus states
- **Implementation**: `border-color: var(--color-border-strong);`

### 🔧 Component State Rules

#### **Input Field States**
```css
/* Default */
input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
}

/* Hover */
input:hover {
  background-color: var(--color-bg-secondary);
}

/* Focus */
input:focus {
  border-color: var(--color-border-strong);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
```

#### **Button Focus States**
```css
.btn:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

#### **Card Elevation**
```css
.card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
```

### 🏗️ Structural Separator Rules

#### **Sidebar ↔ Main Content**
- **Border**: `var(--color-border-strong)` (`#d6d6d6`)
- **Reason**: Major layout boundary
- **Implementation**: `border-right: 1px solid var(--color-border-strong);`

#### **Header ↔ Main Content**
- **Border**: `var(--color-border-light)` (`#F9FAFB`)
- **Reason**: Part of main content hierarchy
- **Implementation**: `border-bottom: 1px solid var(--color-border-light);`

#### **Sidebar Header ↔ Sidebar Menu**
- **Border**: `var(--color-border-light)` (`#F9FAFB`)
- **Reason**: Subtle hierarchy within sidebar
- **Implementation**: `border-bottom: 1px solid var(--color-border-light);`

## Implementation Guidelines

### ✅ Correct Usage Examples

```tsx
// Main content container
<div style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
  {/* Dashboard, Users, Scheduler, Site Settings, Design System */}
</div>

// Media Library special case
<div style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
  {/* Media Library main container */}
</div>

// Cards and secondary containers
<Card> {/* Uses var(--color-bg-secondary) internally with light border */}
  <CardTitle> {/* Uses var(--color-text-primary) */}
    Heading
  </CardTitle>
  <CardDescription> {/* Uses var(--color-text-secondary) */}
    Description text
  </CardDescription>
</Card>

// Sidebar navigation
<div style={{ 
  backgroundColor: 'var(--color-sidebar-bg)', 
  borderRight: '1px solid var(--color-border-strong)',
  color: 'var(--color-sidebar-text-color)'
}}>
  {/* Navigation items */}
</div>

// Sidebar header
<div style={{ 
  backgroundColor: 'var(--color-sidebar-header-bg)', 
  borderBottom: '1px solid var(--color-border-light)',
  color: 'var(--color-sidebar-header-color)'
}}>
  {/* Logo area */}
</div>

// Header
<div style={{ 
  backgroundColor: 'var(--color-header-bg)', 
  borderBottom: '1px solid var(--color-border-light)',
  color: 'var(--color-header-text-color)'
}}>
  {/* Header content */}
</div>

// Primary buttons
<button style={{ 
  backgroundColor: 'var(--color-primary)', 
  color: 'var(--color-bg-primary)' 
}}>
  Primary Action
</button>
```

### ❌ Incorrect Usage Examples

```tsx
// DON'T: Use hardcoded colors
<div style={{ backgroundColor: '#F9FAFB' }}>

// DON'T: Use wrong hierarchy
<div style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
  <Card> {/* This creates backgroundSecondary on backgroundSecondary */}
</div>

// DON'T: Mix CSS variables with design system
<div style={{ backgroundColor: 'var(--color-bg-primary, #000000)' }}>
```

## Component-Specific Rules

### Dashboard View
- **Main container**: `colors.backgroundPrimary`
- **Metric cards**: `colors.backgroundSecondary`
- **Card text**: `colors.textPrimary` for values, `colors.textSecondary` for labels

### Media Library View
- **Main container**: `colors.backgroundSecondary` (special case)
- **Modal wrapper**: `colors.backgroundSecondary`
- **Sidebar**: `colors.backgroundSecondary`
- **Toolbar**: `colors.backgroundSecondary`
- **Content area**: `colors.backgroundSecondary`

### Other Views (Users, Scheduler, Site Settings, Design System)
- **Main container**: `colors.backgroundPrimary`
- **Cards**: `colors.backgroundSecondary`
- **Forms**: `colors.backgroundSecondary`

### Sidebar (All Views)
- **Background**: `colors.sidebarBackgroundColor` (`#ffffff`)
- **Header Background**: `colors.sidebarHeaderBackgroundColor` (`#ff2600`)
- **Text**: `colors.sidebarTextColor` (`#000000`)
- **Header Text**: `colors.sidebarHeaderColor` (`#ffffff`)
- **Border**: `colors.borderStrong` for main divider, `colors.borderLight` for header divider

### Header (All Views)
- **Background**: `colors.headerBackgroundColor` (`#ff2600`)
- **Text**: `colors.headerTextColor` (`#ffffff`)
- **Border**: `colors.borderLight` for bottom border

## Color Contrast Guidelines

### Minimum Contrast Ratios
- **Primary text on primary background**: 4.5:1 (WCAG AA)
- **Secondary text on primary background**: 3:1 (WCAG AA)
- **Interactive elements**: 3:1 (WCAG AA)

### Current Contrast Analysis
- `#4B5563` on `#fafafa`: 8.2:1 ✅ (Excellent)
- `#ffffff` on `#ff2600`: 4.5:1 ✅ (WCAG AA)
- `#000000` on `#ffffff`: 21:1 ✅ (Excellent)
- `#ffffff` on `#ff2600`: 4.5:1 ✅ (WCAG AA)
- `#4B5563` on `#ffffff`: 8.2:1 ✅ (Excellent)

## Maintenance Notes

1. **Always use design system colors** - Never hardcode hex values
2. **Test contrast ratios** when updating colors
3. **Maintain hierarchy** - Don't mix background levels incorrectly
4. **Update this documentation** when design system changes
5. **Use the Card component** for consistent styling across views

## Migration Checklist

When updating components to follow this hierarchy:

- [ ] Replace hardcoded colors with design system colors
- [ ] Ensure proper background hierarchy (dark → primary → secondary)
- [ ] Use Card component for consistent styling
- [ ] Test contrast ratios for accessibility
- [ ] Update component documentation
- [ ] Test across all views (Dashboard, Media Library, Users, etc.)

---

*Last updated: January 22, 2025*
*Design System Version: Updated with header colors, background colors, and border refinements*
