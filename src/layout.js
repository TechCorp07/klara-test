import { Suspense } from 'react';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SessionTimeout from '@/components/auth/SessionTimeout';
import Header from '@/components/layout/Header';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Klararety Healthcare',
  description: 'Secure healthcare platform with HIPAA compliance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ErrorBoundary>
          <Providers>
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
            />
            <AuthenticatedLayout>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Suspense fallback={<div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>}>
                    {children}
                  </Suspense>
                </main>
                <SessionTimeout />
              </div>
            </AuthenticatedLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
