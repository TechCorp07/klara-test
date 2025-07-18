// src/app/(dashboard)/patient/components/dashboard/QuickActionsWidget.tsx
interface QuickActionsProps {
    actions: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      href: string;
      priority: 'high' | 'medium' | 'low';
      requires_verification?: boolean;
    }>;
    identityVerified: boolean;
  }
  
  export function QuickActionsWidget({ actions, identityVerified }: QuickActionsProps) {
    const getIcon = (iconName: string) => {
      switch (iconName) {
        case 'calendar':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          );
        case 'pill':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L13 5v10l-3 3-3-3V5l3-3z" />
            </svg>
          );
        case 'file-medical':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          );
      }
    };
  
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100';
        case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100';
        case 'low': return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';
        default: return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          {actions.map((action) => {
            const isDisabled = action.requires_verification && !identityVerified;
            
            return (
              <a
                key={action.id}
                href={isDisabled ? '#' : action.href}
                className={`block border rounded-lg p-3 transition-colors ${
                  isDisabled 
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : getPriorityColor(action.priority)
                }`}
                onClick={isDisabled ? (e) => e.preventDefault() : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDisabled ? 'bg-gray-200' : 'bg-white'}`}>
                      {getIcon(action.icon)}
                    </div>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm">{action.description}</div>
                      {isDisabled && (
                        <div className="text-xs mt-1 text-gray-500">
                          Requires identity verification
                        </div>
                      )}
                    </div>
                  </div>
                  {!isDisabled && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    );
  }