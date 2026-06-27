# 14. Validation Rules

[← Back to index](../README.md)

Sources: [`frontend/lib/validators.ts`](../../frontend/lib/validators.ts), backend DTOs (`class-validator`).

## Registration / login (frontend)

| Field | Rules |
|-------|-------|
| firstName, lastName | Required, min 1 char |
| email | Valid email |
| password (signup) | Min 6 chars |
| confirmPassword | Must match password |
| password (login) | Required |

## Profile (frontend)

| Field | Rules |
|-------|-------|
| firstName, lastName, email | Required |
| email | Valid email |
| phone, countryCode, university, address | Optional |
| linkedin, portfolio | Valid URL or empty string |

## Application create (frontend)

| Field | Rules |
|-------|-------|
| company, position | Required, min 1 |
| url (jobUrl) | Valid URL |
| dateApplied | Required |
| note | **Required** on create (frontend) |
| deadline | Optional date string |
| status | applied, interview, accepted, rejected |
| source | manual, extension, ghost |
| cvUsed | Optional |

## Application edit (frontend)

Same as create except **note not in edit schema**; status required.

## Backend (CreateApplicationDto)

| Field | Rules |
|-------|-------|
| companyName, position, jobUrl | Required |
| status, dateApplied | Required |
| deadline, source, cvUsed, note | Optional |

## CV upload

| Rule | Value |
|------|-------|
| File type | PDF (profile controller) |
| Max size | **Suggested Solution:** 5MB |

## Answer vault

| Field | Rules |
|-------|-------|
| title, category, content | Required strings |
| favorite | Optional boolean |

## Known frontend/backend differences

- Frontend requires **note** on create; backend allows omit.
- Frontend signup password min **6**; strategy doc suggested 8+ with complexity — **Suggested Solution** align to 8+.

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
