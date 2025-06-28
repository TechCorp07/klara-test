// Example: src/app/(dashboard)/admin/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface AdminLayoutProps {
   children: React.ReactNode;
 }
 
 export default function AdminLayout({ children }: AdminLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['admin', 'superadmin']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }
 