# Code Review Rules for userId Safety

## ❌ CRITICAL RULE

**Any PR using ObjectId for userId = REJECTED**

## Mandatory Checklist

Before approving any PR touching userId-related code, verify:

### 1. Type Safety
- [ ] All userId parameters use `UserId` type (not `string`, not `any`)
- [ ] No `Types.ObjectId` usage for userId
- [ ] No `new ObjectId()` calls with userId
- [ ] Import `UserId` from `userId.util.ts`

### 2. Normalization
- [ ] Entry points (controllers, auth) call `normalizeUserId()`
- [ ] No manual `.toString()` calls on userId
- [ ] Single source of truth: `normalizeUserId()`

### 3. Validation
- [ ] Service methods call `validateUserId()` before operations
- [ ] Schema validators enforce string type
- [ ] Pre-save hooks auto-normalize

### 4. Testing
- [ ] Unit tests cover userId normalization
- [ ] Integration tests verify userId flow
- [ ] No test mocks use ObjectId for userId

### 5. Documentation
- [ ] New code follows patterns in `USER_ID_TYPE_SAFETY.md`
- [ ] Comments explain userId handling if complex

## Examples

### ✅ APPROVED

```typescript
import { UserId, normalizeUserId, validateUserId } from '../common/utils/userId.util';

async findByUserId(userId: UserId): Promise<Application[]> {
  validateUserId(userId);
  const userIdString = normalizeUserId(userId);
  return this.applicationModel.find({ userId: userIdString }).exec();
}
```

### ❌ REJECTED

```typescript
// WRONG: Uses ObjectId
async findByUserId(userId: Types.ObjectId): Promise<Application[]> {
  return this.applicationModel.find({ userId }).exec();
}

// WRONG: Manual toString
async findByUserId(userId: string): Promise<Application[]> {
  return this.applicationModel.find({ userId: userId.toString() }).exec();
}

// WRONG: Uses 'any'
async findByUserId(userId: any): Promise<Application[]> {
  return this.applicationModel.find({ userId }).exec();
}

// WRONG: No validation
async findByUserId(userId: string): Promise<Application[]> {
  return this.applicationModel.find({ userId }).exec();
}
```

## Automated Checks

The following automated checks run on every PR:

1. **Type check**: `npm run type-check` - blocks type errors
2. **Lint**: ESLint rules block ObjectId usage
3. **Pre-commit**: Husky hook blocks commits with violations
4. **CI Pipeline**: GitHub Actions blocks merges with failures

If any automated check fails, the PR **must be rejected**.

## Monitoring

Production logs include:
- `[CRITICAL USERID ERROR]` for validation failures
- Stack traces for debugging
- userId type information

Alert on:
- Any `[CRITICAL USERID ERROR]` logs
- Sudden increase in failed requests
- Empty result sets where data should exist

## Review Process

1. Run `npm run type-check` locally
2. Run `npm run lint` locally
3. Check for `ObjectId` usage: `grep -r "ObjectId" src/`
4. Verify all userId parameters use `UserId` type
5. Ensure `normalizeUserId()` is called at entry points
6. Ensure `validateUserId()` is called in services

## Escalation

If you see:
- Repeated violations from same developer
- Attempts to bypass automated checks
- Confusion about userId rules

Escalate to:
- Tech lead
- Architecture team
- Update this documentation

## Remember

> "userId is ALWAYS a string. Any other type is a bug."

This rule is enforced by:
- TypeScript types (`UserId`)
- ESLint rules
- Pre-commit hooks
- CI pipeline
- Code review

**No exceptions.**
