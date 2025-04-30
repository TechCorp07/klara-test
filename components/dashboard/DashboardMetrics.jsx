/**
 * Dashboard metrics component for displaying key metrics
 */
const DashboardMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${metric.bgColor} mr-4`}>{metric.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardMetrics
