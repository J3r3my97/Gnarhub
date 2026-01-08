'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-6">We&apos;re sorry, an unexpected error occurred.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
