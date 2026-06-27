# 4. Functional Requirements

[← Back to index](../README.md)

Grouped by backend module. Status: **DONE** | **PARTIAL** | **NOT DONE**.

## Authentication (`auth`)

| ID | Requirement | Status |
|----|-------------|--------|
| AUTH-01 | Register with email/password | DONE |
| AUTH-02 | Passwords hashed (bcrypt) | DONE |
| AUTH-03 | JWT in HTTP-only cookies | DONE |
| AUTH-04 | Logout clears role cookie | DONE |
| AUTH-05 | Forgot / reset password | DONE |
| AUTH-06 | Google OAuth | PARTIAL |
| AUTH-07 | Admin separate login | DONE |
| AUTH-08 | Beta cap via `BETA_MAX_USERS` | PARTIAL |

## Profile (`profile`)

| ID | Requirement | Status |
|----|-------------|--------|
| PROF-01 | Name, email, phone, university, LinkedIn, portfolio | DONE |
| PROF-02 | Address field + extension autofill | DONE |
| PROF-03 | Profile picture upload/delete | DONE |
| PROF-04 | Multiple CVs + set primary | DONE |
| PROF-05 | CV preview (public preview URL) | DONE |
| PROF-06 | Structured skills field | NOT DONE |
| PROF-07 | Profile auto-create on register | DONE |

## Answer Vault (`answer-vault`)

| ID | Requirement | Status |
|----|-------------|--------|
| VAULT-01 | CRUD snippets by category | DONE |
| VAULT-02 | Favorites, search, recent (frontend) | DONE |
| VAULT-03 | MongoDB persistence + `/sync` | DONE |
| VAULT-04 | Extension AV floater + popup Answers | DONE |
| VAULT-05 | AI picks best answer (`analyze-job`) | DONE |
| VAULT-06 | Role-type tags (PM vs SWE) | NOT DONE |

## Applications (`applications`)

| ID | Requirement | Status |
|----|-------------|--------|
| TRACK-01 | Kanban: Applied, Interview, Accepted, Rejected | DONE |
| TRACK-02 | Required: company, position, job URL, status, date | DONE |
| TRACK-03 | Notes (separate `notes` module) | DONE |
| TRACK-04 | Deadline optional | DONE |
| TRACK-05 | Source: manual / extension / ghost | DONE |
| TRACK-06 | CRUD + drag status | DONE |
| TRACK-07 | Search + status + source filters | DONE |
| TRACK-08 | `cvUsed` per application | DONE |
| TRACK-09 | Free 20-app cap | DONE |

## Dashboard (`/dashboard`)

| ID | Requirement | Status |
|----|-------------|--------|
| DASH-01 | Stats cards, charts | DONE |
| DASH-02 | Profile completion modal | DONE |
| DASH-03 | Reminders widget on `/applicant` | PARTIAL |

## Extension (`extension`)

| ID | Requirement | Status |
|----|-------------|--------|
| EXT-01 | MV3 popup: Autofill, Save, Answers, Match | DONE |
| EXT-02 | Field detection EN/FR | DONE |
| EXT-03 | Autofill: name, email, phone, address, linkedin, portfolio, textarea | DONE |
| EXT-04 | Sync login from website | DONE |
| EXT-05 | CV upload to page | DONE |
| EXT-06 | Ghost save on submit | DONE |
| EXT-07 | `POST /extension/analyze-job` | DONE |
| EXT-08 | Production URLs | NOT DONE |
| EXT-09 | Post-apply save prompt | NOT DONE |

## Billing (`billing`)

| ID | Requirement | Status |
|----|-------------|--------|
| BILL-01 | Stripe checkout + portal + webhook | PARTIAL |
| BILL-02 | `/pricing` page | DONE |
| BILL-03 | User plan fields on schema | DONE |
| BILL-04 | Plan gates on AI/ghost | NOT DONE |

## Reminders (`reminders`)

| ID | Requirement | Status |
|----|-------------|--------|
| REM-01 | Deadline / follow-up / interview in-app | PARTIAL |
| REM-02 | CV analytics by version | PARTIAL |
| REM-03 | Email notifications | NOT DONE |

## Admin (`admin`)

| ID | Requirement | Status |
|----|-------------|--------|
| ADMIN-01 | Users, applications, stats | DONE |
| ADMIN-02 | Feedback moderation (guarded routes) | DONE |
| ADMIN-03 | `create-admin` guarded by secret | DONE |

## Feedback (`feedback`)

| ID | Requirement | Status |
|----|-------------|--------|
| FB-01 | User submit + attachment upload | DONE |
| FB-02 | Admin reply + status | DONE |

## V3 modules (scaffolds)

| Module | Key endpoints | Status |
|--------|---------------|--------|
| `auto-apply` | criteria, queue, approve | PARTIAL |
| `interview` | sessions, answer | PARTIAL |
| `achievements` | list, GitHub harvest, journal | PARTIAL |
| `enterprise` | counselor dashboard, organizations | PARTIAL |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
