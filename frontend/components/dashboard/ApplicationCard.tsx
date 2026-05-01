'use client';

import { Application, Note } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Info, Edit, Check, Trash2, MessageSquare, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApplicationStore } from '@/store/applicationStore';

interface ApplicationCardProps {
  application: Application;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  applied: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  interview: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  accepted: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
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

  const colors = statusColors[application.status] || statusColors.Applied;
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
      }
      setIsEditingNote(false);
      setNoteText('');
      setEditingNoteIndex(null);
    } catch (error) {
      console.error('Failed to save note:', error);
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
    } catch (error) {
      console.error('Failed to update note:', error);
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
    } catch (error) {
      console.error('Failed to delete note:', error);
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
        <Card className="p-4 hover:shadow-md transition-shadow bg-card hover:bg-card/80">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{application.companyName}</h3>
                <p className="text-sm text-muted-foreground truncate">{application.position}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
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

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Note</p>
              {isEditingNote ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="resize-none text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      disabled={isSavingNote}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveNote();
                      }}
                      disabled={isSavingNote}
                    >
                      {isSavingNote ? 'Saving...' : <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {lastNote?.text || 'No note'}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteText('');
                        setIsEditingNote(true);
                      }}
                      title="Add new note"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Application Details</h3>
                <p className="text-sm text-muted-foreground">ID: {application._id}</p>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm">{application.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p className="text-sm">{application.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={`${colors.bg} ${colors.text} border-0`}>
                    {application.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Date Applied</p>
                  <p className="text-sm">{application.dateApplied ? new Date(application.dateApplied).toLocaleDateString() : 'Not set'}</p>
                </div>
                {application.jobUrl && application.jobUrl.trim() !== '' && (
                  <div>
                    <p className="text-sm font-medium">Job URL</p>
                    <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                      {application.jobUrl}
                    </a>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Notes ({notes.length})</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDetails(false);
                        setShowNotesDialog(true);
                      }}
                    >
                      View All
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowDetails(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNotesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNotesDialog(false)}>
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    All Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">{localApplication.companyName} - {localApplication.position}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNotesDialog(false)}>
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
              ) : (
                <>
                  {notes.map((note, index) => (
                    <div key={note._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium text-muted-foreground">
                          {format(new Date(note.createdAt), 'PPp')}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditNoteInDialog(index)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteNote(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingNoteIndex === index ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelNoteEdit}
                              disabled={isSavingNote}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveNoteInDialog}
                              disabled={isSavingNote}
                            >
                              {isSavingNote ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
