'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAnswerVaultStore } from '@/store/answerVaultStore';
import { syncVaultToExtension } from '@/lib/answerVault/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, Star } from 'lucide-react';
import { toast } from 'sonner';

export function FavoriteAnswersPreview() {
  const { initialize, initialized, answers, markUsed } = useAnswerVaultStore();

  useEffect(() => {
    initialize();
    syncVaultToExtension();
  }, [initialize]);

  if (!initialized) return null;

  const favorites = answers.filter((answer) => answer.favorite);

  const handleCopy = async (answerId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      markUsed(answerId);
      toast.success('Answer copied to clipboard');
    } catch {
      toast.error('Unable to copy answer');
    }
  };

  return (
    <div className="mt-6 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Favorite Answers</h3>
        </div>
        <Link
          href="/profile?tab=vault"
          className="text-xs font-medium text-[#2563EB] hover:underline"
        >
          Manage
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.10] p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">No favorite answers yet</p>
          <Link href="/profile?tab=vault">
            <Button variant="outline" size="sm" className="mt-3">
              Go to Answer Vault
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.slice(0, 4).map((answer) => (
            <div
              key={answer.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {answer.title}
                  </p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {answer.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                  {answer.content}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 h-8 w-8 p-0"
                onClick={() => handleCopy(answer.id, answer.content)}
                title="Copy answer"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {favorites.length > 4 && (
            <Link href="/profile?tab=vault" className="block text-xs text-center text-[#2563EB] hover:underline pt-1">
              +{favorites.length - 4} more favorites
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
