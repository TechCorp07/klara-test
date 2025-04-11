/**
 * Reusable empty state component
 */
export function EmptyState({ 
    message = 'No data found.',
    icon: Icon = null 
  }) {
    return (
      <div className="text-center py-6">
        {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
        <p className="mt-2 text-gray-500">{message}</p>
      </div>
    );
  }