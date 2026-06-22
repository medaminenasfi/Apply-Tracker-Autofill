'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAnswerVaultStore } from '@/store/answerVaultStore';
import { syncVaultToExtension } from '@/lib/answerVault/storage';
import { PREDEFINED_CATEGORIES, CUSTOM_CATEGORY_LABEL } from '@/lib/answerVault/constants';
import type { VaultAnswer } from '@/types/answerVault';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BookOpen,
  Copy,
  Clock,
  Edit,
  Files,
  Plus,
  Search,
  Star,
  Trash2,
  MessageSquareText,
} from 'lucide-react';

type FormState = {
  title: string;
  category: string;
  customCategory: string;
  content: string;
  favorite: boolean;
};

const emptyForm: FormState = {
  title: '',
  category: PREDEFINED_CATEGORIES[0],
  customCategory: '',
  content: '',
  favorite: false,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AnswerVaultSection() {
  const {
    initialize,
    initialized,
    answers,
    recent,
    searchQuery,
    categoryFilter,
    showFavoritesOnly,
    setSearchQuery,
    setCategoryFilter,
    setShowFavoritesOnly,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    duplicateAnswer,
    toggleFavorite,
    markUsed,
    getFilteredAnswers,
    getCustomCategories,
  } = useAnswerVaultStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<VaultAnswer | null>(null);
  const [deletingAnswer, setDeletingAnswer] = useState<VaultAnswer | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    initialize();
    syncVaultToExtension();
  }, [initialize]);

  const customCategories = getCustomCategories();
  const categoryOptions = useMemo(
    () => [...PREDEFINED_CATEGORIES, ...customCategories, CUSTOM_CATEGORY_LABEL],
    [customCategories],
  );

  const filteredAnswers = getFilteredAnswers();
  const favoriteAnswers = answers.filter((answer) => answer.favorite);
  const recentAnswers = recent
    .map((entry) => answers.find((answer) => answer.id === entry.answerId))
    .filter((answer): answer is VaultAnswer => Boolean(answer));

  const resolvedCategory =
    form.category === CUSTOM_CATEGORY_LABEL
      ? form.customCategory.trim() || CUSTOM_CATEGORY_LABEL
      : form.category;

  const openCreateDialog = () => {
    setEditingAnswer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (answer: VaultAnswer) => {
    const isCustom = !PREDEFINED_CATEGORIES.includes(answer.category as (typeof PREDEFINED_CATEGORIES)[number]);
    setEditingAnswer(answer);
    setForm({
      title: answer.title,
      category: isCustom ? CUSTOM_CATEGORY_LABEL : answer.category,
      customCategory: isCustom ? answer.category : '',
      content: answer.content,
      favorite: answer.favorite,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and answer content are required');
      return;
    }
    if (form.category === CUSTOM_CATEGORY_LABEL && !form.customCategory.trim()) {
      toast.error('Please enter a custom category name');
      return;
    }

    const payload = {
      title: form.title,
      category: resolvedCategory,
      content: form.content,
      favorite: form.favorite,
    };

    if (editingAnswer) {
      updateAnswer(editingAnswer.id, payload);
      toast.success('Answer updated');
    } else {
      createAnswer(payload);
      toast.success('Answer created');
    }

    setDialogOpen(false);
    setEditingAnswer(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!deletingAnswer) return;
    deleteAnswer(deletingAnswer.id);
    toast.success('Answer deleted');
    setDeleteDialogOpen(false);
    setDeletingAnswer(null);
  };

  const handleCopy = async (answer: VaultAnswer) => {
    try {
      await navigator.clipboard.writeText(answer.content);
      markUsed(answer.id);
      toast.success('Answer copied to clipboard');
    } catch {
      toast.error('Unable to copy answer');
    }
  };

  if (!initialized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Answer Vault</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Save pre-written interview answers and insert them quickly while applying.
              </p>
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Answer
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or content..."
              className="pl-9 border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]"
            />
          </div>
          <Button
            type="button"
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="border-slate-200 dark:border-white/[0.10]"
          >
            <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </Button>
          {categoryOptions.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {(favoriteAnswers.length > 0 || recentAnswers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favoriteAnswers.length > 0 && (
            <VaultQuickList
              title="Favorites"
              icon={<Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
              answers={favoriteAnswers.slice(0, 5)}
              onCopy={handleCopy}
            />
          )}
          {recentAnswers.length > 0 && (
            <VaultQuickList
              title="Recently Used"
              icon={<Clock className="h-4 w-4 text-slate-400" />}
              answers={recentAnswers.slice(0, 5)}
              onCopy={handleCopy}
            />
          )}
        </div>
      )}

      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] text-center bg-white dark:bg-[#0B1220]">
            <MessageSquareText className="h-10 w-10 mx-auto text-slate-400 mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">No answers yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create your first saved answer for common interview questions.
            </p>
            <Button onClick={openCreateDialog} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Answer
            </Button>
          </div>
        ) : (
          filteredAnswers.map((answer) => (
            <div
              key={answer.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{answer.title}</h3>
                    <Badge variant="outline">{answer.category}</Badge>
                    {answer.favorite && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Last updated {formatDate(answer.updatedAt)}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 whitespace-pre-wrap line-clamp-4">
                    {answer.content}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleCopy(answer)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => toggleFavorite(answer.id)}>
                    <Star className={`h-4 w-4 ${answer.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(answer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => duplicateAnswer(answer.id)}>
                    <Files className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 dark:border-red-500/20"
                    onClick={() => {
                      setDeletingAnswer(answer);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220]">
          <DialogHeader>
            <DialogTitle>{editingAnswer ? 'Edit Answer' : 'Create Answer'}</DialogTitle>
            <DialogDescription>
              Save a reusable answer for interview forms and application questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Junior Developer Intro"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.category === CUSTOM_CATEGORY_LABEL && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom Category</label>
                <Input
                  value={form.customCategory}
                  onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
                  placeholder="Salary Expectations"
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Answer Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your saved answer here..."
                className="mt-1.5 min-h-[180px]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.favorite}
                onChange={(e) => setForm((prev) => ({ ...prev, favorite: e.target.checked }))}
              />
              Mark as favorite
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingAnswer ? 'Save Changes' : 'Create Answer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Answer</DialogTitle>
            <DialogDescription>
              Delete &quot;{deletingAnswer?.title}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VaultQuickList({
  title,
  icon,
  answers,
  onCopy,
}: {
  title: string;
  icon: React.ReactNode;
  answers: VaultAnswer[];
  onCopy: (answer: VaultAnswer) => void;
}) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220]">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {answers.map((answer) => (
          <Button key={answer.id} size="sm" variant="outline" onClick={() => onCopy(answer)}>
            {answer.title}
          </Button>
        ))}
      </div>
    </div>
  );
}
