"use client"

import React from "react"
import EHRIntegration from "./EHRIntegration"
import EHRDataMapping from "./EHRDataMapping"

/**
 * EHR Integration Dashboard Component
 * Integrates all EHR integration components into a single dashboard
 */
const EHRDashboard = () => {
  const [selectedSystemId, setSelectedSystemId] = React.useState(null)

  const handleSystemSelect = (systemId) => {
    setSelectedSystemId(systemId)
  }

  return (
    <div className="ehr-dashboard">
      <h2 className="mb-4">Healthcare System Integration</h2>

      <div className="row mb-4">
        <div className="col-12">
          <EHRIntegration onSystemSelect={handleSystemSelect} />
        </div>
      </div>

      {selectedSystemId && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Data Mapping Configuration</h3>
              </div>
              <div className="card-body">
                <EHRDataMapping systemId={selectedSystemId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EHRDashboard
