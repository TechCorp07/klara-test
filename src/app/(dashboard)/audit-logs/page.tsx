'use client';

import { ComplianceGuard } from '@/components/guards/ComplianceGuard';

export default function AuditLogsPage() {
  return (
    <ComplianceGuard>
      <div>
        <h1>Audit Logs</h1>
        {/* Audit logs content - accessible by admin, superadmin and compliance */}
      </div>
    </ComplianceGuard>
  );
}