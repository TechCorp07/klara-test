"use client"

// components/ui/PasswordStrengthMeter.js
import { useState, useEffect } from "react"
import { FaCheck, FaTimes } from "react-icons/fa"

/**
 * Password strength meter component with criteria validation
 * @param {Object} props
 * @param {string} props.password - The password to evaluate
 * @param {boolean} props.showCriteria - Whether to show the criteria list
 */
const PasswordStrengthMeter = ({ password, showCriteria = true }) => {
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
  useEffect(() => {
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

    setStrength(Math.min(score, 7)) // Maximum strength is 7
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

export default PasswordStrengthMeter
