export interface VaultAnswer {
  id: string;
  title: string;
  category: string;
  content: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultRecentEntry {
  answerId: string;
  usedAt: string;
}

export interface VaultAnswerInput {
  title: string;
  category: string;
  content: string;
  favorite?: boolean;
}
