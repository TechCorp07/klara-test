// src/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { JWTAuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Klararety - Healthcare Platform',
  description: 'Secure healthcare platform for patients, providers, and researchers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JWTAuthProvider>
          {children}
        </JWTAuthProvider>
      </body>
    </html>
  );
}