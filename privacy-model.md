# Sentyrn — Privacy model (MVP)

How Sentyrn handles **data minimization**, **modes**, and **two-layer redaction** (CLI + server). This document is binding for CLI and backend behavior.

---

## Principles

1. **Default is safest** — organizations start in **Safe Mode** unless they explicitly choose otherwise with informed consent.
2. **No surprises** — CLI shows current mode, destination workspace, and what categories are uploaded before watch begins (exact UX in Phase 3).
3. **Defense in depth** — CLI redacts first; **server rejects or strips** prohibited fields. Neither layer alone is sufficient.
4. **User and org control** — workspace admins set allowed modes; users cannot exceed org max.

---

## Privacy modes

| Mode | Intent | Typical contents leaving device |
|------|--------|-----------------------------------|
| **Safe** | Maximum privacy; metadata only. | Session boundaries, timestamps, file path fingerprints or scoped relative paths, command **metadata** (e.g. binary name, not full env), model id, counts, no prompt body, no diff content. |
| **Standard** | Balanced debugging. | Safe mode **plus** sanitized diffs and redacted prompt summaries per policy; secret scanning mandatory. |
| **Full** | Deep replay for trusted orgs. | May include raw diffs/code **only** where org policy explicitly allows; **never** upload secrets, env values, keys, or clipboard by default — Full relaxes **code** visibility, not security hygiene. |

**Default for new workspaces:** **Safe Mode**.

---

## Categories: upload vs never

### Never uploaded (all modes)

- Secrets, API keys, tokens, passwords.
- Env var **values** (names may be allowlisted in metadata-only form in Standard+ per ADR).
- Clipboard contents.
- Private keys and certificate material.
- Raw credential stores.

### Not uploaded by default (Safe / Standard)

- Raw source code and full file contents.
- Raw shell history dumps.
- Full prompt text (unless Standard policy explicitly enables redacted excerpts).

### Conditionally allowed

| Data | Safe | Standard | Full |
|------|------|----------|------|
| Prompt metadata (length, hashes, model) | Yes | Yes | Yes |
| Prompt content | No | Redacted only | Per org policy |
| Diff summary (stats) | Yes | Yes | Yes |
| Diff hunks | No | Sanitized | Per org policy |
| File reads | Metadata | Metadata + paths | Per org policy |

---

## Redaction pipeline

### Layer 1 — CLI (before network)

- Pattern-based redaction for known secret shapes (AWS keys, PEM blocks, `.env` lines, etc.).
- Path allowlists / denylists for sensitive globs (e.g. `.ssh/`, `.env`).
- Truncation and hashing for identifiers where full strings are unnecessary.

### Layer 2 — Server (on ingest)

- Re-run policy checks; strip unknown or disallowed fields.
- Reject batch with error code if violation is severe; or quarantine for admin review — **behavior chosen in Phase 2 ADR** (fail closed preferred for strict orgs).

---

## Retention and deletion

- Workspace-configurable retention for events and derived artifacts (within product limits).
- **User/org deletion** removes associated rows per GDPR-style expectations; audit log retains **minimal** tombstone where legally required (jurisdiction-specific — legal review before launch copy).

---

## Compliance-facing notes (non-legal)

This document is engineering guidance, not legal advice. Before GA, align with counsel on:

- DPA / subprocessors (InsForge and hosting).
- Regional data residency if offered.
- Customer agreements for Full mode.

---

## Related documents

- **telemetry-schema.md** — event payloads by mode.
- **security-model.md** — auth, RLS, audit.
- **cli-spec.md** — user-visible mode behavior.
