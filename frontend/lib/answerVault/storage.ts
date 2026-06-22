import {
  VAULT_RECENT_KEY,
  VAULT_STORAGE_KEY,
  MAX_RECENT_ANSWERS,
} from './constants';
import type { VaultAnswer, VaultRecentEntry } from '@/types/answerVault';

function readAnswers(): VaultAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAnswers(answers: VaultAnswer[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(answers));
  syncToExtension(answers);
}

function readRecent(): VaultRecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VAULT_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecent(recent: VaultRecentEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VAULT_RECENT_KEY, JSON.stringify(recent));
  syncRecentToExtension(recent);
}

function syncToExtension(answers: VaultAnswer[]) {
  window.postMessage({ type: 'APPLYFLOW_VAULT_SYNC', payload: answers }, '*');
}

function syncRecentToExtension(recent: VaultRecentEntry[]) {
  window.postMessage({ type: 'APPLYFLOW_VAULT_RECENT_SYNC', payload: recent }, '*');
}

export function loadVaultAnswers(): VaultAnswer[] {
  return readAnswers();
}

export function loadRecentAnswers(): VaultRecentEntry[] {
  return readRecent();
}

export function saveVaultAnswers(answers: VaultAnswer[]) {
  writeAnswers(answers);
}

export function recordRecentUsage(answerId: string) {
  const recent = readRecent().filter((entry) => entry.answerId !== answerId);
  recent.unshift({ answerId, usedAt: new Date().toISOString() });
  writeRecent(recent.slice(0, MAX_RECENT_ANSWERS));
}

export function syncVaultToExtension() {
  syncToExtension(loadVaultAnswers());
  syncRecentToExtension(loadRecentAnswers());
}

export function generateAnswerId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
