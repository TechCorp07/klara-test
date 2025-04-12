'use client';

// Re-export all components from a single entry point
// This makes imports cleaner in the application code

// Form Components
export { 
  FormInput, 
  FormSelect, 
  FormCheckbox, 
  FormRadioGroup,
  PasswordStrengthMeter 
} from './components/form/FormComponents';

// UI Components
export { 
  StatusBadge,
  Modal,
  PageHeader,
  EmptyState,
  FilterBar,
  HIPAABanner,
  DataTable,
  Pagination
} from './components/ui/UIComponents';

// Error and Loading Components
export { default as ErrorComponent } from './components/ui/ErrorComponent';
export { default as LoadingComponent } from './components/ui/LoadingComponent';

// Dashboard Components
export {
  DashboardLayout
} from './components/dashboard/DashboardLayout';

export { 
  DashboardGrid,
  StatsCard,
  DashboardMetrics,
  QuickActions,
  SectionContainer,
  EntityList,
  ResourceLinks,
  DashboardSidebar
} from './components/dashboard/DashboardComponents';

// Authentication Hooks
export {
  useAuthRedirect,
  useLogin,
  useLogout,
  useTwoFactor
} from './hooks/auth/AuthHooks';

// Data Hooks
export {
  useData,
  useQueryWrapper,
  useMutationWrapper,
  useFetch
} from './hooks/data/DataHooks';

// Utility Functions
export * from './utils/utils';

// API Client
export {
  apiClient,
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
  createApiService
} from './api/client';