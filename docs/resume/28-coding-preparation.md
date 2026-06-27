# 28. Coding Interview Preparation

[← Back to index](../README.md)

Topics and talking points grounded in **this codebase** — use when preparing system design or behavioral interviews about ApplyFlow.

## System design topics

### 1. Extension ↔ web auth sync

- **Problem:** Extension must call APIs without embedding secrets.
- **Approach:** HTTP-only JWT cookies on the web origin; extension reads session via content script or popup fetch to same backend with credentials.
- **Follow-up:** CORS, token refresh, logout propagation.

### 2. Ghost save vs manual save

- **Problem:** Capture job metadata before user completes application.
- **Approach:** `POST /extension/ghost-save` with URL, title, company scraped from DOM; dedupe by `jobUrl` (planned).
- **Follow-up:** Idempotency, conflict when user edits later.

### 3. Answer Vault sync

- **Problem:** Answers edited on web and extension must converge.
- **Approach:** Server as source of truth; `updatedAt` on documents; extension pulls on popup open and pushes on edit.
- **Follow-up:** Offline queue, merge conflicts.

### 4. Plan limits (free vs Pro)

- **Problem:** Enforce 20-app cap and premium AI without race conditions.
- **Approach:** Server-side `assertCanCreateApplication`; PlanGuard decorator on premium routes (in progress).
- **Follow-up:** Stripe webhook updates `user.plan`; cache invalidation.

### 5. AI match score

- **Problem:** Cost and latency of OpenAI on every job view.
- **Approach:** Heuristic fallback; cache by job URL + CV hash; gpt-4o-mini for scoring (planned).
- **Follow-up:** Rate limiting per user/plan.

## Data structures to know

| Entity | Key fields | Indexes |
|--------|------------|---------|
| User | email, plan, stripeCustomerId | email unique |
| Application | userId, status, jobUrl, deadline | userId + status |
| VaultAnswer | userId, question, answer | userId |
| Profile | userId, cvs[], address | userId unique |

## API patterns in repo

- NestJS modules per domain (`applications`, `answer-vault`, `extension`)
- DTOs with `class-validator`
- Guards: `JwtAuthGuard`, `AdminGuard`, `PlanGuard` (partial)
- MongoDB ObjectId refs via `userId` string

## Code walkthrough prompts

1. Walk through how autofill maps profile fields to DOM inputs (`extension/content.js`).
2. Explain Kanban drag-and-drop status update flow (`frontend/app/applicant`).
3. How does `applications.service` enforce the 20-app cap?
4. Stripe webhook: what happens when `checkout.session.completed` fires?

## Behavioral angles

- **Trade-off:** Ship V1 with localhost extension config vs delay for prod URLs.
- **Scope:** V3 scaffolds (auto-apply, enterprise) deferred to keep V2 monetization on track.
- **Quality:** Job-site QA matrix before Chrome Web Store submission.

## Practice questions

1. Design a rate limiter for `/extension/analyze-job` per user and plan.
2. Add pagination to admin user list without breaking existing clients.
3. Implement dedupe for ghost-save when the same job is saved twice with different titles.
4. How would you add Redis caching for analyze-job responses?

## Files worth skimming before interviews

| Topic | Path |
|-------|------|
| Application cap | `backend/src/applications/applications.service.ts` |
| Extension API | `backend/src/extension/extension.controller.ts` |
| Auth | `backend/src/auth/` |
| Billing webhook | `backend/src/billing/billing.service.ts` |
| Answer Vault sync | `backend/src/answer-vault/` |
| Kanban UI | `frontend/app/applicant/page.tsx` |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
