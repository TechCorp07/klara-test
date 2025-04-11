// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://your-sentry-dsn-here@o0.ingest.sentry.io/0',
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  
  // Enable JavaScript source map support
  enabled: process.env.NODE_ENV === 'production',
  
  // Additional configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERSION || 'dev',
  
  // HIPAA considerations - disable PII collection
  sendDefaultPii: false,
  
  // Custom tags for all events
  initialScope: {
    tags: {
      app: 'klararety-web',
    },
  },
  
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
        // URL parsing failed, redact entire URL
        event.request.url = '[REDACTED URL]';
      }
    }
    
    return event;
  },
});