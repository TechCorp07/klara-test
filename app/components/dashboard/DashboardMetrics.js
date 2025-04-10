"use client"
import Link from "next/link"
import {
  FaCalendarAlt,
  FaFileAlt,
  FaHeartbeat,
  FaStethoscope,
  FaPills,
  FaFlask,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa"

/**
 * Dashboard metrics component for displaying key health metrics
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric objects to display
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.compact - Whether to show in compact mode
 * @param {string} props.title - Optional title for the metrics section
 * @param {boolean} props.showViewAll - Whether to show "View All" link
 * @param {string} props.viewAllLink - Link for "View All" button
 */
const DashboardMetrics = ({
  metrics = [],
  loading = false,
  compact = false,
  title = "Your Health Overview",
  showViewAll = false,
  viewAllLink = "",
}) => {
  // Get icon based on metric type
  const getMetricIcon = (type) => {
    switch (type) {
      case "appointments":
        return <FaCalendarAlt className="h-6 w-6 text-blue-500" />
      case "medical_records":
        return <FaFileAlt className="h-6 w-6 text-green-500" />
      case "vitals":
        return <FaHeartbeat className="h-6 w-6 text-red-500" />
      case "conditions":
        return <FaStethoscope className="h-6 w-6 text-purple-500" />
      case "medications":
        return <FaPills className="h-6 w-6 text-yellow-500" />
      case "lab_results":
        return <FaFlask className="h-6 w-6 text-indigo-500" />
      case "health_score":
        return <FaChartLine className="h-6 w-6 text-teal-500" />
      default:
        return <FaHeartbeat className="h-6 w-6 text-gray-500" />
    }
  }

  // Get metric card background color
  const getMetricColor = (type, severity) => {
    if (severity === "high") return "bg-red-50"
    if (severity === "medium") return "bg-yellow-50"
    if (severity === "low") return "bg-green-50"

    switch (type) {
      case "appointments":
        return "bg-blue-50"
      case "medical_records":
        return "bg-green-50"
      case "vitals":
        return "bg-red-50"
      case "conditions":
        return "bg-purple-50"
      case "medications":
        return "bg-yellow-50"
      case "lab_results":
        return "bg-indigo-50"
      case "health_score":
        return "bg-teal-50"
      default:
        return "bg-gray-50"
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div
          className={`grid grid-cols-1 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3 lg:grid-cols-4"} gap-4`}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle empty state
  if (metrics.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="text-center py-6">
          <FaHeartbeat className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
          <p className="mt-1 text-sm text-gray-500">No health metrics are currently available. Check back later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {showViewAll && viewAllLink && (
          <Link href={viewAllLink} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View All
          </Link>
        )}
      </div>

      <div
        className={`grid grid-cols-1 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3 lg:grid-cols-4"} gap-4`}
      >
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${getMetricColor(metric.type, metric.severity)} rounded-lg p-4 ${metric.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={metric.onClick}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">{getMetricIcon(metric.type)}</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {metric.value}
                  {metric.unit && <span className="ml-1 text-sm font-normal text-gray-500">{metric.unit}</span>}
                </p>
                {metric.change && (
                  <p
                    className={`text-xs font-medium ${
                      metric.changeDirection === "up"
                        ? metric.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                        : metric.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {metric.changeDirection === "up" ? "↑" : "↓"} {metric.change}
                  </p>
                )}
              </div>
            </div>
            {metric.alert && (
              <div className="mt-2 flex items-center">
                <FaExclamationTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-700">{metric.alert}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardMetrics
