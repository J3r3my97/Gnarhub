'use client';

import { Review, User } from '@/types';
import { Card, CardContent, Avatar, Button, Badge } from '@/components/ui';
import { Star, ThumbsUp, Trash2 } from 'lucide-react';

interface ReviewCardProps {
  review: Review & { filmer?: User; rider?: User };
  onDelete: (reviewId: string, filmerId: string) => void;
  deleting?: boolean;
}

export function ReviewCard({ review, onDelete, deleting }: ReviewCardProps) {
  const formatDate = (timestamp: { toDate?: () => Date } | undefined) => {
    if (!timestamp?.toDate) return 'Unknown date';
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Reviewer Info */}
          <div className="flex-shrink-0">
            <Avatar
              src={review.rider?.profilePhoto}
              alt={review.rider?.displayName || 'Rider'}
              size="md"
            />
          </div>

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {review.rider?.displayName || 'Unknown Rider'}
                </p>
                <p className="text-sm text-gray-500">
                  reviewed{' '}
                  <span className="font-medium text-gray-700">
                    {review.filmer?.displayName || 'Unknown Filmer'}
                  </span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(review.createdAt)}</p>
              </div>
            </div>

            {/* Review Text */}
            <p className="mt-3 text-gray-700">{review.text}</p>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {review.couldKeepUp && (
                <Badge variant="success">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Could Keep Up
                </Badge>
              )}
              {review.goodQuality && (
                <Badge variant="success">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Good Quality
                </Badge>
              )}
              {review.goodVibes && (
                <Badge variant="success">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Good Vibes
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Session: {review.sessionId.slice(0, 8)}...
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review.id, review.filmerId)}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Review
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
