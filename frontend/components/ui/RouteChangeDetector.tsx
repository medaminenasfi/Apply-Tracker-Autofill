'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoadingStore } from '@/store/loadingStore';

export function RouteChangeDetector() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setLoading = useLoadingStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);
  }, [pathname, searchParams, setLoading]);

  return null;
}
