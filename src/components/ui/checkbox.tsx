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
      <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer">
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
              'w-5 h-5 border-2 border-gray-300 rounded transition-colors',
              'peer-checked:bg-blue-600 peer-checked:border-blue-600',
              'peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              className
            )}
          >
            {checked && <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" strokeWidth={3} />}
          </div>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
