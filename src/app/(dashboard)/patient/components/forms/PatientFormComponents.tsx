// src/app/(dashboard)/patient/components/forms/PatientFormComponents.tsx
'use client';

import React, { useState } from 'react';
import { FieldError, UseFormRegister, FieldValues } from 'react-hook-form';

interface PatientFormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'password';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  helpText?: string;
  icon?: React.ReactNode;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormInput: React.FC<PatientFormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  icon,
  register,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{icon}</div>
          </div>
        )}
        
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...(register ? register(name) : {})}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
      </div>
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Select dropdown with patient-specific styling
interface PatientFormSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  helpText?: string;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormSelect: React.FC<PatientFormSelectProps> = ({
  label,
  name,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  register,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        disabled={disabled}
        {...(register ? register(name) : {})}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500
          px-3 py-2 text-sm
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Textarea with patient-specific styling
interface PatientFormTextareaProps {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  helpText?: string;
  maxLength?: number;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormTextarea: React.FC<PatientFormTextareaProps> = ({
  label,
  name,
  rows = 3,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  maxLength,
  register,
  className = '',
}) => {
  const [charCount, setCharCount] = useState(0);

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        {...(register ? register(name) : {})}
        onChange={(e) => {
          setCharCount(e.target.value.length);
          if (register) {
            register(name).onChange(e);
          }
        }}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500
          px-3 py-2 text-sm resize-none
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      />
      
      <div className="flex justify-between items-center">
        <div>
          {helpText && !error && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error.message}</p>
          )}
        </div>
        
        {maxLength && (
          <p className="text-xs text-gray-400">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

// Checkbox with patient-specific styling
interface PatientFormCheckboxProps {
  label: string;
  name: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormCheckbox: React.FC<PatientFormCheckboxProps> = ({
  label,
  name,
  description,
  required = false,
  disabled = false,
  error,
  register,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <input
          id={name}
          type="checkbox"
          disabled={disabled}
          {...(register ? register(name) : {})}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
        />
        <div className="ml-3">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 ml-7">{error.message}</p>
      )}
    </div>
  );
};

// Radio group with patient-specific styling
interface PatientFormRadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string; description?: string }[];
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormRadioGroup: React.FC<PatientFormRadioGroupProps> = ({
  label,
  name,
  options,
  required = false,
  disabled = false,
  error,
  register,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <fieldset>
        <legend className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
        
        <div className="mt-2 space-y-2">
          {options.map(option => (
            <div key={option.value} className="flex items-start">
              <input
                id={`${name}-${option.value}`}
                type="radio"
                value={option.value}
                disabled={disabled}
                {...(register ? register(name) : {})}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="ml-3">
                <label htmlFor={`${name}-${option.value}`} className="text-sm font-medium text-gray-700">
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-sm text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// File upload with patient-specific styling
interface PatientFormFileUploadProps {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  helpText?: string;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const PatientFormFileUpload: React.FC<PatientFormFileUploadProps> = ({
  label,
  name,
  accept,
  multiple = false,
  required = false,
  disabled = false,
  error,
  helpText,
  register,
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Handle file drop logic here
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        <div className="mt-2">
          <label htmlFor={name} className="cursor-pointer">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Upload files
            </span>
            <span className="text-sm text-gray-500"> or drag and drop</span>
          </label>
          
          <input
            id={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            {...(register ? register(name) : {})}
            className="sr-only"
          />
        </div>
        
        {accept && (
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: {accept}
          </p>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Form section wrapper for organizing forms
interface PatientFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const PatientFormSection: React.FC<PatientFormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg 
              className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Submit button with loading state
interface PatientFormSubmitProps {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PatientFormSubmit: React.FC<PatientFormSubmitProps> = ({
  loading = false,
  disabled = false,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${(disabled || loading) ? 'cursor-not-allowed' : ''}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// HIPAA consent checkbox (special case)
interface HIPAAConsentCheckboxProps {
  name: string;
  required?: boolean;
  error?: FieldError;
  register?: UseFormRegister<FieldValues>;
  className?: string;
}

export const HIPAAConsentCheckbox: React.FC<HIPAAConsentCheckboxProps> = ({
  name,
  required = true,
  error,
  register,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <input
            id={name}
            type="checkbox"
            {...(register ? register(name) : {})}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3">
            <label htmlFor={name} className="text-sm font-medium text-blue-900">
              HIPAA Privacy Authorization
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="text-sm text-blue-800 mt-1">
              <p>I authorize the use and disclosure of my health information as described in the Privacy Notice.</p>
              <p className="mt-2">
                <a href="/privacy-notice" target="_blank" className="underline hover:text-blue-900">
                  View Privacy Notice
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};
