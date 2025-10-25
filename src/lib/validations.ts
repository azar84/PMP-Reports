import { z } from 'zod';

// Common validations
export const IdSchema = z.number().int().positive();
export const SlugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format');
export const UrlSchema = z.string().url('Invalid URL format');

// Helper for optional string fields that can be empty
const optionalString = z.string().optional().nullable().transform(val => val === '' ? null : val);
const optionalUrl = z.string().optional().nullable().transform(val => val === '' ? null : val).refine(val => {
  if (val === null || val === undefined) return true;
  // Allow data URIs for base64 encoded images
  if (val.startsWith('data:')) return true;
  // Allow relative paths (starting with /)
  if (val.startsWith('/')) return true;
  // Allow regular URLs
  return z.string().url().safeParse(val).success;
}, { message: "Invalid URL format" });
const optionalEmail = z.string().optional().nullable().transform(val => val === '' ? null : val).refine(val => {
  if (val === null || val === undefined) return true;
  return z.string().email().safeParse(val).success;
}, { message: "Invalid email format" });

// Site Settings Schema
export const SiteSettingsSchema = z.object({
  logoUrl: optionalUrl,
  logoLightUrl: optionalUrl,
  logoDarkUrl: optionalUrl,
  faviconUrl: optionalUrl,
  faviconLightUrl: optionalUrl,
  faviconDarkUrl: optionalUrl,
  
  // Email Configuration
  smtpEnabled: z.boolean().optional(),
  smtpHost: optionalString,
  smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
  smtpSecure: z.boolean().optional(),
  smtpUsername: optionalString,
  smtpPassword: optionalString,
  smtpFromEmail: optionalEmail,
  smtpFromName: optionalString,
  smtpReplyTo: optionalEmail,
  
  // Email Templates Configuration
  emailSignature: optionalString,
  emailFooterText: optionalString,
  emailBrandingEnabled: z.boolean().optional(),
  
  // Email Notification Settings
  adminNotificationEmail: optionalEmail,
  emailLoggingEnabled: z.boolean().optional(),
  emailRateLimitPerHour: z.number().int().min(1).max(1000).optional().nullable(),
  
  // Social Media Links
  socialFacebook: optionalUrl,
  socialTwitter: optionalUrl,
  socialLinkedin: optionalUrl,
  socialInstagram: optionalUrl,
  socialYoutube: optionalUrl,
  
  // Contact Information
  companyPhone: optionalString,
  companyEmail: optionalEmail,
  companyAddress: optionalString,
  
  // Footer Settings
  footerCompanyName: optionalString,
  footerCompanyDescription: optionalString,
  footerNewsletterFormId: z.number().int().positive().optional().nullable(),
  footerCopyrightMessage: optionalString,
  footerMenuIds: optionalString,
  footerShowContactInfo: z.boolean().optional(),
  footerShowSocialLinks: z.boolean().optional(),
  footerBackgroundColor: optionalString,
  footerTextColor: optionalString,
  
  // SEO & Analytics
  baseUrl: optionalUrl,
  gaMeasurementId: optionalString,
  gtmContainerId: optionalString,
  gtmEnabled: z.boolean().optional(),
  
  // Cloudinary Configuration
  cloudinaryCloudName: optionalString,
  cloudinaryApiKey: optionalString,
  cloudinaryApiSecret: optionalString,
  cloudinaryUploadPreset: optionalString,
  cloudinaryEnabled: z.boolean().optional(),
  
  // Sidebar Configuration
  sidebarBackgroundColor: optionalString,
  sidebarTextColor: optionalString,
  sidebarSelectedColor: optionalString,
  sidebarHoverColor: optionalString,
  
  // Currency Configuration
  currencySymbol: optionalString,
});

export const SiteSettingsUpdateSchema = SiteSettingsSchema.partial();

// API Response Type
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Validation helper function
export function validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Media Library Schemas
export const CreateMediaLibrarySchema = z.object({
  filename: z.string().min(1).max(255),
  title: optionalString,
  description: optionalString,
  alt: optionalString,
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  duration: z.number().positive().optional().nullable(),
  originalUrl: z.string().url(),
  localPath: optionalString,
  publicUrl: z.string().url(),
  thumbnailUrl: optionalUrl,
  folderId: z.number().int().positive().optional().nullable(),
  tags: optionalString,
  uploadSource: z.enum(['upload', 'url', 'cloudinary']).optional(),
  uploadedBy: optionalString,
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const UpdateMediaLibrarySchema = z.object({
  id: z.number().int().positive(),
  filename: z.string().min(1).max(255).optional(),
  title: optionalString,
  description: optionalString,
  alt: optionalString,
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  mimeType: z.string().min(1).max(100).optional(),
  fileSize: z.number().int().positive().optional(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  duration: z.number().positive().optional().nullable(),
  originalUrl: z.string().url().optional(),
  localPath: optionalString,
  publicUrl: z.string().url().optional(),
  thumbnailUrl: optionalUrl,
  folderId: z.number().int().positive().optional().nullable(),
  tags: optionalString,
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// Media Folder Schemas
export const CreateMediaFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: optionalString,
  parentId: z.number().int().positive().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateMediaFolderSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  description: optionalString,
  parentId: z.number().int().positive().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// Media Usage Schema
export const CreateMediaUsageSchema = z.object({
  mediaId: z.number().int().positive(),
  entityType: z.string().min(1).max(50),
  entityId: z.number().int().positive(),
  fieldName: z.string().min(1).max(100),
});

// Media Upload/Import Schemas
export const MediaUploadSchema = z.object({
  file: z.instanceof(File),
  folderId: z.number().int().positive().optional().nullable(),
  title: optionalString,
  alt: optionalString,
  description: optionalString,
});

export const MediaUrlImportSchema = z.object({
  url: z.string().url(),
  folderId: z.number().int().positive().optional().nullable(),
  title: optionalString,
  alt: optionalString,
  description: optionalString,
  tags: z.array(z.string()).optional(),
});

// Media Search Schema
export const MediaSearchSchema = z.object({
  query: z.string().optional(),
  fileType: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  folderId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'fileSize']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});
