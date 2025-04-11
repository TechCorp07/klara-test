// lib/env.js
const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
  ];
  
  // Check for required environment variables at build/startup time
  function validateEnv() {
    const missingVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );
  
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
  
  // Export variables with validation
  export const API_URL = process.env.NEXT_PUBLIC_API_URL;
  export const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY;
  export const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID;
  
  // Run validation in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    validateEnv();
  }
  