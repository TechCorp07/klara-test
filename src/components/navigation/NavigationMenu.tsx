// src/components/navigation/NavigationMenu.tsx
// UPDATE your existing NavigationMenu component to include these admin links:

import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';

export const NavigationMenu = () => {
  const { permissions } = usePermissions();

  return (
    <nav>
      {/* Other nav items */}
      
      {/* Admin Dashboard Links - Only show if user has dashboard access */}
      {permissions?.has_dashboard_access && (
        <div className="admin-section">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Administration
          </h3>
          
          {/* Quick Approvals (your existing page) */}
          <Link 
            href="/dashboard/approvals" 
            className="nav-link flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick Approvals
          </Link>
          
          {/* Comprehensive User Management (new page) */}
          <Link 
            href="/dashboard/admin/users" 
            className="nav-link flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            User Management
          </Link>
        </div>
      )}
    </nav>
  );
};