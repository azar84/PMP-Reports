import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { SiteSettingsSchema, SiteSettingsUpdateSchema } from '@/lib/validations';

// GET - Retrieve current site settings
export async function GET() {
  try {
    let siteSettings = await prisma.siteSettings.findFirst();
    
    // Create default settings if none exist
    if (!siteSettings) {
      siteSettings = await prisma.siteSettings.create({
        data: {
          smtpEnabled: false,
          smtpPort: 587,
          smtpSecure: true,
          emailBrandingEnabled: true,
          emailLoggingEnabled: true,
          emailRateLimitPerHour: 100,
        },
      });
    }

    // Remove sensitive data before sending to client
    const { smtpPassword, ...safeSiteSettings } = siteSettings;

    const response = NextResponse.json({
      success: true,
      data: safeSiteSettings
    });
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update site settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      logoUrl, 
      faviconUrl, 
      faviconLightUrl, 
      faviconDarkUrl, 
      baseUrl,
      cloudinaryEnabled,
      cloudinaryCloudName,
      cloudinaryApiKey,
      cloudinaryApiSecret,
      sidebarBackgroundColor,
      sidebarTextColor,
      sidebarSelectedColor,
      sidebarHoverColor
    } = body;

    // Check if settings already exist
    const existingSettings = await prisma.siteSettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          logoUrl: logoUrl || existingSettings.logoUrl,
          faviconUrl: faviconUrl || existingSettings.faviconUrl,
          faviconLightUrl: faviconLightUrl || existingSettings.faviconLightUrl,
          faviconDarkUrl: faviconDarkUrl || existingSettings.faviconDarkUrl,
          baseUrl: baseUrl !== undefined ? baseUrl : existingSettings.baseUrl,
          cloudinaryEnabled: cloudinaryEnabled !== undefined ? cloudinaryEnabled : existingSettings.cloudinaryEnabled,
          cloudinaryCloudName: cloudinaryCloudName !== undefined ? cloudinaryCloudName : existingSettings.cloudinaryCloudName,
          cloudinaryApiKey: cloudinaryApiKey !== undefined ? cloudinaryApiKey : existingSettings.cloudinaryApiKey,
          cloudinaryApiSecret: cloudinaryApiSecret !== undefined ? cloudinaryApiSecret : existingSettings.cloudinaryApiSecret,
          sidebarBackgroundColor: sidebarBackgroundColor !== undefined ? sidebarBackgroundColor : existingSettings.sidebarBackgroundColor,
          sidebarTextColor: sidebarTextColor !== undefined ? sidebarTextColor : existingSettings.sidebarTextColor,
          sidebarSelectedColor: sidebarSelectedColor !== undefined ? sidebarSelectedColor : existingSettings.sidebarSelectedColor,
          sidebarHoverColor: sidebarHoverColor !== undefined ? sidebarHoverColor : existingSettings.sidebarHoverColor,
        }
      });
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          logoUrl,
          faviconUrl,
          faviconLightUrl,
          faviconDarkUrl,
          baseUrl: baseUrl || '',
          cloudinaryEnabled: cloudinaryEnabled || false,
          cloudinaryCloudName: cloudinaryCloudName || null,
          cloudinaryApiKey: cloudinaryApiKey || null,
          cloudinaryApiSecret: cloudinaryApiSecret || null,
          sidebarBackgroundColor: sidebarBackgroundColor || '#1F2937',
          sidebarTextColor: sidebarTextColor || '#E5E7EB',
          sidebarSelectedColor: sidebarSelectedColor || '#FFFFFF',
          sidebarHoverColor: sidebarHoverColor || '#D1D5DB',
          smtpEnabled: false,
          smtpPort: 587,
          smtpSecure: true,
          emailBrandingEnabled: true,
          emailLoggingEnabled: true,
          emailRateLimitPerHour: 100,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Site settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

// PUT - Update specific field
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PUT /api/admin/site-settings - Request body:', body);
    
    // Validate the request body for partial updates
    const validatedData = SiteSettingsUpdateSchema.parse(body);
    console.log('PUT /api/admin/site-settings - Validated data:', validatedData);

    // Get existing settings or create if none exist
    let existingSettings = await prisma.siteSettings.findFirst();
    
    if (!existingSettings) {
      // Create new settings
      const newSettings = await prisma.siteSettings.create({
        data: {
          ...validatedData,
          smtpEnabled: validatedData.smtpEnabled ?? false,
          smtpPort: validatedData.smtpPort ?? 587,
          smtpSecure: validatedData.smtpSecure ?? true,
          emailBrandingEnabled: validatedData.emailBrandingEnabled ?? true,
          emailLoggingEnabled: validatedData.emailLoggingEnabled ?? true,
          emailRateLimitPerHour: validatedData.emailRateLimitPerHour ?? 100,
        },
      });

      const { smtpPassword, ...safeSiteSettings } = newSettings;
      return NextResponse.json({
        success: true,
        data: safeSiteSettings,
        message: 'Site settings created successfully'
      });
    } else {
      // Update existing settings
      const updatedSettings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: validatedData,
      });

      const { smtpPassword, ...safeSiteSettings } = updatedSettings;
      return NextResponse.json({
        success: true,
        data: safeSiteSettings,
        message: 'Site settings updated successfully'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
} 