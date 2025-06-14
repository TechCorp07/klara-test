// src/components/auth/common/FormAlert.tsx
'use client';

import React from 'react';

// Define alert types
type AlertType = 'success' | 'error' | 'warning' | 'info';

// Interface for alert props
interface FormAlertProps {
  type: AlertType;
  message: string | null;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alert component for form-related messages and notifications.
 * This component provides consistent styling for different types of alerts
 * used to display form submission results, validation errors, etc.
 */
const FormAlert: React.FC<FormAlertProps> = ({
  type,
  message,
  title,
  dismissible = true,
  onDismiss,
  className = '',
}) => {
  // Return null if no message
  if (!message) return null;
  
  // Alert styling based on type
  const alertStyles = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };
  
  // Alert icon based on type
  const alertIcon = {
    success: (
      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  // Default titles if not provided
  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  };
  
  // Get the appropriate title
  const alertTitle = title || defaultTitles[type];
  
  return (
    <div 
      className={`border-l-4 p-4 mb-4 rounded-md ${alertStyles[type]} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {alertIcon[type]}
        </div>
        
        <div className="ml-3 flex-grow">
          <h3 className="text-sm font-medium">{alertTitle}</h3>
          <div className="mt-1 text-sm">
            {message}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600'
                  : type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                  : type === 'warning' ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                  : 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <svg 
                  className="h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAlert;