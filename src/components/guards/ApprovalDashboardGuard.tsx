// src/components/guards/ApprovalDashboardGuard.tsx
// This can now just be an alias for AdminGuard since approvals are admin-only
import { AdminGuard } from './AdminGuard';

export const ApprovalDashboardGuard = AdminGuard;