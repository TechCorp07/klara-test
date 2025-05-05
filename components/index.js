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
} from './form/FormComponents';

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
} from './ui/UIComponents';

// Error and Loading Components
export { default as ErrorComponent } from './ui/ErrorComponent';
export { default as LoadingComponent } from './ui/LoadingComponent';
export { default as ErrorBoundary } from './common/ErrorBoundary';

// Auth components
export { default as QRCodeScanner } from './auth/QRCodeScanner';
export { default as SessionTimeout } from './auth/SessionTimeout';
export { default as TwoFactorAuthForm } from './auth/TwoFactorAuthForm';

// Appointment components
export { default as AppointmentCalendar } from './appointments/AppointmentCalendar';
export { default as AppointmentForm } from './appointments/AppointmentForm';

// Dashboard Components
export {
  DashboardLayout
} from './dashboard/DashboardLayout';

export { 
  DashboardGrid,
  StatsCard,
  DashboardMetrics,
  QuickActions,
  SectionContainer,
  EntityList,
  ResourceLinks,
  DashboardSidebar
} from './dashboard/DashboardComponents';

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
