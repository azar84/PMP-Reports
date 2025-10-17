import { prisma } from './db';
import scheduler from './scheduler';

/**
 * Initialize server configuration by loading settings from database
 * This runs once when the server starts
 */
export async function initializeServerConfig() {
  try {
    console.log('🚀 Initializing server configuration...');
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connection established');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error('Database connection failed during server initialization');
    }
    
    // Load site settings from database
    const settings = await prisma.siteSettings.findFirst();
    console.log('📊 Site settings loaded:', {
      hasSettings: !!settings,
      cloudinaryEnabled: settings?.cloudinaryEnabled,
      hasCloudName: !!settings?.cloudinaryCloudName,
      hasApiKey: !!settings?.cloudinaryApiKey,
      hasApiSecret: !!settings?.cloudinaryApiSecret
    });
    
    if (settings?.cloudinaryEnabled && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
      // Set Cloudinary environment variables from database
      process.env.CLOUDINARY_CLOUD_NAME = settings.cloudinaryCloudName;
      process.env.CLOUDINARY_API_KEY = settings.cloudinaryApiKey;
      process.env.CLOUDINARY_API_SECRET = settings.cloudinaryApiSecret;
      
      console.log('✅ Cloudinary configuration loaded from database');
      console.log(`   Cloud Name: ${settings.cloudinaryCloudName}`);
      console.log(`   API Key: ${settings.cloudinaryApiKey.substring(0, 8)}...`);
      
      // Test Cloudinary configuration immediately
      try {
        const { configureCloudinary } = await import('./cloudinary');
        const isConfigured = await configureCloudinary();
        if (isConfigured) {
          console.log('✅ Cloudinary configuration verified successfully');
        } else {
          console.error('❌ Cloudinary configuration verification failed');
        }
      } catch (cloudinaryError) {
        console.error('❌ Failed to verify Cloudinary configuration:', cloudinaryError);
      }
    } else {
      console.log('⚠️  Cloudinary not configured in database, using environment variables if available');
      
      // Test environment variables if available
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        console.log('✅ Cloudinary environment variables found');
        try {
          const { configureCloudinary } = await import('./cloudinary');
          const isConfigured = await configureCloudinary();
          if (isConfigured) {
            console.log('✅ Cloudinary configuration verified successfully');
          } else {
            console.error('❌ Cloudinary configuration verification failed');
          }
        } catch (cloudinaryError) {
          console.error('❌ Failed to verify Cloudinary configuration:', cloudinaryError);
        }
      } else {
        console.log('⚠️  No Cloudinary environment variables found');
      }
    }
    
    // Load other configurations as needed
    // if (settings?.baseUrl) {
    //   process.env.NEXT_PUBLIC_BASE_URL = settings.baseUrl;
    //   console.log(`✅ Base URL set from database: ${settings.baseUrl}`);
    // }
    
    // Start the built-in scheduler
    try {
      scheduler.start();
      console.log('✅ Built-in scheduler started successfully');
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
    }
    
    console.log('✅ Server configuration initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize server configuration:', error);
    console.log('⚠️  Using environment variables as fallback');
  }
}

/**
 * Get Cloudinary configuration (for runtime use)
 */
export async function getCloudinaryConfig() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.cloudinaryEnabled || !settings.cloudinaryCloudName || !settings.cloudinaryApiKey || !settings.cloudinaryApiSecret) {
      throw new Error('Cloudinary not configured in site settings');
    }

    return {
      cloud_name: settings.cloudinaryCloudName,
      api_key: settings.cloudinaryApiKey,
      api_secret: settings.cloudinaryApiSecret,
    };
  } catch (error) {
    console.error('Error getting Cloudinary config:', error);
    throw new Error('Cloudinary configuration not found');
  }
} 