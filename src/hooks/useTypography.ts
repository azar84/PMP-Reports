import { useDesignSystem } from './useDesignSystem';

export const useTypography = () => {
  const { designSystem } = useDesignSystem();

  // Typography scale based on design system
  const getTypographyScale = () => {
    if (!designSystem) return {};
    
    const baseSize = parseFloat(designSystem.fontSizeBase.replace('px', ''));
    
    return {
      // Heading scales
      'heading-1': {
        fontSize: `${baseSize * 2.5}px`, // 40px if base is 16px
        lineHeight: '1.2',
        fontWeight: designSystem.fontWeightBold,
        fontFamily: designSystem.fontFamily
      },
      'heading-2': {
        fontSize: `${baseSize * 2}px`, // 32px if base is 16px
        lineHeight: '1.3',
        fontWeight: designSystem.fontWeightBold,
        fontFamily: designSystem.fontFamily
      },
      'heading-3': {
        fontSize: `${baseSize * 1.5}px`, // 24px if base is 16px
        lineHeight: '1.4',
        fontWeight: designSystem.fontWeightMedium,
        fontFamily: designSystem.fontFamily
      },
      'heading-4': {
        fontSize: `${baseSize * 1.25}px`, // 20px if base is 16px
        lineHeight: '1.5',
        fontWeight: designSystem.fontWeightMedium,
        fontFamily: designSystem.fontFamily
      },
      // Body text
      'body-large': {
        fontSize: `${baseSize * 1.125}px`, // 18px if base is 16px
        lineHeight: designSystem.lineHeightBase,
        fontWeight: designSystem.fontWeightNormal,
        fontFamily: designSystem.fontFamily
      },
      'body': {
        fontSize: designSystem.fontSizeBase,
        lineHeight: designSystem.lineHeightBase,
        fontWeight: designSystem.fontWeightNormal,
        fontFamily: designSystem.fontFamily
      },
      'body-small': {
        fontSize: `${baseSize * 0.875}px`, // 14px if base is 16px
        lineHeight: '1.4',
        fontWeight: designSystem.fontWeightNormal,
        fontFamily: designSystem.fontFamily
      },
      // Special text
      'caption': {
        fontSize: `${baseSize * 0.75}px`, // 12px if base is 16px
        lineHeight: '1.3',
        fontWeight: designSystem.fontWeightNormal,
        fontFamily: designSystem.fontFamily
      },
      'button': {
        fontSize: designSystem.fontSizeBase,
        lineHeight: '1',
        fontWeight: designSystem.fontWeightMedium,
        fontFamily: designSystem.fontFamily
      },
      'code': {
        fontSize: designSystem.fontSizeBase,
        lineHeight: designSystem.lineHeightBase,
        fontWeight: designSystem.fontWeightNormal,
        fontFamily: designSystem.fontFamilyMono
      }
    };
  };

  // Get text color classes
  const getTextColors = () => {
    return {
      primary: { color: 'var(--color-text-primary)' },
      secondary: { color: 'var(--color-text-secondary)' },
      muted: { color: 'var(--color-text-muted)' },
      accent: { color: 'var(--color-primary)' },
      white: { color: '#FFFFFF' },
      inherit: { color: 'inherit' }
    };
  };

  // Get typography classes for CSS-in-JS
  const getTypographyStyles = (variant: string, color: string = 'primary') => {
    const scales = getTypographyScale();
    const colors = getTextColors();
    
    return {
      ...scales[variant as keyof typeof scales],
      ...colors[color as keyof typeof colors]
    };
  };

  // Get CSS variables for inline styles
  const getCSSVariables = () => {
    return {
      fontFamilySans: 'var(--font-family-sans)',
      fontFamilyMono: 'var(--font-family-mono)',
      fontSizeBase: 'var(--font-size-base)',
      lineHeightBase: 'var(--line-height-base)',
      textPrimary: 'var(--color-text-primary)',
      textSecondary: 'var(--color-text-secondary)',
      textMuted: 'var(--color-text-muted)',
      colorPrimary: 'var(--color-primary)'
    };
  };

  return {
    getTypographyScale,
    getTextColors,
    getTypographyStyles,
    getCSSVariables,
    designSystem
  };
}; 