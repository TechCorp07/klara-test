'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaFileAlt, 
  FaHeartbeat, 
  FaStethoscope, 
  FaPills, 
  FaFlask,
  FaChartLine,
  FaExclamationTriangle,
  FaHome,
  FaUserMd,
  FaUser,
  FaClipboardList,
  FaCog
} from 'react-icons/fa';

// ----- Dashboard Grid Component -----

/**
 * Reusable grid layout for dashboard sections
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid content
 * @param {number} props.cols - Number of columns
 * @param {number} props.gap - Gap size
 * @param {string} props.className - Additional CSS classes
 */
export function DashboardGrid({ children, cols = 2, gap = 6, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[2]} ${gapClasses[gap] || gapClasses[6]} ${className} mb-8`}>
      {children}
    </div>
  );
}

// ----- Stats Card Component -----

/**
 * Reusable stats card component for dashboards
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {string} props.link - Link URL for "View details" 
 * @param {string} props.linkText - Text for the link (defaults to "View details →")
 * @param {string} props.bgColorClass - Tailwind background color class
 * @param {string} props.textColorClass - Tailwind text color class
 * @param {string} props.trend - Optional trend direction ('up', 'down', or null)
 * @param {string} props.trendValue - Optional trend value text
 * @param {string} props.trendType - Optional trend type ('positive' or 'negative')
 * @param {Function} props.onClick - Optional click handler to make the card interactive
 */
export function StatsCard({ 
  title, 
  value, 
  icon = null,
  link, 
  linkText = "View details →",
  bgColorClass = "bg-white",
  textColorClass = "text-blue-600",
  trend = null,
  trendValue = null,
  trendType = 'positive',
  onClick = null
}) {
  // Generate trend display
  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    const isPositive = trendType === 'positive';
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`mt-1 flex items-center ${trendColor}`}>
        <span className="text-xs font-medium">
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      </div>
    );
  };

  // Create the card content
  const cardContent = (
    <div className={`${bgColorClass} rounded-lg shadow-md p-6`}>
      <div className="flex items-center justify-between">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div className="flex-grow">
          <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
          <div className="flex items-end">
            <p className={`text-3xl font-bold ${textColorClass}`}>
              {value}
            </p>
            {renderTrend()}
          </div>
        </div>
      </div>
      
      {link && (
        <Link href={link} className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm">
          {linkText}
        </Link>
      )}
    </div>
  );

  // Return interactive button version if onClick is provided
  return onClick ? (
    <button 
      onClick={onClick}
      className="w-full text-left"
      aria-label={`${title} stats: ${value}`}
    >
      {cardContent}
    </button>
  ) : (
    cardContent
  );
}

// ----- Dashboard Metrics Component -----

/**
 * Dashboard metrics component for displaying key health metrics
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric objects to display
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.compact - Whether to show in compact mode
 * @param {string} props.title - Optional title for the metrics section
 * @param {boolean} props.showViewAll - Whether to show "View All" link
 * @param {string} props.viewAllLink - Link for "View All" button
 */
export function DashboardMetrics({ 
  metrics = [], 
  loading = false, 
  compact = false,
  title = "Your Health Overview",
  showViewAll = false,
  viewAllLink = ""
}) {
  // Get icon based on metric type
  const getMetricIcon = (type) => {
    switch (type) {
      case 'appointments':
        return <FaCalendarAlt className="h-6 w-6 text-blue-500" />;
      case 'medical_records':
        return <FaFileAlt className="h-6 w-6 text-green-500" />;
      case 'vitals':
        return <FaHeartbeat className="h-6 w-6 text-red-500" />;
      case 'conditions':
        return <FaStethoscope className="h-6 w-6 text-purple-500" />;
      case 'medications':
        return <FaPills className="h-6 w-6 text-yellow-500" />;
      case 'lab_results':
        return <FaFlask className="h-6 w-6 text-indigo-500" />;
      case 'health_score':
        return <FaChartLine className="h-6 w-6 text-teal-500" />;
      default:
        return <FaHeartbeat className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get metric card background color
  const getMetricColor = (type, severity) => {
    if (severity === 'high') return 'bg-red-50';
    if (severity === 'medium') return 'bg-yellow-50';
    if (severity === 'low') return 'bg-green-50';
    
    switch (type) {
      case 'appointments':
        return 'bg-blue-50';
      case 'medical_records':
        return 'bg-green-50';
      case 'vitals':
        return 'bg-red-50';
      case 'conditions':
        return 'bg-purple-50';
      case 'medications':
        return 'bg-yellow-50';
      case 'lab_results':
        return 'bg-indigo-50';
      case 'health_score':
        return 'bg-teal-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-4`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (metrics.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>
        <div className="text-center py-6">
          <FaHeartbeat className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No health metrics are currently available. Check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {title}
        </h3>
        {showViewAll && viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All
          </Link>
        )}
      </div>
      
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-4`}>
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className={`${getMetricColor(metric.type, metric.severity)} rounded-lg p-4 ${metric.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={metric.onClick}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getMetricIcon(metric.type)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {metric.value}
                  {metric.unit && <span className="ml-1 text-sm font-normal text-gray-500">{metric.unit}</span>}
                </p>
                {metric.change && (
                  <p className={`text-xs font-medium ${
                    metric.changeDirection === 'up' 
                      ? metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600' 
                      : metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeDirection === 'up' ? '↑' : '↓'} {metric.change}
                  </p>
                )}
              </div>
            </div>
            {metric.alert && (
              <div className="mt-2 flex items-center">
                <FaExclamationTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-700">{metric.alert}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Quick Actions Component -----

/**
 * Reusable Quick Actions section for dashboards
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects
 */
export function QuickActions({ actions = [] }) {
  if (!actions || actions.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index}
            href={action.url} 
            className={`${action.bgColor || 'bg-blue-100 hover:bg-blue-200'} ${action.textColor || 'text-blue-800'} p-4 rounded-lg text-center`}
          >
            <div className="flex flex-col items-center">
              {action.icon}
              <span>{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ----- Section Container Component -----

/**
 * Reusable section container component with title and optional link
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.linkUrl - Optional link URL
 * @param {string} props.linkText - Link text
 * @param {React.ReactNode} props.children - Section content
 */
export function SectionContainer({ title, linkUrl, linkText = 'View all', children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {linkUrl && (
          <Link href={linkUrl} className="text-blue-600 hover:text-blue-800 text-sm">
            {linkText}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// ----- Entity List Component -----

/**
 * Generic entity list component for displaying a list of entities in dashboard sections
 * @param {Object} props
 * @param {string} props.title - List title
 * @param {Array} props.entities - List of entities
 * @param {string} props.viewAllLink - View all link URL
 * @param {string} props.emptyMessage - Empty state message
 * @param {Function} props.renderItem - Custom render function for items
 * @param {number} props.maxItems - Maximum number of items to show
 */
export function EntityList({
  title,
  entities = [],
  viewAllLink,
  emptyMessage = 'No items found.',
  renderItem = null,
  maxItems = 5
}) {
  // Standardized rendering function if none is provided
  const defaultRenderItem = (item, index) => {
    return (
      <div key={item.id || index} className="border-b pb-3 mb-3">
        <div className="flex justify-between">
          <p className="font-medium">{item.title || item.name}</p>
          {item.status && (
            <span className={`px-2 py-1 inline-flex text-xs rounded-full ${
              item.status === 'active' || item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
        {item.detailsLink && (
          <div className="flex justify-end mt-1">
            <Link href={item.detailsLink} className="text-sm text-blue-600 hover:text-blue-800">
              {item.detailsLinkText || 'View details'} →
            </Link>
          </div>
        )}
      </div>
    );
  };
  
  // Use the provided render function or fall back to the default
  const renderFunction = renderItem || defaultRenderItem;
  const displayedEntities = entities?.slice(0, maxItems) || [];
  
  return (
    <SectionContainer
      title={title}
      linkUrl={viewAllLink}
      linkText="View all"
    >
      {displayedEntities.length > 0 ? (
        <div className="space-y-4">
          {displayedEntities.map((entity, index) => renderFunction(entity, index))}
        </div>
      ) : (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </SectionContainer>
  );
}

// ----- Resource Links Component -----

/**
 * Reusable Resource Links section for dashboards
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.viewAllUrl - View all URL 
 * @param {Array} props.resources - Array of resource objects
 */
export function ResourceLinks({ 
  title, 
  viewAllUrl,
  resources = []
}) {
  if (!resources || resources.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllUrl && (
          <Link href={viewAllUrl} className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {resource.description}
            </p>
            <Link href={resource.url} className="text-blue-600 hover:text-blue-800 text-sm">
              {resource.linkText || 'Learn more'} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Dashboard Sidebar Component -----

/**
 * Dashboard sidebar component with navigation
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {string} props.activePath - Current active path
 */
export function DashboardSidebar({ user, activePath }) {
  if (!user) return null;
  
  // Generate navigation based on user role
  const getNavigation = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: FaHome
      }
    ];
    
    const roleItems = {
      patient: [
        {
          name: 'Appointments',
          href: '/appointments',
          icon: FaCalendarAlt
        },
        {
          name: 'Medical Records',
          href: '/medical-records',
          icon: FaFileAlt
        },
        {
          name: 'Health Metrics',
          href: '/health-metrics',
          icon: FaHeartbeat
        },
        {
          name: 'Medications',
          href: '/medications',
          icon: FaPills
        }
      ],
      provider: [
        {
          name: 'Appointments',
          href: '/appointments',
          icon: FaCalendarAlt
        },
        {
          name: 'Patients',
          href: '/patients',
          icon: FaUser
        },
        {
          name: 'Medical Records',
          href: '/medical-records',
          icon: FaFileAlt
        }
      ],
      admin: [
        {
          name: 'Users',
          href: '/admin/users',
          icon: FaUser
        },
        {
          name: 'Audit Logs',
          href: '/admin/audit',
          icon: FaClipboardList
        },
        {
          name: 'System Settings',
          href: '/admin/settings',
          icon: FaCog
        }
      ]
    };
    
    // Return base items + role-specific items
    return [
      ...baseItems,
      ...(roleItems[user.role] || [])
    ];
  };
  
  const navigation = getNavigation();
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-blue-600">Healthcare App</span>
            </div>
            
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    activePath === item.href || activePath.startsWith(`${item.href}/`)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  {item.icon && <item.icon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <span className="inline-block h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-center leading-8">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}