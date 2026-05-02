'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, LayoutGrid, Briefcase, User, Settings, Shield, Chrome } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, collapseSidebar } = useSidebarStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavClick = () => {
    // Auto-collapse on navigation
    if (!isCollapsed) {
      collapseSidebar();
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/applicant', label: 'Applications', icon: Briefcase },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/extension', label: 'Extension', icon: Chrome },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminItems = user?.role === 'admin' ? [
    { href: '/admin', label: 'Admin Panel', icon: Shield },
  ] : [];

  const allNavItems = [...navItems, ...adminItems];

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (!first && !last) return '?';
    return `${first}${last}`.toUpperCase();
  };

  // Add cache-busting parameter to force image reload
  const profilePictureUrl = user?.profilePictureUrl 
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.profilePictureUrl}?t=${user.profilePictureUpdatedAt || Date.now()}`
    : null;

  return (
    <aside className={`flex h-screen flex-col border-r bg-card text-card-foreground transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
            AF
          </div>
          {!isCollapsed && <span>ApplyFlow</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 transition-all duration-300 ${
                        isCollapsed ? 'px-2' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* User Menu */}
      <div className="border-t px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`w-full justify-between transition-all duration-300 ${
              isCollapsed ? 'px-2' : ''
            }`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {profilePictureUrl ? (
                    <AvatarImage 
                      src={profilePictureUrl} 
                      alt="Profile" 
                    />
                  ) : null}
                  <AvatarFallback className="text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className={`text-left transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                  <p className="text-sm font-medium">{user?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              {!isCollapsed && <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
