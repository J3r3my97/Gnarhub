import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[#f5f0e8] mb-2 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-[#f5f0e8] appearance-none',
              'focus:outline-none focus:border-[#00f5ff] focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]',
              'disabled:bg-[#0a0a0a] disabled:text-[#6b6b6b] disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'border-[#ff2d7c] focus:border-[#ff2d7c] focus:shadow-[0_0_10px_rgba(255,45,124,0.2)]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-[#f5f0e8]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8b8b] pointer-events-none" />
        </div>
        {error && <p className="mt-2 text-sm text-[#ff2d7c]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
