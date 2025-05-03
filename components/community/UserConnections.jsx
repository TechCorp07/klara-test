"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * UserConnections Component
 * Displays and manages user connections in the community
 */
const UserConnections = () => {
  const [connections, setConnections] = useState([])
  const [connectionRequests, setConnectionRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchConnections()
    fetchConnectionRequests()
  }, [])

  const fetchConnections = async () => {
    setLoading(true)
    try {
      const response = await communityAPI.getConnections()
      setConnections(response.connections || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching connections:", err)
      setError("Failed to load connections. Please try again.")
      toast.error("Failed to load connections")
    } finally {
      setLoading(false)
    }
  }

  const fetchConnectionRequests = async () => {
    setRequestsLoading(true)
    try {
      const response = await communityAPI.getConnectionRequests()
      setConnectionRequests(response.requests || [])
    } catch (err) {
      console.error("Error fetching connection requests:", err)
      toast.error("Failed to load connection requests")
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleSendConnectionRequest = async (userId) => {
    try {
      await communityAPI.sendConnectionRequest(userId)
      toast.success("Connection request sent successfully")
      // Refresh the connections list
      fetchConnections()
    } catch (err) {
      console.error("Error sending connection request:", err)
      toast.error("Failed to send connection request")
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await communityAPI.acceptConnectionRequest(requestId)
      toast.success("Connection request accepted")
      // Refresh both connections and requests
      fetchConnections()
      fetchConnectionRequests()
    } catch (err) {
      console.error("Error accepting connection request:", err)
      toast.error("Failed to accept connection request")
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await communityAPI.rejectConnectionRequest(requestId)
      toast.success("Connection request rejected")
      // Refresh the requests list
      fetchConnectionRequests()
    } catch (err) {
      console.error("Error rejecting connection request:", err)
      toast.error("Failed to reject connection request")
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading && requestsLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error && connections.length === 0) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="user-connections">
      <h3 className="mb-4">Your Connections</h3>

      {connectionRequests.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Connection Requests</h5>
          </div>
          <div className="card-body">
            {requestsLoading ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : connectionRequests.length === 0 ? (
              <p className="text-muted">No pending connection requests</p>
            ) : (
              <div className="list-group">
                {connectionRequests.map((request) => (
                  <div key={request.id} className="list-group-item list-group-item-action">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={request.sender.avatar || "/images/default-avatar.png"}
                          alt={request.sender.name}
                          className="rounded-circle me-3"
                          width="40"
                          height="40"
                        />
                        <div>
                          <h6 className="mb-0">{request.sender.name}</h6>
                          <small className="text-muted">{request.sender.title || "Community Member"}</small>
                        </div>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-success me-2" onClick={() => handleAcceptRequest(request.id)}>
                          Accept
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Your Network</h5>
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center">
              <p className="text-muted">You don't have any connections yet.</p>
              <p>Connect with other healthcare professionals to expand your network.</p>
            </div>
          ) : (
            <div className="row">
              {connections
                .filter(
                  (connection) =>
                    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (connection.title && connection.title.toLowerCase().includes(searchTerm.toLowerCase())),
                )
                .map((connection) => (
                  <div key={connection.id} className="col-md-6 col-lg-4 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={connection.avatar || "/images/default-avatar.png"}
                            alt={connection.name}
                            className="rounded-circle me-3"
                            width="50"
                            height="50"
                          />
                          <div>
                            <h6 className="mb-0">{connection.name}</h6>
                            <small className="text-muted">{connection.title || "Community Member"}</small>
                          </div>
                        </div>
                        {connection.bio && <p className="card-text small">{connection.bio}</p>}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="badge bg-secondary">
                            Connected since {new Date(connection.connectedSince).toLocaleDateString()}
                          </span>
                          <a href={`/community/profile/${connection.id}`} className="btn btn-sm btn-outline-primary">
                            View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Find New Connections</h5>
        </div>
        <div className="card-body">
          <p>Expand your professional network by connecting with other healthcare professionals.</p>
          <a href="/community/directory" className="btn btn-primary">
            Browse Community Directory
          </a>
        </div>
      </div>
    </div>
  )
}

export default UserConnections
