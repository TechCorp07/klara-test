import Link from 'next/link';

/**
 * Standard page header component with title, subtitle, and optional action button
 */
export function PageHeader({ 
  title, 
  subtitle, 
  actionLabel, 
  actionUrl, 
  onActionClick,
  backUrl,
  backLabel = 'Back'
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="flex space-x-3">
        {backUrl && (
          <Link
            href={backUrl}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {backLabel}
          </Link>
        )}
        
        {(actionLabel && (actionUrl || onActionClick)) && (
          actionUrl ? (
            <Link
              href={actionUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}