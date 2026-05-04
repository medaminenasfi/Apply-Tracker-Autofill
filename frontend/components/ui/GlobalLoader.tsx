'use client';

import { useLoadingStore } from '@/store/loadingStore';

export function GlobalLoader() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-10 h-10 rounded-full blur-lg opacity-25 bg-gradient-to-r from-[#2563EB] to-[#7C3AED]" />
        <div className="absolute w-12 h-12 rounded-full animate-spin border-2 border-transparent border-t-[#2563EB] border-r-[#7C3AED]" />
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#2563EB]/20">
          <span className="text-[9px] font-bold text-white tracking-tight">AF</span>
        </div>
      </div>
    </div>
  );
}
