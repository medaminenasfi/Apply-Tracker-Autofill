import { normalizeUserId, validateUserId, UserId } from '../userId.util';

describe('userId.util', () => {
  describe('normalizeUserId', () => {
    it('should normalize string userId to itself', () => {
      const userId: UserId = '1234567890abcdef';
      const result = normalizeUserId(userId);
      expect(result).toBe(userId);
    });

    it('should normalize ObjectId-like string to string', () => {
      const objectIdString = '507f1f77bcf86cd799439011';
      const result = normalizeUserId(objectIdString);
      expect(result).toBe(objectIdString);
      expect(typeof result).toBe('string');
    });

    it('should convert number userId to string', () => {
      const result = normalizeUserId(12345);
      expect(result).toBe('12345');
      expect(typeof result).toBe('string');
    });

    it('should convert ObjectId to string', () => {
      const mockObjectId = { toString: () => '507f1f77bcf86cd799439011' } as any;
      const result = normalizeUserId(mockObjectId);
      expect(result).toBe('507f1f77bcf86cd799439011');
      expect(typeof result).toBe('string');
    });

    it('should throw error for null userId', () => {
      expect(() => normalizeUserId(null)).toThrow('userId is required');
    });

    it('should throw error for undefined userId', () => {
      expect(() => normalizeUserId(undefined)).toThrow('userId is required');
    });

    it('should throw error for empty string userId', () => {
      expect(() => normalizeUserId('')).toThrow('userId is required');
    });
  });

  describe('validateUserId', () => {
    it('should accept valid string userId', () => {
      const userId: UserId = '1234567890abcdef';
      expect(() => validateUserId(userId)).not.toThrow();
    });

    it('should throw error for non-string userId', () => {
      expect(() => validateUserId(12345)).toThrow('userId must be a string');
    });

    it('should throw error for null userId', () => {
      expect(() => validateUserId(null)).toThrow('userId must be a string');
    });

    it('should throw error for undefined userId', () => {
      expect(() => validateUserId(undefined)).toThrow('userId must be a string');
    });

    it('should throw error for ObjectId', () => {
      const mockObjectId = { toString: () => '507f1f77bcf86cd799439011' } as any;
      expect(() => validateUserId(mockObjectId)).toThrow('userId must be a string');
    });
  });
});
