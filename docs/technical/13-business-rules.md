# 13. Business Rules

[← Back to index](../README.md)

| ID | Rule | Status |
|----|------|--------|
| BR-01 | Free users max **20 applications**; create returns 403 when exceeded | DONE |
| BR-02 | Pro features should require active subscription | NOT DONE (only app count gated) |
| BR-03 | Subscription lapse → revert to free on webhook `subscription.deleted` | PARTIAL (webhook implemented) |
| BR-04 | CV files scoped to owner; preview via controlled routes | DONE |
| BR-05 | Duplicate company+position warning | NOT DONE |
| BR-06 | Reminders only for applied/interview statuses | PARTIAL (in RemindersService) |
| BR-07 | Follow-up reminder 7–14 days after apply if still "applied" | PARTIAL |
| BR-08 | Deadline reminders within 7 days | PARTIAL |
| BR-09 | OpenAI calls optional; heuristic fallback if no API key | DONE |
| BR-10 | Admin cannot read user CV content via admin API | DONE (no such endpoint) |
| BR-11 | Ghost save only when extension token present | DONE |
| BR-12 | Cancelled subscription access until period end | **Suggested Solution** — verify Stripe config |
| BR-13 | Extension shares web JWT via sync/cookies | DONE |
| BR-14 | Match score cache 24h per job URL | NOT DONE |
| BR-15 | Beta registration blocked when `BETA_MAX_USERS` reached | PARTIAL (env must be set) |
| BR-16 | `create-admin` requires `ADMIN_SETUP_SECRET` or non-production | DONE |
| BR-17 | Notes created on application POST when `note` field provided | DONE |
| BR-18 | Application `userId` must be string in all collections | DONE (enforced + system check) |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
