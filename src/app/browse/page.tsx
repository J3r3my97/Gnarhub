'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Session, User, TerrainTag } from '@/types';
import { mountains, getMountainById } from '@/data/mountains';
import { getSessions, getUser } from '@/lib/firestore';
import { SessionCard } from '@/components/session-card';
import { Select, Checkbox, Button } from '@/components/ui';
import { format, addDays } from 'date-fns';

export default function BrowsePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filmers, setFilmers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [mountainId, setMountainId] = useState<string>('');
  const [date, setDate] = useState<string>(format(addDays(new Date(), getNextSaturday()), 'yyyy-MM-dd'));
  const [terrainTags, setTerrainTags] = useState<TerrainTag[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const filters: { mountainId?: string; date?: string; terrainTags?: string[]; status: string } = {
          status: 'open',
        };

        if (mountainId) filters.mountainId = mountainId;
        if (date) filters.date = date;
        if (terrainTags.length > 0) filters.terrainTags = terrainTags;

        const fetchedSessions = await getSessions(filters);
        setSessions(fetchedSessions);

        // Fetch filmers for these sessions
        const filmerIds = [...new Set(fetchedSessions.map((s) => s.filmerId))];
        const filmerData: Record<string, User> = {};
        await Promise.all(
          filmerIds.map(async (id) => {
            const filmer = await getUser(id);
            if (filmer) filmerData[id] = filmer;
          })
        );
        setFilmers(filmerData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchSessions();
    }
  }, [user, mountainId, date, terrainTags]);

  const handleTerrainToggle = (tag: TerrainTag) => {
    setTerrainTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Session</h1>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="Mountain"
            value={mountainId}
            onChange={(e) => setMountainId(e.target.value)}
            options={[
              { value: '', label: 'All Mountains' },
              ...mountains.map((m) => ({ value: m.id, label: `${m.name}, ${m.state}` })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terrain</label>
            <div className="flex flex-wrap gap-3">
              <Checkbox
                label="Park"
                checked={terrainTags.includes('park')}
                onChange={() => handleTerrainToggle('park')}
              />
              <Checkbox
                label="All-Mountain"
                checked={terrainTags.includes('all-mountain')}
                onChange={() => handleTerrainToggle('all-mountain')}
              />
              <Checkbox
                label="Groomers"
                checked={terrainTags.includes('groomers')}
                onChange={() => handleTerrainToggle('groomers')}
              />
            </div>
          </div>
        </div>

        {(mountainId || terrainTags.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setMountainId('');
              setTerrainTags([]);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No sessions available{mountainId ? ` at ${getMountainById(mountainId)?.name}` : ''} on{' '}
            {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}.
          </p>
          <p className="text-gray-500">Check back later or try another date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const filmer = filmers[session.filmerId];
            const mountain = getMountainById(session.mountainId);
            if (!filmer || !mountain) return null;

            return <SessionCard key={session.id} session={session} filmer={filmer} mountain={mountain} />;
          })}
        </div>
      )}
    </div>
  );
}

// Helper to get days until next Saturday
function getNextSaturday(): number {
  const today = new Date().getDay();
  const daysUntilSaturday = (6 - today + 7) % 7;
  return daysUntilSaturday === 0 ? 7 : daysUntilSaturday;
}
