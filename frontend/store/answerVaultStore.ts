import { create } from 'zustand';
import type { VaultAnswer, VaultAnswerInput, VaultRecentEntry } from '@/types/answerVault';
import {
  generateAnswerId,
  loadRecentAnswers,
  loadVaultAnswers,
  recordRecentUsage,
  saveVaultAnswers,
} from '@/lib/answerVault/storage';

interface AnswerVaultState {
  answers: VaultAnswer[];
  recent: VaultRecentEntry[];
  searchQuery: string;
  categoryFilter: string;
  showFavoritesOnly: boolean;
  initialized: boolean;
  initialize: () => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setShowFavoritesOnly: (value: boolean) => void;
  createAnswer: (input: VaultAnswerInput) => VaultAnswer;
  updateAnswer: (id: string, input: VaultAnswerInput) => VaultAnswer | null;
  deleteAnswer: (id: string) => void;
  duplicateAnswer: (id: string) => VaultAnswer | null;
  toggleFavorite: (id: string) => void;
  markUsed: (id: string) => void;
  getFilteredAnswers: () => VaultAnswer[];
  getCustomCategories: () => string[];
}

function persist(answers: VaultAnswer[]) {
  saveVaultAnswers(answers);
}

export const useAnswerVaultStore = create<AnswerVaultState>((set, get) => ({
  answers: [],
  recent: [],
  searchQuery: '',
  categoryFilter: 'all',
  showFavoritesOnly: false,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    set({
      answers: loadVaultAnswers(),
      recent: loadRecentAnswers(),
      initialized: true,
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setShowFavoritesOnly: (value) => set({ showFavoritesOnly: value }),

  createAnswer: (input) => {
    const now = new Date().toISOString();
    const answer: VaultAnswer = {
      id: generateAnswerId(),
      title: input.title.trim(),
      category: input.category.trim(),
      content: input.content.trim(),
      favorite: input.favorite ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const answers = [answer, ...get().answers];
    persist(answers);
    set({ answers });
    return answer;
  },

  updateAnswer: (id, input) => {
    let updated: VaultAnswer | null = null;
    const answers = get().answers.map((answer) => {
      if (answer.id !== id) return answer;
      updated = {
        ...answer,
        title: input.title.trim(),
        category: input.category.trim(),
        content: input.content.trim(),
        favorite: input.favorite ?? answer.favorite,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    if (!updated) return null;
    persist(answers);
    set({ answers });
    return updated;
  },

  deleteAnswer: (id) => {
    const answers = get().answers.filter((answer) => answer.id !== id);
    persist(answers);
    set({ answers });
  },

  duplicateAnswer: (id) => {
    const source = get().answers.find((answer) => answer.id === id);
    if (!source) return null;
    return get().createAnswer({
      title: `${source.title} (Copy)`,
      category: source.category,
      content: source.content,
      favorite: false,
    });
  },

  toggleFavorite: (id) => {
    const answers = get().answers.map((answer) =>
      answer.id === id
        ? { ...answer, updatedAt: new Date().toISOString(), favorite: !answer.favorite }
        : answer,
    );
    persist(answers);
    set({ answers });
  },

  markUsed: (id) => {
    recordRecentUsage(id);
    set({ recent: loadRecentAnswers() });
  },

  getFilteredAnswers: () => {
    const { answers, searchQuery, categoryFilter, showFavoritesOnly } = get();
    const query = searchQuery.trim().toLowerCase();

    return answers.filter((answer) => {
      if (showFavoritesOnly && !answer.favorite) return false;
      if (categoryFilter !== 'all' && answer.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        answer.title.toLowerCase().includes(query) ||
        answer.category.toLowerCase().includes(query) ||
        answer.content.toLowerCase().includes(query)
      );
    });
  },

  getCustomCategories: () => {
    const { answers } = get();
    const predefined = new Set([
      'About Me',
      'Why This Role',
      'Why This Company',
      'Technical Project',
      'Leadership',
      'Challenge / Problem Solving',
      'Availability',
      'Custom',
    ]);
    return [...new Set(answers.map((a) => a.category).filter((c) => !predefined.has(c) && c))];
  },
}));
