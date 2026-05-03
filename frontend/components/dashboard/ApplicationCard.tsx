'use client';

import { Application, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Info, Edit, Check, Trash2, MessageSquare, Plus, MoreHorizontal, Send, CalendarClock, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { toast } from 'sonner';

interface ApplicationCardProps {
  application: Application;
}

const statusConfig: Record<string, { icon: typeof Send; color: string; bg: string; label: string }> = {
  applied:   { icon: Send,         color: '#2563EB', bg: 'rgba(37,99,235,0.12)',  label: 'Applied' },
  interview: { icon: CalendarClock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Interview' },
  accepted:  { icon: CheckCircle2,  color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  label: 'Accepted' },
  rejected:  { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Rejected' },
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application._id,
  });

  const [showDetails, setShowDetails] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const { updateApplication, fetchNotes, addNote, updateNoteById, deleteNoteById, getNotesByApplication } = useApplicationStore();

  const [localApplication, setLocalApplication] = useState(application);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setLocalApplication(application);
    console.log('Application prop changed, updating localApplication');
  }, [application]);

  useEffect(() => {
    // Fetch notes when component mounts or application changes
    fetchNotes(application._id).then(fetchedNotes => {
      setNotes(fetchedNotes);
      console.log('Fetched notes for card:', fetchedNotes);
    });
  }, [application._id, fetchNotes]);

  useEffect(() => {
    if (showNotesDialog) {
      // Fetch notes when dialog opens (refresh)
      fetchNotes(application._id).then(fetchedNotes => {
        setNotes(fetchedNotes);
        console.log('Fetched notes for dialog:', fetchedNotes);
      });
    }
  }, [showNotesDialog, application._id, fetchNotes]);

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const config = statusConfig[application.status] || statusConfig.applied;
  const StatusIcon = config.icon;
  const timeAgo = application.dateApplied ? formatDistanceToNow(new Date(application.dateApplied), {
    addSuffix: true,
  }) : 'No date';

  const lastNote = notes.length > 0 ? notes[0] : undefined;

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      // If editingNoteIndex is set, we're editing an existing note
      if (editingNoteIndex !== null && editingNoteIndex >= 0) {
        const note = notes[editingNoteIndex];
        await updateNoteById(note._id, noteText);
        // Refresh notes
        const updatedNotes = await fetchNotes(application._id);
        setNotes(updatedNotes);
      } else {
        // Adding a new note
        const newNote = await addNote(application._id, noteText);
        setNotes([newNote, ...notes]);
        toast.success('Note added successfully');
      }
      setIsEditingNote(false);
      setNoteText('');
      setEditingNoteIndex(null);
    } catch (error: any) {
      console.error('Failed to save note:', error);
      toast.error(error.message || 'Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCancelEdit = () => {
    setNoteText('');
    setIsEditingNote(false);
  };

  const handleEditNoteInDialog = (index: number) => {
    setEditingNoteIndex(index);
    setEditingNoteText(notes[index].text);
  };

  const handleSaveNoteInDialog = async () => {
    if (editingNoteIndex === null) return;
    setIsSavingNote(true);
    try {
      const note = notes[editingNoteIndex];
      const response = await updateNoteById(note._id, editingNoteText);
      console.log('After updateNoteById - response:', response);
      setEditingNoteIndex(null);
      setEditingNoteText('');
      // Update notes state
      setNotes(notes.map(n => n._id === note._id ? response : n));
      toast.success('Note updated successfully');
    } catch (error: any) {
      console.error('Failed to update note:', error);
      toast.error(error.message || 'Failed to update note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCancelNoteEdit = () => {
    setEditingNoteIndex(null);
    setEditingNoteText('');
  };

  const handleDeleteNote = async (index: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const note = notes[index];
      await deleteNoteById(note._id);
      console.log('After deleteNoteById - deleted note:', note._id);
      setNotes(notes.filter(n => n._id !== note._id));
      toast.success('Note deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      toast.error(error.message || 'Failed to delete note');
    }
  };

  return (
    <>
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
        <div className="group p-4 rounded-2xl bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.12] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-[#2563EB]/30 dark:hover:border-[#2563EB]/25 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:hover:bg-white/[0.10] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300">
          <div className="space-y-3">
            {/* Header: company + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white truncate">{application.companyName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{application.position}</p>
              </div>
              <button
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
              >
                <MoreHorizontal className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            {/* Status badge + time */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>

            {/* Note section */}
            <div className="pt-1 border-t border-slate-200 dark:border-white/[0.08]">
              {isEditingNote ? (
                <div className="space-y-2 mt-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="resize-none text-xs bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                      disabled={isSavingNote}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveNote(); }}
                      disabled={isSavingNote}
                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-[#2563EB] hover:bg-[#2563EB]/90 transition-colors disabled:opacity-50"
                    >
                      {isSavingNote ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 flex-1 leading-relaxed">
                    {lastNote?.text || 'No notes yet'}
                  </p>
                  <button
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteText('');
                      setIsEditingNote(true);
                    }}
                    title="Add new note"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Details Modal ── */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{application.companyName}</h3>
                  <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{application.position}</p>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors">
                  <X className="w-4 h-4 text-[#111827]/40 dark:text-[#E5E7EB]/40" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.03]">
                  <span className="text-xs font-medium text-[#111827]/40 dark:text-[#E5E7EB]/35 w-20">Status</span>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: config.bg, color: config.color }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.03]">
                  <span className="text-xs font-medium text-[#111827]/40 dark:text-[#E5E7EB]/35 w-20">Applied</span>
                  <span className="text-sm">
                    {application.dateApplied 
                      ? format(new Date(application.dateApplied), 'PPp')
                      : 'Not set'}
                  </span>
                </div>
                {application.jobUrl && application.jobUrl.trim() !== '' && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.03]">
                    <span className="text-xs font-medium text-[#111827]/40 dark:text-[#E5E7EB]/35 w-20">Job URL</span>
                    <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2563EB] hover:underline break-all truncate">
                      {application.jobUrl}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#111827]/40 dark:text-[#E5E7EB]/35 w-20">Notes</span>
                    <span className="text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => { setShowDetails(false); setShowNotesDialog(true); }}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes Modal ── */}
      {showNotesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNotesDialog(false)}>
          <div className="bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#2563EB]" />
                    All Notes
                  </h3>
                  <p className="text-sm text-[#111827]/50 dark:text-[#E5E7EB]/40">{localApplication.companyName} - {localApplication.position}</p>
                </div>
                <button onClick={() => setShowNotesDialog(false)} className="p-1.5 rounded-lg hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors">
                  <X className="w-4 h-4 text-[#111827]/40 dark:text-[#E5E7EB]/40" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#111827]/15 dark:text-[#E5E7EB]/15 mb-2" />
                  <p className="text-sm text-[#111827]/30 dark:text-[#E5E7EB]/25">No notes yet</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <div key={note._id} className="border border-[#E5E7EB] dark:border-white/[0.06] rounded-xl p-4 space-y-3 bg-[#F9FAFB] dark:bg-white/[0.02]">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-medium text-[#111827]/40 dark:text-[#E5E7EB]/35">
                        {format(new Date(note.createdAt), 'PPp')}
                      </p>
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-[#111827]/5 dark:hover:bg-white/[0.06] transition-colors"
                          onClick={() => handleEditNoteInDialog(index)}
                        >
                          <Edit className="h-3.5 w-3.5 text-[#111827]/40 dark:text-[#E5E7EB]/40" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          onClick={() => handleDeleteNote(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {editingNoteIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows={3}
                          className="resize-none text-sm bg-white dark:bg-white/[0.03] border-[#E5E7EB] dark:border-white/[0.08] rounded-xl"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelNoteEdit}
                            disabled={isSavingNote}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] dark:border-white/[0.08] hover:bg-[#111827]/5 dark:hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveNoteInDialog}
                            disabled={isSavingNote}
                            className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-[#2563EB] hover:bg-[#2563EB]/90 transition-colors disabled:opacity-50"
                          >
                            {isSavingNote ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap text-[#111827]/70 dark:text-[#E5E7EB]/60">{note.text}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
