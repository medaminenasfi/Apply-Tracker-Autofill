'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { AppLoader } from '@/components/ui/AppLoader';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token in cookie (will be used by API calls)
      document.cookie = `user_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=lax`;

      // Fetch user profile and set auth state
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-app-role': 'user',
        },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((user) => {
          setUser(user);
          useAuthStore.setState({ isAuthenticated: true });
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error);
          router.push('/login?error=auth_failed');
        });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, setUser]);

  return <AppLoader variant="fullscreen" text={t('auth.completingSignIn')} />;
}

function LoadingFallback() {
  const { t } = useTranslation();
  return <AppLoader variant="fullscreen" text={t('common.loading')} />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
