import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { DashboardLayout } from '../layout/DashboardLayout';

/**
 * Higher-Order Component to wrap dashboard pages with common functionality
 */
export function withDashboard(Component, options = {}) {
  const {
    title,
    requiredRoles = [],
    services = {},
    redirectTo = '/dashboard'
  } = options;
  
  return function DashboardComponent(props) {
    const { user } = useAuth();
    const dashboardData = useDashboardData({ services });
    
    // Combine the props from the HOC with the original component props
    const combinedProps = {
      ...props,
      dashboardData,
      user
    };
    
    return (
      <DashboardLayout
        title={typeof title === 'function' ? title(user) : title}
        requiredRoles={requiredRoles}
        services={services}
        {...options}
      >
        <Component {...combinedProps} />
      </DashboardLayout>
    );
  };
}