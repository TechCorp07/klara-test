// components/ui/HIPAABanner.js
import { format } from 'date-fns';
import { FaLock, FaUserShield, FaFileAlt, FaHeartbeat } from 'react-icons/fa';

/**
 * A reusable HIPAA compliance banner component
 * @param {Object} props
 * @param {string} props.type - Type of banner ('phi', 'security', 'audit', 'medical')
 * @param {string} props.message - Optional custom message
 * @param {React.ReactNode} props.icon - Optional custom icon
 * @param {string} props.lastAccessed - Optional timestamp for last access
 */
const HIPAABanner = ({ 
  type = 'phi', 
  message,
  icon,
  lastAccessed = new Date() 
}) => {
  // Define banner content based on type
  const getBannerContent = () => {
    switch(type) {
      case 'security':
        return {
          icon: icon || FaUserShield,
          title: 'HIPAA Security Compliance',
          message: message || 'This page contains security settings required for HIPAA compliance. All security changes are logged for compliance purposes.'
        };
      case 'audit':
        return {
          icon: icon || FaFileAlt,
          title: 'HIPAA Compliance Audit',
          message: message || 'This page provides detailed audit logs of all PHI access events. All access to this information is logged for security and compliance purposes.'
        };
      case 'medical':
        return {
          icon: icon || FaHeartbeat,
          title: 'HIPAA Protected Medical Information',
          message: message || 'This page contains protected medical information. Access to this information is logged and monitored for compliance purposes.'
        };
      case 'phi':
      default:
        return {
          icon: icon || FaLock,
          title: 'HIPAA Protected Health Information',
          message: message || 'This page contains Protected Health Information (PHI) as defined by HIPAA regulations. Access to this information is logged and monitored for compliance purposes.'
        };
    }
  };

  const { icon: Icon, title, message: contentMessage } = getBannerContent();

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{contentMessage}</p>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Last accessed: {typeof lastAccessed === 'string' ? lastAccessed : format(lastAccessed, 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HIPAABanner;
