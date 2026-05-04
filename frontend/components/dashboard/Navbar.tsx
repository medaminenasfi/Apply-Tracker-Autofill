'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSidebarStore } from '@/store/sidebarStore';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, Sun, Moon, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toggleCollapse, openMobile } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (!first && !last) return '?';
    return `${first}${last}`.toUpperCase();
  };

  const profilePictureUrl = user?.profilePictureUrl
    ? (user.profilePictureUrl.startsWith('http')
        ? user.profilePictureUrl
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.profilePictureUrl}`)
      + `?t=${user.profilePictureUpdatedAt || Date.now()}`
    : null;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] flex items-center shrink-0 border-b border-[#E5E7EB] dark:border-white/[0.08] bg-white/85 dark:bg-[#020617]/85 backdrop-blur-xl transition-colors">
      <div className="flex items-center justify-between gap-4 w-full px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-[#111827]/60 dark:text-[#E5E7EB]/60" />
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={openMobile}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-[#111827]/60 dark:text-[#E5E7EB]/60" />
          </button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>

  

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search icon */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors" aria-label="Search">
            <Search className="h-5 w-5 text-[#111827]/60 dark:text-[#E5E7EB]/60" />
          </button>

          {/* Language switcher */}
          <LanguageSwitcher compact />

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="User menu"
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.firstName || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#2563EB]/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials()}
                </div>
              )}
              {!profilePictureUrl && null}
              <ChevronDown className={`w-3.5 h-3.5 text-[#111827]/40 dark:text-[#E5E7EB]/40 transition-transform duration-200 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[260px] bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3.5 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    {profilePictureUrl ? (
                      <img src={profilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#2563EB]/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {getInitials()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#111827]/70 dark:text-[#E5E7EB]/60 hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {t('nav.profile')}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#111827]/70 dark:text-[#E5E7EB]/60 hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('nav.settings')}
                  </Link>
                  <div className="my-1.5 border-t border-[#E5E7EB] dark:border-white/[0.06]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
