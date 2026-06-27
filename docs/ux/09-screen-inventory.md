# 9. Screen Inventory

[← Back to index](../README.md)

## WEB — Public (unauthenticated)

| Route | Purpose | Components | Actions | Status |
|-------|---------|------------|---------|--------|
| `/` | Landing / marketing | Hero, features, CTA | → Register, Login | DONE |
| `/login` | User login | AuthLayout, form | Submit login | DONE |
| `/signup` | Registration | SignupForm | Create account | DONE |
| `/forgot-password` | Request reset | Email form | Send reset link | DONE |
| `/reset-password` | Set new password | Token + password form | Reset | DONE |
| `/auth/callback` | Google OAuth return | Token handler | Sync session | PARTIAL |
| `/pricing` | Plan comparison | Pricing cards | Checkout CTA | DONE |
| `/extension` | Install guide | Steps, download link | Download zip | DONE |

## WEB — Authenticated (user)

| Route | Purpose | Components | Actions | Status |
|-------|---------|------------|---------|--------|
| `/dashboard` | Stats overview | Charts, stats cards | Navigate to applicant | DONE |
| `/applicant` | Kanban tracker | KanbanBoard, filters, RemindersWidget | Add/edit/delete apps | DONE |
| `/profile` | Profile + vault tabs | ProfileForm, AnswerVaultSection | Save profile, manage vault | DONE |
| `/settings` | Account + billing | Cards | View plan, billing portal | PARTIAL |
| `/feedback` | Submit feedback | FeedbackModal/page | Upload, submit | DONE |
| `/auto-apply` | V3 queue | Queue list | Approve items | PARTIAL |
| `/interview` | V3 interview sim | Q&A form | Start session, submit answers | PARTIAL |
| `/achievements` | V3 harvest | GitHub input, list | Harvest, view | PARTIAL |
| `/enterprise` | Counselor view | Stats cards | View org stats | PARTIAL |

## WEB — Admin

| Route | Purpose | Status |
|-------|---------|--------|
| `/admin/login` | Admin auth | DONE |
| `/admin/dashboard` | Platform stats | DONE |
| `/admin/users` | User management | DONE |
| `/admin/applications` | All applications | DONE |
| `/admin/feedback` | Feedback list | DONE |
| `/admin/feedback/[id]` | Feedback detail + reply | DONE |

## Chrome Extension

| UI | Purpose | Actions | Status |
|----|---------|---------|--------|
| Login view | Email login or sync from site | Login, sync | DONE |
| Profile view | Quick actions | Autofill, Upload CV, Answers, Match | DONE |
| Save form | Manual application save | Submit to API | DONE |
| Match panel | Score + keywords | View analysis | DONE |
| Content: AV floater | Vault paste on page | Pick answer | DONE |
| Content: ghost listener | Auto-save on submit | Background POST | DONE |

## Missing / future screens (not in repo)

| Screen | Notes |
|--------|-------|
| `/applications/:id` | Detail uses modals on `/applicant` instead |
| `/notifications` | Reminders on `/applicant` widget only |
| `/analytics` | Stats on `/dashboard` only |
| `/settings/billing` | Billing section inside `/settings` |
| `/admin/features` | Not built |
| `/admin/logs` | Not built |
| Mobile app | Out of scope |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
