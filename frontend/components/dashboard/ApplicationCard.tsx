'use client';

import { Application } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface ApplicationCardProps {
  application: Application;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Applied: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  Pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  Interview: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  Accepted: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  Rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const colors = statusColors[application.status] || statusColors.Applied;
  const timeAgo = formatDistanceToNow(new Date(application.dateApplied), {
    addSuffix: true,
  });

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="p-4 hover:shadow-md transition-shadow bg-card hover:bg-card/80">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-foreground truncate">{application.company}</h3>
            <p className="text-sm text-muted-foreground truncate">{application.position}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <Badge
              variant="outline"
              className={`${colors.bg} ${colors.text} border-0`}
            >
              {application.status}
            </Badge>
          </div>

          {application.note && (
            <p className="text-xs text-muted-foreground line-clamp-2 hover:line-clamp-none transition-all">
              {application.note}
            </p>
          )}

          {application.priority && (
            <div className="flex justify-end">
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {application.priority}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
