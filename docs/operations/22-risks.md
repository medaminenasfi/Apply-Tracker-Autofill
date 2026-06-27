# 22. Risks

[← Back to index](../README.md)

## Technical risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Job boards change DOM → autofill breaks | High | High | Label/aria selectors; site-specific fixes |
| OpenAI cost at scale | Medium | High | Cache, rate limits, gpt-4o-mini for score |
| Ghost save duplicates | Medium | Low | Dedupe by jobUrl — NOT DONE |
| MongoDB Atlas IP whitelist | Medium | Medium | Document Atlas setup in README |
| Extension localhost only | High | High | Prod config before launch |

## Business risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low Free→Pro conversion | Medium | High | Clear upgrade prompts; 7-day trial **Suggested** |
| Competitor feature parity | Medium | Medium | Niche focus (students); ship V2 fast |
| Chrome Web Store rejection | Low | High | Min permissions; privacy policy |
| Documentation drift | Medium | Medium | **Mitigated:** `docs/` SSOT + master plan |

## Security risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT theft via XSS | Low | Critical | httpOnly cookies; sanitize inputs |
| Premium APIs without plan check | High | Medium | Implement PlanGuard — NOT DONE |
| Webhook forgery | Low | High | Stripe signature verification — DONE |

## Performance risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI latency > 5s | Medium | Medium | Loading UI; heuristic fallback |
| Admin list no pagination | Medium | Low | Add pagination **Suggested** |

---

*Single Source of Truth | v1.0 | Last Updated: June 2026*
