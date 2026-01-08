import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'terrain';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    terrain: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    open: { variant: 'success', label: 'Open' },
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'success', label: 'Confirmed' },
    booked: { variant: 'success', label: 'Booked' },
    completed: { variant: 'default', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    declined: { variant: 'error', label: 'Declined' },
    counter_offered: { variant: 'warning', label: 'Counter Offer' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Terrain tag badges
export function TerrainBadge({ terrain }: { terrain: string }) {
  const labels: Record<string, string> = {
    park: 'Park',
    'all-mountain': 'All-Mountain',
    groomers: 'Groomers',
  };

  return <Badge variant="terrain">{labels[terrain] || terrain}</Badge>;
}

export { Badge };
