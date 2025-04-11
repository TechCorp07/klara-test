/** @type {import('next').NextConfig} */
// This file sets up the required configuration for using Sentry with Next.js.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  images: {
    domains: ['localhost', 'api.klararety.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.klararety.com; frame-src 'self'" },
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
    ];
  },

  // Optimize performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Output standalone build for better deployment options
  output: 'standalone',
};

// Validate environment variables
const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];
const missingEnvVars = requiredEnvVars.filter(
  envVar => process.env[envVar] === undefined
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Sentry webpack plugin configuration
const sentryWebpackPluginOptions = {
  // Additional options for the Sentry webpack plugin
  silent: true, // Suppresses all logs
  release: process.env.NEXT_PUBLIC_VERSION || 'dev',
  
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions
);