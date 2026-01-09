// Admin-specific types

export interface PlatformStats {
  totalUsers: number;
  totalRiders: number;
  totalFilmers: number;
  totalSessions: number;
  openSessions: number;
  bookedSessions: number;
  completedSessions: number;
  totalReviews: number;
  averagePlatformRating: number | null;
}

export interface UserFilters {
  search?: string;
  role?: 'all' | 'riders' | 'filmers' | 'admins';
  status?: 'all' | 'active' | 'suspended' | 'deleted';
  sortBy?: 'createdAt' | 'displayName' | 'sessionsAsFilmer' | 'sessionsAsRider' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
}

export interface SessionFilters {
  status?: 'all' | 'open' | 'booked' | 'completed' | 'cancelled';
  mountainId?: string;
  dateFrom?: string;
  dateTo?: string;
  filmerId?: string;
}

export interface AdminAction {
  type: 'suspend_user' | 'activate_user' | 'delete_user' | 'promote_admin' | 'demote_admin' | 'delete_review';
  targetId: string;
  targetType: 'user' | 'session' | 'review';
  adminId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AdminLog {
  id: string;
  action: 'suspend_user' | 'activate_user' | 'delete_user' | 'promote_admin' | 'demote_admin' | 'delete_review';
  adminId: string;
  adminName: string;
  targetId: string;
  targetType: 'user' | 'session' | 'review';
  targetName?: string;
  metadata?: Record<string, unknown>;
  timestamp: { toDate?: () => Date };
}
