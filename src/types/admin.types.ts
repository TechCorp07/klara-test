// src/types/admin.types.ts
import { User } from '@/types/auth.types';

export interface UserFilters {
  search?: string;
  role?: string;
  is_approved?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface DashboardStatsResponse {
  total_users: number;
  pending_approvals: number;
  users_by_role: Record<string, number>;
  pending_caregiver_requests: number;
  unreviewed_emergency_access: number;
  recent_registrations: number;
  unverified_patients: number;
}

export interface BulkOperationResponse {
  approved_count?: number;
  denied_count?: number;
  total_requested: number;
  errors?: string[];
}

export interface AdminUserCreateData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
}