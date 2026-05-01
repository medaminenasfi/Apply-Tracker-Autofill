'use client';

import { ApplicationStatus } from '@/types';
import { ApplicationColumn } from './ApplicationColumn';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/hooks/useAuth';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { ApplicationCard } from './ApplicationCard';
import { motion } from 'framer-motion';

const STATUSES: { status: ApplicationStatus; title: string }[] = [
  { status: 'Applied', title: 'Applied' },
  { status: 'Pending', title: 'Pending Review' },
  { status: 'Interview', title: 'Interview' },
  { status: 'Accepted', title: 'Accepted' },
  { status: 'Rejected', title: 'Rejected' },
];

export function KanbanBoard() {
  const { user } = useAuth();
  const {
    applications,
    moveApplication,
    getApplicationsByStatus,
  } = useApplicationStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Filter applications for current user
  const userApplications = applications.filter((app) => app.userId === user?.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const getActiveApplication = () => {
    if (!activeId) return null;
    return userApplications.find((app) => app.id === activeId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const overStatus = String(over.id).replace('column-', '');
    const activeStatus = STATUSES.find((s) => s.status === overStatus);

    if (activeStatus && active.id !== over.id) {
      // Move card to new column
      moveApplication(String(active.id), activeStatus.status);
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const activeApplication = getActiveApplication();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="flex gap-6"
        >
          {STATUSES.map(({ status, title }) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ApplicationColumn
                status={status}
                title={title}
                applications={userApplications.filter((app) => app.status === status)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Drag Overlay - shows preview while dragging */}
      <DragOverlay>
        {activeApplication ? (
          <div className="opacity-75 shadow-lg">
            <ApplicationCard application={activeApplication} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
