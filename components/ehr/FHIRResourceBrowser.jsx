"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { fhirService } from "../../lib/services/ehr/fhirService"

/**
 * FHIR Resource Browser Component
 * Allows users to browse and manage FHIR resources
 */
const FHIRResourceBrowser = ({ resourceType = "Patient", patientId = null }) => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)
  const [searchParams, setSearchParams] = useState({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Load resources on component mount or when parameters change
  useEffect(() => {
    fetchResources()
  }, [resourceType, patientId, page, pageSize, searchParams])

  const fetchResources = async () => {
    setLoading(true)
    setError(null)

    try {
      let response

      // If patientId is provided, get resources for that patient
      if (patientId) {
        response = await fhirService.getPatientResources(patientId, resourceType, {
          _count,
          _page,
          ...searchParams,
        })
      } else {
        // Otherwise, search all resources of the specified /**\
        *
        @typedef
        await fhirService.searchResources(resourceType, {
          _count,
          _page,
          ...searchParams,
        })
        response * /
      }

      if (response && response.entry) {
        setResources(response.entry.map((entry) => entry.resource))

        // Calculate total pages if pagination info is available
        if (response.total) {
          setTotalPages(Math.ceil(response.total / pageSize))
        } else if (response.link) {
          // Try to determine total pages from links
          const lastLink = response.link.find((link) => link.relation === "last")
          if (lastLink && lastLink.url) {
            const url = new URL(lastLink.url)
            const lastPage = url.searchParams.get("_page")
            if (lastPage) {
              setTotalPages(Number.parseInt(lastPage, 10))
            }
          }
        }
      } else {
        setResources([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      setError(error.message || `Failed to fetch ${resourceType} resources`)
      toast.error(error.message || `Failed to fetch ${resourceType} resources`)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Reset to first page when searching
    setPage(1)
    fetchResources()
  }

  const handleSearchParamChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleResourceTypeChange = (e) => {
    const newResourceType = e.target.value
    setResourceType(newResourceType)
    setSelectedResource(null)
    setPage(1)
    setSearchParams({})
  }

  const renderResourceList = () => {
    if (loading) {
      return (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )
    }

    if (resources.length === 0) {
      return (
        <div className="alert alert-info" role="alert">
          No {resourceType} resources found.
        </div>
      )
    }

    return (
      <div className="list-group">
        {resources.map((resource, index) => (
          <button
            key={resource.id || index}
            className={`list-group-item list-group-item-action ${selectedResource && selectedResource.id === resource.id ? "active" : ""}`}
            onClick={() => handleResourceSelect(resource)}
          >
            {renderResourceSummary(resource)}
          </button>
        ))}
      </div>
    )
  }

  const renderResourceSummary = (resource) => {
    // Different display based on resource type
    switch (resourceType) {
      case "Patient":
        return (
          <div>
            <div className="fw-bold">{getPatientName(resource)}</div>
            <div className="small">ID: {resource.id}</div>
            {resource.birthDate && <div className="small">DOB: {resource.birthDate}</div>}
          </div>
        )
      case "Observation":
        return (
          <div>
            <div className="fw-bold">{getObservationDisplay(resource)}</div>
            <div className="small">Date: {resource.effectiveDateTime || "N/A"}</div>
          </div>
        )
      case "MedicationRequest":
        return (
          <div>
            <div className="fw-bold">{getMedicationDisplay(resource)}</div>
            <div className="small">Status: {resource.status}</div>
          </div>
        )
      default:
        return (
          <div>
            <div className="fw-bold">{resource.id}</div>
            <div className="small">{resourceType}</div>
          </div>
        )
    }
  }

  const getPatientName = (patient) => {
    if (!patient || !patient.name || patient.name.length === 0) {
      return "Unknown Patient"
    }

    const name = patient.name[0]
    const given = name.given ? name.given.join(" ") : ""
    const family = name.family || ""

    return `${given} ${family}`.trim() || "Unknown Patient"
  }

  const getObservationDisplay = (observation) => {
    if (!observation) return "Unknown Observation"

    if (observation.code && observation.code.text) {
      return observation.code.text
    }

    if (observation.code && observation.code.coding && observation.code.coding.length > 0) {
      return observation.code.coding[0].display || observation.code.coding[0].code
    }

    return "Unknown Observation"
  }

  const getMedicationDisplay = (medicationRequest) => {
    if (!medicationRequest) return "Unknown Medication"

    if (medicationRequest.medicationCodeableConcept && medicationRequest.medicationCodeableConcept.text) {
      return medicationRequest.medicationCodeableConcept.text
    }

    if (
      medicationRequest.medicationCodeableConcept &&
      medicationRequest.medicationCodeableConcept.coding &&
      medicationRequest.medicationCodeableConcept.coding.length > 0
    ) {
      return (
        medicationRequest.medicationCodeableConcept.coding[0].display ||
        medicationRequest.medicationCodeableConcept.coding[0].code
      )
    }

    if (medicationRequest.medicationReference && medicationRequest.medicationReference.display) {
      return medicationRequest.medicationReference.display
    }

    return "Unknown Medication"
  }

  const renderResourceDetail = () => {
    if (!selectedResource) {
      return (
        <div className="alert alert-info" role="alert">
          Select a resource to view details
        </div>
      )
    }

    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Resource Details</h5>
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={() => handleValidateResource(selectedResource)}
            >
              Validate
            </button>
          </div>
        </div>
        <div className="card-body">
          <pre className="resource-json">{JSON.stringify(selectedResource, null, 2)}</pre>
        </div>
      </div>
    )
  }

  const handleValidateResource = async (resource) => {
    try {
      const validationResult = await fhirService.validateResource(resourceType, resource)

      if (validationResult.issue && validationResult.issue.length > 0) {
        // Check if there are any errors
        const errors = validationResult.issue.filter(
          (issue) => issue.severity === "error" || issue.severity === "fatal",
        )

        if (errors.length > 0) {
          toast.error("Resource validation failed")
          // Display validation errors
          errors.forEach((error) => {
            toast.error(`${error.severity}: ${error.diagnostics || error.details?.text || "Unknown error"}`)
          })
        } else {
          toast.success("Resource is valid")
        }
      } else {
        toast.success("Resource is valid")
      }
    } catch (error) {
      console.error("Validation error:", error)
      toast.error(error.message || "Resource validation failed")
    }
  }

  return (
    <div className="fhir-resource-browser">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>FHIR Resource Browser</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="resourceType" className="form-label">
                  Resource Type
                </label>
                <select
                  id="resourceType"
                  className="form-select"
                  value={resourceType}
                  onChange={handleResourceTypeChange}
                  disabled={loading}
                >
                  <option value="Patient">Patient</option>
                  <option value="Observation">Observation</option>
                  <option value="MedicationRequest">Medication Request</option>
                  <option value="Condition">Condition</option>
                  <option value="AllergyIntolerance">Allergy Intolerance</option>
                  <option value="Immunization">Immunization</option>
                  <option value="Procedure">Procedure</option>
                  <option value="DiagnosticReport">Diagnostic Report</option>
                </select>
              </div>

              <form onSubmit={handleSearch} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    name="_content"
                    value={searchParams._content || ""}
                    onChange={handleSearchParamChange}
                    disabled={loading}
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Search
                  </button>
                </div>
              </form>

              {renderResourceList()}

              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || loading}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(totalPages).keys()].map((i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)} disabled={loading}>
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || loading}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">{renderResourceDetail()}</div>
      </div>
    </div>
  )
}

export default FHIRResourceBrowser
