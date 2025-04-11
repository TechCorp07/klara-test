/**
 * Reusable loading indicator component
 */
export function LoadingState({ size = 'default', message = null }) {
    const sizeClasses = {
      small: 'h-8 w-8 border-t-2 border-b-2',
      default: 'h-12 w-12 border-t-2 border-b-2',
      large: 'h-16 w-16 border-t-3 border-b-3'
    };
  
    const spinnerClass = sizeClasses[size] || sizeClasses.default;
  
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className={`animate-spin rounded-full ${spinnerClass} border-blue-500`}></div>
        {message && <p className="mt-4 text-gray-500">{message}</p>}
      </div>
    );
  }