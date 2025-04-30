/**
 * Index file for EHR services
 * Exports all EHR-related services from a single location
 */

// Re-export all EHR services
export { default as fhirService } from "./fhirService"
export { default as ehrService } from "./ehrService"

// Export default object with all EHR services
import fhirService from "./fhirService"
import ehrService from "./ehrService"

const ehrServices = {
  fhir: fhirService,
  ehr: ehrService,
}

export default ehrServices
