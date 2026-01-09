'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { Camera, Users, Snowflake, Play, Mountain, Film } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#00f5ff] rounded-full animate-spin border-t-transparent" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#ff2d7c] rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="bg-[#0a0a0a] film-grain">
      {/* Hero Section - Full height with dramatic visuals */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with vignette */}
        <div className="absolute inset-0 vignette">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1920&q=80')`,
              filter: 'grayscale(30%) contrast(1.1)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>

        {/* Scan lines overlay */}
        <div className="absolute inset-0 scan-lines pointer-events-none opacity-30" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Timecode badge */}
          <div className="mb-8">
            <span className="timecode">00:00:01</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#f5f0e8] mb-6 leading-[0.9] tracking-tight">
            GET
            <br />
            <span className="neon-cyan">FILMED</span>
            <br />
            ON THE
            <br />
            MOUNTAIN
          </h1>

          <p className="text-xl md:text-2xl text-[#8b8b8b] max-w-xl mb-10 leading-relaxed">
            Connect with riders who can keep up and capture your best clips.
            <span className="text-[#f5f0e8]"> No pros. No awkward friend footage.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login?mode=rider">
              <Button size="lg" className="w-full sm:w-auto group">
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Find a Filmer
              </Button>
            </Link>
            <Link href="/login?mode=filmer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Camera className="w-5 h-5 mr-2" />
                Become a Filmer
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
            <div className="w-6 h-10 border-2 border-[#8b8b8b] rounded-full flex justify-center">
              <div className="w-1 h-3 bg-[#00f5ff] rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Film strip style */}
      <section className="py-24 border-t-2 border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16">
            <div className="tape-label">How It Works</div>
            <div className="flex-1 h-px bg-[#333333]" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Browse Filmers',
                desc: 'Find filmers at your mountain who match your skill level and terrain preference.',
                num: '01',
              },
              {
                icon: Camera,
                title: 'Book a Session',
                desc: 'Pick a date and time that works. Chat to coordinate meeting up.',
                num: '02',
              },
              {
                icon: Snowflake,
                title: 'Ride Together',
                desc: 'Session the mountain together and get clips that actually look good.',
                num: '03',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group relative bg-[#1a1a1a] border-2 border-[#333333] p-8 hover:border-[#00f5ff]/50 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 bg-[#0a0a0a] px-3 py-1">
                  <span className="text-[#00f5ff] font-mono text-sm">{step.num}</span>
                </div>

                <div className="w-16 h-16 border-2 border-[#333333] flex items-center justify-center mb-6 group-hover:border-[#00f5ff] group-hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all">
                  <step.icon className="h-8 w-8 text-[#8b8b8b] group-hover:text-[#00f5ff] transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-[#f5f0e8] mb-3 uppercase tracking-wide">
                  {step.title}
                </h3>
                <p className="text-[#8b8b8b] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props - Asymmetric layout */}
      <section className="py-24 border-t-2 border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-5xl font-bold text-[#f5f0e8] mb-6 leading-tight">
                NOT YOUR FRIEND&apos;S
                <br />
                <span className="neon-magenta">SHAKY FOOTAGE</span>
              </h2>
              <p className="text-xl text-[#8b8b8b] mb-6 leading-relaxed">
                Your buddies can&apos;t keep up or they&apos;re filming from the lift.
                Professional videographers cost a fortune and don&apos;t know how to ride.
              </p>
              <p className="text-xl text-[#f5f0e8] leading-relaxed">
                Gnarhub connects you with peers who actually ski the same terrain,
                have decent gear, and can follow you through the park or down that steep line.
              </p>

              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { icon: Film, label: 'Quality Gear' },
                  { icon: Mountain, label: 'Same Terrain' },
                  { icon: Camera, label: 'Real Skill' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-[#00f5ff]" />
                    <span className="text-[#8b8b8b] uppercase text-sm tracking-wide">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                {/* Price card with VHS aesthetic */}
                <div className="bg-[#1a1a1a] border-2 border-[#ffb800] p-8 relative overflow-hidden">
                  {/* Corner tape effect */}
                  <div className="absolute -top-1 -right-1 w-16 h-16 bg-[#ffb800] transform rotate-45 translate-x-8 -translate-y-8" />

                  <div className="relative z-10">
                    <div className="text-[#8b8b8b] uppercase text-sm tracking-wider mb-2">
                      Typical Session Rate
                    </div>
                    <div className="text-5xl md:text-6xl font-bold text-[#f5f0e8] mb-4">
                      $40<span className="text-[#8b8b8b]">-</span>80
                    </div>
                    <div className="text-[#8b8b8b]">
                      Cover your filmer&apos;s lift ticket
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#333333]">
                      <div className="text-[#00f5ff] font-mono text-sm">
                        vs. $500+ for a pro videographer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t-2 border-[#333333] relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f5ff] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff2d7c] rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="tape-label mb-8">Now Live</div>

          <h2 className="text-4xl md:text-6xl font-bold text-[#f5f0e8] mb-6">
            READY TO GET
            <br />
            <span className="neon-cyan">SOME CLIPS?</span>
          </h2>

          <p className="text-xl text-[#8b8b8b] mb-10">
            Starting at <span className="text-[#f5f0e8]">Loon Mountain, NH</span>.
            More mountains coming soon.
          </p>

          <Link href="/login">
            <Button size="lg" className="text-lg">
              <Play className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </Link>

          {/* Footer tagline */}
          <div className="mt-20 text-[#8b8b8b] font-mono text-sm">
            <span className="text-[#ff2d7c]">●</span> GNARHUB — WHERE RIDERS FILM RIDERS
          </div>
        </div>
      </section>
    </div>
  );
}
