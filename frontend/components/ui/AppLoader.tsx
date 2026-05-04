'use client';

import { cn } from '@/lib/utils';

/**
 * ApplyFlow premium loader system.
 *
 * Variants:
 *  - "fullscreen"  → fixed overlay covering the viewport
 *  - "section"     → centered inside a parent container
 *  - "inline"      → small inline spinner (for buttons / text)
 *
 * All variants support dark/light mode automatically.
 */

interface AppLoaderProps {
  variant?: 'fullscreen' | 'section' | 'inline';
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function GradientSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const glowDims = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div
        className={cn(
          'absolute rounded-full blur-xl opacity-25',
          glowDims[size],
          'bg-gradient-to-r from-[#2563EB] to-[#7C3AED]'
        )}
      />

      {/* Spinning ring */}
      <div
        className={cn(
          'rounded-full animate-spin',
          dims[size],
          'border-[2.5px] border-transparent',
          'border-t-[#2563EB] border-r-[#7C3AED]'
        )}
      />
    </div>
  );
}

export function AppLoader({
  variant = 'section',
  text,
  className,
  size = 'md',
}: AppLoaderProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-transparent border-t-[#2563EB] border-r-[#7C3AED]',
            size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
          )}
        />
        {text && <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[100] flex flex-col items-center justify-center',
          'bg-[#F8FAFC]/85 dark:bg-[#020617]/85 backdrop-blur-sm',
          className
        )}
      >
        <GradientSpinner size={size === 'sm' ? 'md' : 'lg'} />
        {text && (
          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // section (default)
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16',
        className
      )}
    >
      <GradientSpinner size={size} />
      {text && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Button spinner – tiny inline spinner for inside buttons.
 * Drop-in replacement for the old <Spinner /> in buttons.
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white/30 border-t-white',
        'w-4 h-4',
        className
      )}
    />
  );
}
