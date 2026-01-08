import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const initials = getInitials(alt);

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-gray-200', sizes[size], className)}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
