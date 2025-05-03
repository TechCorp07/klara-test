"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * DashboardDetail Component
 * Displays a specific dashboard with its charts and metrics
 */
const DashboardDetail = ({ dashboardId }) => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("week") // 'day', 'week', 'month', 'year'
  const [refreshInterval, setRefreshInterval] = useState(null)

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardData()
    }

    // Set up auto-refresh if enabled
    if (refreshInterval) {
      const intervalId = setInterval(fetchDashboardData, refreshInterval * 1000)
      return () => clearInterval(intervalId)
    }
  }, [dashboardId, timeRange, refreshInterval])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await reportsAPI.getDashboardData(dashboardId, { timeRange })
      setDashboard(response)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  const handleRefreshIntervalChange = (e) => {
    const value = Number.parseInt(e.target.value, 10)
    setRefreshInterval(value || null)
  }

  if (loading && !dashboard) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="alert alert-info" role="alert">
        Dashboard not found.
      </div>
    )
  }

  return (
    <div className="dashboard-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{dashboard.name}</h2>
        <div className="d-flex">
          <div className="btn-group me-3" role="group">
            <button
              type="button"
              className={`btn btn-outline-primary ${timeRange === "day" ? "active" : ""}`}
              onClick={() => handleTimeRangeChange("day")}
            >
              Day
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${timeRange === "week" ? "active" : ""}`}
              onClick={() => handleTimeRangeChange("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${timeRange === "month" ? "active" : ""}`}
              onClick={() => handleTimeRangeChange("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${timeRange === "year" ? "active" : ""}`}
              onClick={() => handleTimeRangeChange("year")}
            >
              Year
            </button>
          </div>
          <div className="d-flex align-items-center">
            <label htmlFor="refreshInterval" className="me-2">
              Auto-refresh:
            </label>
            <select
              id="refreshInterval"
              className="form-select form-select-sm"
              value={refreshInterval || ""}
              onChange={handleRefreshIntervalChange}
              style={{ width: "120px" }}
            >
              <option value="">Off</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {dashboard.description && <div className="alert alert-info mb-4">{dashboard.description}</div>}

      {/* Key Metrics Section */}
      {dashboard.metrics && dashboard.metrics.length > 0 && (
        <div className="row mb-4">
          {dashboard.metrics.map((metric, index) => (
            <div key={index} className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6 className="card-subtitle mb-2 text-muted">{metric.name}</h6>
                  <h3 className="card-title mb-0">{metric.value}</h3>
                  {metric.change !== undefined && (
                    <div className={`mt-2 ${metric.change >= 0 ? "text-success" : "text-danger"}`}>
                      <i className={`bi bi-arrow-${metric.change >= 0 ? "up" : "down"}`}></i>
                      {Math.abs(metric.change)}% from previous {timeRange}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      {dashboard.charts && dashboard.charts.length > 0 && (
        <div className="row">
          {dashboard.charts.map((chart, index) => {
            // Determine column width based on chart size
            const colClass = chart.size === "large" ? "col-md-12" : chart.size === "medium" ? "col-md-6" : "col-md-4"

            return (
              <div key={index} className={`${colClass} mb-4`}>
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="mb-0">{chart.title}</h5>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={chart.imageUrl} alt={chart.title} className="img-fluid" />
                        {chart.description && <p className="mt-3 text-muted small">{chart.description}</p>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Data Tables Section */}
      {dashboard.tables && dashboard.tables.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3">Data Tables</h4>
          {dashboard.tables.map((table, index) => (
            <div key={index} className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">{table.title}</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        {table.headers.map((header, headerIndex) => (
                          <th key={headerIndex}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <a href="/reports/dashboards" className="btn btn-outline-secondary">
          Back to Dashboards
        </a>
      </div>
    </div>
  )
}

export default DashboardDetail
