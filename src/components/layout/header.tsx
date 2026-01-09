'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { Menu, X, MessageSquare, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#0a0a0a]/95 backdrop-blur-sm border-b-2 border-[#333333] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - VHS style */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              {/* Fisheye lens ring effect */}
              <div className="w-10 h-10 border-2 border-[#00f5ff] rounded-full flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,245,255,0.5)] transition-shadow">
                <div className="w-6 h-6 bg-[#00f5ff] rounded-full group-hover:bg-[#ff2d7c] transition-colors" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-wider text-[#f5f0e8] group-hover:text-[#00f5ff] transition-colors font-display">
              GNARHUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {user && (
              <>
                <Link
                  href="/browse"
                  className="text-[#8b8b8b] hover:text-[#00f5ff] font-medium uppercase tracking-wide text-sm transition-colors"
                >
                  Browse
                </Link>
                <Link
                  href="/messages"
                  className="text-[#8b8b8b] hover:text-[#00f5ff] transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="text-[#8b8b8b] hover:text-[#00f5ff] transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[#8b8b8b] hover:text-[#ff2d7c] transition-colors"
                    title="Admin"
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full animate-pulse" />
            ) : user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/dashboard/profile">
                  <Avatar src={user.profilePhoto} alt={user.displayName} size="md" />
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Log out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Log In</Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#f5f0e8] hover:text-[#00f5ff] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#333333] bg-[#0a0a0a]">
          <div className="px-4 py-6 space-y-4">
            {user ? (
              <>
                <Link
                  href="/browse"
                  className="block text-[#8b8b8b] hover:text-[#00f5ff] font-medium uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Sessions
                </Link>
                <Link
                  href="/messages"
                  className="block text-[#8b8b8b] hover:text-[#00f5ff] font-medium uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-[#8b8b8b] hover:text-[#00f5ff] font-medium uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block text-[#8b8b8b] hover:text-[#ff2d7c] font-medium uppercase tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard/profile"
                  className="block text-[#8b8b8b] hover:text-[#00f5ff] font-medium uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-4 border-t border-[#333333]">
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[#ff2d7c] hover:text-[#ff2d7c]/80 font-medium uppercase tracking-wide"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
