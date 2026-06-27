# 5. Non-Functional Requirements

[← Back to index](../README.md)

## Performance

| Target | Status |
|--------|--------|
| Dashboard load < 2s | PARTIAL — not load-tested |
| Autofill < 500ms after click | DONE (typical) |
| AI analyze < 3s | PARTIAL — depends on OpenAI |
| Extension popup < 1s | DONE |

## Security

| Requirement | Status |
|-------------|--------|
| bcrypt password hashing | DONE |
| JWT + HTTP-only cookies | DONE |
| CORS for frontend + extension | DONE |
| `x-app-role` header separation | DONE |
| CV files on server uploads path | DONE |
| Admin setup secret | DONE |
| Plan guards on premium APIs | NOT DONE |
| GDPR export/delete self-service | NOT DONE |

## Scalability

| Requirement | Status |
|-------------|--------|
| MongoDB indexes on userId | PARTIAL |
| Stateless NestJS | DONE |
| Redis cache for AI results | NOT DONE |
| OpenAI rate limiting | NOT DONE |

## Accessibility

| Requirement | Status |
|-------------|--------|
| WCAG 2.1 AA | NOT DONE — audit pending |
| Keyboard Kanban | PARTIAL |

## Availability

| Target | Status |
|--------|--------|
| 99.5% uptime | NOT DONE — no monitoring configured |
| Health endpoint `/health` | DONE |

## Reliability

| Requirement | Status |
|-------------|--------|
| AI failure → basic autofill still works | DONE (heuristic fallback) |
| Ghost save failure → manual save in popup | DONE |
| ValidationPipe global errors | DONE |

## Compatibility

| Platform | Support |
|----------|---------|
| Chrome 110+ (extension) | DONE |
| Edge/Brave (Chromium) | DONE |
| Web: modern browsers | DONE |
| Tablet responsive | PARTIAL |
| Native mobile | Out of scope |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
