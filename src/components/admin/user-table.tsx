'use client';

import { User } from '@/types';
import { Avatar, Badge, Button } from '@/components/ui';
import { MoreVertical, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onSuspend: (userId: string) => void;
  onActivate: (userId: string) => void;
  onPromoteAdmin: (userId: string) => void;
  onDemoteAdmin: (userId: string) => void;
}

export function UserTable({
  users,
  currentUserId,
  onSuspend,
  onActivate,
  onPromoteAdmin,
  onDemoteAdmin,
}: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (timestamp: { toDate?: () => Date } | undefined) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sessions
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const isSuspended = user.status === 'suspended';

            return (
              <tr key={user.id} className={cn('hover:bg-gray-50', isSuspended && 'opacity-60')}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.profilePhoto} alt={user.displayName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {user.isAdmin && <Badge variant="warning">Admin</Badge>}
                    {user.isFilmer && <Badge variant="terrain">Filmer</Badge>}
                    {!user.isFilmer && !user.isAdmin && <Badge>Rider</Badge>}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <span className="text-gray-900">{user.sessionsAsFilmer}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-600">{user.sessionsAsRider}</span>
                    <p className="text-xs text-gray-400">filmed / rode</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {user.averageRating ? (
                    <div className="text-sm">
                      <span className="text-gray-900">{user.averageRating.toFixed(1)}</span>
                      <span className="text-gray-400"> ({user.reviewCount})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No reviews</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={isSuspended ? 'error' : 'success'}>
                    {user.status || 'active'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="relative inline-block">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      disabled={isCurrentUser}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {openMenuId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          {isSuspended ? (
                            <button
                              onClick={() => {
                                onActivate(user.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <UserCheck className="h-4 w-4" />
                              Activate User
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onSuspend(user.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <UserX className="h-4 w-4" />
                              Suspend User
                            </button>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          {user.isAdmin ? (
                            <button
                              onClick={() => {
                                onDemoteAdmin(user.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <ShieldOff className="h-4 w-4" />
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onPromoteAdmin(user.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              Make Admin
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
