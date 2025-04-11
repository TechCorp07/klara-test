import Link from 'next/link';

/**
 * Reusable Quick Actions section for dashboards
 */
export function QuickActions({ actions }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index}
            href={action.url} 
            className={`${action.bgColor || 'bg-blue-100 hover:bg-blue-200'} ${action.textColor || 'text-blue-800'} p-4 rounded-lg text-center`}
          >
            <div className="flex flex-col items-center">
              {action.icon}
              <span>{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}