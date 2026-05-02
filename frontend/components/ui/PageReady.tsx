'use client';

import { useEffect } from 'react';
import { useLoadingStore } from '@/store/loadingStore';

export function RefreshDetector() {
  const setLoading = useLoadingStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);
    // Hide spinner after page renders
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return null;
}

