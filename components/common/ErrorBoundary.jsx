'use client';

import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import Link from 'next/link';

/**
 * ErrorBoundary: Class component that catches JavaScript errors in its child component tree.
 * Use this to wrap sections of your application where you want to catch unexpected errors
 * and prevent the entire application from crashing.
 *
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * 
 * // With custom fallback component
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <ErrorComponent 
 *       error={error} 
 *       variant="page" 
 *       onRetry={reset} 
 *     />
 *   )}
 * >
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError,
      error,
      errorInfo,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI
    return { hasError, error };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Update state with error details
    this.setState({ errorInfo, errorId });
    
    // Only log in development or show toast in production
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ErrorBoundary] ${errorId}:`, error, errorInfo);
    } else {
      toast.error('An unexpected error occurred. Our team has been notified.');
    }
    
    // Log error to server (if needed)
    this.logErrorToServer(error, errorInfo, errorId);
  }

  /**
   * Logs error to server for monitoring
   * Ensures PII/PHI is not included in error reports
   */
  logErrorToServer(error, errorInfo, errorId) {
    try {
      // Skip in development mode to avoid unnecessary API calls
      if (process.env.NODE_ENV !== 'production' || !window.fetch) {
        return;
      }
      
      // Sanitize error for reporting - no PII/PHI
      const sanitizedError = {
        name: error.name,
        message: error.message,
        // Only include first few lines of stack trace
        stack: error.stack ? 
          error.stack.split('\n').slice(0, 5).join('\n') : null,
        // Only include first few lines of component stack
        componentStack: errorInfo.componentStack ?
          errorInfo.componentStack.split('\n').slice(0, 10).join('\n') : null,
        errorId,
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      };

      // Fire-and-forget error logging
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedError),
        // Don't wait for response
        keepalive: true
      }).catch(() => {
        // Silent catch - don't cause errors in the error handler
      });
    } catch (loggingError) {
      // Silent catch - never throw from error logging
      console.error('Error in error logging:', loggingError);
    }
  }

  /**
   * Reset error state to try recovery
   */
  handleReset = () => {
    this.setState({
      hasError,
      error,
      errorInfo,
      errorId: null
    });
  };

  render() {
    const { children, fallback } = this.props;
    const { hasError, error, errorId } = this.state;

    // No error, render children normally
    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (typeof fallback === 'function') {
      return fallback(error, this.handleReset, errorId);
    }

    // Default error UI
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4" 
        role="alert" 
        aria-live="assertive"
      >
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          
          <p className="mb-4 text-gray-600">
            We've encountered an unexpected error. Our team has been notified.
          </p>
          
          {errorId && (
            <p className="mb-6 text-sm text-gray-500">
              Reference ID: <span className="font-mono">{errorId}</span>
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaHome className="mr-2 h-4 w-4" aria-hidden="true" />
              Go to homepage
            </Link>
          </div>
          
          {/* Only show debug info in development */}
          {process.env.NODE_ENV !== 'production' && error && (
            <div className="mt-6 p-4 bg-red-50 rounded text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">Debug Information:</h3>
              <p className="text-sm text-red-700 mb-2">
                {error.toString()}
              </p>
              {this.state.errorInfo && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-red-700 mb-1">Component Stack</summary>
                  <pre className="overflow-auto p-2 bg-red-100 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;