"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * ReportDetail Component
 * Displays detailed information about a specific report
 */
const ReportDetail = ({ reportId }) => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (reportId) {
      fetchReportResult()
    }
  }, [reportId])

  const fetchReportResult = async () => {
    setLoading(true)
    try {
      // First check the status
      const statusResponse = await reportsAPI.getReportStatus(reportId)

      if (statusResponse.status === "completed") {
        const resultResponse = await reportsAPI.getReportResult(reportId)
        setReport({
          ...statusResponse,
          data: resultResponse.data || {},
          charts: resultResponse.charts || [],
        })
      } else {
        setReport(statusResponse)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching report:", err)
      setError("Failed to load report. Please try again.")
      toast.error("Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (format) => {
    try {
      const response = await reportsAPI.exportReport(reportId, format)
      if (response && response.downloadUrl) {
        window.open(response.downloadUrl, "_blank")
      } else {
        toast.error("Export URL not available")
      }
    } catch (err) {
      console.error("Error exporting report:", err)
      toast.error(`Failed to export report to ${format}`)
    }
  }

  const handleScheduleReport = () => {
    // Navigate to schedule page with the report type pre-selected
    if (report && report.type) {
      window.location.href = `/reports/schedule?type=${report.type}`
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

  if (!report) {
    return (
      <div className="alert alert-info" role="alert">
        Report not found.
      </div>
    )
  }

  // Handle different report statuses
  if (report.status === "processing") {
    return (
      <div className="report-detail">
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">{report.name}</h3>
          </div>
          <div className="card-body text-center">
            <div className="spinner-border mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <h5>Report is being processed</h5>
            <p className="text-muted">This may take a few minutes. Please check back later.</p>
            <button className="btn btn-primary mt-3" onClick={fetchReportResult}>
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (report.status === "failed") {
    return (
      <div className="report-detail">
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">{report.name}</h3>
          </div>
          <div className="card-body">
            <div className="alert alert-danger">
              <h5>Report Generation Failed</h5>
              <p>{report.error || "An error occurred while generating the report."}</p>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={() => (window.location.href = "/reports")}>
                Back to Reports
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Regenerate the same report type with the same parameters
                  if (report.type && report.parameters) {
                    reportsAPI
                      .generateReport(report.type, report.parameters)
                      .then(() => {
                        toast.success("Report generation initiated")
                        window.location.href = "/reports"
                      })
                      .catch((err) => {
                        console.error("Error regenerating report:", err)
                        toast.error("Failed to regenerate report")
                      })
                  }
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For completed reports
  return (
    <div className="report-detail">
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{report.name}</h3>
            <div className="btn-group">
              <button className="btn btn-outline-primary" onClick={() => handleExportReport("pdf")}>
                Export
              </button>
              <button className="btn btn-outline-primary" onClick={() => handleExportReport("csv")}>
                Export
              </button>
              <button className="btn btn-outline-secondary" onClick={handleScheduleReport}>
                Schedule
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="report-metadata mb-4">
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Report Type:</strong> {report.type}
                </p>
                <p>
                  <strong>Generated:</strong> {new Date(report.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong> <span className="badge bg-success">Completed</span>
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-unstyled">
                  {report.parameters &&
                    Object.entries(report.parameters).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {report.summary && (
            <div className="report-summary mb-4">
              <h4>Summary</h4>
              <div className="card">
                <div className="card-body">
                  <p>{report.summary}</p>
                </div>
              </div>
            </div>
          )}

          {report.charts && report.charts.length > 0 && (
            <div className="report-charts mb-4">
              <h4>Charts</h4>
              <div className="row">
                {report.charts.map((chart, index) => (
                  <div key={index} className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">{chart.title}</h5>
                      </div>
                      <div className="card-body">
                        <img src={chart.imageUrl} alt={chart.title} className="img-fluid" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.data && (
            <div className="report-data">
              <h4>Data</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      {report.data.headers && report.data.headers.map((header, index) => <th key={index}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.rows &&
                      report.data.rows.map((row, rowIndex) => (
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
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-secondary" onClick={() => (window.location.href = "/reports")}>
          Back to Reports
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            // Generate a new report of the same type
            if (report.type) {
              window.location.href = `/reports/new?type=${report.type}`
            }
          }}
        >
          Generate Similar Report
        </button>
      </div>
    </div>
  )
}

export default ReportDetail
