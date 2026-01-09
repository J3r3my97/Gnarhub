import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-[#f5f0e8] placeholder-[#6b6b6b]',
          'focus:outline-none focus:border-[#00f5ff] focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]',
          'disabled:bg-[#0a0a0a] disabled:text-[#6b6b6b] disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && 'border-[#ff2d7c] focus:border-[#ff2d7c] focus:shadow-[0_0_10px_rgba(255,45,124,0.2)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#ff2d7c]">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-[#f5f0e8] placeholder-[#6b6b6b] resize-none',
          'focus:outline-none focus:border-[#00f5ff] focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]',
          'disabled:bg-[#0a0a0a] disabled:text-[#6b6b6b] disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && 'border-[#ff2d7c] focus:border-[#ff2d7c] focus:shadow-[0_0_10px_rgba(255,45,124,0.2)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#ff2d7c]">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };
