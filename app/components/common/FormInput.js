'use client';

import React, { forwardRef } from 'react';
import { FaExclamationCircle, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Reusable form input component with validation
 */
const FormInput = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = null,
  touched = false,
  required = false,
  disabled = false,
  className = '',
  helpText = null,
  showPasswordToggle = false,
  autoComplete = 'on',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const helpTextId = `${inputId}-help`;
  
  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Determine input type for password fields
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Determine if error should be shown
  const showError = error && (touched || error);
  
  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={`${showError ? errorId : ''} ${helpText ? helpTextId : ''}`}
          className={`block w-full px-3 py-2 border ${
            showError
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm placeholder-gray-400 ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          {...rest}
        />
        
        {/* Password Toggle Button */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            onClick={togglePasswordVisibility}
            tabIndex="-1"  // Don't include in tab order
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
        
        {/* Error Icon */}
        {showError && !showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {showError && (
        <p className="mt-2 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      )}
      
      {/* Help Text */}
      {helpText && !showError && (
        <p className="mt-2 text-sm text-gray-500 flex items-start" id={helpTextId}>
          <FaInfoCircle className="h-4 w-4 mr-1 mt-0.5" />
          <span>{helpText}</span>
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;