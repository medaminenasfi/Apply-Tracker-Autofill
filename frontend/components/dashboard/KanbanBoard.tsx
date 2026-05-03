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
import { toast } from 'sonner';

const STATUSES: { status: ApplicationStatus; title: string }[] = [
  { status: 'applied', title: 'Applied' },
  { status: 'interview', title: 'Interview' },
  { status: 'accepted', title: 'Accepted' },
  { status: 'rejected', title: 'Rejected' },
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
  const userApplications = applications.filter((app) => app.userId === user?._id || app.userId === user?.userId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getActiveApplication = () => {
    if (!activeId) return null;
    return userApplications.find((app) => app._id === activeId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Only used for collision detection, no action needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const overStatus = String(over.id).replace('column-', '');
    const activeStatus = STATUSES.find((s) => s.status === overStatus);

    if (activeStatus && active.id !== over.id) {
      // Move card to new column via API
      try {
        await moveApplication(String(active.id), activeStatus.status);
        toast.success(`Application moved to ${activeStatus.title}`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to move application');
      }
    }

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
