// src/app/approval-pending/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ApprovalPending from '@/components/auth/ApprovalPending';

function ApprovalPendingContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'user';
  const submitted = searchParams.get('submitted') || new Date().toISOString();

  return (
    <ApprovalPending 
      userRole={role}
      submittedAt={submitted}
    />
  );
}

export default function ApprovalPendingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApprovalPendingContent />
    </Suspense>
  );
}