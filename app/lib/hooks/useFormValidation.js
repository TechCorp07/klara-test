'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for form validation with various validation rules
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {Function} onSubmit - Submit handler function
 * @returns {Object} Form validation state and handlers
 */
const useFormValidation = (initialValues = {}, validationRules = {}, onSubmit = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  // Set form values
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
    setIsDirty(true);
  }, []);

  // Validation rules
  const validators = useMemo(() => ({
    required: (value) => {
      if (value === undefined || value === null || value === '') {
        return 'This field is required';
      }
      return null;
    },
    minLength: (value, min) => {
      if (value && value.length < min) {
        return `Must be at least ${min} characters`;
      }
      return null;
    },
    maxLength: (value, max) => {
      if (value && value.length > max) {
        return `Must be no more than ${max} characters`;
      }
      return null;
    },
    pattern: (value, pattern, message) => {
      if (value && !pattern.test(value)) {
        return message || 'Invalid format';
      }
      return null;
    },
    email: (value) => {
      if (
        value &&
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
      ) {
        return 'Invalid email address';
      }
      return null;
    },
    match: (value, fieldToMatch, fieldToMatchName) => {
      if (value !== values[fieldToMatch]) {
        return `Does not match ${fieldToMatchName || fieldToMatch}`;
      }
      return null;
    },
    custom: (value, validationFn) => {
      if (typeof validationFn === 'function') {
        return validationFn(value, values);
      }
      return null;
    },
  }), [values]);

  // Validate a specific field
  const validateField = useCallback((name, value) => {
    const fieldRules = validationRules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const { type, ...params } = rule;
      const validatorFn = validators[type];
      
      if (validatorFn) {
        const error = validatorFn(value, ...Object.values(params));
        if (error) return error;
      }
    }

    return null;
  }, [validationRules, validators]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, values, validationRules]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues((prevValues) => ({
      ...prevValues,
      [name]: fieldValue,
    }));
    
    setIsDirty(true);
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
    
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    setTouched(allTouched);
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Handle API validation errors
        if (error.response?.data?.errors) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            ...error.response.data.errors,
          }));
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateForm, onSubmit, values, validationRules]);

  // Get field props for easier integration
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  }), [values, handleChange, handleBlur, errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues: setFormValues,
    resetForm,
    validateForm,
    validateField,
    getFieldProps,
  };
};

export default useFormValidation;