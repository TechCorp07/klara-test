// src/app/(dashboard)/admin/common/index.ts

import BulkActions from './BulkActions';
import DashboardStats from './DashboardStats';
import Pagination from './Pagination';
import { UserFilters } from './UserFilters';

// Export all common admin components
export { UserFilters } from './UserFilters';
export type { UserFilters as UserFiltersType } from './UserFilters';

export { Pagination } from './Pagination';
export { default as PaginationDefault } from './Pagination';

export { BulkActions } from './BulkActions';
export { default as BulkActionsDefault } from './BulkActions';

export { DashboardStats } from './DashboardStats';
export type { DashboardStatsData } from './DashboardStats';
export { default as DashboardStatsDefault } from './DashboardStats';

// Re-export everything for easy importing
export default {
  UserFilters,
  Pagination,
  BulkActions,
  DashboardStats,
};