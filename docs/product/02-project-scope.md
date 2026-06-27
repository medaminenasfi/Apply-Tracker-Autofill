# 2. Project Scope

[← Back to index](../README.md)

## In scope (built or partially built)

### V1 — MVP

- Email/password auth, JWT cookies, Google OAuth (PARTIAL — needs prod credentials)
- Profile: name, email, phone, address, university, LinkedIn, portfolio, profile picture
- Multiple CVs (PDF) with primary CV selection
- Application tracker: Kanban on `/applicant`, CRUD, filters, notes, deadline, `cvUsed`
- Answer Vault: web UI + MongoDB sync + extension AV floater + popup Answers
- Chrome extension: autofill, save application, upload CV to page, job detect
- Admin panel: users, applications, stats, feedback moderation
- Feedback module with attachments
- Free tier: 20-application cap (enforced)
- EN/FR i18n (web + extension)

### V2 — Pro (scaffolded)

- Stripe billing (`/billing/*`, `/pricing`)
- Ghost save on submit click
- AI analyze-job + match score in extension
- In-app reminders + CV analytics widget
- Settings billing section

### V3 — Advanced (scaffolds)

- Auto-apply queue (`/auto-apply`)
- Interview simulator text mode (`/interview`)
- GitHub achievement harvest (`/achievements`)
- Counselor dashboard (`/enterprise`)

## Out of scope (all versions)

- Native iOS/Android apps
- Firefox or Safari extension (V1/V2)
- HR/recruiter-side product
- LinkedIn Easy Apply API integration
- Hosting job listings

## Future scope

- Production extension URLs + Chrome Web Store listing
- Email/push notifications
- PDF CV text extraction for match score
- Plan gates on AI/ghost features
- Job board scraper for auto-apply
- Audio interview (Whisper)
- Jira/LinkedIn OAuth harvest
- White-label enterprise

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
