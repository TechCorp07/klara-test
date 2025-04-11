import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { PageHeader } from '@/ui/PageHeader';
import { LoadingState } from '@/ui/LoadingState';

/**
 * Common dashboard layout used by all role-specific dashboards
 */
export function DashboardLayout({
  children,
  title,
  subtitle,
  requiredRoles = [],
  services = {},
  actionLabel,
  actionUrl,
  onActionClick,
  isLoading = false
}) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect if user does not have the required role
  useEffect(() => {
    if (user) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      if (roles.length > 0 && !roles.includes(user.role)) {
        toast.error('You do not have permission to access this page');
        router.push('/dashboard');
      }
    }
  }, [user, requiredRoles, router]);
  
  if (!user) {
    return <LoadingState />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={title}
        subtitle={subtitle || `Welcome back, ${user?.first_name || 'User'}!`}
        actionLabel={actionLabel}
        actionUrl={actionUrl}
        onActionClick={onActionClick}
      />
      
      {isLoading ? <LoadingState /> : children}
    </div>
  );
}
