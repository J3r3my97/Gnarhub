'use client';

import Link from 'next/link';
import { Session, User, Mountain } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
      <Card className="cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar src={filmer.profilePhoto} alt={filmer.displayName} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#f5f0e8] truncate">{filmer.displayName}</h3>
                <span className="font-semibold text-[#00f5ff]">{formatCurrency(session.rate)}</span>
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
              <p className="text-sm text-[#8b8b8b] mt-2">
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#f5f0e8]">
              {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
            </p>
            <p className="text-sm text-[#8b8b8b]">{mountain.name}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {session.terrainTags.map((tag) => (
                <TerrainBadge key={tag} terrain={tag} />
              ))}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="font-semibold text-[#00f5ff] text-lg">{formatCurrency(session.rate)}</p>
            <Link href={`/request/${session.id}`}>
              <Button size="sm">Book Session</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
