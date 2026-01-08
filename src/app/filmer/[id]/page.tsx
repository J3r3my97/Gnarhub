'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { User, Session, Review } from '@/types';
import { getUser, getFilmerSessions, getFilmerReviews } from '@/lib/firestore';
import { getMountainById, mountains } from '@/data/mountains';
import { Avatar, Button, Badge, TerrainBadge } from '@/components/ui';
import { RatingDisplay } from '@/components/ui/rating';
import { SessionCardCompact } from '@/components/session-card';
import { BackLink } from '@/components/layout/back-link';
import { Star, Camera, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface FilmerPageProps {
  params: Promise<{ id: string }>;
}

export default function FilmerProfilePage({ params }: FilmerPageProps) {
  const { id } = use(params);
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedSessionId = searchParams.get('session');

  const [filmer, setFilmer] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [filmerData, sessionsData, reviewsData] = await Promise.all([
          getUser(id),
          getFilmerSessions(id),
          getFilmerReviews(id),
        ]);

        setFilmer(filmerData);
        // Only show open sessions in the future
        const today = new Date().toISOString().split('T')[0];
        setSessions(sessionsData.filter((s) => s.status === 'open' && s.date >= today));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching filmer data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    }
  }, [id, currentUser]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!filmer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackLink href="/browse" label="Back to Browse" />
        <p className="text-gray-600">Filmer not found.</p>
      </div>
    );
  }

  const homeMountainNames = filmer.homeMountains
    .map((id) => getMountainById(id)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackLink href="/browse" label="Back to Browse" />

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar src={filmer.profilePhoto} alt={filmer.displayName} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{filmer.displayName}</h1>
            {filmer.averageRating && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <RatingDisplay rating={filmer.averageRating} reviewCount={filmer.reviewCount} />
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{filmer.sessionsAsFilmer} sessions</span>
              </div>
            )}
            {homeMountainNames && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{homeMountainNames}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        {filmer.bio && <p className="text-gray-600 mb-4">{filmer.bio}</p>}

        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Passes</h3>
            <div className="flex flex-wrap gap-1">
              {filmer.passes.map((pass) => (
                <Badge key={pass} className="capitalize">
                  {pass}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Terrain</h3>
            <div className="flex flex-wrap gap-1">
              {filmer.terrainTags.map((tag) => (
                <TerrainBadge key={tag} terrain={tag} />
              ))}
            </div>
          </div>
          {filmer.gear && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Gear</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Camera className="h-4 w-4" />
                <span>{filmer.gear}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample Work */}
      {filmer.sampleWorkUrls.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filmer.sampleWorkUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
              >
                <p className="text-sm text-blue-600 truncate">{url}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* Available Sessions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No upcoming sessions available.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const mountain = getMountainById(session.mountainId);
              if (!mountain) return null;
              return (
                <div
                  key={session.id}
                  className={highlightedSessionId === session.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}
                >
                  <SessionCardCompact session={session} mountain={mountain} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [reviewer, setReviewer] = useState<User | null>(null);

  useEffect(() => {
    getUser(review.riderId).then(setReviewer);
  }, [review.riderId]);

  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <p className="text-gray-700 mb-2">{review.text}</p>
      <div className="flex items-center gap-2">
        {review.couldKeepUp && <Badge variant="success">Could keep up</Badge>}
        {review.goodQuality && <Badge variant="success">Good quality</Badge>}
        {review.goodVibes && <Badge variant="success">Good vibes</Badge>}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        — {reviewer?.displayName || 'Anonymous'} • {formatDate(review.createdAt.toDate().toISOString().split('T')[0])}
      </p>
    </div>
  );
}
