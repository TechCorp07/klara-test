// File: /app/profile/security/page.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { security } from '../../../lib/api';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import { format, parseISO, subDays } from 'date-fns';
import {
  FaLock,
  FaUserShield,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaKey,
  FaMobileAlt,
  FaHistory,
  FaGlobe,
  FaShieldAlt,
  FaFingerprint
} from 'react-icons/fa';
import Link from 'next/link';

// HIPAA compliance banner component
const HIPAABanner = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaLock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">HIPAA Security Compliance</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              This page contains security settings required for HIPAA compliance.
              All security changes are logged for compliance purposes.
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

// Security status card component
const SecurityStatusCard = ({ title, status, description, icon: Icon, actionText, actionLink }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'secure':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'secure':
        return <FaCheck className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      case 'danger':
        return <FaTimes className="h-4 w-4 text-red-500" />;
      default:
        return <FaInfoCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'secure':
        return 'Secure';
      case 'warning':
        return 'Warning';
      case 'danger':
        return 'Action Required';
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
          {getStatusIcon()}
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      
      {actionText && actionLink && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Link
            href={actionLink}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
};

// Recent activity item component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <FaKey className="h-4 w-4 text-blue-500" />;
      case 'password_change':
        return <FaLock className="h-4 w-4 text-green-500" />;
      case 'two_factor_update':
        return <FaMobileAlt className="h-4 w-4 text-purple-500" />;
      case 'security_setting_change':
        return <FaUserShield className="h-4 w-4 text-yellow-500" />;
      case 'logout':
        return <FaKey className="h-4 w-4 text-gray-500" />;
      default:
        return <FaHistory className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="ml-3">
            <h3 className="text-md font-medium text-gray-900">{activity.description}</h3>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <FaGlobe className="h-4 w-4 mr-1" />
              <span>{activity.ip_address}</span>
              {activity.location && (
                <>
                  <span className="mx-1">•</span>
                  <span>{activity.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {format(parseISO(activity.timestamp), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default function SecurityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // Fetch security status
        const statusData = await security.getSecurityStatus();
        setSecurityStatus(statusData);
        
        // Fetch recent activity
        const activityData = await security.getRecentActivity();
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching security data:', error);
        setError('Failed to load security data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecurityData();
  }, []);
  
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
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
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
        
        {/* Security Status */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Security Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SecurityStatusCard
              title="Password"
              status={securityStatus.password_status || 'warning'}
              description={securityStatus.password_description || "Your password was last changed more than 90 days ago. Consider updating it for better security."}
              icon={FaKey}
              actionText="Change Password"
              actionLink="/profile/change-password"
            />
            
            <SecurityStatusCard
              title="Two-Factor Authentication"
              status={securityStatus.two_factor_status || 'danger'}
              description={securityStatus.two_factor_description || "Two-factor authentication is not enabled. Enable it to add an extra layer of security."}
              icon={FaMobileAlt}
              actionText="Set Up 2FA"
              actionLink="/profile/two-factor-setup"
            />
            
            <SecurityStatusCard
              title="Account Activity"
              status={securityStatus.account_activity_status || 'secure'}
              description={securityStatus.account_activity_description || "No suspicious activity detected in your recent account history."}
              icon={FaHistory}
              actionText="View Full Activity"
              actionLink="/profile/activity"
            />
          </div>
        </div>
        
        {/* Security Recommendations */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h2>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                  <FaShieldAlt className="h-5 w-5" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Enhance Your Account Security</h3>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <ul className="space-y-4">
                {!securityStatus.two_factor_enabled && (
                  <li className="flex items-start">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Two-factor authentication adds an extra layer of security to your account by requiring a second verification step when logging in.
                      </p>
                      <div className="mt-2">
                        <Link
                          href="/profile/two-factor-setup"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Set up now
                        </Link>
                      </div>
                    </div>
                  </li>
                )}
                
                {securityStatus.password_last_changed && 
                 new Date(securityStatus.password_last_changed) < subDays(new Date(), 90) && (
                  <li className="flex items-start">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Update Your Password</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        It's been over 90 days since you last changed your password. Regular password updates help keep your account secure.
                      </p>
                      <div className="mt-2">
                        <Link
                          href="/profile/change-password"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Change password
                        </Link>
                      </div>
                    </div>
                  </li>
                )}
                
                <li className="flex items-start">
                  <FaInfoCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Review Recent Activity</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Regularly check your account activity to ensure there are no unauthorized access attempts.
                    </p>
                    <div className="mt-2">
                      <Link
                        href="/profile/activity"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View activity
                      </Link>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <FaInfoCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Use a Strong, Unique Password</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Ensure your password is strong and not used for any other accounts. A strong password includes a mix of uppercase and lowercase letters, numbers, and special characters.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            
            <Link
              href="/profile/activity"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All Activity
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
            </div>
            
            <div className="px-6 py-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">No activity has been recorded for your account recently.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
