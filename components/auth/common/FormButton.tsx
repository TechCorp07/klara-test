// src/components/auth/common/FormButton.tsx
'use client';

import React from 'react';

// Define variant options
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

// Interface for button props, extending React button props
interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Reusable button component with consistent styling, loading state, and accessibility features.
 * This component provides various styles and sizes to be used across the application.
 */
const FormButton: React.FC<FormButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  // Base styles for all buttons
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Variant-specific styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  
  // Size-specific styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Loading and disabled styles
  const stateStyles = (isLoading || disabled) 
    ? 'opacity-70 cursor-not-allowed' 
    : 'cursor-pointer';
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${stateStyles}
    ${widthStyles}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? 'true' : 'false'}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {leftIcon && !isLoading && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && !isLoading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default FormButton;