'use client';

import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          {children}
          <Analytics />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
