// File: /app/compliance/dashboard/page.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { audit } from '../../lib/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { format, parseISO, subDays } from 'date-fns';
import {
  FaLock,
  FaUserShield,
  FaExclamationTriangle,
  FaFileAlt,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaUserCog,
  FaDatabase,
  FaEye,
  FaEdit,
  FaTrash,
  FaSignInAlt,
  FaSignOutAlt,
  FaShareAlt,
  FaExclamationCircle
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
          <h3 className="text-sm font-medium text-blue-800">HIPAA Compliance Monitoring</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              This dashboard provides monitoring and reporting tools for HIPAA compliance. 
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

// Metric card component
const MetricCard = ({ title, value, icon: Icon, description, change, changeType }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-blue-100 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        
        {change && (
          <div className={`mt-1 flex items-center text-sm ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {changeType === 'positive' ? '↑' : 
             changeType === 'negative' ? '↓' : 
             '→'}
            <span className="ml-1">{change}</span>
          </div>
        )}
        
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};

// Audit event item component
const AuditEventItem = ({ event }) => {
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
      </div>
    </div>
  );
};

// Compliance report card component
const ComplianceReportCard = ({ title, icon: Icon, description, status, lastRun, onViewReport }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'non_compliant':
        return 'Non-Compliant';
      case 'warning':
        return 'Warning';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-blue-100 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-center mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
          {lastRun && (
            <span className="ml-2 text-xs text-gray-500">
              Last run: {format(parseISO(lastRun), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaFileAlt className="mr-2 h-4 w-4 text-gray-500" />
          View Report
        </button>
      </div>
    </div>
  );
};

// Date range selector component
const DateRangeSelector = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom Range', value: 'custom' }
  ];
  
  return (
    <div className="flex items-center space-x-2">
      <FaCalendarAlt className="h-4 w-4 text-gray-500" />
      <select
        value={selectedRange}
        onChange={(e) => onRangeChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {ranges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function ComplianceDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [auditEvents, setAuditEvents] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [dateRange, setDateRange] = useState('last_7_days');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard metrics
        const metricsData = await audit.getDashboardMetrics();
        setMetrics(metricsData);
        
        // Fetch audit events
        const eventsData = await audit.getAuditEvents({ 
          limit: 10,
          date_range: dateRange
        });
        setAuditEvents(eventsData.results);
        
        // Fetch compliance reports
        // This would be replaced with an actual API call
        // For now, we'll use mock data
        const mockReports = [
          {
            id: 1,
            report_type: 'data_sharing',
            title: 'Data Sharing Report',
            description: 'Tracks all instances of PHI being shared with third parties.',
            status: 'compliant',
            last_run: new Date().toISOString(),
            icon: FaShareAlt
          },
          {
            id: 2,
            report_type: 'minimum_necessary',
            title: 'Minimum Necessary Rule',
            description: 'Ensures only the minimum necessary PHI is accessed for each operation.',
            status: 'warning',
            last_run: subDays(new Date(), 7).toISOString(),
            icon: FaDatabase
          },
          {
            id: 3,
            report_type: 'patient_access',
            title: 'Patient Access Report',
            description: 'Tracks all access to patient records by users.',
            status: 'compliant',
            last_run: subDays(new Date(), 3).toISOString(),
            icon: FaUserShield
          },
          {
            id: 4,
            report_type: 'risk_assessment',
            title: 'Security Risk Assessment',
            description: 'Evaluates potential security risks and vulnerabilities.',
            status: 'non_compliant',
            last_run: subDays(new Date(), 45).toISOString(),
            icon: FaExclamationTriangle
          }
        ];
        
        setComplianceReports(mockReports);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load compliance dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  
  const handleViewReport = (reportType) => {
    // This would navigate to the report page
    console.log('View report:', reportType);
  };
  
  const handleExportAuditLog = () => {
    // This would trigger an export of the audit log
    console.log('Export audit log');
  };
  
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleExportAuditLog}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaDownload className="mr-2 h-4 w-4 text-gray-500" />
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
        
        {/* Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total PHI Accesses"
              value={metrics.total_phi_accesses || 0}
              icon={FaEye}
              description="Total number of PHI access events"
              change={metrics.phi_access_change || "+12%"}
              changeType={metrics.phi_access_change_type || "neutral"}
            />
            
            <MetricCard
              title="Data Sharing Events"
              value={metrics.data_sharing_events || 0}
              icon={FaShareAlt}
              description="Number of times PHI was shared"
              change={metrics.data_sharing_change || "-5%"}
              changeType={metrics.data_sharing_change_type || "positive"}
            />
            
            <MetricCard
              title="Security Incidents"
              value={metrics.security_incidents || 0}
              icon={FaExclamationTriangle}
              description="Number of security incidents"
              change={metrics.security_incidents_change || "0"}
              changeType={metrics.security_incidents_change_type || "positive"}
            />
            
            <MetricCard
              title="Compliance Score"
              value={metrics.compliance_score || "85%"}
              icon={FaUserShield}
              description="Overall HIPAA compliance score"
              change={metrics.compliance_score_change || "+3%"}
              changeType={metrics.compliance_score_change_type || "positive"}
            />
          </div>
        </div>
        
        {/* Compliance Reports */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceReports.map((report) => (
              <ComplianceReportCard
                key={report.id}
                title={report.title}
                icon={report.icon}
                description={report.description}
                status={report.status}
                lastRun={report.last_run}
                onViewReport={() => handleViewReport(report.report_type)}
              />
            ))}
          </div>
        </div>
        
        {/* Audit Log */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Audit Events</h2>
            
            <div className="flex space-x-3">
              <DateRangeSelector
                selectedRange={dateRange}
                onRangeChange={handleDateRangeChange}
              />
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                Filter
              </button>
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSearch className="mr-2 h-4 w-4 text-gray-500" />
                Search
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Audit Log</h3>
            </div>
            
            <div className="px-6 py-4">
              {auditEvents.length === 0 ? (
                <div className="text-center py-6">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No audit events</h3>
                  <p className="mt-1 text-sm text-gray-500">No audit events found for the selected time period.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditEvents.map((event) => (
                    <AuditEventItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleExportAuditLog}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaDownload className="mr-2 h-4 w-4 text-gray-500" />
                  Export
                </button>
                
                <a
                  href="/compliance/audit-log"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View Full Audit Log
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
