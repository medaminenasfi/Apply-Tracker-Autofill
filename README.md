# ApplyFlow — Job Application Tracker + Chrome Autofill

**ApplyFlow** (ApplyFlowo on the marketing site) is a full-stack job search assistant: track applications on a Kanban board, manage your profile and CVs, save reusable answers, and autofill job forms from a **Chrome Extension (Manifest V3)**.

> **Monetization:** Free tier for core features. **Premium is paid via [Stripe](https://stripe.com)** (subscriptions / checkout). See [Pricing & Stripe](#pricing--stripe) below.

---

## Table of contents

1. [What it does](#what-it-does)
2. [Modules overview](#modules-overview)
3. [Pricing & Stripe](#pricing--stripe)
4. [Architecture](#architecture)
5. [Tech stack](#tech-stack)
6. [Quick start](#quick-start)
7. [Environment variables](#environment-variables)
8. [Chrome extension](#chrome-extension)
9. [API reference](#api-reference)
10. [Project structure](#project-structure)
11. [Docker](#docker)
12. [Admin panel](#admin-panel)
13. [Internationalization](#internationalization)
14. [Known limitations](#known-limitations)
15. [Roadmap](#roadmap)

---

## What it does

| Problem | ApplyFlow solution |
|--------|---------------------|
| Repetitive form filling | Chrome extension autofill from your saved profile |
| Lost track of applications | Kanban tracker: Applied → Interview → Accepted / Rejected |
| Same answers on every form | Answer Vault — reusable text snippets + extension quick picker |
| Multiple CV versions | Profile supports several CVs + one “main” CV for autofill |
| Scattered job links & notes | Each application stores company, title, URL, dates, notes, source |

**Typical flow**

1. Sign up on the web app → complete **Profile** (name, email, phone, LinkedIn, portfolio, CV).
2. Install the **Chrome extension** → sync login from the website.
3. On a job page → click **Autofill** in the popup (or use **Answer Vault** on the page).
4. Save the application from the extension or add it manually on **`/applicant`**.
5. Drag cards on the Kanban board to update status.

---

## Modules overview

### Module 1 — Authentication & accounts

- Email/password signup and login
- JWT stored in HTTP-only cookies (`user_token` / `admin_token`)
- Google OAuth callback support (`/auth/callback`)
- Forgot / reset password (email via Nodemailer when configured)
- Role-based access: **user** vs **admin**

**Routes:** `/login`, `/signup`, `/forgot-password`, `/reset-password`

---

### Module 2 — Profile & CV management

- Personal info: first name, last name, email, phone, country code, university, LinkedIn, portfolio
- Profile picture upload
- **Multiple CVs (PDF)** with:
  - Upload / delete per file
  - Set **main CV** used by the extension for autofill/upload hints
  - In-app PDF preview (public preview URL for iframe)
- Profile completion indicator
- **Favorite answers preview** on the Profile tab (from Answer Vault)

**Route:** `/profile` (tabs: Profile | Answer Vault)

---

### Module 3 — Answer Vault

Manual library of reusable application answers (no AI in V1).

- Categories, title, content, favorites
- Stored in browser local storage + synced in the web UI
- **Extension:** floating **AV** button on job pages — category filters, favorites, recent, insert into focused field with clipboard fallback
- Sidebar link: `/profile?tab=vault`

---

### Module 4 — Application Tracker (V1)

**Route:** `/applicant` — Kanban board

| Field | V1 |
|-------|-----|
| Company name | Required |
| Job title | Required |
| Job link | Required |
| Status | Required — Applied, Interview, Accepted, Rejected |
| Date applied | Required |
| Notes | Required on create; editable per card afterward |
| Deadline | Optional |
| Source | Optional — Manual / Extension |
| CV used | V2 (schema ready) |

**Features**

- Full **CRUD** (create modal, edit modal, delete with confirm)
- **Status change** via drag-and-drop or edit form
- **Filters:** search (company/title), status, source
- **Notes:** separate notes collection per application (add / edit / delete)

---

### Module 5 — Dashboard

**Route:** `/dashboard`

- Overview stats and quick navigation
- Entry point after login

---

### Module 6 — Chrome Extension (Basic Autofill)

**Folder:** `extension/` — **Manifest V3**

| Spec item | Status |
|-----------|--------|
| `manifest.json` MV3 | ✅ |
| Popup: **Autofill** | ✅ |
| Popup: **Save Application** | ✅ |
| Popup: **Answers** | ⚠️ On-page **AV** button (`answer-vault.js`), not a popup button yet |
| `content.js` field detection | ✅ inputs + country-code selects |
| Fields: name, email, phone, linkedin, portfolio | ✅ |
| Field: address | ❌ not in profile yet |
| Secure backend communication | ✅ Bearer JWT + `x-app-role: user` |

**Extra (beyond basic spec):** CV upload assistant, job title/company detection, website token sync, EN/FR i18n.

**Install:** `chrome://extensions` → Developer mode → Load unpacked → select `extension/`

See also: [`extension/README.md`](extension/README.md), [`extension/PRODUCTION_SETUP.md`](extension/PRODUCTION_SETUP.md)

---

### Module 7 — Feedback

- Users submit feedback (rating + message) from the app
- Admin can review feedback in the admin panel

**Routes:** `/feedback`, `/admin/feedback`

---

### Module 8 — Settings

**Route:** `/settings` — account preferences (theme, language context via app providers)

---

### Module 9 — Admin panel

**Routes:** `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/applications`, `/admin/feedback`

- Platform statistics (users, applications, status breakdown)
- User list & delete
- All applications & delete
- Feedback moderation

Create admin once: `node backend/create-admin.js`

---

### Module 10 — Landing & marketing

**Route:** `/` — product landing (features, how it works, FAQ, reviews)

- Bilingual EN / FR
- Extension download page: `/extension`

---

## Pricing & Stripe

ApplyFlow uses a **freemium** model. **Payments are handled by Stripe** (cards, subscriptions, customer portal).

### Free tier (current)

Included at no cost:

- Chrome extension (autofill + save application)
- Application tracker (Kanban, CRUD, filters)
- Profile + one CV
- Answer Vault (manual)
- Basic dashboard

No credit card required to start (see landing FAQ).

### Premium (paid via Stripe)

Premium unlocks power-user features (exact list can evolve):

| Premium feature | Description |
|-----------------|-------------|
| Unlimited applications | Higher or no cap vs free tier |
| Multiple CVs | Full multi-CV management (free may limit count) |
| Advanced analytics | Response rates, funnel stats, exports |
| Priority support | Faster feedback handling |
| Early access | New autofill sites & integrations |

**How Stripe fits in (architecture)**

```
User → Pricing page → Stripe Checkout / Customer Portal
                              ↓
                    Stripe Webhook → Backend
                              ↓
              User record: plan, stripeCustomerId, subscriptionStatus
                              ↓
              API + Extension enforce premium limits
```

**Planned backend env (Stripe)**

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
FRONTEND_URL=https://your-app.com
```

**Planned frontend env**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> **Note:** Stripe Checkout, webhooks, and subscription gates are part of the **product design**. Wire them before production launch; the open-source/dev build may run fully unlocked until billing is enabled.

**Suggested Stripe setup checklist**

1. Create Stripe account + Products / Prices (monthly & yearly).
2. Add Checkout Session endpoint: `POST /billing/checkout`.
3. Add webhook handler: `POST /billing/webhook` (subscription created/updated/deleted).
4. Store `stripeCustomerId` and `plan` on the User model in MongoDB.
5. Add `/pricing` page with “Upgrade” → Stripe Checkout.
6. Add Customer Portal link for manage/cancel subscription.
7. Gate premium APIs and extension features server-side (never trust the client alone).

---

## Architecture

```
┌─────────────────┐     JWT (cookie / Bearer)     ┌─────────────────┐
│  Next.js        │ ◄──────────────────────────► │  NestJS API     │
│  Frontend :3001 │                               │  Backend :3000  │
└────────┬────────┘                               └────────┬────────┘
         │                                                  │
         │  auth-content.js sync on localhost:3001          │ Mongoose
         ▼                                                  ▼
┌─────────────────┐                               ┌─────────────────┐
│ Chrome Extension│ ─── content.js / popup.js ──►│  MongoDB Atlas  │
│  (MV3)          │     /extension/* routes       │  or local       │
└─────────────────┘                               └─────────────────┘
         │
         │  Premium upgrade
         ▼
┌─────────────────┐
│     Stripe      │  Checkout · Subscriptions · Webhooks
└─────────────────┘
```

**Auth rules**

- Web app: HTTP-only cookies + `x-app-role` header on API calls
- Extension: JWT in `chrome.storage.local`, `Authorization: Bearer` + `x-app-role: user`
- Admin routes require `admin_token` and admin role

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, React Hook Form, Zod, dnd-kit, Framer Motion, i18next |
| Backend | NestJS 11, TypeScript, MongoDB, Mongoose, JWT, Passport, Multer, class-validator |
| Extension | Chrome MV3, vanilla JS, content scripts, service worker |
| Payments | **Stripe** (Checkout, Subscriptions, Webhooks) |
| DevOps | Docker Compose (optional), GitHub Actions CI on backend |

---

## Quick start

### Prerequisites

- **Node.js 18+**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Chrome** (for the extension)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/apply-tracker
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=http://localhost:3001
```

```bash
node create-admin.js    # optional: admin@example.com / admin123
npm run start:dev       # NOT "nest start" — use this script
```

API: **http://localhost:3000** · Health: **http://localhost:3000/health**

> After backend code changes, **restart** `npm run start:dev` (no hot reload).

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm run dev
```

App: **http://localhost:3001**

### 3. Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `extension/` folder
4. Log in on the website → extension → **Sync from Website**

### 4. MongoDB Atlas

If the backend logs `ETIMEDOUT`, whitelist your IP in Atlas → **Network Access**.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signing secret for JWT |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `PORT` | No | Default `3000` |
| `FRONTEND_URL` | Yes | CORS + OAuth redirects |
| `GOOGLE_CLIENT_ID` | OAuth | Google login |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google login |
| `SMTP_*` | Email | Password reset emails |
| `STRIPE_SECRET_KEY` | Billing | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Billing | Webhook signature verification |
| `STRIPE_PRICE_ID_*` | Billing | Price IDs for plans |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing | Stripe publishable key |

---

## Chrome extension

### Popup actions

| Button | Action |
|--------|--------|
| **Autofill** | Sends profile to `content.js` → fills detected fields |
| **Upload CV** | Attempts CV file input on the page |
| **Save Application** | POST `/extension/save-application` with company, role, URL, note |

### Content scripts

| File | Role |
|------|------|
| `content.js` | Autofill, job detection, CV upload helper |
| `answer-vault.js` | Floating Answer Vault (**AV**) on all URLs |
| `auth-content.js` | Token sync on the ApplyFlow website only |
| `background.js` | Persist token/user in `chrome.storage.local` |

### Field detection (autofill)

Detects via `name`, `id`, `placeholder`, `aria-label`, and associated `<label>`:

- First / last / full **name**
- **Email**
- **Phone** (+ country code selects where present)
- **LinkedIn**
- **Portfolio** / website

Uses `setNativeValue` for React-controlled inputs.

### Production

Update URLs in `manifest.json`, `popup.js`, and `config.js` — see [`extension/PRODUCTION_SETUP.md`](extension/PRODUCTION_SETUP.md).

---

## API reference

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login → JWT |
| POST | `/auth/forgot-password` | Request reset |
| POST | `/auth/reset-password` | Reset password |

### Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile |
| GET/POST | `/profile/cvs` | List / upload CVs |
| PATCH | `/profile/cvs/:id/primary` | Set main CV |
| DELETE | `/profile/cvs/:id` | Delete CV |
| GET | `/profile/cv/public-preview/:filename` | PDF preview (public) |

### Applications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | List user applications |
| POST | `/applications` | Create (+ optional initial note) |
| GET | `/applications/:id` | Get one |
| PUT | `/applications/:id` | Update |
| PATCH | `/applications/:id/status` | Update status only |
| DELETE | `/applications/:id` | Delete |

### Notes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notes?applicationId=` | List notes |
| POST | `/notes` | Create note |
| PATCH | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Delete note |

### Extension (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/extension/profile` | Profile + CV list for autofill |
| POST | `/extension/save-application` | Save from extension |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/stats` | Platform stats |
| GET | `/admin/users` | All users |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/applications` | All applications |
| DELETE | `/admin/applications/:id` | Delete application |

### Billing (Stripe — planned)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/billing/checkout` | Create Stripe Checkout session |
| POST | `/billing/webhook` | Stripe event webhook |
| GET | `/billing/portal` | Customer portal session |

---

## Project structure

```
Apply Tracker + Autofill/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── admin/
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── extension/
│   │   ├── feedback/
│   │   ├── notes/
│   │   ├── profile/
│   │   └── users/
│   ├── create-admin.js
│   └── tsconfig.build.json  # excludes tests from build
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── applicant/       # Kanban tracker
│   │   ├── dashboard/
│   │   ├── profile/         # Profile + Answer Vault tabs
│   │   ├── admin/
│   │   └── ...
│   ├── components/
│   ├── store/               # Zustand (auth, applications, answer vault)
│   └── messages/            # en.json, fr.json
├── extension/               # Chrome MV3 extension
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── content.js
│   ├── answer-vault.js
│   ├── auth-content.js
│   └── background.js
├── docker-compose.yml
└── README.md
```

---

## Docker

```bash
docker compose up --build
```

| Service | Host port | Notes |
|---------|-----------|-------|
| Backend | 3002 | Maps to container 3000 |
| Frontend | 3003 | Maps to container 3001 |

Set `NEXT_PUBLIC_API_URL=http://localhost:3002` for the frontend container.

---

## Admin panel

Default credentials (after `create-admin.js`):

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |

Change these immediately in production.

---

## Internationalization

- Web app: **English** and **French** (`frontend/messages/`)
- Extension: `_locales/en` and `_locales/fr`
- Language switcher on landing and in app shell

---

## Known limitations

| Area | Limitation |
|------|------------|
| Extension | Autofill targets `<input>` mainly; `textarea` / `address` not fully covered |
| Extension | Some sites block programmatic file upload — manual CV upload fallback |
| Extension | Token sync needs website open or manual **Sync from Website** |
| Profile | Created on first visit to `/profile`, not automatically on signup |
| Files | CV max ~5 MB, PDF; profile picture max ~5 MB |
| Backend | `npm run start:dev` does not hot-reload — restart after changes |
| Billing | Stripe endpoints must be implemented before charging users |
| Storage | Uploads stored on server disk — use S3/Cloudinary for production scale |

---

## Roadmap

- [ ] **Stripe Checkout + webhooks** — live premium subscriptions
- [ ] **Pricing page** (`/pricing`) wired to Stripe
- [ ] **Answers** button in extension popup (parity with AV floater)
- [ ] **Address** field on profile + autofill
- [ ] **CV used** on application records (V2)
- [ ] Cloud file storage for CVs and profile pictures
- [ ] Chrome Web Store publication

---

## Demo checklist

### User

- [ ] Sign up / log in
- [ ] Complete profile + upload CV(s)
- [ ] Add Answer Vault entries
- [ ] Add / edit / delete applications on `/applicant`
- [ ] Drag Kanban cards between statuses
- [ ] Install extension → Sync from Website → Autofill on a job form
- [ ] Save application from extension → verify on Kanban

### Admin

- [ ] Log in at `/admin/login`
- [ ] View stats, users, applications, feedback
- [ ] Delete test data

### Billing (when Stripe is live)

- [ ] Upgrade to Premium via Checkout
- [ ] Webhook updates subscription status
- [ ] Premium features unlock; cancel via Customer Portal

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend unhealthy / timeout | Check MongoDB URI + Atlas IP whitelist |
| `Cannot GET /profile/cvs` | Restart backend with latest code |
| Application create 500 | Restart backend; check validation errors in terminal |
| Extension not synced | Open site logged in → **Sync from Website** |
| Autofill empty fields | Field names may not match — extend selectors in `content.js` |
| Use `nest start` fails | Use `npm run start:dev` in `backend/` |

---

## License

Proprietary / demonstration project. Contact the owner for commercial use.

---

## Support

- In-app **Feedback** (`/feedback`)
- Admin feedback inbox for triage

**Apply smarter. Get hired faster.**
