import { userApi } from './api';
import type { VaultAnswer, VaultAnswerInput } from '@/types/answerVault';

export const answerVaultApi = {
  list: () => userApi.get<VaultAnswer[]>('/answer-vault').then((r) => r.data),
  create: (input: VaultAnswerInput) => userApi.post('/answer-vault', input).then((r) => r.data),
  update: (id: string, input: VaultAnswerInput) => userApi.put(`/answer-vault/${id}`, input).then((r) => r.data),
  remove: (id: string) => userApi.delete(`/answer-vault/${id}`),
  sync: (answers: VaultAnswerInput[]) =>
    userApi.post('/answer-vault/sync', { answers }).then((r) => r.data),
};
