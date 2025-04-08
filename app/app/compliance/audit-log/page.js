// File: /app/compliance/audit-log/page.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { audit } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format, parseISO } from 'date-fns';
import {
  FaLock,
  FaUserShield,
  FaExclamationTriangle,
  FaFileAlt,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaDatabase,
  FaEye,
  FaEdit,
  FaTrash,
  FaSignInAlt,
  FaSignOutAlt,
  FaShareAlt,
  FaExclamationCircle,
  FaCheck,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

// HIPAA compliance banner component
const HIPAABanner = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaLock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">HIPAA Compliance Audit</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              This page provides detailed audit logs of all PHI access events. 
              All access to this information is logged for security and compliance purposes.
            </p>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Last accessed: {format(new Date(), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter panel component
const FilterPanel = ({ filters, onFilterChange, onApplyFilters, onResetFilters }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter Audit Events</h3>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="event-type"
              name="event_type"
              value={filters.event_type || ''}
              onChange={(e) => onFilterChange('event_type', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Event Types</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="access">Access</option>
              <option value="error">Error</option>
              <option value="export">Export</option>
              <option value="share">Share</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="resource-type" className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              id="resource-type"
              name="resource_type"
              value={filters.resource_type || ''}
              onChange={(e) => onFilterChange('resource_type', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Resource Types</option>
              <option value="medical_record">Medical Record</option>
              <option value="medication">Medication</option>
              <option value="allergy">Allergy</option>
              <option value="condition">Condition</option>
              <option value="lab_test">Lab Test</option>
              <option value="appointment">Appointment</option>
              <option value="user">User</option>
              <option value="conversation">Conversation</option>
              <option value="wearable_integration">Wearable Integration</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="date-range"
              name="date_range"
              value={filters.date_range || 'last_7_days'}
              onChange={(e) => onFilterChange('date_range', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <input
              type="text"
              id="user"
              name="user"
              value={filters.user || ''}
              onChange={(e) => onFilterChange('user', e.target.value)}
              placeholder="Search by username"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="ip-address" className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              id="ip-address"
              name="ip_address"
              value={filters.ip_address || ''}
              onChange={(e) => onFilterChange('ip_address', e.target.value)}
              placeholder="Search by IP address"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="resource-id" className="block text-sm font-medium text-gray-700 mb-1">
              Resource ID
            </label>
            <input
              type="text"
              id="resource-id"
              name="resource_id"
              value={filters.resource_id || ''}
              onChange={(e) => onFilterChange('resource_id', e.target.value)}
              placeholder="Search by resource ID"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onApplyFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaFilter className="mr-2 h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Audit event item component
const AuditEventItem = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'create':
        return <FaEdit className="h-4 w-4 text-green-500" />;
      case 'read':
        return <FaEye className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <FaEdit className="h-4 w-4 text-yellow-500" />;
      case 'delete':
        return <FaTrash className="h-4 w-4 text-red-500" />;
      case 'login':
        return <FaSignInAlt className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <FaSignOutAlt className="h-4 w-4 text-gray-500" />;
      case 'access':
        return <FaEye className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <FaExclamationCircle className="h-4 w-4 text-red-500" />;
      case 'export':
        return <FaDownload className="h-4 w-4 text-purple-500" />;
      case 'share':
        return <FaShareAlt className="h-4 w-4 text-blue-500" />;
      default:
        return <FaDatabase className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getEventTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'access':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      case 'share':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            {getEventTypeIcon(event.event_type)}
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <h3 className="text-md font-medium text-gray-900">{event.description}</h3>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                {getEventTypeLabel(event.event_type)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {event.resource_type}{event.resource_id ? ` #${event.resource_id}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">
            {format(parseISO(event.timestamp), 'MMM d, yyyy h:mm a')}
          </span>
          <span className="mt-1 text-xs text-gray-500">
            {event.ip_address}
          </span>
        </div>
      </div>
      
      <div className="mt-2 ml-7 text-sm text-gray-500">
        <span className="font-medium">User:</span> {event.user_details ? `${event.user_details.first_name} ${event.user_details.last_name}` : 'Unknown'}
        <span className="mx-2">•</span>
        <span className="font-medium">User Agent:</span> {event.user_agent ? event.user_agent.split(' ')[0] : 'Unknown'}
        
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      
      {expanded && event.additional_data && (
        <div className="mt-2 ml-7 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Additional Data</h4>
          <pre className="text-xs text-gray-600 overflow-auto max-h-40">
            {JSON.stringify(event.additional_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Always show first page
  pages.push(1);
  
  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  
  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  // Add ellipsis where needed
  const pagesWithEllipsis = [];
  let prevPage = null;
  
  for (const page of pages) {
    if (prevPage && page - prevPage > 1) {
      pagesWithEllipsis.push('...');
    }
    pagesWithEllipsis.push(page);
    prevPage = page;
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {pagesWithEllipsis.map((page, index)  => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  ) ;
};

export default function AuditLogPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    date_range: 'last_7_days',
    event_type: '',
    resource_type: '',
    user: '',
    ip_address: '',
    resource_id: ''
  });
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchAuditEvents();
  }, [currentPage]);
  
  const fetchAuditEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare query parameters
      const queryParams = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });
      
      // Fetch audit events
      const response = await audit.getAuditEvents(queryParams);
      
      setAuditEvents(response.results);
      setTotalEvents(response.count);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (error) {
      console.error('Error fetching audit events:', error);
      setError('Failed to load audit events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchAuditEvents();
  };
  
  const handleResetFilters = () => {
    setFilters({
      date_range: 'last_7_days',
      event_type: '',
      resource_type: '',
      user: '',
      ip_address: '',
      resource_id: ''
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleExportAuditLog = async () => {
    try {
      // Prepare query parameters for export
      const queryParams = { ...filters };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });
      
      // Request export
      await audit.exportAuditEvents(queryParams);
      
      // Show success message
      alert('Export request submitted. You will receive an email with the export file when it is ready.');
    } catch (error) {
      console.error('Error exporting audit events:', error);
      setError('Failed to export audit events. Please try again later.');
    }
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              type="button"
              onClick={handleExportAuditLog}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaDownload className="mr-2 h-4 w-4" />
              Export Audit Log
            </button>
          </div>
        </div>
        
        {/* HIPAA Compliance Banner */}
        <HIPAABanner />
        
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
        
        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        )}
        
        {/* Audit Events */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Audit Events</h2>
              <span className="text-sm text-gray-500">
                {totalEvents} events found
              </span>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : auditEvents.length === 0 ? (
              <div className="text-center py-6">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No audit events</h3>
                <p className="mt-1 text-sm text-gray-500">No audit events found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditEvents.map((event) => (
                  <AuditEventItem key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
          
          {!loading && auditEvents.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
        
        {/* Compliance Information */}
        <div className="bg-blue-50 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-200">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                <FaInfoCircle className="h-5 w-5" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">HIPAA Audit Requirements</h3>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              HIPAA requires covered entities to implement audit controls that record and examine activity in information systems that contain or use electronic protected health information (ePHI).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Required Audit Events</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">All access to ePHI</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">User login attempts (successful and failed)</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Changes to ePHI</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Sharing or disclosure of ePHI</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Audit Log Retention</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Audit logs must be retained for at least 6 years</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Logs must be protected from unauthorized access</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Regular review of audit logs is required</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-600">Logs must be available for compliance audits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
