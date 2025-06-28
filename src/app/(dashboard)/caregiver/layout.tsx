// Example: src/app/(dashboard)/caregiver/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface CaregiverLayoutProps {
   children: React.ReactNode;
 }
 
 export default function CaregiverLayout({ children }: CaregiverLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['caregiver']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }
 