// src/app/(dashboard)/compliance/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface ComplianceLayoutProps {
   children: React.ReactNode;
 }
 
 export default function ComplianceLayout({ children }: ComplianceLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['compliance']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }
 