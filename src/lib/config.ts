import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters').optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Google Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Base URL
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  
  // Cron jobs
  CRON_SECRET: z.string().min(16, 'Cron secret must be at least 16 characters').optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// Type-safe config access
export type Config = z.infer<typeof envSchema>;

// Helper functions
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test'; 