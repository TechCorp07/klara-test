"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import { useAuth } from "@/contexts/AuthContext"
import { Communication } from "@/api"
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout"
import {
  FaBell,
  FaExclamationTriangle,
  FaSave,
  FaEnvelope,
  FaMobile,
  FaCalendarAlt,
  FaFileMedical,
  FaComments,
} from "react-icons/fa"

export default function NotificationsClient() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState({
    email: {
      appointment_reminders: true,
      appointment_changes: true,
      messages: true,
      lab_results: true,
      prescriptions: true,
      system_notifications: true,
    },
    app: {
      appointment_reminders: true,
      appointment_changes: true,
      messages: true,
      lab_results: true,
      prescriptions: true,
      system_notifications: true,
    },
    sms: {
      appointment_reminders: true,
      appointment_changes: true,
      messages: false,
      lab_results: false,
      prescriptions: false,
      system_notifications: false,
    },
  })

  // Fetch notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await Communication.getNotificationSettings()
        setSettings(response)
      } catch (err) {
        console.error("Error fetching notification settings:", err)
        setError("Failed to load your notification settings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle setting changes
  const handleToggle = (channel, setting) => {
    setSettings({
      ...settings,
      [channel]: {
        ...settings[channel],
        [setting]: !settings[channel][setting],
      },
    })
  }

  // Save settings
  const handleSave = async () => {
    setSaving(true)
    try {
      await Communication.updateNotificationSettings(settings)
      toast.success("Notification settings saved successfully")
    } catch (err) {
      console.error("Error saving notification settings:", err)
      setError("Failed to save your notification settings. Please try again.")
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  // Toggle all settings for a channel
  const toggleAllForChannel = (channel, value) => {
    const channelSettings = { ...settings[channel] }
    Object.keys(channelSettings).forEach((key) => {
      channelSettings[key] = value
    })

    setSettings({
      ...settings,
      [channel]: channelSettings,
    })
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // Setting row component
  const SettingRow = ({ icon, title, description, channels }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
      <div className="flex items-center">
        <div className="mr-2 flex-shrink-0 text-gray-400">{icon}</div>
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
      </div>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
        <p className="text-sm text-gray-500 mb-3">{description}</p>
        <div className="flex space-x-6">
          {channels.map(({ name, key, label }) => (
            <div key={key} className="flex items-center">
              <input
                id={`${key}-${name}`}
                name={`${key}-${name}`}
                type="checkbox"
                checked={settings[key][name]}
                onChange={() => handleToggle(key, name)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`${key}-${name}`} className="ml-2 block text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </dd>
    </div>
  )

  // Channel toggle component
  const ChannelToggle = ({ channel, label, icon }) => {
    const allEnabled = Object.values(settings[channel]).every((value) => value === true)
    const allDisabled = Object.values(settings[channel]).every((value) => value === false)

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mb-3">
        <div className="flex items-center">
          {icon}
          <span className="text-sm font-medium text-gray-700 ml-2">{label}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => toggleAllForChannel(channel, true)}
            disabled={allEnabled}
            className={`text-xs px-2 py-1 rounded ${
              allEnabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => toggleAllForChannel(channel, false)}
            disabled={allDisabled}
            className={`text-xs px-2 py-1 rounded ${
              allDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Disable All
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage how and when you receive notifications</p>
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
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
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

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Notification Delivery Methods</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure how you want to receive different types of notifications
            </p>
          </div>

          <div className="px-4 sm:px-6 pb-5">
            <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <ChannelToggle
                  channel="app"
                  label="In-App Notifications"
                  icon={<FaBell className="h-5 w-5 text-blue-500" />}
                />
              </div>
              <div>
                <ChannelToggle
                  channel="email"
                  label="Email Notifications"
                  icon={<FaEnvelope className="h-5 w-5 text-green-500" />}
                />
              </div>
              <div>
                <ChannelToggle
                  channel="sms"
                  label="SMS Notifications"
                  icon={<FaMobile className="h-5 w-5 text-purple-500" />}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="divide-y divide-gray-200">
              <SettingRow
                icon={<FaCalendarAlt className="h-5 w-5" />}
                title="Appointment Reminders"
                description="Receive reminders about upcoming appointments"
                channels={[
                  { key: "app", name: "appointment_reminders", label: "In-App" },
                  { key: "email", name: "appointment_reminders", label: "Email" },
                  { key: "sms", name: "appointment_reminders", label: "SMS" },
                ]}
              />

              <SettingRow
                icon={<FaCalendarAlt className="h-5 w-5" />}
                title="Appointment Changes"
                description="Be notified when appointments are rescheduled or cancelled"
                channels={[
                  { key: "app", name: "appointment_changes", label: "In-App" },
                  { key: "email", name: "appointment_changes", label: "Email" },
                  { key: "sms", name: "appointment_changes", label: "SMS" },
                ]}
              />

              <SettingRow
                icon={<FaComments className="h-5 w-5" />}
                title="Messages"
                description="Receive notifications about new messages"
                channels={[
                  { key: "app", name: "messages", label: "In-App" },
                  { key: "email", name: "messages", label: "Email" },
                  { key: "sms", name: "messages", label: "SMS" },
                ]}
              />

              <SettingRow
                icon={<FaFileMedical className="h-5 w-5" />}
                title="Lab Results"
                description="Be notified when new lab results are available"
                channels={[
                  { key: "app", name: "lab_results", label: "In-App" },
                  { key: "email", name: "lab_results", label: "Email" },
                  { key: "sms", name: "lab_results", label: "SMS" },
                ]}
              />

              <SettingRow
                icon={<FaFileMedical className="h-5 w-5" />}
                title="Prescriptions"
                description="Receive updates about your prescriptions"
                channels={[
                  { key: "app", name: "prescriptions", label: "In-App" },
                  { key: "email", name: "prescriptions", label: "Email" },
                  { key: "sms", name: "prescriptions", label: "SMS" },
                ]}
              />

              <SettingRow
                icon={<FaBell className="h-5 w-5" />}
                title="System Notifications"
                description="Important announcements and security alerts"
                channels={[
                  { key: "app", name: "system_notifications", label: "In-App" },
                  { key: "email", name: "system_notifications", label: "Email" },
                  { key: "sms", name: "system_notifications", label: "SMS" },
                ]}
              />
            </dl>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
    </AuthenticatedLayout>
  )
}
