"use client"

import React, { forwardRef, useState } from "react"
import { FaExclamationCircle, FaInfoCircle, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa"

/**
 * Reusable form input component with validation and various input types
 */
export const FormInput = forwardRef(
  (
    {
      id,
      name,
      label,
      type = "text",
      placeholder = "",
      value = "",
      onChange,
      onBlur,
      error = null,
      touched = false,
      required = false,
      disabled = false,
      className = "",
      helpText = null,
      showPasswordToggle = false,
      autoComplete = "on",
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || name
    const errorId = `${inputId}-error`
    const helpTextId = `${inputId}-help`

    // Handle password visibility toggle
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    // Determine input type for password fields
    const inputType = type === "password" && showPassword ? "text" : type

    // Determine if error should be shown
    const showError = error && (touched || error)

    return (
      <div className={`mb-4 ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
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
            aria-invalid={showError ? "true" : "false"}
            aria-describedby={`${showError ? errorId : ""} ${helpText ? helpTextId : ""}`}
            className={`block w-full px-3 py-2 border ${
              showError
                ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            } rounded-md shadow-sm placeholder-gray-400 ${
              disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
            {...rest}
          />

          {/* Password Toggle Button */}
          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              onClick={togglePasswordVisibility}
              tabIndex="-1" // Don't include in tab order
              aria-label={showPassword ? "Hide password" : "Show password"}
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
    )
  },
)

FormInput.displayName = "FormInput"

/**
 * Select dropdown component with validation
 */
export const FormSelect = forwardRef(
  (
    {
      id,
      name,
      label,
      options = [],
      value = "",
      onChange,
      onBlur,
      error = null,
      touched = false,
      required = false,
      disabled = false,
      className = "",
      helpText = null,
      placeholder = "Select an option",
      ...rest
    },
    ref,
  ) => {
    const inputId = id || name
    const errorId = `${inputId}-error`
    const helpTextId = `${inputId}-help`

    // Determine if error should be shown
    const showError = error && (touched || error)

    return (
      <div className={`mb-4 ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={showError ? "true" : "false"}
            aria-describedby={`${showError ? errorId : ""} ${helpText ? helpTextId : ""}`}
            className={`block w-full pl-3 pr-10 py-2 text-base border ${
              showError
                ? "border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            } rounded-md shadow-sm ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            {...rest}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Error Icon */}
          {showError && (
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
    )
  },
)

FormSelect.displayName = "FormSelect"

/**
 * Checkbox component with validation
 */
export const FormCheckbox = forwardRef(
  (
    {
      id,
      name,
      label,
      checked = false,
      onChange,
      onBlur,
      error = null,
      touched = false,
      required = false,
      disabled = false,
      className = "",
      helpText = null,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || name
    const errorId = `${inputId}-error`
    const helpTextId = `${inputId}-help`

    // Determine if error should be shown
    const showError = error && (touched || error)

    return (
      <div className={`mb-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={inputId}
              ref={ref}
              name={name}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              aria-invalid={showError ? "true" : "false"}
              aria-describedby={`${showError ? errorId : ""} ${helpText ? helpTextId : ""}`}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                disabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              {...rest}
            />
          </div>
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={inputId} className={`font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {/* Help Text */}
            {helpText && !showError && (
              <p className="text-gray-500" id={helpTextId}>
                {helpText}
              </p>
            )}

            {/* Error Message */}
            {showError && (
              <p className="text-red-600" id={errorId}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  },
)

FormCheckbox.displayName = "FormCheckbox"

/**
 * Radio group component with validation
 */
export const FormRadioGroup = forwardRef(
  (
    {
      id,
      name,
      label,
      options = [],
      value = "",
      onChange,
      onBlur,
      error = null,
      touched = false,
      required = false,
      disabled = false,
      className = "",
      helpText = null,
      inline = false,
      ...rest
    },
    ref,
  ) => {
    const groupId = id || name
    const errorId = `${groupId}-error`
    const helpTextId = `${groupId}-help`

    // Determine if error should be shown
    const showError = error && (touched || error)

    return (
      <div className={`mb-4 ${className}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Radio Options */}
        <div
          className={`space-${inline ? "x" : "y"}-4 ${inline ? "flex flex-wrap" : ""}`}
          role="radiogroup"
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={`${showError ? errorId : ""} ${helpText ? helpTextId : ""}`}
        >
          {options.map((option) => (
            <div key={option.value} className={`${inline ? "mr-4" : ""} flex items-center`}>
              <input
                id={`${groupId}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled || option.disabled}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                  disabled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                {...rest}
              />
              <label
                htmlFor={`${groupId}-${option.value}`}
                className={`ml-3 block text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}
              >
                {option.label}
              </label>
            </div>
          ))}
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
    )
  },
)

FormRadioGroup.displayName = "FormRadioGroup"

/**
 * Password strength meter component with criteria validation
 */
export const PasswordStrengthMeter = ({ password, showCriteria = true }) => {
  const [strength, setStrength] = useState(0)
  const [feedback, setFeedback] = useState([])
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  // Calculate password strength and check criteria
  React.useEffect(() => {
    if (!password) {
      setStrength(0)
      setFeedback(["Password is required"])
      setCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      })
      return
    }

    let score = 0
    const feedbackItems = []
    const newCriteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    // Check length
    if (!newCriteria.length) {
      feedbackItems.push("Password must be at least 8 characters")
    } else {
      score += 1
    }

    // Check uppercase
    if (!newCriteria.uppercase) {
      feedbackItems.push("Add uppercase letters")
    } else {
      score += 1
    }

    // Check lowercase
    if (!newCriteria.lowercase) {
      feedbackItems.push("Add lowercase letters")
    } else {
      score += 1
    }

    // Check numbers
    if (!newCriteria.number) {
      feedbackItems.push("Add numbers")
    } else {
      score += 1
    }

    // Check special characters
    if (!newCriteria.special) {
      feedbackItems.push("Add special characters")
    } else {
      score += 1
    }

    // Additional scoring for password length
    if (password.length > 12) score += 1
    if (password.length > 16) score += 1

    setStrength(Math.min(score, 7)) // Maximum strength is
    setFeedback(feedbackItems)
    setCriteria(newCriteria)
  }, [password])

  // Get strength label
  const getStrengthLabel = () => {
    if (strength === 0) return "Very Weak"
    if (strength === 1) return "Very Weak"
    if (strength === 2) return "Weak"
    if (strength === 3) return "Fair"
    if (strength === 4) return "Moderate"
    if (strength === 5) return "Strong"
    if (strength >= 6) return "Very Strong"
  }

  // Get strength color
  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500"
    if (strength === 2) return "bg-orange-500"
    if (strength === 3) return "bg-yellow-500"
    if (strength === 4) return "bg-yellow-400"
    if (strength === 5) return "bg-green-400"
    if (strength >= 6) return "bg-green-500"
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span className="text-sm font-medium text-gray-700">{getStrengthLabel()}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${getStrengthColor()}`} style={{ width: `${(strength / 7) * 100}%` }}></div>
      </div>

      {showCriteria && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
          <ul className="space-y-1">
            <li className="flex items-start">
              {criteria.length ? (
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              ) : (
                <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              )}
              <span className="text-sm text-gray-600">At least 8 characters</span>
            </li>

            <li className="flex items-start">
              {criteria.uppercase ? (
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              ) : (
                <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              )}
              <span className="text-sm text-gray-600">At least one uppercase letter (A-Z)</span>
            </li>

            <li className="flex items-start">
              {criteria.lowercase ? (
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              ) : (
                <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              )}
              <span className="text-sm text-gray-600">At least one lowercase letter (a-z)</span>
            </li>

            <li className="flex items-start">
              {criteria.number ? (
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              ) : (
                <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              )}
              <span className="text-sm text-gray-600">At least one number (0-9)</span>
            </li>

            <li className="flex items-start">
              {criteria.special ? (
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              ) : (
                <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              )}
              <span className="text-sm text-gray-600">At least one special character (!@#$%^&*)</span>
            </li>
          </ul>
        </div>
      )}

      {!showCriteria && feedback.length > 0 && (
        <ul className="mt-2 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-start">
              <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              <span className="text-sm text-gray-600">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
