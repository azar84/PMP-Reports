'use client';

import { useState, useEffect } from 'react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
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
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
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

export const useDesignSystem = () => {
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesignSystem = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/design-system');
        const result = await response.json();

        if (result.success) {
          setDesignSystem(result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to load design system');
        }
      } catch (err) {
        console.error('Failed to fetch design system:', err);
        setError('Failed to load design system');
      } finally {
        setLoading(false);
      }
    };

    fetchDesignSystem();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/design-system');
      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load design system');
      }
    } catch (err) {
      console.error('Failed to fetch design system:', err);
      setError('Failed to load design system');
    } finally {
      setLoading(false);
    }
  };

  return {
    designSystem,
    loading,
    error,
    refetch
  };
};

// Helper function to get theme defaults for form initialization
export const getThemeDefaults = (designSystem: DesignSystem | null) => {
  if (!designSystem) {
    // Fallback defaults if design system isn't loaded yet (dark theme)
    return {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      backgroundPrimary: '#1A1A1A',
      backgroundSecondary: '#2A2A2A',
      backgroundDark: '#0A0A0A',
      headerBackgroundColor: '#2A2A2A',
      sidebarHeaderBackgroundColor: '#2A2A2A',
      sidebarBackgroundColor: '#0A0A0A',
      textPrimary: '#4B5563',
      textSecondary: '#9CA3AF',
      textMuted: '#D1D5DB',
      headerTextColor: '#4B5563',
      sidebarTextColor: '#4B5563',
      sidebarHeaderColor: '#4B5563',
      borderStrong: '#1F2937'
    };
  }

  return {
    primaryColor: designSystem.primaryColor,
    secondaryColor: designSystem.secondaryColor,
    backgroundPrimary: designSystem.backgroundPrimary,
    backgroundSecondary: designSystem.backgroundSecondary,
    backgroundDark: designSystem.backgroundDark,
    headerBackgroundColor: designSystem.headerBackgroundColor,
    sidebarHeaderBackgroundColor: designSystem.sidebarHeaderBackgroundColor,
    sidebarBackgroundColor: designSystem.sidebarBackgroundColor,
    textPrimary: designSystem.textPrimary,
    textSecondary: designSystem.textSecondary,
    textMuted: designSystem.textMuted,
    headerTextColor: designSystem.headerTextColor,
    sidebarTextColor: designSystem.sidebarTextColor,
    sidebarHeaderColor: designSystem.sidebarHeaderColor
  };
};

// Helper function to get reliable admin panel colors (always light theme)
export const getAdminPanelColors = (designSystem?: DesignSystem | null) => {
  if (designSystem) {
    return {
      textPrimary: designSystem.textPrimary,
      textSecondary: designSystem.textSecondary,
      textMuted: designSystem.textMuted,
      headerTextColor: designSystem.headerTextColor,
      sidebarTextColor: designSystem.sidebarTextColor,
      sidebarHeaderColor: designSystem.sidebarHeaderColor,
      headerBackgroundColor: designSystem.headerBackgroundColor,
      sidebarHeaderBackgroundColor: designSystem.sidebarHeaderBackgroundColor,
      sidebarBackgroundColor: designSystem.sidebarBackgroundColor,
      background: designSystem.backgroundPrimary,
      backgroundSecondary: designSystem.backgroundSecondary,
      border: designSystem.borderLight || '#E5E7EB'
    };
  }

  // Fallback to design system defaults (dark theme)
  return {
    textPrimary: '#4B5563',
    textSecondary: '#9CA3AF',
    textMuted: '#D1D5DB',
    headerTextColor: '#4B5563',
    sidebarTextColor: '#4B5563',
    sidebarHeaderColor: '#4B5563',
    headerBackgroundColor: '#2A2A2A',
    sidebarHeaderBackgroundColor: '#2A2A2A',
    sidebarBackgroundColor: '#0A0A0A',
    background: '#1A1A1A',
    backgroundSecondary: '#2A2A2A',
    backgroundDark: '#0A0A0A',
    border: '#1F2937',
    primary: '#3B82F6',
    borderStrong: '#1F2937'
  };
};

// Helper function to get admin panel colors with design system priority
export const getAdminPanelColorsWithDesignSystem = (designSystem: DesignSystem | null) => {
  return {
    // Text Colors
    textPrimary: designSystem?.textPrimary || '#1F2937',
    textSecondary: designSystem?.textSecondary || '#6B7280',
    textMuted: designSystem?.textMuted || '#9CA3AF',
    
    // Background Colors
    backgroundPrimary: designSystem?.backgroundPrimary || '#FFFFFF',
    backgroundSecondary: designSystem?.backgroundSecondary || '#F9FAFB',
    backgroundDark: designSystem?.backgroundDark || '#1F2937',
    
    // Brand Colors
    primary: designSystem?.primaryColor || '#5243E9',
    secondary: designSystem?.secondaryColor || '#7C3AED',
    accent: designSystem?.accentColor || '#06B6D4',
    
    // Semantic Colors
    success: designSystem?.successColor || '#10B981',
    warning: designSystem?.warningColor || '#F59E0B',
    error: designSystem?.errorColor || '#EF4444',
    info: designSystem?.infoColor || '#3B82F6',
    
    // Neutral Colors
    borderLight: designSystem?.borderLight || '#E5E7EB',
    borderStrong: designSystem?.borderStrong || '#374151',
    
    // Border Colors
    border: designSystem?.borderLight || '#E5E7EB'
  };
}; 