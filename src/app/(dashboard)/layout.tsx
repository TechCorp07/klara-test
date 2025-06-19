// src/app/(dashboard)/layout.tsx
import ClientDashboardLayout from './ClientDashboardLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Server Component wrapper for dashboard layout.
 * 
 * This lightweight server component shell:
 * - Enables fast static generation
 * - Wraps the client-side dashboard logic
 * - Prevents static generation timeouts
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
}