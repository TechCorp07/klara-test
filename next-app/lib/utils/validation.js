/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  }
  
  /**
   * Validate a password
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with details
   */
  export function validatePassword(password) {
    const result = {
      isValid: false,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    result.isValid = result.hasMinLength && 
                    result.hasUppercase && 
                    result.hasLowercase && 
                    result.hasNumber && 
                    result.hasSpecialChar;
    
    return result;
  }
  
  /**
   * Validate a phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export function isValidPhone(phone) {
    // This is a simple validation for demonstration
    // In a real app, you might want a more sophisticated validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }