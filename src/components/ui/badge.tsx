import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'terrain';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-[#2a2a2a] text-[#8b8b8b] border-[#333333]',
    success: 'bg-[#b8ff00]/10 text-[#b8ff00] border-[#b8ff00]/30',
    warning: 'bg-[#ffb800]/10 text-[#ffb800] border-[#ffb800]/30',
    error: 'bg-[#ff2d7c]/10 text-[#ff2d7c] border-[#ff2d7c]/30',
    terrain: 'bg-[#00f5ff]/10 text-[#00f5ff] border-[#00f5ff]/30',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider border',
        variants[variant],
        className
      )}
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
