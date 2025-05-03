"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { communicationService } from "@/lib/services/communicationService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

/**
 * Client component for messages page
 */
export default function MessagesClient() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const queryClient = useQueryClient()

  // Fetch conversations
  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => communicationService.getConversations(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load conversations")
      console.error("Error fetching conversations:", error)
    },
  })

  // Fetch messages for selected conversation
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation?.id],
    queryFn: () => communicationService.getMessages(selectedConversation?.id),
    enabled: !!selectedConversation,
    onError: (error) => {
      toast.error("Failed to load messages")
      console.error("Error fetching messages:", error)
    },
  })

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => communicationService.sendMessage(messageData),
    onSuccess: () => {
      setNewMessage("")
      queryClient.invalidateQueries(["messages", selectedConversation?.id])
    },
    onError: (error) => {
      toast.error("Failed to send message")
      console.error("Error sending message:", error)
    },
  })

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation) return

    sendMessageMutation.mutate({
      conversation: selectedConversation.id,
      content: newMessage.trim(),
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading messages. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg"
          onClick={() => (window.location.href = "/messages/new")}
        >
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Conversations</h2>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {conversations && conversations.results && conversations.results.length > 0 ? (
              <div>
                {conversations.results.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? "bg-primary-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {conversation.other_participant.first_name} {conversation.other_participant.last_name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {conversation.last_message
                          ? new Date(conversation.last_message.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </div>

                    {conversation.unread_count > 0 && (
                      <div className="mt-2 flex justify-end">
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  {selectedConversation.other_participant.first_name} {selectedConversation.other_participant.last_name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedConversation.other_participant.role.charAt(0).toUpperCase() +
                    selectedConversation.other_participant.role.slice(1)}
                </p>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isMessagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : messages && messages.results && messages.results.length > 0 ? (
                  messages.results.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender.id === user.id ? "bg-primary-100 ml-auto" : "bg-gray-100"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(message.created_at).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg disabled:bg-primary-400"
                  >
                    {sendMessageMutation.isPending ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a conversation to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
