/**
 * @type {import('next').NextConfig}
 * 
 * Next.js configuration file for Klararety Healthcare Platform
 * This file contains settings for:
 * - Security headers (important for HIPAA compliance)
 * - Environment variable handling
 * - Image optimization
 * - Redirects and rewrites
 * - Performance optimizations
 */
const path = require('path');

const nextConfig = {
    // React strict mode for highlighting potential problems
    reactStrictMode: true,
    
    // Output option - can be 'standalone' for containerized deployments
    output: 'standalone',
    
    // Set the base path if not served from the root
    // basePath: '',
    
    // Trailing slashes configuration
    trailingSlash: false,
    
    // Configure page extensions
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    
    // Configure image optimization
    images: {
      domains: [
        'klararety.com',
        'assets.klararety.com',
        'secure.gravatar.com',
        'localhost', // ADDED: For local development
        'api.klararety.com', // ADDED: For API images
      ],
      formats: ['image/webp', 'image/avif'], // ADDED: AVIF format for better compression
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60, // Cache time in seconds
    },
    
    // Add security headers for HIPAA compliance
    async headers() {
      return [
        {
          // Apply to all routes
          source: '/(.*)',
          headers: [
            // Prevent XSS attacks
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            // Prevent MIME type sniffing
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            // Prevent clickjacking
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            // Content Security Policy
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                font-src 'self' https://fonts.gstatic.com;
                img-src 'self' data: https:;
                connect-src 'self' https://api.klararety.com http://localhost:8000 http://127.0.0.1:8000/;
                frame-src 'self';
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'none';
                block-all-mixed-content;
                upgrade-insecure-requests;
              `.replace(/\s+/g, ' ').trim(),
            },
            // Force HTTPS
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
            // Referrer policy
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            // Feature policy
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
            },
          ],
        },
        // ADDED: Specific cache control headers for auth pages to prevent refresh loops
        {
          source: '/login',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
        {
          source: '/dashboard',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
          ],
        },
        {
          source: '/',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          ],
        },
      ];
    },
    
    // Custom redirects
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
        {
          source: '/login-page',
          destination: '/login',
          permanent: true,
        },
        {
          source: '/register',
          destination: '/register',
          permanent: true,
        },
        // ADDED: Handle old auth routes that might be causing issues
        {
          source: '/login',
          destination: '/login',
          permanent: true,
        },
        {
          source: '/logout',
          destination: '/login',
          permanent: false,
        },
      ];
    },
    
    // Custom rewrites for API endpoints if needed
    async rewrites() {
      return {
        beforeFiles: [
          // ADDED: Handle Chrome DevTools requests that cause 404s
          {
            source: '/.well-known/appspecific/:path*',
            destination: '/api/not-found'
          },
          {
            source: '/.well-known/:path*', 
            destination: '/api/not-found'
          },
        ],
        afterFiles: [
          // These rewrites happen after pages are matched
          // Useful for API proxying
          {
            source: '/health',
            destination: '/system/health-check',
          },
        ],
        fallback: [
          // These rewrites happen when no page files are matched
        ],
      };
    },
    
    // Enable SWC compiler for faster builds
    swcMinify: true,
    
    // ADDED: Disable source maps in production for better performance and security
    productionBrowserSourceMaps: false,
    
    // Configure internationalization if needed
    i18n: {
      locales: ['en-US', 'es-US', 'fr-CA'],
      defaultLocale: 'en-US',
      // Set to true to automatically detect user locale from browser/headers
      localeDetection: false,
    },
    
    // Configure compiler options
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === 'production',
      // Enable emotion if using that library
      emotion: false,
      // Control React server components (RSC)
      reactRemoveProperties: process.env.NODE_ENV === 'production',
      relay: {
        // Relay compiler if using Relay
        src: './src',
        artifactDirectory: './__generated__',
        language: 'typescript',
      },
    },
    
    // Configure webpack if needed
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Add custom webpack configurations here if needed
      // This is useful for adding custom loaders or plugins
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@': path.resolve(__dirname, 'src'),
      };

      // Important for handling large healthcare data files
      config.performance = {
        ...config.performance,
        maxAssetSize: 1000000, // Increased asset size limit
        maxEntrypointSize: 1000000, // Increased entrypoint size limit
      };
      
      // Apply HIPAA-compliant source maps in production (more secure)
      if (!dev && !isServer) {
        config.devtool = 'source-map';
      }
      
      // Return modified config
      return config;
    },
    
    // Configure environment variables to be exposed to the browser
    env: {
      NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
      NEXT_PUBLIC_APP_NAME: 'Klararety Healthcare Platform',
    },
    
    // Experimental features
    experimental: {
      serverComponentsExternalPackages: [],
      // ADDED: Package import optimization for better performance
      optimizePackageImports: ['lucide-react'],
    },
    
  };
  
  module.exports = nextConfig;