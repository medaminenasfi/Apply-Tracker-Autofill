'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
  adminOnly?: boolean;
}

export default function FeedbackButton({ adminOnly = false }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Hide on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  // If adminOnly, only show for admin users
  if (adminOnly && user?.role !== 'admin') {
    return null;
  }

  // If not adminOnly, only show for non-admin users
  if (!adminOnly && user?.role === 'admin') {
    return null;
  }

  // Hide on admin routes
  if (isAdminRoute) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
        title={user ? "Send Feedback" : "Login to send feedback"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {user && <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
