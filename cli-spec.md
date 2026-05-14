# Sentyrn — CLI specification (MVP)

Command-line interface for local workflow capture. **Distribution:** Node.js + TypeScript, invoked via **`npx`** (package name and npm scope to be set at publish time).

---

## Commands (MVP)

```bash
npx sentyrn init
npx sentyrn watch
```

Future commands (post-MVP or later phases) are out of scope unless added to PRD.

---

## `sentyrn init`

**Purpose:** Onboard a developer or CI machine to a Sentyrn workspace.

**Responsibilities:**

1. Detect repo root (git top-level) and basic metadata (remote URL if present).
2. Authenticate user (browser OAuth or device flow — **finalize in Phase 3** per security-model.md).
3. Register **device** and issue **scoped CLI token** (stored securely; never print full secret after creation).
4. Write minimal project config (e.g. `.sentyrn/config.json` or similar) with **non-secret** workspace reference and mode defaults.
5. Print next steps: how to run `watch`, how to change privacy mode, link to docs.

**Non-goals:** Modify editor internals; install unrelated global tools without consent.

---

## `sentyrn watch`

**Purpose:** Start a **session**, observe the coding workflow, redact, and **stream** events to the backend.

**Responsibilities:**

1. **Session lifecycle** — create `session.started` on begin; `session.ended` on SIGINT/SIGTERM/normal exit; heartbeat optional.
2. **Watch** filesystem, test runners, and adapter-specific hooks (Phase 5 adapters: Cursor, Claude Code, Codex).
3. **Capture** (MVP target from PRD): repo metadata, branch, timestamps, terminal commands (metadata), file write metadata, test runs, diff summaries, model/provider metadata, MCP tool calls (metadata), exit codes, policy/finding hooks from local rules engine stub if any.
4. **Redact** per privacy-model.md before any network send.
5. **Stream** batches to ingestion endpoint with backoff and durable local queue (ADR: sqlite vs flat file vs memory+crash warning).

**Flags (to specify in implementation):**

- `--workspace` / default from config.
- `--privacy` override (cannot exceed org max).
- `--dry-run` log events to stdout without send (dev only).

---

## Adapter interface (internal)

Adapters translate tool-specific signals into **telemetry-schema.md** events.

| Adapter | Phase |
|---------|--------|
| Generic filesystem + terminal | Phase 3 baseline |
| Cursor | Phase 5 |
| Claude Code | Phase 5 |
| Codex | Phase 5 |

Each adapter declares:

- `source` string.
- Supported event types.
- Required local paths or APIs (documented).

---

## Error handling

- Network failures: exponential backoff; surface human-readable status; do not drop silently without local spool policy.
- Auth failures: prompt re-`init` or refresh; never embed refresh tokens in logs.

---

## Versioning

- CLI embeds `CLI_VERSION` and sends with each batch for server-side compatibility checks.

---

## Related documents

- **telemetry-schema.md** — event types.
- **privacy-model.md** — modes and redaction.
- **architecture.md** — ingestion flow.
- **security-model.md** — token storage and threats.
