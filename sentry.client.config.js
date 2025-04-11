// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://your-sentry-dsn-here@o0.ingest.sentry.io/0',
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling based on transaction name
      tracesSampler: samplingContext => {
        const name = samplingContext.transactionContext.name;
        
        // Assign sample rates based on type of transaction
        if (name.includes('api')) {
          return 0.8; // Sample most API calls
        }
        if (name.includes('auth')) {
          return 1.0; // Always trace auth operations
        }
        if (name.includes('healthcheck')) {
          return 0.1; // Minimal sampling of health checks
        }
        
        // Default rate for other transactions
        return 0.5;
      }
    }),
    new Sentry.Replay({
      // Additional options for Replay
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Enable JavaScript source map support
  enabled: process.env.NODE_ENV === 'production',
  
  // Additional configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERSION || 'dev',
  
  // HIPAA considerations - disable PII collection
  sendDefaultPii: false,
  
  // Custom tags for all events
  initialScope: {
    tags: {
      app: 'klararety-web',
    },
  },
  
  // Only capture errors on specified domains to avoid noise
  allowUrls: [
    // Only capture errors from your app's domain
    window.location.hostname,
  ],
  
  // Sanitize error data
  beforeSend(event) {
    // Remove PII/PHI from error data
    if (event.request && event.request.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    
    // Sanitize URLs to remove sensitive info
    if (event.request && event.request.url) {
      try {
        const url = new URL(event.request.url);
        
        // Remove sensitive query params
        ['token', 'password', 'access_token', 'refresh_token'].forEach(param => {
          if (url.searchParams.has(param)) {
            url.searchParams.set(param, '[REDACTED]');
          }
        });
        
        event.request.url = url.toString();
      } catch (e) {
        // If URL parsing fails, redact the entire URL to be safe
        event.request.url = '[REDACTED URL]';
      }
    }
    
    return event;
  },
});
