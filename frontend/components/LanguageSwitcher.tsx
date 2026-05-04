'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  const currentLang = i18n.language === 'fr' ? 'FR' : 'EN';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors ${
          compact ? 'w-10 h-10' : 'h-10 px-3'
        }`}
        aria-label={t('language.changeLanguage')}
      >
        <Globe className="h-4 w-4 text-[#111827]/60 dark:text-[#E5E7EB]/60" />
        {!compact && (
          <span className="text-xs font-semibold text-[#111827]/70 dark:text-[#E5E7EB]/70">
            {currentLang}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[140px] bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50">
          <div className="p-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === 'en'
                  ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#3B82F6]'
                  : 'text-[#111827]/70 dark:text-[#E5E7EB]/60 hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">🇬🇧</span>
              English
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === 'fr'
                  ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#3B82F6]'
                  : 'text-[#111827]/70 dark:text-[#E5E7EB]/60 hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">🇫🇷</span>
              Français
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
