"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { communication } from "@/lib/services/communicationService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function CommunityLayout({ children }) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch community stats
  const { data: communityStats } = useQuery({
    queryKey: ["communityStats"],
    queryFn: () => communication.getCommunityStats(),
    enabled: !!user,
    onError: (error) => {
      console.error("Error fetching community stats:", error)
    },
  })

  // Check if user has moderation permissions
  const hasModPermissions = user && (user.role === "admin" || user.role === "superadmin" || user.role === "moderator")

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality
    if (searchQuery.trim()) {
      window.location.href = `/community/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Klararety Community</h1>
            <p className="text-gray-600 mt-1">Connect, share, and learn with the healthcare community</p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community..."
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Community Navigation */}
        <nav className="flex flex-wrap space-x-1 md:space-x-4">
          <Link href="/community" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
            Home
          </Link>
          <Link
            href="/community/topics"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Topics
          </Link>
          <Link
            href="/community/popular"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Popular
          </Link>
          <Link
            href="/community/recent"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Recent
          </Link>
          {hasModPermissions && (
            <Link
              href="/community/moderation"
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Moderation
            </Link>
          )}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Community Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Members</p>
                <p className="font-medium">{communityStats?.member_count || "0"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Posts</p>
                <p className="font-medium">{communityStats?.post_count || "0"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Comments</p>
                <p className="font-medium">{communityStats?.comment_count || "0"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Discussions</p>
                <p className="font-medium">{communityStats?.active_discussions_count || "0"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Popular Topics</h2>
            <div className="space-y-2">
              <Link
                href="/community/topics/general"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                General Discussion
              </Link>
              <Link
                href="/community/topics/research"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Research & Studies
              </Link>
              <Link
                href="/community/topics/support"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Support Groups
              </Link>
              <Link
                href="/community/topics/questions"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Questions & Answers
              </Link>
              <Link
                href="/community/topics/rare-conditions"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Rare Conditions
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Community Guidelines</h2>
            <p className="text-sm text-gray-600 mb-4">
              Our community is a place for respectful discussion and support. Please follow these guidelines:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Be respectful and kind to others</li>
              <li>Do not share personal medical information</li>
              <li>Verify information before sharing</li>
              <li>Report inappropriate content</li>
              <li>Follow HIPAA compliance rules</li>
            </ul>
            <div className="mt-4">
              <Link href="/community/guidelines" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Read full guidelines →
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  )
}
