/**
 * HIPAA compliance banner component
 */
const HIPAABanner = ({ className = "" }) => {
  return (
    <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            This information is protected under HIPAA regulations. Your privacy and data security are our top
            priorities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HIPAABanner
