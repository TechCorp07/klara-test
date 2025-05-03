"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * MedicationList Component
 * Displays a list of medications for a patient with management options
 */
const MedicationList = ({ patientId }) => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMedications()
  }, [patientId])

  const fetchMedications = async () => {
    if (!patientId) return

    setLoading(true)
    try {
      const response = await medicationAPI.getPatientMedications(patientId)
      setMedications(response.medications || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching medications:", err)
      setError("Failed to load medications. Please try again.")
      toast.error("Failed to load medications")
    } finally {
      setLoading(false)
    }
  }

  const handleRefillRequest = async (medicationId) => {
    try {
      await medicationAPI.requestRefill(medicationId, {
        requestDate: new Date().toISOString(),
        urgent: false,
      })
      toast.success("Refill request submitted successfully")
      fetchMedications() // Refresh the list
    } catch (err) {
      console.error("Error requesting refill:", err)
      toast.error("Failed to request medication refill")
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
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

  if (medications.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No medications found for this patient.
      </div>
    )
  }

  return (
    <div className="medication-list">
      <h3 className="mb-4">Current Medications</h3>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((medication) => (
              <tr key={medication.id}>
                <td>{medication.name}</td>
                <td>{medication.dosage}</td>
                <td>{medication.frequency}</td>
                <td>{new Date(medication.startDate).toLocaleDateString()}</td>
                <td>{medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "Ongoing"}</td>
                <td>
                  <span className={`badge bg-${medication.active ? "success" : "secondary"}`}>
                    {medication.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleRefillRequest(medication.id)}
                      disabled={!medication.active || medication.refillRequested}
                    >
                      {medication.refillRequested ? "Refill Requested" : "Request Refill"}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => (window.location.href = `/medications/${medication.id}`)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MedicationList
