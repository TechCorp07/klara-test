"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import {
  FaDownload,
  FaShieldAlt,
  FaInfoCircle,
  FaFileAlt,
  FaFileMedical,
  FaCalendarAlt,
  FaComments,
  FaUserCircle,
} from "react-icons/fa"
import { format } from "date-fns"
import { useAuth } from "../../../contexts/AuthContext"
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout"
import HIPAABanner from "../../../components/ui/HIPAABanner"

export default function DataExportPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [previousExports, setPreviousExports] = useState([])
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    profile: true,
    appointments: true,
    messages: true,
    medical_records: true,
    prescriptions: true,
    lab_results: true,
  })

  // Fetch previous exports
  useEffect(() => {
    // This would be an API call in a real implementation
    const fetchPreviousExports = async () => {
      // Mock data for previous exports
      const mockExports = [
        {
          id: "1234",
          created_at: "2025-03-15T10:30:00Z",
          status: "completed",
          data_types: ["profile", "appointments", "messages"],
          file_size: "2.4 MB",
          download_url: "#",
          expires_at: "2025-04-15T10:30:00Z",
        },
        {
          id: "5678",
          created_at: "2025-02-01T14:45:00Z",
          status: "completed",
          data_types: ["profile", "medical_records", "prescriptions", "lab_results"],
          file_size: "5.1 MB",
          download_url: "#",
          expires_at: "2025-03-01T14:45:00Z",
        },
      ]

      setPreviousExports(mockExports)
    }

    fetchPreviousExports()
  }, [])

  // Handle toggling data type selection
  const handleToggleDataType = (dataType) => {
    setSelectedDataTypes((prev) => ({
      ...prev,
      [dataType]: !prev[dataType],
    }))
  }

  // Handle selecting all data types
  const handleSelectAll = () => {
    const allSelected = Object.values(selectedDataTypes).every((value) => value)

    const newValue = !allSelected
    const newSelectedDataTypes = {}

    Object.keys(selectedDataTypes).forEach((key) => {
      newSelectedDataTypes[key] = newValue
    })

    setSelectedDataTypes(newSelectedDataTypes)
  }

  // Handle data export request
  const handleExportData = async () => {
    // Check if at least one data type is selected
    if (!Object.values(selectedDataTypes).some((value) => value)) {
      toast.error("Please select at least one data type to export")
      return
    }

    setLoading(true)

    try {
      // This would be an API call in a real implementation
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

      // Mock a successful response
      const exportId = Math.random().toString(36).substring(2, 10)

      // Add the new export to the list
      const newExport = {
        id: exportId,
        created_at: new Date().toISOString(),
        status: "processing",
        data_types: Object.keys(selectedDataTypes).filter((key) => selectedDataTypes[key]),
        file_size: "Pending",
        download_url: null,
        expires_at: null,
      }

      setPreviousExports([newExport, ...previousExports])

      toast.success(
        "Data export request submitted successfully. You will receive an email when your data is ready to download.",
      )
    } catch (error) {
      console.error("Error requesting data export:", error)
      toast.error("Failed to submit data export request. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Get data type icon
  const getDataTypeIcon = (dataType) => {
    switch (dataType) {
      case "profile":
        return <FaUserCircle className="h-5 w-5 text-blue-500" />
      case "appointments":
        return <FaCalendarAlt className="h-5 w-5 text-green-500" />
      case "messages":
        return <FaComments className="h-5 w-5 text-purple-500" />
      case "medical_records":
        return <FaFileMedical className="h-5 w-5 text-red-500" />
      case "prescriptions":
        return <FaFileAlt className="h-5 w-5 text-orange-500" />
      case "lab_results":
        return <FaFileAlt className="h-5 w-5 text-yellow-500" />
      default:
        return <FaFileAlt className="h-5 w-5 text-gray-500" />
    }
  }

  // Get friendly data type name
  const getDataTypeName = (dataType) => {
    switch (dataType) {
      case "profile":
        return "Profile Information"
      case "appointments":
        return "Appointments"
      case "messages":
        return "Message History"
      case "medical_records":
        return "Medical Records"
      case "prescriptions":
        return "Prescriptions"
      case "lab_results":
        return "Lab Results"
      default:
        return dataType
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>

          <Link
            href="/settings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Settings
          </Link>
        </div>

        <HIPAABanner
          type="security"
          message="Download a copy of your personal health information. All export requests are securely processed and logged for compliance purposes."
        />

        <div className="space-y-6">
          {/* Export data section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Export Your Data</h2>
              <p className="mt-1 text-sm text-gray-500">Select the data types you want to export and download</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-900">Data Types</h3>
                  <button type="button" onClick={handleSelectAll} className="text-sm text-blue-600 hover:text-blue-500">
                    {Object.values(selectedDataTypes).every((value) => value) ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(selectedDataTypes).map((dataType) => (
                    <div key={dataType} className="flex items-center">
                      <input
                        id={`data-type-${dataType}`}
                        name={`data-type-${dataType}`}
                        type="checkbox"
                        checked={selectedDataTypes[dataType]}
                        onChange={() => handleToggleDataType(dataType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`data-type-${dataType}`} className="ml-3 flex items-center">
                        {getDataTypeIcon(dataType)}
                        <span className="ml-2 text-sm text-gray-700">{getDataTypeName(dataType)}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">About Data Exports</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Exports are provided in a ZIP file containing JSON or CSV files</li>
                          <li>Processing may take up to 24 hours depending on the amount of data</li>
                          <li>You will receive an email notification when your export is ready</li>
                          <li>Export files are available for download for 30 days</li>
                          <li>All exports are secured with encryption for your privacy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={loading || !Object.values(selectedDataTypes).some((value) => value)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2 h-4 w-4" />
                      Request Data Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Previous exports section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Previous Exports</h2>
              <p className="mt-1 text-sm text-gray-500">Access your previously requested data exports</p>
            </div>

            <div className="p-6">
              {previousExports.length === 0 ? (
                <div className="text-center py-6">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No previous exports</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't requested any data exports yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Request Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Content
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Expires
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previousExports.map((export_) => (
                        <tr key={export_.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(export_.created_at), "MMM d, yyyy h:mm a")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                export_.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : export_.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : export_.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {export_.status.charAt(0).toUpperCase() + export_.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {export_.data_types.map((type) => getDataTypeName(type)).join(", ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{export_.file_size}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {export_.expires_at ? format(new Date(export_.expires_at), "MMM d, yyyy") : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {export_.status === "completed" ? (
                              <a
                                href={export_.download_url}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              >
                                <FaDownload className="mr-1 h-4 w-4" />
                                Download
                              </a>
                            ) : export_.status === "processing" ? (
                              <span className="text-yellow-500">Processing...</span>
                            ) : export_.status === "failed" ? (
                              <button className="text-blue-600 hover:text-blue-900" onClick={() => handleExportData()}>
                                Retry
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Privacy notice */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaShieldAlt className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Privacy & Security</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="text-sm text-gray-600 space-y-4">
                <p>
                  Your exported data contains personal health information and should be handled with care. We recommend
                  the following security practices:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Store your downloaded data in a secure location</li>
                  <li>Do not share your export files with unauthorized individuals</li>
                  <li>Delete the files when they are no longer needed</li>
                  <li>Ensure your device has up-to-date security software</li>
                  <li>Use a secure and current operating system</li>
                </ul>

                <p>
                  In accordance with HIPAA regulations, all data export requests and downloads are logged. If you
                  believe your account has been compromised, please contact support immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
