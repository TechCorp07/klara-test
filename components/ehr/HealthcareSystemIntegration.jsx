"use client"

import { useState, useEffect } from "react"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * HealthcareSystemIntegration Component
 * Provides integration with major healthcare EHR systems (Epic, Cerner, Meditech)
 */
const HealthcareSystemIntegration = ({
  systemType = null, // 'epic', 'cerner', 'meditech', or null for all
  onConnect = () => {},
  onDisconnect = () => {},
  onSync = () => {},
}) => {
  const { isMobile } = useMobileOptimization()
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState({})
  const [selectedSystem, setSelectedSystem] = useState(systemType)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [configForm, setConfigForm] = useState({
    apiKey: "",
    apiEndpoint: "",
    username: "",
    password: "",
    connectionType: "api",
  })

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    setLoading(true)
    try {
      // This would be an actual API call in a real implementation
      // const response = await ehrAPI.getIntegrations();

      // Simulated response for demonstration
      const mockResponse = {
        integrations: [
          {
            id: "epic-1",
            name: "Epic EHR",
            type: "epic",
            status: "connected",
            lastSync: "2025-04-17T14:30:00Z",
            connectionDetails: {
              apiEndpoint: "https://epicehr-api.example.com/fhir",
              connectionType: "api",
              dataAccess: ["patients", "medications", "appointments", "results"],
            },
            metrics: {
              patientsCount,
              recordsCount,
              syncSuccess: 98.5,
            },
          },
          {
            id: "cerner-1",
            name: "Cerner Millennium",
            type: "cerner",
            status: "disconnected",
            lastSync,
            connectionDetails: {
              apiEndpoint: "",
              connectionType: "api",
              dataAccess: [],
            },
            metrics: {
              patientsCount,
              recordsCount,
              syncSuccess: 0,
            },
          },
          {
            id: "meditech-1",
            name: "Meditech Expanse",
            type: "meditech",
            status: "error",
            lastSync: "2025-04-10T09:15:00Z",
            connectionDetails: {
              apiEndpoint: "https://meditech-api.example.com/v1",
              connectionType: "api",
              dataAccess: ["patients", "medications"],
            },
            metrics: {
              patientsCount,
              recordsCount,
              syncSuccess: 45.2,
            },
            error: "Authentication failed. API key may be expired.",
          },
        ],
      }

      // Filter integrations based on systemType if provided
      let filteredIntegrations = mockResponse.integrations
      if (systemType) {
        filteredIntegrations = filteredIntegrations.filter((integration) => integration.type === systemType)
      }

      setIntegrations(filteredIntegrations)

      // Initialize sync status
      const initialSyncStatus = {}
      filteredIntegrations.forEach((integration) => {
        initialSyncStatus[integration.id] = false
      })
      setSyncStatus(initialSyncStatus)

      setError(null)
    } catch (err) {
      console.error("Error fetching healthcare system integrations:", err)
      setError("Failed to load integrations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationId) => {
    // In a real implementation, this would call the API to establish a connection
    // For demonstration, we'll update the local state

    setIntegrations((prevIntegrations) =>
      prevIntegrations.map((integration) =>
        integration.id === integrationId ? { ...integration, status: "connected", error: null } : integration,
      ),
    )

    onConnect(integrationId)
  }

  const handleDisconnect = async (integrationId) => {
    // In a real implementation, this would call the API to disconnect
    // For demonstration, we'll update the local state

    setIntegrations((prevIntegrations) =>
      prevIntegrations.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              status: "disconnected",
              lastSync,
              metrics: {
                patientsCount,
                recordsCount,
                syncSuccess: 0,
              },
            }
          : integration,
      ),
    )

    onDisconnect(integrationId)
  }

  const handleSync = async (integrationId) => {
    // Set sync status to true for this integration
    setSyncStatus((prev) => ({
      ...prev,
      [integrationId]: true,
    }))

    try {
      // In a real implementation, this would call the API to sync data
      // For demonstration, we'll simulate a delay and update
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update the integration with new sync time
      setIntegrations((prevIntegrations) =>
        prevIntegrations.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                lastSync: new Date().toISOString(),
                metrics: {
                  ...integration.metrics,
                  syncSuccess: Math.min(100, integration.metrics.syncSuccess + 5),
                },
              }
            : integration,
        ),
      )

      onSync(integrationId, true)
    } catch (err) {
      console.error("Error syncing with healthcare system:", err)
      onSync(integrationId, false, err.message)
    } finally {
      // Reset sync status
      setSyncStatus((prev) => ({
        ...prev,
        [integrationId]: false,
      }))
    }
  }

  const handleConfigSubmit = (e) => {
    e.preventDefault()

    // In a real implementation, this would call the API to configure the integration
    // For demonstration, we'll update the local state

    const newIntegration = {
      id: `${configForm.connectionType}-${Date.now()}`,
      name: getSystemName(configForm.connectionType),
      type: configForm.connectionType,
      status: "connected",
      lastSync: new Date().toISOString(),
      connectionDetails: {
        apiEndpoint: configForm.apiEndpoint,
        connectionType: "api",
        dataAccess: ["patients", "medications"],
      },
      metrics: {
        patientsCount,
        recordsCount,
        syncSuccess: 100,
      },
    }

    setIntegrations((prev) => [...prev, newIntegration])
    setConfigModalOpen(false)
    setConfigForm({
      apiKey: "",
      apiEndpoint: "",
      username: "",
      password: "",
      connectionType: "api",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setConfigForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getSystemName = (type) => {
    switch (type) {
      case "epic":
        return "Epic EHR"
      case "cerner":
        return "Cerner Millennium"
      case "meditech":
        return "Meditech Expanse"
      default:
        return "Custom EHR System"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "connected":
        return <span className="badge bg-success">Connected</span>
      case "disconnected":
        return <span className="badge bg-secondary">Disconnected</span>
      case "error":
        return <span className="badge bg-danger">Error</span>
      default:
        return <span className="badge bg-info">{status}</span>
    }
  }

  const getSystemIcon = (type) => {
    switch (type) {
      case "epic":
        return <i className="bi bi-hospital text-primary"></i>
      case "cerner":
        return <i className="bi bi-hospital text-success"></i>
      case "meditech":
        return <i className="bi bi-hospital text-danger"></i>
      default:
        return <i className="bi bi-hospital text-secondary"></i>
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading integrations...</span>
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

  if (integrations.length === 0) {
    return (
      <div className="text-center my-5">
        <div className="mb-4">
          <i className="bi bi-hospital display-1 text-muted"></i>
        </div>
        <h4>No Healthcare System Integrations Available</h4>
        <p className="text-muted">
          Connect with major EHR systems like Epic, Cerner, and Meditech to sync patient data.
        </p>
        <button className="btn btn-primary mt-3" onClick={() => setConfigModalOpen(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Integration
        </button>
      </div>
    )
  }

  return (
    <div className="healthcare-system-integration">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-hospital me-2"></i>
          Healthcare System Integrations
        </h4>

        <div>
          <button className="btn btn-primary" onClick={() => setConfigModalOpen(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Integration
          </button>
        </div>
      </div>

      <div className="row">
        {integrations.map((integration) => (
          <div key={integration.id} className="col-md-6 col-lg-4 mb-4">
            <div className={`card h-100 ${integration.status === "error" ? "border-danger" : ""}`}>
              <div
                className={`card-header d-flex justify-content-between align-items-center ${integration.status === "error" ? "bg-danger text-white" : ""}`}
              >
                <div className="d-flex align-items-center">
                  {getSystemIcon(integration.type)}
                  <h5 className="mb-0 ms-2">{integration.name}</h5>
                </div>
                {getStatusBadge(integration.status)}
              </div>
              <div className="card-body">
                {integration.status === "error" && (
                  <div className="alert alert-danger mb-3">
                    <strong>Error:</strong> {integration.error}
                  </div>
                )}

                <div className="mb-3">
                  <strong>Connection Type:</strong> {integration.connectionDetails.connectionType.toUpperCase()}
                </div>

                {integration.connectionDetails.apiEndpoint && (
                  <div className="mb-3">
                    <strong>API Endpoint:</strong>
                    <div className="text-muted small text-truncate">{integration.connectionDetails.apiEndpoint}</div>
                  </div>
                )}

                {integration.status === "connected" && (
                  <>
                    <div className="mb-3">
                      <strong>Last Synchronized:</strong>
                      <div>{integration.lastSync ? new Date(integration.lastSync).toLocaleString() : "Never"}</div>
                    </div>

                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="h4">{integration.metrics.patientsCount}</div>
                        <div className="small text-muted">Patients</div>
                      </div>
                      <div className="col-4">
                        <div className="h4">{integration.metrics.recordsCount}</div>
                        <div className="small text-muted">Records</div>
                      </div>
                      <div className="col-4">
                        <div className="h4">{integration.metrics.syncSuccess}%</div>
                        <div className="small text-muted">Success</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Data Access:</strong>
                      <div>
                        {integration.connectionDetails.dataAccess.length > 0 ? (
                          integration.connectionDetails.dataAccess.map((access) => (
                            <span key={access} className="badge bg-info me-1 mb-1">
                              {access}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">No data access configured</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  {integration.status === "connected" ? (
                    <>
                      <button className="btn btn-outline-danger" onClick={() => handleDisconnect(integration.id)}>
                        Disconnect
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncStatus[integration.id]}
                      >
                        {syncStatus[integration.id] ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Syncing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Sync Now
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-success w-100" onClick={() => handleConnect(integration.id)}>
                      <i className="bi bi-plug me-2"></i>
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {configModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Configure Healthcare System Integration</h5>
                <button type="button" className="btn-close" onClick={() => setConfigModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleConfigSubmit}>
                  <div className="mb-3">
                    <label htmlFor="connectionType" className="form-label">
                      System Type
                    </label>
                    <select
                      id="connectionType"
                      name="connectionType"
                      className="form-select"
                      value={configForm.connectionType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select System Type</option>
                      <option value="epic">Epic EHR</option>
                      <option value="cerner">Cerner Millennium</option>
                      <option value="meditech">Meditech Expanse</option>
                      <option value="custom">Custom EHR System</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="apiEndpoint" className="form-label">
                      API Endpoint
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="apiEndpoint"
                      name="apiEndpoint"
                      value={configForm.apiEndpoint}
                      onChange={handleInputChange}
                      placeholder="https://example.com/api/fhir"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="apiKey" className="form-label">
                      API Key
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="apiKey"
                      name="apiKey"
                      value={configForm.apiKey}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={configForm.username}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={configForm.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setConfigModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  )
}

export default HealthcareSystemIntegration
