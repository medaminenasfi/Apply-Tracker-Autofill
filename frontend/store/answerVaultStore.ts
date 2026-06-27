import { create } from 'zustand';
import type { VaultAnswer, VaultAnswerInput, VaultRecentEntry } from '@/types/answerVault';
import {
  generateAnswerId,
  loadRecentAnswers,
  loadVaultAnswers,
  recordRecentUsage,
  saveVaultAnswers,
} from '@/lib/answerVault/storage';
import { answerVaultApi } from '@/services/answerVault';

interface AnswerVaultState {
  answers: VaultAnswer[];
  recent: VaultRecentEntry[];
  searchQuery: string;
  categoryFilter: string;
  showFavoritesOnly: boolean;
  initialized: boolean;
  syncEnabled: boolean;
  initialize: () => Promise<void>;
  syncToBackend: () => Promise<void>;
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
  // Fire-and-forget backend sync when logged in
  if (typeof window !== 'undefined') {
    const payload = answers.map(({ title, category, content, favorite, roleType }) => ({
      title,
      category,
      content,
      favorite,
      roleType,
    }));
    answerVaultApi.sync(payload).catch(() => {});
  }
}

export const useAnswerVaultStore = create<AnswerVaultState>((set, get) => ({
  answers: [],
  recent: [],
  searchQuery: '',
  categoryFilter: 'all',
  showFavoritesOnly: false,
  initialized: false,
  syncEnabled: true,

  initialize: async () => {
    if (get().initialized) return;
    let answers = loadVaultAnswers();
    try {
      const remote = await answerVaultApi.list();
      if (Array.isArray(remote) && remote.length) {
        answers = remote.map((item: any) => ({
          id: String(item._id || item.id),
          title: item.title,
          category: item.category,
          content: item.content,
          favorite: item.favorite ?? false,
          roleType: item.roleType,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        saveVaultAnswers(answers);
      } else if (answers.length) {
        await answerVaultApi.sync(
          answers.map(({ title, category, content, favorite, roleType }) => ({ title, category, content, favorite, roleType })),
        );
      }
    } catch {
      /* offline / not logged in — keep local */
    }
    set({
      answers,
      recent: loadRecentAnswers(),
      initialized: true,
    });
  },

  syncToBackend: async () => {
    const { answers } = get();
    await answerVaultApi.sync(
      answers.map(({ title, category, content, favorite }) => ({ title, category, content, favorite })),
    );
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
      roleType: input.roleType,
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
        roleType: input.roleType ?? answer.roleType,
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
