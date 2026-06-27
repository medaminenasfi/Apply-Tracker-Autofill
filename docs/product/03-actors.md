# 3. Actors

[← Back to index](../README.md)

| Actor | Description | Permissions | Responsibilities |
|-------|-------------|-------------|------------------|
| **Guest** | Unauthenticated visitor | View landing, register, login, pricing, extension install page | Sign up, learn about product |
| **Free User** | Registered user on free plan | Profile, vault, track up to 20 apps, basic autofill, extension save | Complete profile, track applications |
| **Pro User** | Paying subscriber (when Stripe live) | Unlimited apps + AI/ghost (intended; plan gates NOT DONE yet) | Use Pro features, manage billing |
| **Admin** | Internal operator | Full admin API + `/admin/*` routes | Monitor users, moderate feedback, view stats |
| **Chrome Extension** | MV3 client | Bearer JWT + `x-app-role: user` | Autofill, ghost save, analyze job, sync auth |
| **Enterprise Counselor** | PARTIAL — org admin | `/enterprise/counselor/dashboard` | View aggregate student stats (scaffold) |

## Role matrix

| Capability | Guest | Free | Pro | Admin |
|------------|-------|------|-----|-------|
| Register / login | Yes | Yes | Yes | Admin login |
| Profile + CV | — | Yes | Yes | — |
| Kanban tracker | — | Yes (20 cap) | Yes (unlimited*) | View all |
| Answer Vault | — | Yes | Yes | — |
| Extension autofill | — | Yes | Yes | — |
| AI match / ghost | — | Yes** | Yes** | — |
| Stripe billing | — | Upgrade CTA | Manage | — |
| Admin panel | — | — | — | Yes |

\* Unlimited when `plan !== 'free'` (enforced in `ApplicationsService`).  
\** Implemented but not gated by plan yet — **NOT DONE** for monetization.

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
