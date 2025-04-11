// app/layout.jsx
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import { Providers } from './providers';
import SessionTimeout from '@/components/auth/SessionTimeout';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/global.css';

// Load Inter font with specific subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Metadata for the application
 */
export const metadata = {
  title: {
    default: 'Klararety Healthcare Platform',
    template: '%s | Klararety Healthcare'
  },
  description: 'Secure healthcare platform for patients and providers',
  keywords: ['healthcare', 'telehealth', 'medical records', 'HIPAA compliant'],
  authors: [{ name: 'Klararety Healthcare' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: process.env.NODE_ENV === 'production',
    follow: process.env.NODE_ENV === 'production',
  },
  applicationName: 'Klararety Healthcare',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#0066cc',
  creator: 'Klararety Healthcare Team',
  publisher: 'Klararety Healthcare',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://app.klararety.com'
  ),
  openGraph: {
    title: 'Klararety Healthcare Platform',
    description: 'Secure healthcare platform for patients and providers',
    url: 'https://app.klararety.com',
    siteName: 'Klararety Healthcare',
    locale: 'en_US',
    type: 'website',
  },
};

/**
 * Root layout component that wraps all pages
 * This provides the authentication context, React Query, and Toast notifications
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          {children}
          <SessionTimeout />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
        
        {/* Security headers script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Add security measures for HIPAA compliance
              if (window.opener && window.opener !== window) {
                // Prevent clickjacking by disallowing the page to be embedded in a frame
                window.opener = null;
              }
              
              // CSP reporting
              window.addEventListener('securitypolicyviolation', function(e) {
                console.error('CSP violation:', e);
                // Would normally send to a reporting endpoint
              });
              
              // Record the session start time
              if (!sessionStorage.getItem('sessionStartTime')) {
                sessionStorage.setItem('sessionStartTime', Date.now().toString());
              }
            `,
          }}
        />
      </body>
    </html>
  );
}