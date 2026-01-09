'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Button, Select, Modal } from '@/components/ui';
import { ReviewCard } from '@/components/admin/review-card';
import { useToast } from '@/components/ui';
import { getAllReviews, deleteReview } from '@/lib/admin';
import { getUser } from '@/lib/firestore';
import { Review, User } from '@/types';
import { RefreshCw, Star, AlertTriangle } from 'lucide-react';

type EnrichedReview = Review & { filmer?: User; rider?: User };

export default function AdminReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<EnrichedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; filmerId: string } | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();

      // Enrich reviews with user data
      const enriched = await Promise.all(
        data.map(async (review) => {
          const [filmer, rider] = await Promise.all([
            getUser(review.filmerId),
            getUser(review.riderId),
          ]);
          return {
            ...review,
            filmer: filmer || undefined,
            rider: rider || undefined,
          };
        })
      );

      setReviews(enriched);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(deleteConfirm.id);
    try {
      await deleteReview(deleteConfirm.id, deleteConfirm.filmerId);
      toast.success('Review deleted');
      loadReviews();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  // Filter reviews by rating
  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter === 'all') return true;
    if (ratingFilter === 'low') return review.rating <= 2;
    if (ratingFilter === 'high') return review.rating >= 4;
    return review.rating === parseInt(ratingFilter);
  });

  // Calculate stats
  const stats = {
    total: reviews.length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A',
    lowRatings: reviews.filter((r) => r.rating <= 2).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        <Button variant="ghost" size="sm" onClick={loadReviews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
            <p className="text-xs text-gray-500">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.lowRatings}</p>
            <p className="text-xs text-gray-500">Low Ratings (1-2)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Filter by rating:</span>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-40"
              options={[
                { value: 'all', label: 'All Ratings' },
                { value: 'low', label: 'Low (1-2)' },
                { value: 'high', label: 'High (4-5)' },
                { value: '1', label: '1 Star' },
                { value: '2', label: '2 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '5', label: '5 Stars' },
              ]}
            />
            <span className="text-sm text-gray-400">
              Showing {filteredReviews.length} of {reviews.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">No reviews found</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={(id, filmerId) => setDeleteConfirm({ id, filmerId })}
              deleting={deleting === review.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">This action cannot be undone</p>
              <p className="text-sm text-amber-700 mt-1">
                Deleting this review will also recalculate the filmer&apos;s average rating.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
