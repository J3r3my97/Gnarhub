'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { TerrainTag } from '@/types';
import { mountains } from '@/data/mountains';
import { createSession } from '@/lib/firestore';
import { validateSessionForm, sanitizeString, RATE_MIN, RATE_MAX } from '@/lib/validation';
import { Button, Input, Select, Textarea, Checkbox } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';
import { format, addDays } from 'date-fns';

function PostSessionFormInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state - initialized from URL params if duplicating
  const [mountainId, setMountainId] = useState('');
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [terrainTags, setTerrainTags] = useState<TerrainTag[]>([]);
  const [rate, setRate] = useState('60');
  const [notes, setNotes] = useState('');

  // Pre-fill form from URL params (when duplicating a session)
  useEffect(() => {
    const paramMountainId = searchParams.get('mountainId');
    const paramStartTime = searchParams.get('startTime');
    const paramEndTime = searchParams.get('endTime');
    const paramRate = searchParams.get('rate');
    const paramTerrainTags = searchParams.get('terrainTags');
    const paramNotes = searchParams.get('notes');

    if (paramMountainId) setMountainId(paramMountainId);
    if (paramStartTime) setStartTime(paramStartTime);
    if (paramEndTime) setEndTime(paramEndTime);
    if (paramRate) setRate(paramRate);
    if (paramTerrainTags) setTerrainTags(paramTerrainTags.split(',') as TerrainTag[]);
    if (paramNotes) setNotes(paramNotes);
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !user.isFilmer) {
      router.push('/dashboard/filmer-setup');
    }
  }, [user, authLoading, router]);

  const handleTerrainToggle = (tag: TerrainTag) => {
    setTerrainTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedRate = parseInt(rate, 10);
    const validMountainIds = mountains.map((m) => m.id);

    // Validate using validation utilities
    const validation = validateSessionForm(
      {
        mountainId,
        date,
        startTime,
        endTime,
        terrainTags,
        rate: parsedRate,
        notes: notes || undefined,
      },
      validMountainIds
    );

    if (!validation.valid) {
      setError(validation.error || 'Invalid form data');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await createSession({
        filmerId: user.id,
        status: 'open',
        mountainId,
        date,
        startTime,
        endTime,
        terrainTags,
        rate: parsedRate,
        notes: notes ? sanitizeString(notes) : null,
        riderId: null,
        requestId: null,
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink href="/dashboard" label="Back to Dashboard" />

      <h1 className="text-2xl font-bold text-[#f5f0e8] mb-6 uppercase tracking-wide">Post a Session</h1>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border-2 border-[#333333] p-6">
        <div className="space-y-6">
          <Select
            label="Mountain"
            value={mountainId}
            onChange={(e) => setMountainId(e.target.value)}
            options={mountains.map((m) => ({ value: m.id, label: `${m.name}, ${m.state}` }))}
            placeholder="Select a mountain"
          />

          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={format(new Date(), 'yyyy-MM-dd')} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">Terrain</label>
            <div className="flex flex-wrap gap-4">
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

          <div>
            <Input
              label="Session Rate ($)"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min={RATE_MIN.toString()}
              max={RATE_MAX.toString()}
            />
            <p className="text-sm text-[#8b8b8b] mt-1">Range: ${RATE_MIN}-${RATE_MAX}</p>
          </div>

          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional info about this session..."
            rows={3}
          />

          {error && <p className="text-sm text-[#ff2d7c]">{error}</p>}

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Post Session
          </Button>
        </div>
      </form>
    </div>
  );
}

function PostSessionLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0a0a0a]">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-[#00f5ff] rounded-full animate-spin border-t-transparent" />
      </div>
    </div>
  );
}

export default function PostSessionForm() {
  return (
    <Suspense fallback={<PostSessionLoading />}>
      <PostSessionFormInner />
    </Suspense>
  );
}
