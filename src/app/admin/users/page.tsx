'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Input, Select, Button } from '@/components/ui';
import { UserTable } from '@/components/admin/user-table';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui';
import {
  getAllUsers,
  suspendUser,
  activateUser,
  promoteToAdmin,
  demoteFromAdmin,
} from '@/lib/admin';
import { User } from '@/types';
import { UserFilters } from '@/types/admin';
import { Search, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(filters);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters.role, filters.status, filters.sortBy, filters.sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleSuspend = async (userId: string) => {
    try {
      await suspendUser(userId);
      toast.success('User suspended');
      loadUsers();
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      toast.success('User activated');
      loadUsers();
    } catch {
      toast.error('Failed to activate user');
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    try {
      await promoteToAdmin(userId);
      toast.success('User promoted to admin');
      loadUsers();
    } catch {
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteAdmin = async (userId: string) => {
    try {
      await demoteFromAdmin(userId);
      toast.success('Admin privileges removed');
      loadUsers();
    } catch {
      toast.error('Failed to demote user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <Button variant="ghost" size="sm" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value as UserFilters['role'] })
              }
              className="w-full sm:w-40"
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'riders', label: 'Riders' },
                { value: 'filmers', label: 'Filmers' },
                { value: 'admins', label: 'Admins' },
              ]}
            />
            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as UserFilters['status'] })
              }
              className="w-full sm:w-40"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
            <Select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value as UserFilters['sortBy'] })
              }
              className="w-full sm:w-40"
              options={[
                { value: 'createdAt', label: 'Join Date' },
                { value: 'displayName', label: 'Name' },
                { value: 'sessionsAsFilmer', label: 'Sessions (Filmer)' },
                { value: 'averageRating', label: 'Rating' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <UserTable
              users={users}
              currentUserId={currentUser?.id || ''}
              onSuspend={handleSuspend}
              onActivate={handleActivate}
              onPromoteAdmin={handlePromoteAdmin}
              onDemoteAdmin={handleDemoteAdmin}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
