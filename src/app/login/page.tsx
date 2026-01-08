'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button, Input } from '@/components/ui';
import Link from 'next/link';

function LoginForm() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      router.push(mode === 'filmer' ? '/dashboard/filmer-setup' : '/browse');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      router.push(mode === 'filmer' ? '/dashboard/filmer-setup' : '/browse');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (errorMessage.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters');
      } else if (errorMessage.includes('auth/invalid-email')) {
        setError('Invalid email address');
      } else if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
        setError('Invalid email or password');
      } else {
        setError(isSignUp ? 'Failed to create account' : 'Failed to sign in');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'filmer' ? 'Sign up to film' : isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'filmer'
              ? 'Start earning by filming other riders'
              : 'Find riders who can film you on the mountain'}
          </p>
        </div>

        {/* Google Sign In */}
        <Button variant="secondary" className="w-full mb-6" onClick={handleGoogleSignIn}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-500 mt-8">
          By signing up, you agree to our{' '}
          <Link href="#" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
