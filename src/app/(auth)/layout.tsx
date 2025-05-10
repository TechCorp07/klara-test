// src/app/(auth)/layout.tsx
import React from 'react';
import { Metadata } from 'next';
import { config } from '@/lib/config';
import Image from 'next/image';

export const metadata: Metadata = {
  title: `Authentication | ${config.appName}`,
  description: 'Secure authentication for healthcare data access',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for authentication pages.
 * 
 * This layout provides a consistent structure for all authentication-related pages:
 * - Login
 * - Registration
 * - Password reset
 * - Email verification
 * - Two-factor authentication
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="fixed top-0 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Image 
                src="/images/logo.svg" 
                alt={config.appName}
                width={32} 
                height={32}
                className="h-8 w-auto" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://klararety.com/contact" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Support
              </a>
              <a 
                href={config.privacyUrl}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Privacy
              </a>
              <a 
                href={config.termsUrl}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <main className="pt-16 pb-12">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="https://twitter.com/klararety" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/klararety" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                HIPAA Compliant Healthcare Platform
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}