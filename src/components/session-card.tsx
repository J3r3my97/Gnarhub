'use client';

import Link from 'next/link';
import { Session, User, Mountain } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { RatingDisplay } from '@/components/ui/rating';
import { TerrainBadge } from '@/components/ui/badge';
import { formatDate, formatTimeRange, formatCurrency } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  filmer: User;
  mountain: Mountain;
}

export function SessionCard({ session, filmer, mountain }: SessionCardProps) {
  return (
    <Link href={`/filmer/${filmer.id}?session=${session.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar src={filmer.profilePhoto} alt={filmer.displayName} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">{filmer.displayName}</h3>
                <span className="font-semibold text-gray-900">{formatCurrency(session.rate)}</span>
              </div>
              {filmer.averageRating && (
                <RatingDisplay
                  rating={filmer.averageRating}
                  reviewCount={filmer.reviewCount}
                  size="sm"
                  className="mt-1"
                />
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {session.terrainTags.map((tag) => (
                  <TerrainBadge key={tag} terrain={tag} />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)} • {mountain.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact version for filmer profile
export function SessionCardCompact({ session, mountain }: { session: Session; mountain: Mountain }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
            </p>
            <p className="text-sm text-gray-500">{mountain.name}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {session.terrainTags.map((tag) => (
                <TerrainBadge key={tag} terrain={tag} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">{formatCurrency(session.rate)}</p>
            <Link
              href={`/request/${session.id}`}
              className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Request Session
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
