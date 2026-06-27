# 16. Recommended Folder Structure

[← Back to index](../README.md)

Actual repository layout (not a fictional mono-repo name).

```text
Apply Tracker + Autofill/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── profile/
│   │   ├── applications/
│   │   ├── notes/
│   │   ├── extension/
│   │   ├── answer-vault/
│   │   ├── billing/
│   │   ├── ai/
│   │   ├── reminders/
│   │   ├── feedback/
│   │   ├── admin/
│   │   ├── auto-apply/      # V3
│   │   ├── interview/       # V3
│   │   ├── achievements/    # V3
│   │   ├── enterprise/      # V3
│   │   ├── common/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/             # CV + profile pictures (dev)
│   └── package.json
├── frontend/                # Next.js app
│   ├── app/                 # App router pages
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── messages/            # i18n
│   └── public/
│       └── downloads/
│           └── extension.zip
├── extension/               # Chrome MV3
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── content.js
│   ├── answer-vault.js
│   ├── background.js
│   └── auth-content.js
├── docs/                    # This documentation (SSOT)
│   ├── README.md
│   ├── planning/
│   ├── product/
│   ├── ux/
│   ├── technical/
│   ├── delivery/
│   ├── operations/
│   └── resume/
└── README.md                # Developer quick start
```

## Key frontend paths

| Path | Purpose |
|------|---------|
| `app/applicant/` | Kanban tracker |
| `app/profile/` | Profile + vault |
| `components/dashboard/` | Kanban, modals |
| `store/answerVaultStore.ts` | Vault state + sync |

## Key backend paths

| Path | Purpose |
|------|---------|
| `applications/applications.service.ts` | CRUD + 20-cap |
| `extension/extension.controller.ts` | Extension API |
| `billing/billing.controller.ts` | Stripe |

## Documentation

All product/technical SSOT lives under **`docs/`**. Do not duplicate long specs in README — link to `docs/README.md`.

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
