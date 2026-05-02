/**
 * Shared type for userId
 * 
 * IMPORTANT: userId is ALWAYS a string.
 * Any other type (ObjectId, number, etc.) is a bug.
 * 
 * This type enforces compile-time safety.
 * Use this type everywhere userId is referenced.
 */
export type UserId = string;

/**
 * Centralized userId normalization utility
 * Ensures userId is always a string throughout the system
 * This is the single source of truth for userId handling
 * 
 * @param userId - The userId to normalize (can be any type)
 * @returns The userId as a string
 * @throws Error if userId is missing or cannot be converted
 */
export const normalizeUserId = (userId: unknown): UserId => {
  if (!userId) {
    console.error('[USER_ID_UTIL] Missing userId');
    throw new Error('userId is required');
  }

  const userIdString = String(userId);

  if (typeof userIdString !== 'string') {
    console.error('[USER_ID_UTIL] Failed to normalize userId:', { userId, type: typeof userId });
    throw new Error('userId must be a string');
  }

  console.log('[USER_ID_UTIL] Normalized userId:', {
    original: userId,
    normalized: userIdString,
    type: typeof userIdString
  });

  return userIdString as UserId;
};

/**
 * Validate userId is a string
 * 
 * @param userId - The userId to validate
 * @throws Error if userId is not a string
 */
export const validateUserId = (userId: unknown): void => {
  if (!userId || typeof userId !== 'string') {
    console.error('[CRITICAL USERID ERROR]', { 
      userId, 
      type: typeof userId,
      stack: new Error().stack 
    });
    throw new Error('userId must be a string');
  }
};
