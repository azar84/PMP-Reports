# PMP Reports Design System Hierarchy Documentation

## Overview
This document outlines the proper usage of colors and backgrounds in the PMP Reports Admin Panel to maintain visual hierarchy and consistency across all components.

## Current Design System Colors

Based on the active design system in the database:

| Color Token | Hex Value | Usage |
|-------------|-----------|-------|
| `primaryColor` | `#ff2600` | Primary brand color, buttons, accents |
| `backgroundPrimary` | `#000000` | Main page backgrounds |
| `backgroundSecondary` | `#444444` | Card backgrounds, secondary containers |
| `backgroundDark` | `#232323` | Sidebar background |
| `grayMedium` | `#6B7280` | Borders, dividers |
| `grayDark` | `#444444` | Dark borders, inactive states |
| `grayLight` | `#ebebeb` | Light borders, hover states |
| `textPrimary` | `#ffffff` | Main text, headings |
| `textSecondary` | `#ebebeb` | Secondary text, labels |
| `textMuted` | `#9CA3AF` | Muted text, placeholders |

## Visual Hierarchy Rules

### 1. Main Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Main Container (backgroundDark: #232323)                │
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Sidebar     │ │ Header (backgroundSecondary: #232323) │ │
│ │ (backgroundDark) │ └─────────────────────────────────────┘ │
│ │             │ │ Content Area                         │ │
│ │             │ │ (backgroundPrimary: #000000)         │ │
│ │             │ │ ┌─────────────────────────────────┐ │ │
│ │             │ │ │ Cards/Components                │ │ │
│ │             │ │ │ (backgroundSecondary: #444444) │ │ │
│ │             │ │ └─────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Visual Hierarchy Flow

```
backgroundDark (#232323)
├── Sidebar Navigation (backgroundDark: #444444)
└── Main Content Area
    ├── Header (backgroundSecondary: #232323)
    └── Content (backgroundPrimary: #000000)
        ├── Dashboard Cards
        ├── User Management Cards  
        ├── Scheduler Cards
        ├── Site Settings Cards
        └── Design System Cards
            └── backgroundSecondary (#444444)
                ├── Form inputs
                ├── Modal content
                └── Secondary containers
```

### 3. Background Color Usage

#### **Main Container** (`colors.backgroundDark`)
- **Usage**: Overall admin panel wrapper
- **Color**: `#232323`
- **Purpose**: Provides the base dark theme foundation

#### **Content Areas** (`colors.backgroundPrimary`)
- **Usage**: Main content containers for all views
- **Color**: `#000000` (black)
- **Purpose**: Primary content background for dashboard, users, scheduler, site-settings, design-system views
- **Exception**: Media Library uses `colors.backgroundSecondary` for its main container

#### **Cards & Secondary Containers** (`colors.backgroundSecondary`)
- **Usage**: All Card components, secondary UI elements
- **Color**: `#444444`
- **Purpose**: Provides contrast against primary background
- **Examples**: Dashboard metric cards, form containers, modal content

#### **Header** (`colors.backgroundSecondary`)
- **Usage**: Global header/top navigation
- **Color**: `#232323`
- **Purpose**: Lighter than sidebar, provides contrast for header content

#### **Sidebar** (`colors.backgroundDark`)
- **Usage**: Navigation sidebar
- **Color**: `#444444`
- **Purpose**: Darker background to distinguish navigation from main content

### 3. Text Color Hierarchy

#### **Primary Text** (`colors.textPrimary`)
- **Usage**: Headings, main content text, important labels
- **Color**: `#ffffff` (white)
- **Purpose**: Highest contrast for readability

#### **Secondary Text** (`colors.textSecondary`)
- **Usage**: Labels, descriptions, secondary information
- **Color**: `#ebebeb`
- **Purpose**: Good contrast while being less prominent than primary text

#### **Muted Text** (`colors.textMuted`)
- **Usage**: Placeholders, captions, less important information
- **Color**: `#9CA3AF`
- **Purpose**: Lowest contrast for subtle information

### 4. Interactive Elements

#### **Primary Actions** (`colors.primary`)
- **Usage**: Primary buttons, active states, brand elements
- **Color**: `#ff2600` (red/orange)
- **Purpose**: Draws attention to main actions

#### **Borders & Dividers**
- **Light borders**: `colors.grayLight` (`#ebebeb`)
- **Medium borders**: `colors.grayMedium` (`#6B7280`)
- **Dark borders**: `colors.grayDark` (`#444444`)

## Implementation Guidelines

### ✅ Correct Usage Examples

```tsx
// Main content container
<div style={{ backgroundColor: colors.backgroundPrimary }}>
  {/* Dashboard, Users, Scheduler, Site Settings, Design System */}
</div>

// Media Library special case
<div style={{ backgroundColor: colors.backgroundSecondary }}>
  {/* Media Library main container */}
</div>

// Cards and secondary containers
<Card> {/* Uses colors.backgroundSecondary internally */}
  <CardTitle> {/* Uses colors.textPrimary */}
    Heading
  </CardTitle>
  <CardDescription> {/* Uses colors.textSecondary */}
    Description text
  </CardDescription>
</Card>

// Sidebar
<div style={{ backgroundColor: colors.backgroundDark }}>
  {/* Navigation items */}
</div>

// Primary buttons
<button style={{ backgroundColor: colors.primary }}>
  Primary Action
</button>
```

### ❌ Incorrect Usage Examples

```tsx
// DON'T: Use hardcoded colors
<div style={{ backgroundColor: '#F9FAFB' }}>

// DON'T: Use wrong hierarchy
<div style={{ backgroundColor: colors.backgroundSecondary }}>
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
- **Background**: `colors.backgroundDark`
- **Active navigation**: `colors.grayMedium`
- **Text**: `colors.textPrimary`

### Header (All Views)
- **Background**: `colors.backgroundSecondary`
- **Text**: `colors.textPrimary`
- **Icons**: `colors.textSecondary`

## Color Contrast Guidelines

### Minimum Contrast Ratios
- **Primary text on primary background**: 4.5:1 (WCAG AA)
- **Secondary text on primary background**: 3:1 (WCAG AA)
- **Interactive elements**: 3:1 (WCAG AA)

### Current Contrast Analysis
- `#ffffff` on `#000000`: 21:1 ✅ (Excellent)
- `#ffffff` on `#444444`: 9.7:1 ✅ (Excellent)
- `#ebebeb` on `#000000`: 18.1:1 ✅ (Excellent)
- `#ebebeb` on `#444444`: 8.2:1 ✅ (Excellent)

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

*Last updated: $(date)*
*Design System Version: Active database values*
