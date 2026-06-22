'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Briefcase, User, Settings, Shield, Chrome, MessageSquare, X, BookOpen } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';
import { useTranslation } from 'react-i18next';

const navKeys = [
  { href: '/dashboard', key: 'nav.dashboard', icon: LayoutGrid },
  { href: '/applicant', key: 'nav.applications', icon: Briefcase },
  { href: '/profile', key: 'nav.profile', icon: User },
  { href: '/profile?tab=vault', key: 'nav.answerVault', icon: BookOpen },
  { href: '/feedback', key: 'nav.feedback', icon: MessageSquare },
  { href: '/extension', key: 'nav.extension', icon: Chrome },
  { href: '/settings', key: 'nav.settings', icon: Settings },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const navItems = navKeys.map(item => ({ ...item, label: t(item.key) }));
  const adminItems = user?.role === 'admin' ? [
    { href: '/admin', label: t('nav.adminPanel'), icon: Shield, key: 'nav.adminPanel' },
  ] : [];

  const allNavItems = [...navItems, ...adminItems];

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[72px] shrink-0 border-b border-[#E5E7EB] dark:border-white/[0.08]">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0"
        >
          <img src="/logo.png" alt="ApplyFlow" className="h-8 w-8 shrink-0 rounded-lg" />
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent whitespace-nowrap">
              ApplyFlow
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isVaultTab = searchParams.get('tab') === 'vault';
          const isActive =
            item.href === '/profile?tab=vault'
              ? pathname === '/profile' && isVaultTab
              : item.href === '/profile'
                ? pathname === '/profile' && !isVaultTab
                : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 text-[#2563EB] dark:from-[#2563EB]/15 dark:to-[#7C3AED]/15 dark:text-[#3B82F6]'
                  : 'text-[#111827]/60 dark:text-[#E5E7EB]/50 hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#E5E7EB]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2563EB]" />
              )}
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-[#3B82F6]' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#111827] dark:bg-[#1E293B] text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Desktop Sidebar ── */
export function Sidebar() {
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen shrink-0 border-r border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#020617] transition-[width] duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <SidebarContent collapsed={isCollapsed} />
    </aside>
  );
}

/* ── Mobile Drawer Sidebar ── */
export function MobileSidebar() {
  const { isOpen, closeMobile } = useSidebarStore();

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-[#020617] border-r border-[#E5E7EB] dark:border-white/[0.08] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={closeMobile}
          className="absolute top-5 right-3 p-1.5 rounded-lg hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors z-10"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-[#111827]/50 dark:text-[#E5E7EB]/50" />
        </button>

        <SidebarContent collapsed={false} onNavigate={closeMobile} />
      </aside>
    </>
  );
}
