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
 * Interpret BMI value with detailed health information
 * @param {number} bmi - BMI value
 * @returns {Object} Detailed BMI interpretation
 */
export const interpretBMI = (bmi) => {
  if (!bmi && bmi !== 0) return { category: null, risk: null, recommendation: null }

  let category, risk, recommendation

  if (bmi < 16) {
    category = "Severe Underweight"
    risk = "Very High"
    recommendation = "Immediate medical evaluation recommended. Focus on nutritional therapy and weight gain."
  } else if (bmi < 18.5) {
    category = "  Focus on nutritional therapy and weight gain."
  } else if (bmi < 18.5) {
    category = "Underweight"
    risk = "Moderate"
    recommendation =
      "Gradual weight gain through increased caloric intake and balanced nutrition. Consider consulting a dietitian."
  } else if (bmi < 25) {
    category = "Normal Weight"
    risk = "Low"
    recommendation = "Maintain current weight through balanced diet and regular physical activity."
  } else if (bmi < 30) {
    category = "Overweight"
    risk = "Increased"
    recommendation = "Gradual weight loss through moderate caloric restriction and increased physical activity."
  } else if (bmi < 35) {
    category = "Obesity Class I"
    risk = "High"
    recommendation = "Weight loss program with dietary changes, regular exercise, and possibly behavioral therapy."
  } else if (bmi < 40) {
    category = "Obesity Class II"
    risk = "Very High"
    recommendation = "Comprehensive weight management program. Consider consulting with obesity specialist."
  } else {
    category = "Obesity Class III"
    risk = "Extremely High"
    recommendation =
      "Intensive weight management under medical supervision. May consider surgical options if appropriate."
  }

  return {
    category,
    risk,
    healthRisk: risk,
    recommendation,
  }
}

/**
 * Calculate ideal weight range based on height using BMI method
 * @param {number} heightCm - Height in centimeters
 * @param {string} gender - Gender (male/female)
 * @returns {Object} Ideal weight range in kg
 */
export const calculateIdealWeight = (heightCm, gender = null) => {
  if (!heightCm) return { min: null, max: null }

  // Convert height to meters
  const heightM = heightCm / 100

  // Calculate ideal weight range based on BMI 18.5-24.9 (healthy range)
  const minWeight = Math.round(18.5 * heightM * heightM)
  const maxWeight = Math.round(24.9 * heightM * heightM)

  // Adjust slightly based on gender if provided
  if (gender) {
    if (gender.toLowerCase() === "male") {
      return {
        min: minWeight,
        max: maxWeight,
        // Alternative calculation using Hamwi formula for comparison
        hamwi: Math.round(48.0 + 2.7 * (heightCm / 2.54 - 60)),
      }
    } else if (gender.toLowerCase() === "female") {
      return {
        min: minWeight,
        max: maxWeight,
        // Alternative calculation using Hamwi formula for comparison
        hamwi: Math.round(45.5 + 2.2 * (heightCm / 2.54 - 60)),
      }
    }
  }

  return {
    min: minWeight,
    max: maxWeight,
  }
}

/**
 * Calculate daily calorie needs based on weight, height, age, gender, and activity level
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - Gender (male/female)
 * @param {string} activityLevel - Activity level (sedentary, light, moderate, active, very)
 * @returns {Object} Daily calorie needs for maintenance, loss, and gain
 */
export const calculateCalorieNeeds = (weightKg, heightCm, age, gender, activityLevel = "moderate") => {
  if (!weightKg || !heightCm || !age || !gender) return { maintenance: null, loss: null, gain: null }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Heavy exercise 6-7 days/week
    very: 1.9, // Very heavy exercise, physical job or training twice a day
  }

  // Get appropriate multiplier
  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || activityMultipliers.moderate

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr
  if (gender.toLowerCase() === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  // Calculate total daily energy expenditure
  const maintenance = Math.round(bmr * multiplier)

  // Calculate calorie needs for weight loss and gain
  const loss = Math.round(maintenance - 500) // 500 calorie deficit for ~1lb/week loss
  const gain = Math.round(maintenance + 500) // 500 calorie surplus for ~1lb/week gain

  return {
    maintenance,
    loss,
    gain,
    bmr: Math.round(bmr),
  }
}
