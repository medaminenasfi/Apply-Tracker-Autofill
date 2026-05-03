'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageCircle, X, Send, Upload, Bug, Sparkles, MessageSquare,
  Bot, Loader2, Paperclip, FileImage,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { feedbackApi, FeedbackType } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/ui/StarRating';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackButtonProps {
  adminOnly?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'admin';
  content: string;
  timestamp: Date;
  attachment?: string;
}

const MAX_CHARS = 500;

export default function FeedbackButton({ adminOnly = false }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Initial bot message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: 'Hi! 👋 How can we help you today?',
          timestamp: new Date(),
        },
      ]);
    }
    if (isOpen) scrollToBottom();
  }, [isOpen, messages.length, scrollToBottom]);

  // Visibility guards
  const isAdminRoute = pathname?.startsWith('/admin');
  if (adminOnly && user?.role !== 'admin') return null;
  if (!adminOnly && user?.role === 'admin') return null;
  if (isAdminRoute) return null;

  const handleClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setSelectedType(type);
    const typeLabels: Record<FeedbackType, string> = {
      [FeedbackType.BUG]: 'Bug Report',
      [FeedbackType.IMPROVEMENT]: 'Feature Request',
      [FeedbackType.GENERAL]: 'General Feedback',
    };
    const typeMessages: Record<FeedbackType, string> = {
      [FeedbackType.BUG]: 'Please describe the bug you encountered. What steps can we take to reproduce it?',
      [FeedbackType.IMPROVEMENT]: 'What feature would you like to see? How would it help you?',
      [FeedbackType.GENERAL]: 'Please share your thoughts or suggestions with us.',
    };
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'user', content: typeLabels[type], timestamp: new Date() },
      { id: (Date.now() + 1).toString(), type: 'bot', content: typeMessages[type], timestamp: new Date() },
    ]);
    scrollToBottom();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Only JPG, PNG, and WebP images are allowed', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/feedback/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: 'Error', description: 'Please enter a message', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Error', description: 'Please select a rating', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      let attachmentData: string | undefined;
      if (image) {
        setIsUploading(true);
        try {
          attachmentData = await uploadImage(image);
        } catch {
          toast({ title: 'Upload failed', description: 'Failed to upload image', variant: 'destructive' });
          return;
        } finally {
          setIsUploading(false);
        }
      }
      await feedbackApi.create({
        type: selectedType || FeedbackType.GENERAL,
        message,
        rating,
        attachment: attachmentData,
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: message, timestamp: new Date(), attachment: attachmentData },
        { id: (Date.now() + 1).toString(), type: 'bot', content: '✅ Thanks! Your feedback has been submitted successfully.', timestamp: new Date() },
      ]);
      setMessage('');
      setRating(0);
      setImage(null);
      setImagePreview(null);
      setSelectedType(null);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 2).toString(), type: 'bot', content: 'Is there anything else you would like to share?', timestamp: new Date() },
        ]);
        scrollToBottom();
      }, 1200);
      scrollToBottom();
    } catch {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        ref={fabRef}
        onClick={handleClick}
        aria-label={isOpen ? 'Close feedback' : 'Open feedback'}
        className={`fixed bottom-5 right-5 z-[60] p-3.5 rounded-full text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,99,235,0.5)] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] ${
          !isOpen ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''
        }`}
        title={user ? 'Send Feedback' : 'Login to send feedback'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[60] flex flex-col overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] bottom-[4.5rem] right-5 w-[420px] max-w-[calc(100vw-2rem)] max-h-[620px] sm:max-h-[620px] max-[640px]:left-4 max-[640px]:right-4 max-[640px]:w-auto max-[640px]:bottom-[4.5rem] max-[640px]:max-h-[85vh]"
          >
            {/* ── Header ── */}
            <div className="shrink-0 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] text-white leading-tight">ApplyFlow Assistant</h3>
                  <p className="text-[11px] text-white/70">Feedback &amp; Support</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50 dark:bg-[#020617] scroll-smooth">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot avatar */}
                  {msg.type !== 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white rounded-br-md'
                        : msg.type === 'admin'
                        ? 'bg-[#7C3AED]/10 dark:bg-[#7C3AED]/15 border border-[#7C3AED]/20 dark:border-[#7C3AED]/15 text-slate-800 dark:text-slate-200 rounded-bl-md'
                        : 'bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-md'
                    }`}
                  >
                    {msg.attachment && (
                      <img src={msg.attachment} alt="Attachment" className="rounded-lg mb-2 max-w-full" />
                    )}
                    <p className="text-[13px] leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Image preview inline */}
              {imagePreview && (
                <div className="flex justify-end">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1]">
                    <img src={imagePreview} alt="Preview" className="max-w-[180px] rounded-xl" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Actions (step 1) ── */}
            {!selectedType && (
              <div className="shrink-0 px-4 py-3.5 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0B1220]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">What can we help with?</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.BUG)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-100 dark:border-red-500/[0.12] hover:border-red-300 dark:hover:border-red-500/25 hover:-translate-y-0.5 transition-all duration-200"
                    aria-label="Bug Report"
                  >
                    <Bug className="w-4.5 h-4.5 text-[#EF4444]" />
                    <span className="text-[11px] font-semibold text-[#EF4444]">Bug Report</span>
                  </button>
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.IMPROVEMENT)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-50 dark:bg-[#7C3AED]/[0.08] border border-purple-100 dark:border-[#7C3AED]/[0.12] hover:border-purple-300 dark:hover:border-[#7C3AED]/25 hover:-translate-y-0.5 transition-all duration-200"
                    aria-label="Feature Request"
                  >
                    <Sparkles className="w-4.5 h-4.5 text-[#7C3AED]" />
                    <span className="text-[11px] font-semibold text-[#7C3AED]">Feature</span>
                  </button>
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.GENERAL)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-[#2563EB]/[0.08] border border-blue-100 dark:border-[#2563EB]/[0.12] hover:border-blue-300 dark:hover:border-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-200"
                    aria-label="General Feedback"
                  >
                    <MessageSquare className="w-4.5 h-4.5 text-[#2563EB]" />
                    <span className="text-[11px] font-semibold text-[#2563EB]">General</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Input Area (step 2+) ── */}
            {selectedType && (
              <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0B1220] px-4 py-3 space-y-3">
                {/* Star rating */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rating</span>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                {/* Textarea + actions */}
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
                    }}
                    rows={3}
                    className="w-full px-3.5 py-2.5 pr-10 text-[13px] rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40 resize-none transition-all"
                    placeholder="Describe your feedback..."
                  />
                  <span className={`absolute bottom-2 right-3 text-[10px] tabular-nums ${message.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {message.length}/{MAX_CHARS}
                  </span>
                </div>

                {/* File name preview */}
                {image && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <FileImage className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1">{image.name}</span>
                    <button type="button" onClick={handleRemoveImage} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors" aria-label="Remove file">
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="feedback-attachment"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="feedback-attachment"
                    className="cursor-pointer p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                    title="Attach screenshot (JPG, PNG, WebP — max 5MB)"
                    aria-label="Attach screenshot"
                  >
                    <Paperclip className="w-4 h-4" />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !message.trim() || rating === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300"
                    aria-label="Submit feedback"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        Send Feedback
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
