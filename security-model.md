# Sentyrn — Security model (MVP)

Security requirements are **non-negotiable** for MVP. This document defines trust boundaries, controls, and verification expectations. It extends the PRD security section with operational detail for implementers.

---

## Threat model (summary)

| Actor | Capability | Concern |
|-------|------------|--------|
| Anonymous internet | Hits public endpoints | Enumeration, abuse, DoS |
| Authenticated user | API + UI | Cross-tenant reads/writes if RLS wrong |
| Compromised browser | JS execution | Token theft if tokens in `localStorage` |
| Compromised CLI | User machine | Exfiltration of secrets if redaction fails |
| Malicious workspace member | Org insider | Policy bypass, data destruction |
| Insider / operator | DB access | Audit trail and least privilege |

---

## Non-negotiables (from PRD, expanded)

1. **RLS on all tenant-owned tables** — no table holding workspace data without policies; service role used only server-side for migrations/admin automation, never in browser.
2. **httpOnly + Secure cookies** for web sessions — align with InsForge + Next.js server patterns; **no auth tokens in `localStorage`**.
3. **Server-only secrets** — API keys, Stripe secrets, OpenRouter keys, CLI signing secrets, etc., only in server env / InsForge secrets; never `NEXT_PUBLIC_*` except documented safe keys (e.g. anon key).
4. **No service role / API key in frontend** — InsForge `API_KEY` is full-access; treat like service role on other platforms.
5. **Rate limiting** — on auth, ingestion, and expensive reads; protect against abuse and accidental tight loops from CLI bugs.
6. **Audit logs** — append-only security-relevant actions (policy change, approval, membership, deletion).
7. **Secure session handling** — rotation, invalidation on logout/password reset where InsForge supports; document session lifetime choices.
8. **Data deletion support** — user/org-initiated deletion and retention windows (see privacy-model.md).
9. **Telemetry redaction** — two layers: CLI before upload; server validation/rejection (see privacy-model.md).
10. **Encrypted sensitive telemetry at rest** — follow InsForge and platform defaults; document fields classified as sensitive.

---

## Trust boundaries

```text
[ Browser ]  --TLS-->  [ Next.js server / edge ]  --TLS-->  [ InsForge API + DB ]
[ CLI ]      --TLS-->  [ Ingestion API / function ]  --TLS-->  [ InsForge API + DB ]
```

- **Browser boundary:** Untrusted. Only anon SDK operations allowed directly; anything privileged goes through server actions/route handlers with server-side client.
- **CLI boundary:** Semi-trusted. Authenticated as user/device but can be tampered with; **server must not trust CLI-only redaction** as final authority — validate and normalize.

---

## Authentication and authorization

### Web

- InsForge Auth for human users.
- Workspace membership drives **authorization**; RLS uses `auth.uid()` (or equivalent) joined to `workspace_members`.
- Role model (admin / member / viewer) defined in database-schema.md and enforced in RLS + UI.

### CLI

- Long-lived credentials must be **revocable** and **scoped** (workspace + device or user).
- Storage of refresh tokens / API tokens on disk: OS keychain preferred where feasible; document fallback and risks.
- Never print secrets to terminal in default log level.

---

## Ingestion security

- Authenticate every ingest request; reject unknown project/workspace IDs.
- **Payload size limits** and event count limits per request.
- **Schema validation** (Zod or JSON Schema) with strict unknown-field policy (reject or strip — decide in implementation ADR).
- **Replay protection** optional for CLI (nonce / timestamp window) if replay attacks are realistic for your threat model.

---

## Findings and policies

- Findings are **deterministic**; policy evaluation runs server-side (or in trusted worker), not in client-only code for authoritative state.
- **No “LLM said it’s safe”** as a control — not a security boundary.

---

## Rate limiting (guidance)

- Login / token exchange: strict per-IP and per-account backoff.
- Ingestion: per-device and per-workspace quotas; clear 429 responses with retry guidance.
- Read APIs: reasonable defaults to prevent scraping.

InsForge platform limits may apply; document actual behavior when integrated.

---

## Audit logging

Record at minimum:

- Workspace and policy changes.
- Membership invites and role changes.
- Approval decisions.
- Admin data export/delete.
- Failed admin auth attempts (where available).

Audit entries are **append-only** from application perspective (no silent deletes).

---

## Dependency and supply chain

- Lockfiles committed; CI runs `npm audit` / `pnpm audit` (or equivalent).
- Pin InsForge SDK major versions intentionally on upgrade.

---

## Verification checklist (before production)

- [ ] RLS tests per table for cross-tenant isolation.
- [ ] Cookie flags verified in staging (httpOnly, Secure, SameSite).
- [ ] No `API_KEY` or private keys in client bundle (build-time grep / CI).
- [ ] Redaction unit tests for known secret patterns.
- [ ] Rate limit behavior tested for ingest and auth.
- [ ] Data deletion runbook exercised once end-to-end.

---

## Related documents

- **privacy-model.md** — what may leave the device.
- **telemetry-schema.md** — field-level sensitivity.
- **database-schema.md** — RLS ownership model.
