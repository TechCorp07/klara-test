/**
 * Reusable status badge component that applies different colors based on status
 */
export function StatusBadge({ status, type = 'default', size = 'default' }) {
    // Status color mappings
    const statusColors = {
      // Status types
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800',
      
      // Common status words
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      critical: 'bg-red-100 text-red-800',
      normal: 'bg-green-100 text-green-800',
      abnormal: 'bg-yellow-100 text-yellow-800',
      positive: 'bg-red-100 text-red-800',
      negative: 'bg-green-100 text-green-800',
    };
  
    // Size classes
    const sizeClasses = {
      small: 'px-1.5 py-0.5 text-xs',
      default: 'px-2 py-1 text-xs',
      large: 'px-3 py-1.5 text-sm'
    };
  
    // Determine color class from the status string
    const lowerStatus = status.toLowerCase();
    let colorClass = statusColors[lowerStatus] || statusColors[type] || statusColors.default;
    const sizeClass = sizeClasses[size] || sizeClasses.default;
  
    // Format the status text (capitalize first letter)
    const formattedStatus = typeof status === 'string' 
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : status;
  
    return (
      <span className={`${colorClass} ${sizeClass} rounded-full font-medium`}>
        {formattedStatus}
      </span>
    );
  }