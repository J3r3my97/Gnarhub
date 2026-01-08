'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingDisplay({ rating, reviewCount, size = 'md', className }: RatingDisplayProps) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className={cn(sizes[size], 'fill-amber-400 text-amber-400')} />
      <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className={cn('text-gray-500', size === 'sm' ? 'text-xs' : 'text-sm')}>({reviewCount})</span>
      )}
    </div>
  );
}

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function RatingInput({ value, onChange, className }: RatingInputProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}
