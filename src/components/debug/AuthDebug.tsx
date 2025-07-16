// src/components/debug/AuthDebug.tsx
'use client';

import { useAuth } from '@/lib/auth';

export function AuthDebug() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    jwtPayload,
    tokenNeedsRefresh,
    timeToExpiration,
    hasPermission,
    getUserRole,
  } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm max-h-96 overflow-auto z-50">
      <h4 className="font-bold mb-2 text-green-400">🔐 Auth Debug Panel</h4>
      
      <div className="space-y-2">
        <div className="border-b border-gray-600 pb-2">
          <div><strong>State:</strong></div>
          <div>• Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
          <div>• Loading: {isLoading ? '🔄' : '✅'}</div>
          <div>• Initialized: {isInitialized ? '✅' : '⏳'}</div>
        </div>
        
        <div className="border-b border-gray-600 pb-2">
          <div><strong>User:</strong></div>
          <div>• ID: {user?.id || 'null'}</div>
          <div>• Email: {user?.email || 'null'}</div>
          <div>• Role: {getUserRole() || 'null'}</div>
        </div>
        
        <div className="border-b border-gray-600 pb-2">
          <div><strong>JWT Token:</strong></div>
          <div>• Valid: {jwtPayload ? '✅' : '❌'}</div>
          <div>• Needs Refresh: {tokenNeedsRefresh ? '⚠️' : '✅'}</div>
          <div>• Expires in: {timeToExpiration ? `${Math.floor(timeToExpiration / 60)}m ${timeToExpiration % 60}s` : 'N/A'}</div>
        </div>
        
        <div className="border-b border-gray-600 pb-2">
          <div><strong>Permissions:</strong></div>
          <div>• Admin: {hasPermission('has_admin_access') ? '✅' : '❌'}</div>
          <div>• Users: {hasPermission('has_user_management_access') ? '✅' : '❌'}</div>
          <div>• Audit: {hasPermission('has_audit_access') ? '✅' : '❌'}</div>
          <div>• SuperAdmin: {hasPermission('is_superadmin') ? '✅' : '❌'}</div>
        </div>
        
        <div className="text-xs text-gray-400">
          <div><strong>Session:</strong></div>
          <div>• ID: {jwtPayload?.session_id?.substring(0, 8) || 'N/A'}...</div>
          <div>• Version: {jwtPayload?.jwt_version || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}