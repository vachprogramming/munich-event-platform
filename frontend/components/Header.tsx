'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/events" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
          <span>🥨</span> MunichEvents
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href={isLoggedIn ? "/create-event" : "/login"} 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Create Event
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                My Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link 
                href="/login" 
                className="text-gray-600 font-medium px-3 py-2 hover:bg-gray-100 rounded-lg transition"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col p-4 space-y-2">
            <Link 
              href={isLoggedIn ? "/create-event" : "/login"} 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition"
            >
              <span>✨</span> Create Event
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition"
                >
                  <span>👤</span> My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition text-left"
                >
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition"
                >
                  <span>🔑</span> Login
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl transition"
                >
                  <span>🚀</span> Sign Up Free
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}