// src/app/(dashboard)/patient/components/dashboard/QuickActionsWidget.tsx
import React from 'react';
import { Zap, Calendar, Pill, Heart, Phone, FileText, Users, FlaskConical, Shield } from 'lucide-react';

interface QuickActionsProps {
  quickActions?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
    requires_verification?: boolean;
  }>;
}

export function QuickActionsWidget({ quickActions }: QuickActionsProps) {
  const getActionIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      case 'pills':
      case 'medication':
        return <Pill className="w-5 h-5" />;
      case 'heart':
      case 'vitals':
        return <Heart className="w-5 h-5" />;
      case 'phone':
      case 'emergency':
        return <Phone className="w-5 h-5" />;
      case 'filetext':
      case 'records':
        return <FileText className="w-5 h-5" />;
      case 'users':
      case 'team':
        return <Users className="w-5 h-5" />;
      case 'flaskconical':
      case 'research':
        return <FlaskConical className="w-5 h-5" />;
      case 'shield':
      case 'identity':
        return <Shield className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          container: 'border-red-200 bg-red-50 hover:bg-red-100',
          icon: 'text-red-600',
          title: 'text-red-900',
          description: 'text-red-700'
        };
      case 'medium':
        return {
          container: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          description: 'text-yellow-700'
        };
      default:
        return {
          container: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          description: 'text-blue-700'
        };
    }
  };

  // Sort actions by priority (high > medium > low)
  const sortedActions = quickActions ? [...quickActions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }) : [];

    // Default actions if none provided
    const defaultActions = [
      {
        id: 'schedule-appointment',
        title: 'Schedule Appointment',
        description: 'Book your next visit',
        icon: 'calendar',
        href: '/patient/appointments/schedule',
        priority: 'high' as const,
        requires_verification: false
      },
      {
        id: 'log-medication', 
        title: 'Log Medication',
        description: 'Record taken medications',
        icon: 'pills',
        href: '/patient/medications/log',
        priority: 'high' as const,
        requires_verification: false
      },
      {
        id: 'record-vitals',
        title: 'Record Vitals',
        description: 'Add your vital signs',
        icon: 'heart', 
        href: '/patient/vitals/record',
        priority: 'medium' as const,
        requires_verification: false
      },
      {
        id: 'emergency-contact',
        title: 'Emergency Contact',
        description: 'Reach your care team',
        icon: 'phone',
        href: '/patient/emergency/contact', 
        priority: 'high' as const,
        requires_verification: true
      },
    ];

    const actionsToShow = sortedActions.length > 0 ? sortedActions : defaultActions;
    
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Zap className="w-5 h-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actionsToShow.slice(0, 6).map((action) => {
          const styles = getPriorityStyles(action.priority);
          
          return (
            <a
              key={action.id}
              href={action.href}
              className={`block p-3 rounded-lg border transition-colors ${styles.container}`}
            >
              <div className="flex items-start">
                <div className={`mr-3 mt-1 ${styles.icon}`}>
                  {getActionIcon(action.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${styles.title}`}>
                    {action.title}
                    {action.requires_verification && (
                      <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-1 rounded">
                        ID Required
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${styles.description}`}>
                    {action.description}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Priority Indicators */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-3 p-2 bg-gray-50 rounded text-center">
        <p className="text-xs text-gray-600">
          Need help? 
          <a href="/patient/help" className="text-blue-600 hover:text-blue-700 ml-1">
            Visit our help center
          </a>
        </p>
      </div>
    </div>
  );
}