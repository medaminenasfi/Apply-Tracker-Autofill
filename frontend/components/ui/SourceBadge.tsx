'use client';

import { User, Zap } from 'lucide-react';

interface SourceBadgeProps {
  source?: 'manual' | 'extension';
}

export function SourceBadge({ source = 'manual' }: SourceBadgeProps) {
  const isManual = source === 'manual';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${
        isManual
          ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10'
          : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30'
      }`}
      title={isManual ? 'Added manually from dashboard' : 'Saved using Chrome extension'}
    >
      {isManual ? (
        <User className="w-3 h-3" />
      ) : (
        <Zap className="w-3 h-3" />
      )}
      <span className="font-medium">{isManual ? 'Manual' : 'Extension'}</span>
    </div>
  );
}
