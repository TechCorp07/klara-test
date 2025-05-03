"use client"

import { useState, useEffect } from "react"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * AIRecommendations Component
 * Displays AI-powered recommendations for patient care and resource management
 */
const AIRecommendations = ({
  patientId = null,
  departmentId = null,
  recommendationType = "all", // 'all', 'patient', 'resource', 'admission'
  limit = 5,
}) => {
  const { isMobile } = useMobileOptimization()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetchRecommendations()
  }, [patientId, departmentId, recommendationType])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      // This would be an actual API call in a real implementation
      // const response = await aiAPI.getRecommendations({
      //   patientId,
      //   departmentId,
      //   type,
      //   limit
      // });

      // Simulated response for demonstration
      const mockResponse = {
        recommendations: [
          {
            id: "1",
            type: "patient",
            title: "Medication Adjustment Recommended",
            description: "Based on recent lab results, consider adjusting metformin dosage.",
            priority: "high",
            confidence: 0.89,
            relatedData: {
              patientId: patientId || "P12345",
              labResults: "Elevated HbA1c levels (8.2%)",
              currentMedication: "Metformin 500mg twice daily",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            type: "resource",
            title: "Staffing Optimization",
            description: "Predicted increase in ER admissions suggests additional nursing staff needed on Saturday.",
            priority: "medium",
            confidence: 0.76,
            relatedData: {
              departmentId: departmentId || "D001",
              predictedAdmissions: "+15% compared to average",
              currentStaffing: "3 nurses, 1 physician",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            type: "admission",
            title: "Readmission Risk Alert",
            description: "Patient has 68% probability of readmission within 30 days.",
            priority: "high",
            confidence: 0.82,
            relatedData: {
              patientId: patientId || "P12345",
              riskFactors: "Recent discharge, multiple chronic conditions, medication adherence issues",
              recommendedAction: "Schedule follow-up within 7 days",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "4",
            type: "patient",
            title: "Preventive Screening Due",
            description: "Patient due for colorectal cancer screening based on age and risk factors.",
            priority: "medium",
            confidence: 0.94,
            relatedData: {
              patientId: patientId || "P12345",
              ageGroup: "50-75",
              lastScreening: "None on record",
              riskFactors: "Family history",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "5",
            type: "resource",
            title: "Equipment Maintenance Alert",
            description: "Predictive maintenance model suggests MRI machine #2 requires calibration.",
            priority: "low",
            confidence: 0.71,
            relatedData: {
              equipmentId: "MRI-002",
              lastMaintenance: "45 days ago",
              usageMetrics: "120 scans since last maintenance",
            },
            createdAt: new Date().toISOString(),
          },
        ],
      }

      // Filter recommendations based on type if needed
      let filteredRecommendations = mockResponse.recommendations
      if (recommendationType !== "all") {
        filteredRecommendations = filteredRecommendations.filter((rec) => rec.type === recommendationType)
      }

      // Limit the number of recommendations
      filteredRecommendations = filteredRecommendations.slice(0, limit)

      setRecommendations(filteredRecommendations)
      setError(null)
    } catch (err) {
      console.error("Error fetching AI recommendations:", err)
      setError("Failed to load recommendations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <span className="badge bg-danger">High</span>
      case "medium":
        return <span className="badge bg-warning text-dark">Medium</span>
      case "low":
        return <span className="badge bg-info text-dark">Low</span>
      default:
        return <span className="badge bg-secondary">{priority}</span>
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "patient":
        return <i className="bi bi-person-plus text-primary"></i>
      case "resource":
        return <i className="bi bi-gear text-success"></i>
      case "admission":
        return <i className="bi bi-hospital text-danger"></i>
      default:
        return <i className="bi bi-lightbulb text-warning"></i>
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading recommendations...</span>
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

  if (recommendations.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No AI recommendations available at this time.
      </div>
    )
  }

  return (
    <div className="ai-recommendations">
      <h4 className="mb-3">
        <i className="bi bi-robot me-2"></i>
        AI Recommendations
      </h4>

      <div className="list-group">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="list-group-item list-group-item-action">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="me-3">{getTypeIcon(recommendation.type)}</div>
                <h5 className="mb-1">{recommendation.title}</h5>
              </div>
              <div>{getPriorityBadge(recommendation.priority)}</div>
            </div>

            <p className="mb-1 mt-2">{recommendation.description}</p>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-muted">Confidence: {Math.round(recommendation.confidence * 100)}%</small>
              <button className="btn btn-sm btn-outline-primary" onClick={() => toggleExpanded(recommendation.id)}>
                {expanded[recommendation.id] ? "Show Less" : "Show More"}
              </button>
            </div>

            {expanded[recommendation.id] && (
              <div className="mt-3 pt-3 border-top">
                <h6>Supporting Data:</h6>
                <ul className="list-group list-group-flush">
                  {Object.entries(recommendation.relatedData).map(([key, value]) => (
                    <li key={key} className="list-group-item px-0 py-2">
                      <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong>{" "}
                      {value}
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-sm btn-success me-2">Accept Recommendation</button>
                  <button className="btn btn-sm btn-outline-secondary">Dismiss</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-outline-primary" onClick={fetchRecommendations}>
          Refresh Recommendations
        </button>
      </div>
    </div>
  )
}

export default AIRecommendations
