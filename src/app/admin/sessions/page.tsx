'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Select, Button, Input } from '@/components/ui';
import { SessionTable } from '@/components/admin/session-table';
import { getAllSessions } from '@/lib/admin';
import { getUser } from '@/lib/firestore';
import { Session, User, Mountain } from '@/types';
import { SessionFilters } from '@/types/admin';
import { RefreshCw, Calendar } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type EnrichedSession = Session & { filmer?: User; rider?: User; mountain?: Mountain };

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SessionFilters>({
    status: 'all',
    mountainId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Load mountains for filter dropdown
  useEffect(() => {
    async function loadMountains() {
      if (!db) return;
      const snapshot = await getDocs(collection(db, 'mountains'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Mountain));
      setMountains(data);
    }
    loadMountains();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getAllSessions(filters);

      // Enrich sessions with filmer, rider, and mountain data
      const enriched = await Promise.all(
        data.map(async (session) => {
          const [filmer, rider] = await Promise.all([
            getUser(session.filmerId),
            session.riderId ? getUser(session.riderId) : Promise.resolve(null),
          ]);
          const mountain = mountains.find((m) => m.id === session.mountainId);
          return {
            ...session,
            filmer: filmer || undefined,
            rider: rider || undefined,
            mountain,
          };
        })
      );

      setSessions(enriched);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mountains.length > 0 || filters.mountainId === undefined) {
      loadSessions();
    }
  }, [filters, mountains]);

  // Calculate stats
  const stats = {
    total: sessions.length,
    open: sessions.filter((s) => s.status === 'open').length,
    booked: sessions.filter((s) => s.status === 'booked').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    cancelled: sessions.filter((s) => s.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
        <Button variant="ghost" size="sm" onClick={loadSessions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.open}</p>
            <p className="text-xs text-gray-500">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.booked}</p>
            <p className="text-xs text-gray-500">Booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={filters.status || 'all'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as SessionFilters['status'],
                })
              }
              className="w-full sm:w-40"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'open', label: 'Open' },
                { value: 'booked', label: 'Booked' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              value={filters.mountainId || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  mountainId: e.target.value || undefined,
                })
              }
              className="w-full sm:w-48"
              options={[
                { value: '', label: 'All Mountains' },
                ...mountains.map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value || undefined })
                }
                className="w-36"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value || undefined })
                }
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No sessions found</div>
          ) : (
            <SessionTable sessions={sessions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
