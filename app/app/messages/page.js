'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { communication } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { 
  FaComments, 
  FaUser, 
  FaSearch, 
  FaPaperPlane, 
  FaEllipsisV, 
  FaPaperclip, 
  FaExclamationTriangle, 
  FaSmile,
  FaUserMd,
  FaUserCircle
} from 'react-icons/fa';

// Contact list item component
const ContactItem = ({ conversation, isActive, onClick, lastMessage, unreadCount }) => {
  // Get the other participant (not current user)
  const { user } = useAuth();
  const otherParticipant = conversation.participants_details?.find(p => p.id !== user.id);
  
  return (
    <button
      onClick={() => onClick(conversation)}
      className={`w-full flex items-center px-3 py-3 text-left transition-colors ${
        isActive 
          ? 'bg-blue-50 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        {otherParticipant?.profile_image ? (
          <img 
            src={otherParticipant.profile_image} 
            alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {otherParticipant?.role === 'provider' ? (
              <FaUserMd className="h-6 w-6 text-gray-500" />
            ) : (
              <FaUserCircle className="h-6 w-6 text-gray-500" />
            )}
          </div>
        )}
        
        {otherParticipant?.is_online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
        )}
      </div>
      
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {otherParticipant 
              ? `${otherParticipant.first_name} ${otherParticipant.last_name}` 
              : 'Unknown User'}
          </p>
          <p className="text-xs text-gray-500">
            {lastMessage?.sent_at 
              ? format(new Date(lastMessage.sent_at), 'h:mm a')
              : ''}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate">
            {lastMessage?.content || 'No messages yet'}
          </p>
          
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Message bubble component
const MessageBubble = ({ message, isSentByCurrentUser }) => {
  const timestampFormatted = format(new Date(message.sent_at), 'h:mm a');
  
  return (
    <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
        isSentByCurrentUser 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-gray-200 text-gray-800 rounded-bl-none'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${
          isSentByCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {timestampFormatted}
        </p>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
    <FaComments className="h-16 w-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
    <p className="mt-1 text-sm text-gray-500">
      Select a conversation from the list or start a new one.
    </p>
    <button
      type="button"
      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      New Message
    </button>
  </div>
);

// Start new conversation modal component
const NewConversationModal = ({ isOpen, onClose, onSubmit }) => {
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await communication.searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, isOpen]);
  
  const handleSelectUser = (user) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    
    onSubmit(selectedUsers.map(user => user.id));
    setSelectedUsers([]);
    setSearchTerm('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New Conversation</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            
            <div className="relative">
              <div className="flex flex-wrap items-center border border-gray-300 rounded-md p-2 mb-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-1">
                    <span>{user.first_name} {user.last_name}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  id="recipients"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 min-w-0 border-0 p-0 focus:ring-0 sm:text-sm"
                />
              </div>
              
              {loading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {searchResults.map(user => (
                    <li
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          {user.role === 'provider' ? (
                            <FaUserMd className="h-4 w-4 text-gray-500" />
                          ) : (
                            <FaUser className="h-4 w-4 text-gray-500" />
                          )}
                        </span>
                        <span className="ml-3 truncate">{user.first_name} {user.last_name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const messageContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // Fetch conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await communication.getConversations();
        setConversations(response);
        
        // Auto-select first conversation if none is active
        if (response.length > 0 && !activeConversation) {
          setActiveConversation(response[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Setup polling for new conversations/messages
    const interval = setInterval(fetchConversations, 30000); // every 30 seconds
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await communication.getMessages(activeConversation.id);
        setMessages(response);
        
        // Mark conversation as read
        await communication.markConversationAsRead(activeConversation.id);
        
        // Update unread count in conversations list
        setConversations(conversations.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, unread_count: 0 }
            : conv
        ));
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [activeConversation]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      const messageData = {
        conversation: activeConversation.id,
        content: newMessage,
      };
      
      // Optimistically add to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        sender: user.id,
        content: newMessage,
        sent_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages([...messages, optimisticMessage]);
      setNewMessage('');
      
      // Actually send to API
      const response = await communication.sendMessage(messageData);
      
      // Replace optimistic message with real one
      setMessages(messages => 
        messages.map(msg => 
          msg.id === optimisticMessage.id ? response : msg
        )
      );
      
      // Focus input for next message
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
      
      // Remove optimistic message on failure
      setMessages(messages => messages.filter(msg => !msg.id.startsWith('temp-')));
    }
  };
  
  // Handle creating a new conversation
  const handleCreateConversation = async (participantIds) => {
    try {
      const response = await communication.createConversation({
        participants: [...participantIds, user.id]
      });
      
      // Add new conversation to list
      setConversations([response, ...conversations]);
      
      // Set as active conversation
      setActiveConversation(response);
      
      // Close modal
      setShowNewConversationModal(false);
      
      toast.success('Conversation created successfully');
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error('Failed to create conversation. Please try again.');
    }
  };
  
  return (
    <AuthenticatedLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white shadow z-10">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
        
        {error && (
          <div className="m-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
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
        
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation list */}
          <div className="w-full max-w-xs flex flex-col border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="relative rounded-md w-full mr-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search messages"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <FaComments className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet.
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-500 block w-full"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <li key={conversation.id}>
                      <ContactItem
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={setActiveConversation}
                        lastMessage={conversation.last_message}
                        unreadCount={conversation.unread_count}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Messages panel */}
          <div className="flex-1 flex flex-col h-full">
            {activeConversation ? (
              <>
                {/* Conversation header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {activeConversation.participants_details
                        .filter(p => p.id !== user.id)
                        .map(participant => (
                          <div key={participant.id} className="flex items-center">
                            {participant.profile_image ? (
                              <img
                                src={participant.profile_image}
                                alt={`${participant.first_name} ${participant.last_name}`}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                {participant.role === 'provider' ? (
                                  <FaUserMd className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <FaUserCircle className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            )}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {`${participant.first_name} ${participant.last_name}`}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div>
                    <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                      <FaEllipsisV className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Messages list */}
                <div 
                  className="flex-1 p-4 overflow-y-auto bg-gray-50"
                  ref={messageContainerRef}
                >
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                      <FaComments className="h-12 w-12 text-gray-300 mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isSentByCurrentUser={message.sender === user.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="bg-white border-t border-gray-200 px-4 py-3">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <button
                      type="button"
                      className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <FaPaperclip className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mx-2"
                    />
                    <button
                      type="button"
                      className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <FaSmile className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <FaPaperPlane className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
      
      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onSubmit={handleCreateConversation}
      />
    </AuthenticatedLayout>
  );
}
