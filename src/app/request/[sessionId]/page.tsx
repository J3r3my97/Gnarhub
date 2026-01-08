'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Session, User, TerrainTag } from '@/types';
import { getSession, getUser, createSessionRequest, createConversation } from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import { notify } from '@/lib/notify';
import { validateRequestForm, sanitizeString } from '@/lib/validation';
import { Button, Textarea, Checkbox } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';
import { formatDate, formatTimeRange, formatCurrency } from '@/lib/utils';

interface RequestPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function RequestSessionPage({ params }: RequestPageProps) {
  const { sessionId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [filmer, setFilmer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [message, setMessage] = useState('');
  const [terrainTags, setTerrainTags] = useState<TerrainTag[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const sessionData = await getSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          const filmerData = await getUser(sessionData.filmerId);
          setFilmer(filmerData);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [sessionId, user]);

  const handleTerrainToggle = (tag: TerrainTag) => {
    setTerrainTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !filmer || !user) return;

    // Validate form
    const validation = validateRequestForm({ message, terrainTags });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      // Create the session request
      await createSessionRequest({
        sessionId: session.id,
        riderId: user.id,
        filmerId: session.filmerId,
        status: 'pending',
        message: sanitizeString(message),
        riderTerrainLevel: terrainTags,
        amount: session.rate,
        stripePaymentIntentId: null,
      });

      // Create a conversation
      const conversationId = await createConversation(session.id, [user.id, session.filmerId]);

      // Send notification to filmer
      const mountain = getMountainById(session.mountainId);
      notify({
        type: 'new_request',
        data: {
          filmerEmail: filmer.email,
          filmerName: filmer.displayName,
          riderName: user.displayName,
          sessionDate: session.date,
          mountain: mountain?.name || 'Unknown',
        },
      });

      // Redirect to conversation
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session || !filmer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackLink />
        <p className="text-gray-600">Session not found.</p>
      </div>
    );
  }

  // Prevent self-booking
  const isOwnSession = user?.id === session.filmerId;

  const mountain = getMountainById(session.mountainId);

  if (isOwnSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackLink />
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">This is your session</h2>
          <p className="text-yellow-700">You cannot book your own session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Session</h1>

      {/* Session Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">SESSION WITH</h2>
        <p className="text-lg font-semibold text-gray-900">{filmer.displayName}</p>
        <p className="text-gray-600 mt-1">
          {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)} • {mountain?.name}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(session.rate)}</p>
      </div>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-6">
          <Textarea
            label="What do you want filmed?"
            placeholder="I'm working on 360s off the medium jumps and want some clean side-angle clips. Down to session the main park line together."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Terrain</label>
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

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Send Request - {formatCurrency(session.rate)}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            You won&apos;t be charged until {filmer.displayName} accepts.
          </p>
        </div>
      </form>
    </div>
  );
}
