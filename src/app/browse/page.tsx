'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Session, User, TerrainTag } from '@/types';
import { mountains, getMountainById } from '@/data/mountains';
import { getAllUpcomingSessions, getUser } from '@/lib/firestore';
import { SessionCard } from '@/components/session-card';
import { Select, Checkbox, Button } from '@/components/ui';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { addDays, isSameDay, startOfWeek, endOfWeek, format } from 'date-fns';

type DateGroup = {
  label: string;
  sessions: Session[];
};

type DateRangeOption = 'any' | 'this_weekend' | 'this_week' | 'next_week' | 'custom';

export default function BrowsePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filmers, setFilmers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters - all optional now
  const [mountainId, setMountainId] = useState<string>('');
  const [terrainTags, setTerrainTags] = useState<TerrainTag[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeOption>('any');
  const [customDate, setCustomDate] = useState<string>('');

  const hasActiveFilters = mountainId !== '' || terrainTags.length > 0 || dateRange !== 'any';

  // Calculate date range based on selection
  const getDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    switch (dateRange) {
      case 'this_weekend': {
        const saturday = addDays(startOfWeek(today, { weekStartsOn: 0 }), 6);
        const sunday = addDays(saturday, 1);
        return {
          startDate: format(saturday, 'yyyy-MM-dd'),
          endDate: format(sunday, 'yyyy-MM-dd'),
        };
      }
      case 'this_week': {
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        return {
          startDate: todayStr,
          endDate: format(weekEnd, 'yyyy-MM-dd'),
        };
      }
      case 'next_week': {
        const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
        const nextWeekStart = addDays(thisWeekEnd, 1);
        const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 });
        return {
          startDate: format(nextWeekStart, 'yyyy-MM-dd'),
          endDate: format(nextWeekEnd, 'yyyy-MM-dd'),
        };
      }
      case 'custom': {
        if (customDate) {
          return {
            startDate: customDate,
            endDate: customDate,
          };
        }
        // Fall through to default if no custom date
      }
      default: {
        // 'any' - next 14 days
        return {
          startDate: todayStr,
          endDate: format(addDays(today, 14), 'yyyy-MM-dd'),
        };
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange();

        // Fetch sessions with date range
        const fetchedSessions = await getAllUpcomingSessions({
          startDate,
          endDate,
          limitCount: 100,
          mountainId: mountainId || undefined,
          terrainTags: terrainTags.length > 0 ? terrainTags : undefined,
        });
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
  }, [user, mountainId, terrainTags, dateRange, customDate]);

  // Group sessions by date category
  const groupedSessions = useMemo(() => {
    const groups: DateGroup[] = [];
    const today = new Date();
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Sunday end
    const nextWeekStart = addDays(thisWeekEnd, 1);
    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 });

    const thisWeekendSessions: Session[] = [];
    const thisWeekSessions: Session[] = [];
    const nextWeekSessions: Session[] = [];
    const laterSessions: Session[] = [];

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date + 'T00:00:00');

      // Check if it's this weekend (Saturday or Sunday of current week)
      const saturday = addDays(startOfWeek(today, { weekStartsOn: 0 }), 6);
      const sunday = addDays(saturday, 1);
      const isThisWeekend = isSameDay(sessionDate, saturday) || isSameDay(sessionDate, sunday);

      if (isThisWeekend && sessionDate >= today) {
        thisWeekendSessions.push(session);
      } else if (sessionDate <= thisWeekEnd && sessionDate >= today) {
        thisWeekSessions.push(session);
      } else if (sessionDate >= nextWeekStart && sessionDate <= nextWeekEnd) {
        nextWeekSessions.push(session);
      } else {
        laterSessions.push(session);
      }
    });

    if (thisWeekendSessions.length > 0) {
      groups.push({ label: 'This Weekend', sessions: thisWeekendSessions });
    }
    if (thisWeekSessions.length > 0) {
      groups.push({ label: 'This Week', sessions: thisWeekSessions });
    }
    if (nextWeekSessions.length > 0) {
      groups.push({ label: 'Next Week', sessions: nextWeekSessions });
    }
    if (laterSessions.length > 0) {
      groups.push({ label: 'Coming Up', sessions: laterSessions });
    }

    return groups;
  }, [sessions]);

  const handleTerrainToggle = (tag: TerrainTag) => {
    setTerrainTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setMountainId('');
    setTerrainTags([]);
    setDateRange('any');
    setCustomDate('');
  };

  // Count active filters
  const activeFilterCount =
    (mountainId ? 1 : 0) + (terrainTags.length > 0 ? 1 : 0) + (dateRange !== 'any' ? 1 : 0);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#00f5ff] rounded-full animate-spin border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f0e8] uppercase tracking-wide">Browse Sessions</h1>
          <p className="text-[#8b8b8b] mt-1">Discover filmers available in the next 2 weeks</p>
        </div>
      </div>

      {/* Collapsible Filters */}
      <div className="bg-[#1a1a1a] border-2 border-[#333333] mb-6 overflow-hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2a2a2a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#8b8b8b]" />
            <span className="font-medium text-[#f5f0e8]">
              {hasActiveFilters ? 'Filters applied' : 'Filter results'}
            </span>
            {hasActiveFilters && (
              <span className="bg-[#00f5ff]/10 text-[#00f5ff] text-xs px-2 py-0.5 border border-[#00f5ff]/30">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {filtersOpen ? (
            <ChevronUp className="h-4 w-4 text-[#8b8b8b]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#8b8b8b]" />
          )}
        </button>

        {filtersOpen && (
          <div className="px-4 pb-4 border-t-2 border-[#333333]">
            <div className="space-y-4 pt-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">When</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'any', label: 'Any upcoming' },
                    { value: 'this_weekend', label: 'This weekend' },
                    { value: 'this_week', label: 'This week' },
                    { value: 'next_week', label: 'Next week' },
                    { value: 'custom', label: 'Specific date' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value as DateRangeOption)}
                      className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 border-2 ${
                        dateRange === option.value
                          ? 'bg-[#00f5ff] text-[#0a0a0a] border-[#00f5ff]'
                          : 'bg-transparent text-[#8b8b8b] border-[#333333] hover:border-[#00f5ff]/50 hover:text-[#f5f0e8]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {dateRange === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="mt-2 px-4 py-2 bg-[#1a1a1a] border-2 border-[#333333] text-[#f5f0e8] focus:outline-none focus:border-[#00f5ff]"
                  />
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">Terrain</label>
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

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-[#00f5ff] rounded-full animate-spin border-t-transparent" />
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border-2 border-[#333333]">
          <p className="text-[#8b8b8b] mb-2">
            {hasActiveFilters
              ? 'No sessions match your filters.'
              : 'No sessions available in the next 2 weeks.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters to see all sessions
            </Button>
          ) : (
            <p className="text-[#6b6b6b] text-sm">Check back soon or post your own session!</p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedSessions.map((group) => (
            <div key={group.label}>
              <h2 className="text-lg font-semibold text-[#f5f0e8] mb-4 flex items-center gap-2 uppercase tracking-wide">
                {group.label}
                <span className="text-sm font-normal text-[#00f5ff] lowercase">
                  ({group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'})
                </span>
              </h2>
              <div className="space-y-4">
                {group.sessions.map((session) => {
                  const filmer = filmers[session.filmerId];
                  const mountain = getMountainById(session.mountainId);
                  if (!filmer || !mountain) return null;

                  return <SessionCard key={session.id} session={session} filmer={filmer} mountain={mountain} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
