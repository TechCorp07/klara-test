import React, { useState } from 'react';
import { useMobileOptimization } from '../../contexts/MobileOptimizationContext';

/**
 * TouchFriendlyForm Component
 * A mobile-optimized form component with touch-friendly inputs
 */
const TouchFriendlyForm = ({ 
  fields, 
  onSubmit, 
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel = null,
  initialValues = {},
  loading = false,
  validationSchema = null
}) => {
  const { isMobile, touchEnabled } = useMobileOptimization();
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Mark field
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateField = (name, value) => {
    if (!validationSchema || !validationSchema[name]) return null;
    
    const fieldSchema = validationSchema[name];
    
    if (fieldSchema.required && !value) {
      return 'This field is required';
    }
    
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      return `Must be at least ${fieldSchema.minLength} characters`;
    }
    
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return `Must be at most ${fieldSchema.maxLength} characters`;
    }
    
    if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
      return fieldSchema.patternMessage || 'Invalid format';
    }
    
    if (fieldSchema.validate && typeof fieldSchema.validate === 'function') {
      return fieldSchema.validate(value, formValues);
    }
    
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (validationSchema) {
      Object.keys(validationSchema).forEach(fieldName => {
        const value = formValues[fieldName];
        const error = validateField(fieldName, value);
        
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    if (validationSchema && validationSchema[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      onSubmit(formValues);
    }
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      placeholder = '',
      options = [],
      helpText = '',
      disabled = false,
      className = '',
      rows = 3,
      min,
      max,
      step
    } = field;
    
    const value = formValues[name] !== undefined ? formValues[name] : '';
    const error = touched[name] && errors[name];
    
    const commonProps = {
      id,
      name,
      value,
      onChange,
      onBlur,
      disabled: disabled || loading,
      className: `form-control ${error ? 'is-invalid' : ''} ${className}`,
      placeholder
    };
    
    // Apply mobile-specific styles
    const mobileClasses = isMobile && touchEnabled ? 'touch-friendly-input' : '';
    
    switch (type) {
      case 'textarea':
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <textarea 
              {...commonProps} 
              rows={rows}
            />
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
        
      case 'select':
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <select 
              {...commonProps}
              className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className={`mb-3 form-check ${mobileClasses}`} key={name}>
            <input
              type="checkbox"
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              id={name}
              name={name}
              checked={!!value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled || loading}
            />
            <label className="form-check-label" htmlFor={name}>
              {label}
            </label>
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
        
      case 'radio':
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label className="form-label d-block">{label}</label>
            {options.map(option => (
              <div className="form-check" key={option.value}>
                <input
                  type="radio"
                  className={`form-check-input ${error ? 'is-invalid' : ''}`}
                  id={`${name}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled || loading}
                />
                <label className="form-check-label" htmlFor={`${name}-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </div>
        );
        
      case 'number':
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input 
              {...commonProps}
              type="number"
              min={min}
              max={max}
              step={step}
            />
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
        
      case 'date':
      case 'time':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input 
              {...commonProps}
              type={type}
            />
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
        
      default:
        return (
          <div className={`mb-3 ${mobileClasses}`} key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input 
              {...commonProps}
              type="text"
            />
            {helpText && <div className="form-text">{helpText}</div>}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {fields.map(renderField)}
      
      <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-end'} gap-2 mt-4`}>
        {onCancel && (
          <button
            type="button"
            className={`btn btn-outline-secondary ${isMobile ? 'mb-2' : 'me-2'}`}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TouchFriendlyForm;
