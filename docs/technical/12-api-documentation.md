# 12. API Documentation

[← Back to index](../README.md)

**Base URL (dev):** `http://localhost:3000`  
**Auth:** HTTP-only cookies + `Authorization: Bearer <token>` for extension  
**Header:** `x-app-role: user` or `admin`

## Health

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/health` | No | Health check |

## Authentication

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Yes | Clear cookie |
| GET | `/auth/me` | Yes | Current user |
| POST | `/auth/forgot-password` | No | Request reset |
| POST | `/auth/reset-password` | No | Reset password |
| GET | `/auth/google` | No | OAuth redirect |
| GET | `/auth/google/callback` | No | OAuth callback |

<details>
<summary>Example: POST /auth/login</summary>

Request:

```json
{ "email": "user@example.com", "password": "secret" }
```

Response: Sets cookie; returns user + access_token (extension may use token).
</details>

## Profile

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/profile` | User | Get profile |
| PUT | `/profile` | User | Update profile |
| GET | `/profile/cvs` | User | List CVs |
| POST | `/profile/cv` | User | Upload CV (multipart) |
| PATCH | `/profile/cvs/:id/primary` | User | Set primary CV |
| DELETE | `/profile/cvs/:id` | User | Delete CV |
| POST | `/profile/profile-picture` | User | Upload avatar |
| DELETE | `/profile/profile-picture` | User | Remove avatar |

## Applications

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/applications` | User | List user's apps |
| POST | `/applications` | User | Create (20-cap on free) |
| GET | `/applications/:id` | User | Get one |
| PUT | `/applications/:id` | User | Update |
| PATCH | `/applications/:id/status` | User | Status only |
| DELETE | `/applications/:id` | User | Delete |

## Notes (nested under applications)

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/applications/:id/notes` | User | Add note |
| GET | `/applications/:id/notes` | User | List notes |
| PATCH | `/applications/:id/notes/:noteId` | User | Update note |
| DELETE | `/applications/:id/notes/:noteId` | User | Delete note |

## Answer Vault

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/answer-vault` | User | List answers |
| POST | `/answer-vault` | User | Create |
| PUT | `/answer-vault/:id` | User | Update |
| DELETE | `/answer-vault/:id` | User | Delete |
| POST | `/answer-vault/sync` | User | Replace all `{ answers: [...] }` |

## Extension

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/extension/profile` | User | Profile + CV for autofill |
| POST | `/extension/save-application` | User | Manual save |
| POST | `/extension/ghost-save` | User | Ghost logging |
| POST | `/extension/analyze-job` | User | AI match + suggestions |

<details>
<summary>Example: POST /extension/analyze-job</summary>

Request:

```json
{ "jobDescription": "We need a React developer...", "cvText": "optional" }
```

Response:

```json
{
  "matchScore": 78,
  "missingKeywords": ["Python", "Agile"],
  "suggestedAnswers": [{ "answerId": "...", "title": "...", "content": "...", "score": 90 }],
  "summary": "Good keyword overlap."
}
```
</details>

## Billing

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/billing/plans` | No | Plan metadata |
| POST | `/billing/checkout` | User | Stripe checkout session |
| POST | `/billing/portal` | User | Customer portal |
| POST | `/billing/webhook` | Stripe sig | Webhook (raw body) |

## Reminders

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/reminders` | User | In-app reminder list |
| GET | `/reminders/cv-analytics` | User | CV performance stats |

## Feedback

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/feedback` | User | Submit |
| POST | `/feedback/upload` | User | Attachment |
| GET | `/feedback/my` | User | Own feedback |
| GET | `/feedback` | Admin | All |
| PATCH | `/feedback/:id` | Admin | Reply / status |

## Admin

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| GET | `/admin/users` | Admin | List users |
| GET | `/admin/applications` | Admin | All applications |
| GET | `/admin/stats` | Admin | Platform stats |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| DELETE | `/admin/applications/:id` | Admin | Delete app |
| POST | `/admin/create-admin` | Secret header | Create admin |

## V3 endpoints

| Prefix | Key routes |
|--------|------------|
| `/auto-apply` | GET/POST criteria, GET/POST queue, POST queue/:id/approve |
| `/interview` | GET/POST sessions, POST sessions/:id/answer |
| `/achievements` | GET, POST, POST harvest/github, GET/POST journal |
| `/enterprise` | GET counselor/dashboard, GET/POST organizations |

See also [backend/postman-collection.json](../../backend/postman-collection.json) and root [README.md](../../README.md#api-reference).

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
