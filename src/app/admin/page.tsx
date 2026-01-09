'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Avatar } from '@/components/ui';
import { StatsCard } from '@/components/admin/stats-card';
import { getPlatformStats, getRecentSignups, getRecentSessions } from '@/lib/admin';
import { getUser } from '@/lib/firestore';
import { PlatformStats } from '@/types/admin';
import { User, Session } from '@/types';
import { Users, Video, Calendar, Star, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentSessions, setRecentSessions] = useState<(Session & { filmer?: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, users, sessions] = await Promise.all([
          getPlatformStats(),
          getRecentSignups(5),
          getRecentSessions(5),
        ]);

        setStats(statsData);
        setRecentUsers(users);

        // Enrich sessions with filmer data
        const enrichedSessions = await Promise.all(
          sessions.map(async (session) => {
            const filmer = await getUser(session.filmerId);
            return { ...session, filmer: filmer || undefined };
          })
        );
        setRecentSessions(enrichedSessions);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalFilmers || 0} filmers`}
          icon={Users}
        />
        <StatsCard
          title="Total Sessions"
          value={stats?.totalSessions || 0}
          subtitle={`${stats?.openSessions || 0} open`}
          icon={Calendar}
        />
        <StatsCard
          title="Completed Sessions"
          value={stats?.completedSessions || 0}
          subtitle={`${stats?.bookedSessions || 0} booked`}
          icon={Video}
        />
        <StatsCard
          title="Platform Rating"
          value={stats?.averagePlatformRating?.toFixed(1) || 'N/A'}
          subtitle={`${stats?.totalReviews || 0} reviews`}
          icon={Star}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-xl font-semibold">
                  {(stats?.openSessions || 0) + (stats?.bookedSessions || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Filmers</p>
                <p className="text-xl font-semibold">{stats?.totalFilmers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Bookings</p>
                <p className="text-xl font-semibold">{stats?.bookedSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Signups</h3>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentUsers.length === 0 ? (
              <p className="px-4 py-8 text-center text-gray-500">No users yet</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <li key={user.id} className="px-4 py-3 flex items-center gap-3">
                    <Avatar src={user.profilePhoto} alt={user.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.isFilmer && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Filmer
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
              <Link href="/admin/sessions" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentSessions.length === 0 ? (
              <p className="px-4 py-8 text-center text-gray-500">No sessions yet</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentSessions.map((session) => (
                  <li key={session.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={session.filmer?.profilePhoto}
                          alt={session.filmer?.displayName || 'Filmer'}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.filmer?.displayName || 'Unknown Filmer'}
                          </p>
                          <p className="text-xs text-gray-500">{session.date}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'open'
                            ? 'bg-emerald-100 text-emerald-700'
                            : session.status === 'booked'
                            ? 'bg-blue-100 text-blue-700'
                            : session.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
