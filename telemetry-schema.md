# Sentyrn — Telemetry schema (MVP)

This document defines the **event model** for AI coding session telemetry: types, ordering principles, and payload rules. Exact JSON Schemas and DB columns are finalized in Phase 2–4 implementation; **versioning** is required from day one of ingestion.

---

## Design principles

1. **Append-only events** — immutability for audit and replay; corrections are new events or admin tooling with audit trail.
2. **Versioned payloads** — every event includes `schema_version` (integer or semver string — pick one standard in implementation).
3. **Privacy by default** — fields allowed depend on **privacy mode** (see privacy-model.md); CLI must not send prohibited fields in Safe mode.
4. **No raw secrets** — structured metadata only unless org explicitly allows in Full mode and server policy confirms.
5. **Deterministic ordering** — `sequence` or monotonic `client_timestamp` + server `ingested_at`; tie-break rules documented in ADR.

---

## Core hierarchy

```text
Workspace
  └── Repo (optional linkage)
        └── Session
              └── Events (ordered)
                    └── Findings (derived)
                    └── Approvals (workflow state)
```

---

## Event envelope (logical)

Every persisted event should support at minimum:

| Field | Description |
|-------|----------------|
| `id` | Server-generated UUID (or ULID). |
| `workspace_id` | Tenant scope. |
| `session_id` | Session scope. |
| `type` | Event type string (enum in code). |
| `schema_version` | Payload version. |
| `occurred_at` | Client-observed time (ISO 8601). |
| `ingested_at` | Server receipt time. |
| `sequence` | Monotonic per session (server-assigned preferred). |
| `source` | e.g. `cursor`, `claude-code`, `codex`, `cli`. |
| `actor` | `user`, `agent`, `system` as applicable. |
| `payload` | Type-specific object; redacted per privacy mode. |

Optional: `device_id`, `repo_id`, `branch`, `commit_sha`, `correlation_id` for cross-service tracing.

---

## Replay event types (MVP target)

Aligned with PRD **Replay Event Types** and **Captured** telemetry:

| `type` | Description | Typical payload (metadata-level) |
|--------|-------------|-----------------------------------|
| `prompt.submitted` | User or agent-bound prompt lifecycle | length, hash of content (optional), model id, **no raw prompt in Safe** |
| `session.started` | Session opened | tool, version, cwd, repo ref |
| `session.ended` | Session closed | status, duration |
| `file.read` | File read observed | path hash or allowed relative path; size bucket |
| `file.written` | File write observed | path, change kind, diff metadata |
| `terminal.command` | Shell command | argv metadata; redact env/secrets |
| `mcp.tool_call` | MCP invocation | server, tool name, arg keys (not values in Safe) |
| `git.diff_updated` | Diff snapshot | summary stats; optional sanitized diff per mode |
| `test.run` | Tests executed | runner, suite, pass/fail counts |
| `test.failed` | Failure signal | failing test ids/names; no stack secret leakage |
| `protected_path.touched` | Policy path access | rule id, path pattern matched |
| `finding.created` | Finding emitted | finding type, severity, references |
| `approval.requested` | Review required | policy id, reason code |

Additional types may be added with a **schema bump** and migration plan.

---

## Explicitly **not** uploaded by default

Per PRD — must be enforced in CLI and rejected server-side if present in Safe/Standard as configured:

- Secrets, env values, clipboard, raw shell history dumps.
- Raw source code (unless org Full mode + policy).
- Private keys, credentials, proprietary file contents.

---

## Git diff metadata (privacy-aware)

| Mode | Diff behavior |
|------|----------------|
| **Safe** | File paths (hashed or scoped), line counts, no content. |
| **Standard** | Sanitized hunks; secret scanner on CLI + server. |
| **Full** | Raw diffs only if org policy allows; still no env/secrets. |

---

## Findings (deterministic)

Findings reference events and static analysis outputs. Example categories from PRD:

- Auth-related files modified.
- Tests failed or deleted.
- Migrations changed.
- Protected paths touched.
- Dangerous command pattern matched.
- Repeated edit loop heuristic.
- Env access attempted.

Payloads should reference **event ids** and **rule ids**, not free-form LLM text as authoritative cause.

---

## Ingestion batching

Recommended:

- CLI sends **batches** on flush timer, size threshold, or session end.
- Batch envelope: `{ workspace_id, session_id, device_id, privacy_mode, events: [...] }`.
- Server returns **accepted range** of `sequence` or per-event ids for CLI deduplication.

---

## Schema evolution

1. Additive fields: bump minor `schema_version`; old clients ignore unknown fields server-side with policy.
2. Breaking changes: new major version + parallel ingestion path or migration script.
3. Deprecation: document sunset; retain read path for historical sessions.

---

## Related documents

- **privacy-model.md** — Safe / Standard / Full.
- **database-schema.md** — `session_events`, `session_findings`, `ingestion_events`.
- **cli-spec.md** — watch behavior and emit rules.
