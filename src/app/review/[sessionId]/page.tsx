'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Session, User } from '@/types';
import { getSession, getUser, createReview } from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import { Button, Textarea, Checkbox } from '@/components/ui';
import { RatingInput } from '@/components/ui/rating';
import { BackLink } from '@/components/layout/back-link';
import { formatDate, formatTimeRange } from '@/lib/utils';

interface ReviewPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { sessionId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [filmer, setFilmer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [couldKeepUp, setCouldKeepUp] = useState(false);
  const [goodQuality, setGoodQuality] = useState(false);
  const [goodVibes, setGoodVibes] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
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

    fetchData();
  }, [sessionId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !user || rating === 0) return;

    setSubmitting(true);
    try {
      await createReview({
        sessionId: session.id,
        filmerId: session.filmerId,
        riderId: user.id,
        rating,
        text,
        couldKeepUp,
        goodQuality,
        goodVibes,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating review:', error);
      alert('Failed to submit review. Please try again.');
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
        <BackLink href="/dashboard" label="Back to Dashboard" />
        <p className="text-gray-600">Session not found.</p>
      </div>
    );
  }

  const mountain = getMountainById(session.mountainId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink href="/dashboard" label="Back to Dashboard" />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h1>

      {/* Session Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">SESSION WITH</h2>
        <p className="text-lg font-semibold text-gray-900">{filmer.displayName}</p>
        <p className="text-gray-600 mt-1">
          {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)} • {mountain?.name}
        </p>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <RatingInput value={rating} onChange={setRating} />
            {rating === 0 && <p className="text-sm text-gray-500 mt-1">Click to rate</p>}
          </div>

          <Textarea
            label="Your Review"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was your experience? Did the filmer keep up with your terrain? How was the video quality?"
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Tags (optional)</label>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Could keep up with my terrain"
                checked={couldKeepUp}
                onChange={() => setCouldKeepUp(!couldKeepUp)}
              />
              <Checkbox
                label="Good video quality"
                checked={goodQuality}
                onChange={() => setGoodQuality(!goodQuality)}
              />
              <Checkbox
                label="Good vibes"
                checked={goodVibes}
                onChange={() => setGoodVibes(!goodVibes)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={rating === 0 || text.length < 20}
            loading={submitting}
          >
            Submit Review
          </Button>

          {text.length > 0 && text.length < 20 && (
            <p className="text-sm text-gray-500 text-center">
              Please write at least 20 characters ({20 - text.length} more needed)
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
