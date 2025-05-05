'use client';

import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaExclamationCircle, FaTimes, FaHome } from 'react-icons/fa';
import Link from 'next/link';

/**
 * ErrorComponent: Functional component for displaying known errors with standardized styling.
 * Use this component to display expected errors or error states that you handle in your application.
 * This component does NOT catch unexpected errors - use ErrorBoundary for that purpose.
 *
 * @example
 * // Alert-style error message
 * {error && <ErrorComponent error={error} variant="alert" severity="error" />}
 * 
 * // Inline error message
 * {error && <ErrorComponent error={error} variant="inline" severity="warning" />}
 * 
 * // Full-page error message
 * {error && <ErrorComponent error={error} variant="page" onRetry={handleRetry} />}
 * 
 * // Toast-style error notification
 * {error && <ErrorComponent error={error} variant="toast" dismissible />}
 */

/**
 * @typedef {'error' | 'warning' | 'info'} ErrorSeverity
 */

/**
 * @typedef {'alert' | 'inline' | 'page' | 'toast'} ErrorVariant
 */

/**
 * @typedef {Object} ErrorComponentProps
 * @property {string|Error|Object|null} error - Error message, object, or instance
 * @property {ErrorVariant} [variant] - Error display variant
 * @property {ErrorSeverity} [severity] - Error severity level
 * @property {boolean} [dismissible] - Whether the error can be dismissed
 * @property {Function} [onDismiss] - Function to call when error is dismissed
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [action] - Optional action component (button, link, etc.)
 * @property {Function} [onRetry] - Optional retry handler
 * @property {string} [errorId] - Optional error ID for tracking
 * @property {string} [homePath] - Path to redirect to home page
 */

/**
 * @typedef {Object} ColorScheme
 * @property {string} bg - Background color class
 * @property {string} border - Border color class
 * @property {string} text - Text color class
 * @property {React.ReactNode} icon - Icon component
 */

/**
 * Error component for displaying known errors with standardized styling
 * @param {ErrorComponentProps} props
 * @returns {JSX.Element}
 */
const ErrorComponent = ({
  error,
  variant = 'inline',
  severity = 'error',
  dismissible = false,
  onDismiss,
  className = '',
  action,
  onRetry,
  errorId,
  homePath = '/'
}) => {
  // Extract error message
  let errorMessage = '';
  let errorDetails = null;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  } else if (error && typeof error === 'object') {
    errorMessage = error.message || JSON.stringify(error);
    errorDetails = error.details || error.stack;
  } else if (!error) {
    errorMessage = 'An error occurred';
  }
  
  // Define colors based on severity
  const getColors = () => {
    switch (severity) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: <FaExclamationCircle className="h-5 w-5 text-yellow-400" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: <FaInfoCircle className="h-5 w-5 text-blue-400" />
        };
      case 'error':
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        };
    }
  };
  
  const { bg, border, text, icon } = getColors();
  
  // Render appropriate variant
  switch (variant) {
    case 'alert':
      return (
        <div className={`${bg} border-l-4 ${border} p-4 rounded-md my-4 ${className}`} role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${text}`}>{errorMessage}</p>
              {errorDetails && process.env.NODE_ENV !== 'production' && (
                <details className="mt-1">
                  <summary className={`text-xs ${text} cursor-pointer`}>Show details</summary>
                  <pre className={`mt-2 text-xs ${text} overflow-auto max-h-40 p-2 rounded bg-white bg-opacity-50`}>
                    {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
                  </pre>
                </details>
              )}
              {action && <div className="mt-2">{action}</div>}
            </div>
            {dismissible && (
              <div className="pl-3">
                <button
                  type="button"
                  className={`inline-flex rounded-md ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600`}
                  onClick={onDismiss}
                  aria-label="Dismiss"
                >
                  <span className="sr-only">Dismiss</span>
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
      
    case 'inline':
      return (
        <div className={`${bg} ${border ? `border border-${border}` : ''} ${text} px-4 py-3 rounded ${className}`}>
          <p>{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          )}
        </div>
      );
      
    case 'page':
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
              {errorMessage}
            </p>
            
            {errorId && (
              <p className="mb-6 text-sm text-gray-500">
                Reference ID: <span className="font-mono">{errorId}</span>
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              )}
              
              <Link
                href={homePath}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaHome className="mr-2 h-4 w-4" aria-hidden="true" />
                Go to homepage
              </Link>
            </div>
            
            {/* Only show debug info in development */}
            {process.env.NODE_ENV !== 'production' && errorDetails && (
              <div className="mt-6 p-4 bg-red-50 rounded text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Debug Information:</h3>
                <p className="text-sm text-red-700 mb-2">
                  {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
                </p>
              </div>
            )}
          </div>
        </div>
      );
      
    case 'toast':
      return (
        <div className={`flex items-center p-2 ${bg} rounded-md ${className}`}>
          <div className="flex-shrink-0 mr-2">
            {icon}
          </div>
          <div className="flex-1 text-sm font-medium">
            {errorMessage}
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

export default ErrorComponent;