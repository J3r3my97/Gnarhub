import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed border-2';

    const variants = {
      primary:
        'bg-[#00f5ff] text-[#0a0a0a] border-[#00f5ff] hover:bg-transparent hover:text-[#00f5ff] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] focus:ring-[#00f5ff]',
      secondary:
        'bg-transparent text-[#f5f0e8] border-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#0a0a0a] focus:ring-[#f5f0e8]',
      ghost:
        'bg-transparent text-[#8b8b8b] border-transparent hover:text-[#f5f0e8] hover:border-[#333333] focus:ring-[#333333]',
      danger:
        'bg-[#ff2d7c] text-[#0a0a0a] border-[#ff2d7c] hover:bg-transparent hover:text-[#ff2d7c] hover:shadow-[0_0_20px_rgba(255,45,124,0.4)] focus:ring-[#ff2d7c]',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
