// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { JWTAuthProvider, PermissionDebug } from '@/lib/auth';
import { config } from '@/lib/config';

// Use the Inter font for consistent typography
const inter = Inter({ subsets: ['latin'] });

// Define comprehensive metadata for SEO and application identity
export const metadata: Metadata = {
  title: {
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
  description: 'Secure healthcare platform for patients, providers, and researchers with HIPAA-compliant JWT authentication.',
  applicationName: config.appName,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'healthcare', 
    'medical', 
    'patient portal', 
    'HIPAA compliant', 
    'telemedicine',
    'JWT authentication',
    'secure healthcare platform',
    'electronic health records',
    'clinical research',
    'healthcare analytics'
  ],
  authors: [{ name: 'Klararety Healthcare' }],
  creator: 'Klararety Healthcare',
  publisher: 'Klararety Healthcare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/**
 * Authentication Error Boundary Component
 */
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

/**
 * Performance Monitoring Component
 */
function AuthPerformanceMonitor() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Monitor authentication performance
  React.useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log(`🚀 Auth system initialized in ${loadTime.toFixed(2)}ms`);
    };

    // Monitor when the auth system is ready
    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return null;
}

/**
 * Root Layout Component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href={config.apiBaseUrl} />
        <link rel="dns-prefetch" href={config.apiBaseUrl} />
        
        {/* Security headers for healthcare compliance */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https:;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* PWA manifest for mobile app experience */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={config.appName} />
        
        {/* Microsoft-specific meta tags */}
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      
      <body className={`${inter.className} h-full bg-gray-50`}>
        {/* Authentication Error Boundary */}
        <AuthErrorBoundary>
          {/* JWT Authentication Provider - Race Condition Free */}
          <JWTAuthProvider>
            {/* Main Application Content */}
            <div className="h-full">
              {children}
            </div>
            
            {/* Development Tools - Only in Development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <AuthPerformanceMonitor />
                <PermissionDebug />
              </>
            )}
          </JWTAuthProvider>
        </AuthErrorBoundary>
        
        {/* Global Scripts - Only if needed */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Performance monitoring in production
                window.addEventListener('load', function() {
                  const loadTime = performance.now();
                  console.log('App loaded in ' + loadTime.toFixed(2) + 'ms');
                });
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic'; // Required for authentication

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3B82F6',
};

export const loading = {
  eager: true,
};