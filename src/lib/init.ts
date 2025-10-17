import { initializeServerConfig } from './serverInit';

// Initialize server configuration when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeServerConfig().catch(console.error);
} 