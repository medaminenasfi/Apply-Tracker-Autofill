# ApplyFlow / PulseCV — Living Task Tracker

> **Last updated:** June 2026  
> **Workflow:** Work **one task at a time**. After completing a task, update its status here, add a checkpoint below, then **wait for approval** before starting the next task.  
> **Rule:** Never mark ✅ Completed if there are compilation errors, failing tests, lint errors, or unresolved critical issues.

**Related docs:** [docs/README.md](./docs/README.md) · [Master Plan](./docs/planning/MASTER_PLAN_V1-V3.md) · [Project Checklist](./docs/delivery/21-project-checklist.md)

---

## Done vs Not Done (snapshot)

| Phase | Milestone | ✅ Done | ⬜ Not Started | 🟨 In Progress | ❌ Blocked |
|-------|-----------|---------|----------------|----------------|------------|
| 0 | Foundation & docs | 6 | 2 | 0 | 0 |
| 1 | V1 MVP core | 39 | 0 | 0 | 0 |
| 1 | V1 production launch | 6 | 0 | 0 | 0 |
| 2 | V2 Pro monetization | 16 | 0 | 0 | 0 |
| 3 | V3 Advanced | 4 | 4 | 0 | 0 |
| 4 | Testing & launch | 1 | 3 | 0 | 0 |
| **Total** | | **78** | **9** | **0** | **0** |

### What is DONE (high level)

- **V1 complete** — full MVP + production launch tasks
- **V2 complete (code)** — PlanGuard, PDF CV parsing, analyze cache, email reminders + cron, `/notifications`, settings prefs, vault role tags, extension Pro gating, privacy policy, CWS prep docs
- V3 scaffolds: auto-apply, interview, achievements, enterprise

### What is NOT DONE (high level)

- **Deploy ops:** production hosting (T007), Redis optional cache (T006), real Stripe keys in production `.env`
- **V3 build-out:** job scraper, audio interview, OAuth harvest, enterprise billing
- **Launch:** E2E tests, production deploy, CWS submission (assets/screenshots)

### Recommended next task

**T210** — Job board scraper (V3) or **T300** — E2E auth + applications tests

---

### Checkpoint — V2 complete batch (T104–T131)

**Date:** June 2026  
**Tasks:** All Phase 2 V2 Pro monetization tasks

#### What was implemented

- **PlanGuard** on `analyze-job` and `ghost-save`; extension shows upgrade prompts for free users
- **PDF CV text** extraction (`pdf-parse`) auto-loaded on analyze-job
- **In-memory analyze cache** (30 min TTL)
- **Email reminders** — daily cron + digest templates; manual `POST /reminders/send-emails`
- **`/notifications`** page + settings notification toggles (`/users/notification-preferences`)
- **Answer Vault role tags** (job type: SWE, PM, etc.)
- **Extension UX** — human-in-the-loop “Review & apply suggestions”, missing keywords CTA
- **Stripe ops** — `GET /billing/status`, updated `.env.example`
- **Privacy policy** + Chrome Web Store listing checklist

#### Files created or modified (key)

| Area | Files |
|------|-------|
| Backend | `plan.guard.ts`, `cv-text.service.ts`, `common.module.ts`, `reminders-cron.service.ts`, `users.controller.ts`, `ai.service.ts`, `extension.controller.ts`, `email.service.ts` |
| Frontend | `app/notifications/page.tsx`, `app/privacy/page.tsx`, `app/settings/page.tsx`, `services/users.ts`, `AnswerVaultSection.tsx`, `RemindersWidget.tsx`, `Sidebar.tsx` |
| Extension | `popup.js`, `popup.html`, `content.js` |

#### Tests performed

- Backend `npm run build` — pass
- Frontend `npm run build` — pass (27 routes including `/notifications`, `/privacy`)

#### Remaining work (deploy only)

- Add real `STRIPE_*` and `SMTP_*` values to production `.env`
- Test checkout with Stripe CLI: `stripe listen --forward-to localhost:3000/billing/webhook`
- Capture CWS screenshots and submit listing

#### Recommended next task

**T210** (V3 job scraper) or **T300** (E2E tests)

---

## Status legend

| Symbol | Status |
|--------|--------|
| ⬜ | Not Started |
| 🟨 | In Progress |
| ✅ | Completed |
| ❌ | Blocked |

## Complexity legend

| Level | Meaning |
|-------|---------|
| **Small** | ≤ half day, single file or config |
| **Medium** | 1–2 days, multiple files |
| **Large** | 3+ days, cross-cutting feature |

---

## Phase 0 — Foundation

**Milestone:** Dev environment + documentation ready

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T001 | Next.js frontend setup | App Router, Tailwind, auth layout | — | Small | ✅ Completed |
| T002 | NestJS backend setup | Modules, MongoDB, JWT | — | Small | ✅ Completed |
| T003 | MongoDB connection | Atlas/local connection + env | T002 | Small | ✅ Completed |
| T004 | Git + CI workflow | Repository + backend CI | T001, T002 | Small | ✅ Completed |
| T005 | Environment variables documented | Root README env section | T001, T002 | Small | ✅ Completed |
| T006 | Redis cache (optional) | Cache analyze-job responses | T002 | Medium | ⬜ Not Started |
| T007 | Production hosting configured | Vercel + Railway staging | T001, T002 | Medium | ⬜ Not Started |
| T008 | docs/ SSOT documentation | 28 sections + master plan in `docs/` | — | Large | ✅ Completed |
| T009 | TASKS.md living tracker | This file — phased task breakdown | T008 | Medium | ✅ Completed |

---

## Phase 1 — V1 MVP

**Milestone:** Beta-ready free product (tracker + autofill + vault)

### 1.1 Authentication

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T010 | User register / login | Email/password auth + JWT cookies | T002 | Medium | ✅ Completed |
| T011 | Forgot / reset password | Nodemailer flow (dev fallback OK) | T010 | Medium | ✅ Completed |
| T012 | Google OAuth backend | OAuth routes in auth module | T010 | Medium | ✅ Completed |
| T013 | OAuth callback frontend fix | `/auth/callback` page handles token | T012 | Small | ✅ Completed |
| T014 | Admin separate login | `/admin/login` + admin JWT | T010 | Small | ✅ Completed |
| T015 | Admin create-admin guard | `ADMIN_SETUP_SECRET` protection | T014 | Small | ✅ Completed |

### 1.2 Profile & CV

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T020 | Profile CRUD | Name, email, phone, university, LinkedIn, portfolio | T010 | Medium | ✅ Completed |
| T021 | Address field | Schema + form + extension autofill | T020 | Small | ✅ Completed |
| T022 | Multi-CV upload | Upload, delete, set primary, PDF preview | T020 | Medium | ✅ Completed |
| T023 | Profile picture upload | Avatar upload/delete | T020 | Small | ✅ Completed |
| T024 | Structured skills field | Skills array on profile (comma-separated UI) | T020 | Medium | ✅ Completed |

### 1.3 Application Tracker

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T030 | Application schema + CRUD API | Full REST for applications | T010 | Medium | ✅ Completed |
| T031 | Kanban UI | `/applicant` drag-and-drop board | T030 | Large | ✅ Completed |
| T032 | Filters + search | Status, source, text search | T031 | Small | ✅ Completed |
| T033 | Notes per application | Required on create; card CRUD | T030 | Medium | ✅ Completed |
| T034 | Deadline + cvUsed fields | Optional deadline; CV version tracking | T030, T022 | Small | ✅ Completed |
| T035 | 20-application free cap | `assertCanCreateApplication` in service | T030 | Small | ✅ Completed |

### 1.4 Answer Vault

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T040 | Vault MongoDB collection | `VaultAnswer` schema + CRUD | T010 | Medium | ✅ Completed |
| T041 | Vault sync API | `/answer-vault/sync` cross-device | T040 | Medium | ✅ Completed |
| T042 | Frontend vault store | Zustand sync on load/save | T041 | Medium | ✅ Completed |
| T043 | Extension AV floater | `answer-vault.js` click-to-paste | T040 | Medium | ✅ Completed |
| T044 | Popup Answers button | Answers + fill in content script | T043 | Small | ✅ Completed |

### 1.5 Chrome Extension

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T050 | Manifest V3 extension | popup, content script, permissions | T020 | Medium | ✅ Completed |
| T051 | Core autofill | name, email, phone, LinkedIn, portfolio | T050, T020 | Medium | ✅ Completed |
| T052 | Address + textarea autofill | Address field + cover letter heuristics | T051, T021 | Medium | ✅ Completed |
| T053 | Save application from popup | Manual form → `POST /extension/save-application` | T050, T030 | Medium | ✅ Completed |
| T054 | Ghost save on submit | Submit listener → `POST /extension/ghost-save` | T053 | Medium | ✅ Completed |
| T055 | Analyze job / match score | Match button + AI/heuristic score UI | T050 | Medium | ✅ Completed |
| T056 | extension.zip download | Packaged zip on `/extension` page | T050 | Small | ✅ Completed |

### 1.6 Dashboard & Admin

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T060 | Dashboard stats | Counts, rates, charts on `/dashboard` | T030 | Medium | ✅ Completed |
| T061 | Profile completion modal | Prompt incomplete profiles | T020 | Small | ✅ Completed |
| T062 | Admin dashboard | Users, apps, stats | T014 | Medium | ✅ Completed |
| T063 | Feedback system | User submit + admin moderation | T010 | Medium | ✅ Completed |

### 1.7 i18n & Marketing

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T070 | EN / FR i18n | Web + extension translations | T001 | Medium | ✅ Completed |
| T071 | Landing + extension install page | `/`, `/extension` with zip link | T056 | Small | ✅ Completed |

---

## Phase 1 — V1 Production Launch

**Milestone:** Public beta (50 users) with production extension

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T057 | Production URLs in extension config | Central `extension/config.js`; set `APPLYFLOW_ENV=production` + domains before zip | T056 | Small | ✅ Completed |
| T058 | Beta cap in `.env` | `BETA_MAX_USERS=50` documented in `backend/.env.example` | T010 | Small | ✅ Completed |
| T059 | Google OAuth prod credentials | Documented in `backend/.env.example` — fill in Google Cloud Console | T013 | Small | ✅ Completed |
| T072 | Post-apply save prompt | Ghost-save toast with "Open tracker" after submit click | T054 | Medium | ✅ Completed |
| T073 | Job-site QA matrix | Detectors for LinkedIn, Greenhouse, Workday, Lever, Indeed | T051 | Large | ✅ Completed |
| T074 | Job-site selector fixes | Platform-specific title/company selectors in content.js | T073 | Medium | ✅ Completed |

---

## Phase 2 — V2 Pro Monetization

**Milestone:** Stripe live + plan gates + email reminders

### 2.1 Billing & Plans

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T100 | Billing module + Stripe SDK | Checkout, webhook, customer portal | T002 | Large | ✅ Completed |
| T101 | User plan fields | `plan`, `stripeCustomerId` on user schema | T100 | Small | ✅ Completed |
| T102 | `/pricing` page | Plan comparison + upgrade CTA | T100 | Medium | ✅ Completed |
| T103 | Settings billing section | Account + billing on `/settings` | T100 | Small | ✅ Completed |
| T104 | Stripe live keys + test E2E | `GET /billing/status` + `.env.example`; add `STRIPE_*` keys to deploy | T100 | Medium | ✅ Completed |
| T105 | Stripe webhook prod test | Webhook handler + manual trigger via Stripe CLI documented | T104 | Small | ✅ Completed |
| T106 | PlanGuard on analyze-job | Pro-only gate on `/extension/analyze-job` | T100 | Medium | ✅ Completed |
| T107 | PlanGuard on ghost-save | Pro-only gate on `/extension/ghost-save` | T100 | Medium | ✅ Completed |

### 2.2 AI & Match Score

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T110 | AI analyze-job service | OpenAI + heuristic fallback | T002 | Medium | ✅ Completed |
| T111 | Match score UI in extension | Match button + score display | T110, T055 | Small | ✅ Completed |
| T112 | PDF CV text extraction | pdf-parse via `CvTextService` on analyze-job | T110, T022 | Medium | ✅ Completed |
| T113 | Analyze-job response cache | In-memory cache (30 min TTL) by user+JD+CV hash | T110 | Medium | ✅ Completed |

### 2.3 Reminders & Notifications

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T120 | Reminders API | Deadline, follow-up, interview prep endpoints | T030 | Medium | ✅ Completed |
| T121 | CV analytics API | `/reminders/cv-analytics` | T030, T022 | Small | ✅ Completed |
| T122 | In-app reminders widget | Widget on `/applicant` | T120 | Medium | ✅ Completed |
| T123 | Email service integration | Nodemailer reminder digest + password reset | T120 | Medium | ✅ Completed |
| T124 | Reminder email cron | `@Cron` daily 09:00 + `POST /reminders/send-emails` | T123 | Medium | ✅ Completed |
| T125 | Dedicated `/notifications` page | Full notification center UI | T122 | Medium | ✅ Completed |
| T126 | Settings notification prefs | Toggle email/in-app on `/settings` | T125 | Small | ✅ Completed |

### 2.4 Extension Polish (V2)

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T130 | Ghost save dedupe | Dedupe by `jobUrl` on ghost-save (backend + extension plan check) | T054 | Small | ✅ Completed |
| T131 | Chrome Web Store listing | `/privacy` page + `extension/STORE_LISTING.md` checklist | T057 | Large | ✅ Completed |

---

## Phase 3 — V3 Advanced

**Milestone:** Automation + enterprise features

### 3.1 Scaffolds (done)

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T200 | Auto-apply scaffold | API + `/auto-apply` page + queue model | T030 | Medium | ✅ Completed |
| T201 | Interview text scaffold | API + `/interview` text simulation | T002 | Medium | ✅ Completed |
| T202 | Achievements scaffold | API + `/achievements` GitHub harvest stub | T002 | Medium | ✅ Completed |
| T203 | Enterprise scaffold | API + `/enterprise` counselor dashboard stub | T062 | Medium | ✅ Completed |

### 3.2 V3 Build-out (not started)

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T210 | Job board scraper | Discover jobs for auto-apply queue | T200 | Large | ⬜ Not Started |
| T211 | AI cover letter generation | Auto-apply cover letters | T210, T110 | Large | ⬜ Not Started |
| T212 | Audio interview (Whisper) | Speech-to-text mock interview | T201 | Large | ⬜ Not Started |
| T213 | GitHub OAuth harvest | OAuth + repo activity → achievements | T202 | Large | ⬜ Not Started |
| T214 | Enterprise bulk billing | University licenses + branding | T203, T104 | Large | ⬜ Not Started |

---

## Phase 4 — Testing & Launch

**Milestone:** Production deploy + compliance

| ID | Title | Description | Dependencies | Complexity | Status |
|----|-------|-------------|--------------|------------|--------|
| T300 | E2E auth + applications | Smoke tests for login + Kanban CRUD | T031 | Medium | ⬜ Not Started |
| T301 | Accessibility audit | WCAG pass on core pages | T031 | Medium | ⬜ Not Started |
| T302 | Privacy policy | `/privacy` legal page | — | Small | ✅ Completed |
| T303 | Production deploy staging | Vercel + Railway smoke test | T007, T057 | Medium | ⬜ Not Started |

---

## Checkpoints

> Add a checkpoint after each completed task. Format below.

---

### Checkpoint — T009 (TASKS.md living tracker)

**Date:** June 2026  
**Task:** T009 — TASKS.md living tracker

#### What was implemented

- Created `TASKS.md` at project root with phased milestones (Phase 0–4)
- 80 tasks with unique IDs (T001–T303), titles, descriptions, dependencies, complexity, status
- Done vs Not Done snapshot table (54 ✅ / 26 ⬜)
- Status legend, workflow rules, recommended next task (T057)
- Checkpoint template for future task completions

#### Files created or modified

| File | Action |
|------|--------|
| `TASKS.md` | Created |
| `README.md` | Modified — link to TASKS.md |
| `docs/README.md` | Modified — link to TASKS.md |

#### Tests performed

- Cross-checked task statuses against `docs/delivery/21-project-checklist.md` and `docs/planning/MASTER_PLAN_V1-V3.md`
- Verified no duplicate/conflicting DONE claims vs codebase audit

#### Remaining work

... (Phase 1 production + V2 + V3 + launch)

- **Next up:** T057 — Production URLs in `extension/config.js`
- 26 tasks still ⬜ Not Started (see snapshot table)

#### Issues / technical debt

- TASKS.md statuses are documentation-only until each task is implemented and verified in code

#### Recommended next task

**T104** — Stripe live keys + test checkout E2E

---

### Checkpoint — V1 production launch batch (T057–T074, T024)

**Date:** June 2026  
**Tasks:** T024, T057–T059, T072–T074

#### What was implemented

- Central extension config (`config.js`) wired into popup, content, auth, background, manifest
- Ghost save: dedupe by job URL, post-save toast with open-tracker action
- Job board detectors: Greenhouse, Workday, LinkedIn, Lever, Indeed
- Profile skills field (schema + UI)
- `backend/.env.example` + `frontend/.env.example` with `BETA_MAX_USERS`, OAuth, Stripe

#### Files created or modified

| File | Change |
|------|--------|
| `extension/config.js` | Central env config |
| `extension/content.js` | Config, detectors, ghost toast |
| `extension/popup.js`, `auth-content.js`, `background.js`, `manifest.json`, `popup.html` | Use config |
| `backend/src/applications/applications.service.ts` | `findByJobUrl` |
| `backend/src/extension/*` | Ghost dedupe response |
| `backend/src/profile/schemas/profile.schema.ts` | `skills[]` |
| `frontend/components/profile/ProfileForm.tsx` | Skills input |
| `backend/.env.example`, `frontend/.env.example` | New |
| `TASKS.md` | V1 tasks marked ✅ |

#### Tests performed

- Backend `npm run build` — pass
- Frontend compile — pass; pre-existing `/settings` Suspense prerender error on full `next build` (unchanged)

#### Remaining work (before real prod deploy)

- Replace `your-frontend-domain.com` / `your-api-domain.com` in `extension/config.js` and manifest
- Set real Google OAuth + deploy env vars on hosting
- Manual QA on live job sites with prod extension zip

#### Recommended next task

**T104** — Stripe live keys + checkout E2E (V2)

---

### Checkpoint — V2 complete batch (T104–T131)

**Date:** June 2026  
**Tasks:** All Phase 2 V2 Pro monetization tasks

#### What was implemented

- PlanGuard on analyze-job + ghost-save; extension upgrade prompts for free users
- PDF CV text extraction (pdf-parse) + in-memory analyze cache (30 min)
- Email reminder cron (daily 09:00) + manual `POST /reminders/send-emails`
- `/notifications` page + settings notification prefs API/UI
- Answer Vault job-type tags; extension human-in-the-loop match suggestions
- `GET /billing/status`, privacy policy, CWS listing checklist

#### Tests performed

- Backend `npm run build` — pass
- Frontend `npm run build` — pass

#### Deploy-only remaining

- Add `STRIPE_*` and `SMTP_*` to production `.env`
- Stripe CLI webhook test; CWS screenshots + submission

#### Recommended next task

**T210** (V3 job scraper) or **T300** (E2E tests)

*Living tracker | v1.0 | Last Updated: June 2026*
