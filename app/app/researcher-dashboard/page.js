"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { healthcare } from "@/lib/services/healthcareService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { toast } from "react-toastify"

export default function ResearcherDashboard() {
  const { user } = useAuth()

  // Fetch research studies
  const { data: studies } = useQuery({
    queryKey: ["researchStudies"],
    queryFn: () => healthcare.getResearchStudies(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load research studies")
      console.error("Error fetching studies:", error)
    },
  })

  // Fetch study participants
  const { data: participants } = useQuery({
    queryKey: ["studyParticipants"],
    queryFn: () => healthcare.getStudyParticipants(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load study participants")
      console.error("Error fetching participants:", error)
    },
  })

  // Fetch anonymized patient data
  const { data: anonymizedData } = useQuery({
    queryKey: ["anonymizedData"],
    queryFn: () => healthcare.getAnonymizedPatientData(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load anonymized data")
      console.error("Error fetching anonymized data:", error)
    },
  })

  // Fetch rare condition registry data
  const { data: rareConditions } = useQuery({
    queryKey: ["rareConditions"],
    queryFn: () => healthcare.getRareConditionRegistry(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load rare condition registry")
      console.error("Error fetching rare conditions:", error)
    },
  })

  // Redirect if user is not a researcher
  useEffect(() => {
    if (user && user.role !== "researcher") {
      window.location.href = "/dashboard"
    }
  }, [user])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Researcher Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || "Researcher"}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Active Studies</h2>
          <p className="text-3xl font-bold text-blue-600">{studies?.active_count || 0}</p>
          <Link href="/research/studies" className="text-blue-600 hover:text-blue-800 text-sm">
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Participants</h2>
          <p className="text-3xl font-bold text-green-600">{participants?.total_count || 0}</p>
          <Link href="/research/participants" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Data Points</h2>
          <p className="text-3xl font-bold text-purple-600">{anonymizedData?.data_points_count || 0}</p>
          <Link href="/research/data" className="text-blue-600 hover:text-blue-800 text-sm">
            Explore data →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Rare Conditions</h2>
          <p className="text-3xl font-bold text-yellow-600">{rareConditions?.condition_count || 0}</p>
          <Link href="/research/rare-conditions" className="text-blue-600 hover:text-blue-800 text-sm">
            View registry →
          </Link>
        </div>
      </div>

      {/* Research Studies and Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Research Studies</h2>
            <Link href="/research/studies" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {studies && studies.results && studies.results.length > 0 ? (
            <div className="space-y-4">
              {studies.results.slice(0, 5).map((study) => (
                <div key={study.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{study.title}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        study.status === "recruiting"
                          ? "bg-green-100 text-green-800"
                          : study.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Participants: {study.participant_count}</p>
                  <p className="text-sm text-gray-600">End Date: {study.end_date}</p>
                  <div className="flex justify-end mt-1">
                    <Link href={`/research/studies/${study.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active studies found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Participants</h2>
            <Link href="/research/participants" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {participants && participants.results && participants.results.length > 0 ? (
            <div className="space-y-4">
              {participants.results.slice(0, 5).map((participant) => (
                <div key={participant.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">Participant #{participant.participant_id}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        participant.status === "active"
                          ? "bg-green-100 text-green-800"
                          : participant.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Study: {participant.study_title}</p>
                  <p className="text-sm text-gray-600">Joined: {participant.enrollment_date}</p>
                  <div className="flex justify-end mt-1">
                    <Link
                      href={`/research/participants/${participant.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No participants found.</p>
          )}
        </div>
      </div>

      {/* Data Analysis and Rare Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Data Analysis</h2>
            <Link href="/research/data" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {anonymizedData && anonymizedData.datasets && anonymizedData.datasets.length > 0 ? (
            <div className="space-y-4">
              {anonymizedData.datasets.slice(0, 5).map((dataset, index) => (
                <div key={index} className="border-b pb-3">
                  <p className="font-medium">{dataset.name}</p>
                  <p className="text-sm text-gray-600">Records: {dataset.record_count}</p>
                  <p className="text-sm text-gray-600">Last Updated: {dataset.last_updated}</p>
                  <div className="flex justify-end mt-1 space-x-2">
                    <Link
                      href={`/research/data/${dataset.id}/view`}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                    >
                      View
                    </Link>
                    <Link
                      href={`/research/data/${dataset.id}/export`}
                      className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                    >
                      Export
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No datasets available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rare Condition Registry</h2>
            <Link href="/research/rare-conditions" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {rareConditions && rareConditions.results && rareConditions.results.length > 0 ? (
            <div className="space-y-4">
              {rareConditions.results.slice(0, 5).map((condition) => (
                <div key={condition.id} className="border-b pb-3">
                  <p className="font-medium">{condition.name}</p>
                  <p className="text-sm text-gray-600">Cases: {condition.case_count}</p>
                  <p className="text-sm text-gray-600">Category: {condition.category}</p>
                  <div className="flex justify-end mt-1">
                    <Link
                      href={`/research/rare-conditions/${condition.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No rare conditions found.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/research/studies/new"
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>Create Study</span>
            </div>
          </Link>

          <Link
            href="/research/participants/invite"
            className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Invite Participants</span>
            </div>
          </Link>

          <Link
            href="/research/data/analyze"
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Analyze Data</span>
            </div>
          </Link>

          <Link
            href="/research/reports"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Generate Reports</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Research Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Research Resources</h2>
          <Link href="/resources" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Research Protocols</h3>
            <p className="text-sm text-gray-600 mb-2">Access standardized research protocols and templates.</p>
            <Link href="/resources/protocols" className="text-blue-600 hover:text-blue-800 text-sm">
              View protocols →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Ethics Guidelines</h3>
            <p className="text-sm text-gray-600 mb-2">Review ethics guidelines and IRB submission templates.</p>
            <Link href="/resources/ethics" className="text-blue-600 hover:text-blue-800 text-sm">
              View guidelines →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Data Analysis Tools</h3>
            <p className="text-sm text-gray-600 mb-2">Access statistical analysis tools and resources.</p>
            <Link href="/resources/analysis-tools" className="text-blue-600 hover:text-blue-800 text-sm">
              View tools →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
