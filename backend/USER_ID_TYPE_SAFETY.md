# userId Type Safety Rules

## ⚠️ CRITICAL RULE

**userId is ALWAYS a string.**

Any other type (ObjectId, number, etc.) is a bug.

## Type Definition

```typescript
// Located at: src/common/utils/userId.util.ts
export type UserId = string;
```

## Usage Guidelines

### ✅ CORRECT

```typescript
// Service method signatures
async findByUserId(userId: UserId): Promise<Profile | null>

// Schema definitions
@Prop({ required: true, type: String })
userId: UserId;

// Method parameters
async create(userId: UserId, data: any): Promise<Application>
```

### ❌ INCORRECT

```typescript
// NEVER use ObjectId for userId
async findByUserId(userId: Types.ObjectId): Promise<Profile | null>

// NEVER use 'any' for userId
async findByUserId(userId: any): Promise<Profile | null>

// NEVER use 'string' directly when UserId type exists
async findByUserId(userId: string): Promise<Profile | null> // Use UserId instead
```

## Normalization

Always use the centralized utilities:

```typescript
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

// Normalize before using
const userIdString = normalizeUserId(userId);

// Validate when needed
validateUserId(userId);
```

## Compile-Time Protection

The `UserId` type is a type alias for `string`, but it provides semantic meaning:
- It signals intent: "this is a userId, not just any string"
- It prevents accidental ObjectId usage
- It makes code reviews easier

## Runtime Protection

- **Schemas**: Pre-save hooks auto-normalize userId to string
- **Services**: `validateUserId()` throws if not string
- **Controllers**: Normalize before passing to services
- **Auth**: JWT strategy normalizes before returning user object

## Database Schema

All schemas enforce userId as string:

```typescript
@Prop({
  required: true,
  type: String,
  validate: {
    validator: (v: unknown) => typeof v === 'string',
    message: 'userId must be a string'
  }
})
userId: UserId;
```

## Migration

If you find code using non-string userId:

1. Replace `Types.ObjectId` with `UserId`
2. Replace `string` with `UserId` for userId parameters
3. Add `normalizeUserId()` calls at entry points
4. Add `validateUserId()` calls in services
5. Test thoroughly

## Exceptions

**MongoDB `_id` fields** are allowed to be ObjectId:
- `_id` is the primary key, not userId
- Only `userId` fields must be strings

## Summary

- **Type**: `UserId` (alias for `string`)
- **Runtime**: Always string
- **Storage**: Always string in database
- **Normalization**: Use `normalizeUserId()`
- **Validation**: Use `validateUserId()`

**Remember: userId is ALWAYS a string. Any other type is a bug.**
