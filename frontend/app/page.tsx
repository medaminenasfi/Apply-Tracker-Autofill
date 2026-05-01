'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Briefcase, TrendingUp, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (!first && !last) return '?';
    return `${first}${last}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Apply Tracker</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        {user?.profilePictureUrl ? (
                          <AvatarImage
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.profilePictureUrl}`}
                            alt="Profile"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push('/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Track Your Job Applications with Ease
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Stay organized, manage your applications, and land your dream job. 
            Apply Tracker helps you keep track of every step in your job search journey.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/signup')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Applications</h3>
            <p className="text-muted-foreground">
              Keep track of all your job applications in one place with status updates
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Monitor Progress</h3>
            <p className="text-muted-foreground">
              Visualize your application statistics and track your success rate
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
            <p className="text-muted-foreground">
              Manage your profile and keep all your information up to date
            </p>
          </div>
        </div>

        {/* Why Use This */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Why Use Apply Tracker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">⏱️ Save Time</h3>
              <p className="text-muted-foreground">
                Chrome extension autofills forms, saving hours on repetitive data entry
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">📋 Stay Organized</h3>
              <p className="text-muted-foreground">
                Kanban board keeps all applications organized by status in one place
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">📈 Track Progress</h3>
              <p className="text-muted-foreground">
                Visualize your job search journey with statistics and success metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
