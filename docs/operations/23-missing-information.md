# 23. Missing Information

[← Back to index](../README.md)

| ID | Missing item | Impact | Suggested Solution |
|----|--------------|--------|-------------------|
| MI-01 | Final Free tier cap confirmed (20 vs 15) | Low | Keep 20 (implemented) |
| MI-02 | Email provider (SendGrid vs Resend) | Medium | Resend for dev simplicity |
| MI-03 | Production hosting choice | Medium | Vercel + Railway |
| MI-04 | Privacy policy URL | High | Required for Chrome Web Store |
| MI-05 | Google OAuth prod client ID/secret | Medium | Google Cloud Console |
| MI-06 | Stripe live price IDs | High | Stripe Dashboard products |
| MI-07 | Production API + frontend URLs for extension | High | env + extension/config.js |
| MI-08 | Job board priority list for QA | Medium | LinkedIn, Greenhouse, Workday, Lever, Indeed |
| MI-09 | GDPR / data export requirements | Medium | Export/delete endpoints |
| MI-10 | Enterprise pricing model | Low | Defer to V3 |
| MI-11 | OpenAI model per feature | Low | mini for score, 4o for matching |
| MI-12 | Post-apply save prompt UX spec | Low | Modal after ghost save |

## Contradictions resolved (template vs codebase)

| Topic | Old doc | Actual |
|-------|---------|--------|
| Tracker route | `/applications` | `/applicant` |
| Vault API | `/profile/answers` | `/answer-vault` |
| V2 progress | 0% | ~70% scaffolded |
| Mobile app | In screen inventory | Out of scope |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
