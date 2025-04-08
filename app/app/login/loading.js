export default function LoginLoading() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Klararety Health</h1>
            <h2 className="mt-2 text-xl font-semibold text-gray-800">Sign in to your account</h2>
          </div>
  
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }
    