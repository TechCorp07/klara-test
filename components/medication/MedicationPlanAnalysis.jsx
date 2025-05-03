"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * MedicationPlanAnalysis Component
 * Analyzes medication plan against wearables health data
 */
const MedicationPlanAnalysis = ({ userId, medicationPlan }) => {
  const [healthData, setHealthData] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dateRange, setDateRange] = useState("week") // 'day', 'week', 'month'

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/wearables/user/${userId}/health-data?range=${dateRange}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch health data")
        }

        const data = await response.json()
        setHealthData(data.healthData || [])
      } catch (error) {
        console.error("Error fetching health data:", error)
        toast.error("Failed to load health data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchHealthData()
    }
  }, [userId, dateRange])

  // Analyze medication plan against health data
  const analyzeMedicationPlan = async () => {
    if (!healthData.length || !medicationPlan) {
      toast.warning("Health data or medication plan is missing")
      return
    }

    try {
      setIsAnalyzing(true)

      const response = await fetch("/api/medications/analyze-with-health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          healthData,
          medicationPlan,
        }),
        credentials: "same-origin",
      })

      if (!response.ok) {
        throw new Error("Failed to analyze medication plan")
      }

      const data = await response.json()
      setAnalysis(data.analysis)

      toast.success("Medication plan analysis completed")
    } catch (error) {
      console.error("Error analyzing medication plan:", error)
      toast.error(error.message || "Failed to analyze medication plan. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range)
  }

  if (isLoading) {
    return (
      <div className="medication-plan-analysis loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading health data...</p>
      </div>
    )
  }

  return (
    <div className="medication-plan-analysis">
      <h3>Medication Plan Analysis</h3>

      {/* Date Range Selector */}
      <div className="date-range-selector mb-4">
        <div className="btn-group" role="group" aria-label="Date range">
          <button
            type="button"
            className={`btn ${dateRange === "day" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleDateRangeChange("day")}
          >
            Day
          </button>
          <button
            type="button"
            className={`btn ${dateRange === "week" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleDateRangeChange("week")}
          >
            Week
          </button>
          <button
            type="button"
            className={`btn ${dateRange === "month" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleDateRangeChange("month")}
          >
            Month
          </button>
        </div>
      </div>

      {/* Health Data Summary */}
      <div className="health-data-summary mb-4">
        <h5>Health Data Summary</h5>

        {healthData.length === 0 ? (
          <div className="alert alert-info">
            No health data available for the selected time period. Connect a wearable device and sync data to see your
            health metrics.
          </div>
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6 className="card-title">Heart Rate</h6>
                  <p className="display-6">
                    {Math.round(
                      healthData.reduce((sum, data) => sum + (data.heartRate?.avg || 0), 0) / healthData.length,
                    )}{" "}
                    bpm
                  </p>
                  <p className="text-muted">Average</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6 className="card-title">Steps</h6>
                  <p className="display-6">
                    {Math.round(healthData.reduce((sum, data) => sum + (data.steps || 0), 0) / healthData.length)}
                  </p>
                  <p className="text-muted">Daily Average</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6 className="card-title">Sleep</h6>
                  <p className="display-6">
                    {Math.round(
                      healthData.reduce((sum, data) => sum + (data.sleep?.duration || 0), 0) / healthData.length / 60,
                    )}{" "}
                    hrs
                  </p>
                  <p className="text-muted">Average Duration</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6 className="card-title">Blood Pressure</h6>
                  <p className="display-6">
                    {Math.round(
                      healthData.reduce((sum, data) => sum + (data.bloodPressure?.systolic || 0), 0) /
                        healthData.filter((data) => data.bloodPressure).length,
                    )}
                    /
                    {Math.round(
                      healthData.reduce((sum, data) => sum + (data.bloodPressure?.diastolic || 0), 0) /
                        healthData.filter((data) => data.bloodPressure).length,
                    )}
                  </p>
                  <p className="text-muted">Average (Systolic/Diastolic)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medication Plan Summary */}
      <div className="medication-plan-summary mb-4">
        <h5>Medication Plan Summary</h5>

        {!medicationPlan || medicationPlan.medications.length === 0 ? (
          <div className="alert alert-info">
            No medication plan available. Please add medications to your plan to enable analysis.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Purpose</th>
                  <th>Expected Effects</th>
                </tr>
              </thead>
              <tbody>
                {medicationPlan.medications.map((medication, index) => (
                  <tr key={index}>
                    <td>{medication.name}</td>
                    <td>{medication.dosage}</td>
                    <td>{medication.frequency}</td>
                    <td>{medication.purpose || medication.reason || "Not specified"}</td>
                    <td>{medication.expectedEffects || "Not specified"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Action */}
      <div className="analysis-action mb-4">
        <button
          className="btn btn-primary"
          onClick={analyzeMedicationPlan}
          disabled={
            isAnalyzing || healthData.length === 0 || !medicationPlan || medicationPlan.medications.length === 0
          }
        >
          {isAnalyzing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Analyzing...
            </>
          ) : (
            "Analyze Medication Plan"
          )}
        </button>

        {(healthData.length === 0 || !medicationPlan || medicationPlan.medications.length === 0) && (
          <div className="alert alert-warning mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Both health data and medication plan are required for analysis.
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <h5>Analysis Results</h5>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Medication Effectiveness</h6>
            </div>
            <div className="card-body">
              {/* Overall Effectiveness */}
              <div className="overall-effectiveness mb-4">
                <h6>Overall Effectiveness</h6>
                <div className="progress">
                  <div
                    className={`progress-bar ${analysis.overallEffectiveness >= 80 ? "bg-success" : analysis.overallEffectiveness >= 60 ? "bg-warning" : "bg-danger"}`}
                    role="progressbar"
                    style={{ width: `${analysis.overallEffectiveness}%` }}
                    aria-valuenow={analysis.overallEffectiveness}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {analysis.overallEffectiveness}%
                  </div>
                </div>
                <p className="mt-2">{analysis.overallMessage}</p>
              </div>

              {/* Medication-specific Analysis */}
              <div className="medication-specific-analysis">
                <h6>Medication-specific Analysis</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Target Health Metrics</th>
                        <th>Observed Effect</th>
                        <th>Effectiveness</th>
                        <th>Recommendations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.medicationAnalysis.map((item, index) => (
                        <tr key={index}>
                          <td>{item.medication}</td>
                          <td>{item.targetMetrics.join(", ")}</td>
                          <td>{item.observedEffect}</td>
                          <td>
                            <div className="progress">
                              <div
                                className={`progress-bar ${item.effectiveness >= 80 ? "bg-success" : item.effectiveness >= 60 ? "bg-warning" : "bg-danger"}`}
                                role="progressbar"
                                style={{ width: `${item.effectiveness}%` }}
                                aria-valuenow={item.effectiveness}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {item.effectiveness}%
                              </div>
                            </div>
                          </td>
                          <td>{item.recommendations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Health Concerns */}
              {analysis.healthConcerns && analysis.healthConcerns.length > 0 && (
                <div className="health-concerns mt-4">
                  <h6>Health Concerns</h6>
                  <ul className="list-group">
                    {analysis.healthConcerns.map((concern, index) => (
                      <li key={index} className="list-group-item list-group-item-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="recommendations mt-4">
                <h6>Recommendations</h6>
                <ul className="list-group">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="list-group-item">
                      <i
                        className={`bi bi-${recommendation.type === "warning" ? "exclamation-triangle text-warning" : recommendation.type === "danger" ? "exclamation-circle text-danger" : "info-circle text-info"} me-2`}
                      ></i>
                      {recommendation.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicationPlanAnalysis
