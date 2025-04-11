/**
 * Reusable error display component
 */
export function ErrorState({ message = 'An error occurred. Please try again later.' }) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{message}</p>
      </div>
    );
  }