'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, Shield, MessageCircle, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from 'next-themes';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageCircle },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const adminLogout = useAuthStore((state) => state.adminLogout);
  const admin = useAuthStore((state) => state.admin);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await adminLogout();
    router.push('/admin/login');
  };

  const getInitials = () => {
    if (!admin) return 'A';
    const first = (admin as any).firstName?.[0] || '';
    const last = (admin as any).lastName?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  };

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#F9FAFB] dark:bg-[#020617] text-[#111827] dark:text-[#E5E7EB]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col h-screen shrink-0 w-[260px] border-r border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#020617]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-[72px] shrink-0 border-b border-[#E5E7EB] dark:border-white/[0.08]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent whitespace-nowrap">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 text-[#2563EB] dark:from-[#2563EB]/15 dark:to-[#7C3AED]/15 dark:text-[#3B82F6]'
                    : 'text-[#111827]/60 dark:text-[#E5E7EB]/50 hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#E5E7EB]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2563EB]" />
                )}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-[#3B82F6]' : ''}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#E5E7EB] dark:border-white/[0.08]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Mobile Drawer Sidebar ── */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-[#020617] border-r border-[#E5E7EB] dark:border-white/[0.08] shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-3 p-1.5 rounded-lg hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors z-10"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-[#111827]/50 dark:text-[#E5E7EB]/50" />
        </button>

        <div className="flex items-center gap-2.5 px-4 h-[72px] shrink-0 border-b border-[#E5E7EB] dark:border-white/[0.08]">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 text-[#2563EB] dark:from-[#2563EB]/15 dark:to-[#7C3AED]/15 dark:text-[#3B82F6]'
                    : 'text-[#111827]/60 dark:text-[#E5E7EB]/50 hover:bg-[#111827]/5 dark:hover:bg-white/[0.06]'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2563EB]" />}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-[#3B82F6]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#E5E7EB] dark:border-white/[0.08]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="sticky top-0 z-30 h-[72px] flex items-center shrink-0 border-b border-[#E5E7EB] dark:border-white/[0.08] bg-white/85 dark:bg-[#020617]/85 backdrop-blur-xl transition-colors">
          <div className="flex items-center justify-between gap-4 w-full px-4 sm:px-6">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-[#111827]/60 dark:text-[#E5E7EB]/60" />
              </button>
              <h1 className="text-lg font-semibold truncate">{title || 'Admin Dashboard'}</h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
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

              {/* Admin dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#111827]/40 dark:text-[#E5E7EB]/40 transition-transform duration-200 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                    <div className="px-4 py-3.5 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                      <p className="text-sm font-semibold truncate">{(admin as any)?.firstName || 'Admin'} {(admin as any)?.lastName || ''}</p>
                      <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40 truncate">{(admin as any)?.email || 'admin'}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
