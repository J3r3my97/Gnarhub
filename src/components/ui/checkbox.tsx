'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 border-2 border-[#333333] transition-all duration-200',
              'peer-checked:bg-[#00f5ff] peer-checked:border-[#00f5ff]',
              'peer-focus:ring-2 peer-focus:ring-[#00f5ff] peer-focus:ring-offset-2 peer-focus:ring-offset-[#0a0a0a]',
              'group-hover:border-[#00f5ff]/50',
              className
            )}
          >
            {checked && <Check className="w-4 h-4 text-[#0a0a0a] absolute top-0.5 left-0.5" strokeWidth={3} />}
          </div>
        </div>
        {label && <span className="text-sm text-[#f5f0e8] group-hover:text-[#00f5ff] transition-colors">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
