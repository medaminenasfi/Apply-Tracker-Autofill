'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';
import {
  Zap, Brain, BarChart3, FileText, Download, ArrowRight,
  CheckCircle2, Star, ChevronDown, Sun, Moon, Menu, X,
  Sparkles, MousePointerClick, Upload, Bell, Shield,
  Plus, Calendar, LogOut, User
} from 'lucide-react';
import FeedbackButton from '@/components/feedback/FeedbackButton';

/* ── animation helpers ── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className={`bg-white dark:bg-white/[0.03] border rounded-xl overflow-hidden transition-colors duration-300 ${open ? 'border-[#2563EB]/40 dark:border-[#2563EB]/30' : 'border-[#E5E7EB] dark:border-white/10'}`}
    >
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full p-5 text-left text-sm font-semibold hover:text-[#2563EB] transition-colors">
        {q}
        <ChevronDown className={`w-4 h-4 shrink-0 ml-4 text-[#111827]/40 dark:text-[#E5E7EB]/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/60 leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'demo', label: 'Demo' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F9FAFB] dark:bg-[#020617] text-[#111827] dark:text-[#E5E7EB] transition-colors duration-300">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#E5E7EB] dark:border-white/10 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => scrollTo('hero')}>
              <img src="/logo.png" alt="ApplyFlow" className="h-9 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                ApplyFlow
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ id, label }) => (
                <button key={id} onClick={() => scrollTo(id)} className="px-3 py-1.5 text-[13px] font-medium rounded-lg text-[#111827]/60 dark:text-[#E5E7EB]/60 hover:text-[#2563EB] dark:hover:text-[#3B82F6] hover:bg-[#2563EB]/5 transition-all">
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg border border-[#E5E7EB] dark:border-white/10 hover:bg-[#E5E7EB]/50 dark:hover:bg-white/5 transition-colors" aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E5E7EB]/50 dark:hover:bg-white/5 transition-colors"
                  >
                    {user?.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.profilePictureUrl}`}
                        alt={user.firstName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#2563EB]/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold ${user?.profilePictureUrl ? 'hidden' : ''}`}>
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{user?.firstName || 'User'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/10 rounded-xl shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden z-50"
                      >
                        <div className="p-1">
                          <button
                            onClick={() => { router.push('/dashboard'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#111827]/70 dark:text-[#E5E7EB]/70 hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors text-left"
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </button>
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button onClick={() => router.push('/login')} className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-[#111827]/60 dark:text-[#E5E7EB]/60 hover:text-[#2563EB] transition-colors">
                    Login
                  </button>
                  <button onClick={() => router.push('/signup')} className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 transition-all duration-300">
                    Add to Chrome
                  </button>
                </>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-[#E5E7EB]/50 dark:hover:bg-white/5">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#020617]"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(({ id, label }) => (
                  <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm font-medium text-[#111827]/70 dark:text-[#E5E7EB]/70 hover:text-[#2563EB] py-2.5 px-3 rounded-lg hover:bg-[#2563EB]/5 transition-all">
                    {label}
                  </button>
                ))}
                <div className="pt-2 flex flex-col gap-2">
                  {!isAuthenticated && (
                    <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="text-sm font-medium text-center py-2.5 rounded-lg border border-[#E5E7EB] dark:border-white/10">
                      Login
                    </button>
                  )}
                  <button onClick={() => { router.push(isAuthenticated ? '/dashboard' : '/signup'); setMobileMenuOpen(false); }} className="text-sm font-semibold text-center text-white py-2.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
                    {isAuthenticated ? 'Dashboard' : 'Add to Chrome'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section id="hero" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_top,#0f172a,#020617)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent_70%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-xl lg:max-w-none">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/5 dark:bg-[#2563EB]/10 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#2563EB]">AI-Powered Job Application Assistant</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] tracking-tight">
                Apply Smarter.{' '}
                <span className="bg-[linear-gradient(90deg,#2563EB,#7C3AED)] bg-clip-text text-transparent">
                  Get Hired Faster.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-[#111827]/60 dark:text-[#E5E7EB]/50 leading-relaxed max-w-lg">
                ApplyFlowo automates job applications, autofills forms, and tracks your progress — so you focus on landing your dream job.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/signup')}
                  className="group relative px-6 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-[0_8px_30px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isAuthenticated ? 'Go to Dashboard' : "Add to Chrome — It's Free"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollTo('features')}
                  className="px-6 py-3.5 text-sm font-semibold rounded-xl border border-[#E5E7EB] dark:border-white/10 hover:bg-[#111827]/5 dark:hover:bg-white/5 transition-all duration-300 text-center"
                >
                  Learn More
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 space-y-3">
                {[
                  { icon: Zap, text: 'Autofill 50+ job websites instantly' },
                  { icon: Upload, text: 'Upload CV once, apply everywhere' },
                  { icon: BarChart3, text: 'Track interviews & offers visually' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                    </div>
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Floating UI Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[520px]">
                {/* Glow behind */}
                <div className="absolute inset-0 -m-8 bg-[radial-gradient(circle,rgba(59,130,246,0.15),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.1),transparent_70%)]" />

                {/* Browser card */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="absolute top-6 left-4 right-4 bg-white dark:bg-white/[0.04] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 shadow-[0_0_60px_rgba(59,130,246,0.12)] dark:shadow-[0_0_80px_rgba(59,130,246,0.08)] backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#E5E7EB]/50 dark:border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="ml-3 flex-1 h-7 rounded-lg bg-[#F3F4F6] dark:bg-white/5 flex items-center px-3">
                      <span className="text-[11px] text-[#111827]/30 dark:text-[#E5E7EB]/30 font-mono">linkedin.com/jobs/apply</span>
                    </div>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { label: 'Full Name', value: 'John Doe' },
                      { label: 'Email', value: 'john@example.com' },
                      { label: 'Resume', value: 'resume_2024.pdf' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="text-[11px] font-medium text-[#111827]/40 dark:text-[#E5E7EB]/40 mb-1 block">{label}</label>
                        <div className="h-9 rounded-lg bg-[#2563EB]/[0.04] dark:bg-[#2563EB]/10 border border-[#2563EB]/15 px-3 flex items-center text-sm text-[#2563EB] font-medium">
                          {value}
                          <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Auto Fill button */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-2 right-0"
                >
                  <div className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Auto Fill
                  </div>
                </motion.div>

                {/* Floating: CV Uploaded */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-28 -left-2 bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 rounded-xl p-3 shadow-lg dark:shadow-none backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">CV Uploaded</p>
                      <p className="text-[10px] text-[#111827]/40 dark:text-[#E5E7EB]/40">Ready to autofill</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating: Application Submitted */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute bottom-10 right-0 bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 rounded-xl p-3 shadow-lg dark:shadow-none backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Application Submitted!</p>
                      <p className="text-[10px] text-[#111827]/40 dark:text-[#E5E7EB]/40">Google — Software Engineer</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <Section id="features" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to land your dream job</h2>
            <p className="mt-4 text-base text-[#111827]/50 dark:text-[#E5E7EB]/50 max-w-2xl mx-auto">
              From autofilling forms to tracking interviews, ApplyFlowo handles it all.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap, title: 'Auto Apply', desc: 'Save hours of manual work. Apply to jobs with a single click.', bg: 'bg-[#2563EB]/10', iconColor: 'text-[#2563EB]' },
              { icon: Brain, title: 'Smart Autofill', desc: 'Fill job forms instantly with your saved profile data.', bg: 'bg-[#7C3AED]/10', iconColor: 'text-[#7C3AED]' },
              { icon: BarChart3, title: 'Track Progress', desc: 'Kanban board: Applied, Interview, Accepted — all visual.', bg: 'bg-cyan-500/10', iconColor: 'text-cyan-500' },
              { icon: FileText, title: 'CV Assistant', desc: 'Upload once, reuse everywhere. Your CV always ready.', bg: 'bg-pink-500/10', iconColor: 'text-pink-500' },
            ].map(({ icon: Icon, title, desc, bg, iconColor }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group relative p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#2563EB]/30 dark:hover:border-[#2563EB]/20 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] dark:hover:shadow-[0_20px_40px_rgba(37,99,235,0.05)] transition-all duration-300 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/50 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Section id="how-it-works" className="py-20 sm:py-28 bg-[#F3F4F6] dark:bg-[#0B1220] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-[#7C3AED] uppercase tracking-wider">How it Works</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Get started in 3 simple steps</h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#2563EB]/20 via-[#7C3AED]/20 to-[#2563EB]/20" />

            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              {[
                { step: '01', title: 'Install Extension', desc: 'Add ApplyFlowo to Chrome in one click. Setup takes 30 seconds.', icon: Download },
                { step: '02', title: 'Autofill Job Forms', desc: 'Visit any job site and click Auto Fill. We handle the rest.', icon: MousePointerClick },
                { step: '03', title: 'Track Applications', desc: 'View all applications on your Kanban dashboard. Stay organized.', icon: BarChart3 },
              ].map(({ step, title, desc, icon: Icon }) => (
                <motion.div key={step} variants={fadeUp} className="relative text-center">
                  <div className="relative z-10 inline-flex w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] items-center justify-center mb-5 shadow-[0_8px_30px_rgba(37,99,235,0.25)]">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-[#2563EB] tracking-wider mb-2">STEP {step}</div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/50 max-w-[260px] mx-auto">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════ DEMO ═══════════ */}
      <Section id="demo" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">Live Preview</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Your job search, beautifully organized</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="max-w-5xl mx-auto relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-[radial-gradient(circle,rgba(59,130,246,0.06),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.04),transparent_70%)] pointer-events-none" />

            <div className="relative bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.04)] dark:shadow-none backdrop-blur-xl">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]/50 dark:border-white/5">
                <h3 className="text-sm font-semibold">My Applications</h3>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    <Plus className="w-3 h-3" /> New application added
                  </div>
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                    <Calendar className="w-3 h-3" /> Interview scheduled
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { title: 'Applied', color: '#3B82F6', count: 12, jobs: [
                    { company: 'Google', role: 'Software Engineer', time: '2h ago' },
                    { company: 'Stripe', role: 'Frontend Dev', time: '5h ago' },
                    { company: 'Vercel', role: 'Full Stack', time: '1d ago' },
                  ] },
                  { title: 'Interview', color: '#F59E0B', count: 4, jobs: [
                    { company: 'Meta', role: 'React Developer', time: 'Tomorrow' },
                    { company: 'Netflix', role: 'UI Engineer', time: 'Next week' },
                  ] },
                  { title: 'Accepted', color: '#10B981', count: 2, jobs: [
                    { company: 'Linear', role: 'Design Engineer', time: 'Offer received' },
                  ] },
                ].map(({ title, color, count, jobs }) => (
                  <div key={title} className="rounded-xl bg-[#F9FAFB] dark:bg-white/[0.02] p-3.5 border border-[#E5E7EB]/50 dark:border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-sm">{title}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{count}</span>
                    </div>
                    <div className="space-y-2">
                      {jobs.map((job) => (
                        <div key={job.company} className="group/card bg-white dark:bg-white/[0.03] border border-[#E5E7EB]/50 dark:border-white/[0.06] rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                          <p className="text-sm font-semibold">{job.company}</p>
                          <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40">{job.role}</p>
                          <p className="text-[10px] font-medium mt-1" style={{ color }}>{job.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ REVIEWS ═══════════ */}
      <Section id="reviews" className="py-20 sm:py-28 bg-[#F3F4F6] dark:bg-[#0B1220] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-[#7C3AED] uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Loved by job seekers worldwide</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { name: 'Sarah Chen', role: 'Software Developer', text: 'Saved me 10+ hours per week on applications. The autofill is incredible — I just click and everything is filled perfectly.', avatar: 'SC' },
              { name: 'Marcus Johnson', role: 'Product Designer', text: "Best job automation tool I've ever used. The Kanban board keeps me so organized. Got 3 offers in one month!", avatar: 'MJ' },
              { name: 'Emma Williams', role: 'Data Analyst', text: 'The CV assistant is a game changer. Upload once and it works everywhere. Landed my dream job in 2 weeks.', avatar: 'EW' },
            ].map(({ name, role, text, avatar }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="bg-white dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-6 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(37,99,235,0.04)] transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#111827]/60 dark:text-[#E5E7EB]/50 leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
                    {avatar}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white dark:border-[#0B1220] flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-[#111827]/40 dark:text-[#E5E7EB]/40">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ FAQ ═══════════ */}
      <Section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'Is ApplyFlowo free?', a: 'Yes! The Chrome extension and basic features are completely free. We offer premium plans for power users who need advanced tracking and analytics.' },
              { q: 'Which job sites are supported?', a: 'ApplyFlowo works with 50+ job sites including LinkedIn, Indeed, Glassdoor, AngelList, and many more. We add new sites every week.' },
              { q: 'Is my data safe?', a: 'Absolutely. Your data is encrypted end-to-end. We never sell your data or share it with third parties. Your privacy is our top priority.' },
              { q: 'Can I use it on multiple devices?', a: 'Yes! Your account syncs across all devices. Install the extension on any Chrome browser and your data will be there.' },
            ].map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <Section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_60%)]" />
        </div>
        <motion.div variants={fadeUp} className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Start applying smarter today.</h2>
          <p className="text-base text-[#111827]/50 dark:text-[#E5E7EB]/50 mb-8 max-w-lg mx-auto">
            Join thousands of job seekers who save hours every week with ApplyFlowo.
          </p>
          <button
            onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/signup')}
            className="group relative px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-[0_8px_40px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isAuthenticated ? 'Go to Dashboard' : "Add to Chrome — It's Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-5 text-xs text-[#111827]/35 dark:text-[#E5E7EB]/35">No credit card required. Free forever for basic use.</p>
        </motion.div>
      </Section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 border-t border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#020617] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="ApplyFlow" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">ApplyFlow</span>
              </div>
              <p className="text-sm text-[#111827]/40 dark:text-[#E5E7EB]/40">Apply smarter. Get hired faster.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Chrome Extension', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-sm font-semibold mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[#111827]/40 dark:text-[#E5E7EB]/40 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-[#E5E7EB]/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#111827]/35 dark:text-[#E5E7EB]/35">&copy; {new Date().getFullYear()} ApplyFlow. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Twitter', 'GitHub', 'LinkedIn'].map((s) => (
                <a key={s} href="#" className="text-xs text-[#111827]/35 dark:text-[#E5E7EB]/35 hover:text-[#2563EB] transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <FeedbackButton />
    </div>
  );
}
