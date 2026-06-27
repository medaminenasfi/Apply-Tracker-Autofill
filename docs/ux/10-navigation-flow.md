# 10. Navigation Flow

[← Back to index](../README.md)

```mermaid
flowchart TD
  landing["/ Landing"]
  login["/login"]
  signup["/signup"]
  dashboard["/dashboard"]
  applicant["/applicant"]
  profile["/profile"]
  settings["/settings"]
  pricing["/pricing"]
  extPage["/extension"]

  landing --> login
  landing --> signup
  landing --> pricing
  landing --> extPage
  login --> dashboard
  signup --> dashboard
  dashboard --> applicant
  dashboard --> profile
  dashboard --> settings
  applicant --> profile
  settings --> pricing

  subgraph adminFlow [Admin]
    adminLogin["/admin/login"]
    adminDash["/admin/dashboard"]
    adminUsers["/admin/users"]
    adminFeedback["/admin/feedback"]
    adminLogin --> adminDash
    adminDash --> adminUsers
    adminDash --> adminFeedback
  end

  subgraph extFlow [Chrome Extension]
    popup["Popup"]
    content["Content Script"]
    popup -->|"Autofill"| content
    popup -->|"Answers / Match"| content
    content -->|"ghost-save"| api["POST /extension/ghost-save"]
    popup -->|"Save form"| api2["POST /extension/save-application"]
  end
```

## Primary user journeys

1. **Onboard:** Landing → Signup → Profile → Extension install page → Sync extension
2. **Apply:** Job site → Extension Autofill → (optional Match) → Submit → Ghost save → `/applicant`
3. **Track:** `/applicant` → drag card → edit modal → notes
4. **Upgrade:** `/pricing` → Stripe checkout → `/settings?billing=success`

## Sidebar / navbar (authenticated)

Typical links: Dashboard, Applicant (tracker), Profile, Settings, Feedback, Extension (external).

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
