'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { Camera, Users, Snowflake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/browse');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get filmed on the mountain.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with riders who can keep up and capture your best clips.
            No pros, no awkward friend footage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?mode=rider">
              <Button size="lg" className="w-full sm:w-auto">
                Find a Filmer
              </Button>
            </Link>
            <Link href="/login?mode=filmer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Become a Filmer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Filmers</h3>
              <p className="text-gray-600">
                Find filmers at your mountain who match your skill level and terrain preference.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book a Session</h3>
              <p className="text-gray-600">
                Pick a date and time that works. Chat to coordinate meeting up.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Snowflake className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ride Together</h3>
              <p className="text-gray-600">
                Session the mountain together and get clips that actually look good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Not your friend&apos;s shaky footage
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your buddies can&apos;t keep up or they&apos;re filming from the lift.
                Professional videographers cost a fortune and don&apos;t know how to ride.
              </p>
              <p className="text-lg text-gray-600">
                Gnarhub connects you with peers who actually ski the same terrain,
                have decent gear, and can follow you through the park or down that steep line.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$40-80</div>
              <div className="text-gray-600">Typical session rate</div>
              <div className="text-sm text-gray-500 mt-2">Cover your filmer&apos;s lift ticket</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get some clips?</h2>
          <p className="text-blue-100 mb-8">Starting at Loon Mountain, NH. More mountains coming soon.</p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
