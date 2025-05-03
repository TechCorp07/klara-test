"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { ehrService } from "@/lib/services/ehr"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"
import { formatDate } from "@/lib/utils/dateUtils"

export default function FHIRResourceViewer() {
  const { user } = useAuth()
  const [resourceType, setResourceType] = useState("Patient")
  const [resourceId, setResourceId] = useState("")
  const [searchParams, setSearchParams] = useState({})
  const [viewMode, setViewMode] = useState("view") // view, search
  const [formattedResource, setFormattedResource] = useState(null)

  // Fetch resource data
  const {
    data: resourceData,
    isLoading: isLoadingResource,
    error: resourceError,
    refetch: refetchResource,
  } = useQuery({
    queryKey: ["fhirResource", resourceType, resourceId],
    queryFn: () => ehrService.fhir.getResource(resourceType, resourceId),
    enabled: !!resourceId && viewMode === "view",
    onError: (error) => {
      toast.error(`Failed to load ${resourceType} resource`)
      console.error("Error fetching FHIR resource:", error)
    },
  })

  // Search for resources
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["fhirSearch", resourceType, searchParams],
    queryFn: () => ehrService.fhir.searchResources(resourceType, searchParams),
    enabled: viewMode === "search" && Object.keys(searchParams).length > 0,
    onError: (error) => {
      toast.error(`Failed to search ${resourceType} resources`)
      console.error("Error searching FHIR resources:", error)
    },
  })

  // Format resource for display
  useEffect(() => {
    if (resourceData) {
      setFormattedResource(JSON.stringify(resourceData, null, 2))
    } else {
      setFormattedResource(null)
    }
  }, [resourceData])

  // Handle resource type change
  const handleResourceTypeChange = (e) => {
    setResourceType(e.target.value)
    setResourceId("")
    setSearchParams({})
    setFormattedResource(null)
  }

  // Handle resource ID change
  const handleResourceIdChange = (e) => {
    setResourceId(e.target.value)
  }

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    setFormattedResource(null)
  }

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()

    // Get form data
    const formData = new FormData(e.target)
    const params = {}

    // Process form data into search parameters
    for (const [key, value] of formData.entries()) {
      if (value) {
        params[key] = value
      }
    }

    setSearchParams(params)
    refetchSearch()
  }

  // Handle resource fetch
  const handleFetchResource = () => {
    if (resourceId) {
      refetchResource()
    } else {
      toast.error("Please enter a resource ID")
    }
  }

  // Handle resource selection from search results
  const handleSelectResource = (id) => {
    setResourceId(id)
    setViewMode("view")
    setTimeout(() => refetchResource(), 100)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">FHIR Resource Explorer</h1>

      {/* Mode selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleViewModeChange("view")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "view" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            View Resource
          </button>
          <button
            onClick={() => handleViewModeChange("search")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "search" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Search Resources
          </button>
        </div>

        {/* Resource type selector (common to both modes) */}
        <div className="mb-4">
          <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            id="resourceType"
            value={resourceType}
            onChange={handleResourceTypeChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Patient">Patient</option>
            <option value="Practitioner">Practitioner</option>
            <option value="Organization">Organization</option>
            <option value="Observation">Observation</option>
            <option value="Condition">Condition</option>
            <option value="MedicationRequest">MedicationRequest</option>
            <option value="AllergyIntolerance">AllergyIntolerance</option>
            <option value="Immunization">Immunization</option>
            <option value="Procedure">Procedure</option>
            <option value="DiagnosticReport">DiagnosticReport</option>
            <option value="CarePlan">CarePlan</option>
            <option value="Encounter">Encounter</option>
          </select>
        </div>

        {viewMode === "view" ? (
          /* View mode */
          <div>
            <div className="mb-4">
              <label htmlFor="resourceId" className="block text-sm font-medium text-gray-700 mb-1">
                Resource ID
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="resourceId"
                  value={resourceId}
                  onChange={handleResourceIdChange}
                  placeholder="Enter resource ID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleFetchResource}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Fetch
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Search mode */
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Dynamic search fields based on resource type */}
              {resourceType === "Patient" && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                      Identifier
                    </label>
                    <input
                      type="text"
                      id="identifier"
                      name="identifier"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </>
              )}

              {resourceType === "Observation" && (
                <>
                  <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      id="patient"
                      name="patient"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}

              {resourceType === "MedicationRequest" && (
                <>
                  <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      id="patient"
                      name="patient"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Any</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on-hold">On Hold</option>
                      <option value="stopped">Stopped</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                      Medication
                    </label>
                    <input
                      type="text"
                      id="medication"
                      name="medication"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="authoredon" className="block text-sm font-medium text-gray-700 mb-1">
                      Authored On
                    </label>
                    <input
                      type="date"
                      id="authoredon"
                      name="authoredon"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}

              {/* Generic search fields for other resource types */}
              {!["Patient", "Observation", "MedicationRequest"].includes(resourceType) && (
                <>
                  <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      id="patient"
                      name="patient"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Resource ID
                    </label>
                    <input
                      type="text"
                      id="_id"
                      name="_id"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="_lastUpdated" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <input
                      type="date"
                      id="_lastUpdated"
                      name="_lastUpdated"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      id="status"
                      name="status"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Results display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {viewMode === "view" ? (
          /* Resource view */
          <>
            <h2 className="text-xl font-semibold mb-4">
              {resourceType} Resource {resourceId && `(ID: ${resourceId})`}
            </h2>

            {isLoadingResource ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : resourceError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> Failed to load resource.</span>
              </div>
            ) : formattedResource ? (
              <div className="overflow-x-auto">
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-[600px]">
                  {formattedResource}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Enter a resource ID and click "Fetch" to view resource details.
              </p>
            )}
          </>
        ) : (
          /* Search results */
          <>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>

            {isLoadingSearch ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : searchError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> Failed to search resources.</span>
              </div>
            ) : searchResults?.entry && searchResults.entry.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Resource ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Updated
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.entry.map((entry) => {
                      const resource = entry.resource
                      const id = resource.id
                      const lastUpdated = resource.meta?.lastUpdated

                      // Get resource-specific details
                      let details = ""
                      if (resourceType === "Patient") {
                        const name = resource.name?.[0]
                        details = name ? `${name.given?.join(" ") || ""} ${name.family || ""}` : "Unknown"
                      } else if (resourceType === "Observation") {
                        details = resource.code?.text || resource.code?.coding?.[0]?.display || "Unknown"
                      } else if (resourceType === "MedicationRequest") {
                        details = resource.medicationCodeableConcept?.text || "Unknown Medication"
                      } else {
                        details = resource.status || ""
                      }

                      return (
                        <tr key={id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lastUpdated ? formatDate(lastUpdated) : "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{details}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleSelectResource(id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : searchResults ? (
              <p className="text-gray-500 text-center py-4">No results found. Try adjusting your search criteria.</p>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Enter search criteria and click "Search" to find resources.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
