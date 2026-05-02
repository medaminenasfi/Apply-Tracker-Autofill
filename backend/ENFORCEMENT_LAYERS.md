# userId Enforcement Layers

This document describes all automated enforcement layers that prevent userId bugs from reaching production.

## Layer 1: TypeScript Type Safety

### Shared Type
```typescript
// src/common/utils/userId.util.ts
export type UserId = string;
```

### Strict Mode
```json
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**Blocks**: Type mismatches, implicit any, null/undefined issues

## Layer 2: ESLint Rules

### Configuration
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "NewExpression[callee.name='ObjectId']",
        "message": "Do not use ObjectId for userId"
      }
    ]
  }
}
```

**Blocks**: 
- `new ObjectId()` for userId
- `Types.ObjectId` usage for userId
- ObjectId type annotations on userId

**Run**: `npm run lint`

## Layer 3: Pre-Commit Hook

### Husky Configuration
```bash
# .husky/pre-commit
npm run type-check
npm run lint
grep -r "userId.*ObjectId" src/ && exit 1
```

**Blocks**: Commits with type errors, lint violations, ObjectId usage

**Run**: Automatically on every `git commit`

## Layer 4: CI Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci.yml
- Type check
- Lint
- Build
- Test
- Check for ObjectId usage
```

**Blocks**: Merges with any failures

**Run**: On every push and pull request

## Layer 5: Runtime Validation

### Schema Validators
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

**Blocks**: Non-string userId at database write

### Pre-Save Hooks
```typescript
schema.pre('save', function (this: any, next: any) {
  if (this.userId && typeof this.userId !== 'string') {
    this.userId = String(this.userId);
  }
  next();
});
```

**Auto-fixes**: Converts non-string userId to string before save

### Service Validation
```typescript
export const validateUserId = (userId: unknown): void => {
  if (!userId || typeof userId !== 'string') {
    console.error('[CRITICAL USERID ERROR]', { userId, type: typeof userId });
    throw new Error('userId must be a string');
  }
};
```

**Blocks**: Operations with invalid userId, logs critical error

## Layer 6: Testing

### Unit Tests
```typescript
// src/common/utils/__tests__/userId.util.test.ts
it('should reject non-string userId', () => {
  expect(() => normalizeUserId(null)).toThrow();
});
```

**Catches**: Regression in normalization logic

### Integration Tests
```typescript
// src/applications/__tests__/applications.service.e2e-spec.ts
it('should use normalized userId when creating application', async () => {
  // Verifies end-to-end userId handling
});
```

**Catches**: Integration issues, service layer problems

## Layer 7: Monitoring

### Fail-Loud Logging
```typescript
console.error('[CRITICAL USERID ERROR]', { 
  userId, 
  type: typeof userId,
  stack: new Error().stack 
});
```

**Alerts**: On production violations

### Metrics to Track
- Failed requests with userId errors
- Empty result sets (possible userId mismatch)
- Type validation failures
- Normalization frequency

## Layer 8: Code Review

### Mandatory Checklist
- [ ] Uses `UserId` type
- [ ] Calls `normalizeUserId()` at entry points
- [ ] Calls `validateUserId()` in services
- [ ] No ObjectId usage
- [ ] Tests included

**Blocks**: PRs that don't pass checklist

## Defense in Depth

These layers work together:

1. **Development**: TypeScript + ESLint catch issues early
2. **Commit**: Pre-commit hook blocks bad code
3. **Merge**: CI pipeline blocks broken code
4. **Runtime**: Validation blocks invalid operations
5. **Production**: Monitoring alerts on violations
6. **Review**: Human review catches edge cases

## Failure Modes

### What happens if a layer fails?

- **TypeScript fails**: Code won't compile
- **ESLint fails**: Commit blocked, CI blocked
- **Pre-commit fails**: Commit blocked
- **CI fails**: Merge blocked
- **Runtime validation fails**: Operation blocked, error logged
- **Monitoring detects**: Alert raised, investigate

### Bypass Prevention

- Cannot bypass TypeScript (compiler)
- Cannot bypass ESLint (pre-commit + CI)
- Cannot bypass pre-commit (git hook)
- Cannot bypass CI (GitHub Actions)
- Cannot bypass runtime (throws error)
- Cannot bypass monitoring (logs + alerts)

## Summary

The system is **self-protecting**:

- ❌ Cannot commit invalid code
- ❌ Cannot merge broken code
- ❌ Cannot deploy unsafe code
- ❌ Cannot silently fail in production

**Result**: userId bugs are caught automatically at multiple layers before reaching production.
