'use client';

import { useEffect } from 'react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;

  secondaryColor: string;
  accentColor: string;
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  // Neutral Colors
  borderLight: string;
  borderStrong: string;

  // Background Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  headerBackgroundColor: string;
  sidebarHeaderBackgroundColor: string;
  sidebarBackgroundColor: string;

  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerTextColor: string;
  sidebarTextColor: string;
  sidebarHeaderColor: string;
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  // Spacing Scale
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  // Border Radius
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Animation Durations
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  // Breakpoints
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;
  // Custom Variables
  customVariables?: string;
}

const applyDesignSystemToRoot = (ds: DesignSystem) => {
  const root = document.documentElement;
  
  // Override the existing CSS variables from globals.css with database values
  
  // Brand Colors (override --color-primary variants)
  root.style.setProperty('--color-primary', ds.primaryColor);
  root.style.setProperty('--color-primary-light', ds.primaryColorLight);
  root.style.setProperty('--color-primary-dark', ds.primaryColor);
  root.style.setProperty('--color-secondary', ds.secondaryColor);
  root.style.setProperty('--color-accent', ds.accentColor);
  
  // Semantic Colors (override existing --color-success, etc.)
  root.style.setProperty('--color-success', ds.successColor);
  root.style.setProperty('--color-warning', ds.warningColor);
  root.style.setProperty('--color-error', ds.errorColor);
  root.style.setProperty('--color-info', ds.infoColor);
  
  // Darker variants for hover states (auto-generate if not provided)
  root.style.setProperty('--color-secondary-dark', ds.secondaryColor);
  root.style.setProperty('--color-accent-dark', ds.accentColor);
  root.style.setProperty('--color-success-dark', ds.successColor);
  root.style.setProperty('--color-error-dark', ds.errorColor);
  root.style.setProperty('--color-info-dark', ds.infoColor);
  
  // Create darker variants for better hover effects
  const darkenColor = (color: string, amount: number = 0.2) => {
    // Simple darkening function - you might want to use a proper color library
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  root.style.setProperty('--color-secondary-dark', darkenColor(ds.secondaryColor));
  root.style.setProperty('--color-accent-dark', darkenColor(ds.accentColor));
  root.style.setProperty('--color-success-dark', darkenColor(ds.successColor));
  root.style.setProperty('--color-error-dark', darkenColor(ds.errorColor));
  root.style.setProperty('--color-info-dark', darkenColor(ds.infoColor));
  
  // Typography (override existing font families and add weights)
  root.style.setProperty('--font-family-sans', ds.fontFamily);
  root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
  root.style.setProperty('--font-size-base', ds.fontSizeBase);
  root.style.setProperty('--line-height-base', ds.lineHeightBase);
  root.style.setProperty('--font-weight-normal', ds.fontWeightNormal);
  root.style.setProperty('--font-weight-medium', ds.fontWeightMedium);
  root.style.setProperty('--font-weight-bold', ds.fontWeightBold);
  
  // Text colors
    root.style.setProperty('--color-text-primary', ds.textPrimary);
    root.style.setProperty('--color-text-secondary', ds.textSecondary);
    root.style.setProperty('--color-text-muted', ds.textMuted);
    root.style.setProperty('--color-header-text-color', ds.headerTextColor);
    root.style.setProperty('--color-sidebar-text-color', ds.sidebarTextColor);
    root.style.setProperty('--color-sidebar-header-color', ds.sidebarHeaderColor);
  
  // Background colors
  root.style.setProperty('--color-bg-primary', ds.backgroundPrimary);
  root.style.setProperty('--color-bg-secondary', ds.backgroundSecondary);
  root.style.setProperty('--color-bg-dark', ds.backgroundDark || '#1F2937');
  root.style.setProperty('--color-header-bg', ds.headerBackgroundColor);
  root.style.setProperty('--color-sidebar-header-bg', ds.sidebarHeaderBackgroundColor);
  root.style.setProperty('--color-sidebar-bg', ds.sidebarBackgroundColor);
  
  // Neutral colors
  root.style.setProperty('--color-border-light', ds.borderLight);
  root.style.setProperty('--color-border-strong', ds.borderStrong);
  root.style.setProperty('--color-border-medium', ds.borderStrong);
  
  // Update gradients to use new colors
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${ds.primaryColor} 0%, ${ds.secondaryColor} 100%)`);
  root.style.setProperty('--gradient-card', `linear-gradient(145deg, ${ds.primaryColor}1A 0%, ${ds.secondaryColor}0D 100%)`);
  root.style.setProperty('--gradient-mesh', `radial-gradient(ellipse at top, ${ds.primaryColor}4D, transparent 50%)`);
  
  // Update selection and focus colors
  const style = document.createElement('style');
  style.textContent = `
    ::selection {
      background: ${ds.primaryColor} !important;
      color: #FFFFFF !important;
    }
    
    :focus-visible {
      outline: 2px solid ${ds.primaryColor} !important;
      outline-offset: 2px !important;
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${ds.textMuted} !important;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${ds.textSecondary} !important;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, ${ds.primaryColor} 0%, ${ds.secondaryColor} 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
  `;
  
  // Remove existing dynamic styles and add new ones
  const existingStyle = document.getElementById('dynamic-design-system');
  if (existingStyle) {
    existingStyle.remove();
  }
  style.id = 'dynamic-design-system';
  document.head.appendChild(style);

  // Apply custom variables if they exist
  if (ds.customVariables) {
    try {
      const customVars = JSON.parse(ds.customVariables);
      Object.entries(customVars).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
    } catch (error) {
      console.warn('Failed to parse custom variables:', error);
    }
  }

  // Apply theme mode class
  root.setAttribute('data-theme', 'light'); // Default to light theme
  
};

const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const loadDesignSystem = async () => {
      try {
        const response = await fetch('/api/admin/design-system');
        const result = await response.json();

        if (result.success) {
          applyDesignSystemToRoot(result.data);
        } else {
          console.warn('Failed to load design system:', result.message);
        }
      } catch (error) {
        console.error('Failed to fetch design system:', error);
      }
    };

    loadDesignSystem();
  }, []);

  return <>{children}</>;
};

export default DesignSystemProvider; 
