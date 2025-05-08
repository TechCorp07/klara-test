// src/components/auth/common/FormInput.tsx
'use client';

import React, { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

// Interface for input props, extending React input props
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: FieldError;
  helperText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

/**
 * Reusable form input component with consistent styling, error handling, and accessibility features.
 * This component is designed to be used with react-hook-form but can be used standalone as well.
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    id, 
    error, 
    helperText, 
    icon, 
    required = false, 
    className = '',
    type = 'text',
    ...props 
  }, ref) => {
    // Determine if the input is in an error state
    const hasError = !!error;
    
    // Get the error message if there is one
    const errorMessage = error?.message;
    
    // Generate unique IDs for associated elements
    const helperId = `${id}-helper-text`;
    const errorId = `${id}-error-text`;
    
    return (
      <div className="mb-4">
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative rounded-md shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            type={type}
            className={`
              block w-full px-4 py-2 rounded-md border 
              ${hasError 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError 
                ? errorId 
                : helperText 
                  ? helperId 
                  : undefined
            }
            required={required}
            {...props}
          />
        </div>
        
        {/* Helper text */}
        {helperText && !hasError && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
        
        {/* Error message */}
        {hasError && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

// Display name for React DevTools
FormInput.displayName = 'FormInput';

export default FormInput;