'use client';

import { useEffect, useState } from 'react';
import '@/lib/i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved language from localStorage after mount
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      const i18n = require('@/lib/i18n').default;
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
