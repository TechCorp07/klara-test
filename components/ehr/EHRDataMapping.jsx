"use client"

import React, { useState } from "react"
import { toast } from "react-toastify"

/**
 * EHR Data Mapping Component
 * Allows users to configure data mappings between EHR systems and FHIR
 */
const EHRDataMapping = ({ systemId }) => {
  const [mappings, setMappings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch data mappings when component mounts or systemId changes
  React.useEffect(() => {
    if (systemId) {
      fetchDataMappings(systemId)
    }
  }, [systemId])

  const fetchDataMappings = async (id) => {
    setLoading(true)
    try {
      const response = await ehrAPI.getDataMappings(id)
      setMappings(response.mappings || {})
    } catch (error) {
      console.error("Error fetching data mappings:", error)
      toast.error(error.message || "Failed to fetch data mappings")
    } finally {
      setLoading(false)
    }
  }

  const handleMappingChange = (resourceType, field, value) => {
    setMappings((prev) => ({
      ...prev,
      [resourceType]: {
        ...prev[resourceType],
        [field]: value,
      },
    }))
  }

  const handleSaveMappings = async () => {
    if (!systemId) {
      toast.error("No EHR system selected")
      return
    }

    setSaving(true)
    try {
      await ehrAPI.updateDataMappings(systemId, mappings)
      toast.success("Data mappings updated successfully")
    } catch (error) {
      console.error("Error updating data mappings:", error)
      toast.error(error.message || "Failed to update data mappings")
    } finally {
      setSaving(false)
    }
  }

  if (!systemId) {
    return <div className="alert alert-info">Please select an EHR system to configure data mappings.</div>
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading data mappings...</p>
      </div>
    )
  }

  if (!mappings) {
    return <div className="alert alert-warning">No data mappings available for this EHR system.</div>
  }

  return (
    <div className="ehr-data-mapping">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Data Field Mappings</h3>
        <button className="btn btn-primary" onClick={handleSaveMappings} disabled={saving}>
          {saving ? "Saving..." : "Save Mappings"}
        </button>
      </div>

      <div className="accordion" id="mappingAccordion">
        {Object.keys(mappings).map((resourceType) => (
          <div className="accordion-item" key={resourceType}>
            <h2 className="accordion-header" id={`heading-${resourceType}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${resourceType}`}
                aria-expanded="false"
                aria-controls={`collapse-${resourceType}`}
              >
                {resourceType} Mappings
              </button>
            </h2>
            <div
              id={`collapse-${resourceType}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${resourceType}`}
              data-bs-parent="#mappingAccordion"
            >
              <div className="accordion-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>FHIR Field</th>
                      <th>EHR Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(mappings[resourceType]).map((field) => (
                      <tr key={field}>
                        <td>{field}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={mappings[resourceType][field]}
                            onChange={(e) => handleMappingChange(resourceType, field, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-4">
        <h5>Mapping Instructions</h5>
        <p>
          Map FHIR fields to their corresponding fields in your EHR system. This ensures data is correctly synchronized
          between systems.
        </p>
        <p>
          For example, if your EHR system uses "PatientName" for patient names, map the FHIR "name" field to
          "PatientName".
        </p>
      </div>
    </div>
  )
}

export default EHRDataMapping
