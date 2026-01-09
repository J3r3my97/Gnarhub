'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Button, Input, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { getAllUsers, promoteToAdmin, demoteFromAdmin } from '@/lib/admin';
import { getAdminLogs } from '@/lib/admin-logs';
import { User } from '@/types';
import { AdminLog } from '@/types/admin';
import { Shield, ShieldOff, Clock, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [admins, setAdmins] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, adminLogs] = await Promise.all([
        getAllUsers({ role: 'all' }),
        getAdminLogs(20),
      ]);
      setAllUsers(users);
      setAdmins(users.filter((u) => u.isAdmin));
      setLogs(adminLogs);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAdmin = async () => {
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === newAdminEmail.toLowerCase()
    );
    if (!user) {
      toast.error('User not found');
      return;
    }
    if (user.isAdmin) {
      toast.error('User is already an admin');
      return;
    }

    try {
      await promoteToAdmin(user.id);
      toast.success(`${user.displayName} promoted to admin`);
      setNewAdminEmail('');
      loadData();
    } catch {
      toast.error('Failed to promote user');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot remove yourself as admin');
      return;
    }

    try {
      await demoteFromAdmin(userId);
      toast.success('Admin privileges removed');
      loadData();
    } catch {
      toast.error('Failed to remove admin');
    }
  };

  const formatDate = (timestamp: { toDate?: () => Date } | undefined) => {
    if (!timestamp?.toDate) return 'Unknown';
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      suspend_user: 'Suspended user',
      activate_user: 'Activated user',
      promote_admin: 'Promoted to admin',
      demote_admin: 'Removed admin',
      delete_review: 'Deleted review',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Admin Users</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Admin */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email to make admin..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddAdmin} disabled={!newAdminEmail.trim()}>
              Add Admin
            </Button>
          </div>

          {/* Admin List */}
          <div className="border rounded-lg divide-y">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : admins.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No admins found</div>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={admin.profilePhoto} alt={admin.displayName} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">{admin.displayName}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  {admin.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                  {admin.id === currentUser?.id && (
                    <span className="text-xs text-gray-400">You</span>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Platform Configuration</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Min Session Rate</p>
              <p className="text-xl font-semibold text-gray-900">$20</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Max Session Rate</p>
              <p className="text-xl font-semibold text-gray-900">$500</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Rate limits are enforced via Firestore security rules. Contact a developer to modify.
          </p>
        </CardContent>
      </Card>

      {/* Admin Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Recent Admin Activity</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No activity logged yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {logs.map((log) => (
                <li key={log.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.adminName || 'Admin'}</span>{' '}
                      {getActionLabel(log.action)}
                      {log.targetName && (
                        <>
                          {' '}
                          <span className="font-medium">{log.targetName}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
