'use client';

import { ApplicationStatus, Application } from '@/types';
import { ApplicationCard } from './ApplicationCard';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, CalendarClock, CheckCircle2, XCircle, Inbox } from 'lucide-react';

interface ApplicationColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  title: string;
}

const statusConfig: Record<ApplicationStatus, { icon: typeof Send; color: string; bg: string; glow: string }> = {
  applied:   { icon: Send,          color: '#2563EB', bg: 'rgba(37,99,235,0.12)',  glow: 'shadow-[0_0_12px_rgba(37,99,235,0.2)]' },
  interview: { icon: CalendarClock,  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]' },
  accepted:  { icon: CheckCircle2,   color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  glow: 'shadow-[0_0_12px_rgba(34,197,94,0.2)]' },
  rejected:  { icon: XCircle,        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  glow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]' },
};

export function ApplicationColumn({
  status,
  applications,
  title,
}: ApplicationColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
  });

  const count = applications.length;
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[200px] rounded-2xl p-4 transition-all duration-300 ${
        isOver
          ? 'bg-[#2563EB]/5 dark:bg-[#2563EB]/10 ring-2 ring-[#2563EB]/20'
          : 'bg-[#F8FAFC] dark:bg-white/[0.02]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E7EB]/50 dark:border-white/[0.06]">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-xl dark:${config.glow}`}
          style={{ backgroundColor: config.bg }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: config.color }} />
        </div>
        <h2 className="font-semibold text-sm">{title}</h2>
        <span
          className="ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {count}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        <AnimatePresence>
          {applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#111827]/5 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 text-[#111827]/20 dark:text-[#E5E7EB]/20" />
              </div>
              <p className="text-sm font-medium text-[#111827]/30 dark:text-[#E5E7EB]/25">No applications here yet</p>
              <p className="text-xs text-[#111827]/20 dark:text-[#E5E7EB]/15 mt-1">Drag applications here or add a new one</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
