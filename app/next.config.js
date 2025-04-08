/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['localhost', 'api.klararety.com'],
    },
    env: {
      API_URL: process.env.API_URL,
      ZOOM_SDK_KEY: process.env.ZOOM_SDK_KEY,
      WITHINGS_CLIENT_ID: process.env.WITHINGS_CLIENT_ID,
    },
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: '/:path*',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            }
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  