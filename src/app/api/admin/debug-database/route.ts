import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Debugging database connection and settings...');
    
    // Test database connection
    let dbStatus = 'unknown';
    try {
      await prisma.$connect();
      dbStatus = 'connected';
      console.log('✅ Database connection successful');
    } catch (dbError) {
      dbStatus = 'failed';
      console.error('❌ Database connection failed:', dbError);
    }
    
    // Test site settings query
    let settingsStatus = 'unknown';
    let settings = null;
    try {
      settings = await prisma.siteSettings.findFirst();
      settingsStatus = 'loaded';
      console.log('✅ Site settings loaded successfully');
    } catch (settingsError) {
      settingsStatus = 'failed';
      console.error('❌ Site settings query failed:', settingsError);
    }
    
    // Test Cloudinary settings specifically
    let cloudinaryStatus = 'unknown';
    let cloudinaryConfig = null;
    try {
      if (settings) {
        cloudinaryConfig = {
          enabled: settings.cloudinaryEnabled,
          hasCloudName: !!settings.cloudinaryCloudName,
          hasApiKey: !!settings.cloudinaryApiKey,
          hasApiSecret: !!settings.cloudinaryApiSecret,
          cloudName: settings.cloudinaryCloudName,
          apiKey: settings.cloudinaryApiKey ? `${settings.cloudinaryApiKey.substring(0, 8)}...` : null,
          apiSecret: settings.cloudinaryApiSecret ? '***' : null
        };
        
        if (settings.cloudinaryEnabled && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
          cloudinaryStatus = 'configured';
        } else {
          cloudinaryStatus = 'incomplete';
        }
      } else {
        cloudinaryStatus = 'no_settings';
      }
    } catch (cloudinaryError) {
      cloudinaryStatus = 'error';
      console.error('❌ Cloudinary config check failed:', cloudinaryError);
    }
    
    // Test environment variables
    const envVars = {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? `${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...` : null,
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' : null
    };
    
    const response = {
      success: true,
      data: {
        database: {
          status: dbStatus,
          timestamp: new Date().toISOString()
        },
        settings: {
          status: settingsStatus,
          hasSettings: !!settings,
          cloudinary: cloudinaryConfig
        },
        environment: {
          variables: envVars
        },
        cloudinary: {
          status: cloudinaryStatus,
          config: cloudinaryConfig
        }
      }
    };
    
    console.log('📊 Debug results:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 