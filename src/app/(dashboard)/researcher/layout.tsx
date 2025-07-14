// src/app/(dashboard)/researcher/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface ResearcherLayoutProps {
   children: React.ReactNode;
 }
 
 export default function ResearcherLayout({ children }: ResearcherLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['researcher']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }
 