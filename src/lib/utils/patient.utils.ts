// src/lib/utils/patient.utils.ts

import type { VitalSigns, MedicationAdherence, Appointment } from '@/types/patient.types';

/**
 * Health data formatting utilities
 */
export const formatVitalSigns = {
  bloodPressure: (systolic?: number, diastolic?: number): string => {
    if (!systolic || !diastolic) return 'Not recorded';
    return `${systolic}/${diastolic} mmHg`;
  },

  heartRate: (rate?: number): string => {
    if (!rate) return 'Not recorded';
    return `${rate} bpm`;
  },

  temperature: (temp?: number, unit: 'F' | 'C' = 'F'): string => {
    if (!temp) return 'Not recorded';
    return `${temp}°${unit}`;
  },

  weight: (weight?: number, unit: 'lbs' | 'kg' = 'lbs'): string => {
    if (!weight) return 'Not recorded';
    return `${weight} ${unit}`;
  },

  height: (height?: number, unit: 'in' | 'cm' = 'in'): string => {
    if (!height) return 'Not recorded';
    if (unit === 'in') {
      const feet = Math.floor(height / 12);
      const inches = height % 12;
      return `${feet}' ${inches}"`;
    }
    return `${height} cm`;
  },

  oxygenSaturation: (saturation?: number): string => {
    if (!saturation) return 'Not recorded';
    return `${saturation}%`;
  },

  bmi: (weight?: number, height?: number): string => {
    if (!weight || !height) return 'Not calculated';
    // Assuming weight in lbs and height in inches
    const bmi = (weight / (height * height)) * 703;
    return `${bmi.toFixed(1)}`;
  }
};

/**
 * Medication adherence calculations
 */
export const calculateAdherence = {
  rate: (adherenceData: MedicationAdherence[]): number => {
    if (adherenceData.length === 0) return 0;
    const takenCount = adherenceData.filter(dose => dose.taken).length;
    return takenCount / adherenceData.length;
  },

  percentage: (adherenceData: MedicationAdherence[]): number => {
    return Math.round(calculateAdherence.rate(adherenceData) * 100);
  },

  streak: (adherenceData: MedicationAdherence[]): number => {
    // Calculate current streak of consecutive taken doses
    let streak = 0;
    const sortedData = [...adherenceData]
      .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
    
    for (const dose of sortedData) {
      if (dose.taken) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  missedInPeriod: (adherenceData: MedicationAdherence[], days: number = 7): number => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return adherenceData.filter(dose => 
      new Date(dose.scheduled_time) >= cutoffDate && !dose.taken
    ).length;
  }
};

/**
 * Health status indicators
 */
export const getHealthIndicators = {
  bloodPressureStatus: (systolic?: number, diastolic?: number): {
    status: 'normal' | 'elevated' | 'high' | 'very_high';
    label: string;
    color: string;
  } => {
    if (!systolic || !diastolic) {
      return { status: 'normal', label: 'Unknown', color: 'gray' };
    }

    if (systolic >= 180 || diastolic >= 120) {
      return { status: 'very_high', label: 'Very High', color: 'red' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { status: 'high', label: 'High', color: 'orange' };
    } else if (systolic >= 130 || diastolic >= 80) {
      return { status: 'elevated', label: 'Elevated', color: 'yellow' };
    } else {
      return { status: 'normal', label: 'Normal', color: 'green' };
    }
  },

  heartRateStatus: (rate?: number, age?: number): {
    status: 'low' | 'normal' | 'high';
    label: string;
    color: string;
  } => {
    if (!rate) {
      return { status: 'normal', label: 'Unknown', color: 'gray' };
    }

    // General adult ranges (can be refined based on age, fitness level, etc.)
    if (rate < 60) {
      return { status: 'low', label: 'Low', color: 'blue' };
    } else if (rate > 100) {
      return { status: 'high', label: 'High', color: 'red' };
    } else {
      return { status: 'normal', label: 'Normal', color: 'green' };
    }
  },

  bmiStatus: (bmi: number): {
    status: 'underweight' | 'normal' | 'overweight' | 'obese';
    label: string;
    color: string;
  } => {
    if (bmi < 18.5) {
      return { status: 'underweight', label: 'Underweight', color: 'blue' };
    } else if (bmi < 25) {
      return { status: 'normal', label: 'Normal', color: 'green' };
    } else if (bmi < 30) {
      return { status: 'overweight', label: 'Overweight', color: 'yellow' };
    } else {
      return { status: 'obese', label: 'Obese', color: 'red' };
    }
  }
};

/**
 * Date and time utilities for healthcare
 */
export const healthcareDates = {
  formatAppointmentTime: (datetime: string): {
    date: string;
    time: string;
    relative: string;
  } => {
    const appointmentDate = new Date(datetime);
    const now = new Date();
    
    return {
      date: appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      relative: formatRelativeTime(appointmentDate, now)
    };
  },

  getTimeUntilAppointment: (datetime: string): {
    canJoin: boolean;
    timeUntil: string;
    status: 'upcoming' | 'joinable' | 'active' | 'past';
  } => {
    const appointmentTime = new Date(datetime);
    const now = new Date();
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < -30) {
      return { canJoin: false, timeUntil: 'Past', status: 'past' };
    } else if (minutesDiff <= 15 && minutesDiff >= -30) {
      return { canJoin: true, timeUntil: 'Now', status: 'joinable' };
    } else if (minutesDiff < 60) {
      return { canJoin: false, timeUntil: `${Math.floor(minutesDiff)} min`, status: 'upcoming' };
    } else if (minutesDiff < 1440) { // Less than 24 hours
      const hours = Math.floor(minutesDiff / 60);
      const minutes = Math.floor(minutesDiff % 60);
      return { canJoin: false, timeUntil: `${hours}h ${minutes}m`, status: 'upcoming' };
    } else {
      const days = Math.floor(minutesDiff / 1440);
      return { canJoin: false, timeUntil: `${days} day${days !== 1 ? 's' : ''}`, status: 'upcoming' };
    }
  },

  getMedicationTimingStatus: (scheduledTime: string): {
    isOverdue: boolean;
    timeLabel: string;
    urgency: 'normal' | 'soon' | 'overdue';
  } => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const timeDiff = scheduled.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < 0) {
      return {
        isOverdue: true,
        timeLabel: `${Math.abs(Math.floor(minutesDiff))} min ago`,
        urgency: 'overdue'
      };
    } else if (minutesDiff <= 30) {
      return {
        isOverdue: false,
        timeLabel: `in ${Math.floor(minutesDiff)} min`,
        urgency: 'soon'
      };
    } else {
      return {
        isOverdue: false,
        timeLabel: scheduled.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        urgency: 'normal'
      };
    }
  }
};

/**
 * Data validation utilities
 */
export const validateHealthData = {
  vitals: (vitals: Partial<VitalSigns>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Blood pressure validation
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      if (vitals.blood_pressure_systolic < 70 || vitals.blood_pressure_systolic > 250) {
        errors.push('Systolic blood pressure seems unusually high or low');
      }
      if (vitals.blood_pressure_diastolic < 40 || vitals.blood_pressure_diastolic > 150) {
        errors.push('Diastolic blood pressure seems unusually high or low');
      }
      if (vitals.blood_pressure_systolic <= vitals.blood_pressure_diastolic) {
        errors.push('Systolic pressure should be higher than diastolic pressure');
      }
    }

    // Heart rate validation
    if (vitals.heart_rate) {
      if (vitals.heart_rate < 30 || vitals.heart_rate > 220) {
        errors.push('Heart rate seems unusually high or low');
      } else if (vitals.heart_rate < 60 || vitals.heart_rate > 100) {
        warnings.push('Heart rate is outside normal resting range (60-100 bpm)');
      }
    }

    // Temperature validation
    if (vitals.temperature) {
      if (vitals.temperature < 95 || vitals.temperature > 110) {
        errors.push('Temperature seems unusually high or low');
      } else if (vitals.temperature > 100.4) {
        warnings.push('Temperature indicates possible fever');
      }
    }

    // Oxygen saturation validation
    if (vitals.oxygen_saturation) {
      if (vitals.oxygen_saturation < 70 || vitals.oxygen_saturation > 100) {
        errors.push('Oxygen saturation must be between 70-100%');
      } else if (vitals.oxygen_saturation < 95) {
        warnings.push('Oxygen saturation is below normal range (95-100%)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  medicationTiming: (scheduledTime: string, takenTime?: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const scheduled = new Date(scheduledTime);
    const taken = takenTime ? new Date(takenTime) : null;
    const now = new Date();

    if (scheduled > now) {
      errors.push('Cannot log medication for future scheduled time');
    }

    if (taken) {
      if (taken > now) {
        errors.push('Cannot log medication taken in the future');
      }
      
      const timeDiff = Math.abs(taken.getTime() - scheduled.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 2) {
        warnings.push('Medication taken more than 2 hours from scheduled time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};

/**
 * Privacy and consent utilities
 */
export const privacyUtils = {
  maskSensitiveData: (data: string, type: 'ssn' | 'phone' | 'email' | 'address' = 'ssn'): string => {
    switch (type) {
      case 'ssn':
        return data.replace(/\d{3}-?\d{2}-?(\d{4})/, 'XXX-XX-$1');
      case 'phone':
        return data.replace(/(\d{3})-?(\d{3})-?(\d{4})/, '$1-XXX-$3');
      case 'email':
        const [local, domain] = data.split('@');
        if (local.length > 2) {
          return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
        }
        return data;
      case 'address':
        return data.replace(/\d+/, 'XXX');
      default:
        return data;
    }
  },

  checkConsentExpiry: (consentDate: string, expiryMonths: number = 12): {
    isExpired: boolean;
    daysUntilExpiry: number;
    needsRenewal: boolean;
  } => {
    const consent = new Date(consentDate);
    const expiry = new Date(consent);
    expiry.setMonth(expiry.getMonth() + expiryMonths);
    
    const now = new Date();
    const msUntilExpiry = expiry.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: daysUntilExpiry < 0,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      needsRenewal: daysUntilExpiry <= 30 // Needs renewal if expires in 30 days
    };
  }
};

/**
 * Helper function for relative time formatting
 */
function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (Math.abs(diffDays) >= 2) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  } else if (Math.abs(diffDays) === 1) {
    return diffDays > 0 ? 'tomorrow' : 'yesterday';
  } else if (Math.abs(diffHours) >= 1) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  } else if (Math.abs(diffMinutes) >= 1) {
    return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
  } else {
    return 'now';
  }
}

/**
 * Export all utilities as a single object for convenience
 */
export const patientUtils = {
  formatVitalSigns,
  calculateAdherence,
  getHealthIndicators,
  healthcareDates,
  validateHealthData,
  privacyUtils
};
