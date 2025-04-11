// app/layout.jsx
import { Inter } from "next/font/google";
import { Providers } from './providers/providers';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SessionTimeout from '@/components/auth/SessionTimeout.';
import Header from '@/components/layout/Header';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Klararety Health Platform',
  description: 'Secure healthcare platform with HIPAA compliance',
  keywords: 'healthcare, telemedicine, medical records, HIPAA compliant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
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
                  {children}
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