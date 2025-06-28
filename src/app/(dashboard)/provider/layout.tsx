// Example: src/app/(dashboard)/provider/layout.tsx
 import BaseAuthenticatedLayout from '../_shared/layouts/BaseAuthenticatedLayout';
 
 interface ProviderLayoutProps {
   children: React.ReactNode;
 }
 
 export default function ProviderLayout({ children }: ProviderLayoutProps) {
   return (
     <BaseAuthenticatedLayout 
       requiredRole={['provider']}
       showVerificationWarning={false}
     >
       {children}
     </BaseAuthenticatedLayout>
   );
 }