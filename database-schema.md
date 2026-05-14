# Sentyrn — Database schema (MVP, logical)

Logical tables and relationships for **InsForge Postgres**. Physical migrations (`CREATE TABLE`, RLS policies) are implemented in Phase 2 with `npx @insforge/cli db migrations`. All tenant tables require **RLS** before any production traffic.

---

## Entity relationship (overview)

```text
users (InsForge auth.users profile extension as needed)
  └── workspace_members ──► workspaces
                              ├── repos
                              ├── devices
                              ├── cli_tokens
                              ├── policies
                              ├── sessions ──► session_events
                              │                 ├── session_findings
                              │                 └── session_approvals
                              ├── policy_violations
                              ├── audit_logs
                              └── ingestion_events
```

Naming is illustrative; final column lists belong in migrations with snake_case.

---

## Tables (from PRD)

### Identity and tenancy

| Table | Purpose |
|-------|---------|
| **users** | App profile keyed to `auth.users` (display name, avatar, preferences). |
| **workspaces** | Tenant boundary; billing and policy root. |
| **workspace_members** | `user_id`, `workspace_id`, `role`, `invited_at`, `joined_at`. |
| **repos** | Registered repositories (remote URL metadata, default branch, aliases). |

### Devices and CLI auth

| Table | Purpose |
|-------|---------|
| **devices** | Registered machines (name, OS, last_seen). |
| **cli_tokens** | Revocable credentials binding **device** + **user** + **workspace** (hashed secret, scopes, expiry). |

**Never store** raw CLI secrets in plaintext; store hash + prefix for display only.

### Sessions and replay

| Table | Purpose |
|-------|---------|
| **sessions** | One AI coding session: `workspace_id`, `repo_id`, `branch`, `started_at`, `ended_at`, `status`, `review_status`, `model_provider`, aggregates for list UI. |
| **session_events** | Append-only replay rows: `session_id`, `type`, `schema_version`, `sequence`, `occurred_at`, `payload` (jsonb), `ingested_at`, `source`. |
| **session_findings** | Deterministic findings: `session_id`, `rule_id`, `severity`, `detail` (structured json), `created_at`. |
| **session_approvals** | Approval workflow: `session_id`, `state` (approved / needs_review / risk_accepted), `actor_user_id`, `note`, timestamps. |

### Governance

| Table | Purpose |
|-------|---------|
| **policies** | JSON or normalized rules: triggers (paths, tools, commands), actions (warn / finding / require_approval). |
| **policy_violations** | Optional link table for audit of policy firings (or fold into findings — ADR). |

### Operations

| Table | Purpose |
|-------|---------|
| **audit_logs** | Security and admin actions (immutable append). |
| **ingestion_events** | Operational telemetry: batch id, outcome, error codes, sizes (not end-user session content). |

---

## RLS principles (mandatory)

- Every row carries `workspace_id` where applicable (or derives via join to session → workspace).
- Policies use `auth.uid()` and `workspace_members` to authorize read/write.
- **Service role** bypass exists only for controlled server jobs — not for browser.

Example policy pattern (illustrative SQL, not final):

```sql
-- Pseudocode intent: members can read their workspace sessions
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = sessions.workspace_id
      AND wm.user_id = auth.uid()
  )
);
```

---

## Indexes (guidance)

- `session_events (session_id, sequence)` unique constraint for ordering.
- `sessions (workspace_id, started_at desc)` for dashboard lists.
- `session_findings (session_id)` for panel queries.

---

## Migrations workflow

Per InsForge CLI skill:

1. Inspect live schema: `db tables`, `db policies`.
2. Author timestamped SQL in `migrations/`.
3. Apply: `db migrations up` with review on production.

Do not hand-edit production without migration files.

---

## Related documents

- **security-model.md** — cookie auth, secrets, rate limits.
- **telemetry-schema.md** — event payload mapping to `session_events`.
