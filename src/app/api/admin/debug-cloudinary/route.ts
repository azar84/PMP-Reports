import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCloudinaryConfig, configureCloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    console.log('🔍 Starting Cloudinary debug...');
    
    const debugInfo = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        settings: null as any,
        error: null as string | null
      },
      cloudinary: {
        configured: false,
        config: null as any,
        error: null as string | null
      },
      environmentVariables: {
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    };

    // Test database connection
    try {
      await prisma.$connect();
      debugInfo.database.connected = true;
      
      // Try to get site settings
      try {
        const settings = await prisma.siteSettings.findFirst();
        debugInfo.database.settings = {
          hasSettings: !!settings,
          cloudinaryEnabled: settings?.cloudinaryEnabled,
          hasCloudName: !!settings?.cloudinaryCloudName,
          hasApiKey: !!settings?.cloudinaryApiKey,
          hasApiSecret: !!settings?.cloudinaryApiSecret
        };
      } catch (settingsError) {
        debugInfo.database.error = settingsError instanceof Error ? settingsError.message : 'Unknown error';
      }
    } catch (dbError) {
      debugInfo.database.error = dbError instanceof Error ? dbError.message : 'Unknown error';
    }

    // Test Cloudinary configuration
    try {
      const config = await getCloudinaryConfig();
      debugInfo.cloudinary.config = config ? {
        hasCloudName: !!config.cloud_name,
        hasApiKey: !!config.api_key,
        hasApiSecret: !!config.api_secret
      } : null;
      
      if (config) {
        const isConfigured = await configureCloudinary();
        debugInfo.cloudinary.configured = isConfigured;
      }
    } catch (cloudinaryError) {
      debugInfo.cloudinary.error = cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      data: debugInfo
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 