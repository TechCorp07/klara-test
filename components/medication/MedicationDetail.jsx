"use client"

import React, { useState } from "react"
import { toast } from "react-toastify"

/**
 * MedicationDetail Component
 * Displays detailed information about a medication and allows management
 */
const MedicationDetail = ({ medicationId, onUpdate }) => {
  const [medication, setMedication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  React.useEffect(() => {
    if (medicationId) {
      fetchMedicationDetails()
    }
  }, [medicationId])

  const fetchMedicationDetails = async () => {
    setLoading(true)
    try {
      const response = await medicationAPI.getMedication(medicationId)
      setMedication(response)
      setFormData(response)
      setError(null)
    } catch (err) {
      console.error("Error fetching medication details:", err)
      setError("Failed to load medication details. Please try again.")
      toast.error("Failed to load medication details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await medicationAPI.updateMedication(medicationId, formData)
      toast.success("Medication updated successfully")
      setIsEditing(false)
      fetchMedicationDetails()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error("Error updating medication:", err)
      toast.error("Failed to update medication")
    }
  }

  const handleRefillRequest = async () => {
    try {
      await medicationAPI.requestRefill(medicationId, {
        requestDate: new Date().toISOString(),
        urgent: false,
      })
      toast.success("Refill request submitted successfully")
      fetchMedicationDetails()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error("Error requesting refill:", err)
      toast.error("Failed to request medication refill")
    }
  }

  const handleRecordIntake = async () => {
    try {
      await medicationAPI.recordIntake(medicationId, {
        intakeDate: new Date().toISOString(),
        dosageTaken: medication.dosage,
      })
      toast.success("Medication intake recorded successfully")
      fetchMedicationDetails()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error("Error recording intake:", err)
      toast.error("Failed to record medication intake")
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

  if (!medication) {
    return (
      <div className="alert alert-info" role="alert">
        No medication found with the provided ID.
      </div>
    )
  }

  return (
    <div className="medication-detail">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">{medication.name}</h3>
          <div>
            {!isEditing ? (
              <button className="btn btn-outline-primary me-2" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(medication)
                }}
              >
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary me-2"
              onClick={handleRefillRequest}
              disabled={!medication.active || medication.refillRequested}
            >
              {medication.refillRequested ? "Refill Requested" : "Request Refill"}
            </button>
            <button className="btn btn-success" onClick={handleRecordIntake} disabled={!medication.active}>
              Record Intake
            </button>
          </div>
        </div>
        <div className="card-body">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Medication Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="dosage" className="form-label">
                  Dosage
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="frequency" className="form-label">
                  Frequency
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="frequency"
                  name="frequency"
                  value={formData.frequency || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate ? formData.startDate.substring(0, 10) : ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate ? formData.endDate.substring(0, 10) : ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="active"
                  name="active"
                  checked={formData.active || false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="active">
                  Active
                </label>
              </div>
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          ) : (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h5>Medication Details</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Dosage</th>
                        <td>{medication.dosage}</td>
                      </tr>
                      <tr>
                        <th>Frequency</th>
                        <td>{medication.frequency}</td>
                      </tr>
                      <tr>
                        <th>Start Date</th>
                        <td>{new Date(medication.startDate).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <th>End Date</th>
                        <td>{medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "Ongoing"}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>
                          <span className={`badge bg-${medication.active ? "success" : "secondary"}`}>
                            {medication.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5>Prescription Information</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Prescribed By</th>
                        <td>{medication.prescribedBy}</td>
                      </tr>
                      <tr>
                        <th>Prescription Date</th>
                        <td>{new Date(medication.prescriptionDate).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <th>Refills Remaining</th>
                        <td>{medication.refillsRemaining}</td>
                      </tr>
                      <tr>
                        <th>Pharmacy</th>
                        <td>{medication.pharmacy}</td>
                      </tr>
                      <tr>
                        <th>Last Refill Date</th>
                        <td>
                          {medication.lastRefillDate ? new Date(medication.lastRefillDate).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {medication.notes && (
                <div className="mb-3">
                  <h5>Notes</h5>
                  <p>{medication.notes}</p>
                </div>
              )}
              {medication.sideEffects && medication.sideEffects.length > 0 && (
                <div className="mb-3">
                  <h5>Potential Side Effects</h5>
                  <ul className="list-group">
                    {medication.sideEffects.map((effect, index) => (
                      <li key={index} className="list-group-item">
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicationDetail
