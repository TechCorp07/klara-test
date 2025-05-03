/**
 * Healthcare-specific utility functions
 */

/**
 * Format a patient identifier (MRN, etc.)
 * @param {string} id - Patient identifier
 * @param {string} type - Identifier type (MRN, SSN, etc.)
 * @returns {string} Formatted identifier
 */
export const formatPatientId = (id, type = "MRN") => {
  if (!id) return ""

  // Format based on type
  switch (type.toUpperCase()) {
    case "SSN":
      // Format as XXX-XX-XXXX
      const cleaned = id.replace(/\D/g, "")
      if (cleaned.length !== 9) return id
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 9)}`
    case "MRN":
      // Ensure consistent format with leading zeros if needed
      return id.padStart(8, "0")
    default:
      // Return original ID for unrecognized formats
      return id
  }
}

/**
 * Format a medication dosage
 * @param {number} amount - Dosage amount
 * @param {string} unit - Dosage unit
 * @returns {string} Formatted dosage
 */
export const formatMedicationDosage = (amount, unit) => {
  if (!amount && amount !== 0) return ""
  if (!unit) return `${amount}`
  return `${amount} ${unit}`
}

/**
 * Format a blood pressure reading
 * @param {number} systolic - Systolic pressure
 * @param {number} diastolic - Diastolic pressure
 * @returns {string} Formatted blood pressure
 */
export const formatBloodPressure = (systolic, diastolic) => {
  if ((!systolic && systolic !== 0) || (!diastolic && diastolic !== 0)) return ""
  return `${systolic}/${diastolic} mmHg`
}

/**
 * Format a lab result with reference range
 * @param {number} value - Lab result value
 * @param {string} unit - Result unit
 * @param {number} lowRange - Lower reference range
 * @param {number} highRange - Upper reference range
 * @returns {Object} Formatted result with status
 */
export const formatLabResult = (value, unit, lowRange, highRange) => {
  if (value === null || value === undefined) return { display: "", status: "unknown" }

  let status = "normal"
  if (lowRange !== undefined && value < lowRange) status = "low"
  if (highRange !== undefined && value > highRange) status = "high"

  const display = unit ? `${value} ${unit}` : `${value}`

  return {
    display,
    status,
    isAbnormal: status !== "normal",
  }
}

/**
 * Calculate BMI from height and weight
 * @param {number} heightCm - Height in centimeters
 * @param {number} weightKg - Weight in kilograms
 * @returns {Object} BMI value and category
 */
export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return { value: null, category: null }

  // Convert height to meters
  const heightM = heightCm / 100

  // Calculate BMI
  const bmi = weightKg / (heightM * heightM)
  const roundedBmi = Math.round(bmi * 10) / 10

  // Determine BMI category
  let category
  if (bmi < 18.5) {
    category = "Underweight"
  } else if (bmi < 25) {
    category = "Normal"
  } else if (bmi < 30) {
    category = "Overweight"
  } else {
    category = "Obese"
  }

  return {
    value: roundedBmi,
    category,
  }
}

/**
 * Format a diagnosis with ICD code
 * @param {string} diagnosis - Diagnosis text
 * @param {string} icdCode - ICD-10 code
 * @returns {string} Formatted diagnosis
 */
export const formatDiagnosis = (diagnosis, icdCode) => {
  if (!diagnosis) return ""
  if (!icdCode) return diagnosis
  return `${diagnosis} (${icdCode})`
}

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return null

  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Format a medication schedule
 * @param {string} frequency - Frequency (daily, BID, TID, QID, etc.)
 * @param {string} timing - Timing (with meals, before meals, etc.)
 * @returns {string} Formatted schedule
 */
export const formatMedicationSchedule = (frequency, timing) => {
  if (!frequency) return ""

  // Map common medical abbreviations
  const frequencyMap = {
    QD: "once daily",
    BID: "twice daily",
    TID: "three times daily",
    QID: "four times daily",
    Q4H: "every 4 hours",
    Q6H: "every 6 hours",
    Q8H: "every 8 hours",
    Q12H: "every 12 hours",
    QHS: "at bedtime",
    PRN: "as needed",
  }

  const formattedFrequency = frequencyMap[frequency.toUpperCase()] || frequency

  if (!timing) return formattedFrequency
  return `${formattedFrequency} ${timing}`
}

/**
 * Format a patient name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} middleName - Middle name (optional)
 * @param {boolean} lastNameFirst - Whether to put last name first
 * @returns {string} Formatted patient name
 */
export const formatPatientName = (firstName, lastName, middleName = "", lastNameFirst = false) => {
  if (!firstName && !lastName) return ""
  if (!firstName) return lastName
  if (!lastName) return firstName

  const middle = middleName ? ` ${middleName.charAt(0)}. ` : " "

  return lastNameFirst
    ? `${lastName}, ${firstName}${middleName ? middle : ""}`
    : `${firstName}${middleName ? middle : " "}${lastName}`
}

/**
 * Format a medical code (ICD, CPT, etc.)
 * @param {string} code - The code
 * @param {string} system - The code system (ICD10, CPT, etc.)
 * @param {string} description - The code description
 * @returns {string} Formatted medical code
 */
export const formatMedicalCode = (code, system = "", description = "") => {
  if (!code) return ""

  let result = code

  if (system) {
    result = `${system}: ${result}`
  }

  if (description) {
    result = `${result} - ${description}`
  }

  return result
}
