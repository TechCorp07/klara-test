'use client';

import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

/**
 * Error Alert component for displaying error messages
 * @param {Object} props
 * @param {string|Error|Object} props.error - Error message, object, or instance
 * @param {string} props.severity - Error severity: 'error', 'warning', or 'info'
 * @param {boolean} props.dismissible - Whether the error can be dismissed
 * @param {Function} props.onDismiss - Function to call when error is dismissed
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.action - Optional action component (button, link, etc.)
 */
const ErrorAlert = ({
  error,
  severity = 'error',
  dismissible = false,
  onDismiss,
  className = '',
  action
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
  
  // If no error, don't render anything
  if (!error) {
    return null;
  }
  
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
};

export default ErrorAlert;