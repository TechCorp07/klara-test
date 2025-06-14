// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/lib/auth/auth-provider';
import { config } from '@/lib/config';

// Use the Inter font
const inter = Inter({ subsets: ['latin'] });

// Define metadata for SEO
export const metadata: Metadata = {
  title: {
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
  description: 'Secure healthcare platform for patients, providers, and researchers.',
  applicationName: config.appName,
  referrer: 'origin-when-cross-origin',
  keywords: ['healthcare', 'medical', 'patient portal', 'HIPAA compliant', 'telemedicine'],
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
 * Root layout component for the entire application.
 * 
 * This component:
 * - Wraps the entire app in the AuthProvider for authentication state
 * - Sets up global font and styling
 * - Provides metadata for SEO
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}