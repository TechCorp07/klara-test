"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import { FaLanguage, FaGlobe, FaExclamationTriangle, FaSave } from "react-icons/fa"
import { useAuth } from "../../../contexts/AuthContext"
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout"

// Language option component
const LanguageOption = ({ code, name, nativeName, selected, onSelect }) => (
  <div
    className={`p-4 border rounded-md cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
    onClick={() => onSelect(code)}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{name}</h3>
        {nativeName !== name && <p className="text-sm text-gray-500">{nativeName}</p>}
      </div>
      {selected && (
        <svg
          className="h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  </div>
)

// Region option component
const RegionOption = ({ code, name, selected, onSelect }) => (
  <div
    className={`p-4 border rounded-md cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
    onClick={() => onSelect(code)}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-900">{name}</h3>
      {selected && (
        <svg
          className="h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  </div>
)

// Date format option component
const DateFormatOption = ({ format, example, selected, onSelect }) => (
  <div
    className={`p-4 border rounded-md cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
    onClick={() => onSelect(format)}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{format}</h3>
        <p className="text-sm text-gray-500">Example: {example}</p>
      </div>
      {selected && (
        <svg
          className="h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  </div>
)

export default function LanguageSettingsPage() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Settings state
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [selectedRegion, setSelectedRegion] = useState("US")
  const [selectedDateFormat, setSelectedDateFormat] = useState("MM/DD/YYYY")
  const [selectedTimeFormat, setSelectedTimeFormat] = useState("12h")
  const [selectedMeasurementSystem, setSelectedMeasurementSystem] = useState("imperial")

  // Load current settings on mount
  useEffect(() => {
    // This would fetch from user preferences in a real implementation
    // For now we'll mock it with defaults
    if (user?.preferences?.language) {
      setSelectedLanguage(user.preferences.language)
    }

    if (user?.preferences?.region) {
      setSelectedRegion(user.preferences.region)
    }

    if (user?.preferences?.date_format) {
      setSelectedDateFormat(user.preferences.date_format)
    }

    if (user?.preferences?.time_format) {
      setSelectedTimeFormat(user.preferences.time_format)
    }

    if (user?.preferences?.measurement_system) {
      setSelectedMeasurementSystem(user.preferences.measurement_system)
    }
  }, [user])

  // Language options
  const languages = [
    { code: "en-US", name: "English (US)", nativeName: "English (US)" },
    { code: "en-GB", name: "English (UK)", nativeName: "English (UK)" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "pt", name: "Portuguese", nativeName: "Português" },
    { code: "zh", name: "Chinese (Simplified)", nativeName: "中文 (简体)" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
  ]

  // Region options
  const regions = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "ES", name: "Spain" },
    { code: "MX", name: "Mexico" },
    { code: "BR", name: "Brazil" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" },
  ]

  // Date format options
  const dateFormats = [
    { format: "MM/DD/YYYY", example: "04/08/2025" },
    { format: "DD/MM/YYYY", example: "08/04/2025" },
    { format: "YYYY-MM-DD", example: "2025-04-08" },
    { format: "YYYY/MM/DD", example: "2025/04/08" },
    { format: "DD.MM.YYYY", example: "08.04.2025" },
  ]

  // Handle form submission
  const handleSaveSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create preferences object
      const preferences = {
        language: selectedLanguage,
        region: selectedRegion,
        date_format: selectedDateFormat,
        time_format: selectedTimeFormat,
        measurement_system: selectedMeasurementSystem,
      }

      // In a real implementation, this would update the user's preferences
      // For now, we'll just simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user object with new preferences
      if (updateProfile) {
        await updateProfile({ preferences })
      }

      toast.success("Language and region settings saved successfully")
    } catch (err) {
      console.error("Error saving language settings:", err)
      setError("Failed to save language settings. Please try again later.")
      toast.error("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Language & Region</h1>
            <p className="mt-1 text-sm text-gray-500">Customize your language, date format, and regional preferences</p>
          </div>

          <div className="flex">
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Back to Settings
            </Link>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Language preferences */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaLanguage className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Language</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Select your preferred language for the application interface</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {languages.map((language) => (
                  <LanguageOption
                    key={language.code}
                    code={language.code}
                    name={language.name}
                    nativeName={language.nativeName}
                    selected={selectedLanguage === language.code}
                    onSelect={setSelectedLanguage}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Region preferences */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaGlobe className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Region</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Select your location to personalize content and settings</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {regions.map((region) => (
                  <RegionOption
                    key={region.code}
                    code={region.code}
                    name={region.name}
                    selected={selectedRegion === region.code}
                    onSelect={setSelectedRegion}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Format preferences */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Format Preferences</h2>
              <p className="mt-1 text-sm text-gray-500">Choose how dates, times, and measurements are displayed</p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Date Format</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {dateFormats.map((dateFormat) => (
                      <DateFormatOption
                        key={dateFormat.format}
                        format={dateFormat.format}
                        example={dateFormat.example}
                        selected={selectedDateFormat === dateFormat.format}
                        onSelect={setSelectedDateFormat}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Time Format</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border rounded-md cursor-pointer ${selectedTimeFormat === "12h" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                      onClick={() => setSelectedTimeFormat("12h")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">12-hour clock</h3>
                          <p className="text-sm text-gray-500">Example: 2:30 PM</p>
                        </div>
                        {selectedTimeFormat === "12h" && (
                          <svg
                            className="h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Measurement System</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border rounded-md cursor-pointer ${selectedMeasurementSystem === "metric" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                      onClick={() => setSelectedMeasurementSystem("metric")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Metric</h3>
                          <p className="text-sm text-gray-500">Example: kg, cm, °C</p>
                        </div>
                        {selectedMeasurementSystem === "metric" && (
                          <svg
                            className="h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div
                      className={`p-4 border rounded-md cursor-pointer ${selectedMeasurementSystem === "imperial" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                      onClick={() => setSelectedMeasurementSystem("imperial")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Imperial</h3>
                          <p className="text-sm text-gray-500">Example: lb, ft, °F</p>
                        </div>
                        {selectedMeasurementSystem === "imperial" && (
                          <svg
                            className="h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save button at bottom */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
