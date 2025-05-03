"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { medicationService } from "@/lib/services/medicationService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

/**
 * Client component for medications page
 */
export default function MedicationsClient() {
  const { user } = useAuth()
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [showAdherenceHistory, setShowAdherenceHistory] = useState(false)
  const queryClient = useQueryClient()

  // Fetch medications
  const {
    data: medications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medications", user?.id],
    queryFn: () => medicationService.getMedications({ patient: user?.id }),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load medications")
      console.error("Error fetching medications:", error)
    },
  })

  // Fetch medication adherence for selected medication
  const { data: adherenceData, isLoading: isAdherenceLoading } = useQuery({
    queryKey: ["medicationAdherence", selectedMedication?.id],
    queryFn: () => medicationService.getMedicationIntakes(selectedMedication?.id),
    enabled: !!selectedMedication && showAdherenceHistory,
    onError: (error) => {
      toast.error("Failed to load medication adherence data")
      console.error("Error fetching adherence data:", error)
    },
  })

  // Mutation for recording medication intake
  const recordIntakeMutation = useMutation({
    mutationFn: (intakeData) => medicationService.recordMedicationIntake(intakeData),
    onSuccess: () => {
      toast.success("Medication intake recorded")
      queryClient.invalidateQueries(["medicationAdherence", selectedMedication?.id])
    },
    onError: (error) => {
      toast.error("Failed to record medication intake")
      console.error("Error recording intake:", error)
    },
  })

  // Mutation for requesting a refill
  const requestRefillMutation = useMutation({
    mutationFn: (medicationId) => medicationService.requestRefill(medicationId),
    onSuccess: () => {
      toast.success("Refill request sent")
    },
    onError: (error) => {
      toast.error("Failed to request refill")
      console.error("Error requesting refill:", error)
    },
  })

  const handleMedicationSelect = (medicationService) => {
    setSelectedMedication(medicationService)
    setShowAdherenceHistory(false)
  }

  const handleRecordIntake = () => {
    if (selectedMedication) {
      recordIntakeMutation.mutate({
        medicationService: selectedMedication.id,
        taken_at: new Date().toISOString(),
        status: "taken",
      })
    }
  }

  const handleRequestRefill = () => {
    if (selectedMedication) {
      requestRefillMutation.mutate(selectedMedication.id)
    }
  }

  const toggleAdherenceHistory = () => {
    setShowAdherenceHistory(!showAdherenceHistory)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medications</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medications</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading medications. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Medications</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Medications List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Medications</h2>

            {medications && medications.results && medications.results.length > 0 ? (
              <div className="space-y-4">
                {medications.results.map((med) => (
                  <div
                    key={med.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedMedication?.id === med.id
                        ? "bg-primary-100 border border-primary-300"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => handleMedicationSelect(med)}
                  >
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      {med.dosage} - {med.frequency}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${med.active ? "bg-green-500" : "bg-red-500"}`}></div>
                      <p className="text-xs text-gray-500">{med.active ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medications found.</p>
            )}
          </div>
        </div>

        {/* Medication Details */}
        <div className="md:col-span-2">
          {selectedMedication ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{selectedMedication.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Dosage</p>
                  <p className="font-medium">{selectedMedication.dosage}</p>
                </div>
                <div>
                  <p className="text-gray-600">Route</p>
                  <p className="font-medium">{selectedMedication.route}</p>
                </div>
                <div>
                  <p className="text-gray-600">Frequency</p>
                  <p className="font-medium">{selectedMedication.frequency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium">{selectedMedication.start_date}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-medium">{selectedMedication.end_date || "Ongoing"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Refills Remaining</p>
                  <p className="font-medium">
                    {selectedMedication.refills_remaining} of {selectedMedication.refills_allowed}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">Instructions</p>
                <p className="font-medium">{selectedMedication.instructions}</p>
              </div>

              {selectedMedication.potential_side_effects && (
                <div className="mb-6">
                  <p className="text-gray-600">Potential Side Effects</p>
                  <p className="font-medium">{selectedMedication.potential_side_effects}</p>
                </div>
              )}

              {selectedMedication.known_interactions && (
                <div className="mb-6">
                  <p className="text-gray-600">Known Interactions</p>
                  <p className="font-medium">{selectedMedication.known_interactions}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                  onClick={handleRecordIntake}
                  disabled={recordIntakeMutation.isPending}
                >
                  {recordIntakeMutation.isPending ? "Recording..." : "Record Intake"}
                </button>

                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg"
                  onClick={handleRequestRefill}
                  disabled={requestRefillMutation.isPending || selectedMedication.refills_remaining <= 0}
                >
                  {requestRefillMutation.isPending ? "Requesting..." : "Request Refill"}
                </button>

                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                  onClick={toggleAdherenceHistory}
                >
                  {showAdherenceHistory ? "Hide Adherence History" : "Show Adherence History"}
                </button>
              </div>

              {/* Adherence History */}
              {showAdherenceHistory && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Adherence History</h3>

                  {isAdherenceLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  ) : adherenceData && adherenceData.results && adherenceData.results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date & Time
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
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {adherenceData.results.map((intake) => (
                            <tr key={intake.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(intake.taken_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    intake.status === "taken"
                                      ? "bg-green-100 text-green-800"
                                      : intake.status === "missed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {intake.status.charAt(0).toUpperCase() + intake.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{intake.notes || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No adherence data available.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a medication to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
