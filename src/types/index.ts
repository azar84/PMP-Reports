// Core API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Site Settings Types
export interface SiteSettings {
  id: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  smtpEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
  smtpReplyTo: string | null;
  emailSignature: string | null;
  emailFooterText: string | null;
  emailBrandingEnabled: boolean;
  adminNotificationEmail: string | null;
  emailLoggingEnabled: boolean;
  emailRateLimitPerHour: number | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyAddress: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  footerNewsletterFormId: number | null;
  footerCopyrightMessage: string | null;
  footerMenuIds: string | null;
  footerShowContactInfo: boolean;
  footerShowSocialLinks: boolean;
  footerCompanyName: string | null;
  footerCompanyDescription: string | null;
  footerBackgroundColor: string | null;
  footerTextColor: string | null;
  baseUrl: string | null;
  gaMeasurementId: string | null;
  gtmContainerId: string | null;
  gtmEnabled: boolean;
  cloudinaryApiKey: string | null;
  cloudinaryApiSecret: string | null;
  cloudinaryCloudName: string | null;
  cloudinaryEnabled: boolean;
  cloudinaryUploadPreset: string | null;
  sidebarBackgroundColor: string | null;
  sidebarHoverColor: string | null;
  sidebarSelectedColor: string | null;
  sidebarTextColor: string | null;
  currencySymbol: string | null;
  vatPercent: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Design System Types
export interface DesignSystem {
  id: number;
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  borderLight: string;
  borderStrong: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  headerBackgroundColor: string;
  sidebarHeaderBackgroundColor: string;
  sidebarBackgroundColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerTextColor: string;
  sidebarTextColor: string;
  sidebarHeaderColor: string;
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;
  themeMode: string;
  customVariables: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Media Library Types
export interface MediaItem {
  id: number;
  filename: string;
  title: string | null;
  description: string | null;
  alt: string | null;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  originalUrl: string;
  localPath: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  folderId: number | null;
  tags: string | null;
  uploadSource: string;
  uploadedBy: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  folder?: MediaFolder;
}

export interface MediaFolder {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: MediaFolder;
  children?: MediaFolder[];
  media?: MediaItem[];
  _count?: {
    media: number;
    children: number;
  };
}

export interface MediaUsage {
  id: number;
  mediaId: number;
  entityType: string;
  entityId: number;
  fieldName: string;
  createdAt: Date;
  media: MediaItem;
}

// Admin User Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Utility Types
export type Theme = 'light' | 'dark' | 'system';
export type Device = 'mobile' | 'tablet' | 'desktop';

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
