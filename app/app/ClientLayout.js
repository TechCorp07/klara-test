// app/ClientLayout.js
'use client';

import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/auth/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        {children}
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
      </ErrorBoundary>
    </AuthProvider>
  );
}
