import Link from 'next/link';

/**
 * Reusable Resource Links section for dashboards
 */
export function ResourceLinks({ 
  title, 
  viewAllUrl,
  resources 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllUrl && (
          <Link href={viewAllUrl} className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {resource.description}
            </p>
            <Link href={resource.url} className="text-blue-600 hover:text-blue-800 text-sm">
              {resource.linkText || 'Learn more'} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}