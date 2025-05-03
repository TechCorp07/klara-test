export const metadata = {
  title: "Maintenance - Klararety Healthcare Platform",
  description: "The Klararety Healthcare Platform is currently undergoing maintenance.",
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">We'll be back soon</h1>
          <div className="h-1 w-20 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            The Klararety Healthcare Platform is currently undergoing scheduled maintenance. We apologize for any
            inconvenience this may cause.
          </p>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's happening?</h2>
          <p className="text-gray-600 mb-4">
            We're making important updates to improve your experience. Our team is working to complete this maintenance
            as quickly as possible.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Estimated completion time: 2 hours</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            If you need immediate assistance, please contact our support team at{" "}
            <a href="mailto:support@klararety.com" className="text-blue-600 hover:text-blue-800">
              support@klararety.com
            </a>
          </p>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Klararety Healthcare. All rights reserved.</p>
      </footer>
    </div>
  )
}
