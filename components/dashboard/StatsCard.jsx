import Link from "next/link"

/**
 * StatsCard component for displaying metric information in dashboards
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.linkText - Text for the action link
 * @param {string} props.linkHref - URL for the action link
 * @param {string} props.valueColor - Color class for the value (e.g., 'text-blue-600')
 */
const StatsCard = ({ title, value, linkText, linkHref, valueColor = "text-blue-600" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      {linkText && linkHref && (
        <Link href={linkHref} className="text-blue-600 hover:text-blue-800 text-sm">
          {linkText} →
        </Link>
      )}
    </div>
  )
}

export default StatsCard
