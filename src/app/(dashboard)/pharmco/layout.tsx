// Example: src/app/(dashboard)/pharmco/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface PharmcoLayoutProps {
   children: React.ReactNode;
 }
 
 export default function PharmcoLayout({ children }: PharmcoLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['pharmco']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }
 