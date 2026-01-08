import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('bg-white border border-gray-200 rounded-xl shadow-sm', className)}
      {...props}
    />
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('px-4 py-3 border-b border-gray-100', className)} {...props} />;
});

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('p-4', className)} {...props} />;
});

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('px-4 py-3 border-t border-gray-100', className)} {...props} />;
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
