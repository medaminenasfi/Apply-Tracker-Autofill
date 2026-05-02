'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSidebarStore } from '@/store/sidebarStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const { user } = useAuth();
  const { toggleCollapse } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState('');

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
    <header className="border-b bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-lg border bg-muted px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="border-0 bg-transparent placeholder-muted-foreground focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar className="h-8 w-8 cursor-pointer">
            {profilePictureUrl ? (
              <AvatarImage 
                src={profilePictureUrl} 
                alt="Profile" 
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
