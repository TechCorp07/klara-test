import { describe, it, expect } from "vitest"
import * as utils from "../../../lib/utils"

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("should format date correctly with default format", () => {
      const date = new Date("2023-05-15T10:30:00")
      expect(utils.formatDate(date)).toMatch(/05\/15\/2023/)
    })

    it("should format date with custom format", () => {
      const date = new Date("2023-05-15T10:30:00")
      expect(utils.formatDate(date, "yyyy-MM-dd")).toBe("2023-05-15")
    })

    it("should handle string date input", () => {
      expect(utils.formatDate("2023-05-15")).toMatch(/05\/15\/2023/)
    })

    it("should return empty string for invalid date", () => {
      expect(utils.formatDate(null)).toBe("")
      expect(utils.formatDate(undefined)).toBe("")
      expect(utils.formatDate("invalid-date")).toBe("")
    })
  })

  describe("getDateRange", () => {
    it("should return correct date range for last 7 days", () => {
      const range = utils.getDateRange(7)
      expect(range.startDate).toBeInstanceOf(Date)
      expect(range.endDate).toBeInstanceOf(Date)

      const daysDiff = Math.round((range.endDate - range.startDate) / (1000 * 60 * 60 * 24))
      expect(daysDiff).toBe(7)
    })
  })
})

describe("String Utils", () => {
  describe("truncate", () => {
    it("should truncate string to specified length", () => {
      expect(utils.truncate("This is a long string", 10)).toBe("This is a...")
    })

    it("should not truncate if string is shorter than limit", () => {
      expect(utils.truncate("Short", 10)).toBe("Short")
    })

    it("should handle empty string", () => {
      expect(utils.truncate("", 10)).toBe("")
    })
  })

  describe("capitalize", () => {
    it("should capitalize first letter of string", () => {
      expect(utils.capitalize("hello")).toBe("Hello")
    })

    it("should handle empty string", () => {
      expect(utils.capitalize("")).toBe("")
    })

    it("should not change already capitalized string", () => {
      expect(utils.capitalize("Hello")).toBe("Hello")
    })
  })
})

describe("Validation Utils", () => {
  describe("isValidEmail", () => {
    it("should validate correct email format", () => {
      expect(utils.isValidEmail("test@example.com")).toBe(true)
    })

    it("should reject invalid email format", () => {
      expect(utils.isValidEmail("test@")).toBe(false)
      expect(utils.isValidEmail("test")).toBe(false)
      expect(utils.isValidEmail("@example.com")).toBe(false)
    })

    it("should handle empty input", () => {
      expect(utils.isValidEmail("")).toBe(false)
    })
  })

  describe("isValidPassword", () => {
    it("should validate strong password", () => {
      expect(utils.isValidPassword("StrongP@ss123")).toBe(true)
    })

    it("should reject weak password", () => {
      expect(utils.isValidPassword("weak")).toBe(false)
      expect(utils.isValidPassword("123456")).toBe(false)
      expect(utils.isValidPassword("password")).toBe(false)
    })
  })
})

describe("Format Utils", () => {
  describe("formatCurrency", () => {
    it("should format number as USD currency by default", () => {
      expect(utils.formatCurrency(1234.56)).toMatch(/\$1,234\.56/)
    })

    it("should format number with specified currency", () => {
      expect(utils.formatCurrency(1234.56, "EUR")).toMatch(/€1,234\.56/)
    })

    it("should handle zero and negative values", () => {
      expect(utils.formatCurrency(0)).toMatch(/\$0\.00/)
      expect(utils.formatCurrency(-1234.56)).toMatch(/-\$1,234\.56/)
    })

    it("should return empty string for null or undefined", () => {
      expect(utils.formatCurrency(null)).toBe("")
      expect(utils.formatCurrency(undefined)).toBe("")
    })
  })

  describe("formatPercent", () => {
    it("should format decimal as percentage", () => {
      expect(utils.formatPercent(0.1234)).toMatch(/12%/)
    })

    it("should handle specified decimal places", () => {
      expect(utils.formatPercent(0.1234, 2)).toMatch(/12.34%/)
    })

    it("should handle zero and negative values", () => {
      expect(utils.formatPercent(0)).toMatch(/0%/)
      expect(utils.formatPercent(-0.1234)).toMatch(/-12%/)
    })
  })
})

describe("Healthcare Utils", () => {
  describe("formatPatientId", () => {
    it("should format MRN with leading zeros", () => {
      expect(utils.formatPatientId("12345")).toBe("00012345")
    })

    it("should format SSN with dashes", () => {
      expect(utils.formatPatientId("123456789", "SSN")).toBe("123-45-6789")
    })

    it("should return original ID if format not recognized", () => {
      expect(utils.formatPatientId("ABC123", "CUSTOM")).toBe("ABC123")
    })
  })

  describe("formatBloodPressure", () => {
    it("should format blood pressure readings", () => {
      expect(utils.formatBloodPressure(120, 80)).toBe("120/80 mmHg")
    })

    it("should handle zero values", () => {
      expect(utils.formatBloodPressure(0, 0)).toBe("0/0 mmHg")
    })

    it("should return empty string for missing values", () => {
      expect(utils.formatBloodPressure(null, 80)).toBe("")
      expect(utils.formatBloodPressure(120, null)).toBe("")
    })
  })

  describe("calculateBMI", () => {
    it("should calculate BMI correctly", () => {
      const result = utils.calculateBMI(170, 70)
      expect(result.value).toBeCloseTo(24.2, 1)
      expect(result.category).toBe("Normal")
    })

    it("should categorize BMI correctly", () => {
      expect(utils.calculateBMI(170, 50).category).toBe("Underweight")
      expect(utils.calculateBMI(170, 70).category).toBe("Normal")
      expect(utils.calculateBMI(170, 85).category).toBe("Overweight")
      expect(utils.calculateBMI(170, 105).category).toBe("Obese")
    })

    it("should handle missing values", () => {
      expect(utils.calculateBMI(null, 70).value).toBeNull()
      expect(utils.calculateBMI(170, null).value).toBeNull()
    })
  })
})
