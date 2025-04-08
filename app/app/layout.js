// app/layout.js (Server Component by default)
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import ClientLayout from './ClientLayout'; 


export const metadata = {
  title: 'Klararety Health Platform',
  description: 'Secure healthcare platform for patients and providers',
  keywords: 'healthcare, telemedicine, medical records, HIPAA compliant',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
