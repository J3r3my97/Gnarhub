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
      <Star className={cn(sizes[size], 'fill-[#ffb800] text-[#ffb800]')} />
      <span className={cn('font-medium text-[#f5f0e8]', size === 'sm' ? 'text-sm' : 'text-base')}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className={cn('text-[#8b8b8b]', size === 'sm' ? 'text-xs' : 'text-sm')}>({reviewCount})</span>
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
          className="focus:outline-none focus:ring-2 focus:ring-[#00f5ff]"
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors',
              star <= value ? 'fill-[#ffb800] text-[#ffb800]' : 'text-[#333333] hover:text-[#ffb800]/50'
            )}
          />
        </button>
      ))}
    </div>
  );
}
