export const PREDEFINED_CATEGORIES = [
  'About Me',
  'Why This Role',
  'Why This Company',
  'Technical Project',
  'Leadership',
  'Challenge / Problem Solving',
  'Availability',
] as const;

export const CUSTOM_CATEGORY_LABEL = 'Custom';

export const ROLE_TYPES = [
  'General',
  'Software Engineering',
  'Product Management',
  'Design',
  'Data / Analytics',
  'Other',
] as const;

export const ALL_CATEGORY_OPTIONS = [
  ...PREDEFINED_CATEGORIES,
  CUSTOM_CATEGORY_LABEL,
];

export const VAULT_STORAGE_KEY = 'applyflow_answer_vault_v1';
export const VAULT_RECENT_KEY = 'applyflow_answer_vault_recent_v1';
export const MAX_RECENT_ANSWERS = 10;
