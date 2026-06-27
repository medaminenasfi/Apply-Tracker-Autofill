# 8. Complete Feature List

[← Back to index](../README.md)

## Core features (V1 — DONE)

- User registration and login (JWT cookies)
- Forgot / reset password
- Profile CRUD with address
- Multiple CV upload, primary CV, preview
- Profile picture
- Kanban application tracker (`/applicant`)
- Application CRUD, drag status, filters, search
- Notes per application
- Deadline and `cvUsed` fields
- 20-application free cap
- Answer Vault (web + MongoDB + extension)
- Chrome extension autofill (EN/FR)
- Extension manual save application
- Extension CV upload to page
- Job company/title detection
- Admin: users, applications, stats
- Feedback submit + admin moderation
- OAuth callback page (fixed)
- `extension.zip` download
- EN/FR i18n

## Optional / partial (V2)

- Stripe checkout, portal, webhooks — **PARTIAL**
- `/pricing` and settings billing — **PARTIAL**
- Ghost save on submit — **DONE**
- AI analyze-job + match score — **DONE**
- In-app reminders widget — **PARTIAL**
- CV version analytics — **PARTIAL**
- Plan gates on premium APIs — **NOT DONE**
- Email notifications — **NOT DONE**
- Post-apply save prompt — **NOT DONE**
- Production extension URLs — **NOT DONE**

## Future features (V3+)

- Job board scraper for auto-apply
- Full auto-apply with tailored cover letter
- Audio interview (Whisper)
- GitHub OAuth (public API harvest exists)
- Jira / LinkedIn harvest
- Enterprise bulk licensing
- White-label branding
- Dedicated `/notifications` page
- Application detail route `/applications/:id`
- Admin feature flags / logs pages

## Completed count summary

| Bucket | Count (approx.) |
|--------|-----------------|
| Core (DONE) | 28 |
| Partial (V2) | 8 |
| Not done | 12 |
| Future (V3+) | 10 |

See [Master Plan](../planning/MASTER_PLAN_V1-V3.md) for module-level status.

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
