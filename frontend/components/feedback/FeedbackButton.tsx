'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Upload, X as XIcon } from 'lucide-react';
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
  
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatPanelRef.current && !chatPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Add initial bot message if no messages
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            type: 'bot',
            content: 'Hi! How can we help you today?',
            timestamp: new Date(),
          },
        ]);
      }
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  // Hide on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  if (adminOnly && user?.role !== 'admin') {
    return null;
  }

  if (!adminOnly && user?.role === 'admin') {
    return null;
  }

  if (isAdminRoute) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setSelectedType(type);
    
    const typeMessages: Record<FeedbackType, string> = {
      [FeedbackType.BUG]: 'Please describe the bug you encountered. What steps can we take to reproduce it?',
      [FeedbackType.IMPROVEMENT]: 'What feature would you like to see? How would it help you?',
      [FeedbackType.GENERAL]: 'Please share your thoughts or suggestions with us.',
    };
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: type === FeedbackType.BUG ? 'Bug Report' : type === FeedbackType.IMPROVEMENT ? 'Feature Request' : 'General Feedback',
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: typeMessages[type],
        timestamp: new Date(),
      },
    ]);
    scrollToBottom();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and WebP images are allowed',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
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
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentData: string | undefined;
      
      if (image) {
        setIsUploading(true);
        try {
          attachmentData = await uploadImage(image);
        } catch (error) {
          toast({
            title: 'Upload failed',
            description: 'Failed to upload image',
            variant: 'destructive',
          });
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

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'user',
          content: message,
          timestamp: new Date(),
          attachment: attachmentData,
        },
      ]);

      // Add bot success message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "Thanks! Your feedback has been submitted.",
          timestamp: new Date(),
        },
      ]);

      // Reset form
      setMessage('');
      setRating(0);
      setImage(null);
      setImagePreview(null);
      setSelectedType(null);
      
      // Reset to show quick actions again after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: 'Is there anything else you would like to share?',
            timestamp: new Date(),
          },
        ]);
        scrollToBottom();
      }, 1000);
      
      scrollToBottom();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
        title={user ? "Send Feedback" : "Login to send feedback"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">ApplyFlow Assistant</h3>
                  <p className="text-blue-100 text-sm">Feedback & Support</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === 'bot'
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : msg.type === 'admin'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {msg.attachment && (
                      <img
                        src={msg.attachment}
                        alt="Attachment"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {imagePreview && (
                <div className="flex justify-start">
                  <div className="relative bg-white dark:bg-gray-700 rounded-2xl p-2 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg max-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {!selectedType && (
              <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">What can we help with?</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.BUG)}
                    className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Bug Report
                  </button>
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.IMPROVEMENT)}
                    className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => handleTypeSelect(FeedbackType.GENERAL)}
                    className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    General
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            {selectedType && (
              <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rate your experience <span className="text-red-500">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
                    placeholder="Describe your feedback..."
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="attachment"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="attachment"
                    className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Upload screenshot"
                  >
                    <Upload className="w-5 h-5" />
                  </label>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : isUploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        Send
                        <Send className="w-4 h-4" />
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
