"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { toast } from "react-toastify"

export default function FHIRIntegrationPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [fhirResources, setFhirResources] = useState([])
  const [fhirServers, setFhirServers] = useState([])
  const [activeServer, setActiveServer] = useState(null)
  const [activeTab, setActiveTab] = useState("resources")
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedResources, setSelectedResources] = useState([])
  const [resourceTypes, setResourceTypes] = useState([])

  useEffect(() => {
    // Fetch FHIR integration data
    const fetchFHIRData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setFhirServers([
            {
              id: 1,
              name: "Epic FHIR Server",
              url: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
              status: "connected",
              last_sync: "2023-04-14T09:30:00Z",
              auth_type: "oauth2",
              version: "R4",
            },
            {
              id: 2,
              name: "Cerner FHIR Server",
              url: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
              status: "disconnected",
              last_sync: null,
              auth_type: "oauth2",
              version: "R4",
            },
            {
              id: 3,
              name: "Meditech FHIR Server",
              url: "https://api.meditech.com/fhir/r4",
              status: "disconnected",
              last_sync: null,
              auth_type: "oauth2",
              version: "R4",
            },
            {
              id: 4,
              name: "HAPI FHIR Test Server",
              url: "https://hapi.fhir.org/baseR4",
              status: "connected",
              last_sync: "2023-04-10T14:15:00Z",
              auth_type: "none",
              version: "R4",
            },
          ])

          setFhirResources([
            {
              id: "Patient-123",
              resourceType: "Patient",
              name: [{ family: "Smith", given: ["John"] }],
              gender: "male",
              birthDate: "1970-01-01",
              address: [{ line: ["123 Main St"], city: "Anytown", state: "CA", postalCode: "12345" }],
              telecom: [{ system: "phone", value: "555-123-4567" }],
              source: "Epic FHIR Server",
              last_updated: "2023-04-14T09:30:00Z",
            },
            {
              id: "Observation-456",
              resourceType: "Observation",
              status: "final",
              code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] },
              subject: { reference: "Patient/123" },
              effectiveDateTime: "2023-04-01T10:30:00Z",
              valueQuantity: { value: 120, unit: "mm[Hg]" },
              source: "Epic FHIR Server",
              last_updated: "2023-04-14T09:30:00Z",
            },
            {
              id: "Observation-457",
              resourceType: "Observation",
              status: "final",
              code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] },
              subject: { reference: "Patient/123" },
              effectiveDateTime: "2023-04-01T10:30:00Z",
              valueQuantity: { value: 80, unit: "mm[Hg]" },
              source: "Epic FHIR Server",
              last_updated: "2023-04-14T09:30:00Z",
            },
            {
              id: "Condition-789",
              resourceType: "Condition",
              clinicalStatus: {
                coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
              },
              verificationStatus: {
                coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }],
              },
              code: { coding: [{ system: "http://snomed.info/sct", code: "38341003", display: "Hypertension" }] },
              subject: { reference: "Patient/123" },
              onsetDateTime: "2023-01-15",
              source: "Epic FHIR Server",
              last_updated: "2023-04-14T09:30:00Z",
            },
            {
              id: "MedicationRequest-101",
              resourceType: "MedicationRequest",
              status: "active",
              intent: "order",
              medicationCodeableConcept: {
                coding: [
                  {
                    system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                    code: "314076",
                    display: "Lisinopril 10 MG",
                  },
                ],
              },
              subject: { reference: "Patient/123" },
              authoredOn: "2023-03-20",
              dosageInstruction: [{ text: "Take 1 tablet by mouth once daily" }],
              source: "Epic FHIR Server",
              last_updated: "2023-04-14T09:30:00Z",
            },
          ])

          setResourceTypes([
            {
              id: "Patient",
              name: "Patient",
              description:
                "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
            },
            {
              id: "Observation",
              name: "Observation",
              description: "Measurements and simple assertions made about a patient, device or other subject.",
            },
            {
              id: "Condition",
              name: "Condition",
              description:
                "A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept that has risen to a level of concern.",
            },
            {
              id: "MedicationRequest",
              name: "Medication Request",
              description:
                "An order or request for both supply of the medication and the instructions for administration of the medication to a patient.",
            },
            {
              id: "Procedure",
              name: "Procedure",
              description:
                "An action that is or was performed on or for a patient. This can be a physical intervention like an operation, or less invasive like long term services, counseling, or hypnotherapy.",
            },
            {
              id: "Immunization",
              name: "Immunization",
              description:
                "Describes the event of a patient being administered a vaccine or a record of an immunization as reported by a patient, a clinician or another party.",
            },
            {
              id: "AllergyIntolerance",
              name: "Allergy Intolerance",
              description:
                "Risk of harmful or undesirable, physiological response which is unique to an individual and associated with exposure to a substance.",
            },
            {
              id: "CarePlan",
              name: "Care Plan",
              description:
                "Describes the intention of how one or more practitioners intend to deliver care for a particular patient, group or community for a period of time.",
            },
          ])

          setActiveServer(1)
          setIsLoading(false)
        }, 1500)
      } catch (error) {
        console.error("Error fetching FHIR data:", error)
        toast.error("Failed to load FHIR integration data")
        setIsLoading(false)
      }
    }

    fetchFHIRData()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleServerChange = (serverId) => {
    setActiveServer(serverId)
  }

  const handleConnectServer = async (serverId) => {
    setIsConnecting(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update server status
      setFhirServers(
        fhirServers.map((server) => {
          if (server.id === serverId) {
            return { ...server, status: "connected", last_sync: new Date().toISOString() }
          }
          return server
        }),
      )

      toast.success("Successfully connected to FHIR server")
    } catch (error) {
      console.error("Error connecting to FHIR server:", error)
      toast.error("Failed to connect to FHIR server")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectServer = async (serverId) => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update server status
      setFhirServers(
        fhirServers.map((server) => {
          if (server.id === serverId) {
            return { ...server, status: "disconnected" }
          }
          return server
        }),
      )

      toast.success("Successfully disconnected from FHIR server")
    } catch (error) {
      console.error("Error disconnecting from FHIR server:", error)
      toast.error("Failed to disconnect from FHIR server")
    }
  }

  const handleSyncServer = async (serverId) => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update server last sync time
      setFhirServers(
        fhirServers.map((server) => {
          if (server.id === serverId) {
            return { ...server, last_sync: new Date().toISOString() }
          }
          return server
        }),
      )

      toast.success("Successfully synchronized with FHIR server")
    } catch (error) {
      console.error("Error synchronizing with FHIR server:", error)
      toast.error("Failed to synchronize with FHIR server")
    }
  }

  const handleExportResources = async () => {
    if (selectedResources.length === 0) {
      toast.warning("Please select at least one resource to export")
      return
    }

    setIsExporting(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Successfully exported ${selectedResources.length} resources`)
      setSelectedResources([])
    } catch (error) {
      console.error("Error exporting FHIR resources:", error)
      toast.error("Failed to export FHIR resources")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportResources = async (resourceTypes) => {
    if (!resourceTypes || resourceTypes.length === 0) {
      toast.warning("Please select at least one resource type to import")
      return
    }

    setIsImporting(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Successfully imported ${resourceTypes.length} resource types`)
    } catch (error) {
      console.error("Error importing FHIR resources:", error)
      toast.error("Failed to import FHIR resources")
    } finally {
      setIsImporting(false)
    }
  }

  const handleResourceSelection = (resourceId) => {
    setSelectedResources((prev) => {
      if (prev.includes(resourceId)) {
        return prev.filter((id) => id !== resourceId)
      } else {
        return [...prev, resourceId]
      }
    })
  }

  const handleSelectAllResources = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([])
    } else {
      setSelectedResources(filteredResources.map((resource) => resource.id))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Never"

    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    return formatDate(dateString)
  }

  const filteredResources = searchQuery
    ? fhirResources.filter(
        (resource) =>
          resource.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          JSON.stringify(resource).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : fhirResources

  const getActiveServerDetails = () => {
    return fhirServers.find((server) => server.id === activeServer) || null
  }

  if (isLoading) {
    return (
      <DashboardLayout
        title="FHIR Integration"
        subtitle="Connect and manage healthcare data using FHIR standards"
        role={user?.role || "admin"}
      >
        <div className="flex items-center justify-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading FHIR integration data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="FHIR Integration"
      subtitle="Connect and manage healthcare data using FHIR standards"
      role={user?.role || "admin"}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search FHIR resources..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* FHIR Server Selection */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">FHIR Server Connection</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect to healthcare systems using FHIR standards.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {fhirServers.map((server) => (
              <div
                key={server.id}
                className={`border rounded-lg overflow-hidden ${
                  activeServer === server.id ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200"
                }`}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-medium text-gray-900">{server.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        server.status === "connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {server.status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate" title={server.url}>
                    {server.url}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Version: {server.version} | Auth: {server.auth_type}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Last Sync: {server.last_sync ? getRelativeTime(server.last_sync) : "Never"}
                  </p>

                  <div className="mt-4 flex space-x-2">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                        activeServer === server.id
                          ? "bg-primary-100 text-primary-700"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleServerChange(server.id)}
                    >
                      {activeServer === server.id ? "Selected" : "Select"}
                    </button>

                    {server.status === "connected" ? (
                      <>
                        <button
                          type="button"
                          className="px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          onClick={() => handleSyncServer(server.id)}
                        >
                          Sync
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleDisconnectServer(server.id)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => handleConnectServer(server.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === "resources"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange("resources")}
          >
            FHIR Resources
          </button>
          <button
            className={`${
              activeTab === "import"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange("import")}
          >
            Import Data
          </button>
          <button
            className={`${
              activeTab === "export"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange("export")}
          >
            Export Data
          </button>
          <button
            className={`${
              activeTab === "settings"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => handleTabChange("settings")}
          >
            Integration Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "resources" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">FHIR Resources</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">View and manage healthcare data in FHIR format.</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">{filteredResources.length} resources</span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  handleSelectAllResources()
                }}
              >
                {selectedResources.length === filteredResources.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleExportResources}
                disabled={selectedResources.length === 0 || isExporting}
              >
                {isExporting ? "Exporting..." : "Export Selected"}
              </button>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No FHIR resources found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search query." : "Connect to a FHIR server to import resources."}
              </p>
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
                      <div className="flex items-center">
                        <input
                          id="select-all-resources"
                          name="select-all-resources"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={
                            selectedResources.length === filteredResources.length && filteredResources.length > 0
                          }
                          onChange={handleSelectAllResources}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Resource Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
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
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Last Updated
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
                  {filteredResources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            id={`select-resource-${resource.id}`}
                            name={`select-resource-${resource.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedResources.includes(resource.id)}
                            onChange={() => handleResourceSelection(resource.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            resource.resourceType === "Patient"
                              ? "bg-blue-100 text-blue-800"
                              : resource.resourceType === "Observation"
                                ? "bg-green-100 text-green-800"
                                : resource.resourceType === "Condition"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : resource.resourceType === "MedicationRequest"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {resource.resourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {resource.resourceType === "Patient" && (
                          <div>
                            <div className="font-medium text-gray-900">
                              {resource.name[0].family}, {resource.name[0].given.join(" ")}
                            </div>
                            <div>
                              {resource.gender} | {resource.birthDate}
                            </div>
                          </div>
                        )}
                        {resource.resourceType === "Observation" && (
                          <div>
                            <div className="font-medium text-gray-900">{resource.code.coding[0].display}</div>
                            <div>
                              {resource.valueQuantity.value} {resource.valueQuantity.unit} |{" "}
                              {formatDate(resource.effectiveDateTime)}
                            </div>
                          </div>
                        )}
                        {resource.resourceType === "Condition" && (
                          <div>
                            <div className="font-medium text-gray-900">{resource.code.coding[0].display}</div>
                            <div>
                              Status: {resource.clinicalStatus.coding[0].code} | Onset:{" "}
                              {formatDate(resource.onsetDateTime)}
                            </div>
                          </div>
                        )}
                        {resource.resourceType === "MedicationRequest" && (
                          <div>
                            <div className="font-medium text-gray-900">
                              {resource.medicationCodeableConcept.coding[0].display}
                            </div>
                            <div>
                              {resource.dosageInstruction[0].text} | Authored: {formatDate(resource.authoredOn)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRelativeTime(resource.last_updated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          onClick={() => {
                            // View resource details
                            toast.info(`Viewing details for ${resource.resourceType} ${resource.id}`)
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Import FHIR Data</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Import healthcare data from connected FHIR servers.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Selected FHIR Server</h4>
              {getActiveServerDetails() ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getActiveServerDetails().name}</p>
                      <p className="text-sm text-gray-500">{getActiveServerDetails().url}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getActiveServerDetails().status === "connected"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getActiveServerDetails().status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No FHIR server selected. Please select a server from the list above.
                </p>
              )}
            </div>

            {getActiveServerDetails() && getActiveServerDetails().status === "connected" ? (
              <>
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Select Resource Types to Import</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resourceTypes.map((resourceType) => (
                      <div key={resourceType.id} className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`resource-type-${resourceType.id}`}
                            name={`resource-type-${resourceType.id}`}
                            type="checkbox"
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`resource-type-${resourceType.id}`} className="font-medium text-gray-700">
                            {resourceType.name}
                          </label>
                          <p className="text-gray-500">{resourceType.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Import Options</h4>
                  <div className="space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="option-incremental"
                          name="import-option"
                          type="radio"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="option-incremental" className="font-medium text-gray-700">
                          Incremental Import
                        </label>
                        <p className="text-gray-500">
                          Only import new or updated resources since last synchronization.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="option-full"
                          name="import-option"
                          type="radio"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="option-full" className="font-medium text-gray-700">
                          Full Import
                        </label>
                        <p className="text-gray-500">Import all resources, overwriting existing data.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => handleImportResources(resourceTypes.map((rt) => rt.id))}
                    disabled={isImporting}
                  >
                    {isImporting ? (
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
                        Importing...
                      </>
                    ) : (
                      "Start Import"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connected FHIR server</h3>
                <p className="mt-1 text-sm text-gray-500">Please connect to a FHIR server before importing data.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => {
                      if (getActiveServerDetails()) {
                        handleConnectServer(getActiveServerDetails().id)
                      } else {
                        toast.warning("Please select a FHIR server first")
                      }
                    }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect to Server"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "export" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Export FHIR Data</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Export healthcare data to FHIR format for interoperability.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Export Format</h4>
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="format-json"
                      name="export-format"
                      type="radio"
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="format-json" className="font-medium text-gray-700">
                      JSON
                    </label>
                    <p className="text-gray-500">Export data in FHIR JSON format.</p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="format-xml"
                      name="export-format"
                      type="radio"
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="format-xml" className="font-medium text-gray-700">
                      XML
                    </label>
                    <p className="text-gray-500">Export data in FHIR XML format.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Export Options</h4>
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="option-include-references"
                      name="include-references"
                      type="checkbox"
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="option-include-references" className="font-medium text-gray-700">
                      Include References
                    </label>
                    <p className="text-gray-500">Include referenced resources in the export.</p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="option-anonymize"
                      name="anonymize"
                      type="checkbox"
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="option-anonymize" className="font-medium text-gray-700">
                      Anonymize Data
                    </label>
                    <p className="text-gray-500">Remove personally identifiable information from exported data.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Selected Resources</h4>
              {selectedResources.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-500">No resources selected for export.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Go to the FHIR Resources tab to select resources for export.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {selectedResources.length} resources selected for export
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResources.map((resourceId) => {
                      const resource = fhirResources.find((r) => r.id === resourceId)
                      return resource ? (
                        <span
                          key={resourceId}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            resource.resourceType === "Patient"
                              ? "bg-blue-100 text-blue-800"
                              : resource.resourceType === "Observation"
                                ? "bg-green-100 text-green-800"
                                : resource.resourceType === "Condition"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : resource.resourceType === "MedicationRequest"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {resource.resourceType}: {resourceId}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleExportResources}
                disabled={selectedResources.length === 0 || isExporting}
              >
                {isExporting ? (
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
                    Exporting...
                  </>
                ) : (
                  "Export Resources"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">FHIR Integration Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure FHIR integration settings and preferences.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900">FHIR Version</h4>
                <div className="mt-4">
                  <select
                    id="fhir-version"
                    name="fhir-version"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    defaultValue="R4"
                  >
                    <option value="DSTU2">DSTU2</option>
                    <option value="STU3">STU3</option>
                    <option value="R4">R4 (Default)</option>
                    <option value="R5">R5 (Preview)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900">Authentication Settings</h4>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="client-id" className="block text-sm font-medium text-gray-700">
                      Client ID
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="client-id"
                        id="client-id"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="klararety-fhir-client"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="client-secret" className="block text-sm font-medium text-gray-700">
                      Client Secret
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="client-secret"
                        id="client-secret"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="••••••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <label htmlFor="token-url" className="block text-sm font-medium text-gray-700">
                      Token URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="token-url"
                        id="token-url"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="https://auth.example.com/oauth2/token"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900">Synchronization Settings</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="auto-sync"
                        name="auto-sync"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="auto-sync" className="ml-3 block text-sm font-medium text-gray-700">
                        Automatic Synchronization
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Sync data automatically on a schedule</span>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sync-frequency" className="block text-sm font-medium text-gray-700">
                      Sync Frequency
                    </label>
                    <div className="mt-1">
                      <select
                        id="sync-frequency"
                        name="sync-frequency"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue="daily"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900">Resource Mapping</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="auto-mapping"
                        name="auto-mapping"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="auto-mapping" className="ml-3 block text-sm font-medium text-gray-700">
                        Automatic Field Mapping
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Automatically map FHIR fields to system fields</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="strict-validation"
                        name="strict-validation"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="strict-validation" className="ml-3 block text-sm font-medium text-gray-700">
                        Strict Validation
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Validate FHIR resources against profiles</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                onClick={() => {
                  // Reset settings
                  toast.info("Settings reset to defaults")
                }}
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  // Save settings
                  toast.success("FHIR integration settings saved successfully")
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
