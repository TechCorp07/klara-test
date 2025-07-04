// src/app/(dashboard)/patient/components/PatientErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class PatientErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Patient Dashboard Error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        custom_map: {
          component: 'PatientDashboard',
          errorInfo: errorInfo.componentStack,
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-96 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  Something went wrong
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-red-700">
                We encountered an error while loading your health dashboard. 
                Your data is safe and secure.
              </p>
            </div>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="font-bold text-red-600 mb-2">Error Details:</div>
                <div>{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <div className="mt-2">
                    <div className="font-bold text-red-600">Component Stack:</div>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>

              <Link
                href="/dashboard/patient"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-gray-200 transition-colors"
              >
                Return to Dashboard
              </Link>

              <Link
                href="/support"
                className="block w-full text-blue-600 py-2 px-4 text-sm font-medium text-center hover:text-blue-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>

            {/* HIPAA Compliance Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Privacy Notice:</span> This error has been logged for 
                technical support purposes only. No personal health information is included in error reports.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const usePatientErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Patient Dashboard Error:', error, errorInfo);
    
    // Report to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
        custom_map: {
          component: 'PatientDashboard',
          errorInfo: errorInfo?.componentStack || 'No component stack available',
        },
      });
    }
  }, []);

  return { handleError };
};

// Higher-order component wrapper
export const withPatientErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <PatientErrorBoundary fallback={fallback}>
      <Component {...props} />
    </PatientErrorBoundary>
  );

  WrappedComponent.displayName = `withPatientErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
