/**
 * Index file for utility functions
 * Exports all utility functions from a single location
 */

// Re-export all utility functions
export * from './dateUtils';
export * from './stringUtils';
export * from './validationUtils';
export * from './formatUtils';
export * from './healthcareUtils';

// Export default object with all utilities grouped by category
import * as dateUtils from './dateUtils';
import * as stringUtils from './stringUtils';
import * as validationUtils from './validationUtils';
import * as formatUtils from './formatUtils';
import * as healthcareUtils from './healthcareUtils';

const utils = {
  date: dateUtils,
  string: stringUtils,
  validation: validationUtils,
  format: formatUtils,
  healthcare: healthcareUtils
};

export default utils;
