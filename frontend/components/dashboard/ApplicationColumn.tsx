'use client';

import { ApplicationStatus, Application } from '@/types';
import { ApplicationCard } from './ApplicationCard';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { Empty } from '@/components/ui/empty';

interface ApplicationColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  title: string;
}

const statusIcons: Record<ApplicationStatus, string> = {
  Applied: '📨',
  Pending: '⏳',
  Interview: '🎤',
  Accepted: '✅',
  Rejected: '❌',
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

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-80 max-h-full gap-4 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-muted/50' : 'bg-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="sticky top-0 z-10 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{statusIcons[status]}</span>
          <h2 className="font-semibold text-lg">{title}</h2>
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
        <AnimatePresence>
          {applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Empty
                title={`No ${title.toLowerCase()}`}
                description="Drag applications here or add a new one"
                size="sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
