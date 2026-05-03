'use client';

import { ReactNode } from 'react';
import { Zap, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  variant: 'login' | 'signup' | 'forgot-password';
}

const panelContent = {
  login: {
    heading: 'Welcome back.',
    subheading: 'Continue applying smarter.',
  },
  signup: {
    heading: 'Create your job search hub.',
    subheading: 'Start autofilling and tracking today.',
  },
  'forgot-password': {
    heading: 'Recover your access.',
    subheading: "We\u0027ll help you get back in securely.",
  },
};

const features = [
  { icon: Zap, label: 'Smart Autofill' },
  { icon: FileText, label: 'CV Assistant' },
  { icon: BarChart3, label: 'Track Applications' },
];

export function AuthLayout({ children, variant }: AuthLayoutProps) {
  const content = panelContent[variant];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_top,#EEF2FF,#F8FAFC)] dark:bg-[radial-gradient(circle_at_top,#0f172a,#020617)] transition-colors duration-300">
      <div className="w-full max-w-[1050px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/[0.08] flex flex-col lg:flex-row bg-white dark:bg-[#0B1220]">

        {/* ═══ LEFT VISUAL PANEL ═══ */}
        <div className="relative w-full lg:w-[420px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-8 sm:p-10 flex flex-col justify-between min-h-[180px] lg:min-h-[580px]">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />

          {/* Top: Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                AF
              </div>
              <span className="text-lg font-bold text-white">ApplyFlow</span>
            </Link>
          </div>

          {/* Center: Heading + Features (hidden on mobile, shown on lg) */}
          <div className="relative z-10 hidden lg:block">
            <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-2">
              {content.heading}
            </h2>
            <p className="text-white/70 text-sm mb-8">{content.subheading}</p>

            <div className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: compact heading */}
          <div className="relative z-10 lg:hidden mt-4">
            <h2 className="text-xl font-bold text-white leading-tight">
              {content.heading}
            </h2>
            <p className="text-white/70 text-sm">{content.subheading}</p>
          </div>

          {/* Bottom spacer for lg */}
          <div className="relative z-10 hidden lg:block">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} ApplyFlow</p>
          </div>
        </div>

        {/* ═══ RIGHT FORM PANEL ═══ */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto bg-white dark:bg-[#0B1220]">
          {children}
        </div>
      </div>
    </div>
  );
}
