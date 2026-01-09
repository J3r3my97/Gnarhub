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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            GNARHUB
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link href="/browse" className="text-gray-600 hover:text-gray-900 font-medium">
                  Browse
                </Link>
                <Link href="/messages" className="text-gray-600 hover:text-gray-900">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900" title="Admin">
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
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
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {user ? (
              <>
                <Link
                  href="/browse"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Sessions
                </Link>
                <Link
                  href="/messages"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block text-gray-600 hover:text-gray-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard/profile"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Log out
                </button>
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
