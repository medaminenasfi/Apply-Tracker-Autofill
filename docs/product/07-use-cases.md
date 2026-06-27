# 7. Use Cases

[← Back to index](../README.md)

## UC-001: User Registration

| Field | Details |
|-------|---------|
| **ID** | UC-001 |
| **Actor** | Guest |
| **Description** | Create account with email and password |
| **Preconditions** | Email not registered; beta cap not exceeded if `BETA_MAX_USERS` set |
| **Main Flow** | 1. Visit `/signup`. 2. Enter name, email, password. 3. Submit. 4. Backend creates user + profile. 5. JWT cookie set. 6. Redirect to dashboard/profile. |
| **Alternative** | Email exists → error toast |
| **Exception** | Beta full → 403 with message |
| **Postconditions** | User logged in |

## UC-002: User Login

| Field | Details |
|-------|---------|
| **ID** | UC-002 |
| **Actor** | Registered user |
| **Main Flow** | `/login` → credentials → JWT → `/dashboard` or `/applicant` |
| **Alternative** | Invalid credentials → error |
| **Postconditions** | Session active |

## UC-003: Profile Setup

| Field | Details |
|-------|---------|
| **ID** | UC-003 |
| **Actor** | User |
| **Main Flow** | `/profile` → fill fields → upload CV → save → `PUT /profile` |
| **Alternative** | Invalid URL on LinkedIn → validation error |
| **Postconditions** | Extension can fetch `/extension/profile` |

## UC-004: Add Application Manually

| Field | Details |
|-------|---------|
| **ID** | UC-004 |
| **Actor** | User |
| **Preconditions** | Free user under 20 apps |
| **Main Flow** | `/applicant` → Add modal → fill company, title, URL, date, note → `POST /applications` → card on board |
| **Alternative** | 20-app limit → 403 / upgrade message |
| **Postconditions** | Application in Kanban |

## UC-005: Extension Autofill

| Field | Details |
|-------|---------|
| **ID** | UC-005 |
| **Actor** | User + extension |
| **Preconditions** | Logged in; on job form page |
| **Main Flow** | Open popup → Autofill → content script fills fields → job title/company detected into save form |
| **Alternative** | No fields → warning toast |
| **Postconditions** | Form populated |

## UC-006: Ghost Application Logging

| Field | Details |
|-------|---------|
| **ID** | UC-006 |
| **Actor** | User + extension |
| **Main Flow** | User clicks Submit/Apply → `POST /extension/ghost-save` → app in tracker with source `ghost` |
| **Alternative** | No token → silent skip |
| **Exception** | API fail → console warning |
| **Postconditions** | Application logged |

## UC-007: AI Match Score

| Field | Details |
|-------|---------|
| **ID** | UC-007 |
| **Actor** | User + extension |
| **Main Flow** | Match button → scrape page text → `POST /extension/analyze-job` → score + keywords in popup → optional fillAnswers |
| **Alternative** | No OpenAI key → heuristic score |
| **Postconditions** | User informed before submit |

## UC-008: Answer Vault Sync

| Field | Details |
|-------|---------|
| **ID** | UC-008 |
| **Actor** | User |
| **Main Flow** | Open vault tab → `initialize()` loads `/answer-vault` → merge with localStorage → edits call `POST /answer-vault/sync` |
| **Postconditions** | Cross-device consistency |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
