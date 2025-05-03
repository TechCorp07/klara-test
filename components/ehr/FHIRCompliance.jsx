"use client"

import { useState, useEffect } from "react"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * FHIRCompliance Component
 * Ensures compatibility with healthcare data standards through FHIR compliance
 */
const FHIRCompliance = ({
  resourceType = null, // Optional filter for specific resource /**
 * @typedef {null,    // Optional filter for specific patient
  onValidate = () => {},
  onExport = () => {}
})
=>
{
  const { isMobile } = useMobileOptimization()
}
patientId * /
const [resources, setResources] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [selectedResource, setSelectedResource] = useState(null)
const [validationResults, setValidationResults] = useState(null)
const [exportFormat, setExportFormat] = useState("json")
const [exportStatus, setExportStatus] = useState(null)

useEffect(() => {
  fetchFHIRResources()
}, [resourceType, patientId])

const fetchFHIRResources = async () => {
  setLoading(true)
  try {
    // This would be an actual API call in a real implementation
    // const response = await fhirAPI.getResources({ resourceType, patientId });

    // Simulated response for demonstration
    const mockResponse = {
      resources: [
        {
          id: "patient-1",
          resourceType: "Patient",
          lastUpdated: "2025-04-15T10:30:00Z",
          version: "1.2",
          status: "active",
          validationStatus: "valid",
          content: {
            resourceType: "Patient",
            id: "patient-1",
            meta: {
              versionId: "1.2",
              lastUpdated: "2025-04-15T10:30:00Z",
            },
            active,
            name: [
              {
                use: "official",
                family: "Smith",
                given: ["John", "Edward"],
              },
            ],
            gender: "male",
            birthDate: "1970-01-25",
            address: [
              {
                use: "home",
                line: ["123 Main St"],
                city: "Anytown",
                state: "CA",
                postalCode: "12345",
                country: "USA",
              },
            ],
          },
        },
        {
          id: "observation-1",
          resourceType: "Observation",
          lastUpdated: "2025-04-16T14:20:00Z",
          version: "1.0",
          status: "final",
          validationStatus: "warning",
          validationMessage: "Missing recommended code system",
          content: {
            resourceType: "Observation",
            id: "observation-1",
            meta: {
              versionId: "1.0",
              lastUpdated: "2025-04-16T14:20:00Z",
            },
            status: "final",
            category: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs",
                  },
                ],
              },
            ],
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8867-4",
                  display: "Heart rate",
                },
              ],
              text: "Heart rate",
            },
            subject: {
              reference: "Patient/patient-1",
            },
            effectiveDateTime: "2025-04-16T14:15:00Z",
            valueQuantity: {
              value,
              unit: "beats/minute",
              system: "http://unitsofmeasure.org",
              code: "/min",
            },
          },
        },
        {
          id: "medication-1",
          resourceType: "MedicationRequest",
          lastUpdated: "2025-04-14T09:45:00Z",
          version: "2.1",
          status: "active",
          validationStatus: "error",
          validationMessage: "Missing required dosage instructions",
          content: {
            resourceType: "MedicationRequest",
            id: "medication-1",
            meta: {
              versionId: "2.1",
              lastUpdated: "2025-04-14T09:45:00Z",
            },
            status: "active",
            intent: "order",
            medicationCodeableConcept: {
              coding: [
                {
                  system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                  code: "1191",
                  display: "Aspirin",
                },
              ],
              text: "Aspirin",
            },
            subject: {
              reference: "Patient/patient-1",
            },
            authoredOn: "2025-04-14T09:30:00Z",
            // Missing dosageInstruction which is causing the validation error
          },
        },
      ],
    }

    // Filter resources based on resourceType if provided
    let filteredResources = mockResponse.resources
    if (resourceType) {
      filteredResources = filteredResources.filter((resource) => resource.resourceType === resourceType)
    }

    // Filter resources based on patientId if provided
    if (patientId) {
      filteredResources = filteredResources.filter(
        (resource) => resource.content.subject?.reference === `Patient/${patientId}` || resource.id === patientId,
      )
    }

    setResources(filteredResources)
    setError(null)
  } catch (err) {
    console.error("Error fetching FHIR resources:", err)
    setError("Failed to load FHIR resources. Please try again.")
  } finally {
    setLoading(false)
  }
}

const handleResourceSelect = (resource) => {
  setSelectedResource(resource)
  setValidationResults(null)
}

const handleValidateResource = async () => {
  if (!selectedResource) return

  try {
    // This would be an actual API call in a real implementation
    // const results = await fhirAPI.validateResource(selectedResource.resourceType, selectedResource.content);

    // Simulated validation for demonstration
    let mockResults

    if (selectedResource.validationStatus === "valid") {
      mockResults = {
        valid,
        issues: [],
      }
    } else if (selectedResource.validationStatus === "warning") {
      mockResults = {
        valid,
        issues: [
          {
            severity: "warning",
            code: "incomplete",
            details: "Missing recommended code system",
            location: "Observation.code.coding",
          },
        ],
      }
    } else {
      mockResults = {
        valid,
        issues: [
          {
            severity: "error",
            code: "required",
            details: "Missing required dosage instructions",
            location: "MedicationRequest.dosageInstruction",
          },
        ],
      }
    }

    setValidationResults(mockResults)
    onValidate(selectedResource.id, mockResults)
  } catch (err) {
    console.error("Error validating FHIR resource:", err)
    setValidationResults({
      valid,
      issues: [
        {
          severity: "error",
          code: "exception",
          details: "Validation service error: " + err.message,
        },
      ],
    })
  }
}

const handleExportResource = async () => {
  if (!selectedResource) return

  setExportStatus("processing")

  try {
    // This would be an actual API call in a real implementation
    // const result = await fhirAPI.exportResource(selectedResource.id, exportFormat);

    // Simulated export for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResult = {
      success,
      downloadUrl: `#mock-download-${selectedResource.id}.${exportFormat}`,
      format: exportFormat,
    }

    setExportStatus("success")
    onExport(selectedResource.id, mockResult)

    // Reset status after a delay
    setTimeout(() => {
      setExportStatus(null)
    }, 3000)
  } catch (err) {
    console.error("Error exporting FHIR resource:", err)
    setExportStatus("error")

    // Reset status after a delay
    setTimeout(() => {
      setExportStatus(null)
    }, 3000)
  }
}

const getValidationStatusBadge = (status) => {
  switch (status) {
    case "valid":
      return <span className="badge bg-success">Valid</span>
    case "warning":
      return <span className="badge bg-warning text-dark">Warning</span>
    case "error":
      return <span className="badge bg-danger">Error</span>
    default:
      return <span className="badge bg-secondary">{status}</span>
  }
}

const formatJSON = (json) => {
  return JSON.stringify(json, null, 2)
}

if (loading && resources.length === 0) {
  return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading FHIR resources...</span>
        </div>
      </div>
    );
}

if (error && resources.length === 0) {
  return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
}

if (resources.length === 0) {
  return (
      <div className="alert alert-info" role="alert">
        No FHIR resources found matching the criteria.
      </div>
    );
}

return (
    <div className="fhir-compliance">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-shield-check me-2"></i>
          FHIR Compliance
        </h4>
        
        <button 
          className="btn btn-outline-primary"
          onClick={fetchFHIRResources}
        >
          <i className="bi bi-arrow-repeat me-2"></i>
          Refresh
        </button>
      </div>
      
      <div className="row">
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">FHIR Resources</h5>
            </div>
            <div className="list-group list-group-flush">
              {resources.map((resource) => (
                <button
                  key={resource.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedResource?.id === resource.id ? 'active' : ''}`}
                  onClick={() => handleResourceSelect(resource)}
                >
                  <div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-text me-2"></i>
                      <strong>{resource.resourceType}</strong>
                      <span className="ms-2 text-muted">({resource.id})</span>
                    </div>
                    <small className="text-muted">
                      Last updated: {new Date(resource.lastUpdated).toLocaleString()}
                    </small>
                  </div>
                  {getValidationStatusBadge(resource.validationStatus)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-7">
          {selectedResource ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {selectedResource.resourceType} - {selectedResource.id}
                </h5>
                {getValidationStatusBadge(selectedResource.validationStatus)}
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <strong>Version:</strong> {selectedResource.version}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedResource.status}
                    </div>
                  </div>
                  
                  {selectedResource.validationMessage && (
                    <div className={`alert alert-${selectedResource.validationStatus === 'warning' ? 'warning' : 'danger'} mb-3`}>
                      {selectedResource.validationMessage}
                    </div>
                  )}
                  
                  <div className="d-flex mb-3">
                    <button 
                      className="btn btn-primary me-2"
                      onClick={handleValidateResource}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Validate
                    </button>
                    
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                      <select 
                        className="form-select"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="pdf">PDF</option>
                      </select>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleExportResource}
                        disabled={exportStatus === 'processing'}
                      >
                        {exportStatus === 'processing' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Exporting...
                          </>
                        ) : exportStatus === 'success' ? (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Exported
                          </>
                        ) : exportStatus === 'error' ? (
                          <>
                            <i className="bi bi-x-circle me-2"></i>
                            Failed
                          </>
                        ) : (
                          <>
                            <i className="bi bi-download me-2"></i>
                            Export
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {validationResults && (
                    <div className={`alert ${validationResults.valid ? 'alert-success' : 'alert-danger'} mb-3`}>
                      <h6>Validation Results:</h6>
                      {validationResults.valid && validationResults.issues.length === 0 ? (
                        <p className="mb-0">Resource is valid according to FHIR standards.</p>
                      ) : (
                        <>
                          <p>
                            {validationResults.valid 
                              ? 'Resource is valid but has warnings:' 
                              : 'Resource has validation errors:'}
                          </p>
                          <ul className="mb-0">
                            {validationResults.issues.map((issue, index) => (
                              <li key={index}>
                                <strong>{issue.severity}:</strong> {issue.details}
                                {issue.location && <div><small>Location: {issue.location}</small></div>}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                  
                  <h6>Resource Content:</h6>
                  <div className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <pre className="mb-0"><code>{formatJSON(selectedResource.content)}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center p-5">
                <i className="bi bi-arrow-left-circle display-4 text-muted mb-3"></i>
                <h5>Select a FHIR resource to view details</h5>
                <p className="text-muted">
                  You can validate resources against FHIR standards and export them in different formats.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FHIRCompliance
