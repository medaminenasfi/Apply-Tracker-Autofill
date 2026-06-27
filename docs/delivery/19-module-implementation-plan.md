# 19. Module-by-Module Implementation Plan

[← Back to index](../README.md)

## auth — DONE

| Area | Status |
|------|--------|
| Objective | Register, login, JWT, OAuth, password reset |
| DB | users collection |
| Backend | auth.controller, auth.service, JWT strategy |
| Frontend | login, signup, forgot/reset, callback |
| DoD | User can register, login, reset password |

## users — DONE

| Area | Status |
|------|--------|
| Objective | User entity, plan, Stripe fields |
| DB | users |
| Backend | users.service (getPlan, updateBilling) |
| DoD | Plan and billing fields persist |

## profile — DONE

| Area | Status |
|------|--------|
| Objective | Profile + multi-CV + avatar |
| DB | profiles, cvdocuments |
| Backend | profile.controller (CRUD, CV) |
| Frontend | ProfileForm, CV UI |
| DoD | Extension receives profile via `/extension/profile` |

## applications — DONE

| Area | Status |
|------|--------|
| Objective | Tracker CRUD + 20-cap |
| DB | applications |
| Backend | applications.service with assertCanCreateApplication |
| Frontend | Kanban, Add/Edit modals |
| DoD | Full Kanban workflow |

## notes — DONE

| Area | Status |
|------|--------|
| Objective | Per-application notes |
| DB | notes |
| Backend | notes.controller |
| Frontend | ApplicationCard note UI |
| DoD | Notes on create and per card |

## answer-vault — DONE

| Area | Status |
|------|--------|
| Objective | Cloud-synced answer library |
| DB | vaultanswers |
| Backend | answer-vault.controller + sync |
| Frontend | AnswerVaultSection, answerVaultStore |
| Extension | answer-vault.js, popup Answers |
| DoD | CRUD + cross-device sync |

## extension — DONE

| Area | Status |
|------|--------|
| Objective | Autofill, save, ghost, analyze |
| Backend | extension.controller |
| Extension | content.js, popup.js |
| DoD | End-to-end extension flow |

## ai — PARTIAL

| Area | Status |
|------|--------|
| Objective | Job analysis + match score |
| Backend | ai.service (OpenAI + heuristic) |
| Pending | Plan guard, PDF CV text, caching |
| DoD | Pro-only gated analysis with cache |

## billing — PARTIAL

| Area | Status |
|------|--------|
| Objective | Stripe subscriptions |
| Backend | billing.controller, webhook |
| Frontend | /pricing, /settings billing |
| Pending | Live Stripe keys, plan enforcement |
| DoD | User can subscribe and features unlock |

## reminders — PARTIAL

| Area | Status |
|------|--------|
| Objective | Follow-up + deadline alerts |
| Backend | reminders.service |
| Frontend | RemindersWidget |
| Pending | Email, cron, notification page |
| DoD | User gets timely reminders in-app and email |

## feedback — DONE

| Area | Status |
|------|--------|
| Objective | User feedback + admin reply |
| DB | feedback |
| Frontend | feedback page, admin moderation |
| DoD | Submit and resolve feedback |

## admin — DONE

| Area | Status |
|------|--------|
| Objective | Ops dashboard |
| Backend | admin.controller |
| Frontend | admin pages + AdminProtectedRoute |
| DoD | Admin manages users and apps |

## auto-apply — PARTIAL (V3)

| Objective | Queue + approve workflow |
| Pending | Job discovery scraper, AI cover letters |
| DoD | User approves auto-discovered jobs |

## interview — PARTIAL (V3)

| Objective | Text interview simulation |
| Pending | Audio, Whisper, webcam |
| DoD | Full mock interview with feedback |

## achievements — PARTIAL (V3)

| Objective | GitHub harvest + journal |
| Pending | OAuth, Jira, AI bullet points |
| DoD | Living resume from integrations |

## enterprise — PARTIAL (V3)

| Objective | Counselor dashboard |
| Pending | Bulk licenses, branding |
| DoD | University admin sees cohort progress |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
