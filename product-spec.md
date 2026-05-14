# Sentyrn — Product specification

This document is the canonical product description for **Sentyrn v2 (MVP)**. Implementation must align with the [PRD](https://github.com/dbustosjr/Sentyrn) source of truth; this file expands scope, boundaries, and success criteria for engineering and design.

---

## One-line positioning

**Replay and governance infrastructure for AI-assisted software engineering workflows.**

---

## Problem

Teams using AI coding assistants (Cursor, Claude Code, Codex, etc.) lack a **trustworthy, replayable record** of what the agent did: which files were touched, which commands ran, what failed, and what policy-relevant events occurred. When something breaks or needs review, the answer should not depend on memory or scattered logs.

---

## Solution

Sentyrn captures **safe, consent- and policy-aware telemetry** from local AI coding sessions, streams it to a governed backend, and exposes **session replay**, **deterministic findings**, and **approvals** so developers and teams can reconstruct and review agent workflows.

---

## Core product loop

1. Developer starts an AI coding session.
2. Sentyrn CLI watches the workflow (within declared privacy mode).
3. Telemetry is captured and redacted before upload.
4. A replay timeline and findings are generated server-side.
5. Developer or team reviews the session in the dashboard.
6. Session is approved, marked needs review, or risk accepted per policy.

---

## Sentyrn **is**

- Replay infrastructure for AI coding workflows.
- Session observability for agent-assisted engineering.
- Workflow telemetry plus passive governance (warn / finding / require approval for MVP).
- Operational visibility into agent behavior.
- Team review and approval tooling.

## Sentyrn **is not**

- An AI coding agent or IDE.
- A generic “all AI” observability platform.
- An eval framework, autonomous orchestrator, or deployment platform.
- A LangSmith clone, SIEM, or antivirus-style security product.

---

## Primary wedge

> **“What actually happened during this AI coding session?”**

The MVP must make that question answerable with a **credible timeline** and **actionable findings**, without pretending to “read the model’s mind.”

---

## MVP surfaces (summary)

| Surface        | Purpose |
|----------------|---------|
| **CLI**        | `npx sentyrn init`, `npx sentyrn watch` — auth, sessions, watch, redact, stream events. |
| **Dashboard**  | Operational overview: active sessions, findings, repos, approvals queue, replay activity. |
| **Sessions**   | List/filter sessions with repo, branch, model, duration, findings count, review status. |
| **Replay**     | Chronological timeline of events (core UX). |
| **Findings**   | Deterministic rules only — no synthetic “AI reasoning.” |
| **Approvals**  | States: approved, needs review, risk accepted; policy-driven review requirements. |
| **Policies**   | Passive: warn, create finding, require approval — **no local blocking** in MVP. |

Detailed UX and visual language live in **design-system.md**. Data shapes live in **telemetry-schema.md** and **database-schema.md**.

---

## MVP demo narrative (acceptance story)

1. Developer runs `npx sentyrn watch`.
2. They prompt an assistant to refactor auth (or similar).
3. Sentyrn captures metadata (and optional sanitized diffs per privacy mode): prompts metadata, files read/written, tests, failures, protected paths, risky commands, etc.
4. Dashboard shows timeline, findings, approvals required, and replay history.

Success is not “more charts” — it is **trust that the replay matches reality** for supported adapters.

---

## Success metric

> Developers **trust** Sentyrn to reconstruct and review AI coding sessions when something goes wrong.

Trust implies: correct ordering, honest redaction, stable RLS, and predictable findings (no false confidence from LLM-generated “explanations”).

---

## Roadmap alignment (build phases)

| Phase | Focus |
|-------|--------|
| **0** | Foundations docs (this set). |
| **1** | Design system + app shell (no backend logic). |
| **2** | Backend: auth, workspaces, RLS, sessions, audit, rate limits, retention. |
| **3** | CLI MVP (init, watch, capture list in PRD). |
| **4** | Replay engine + dashboard wiring. |
| **5** | Cursor / Claude Code / Codex adapters. |
| **6** | Findings engine + policies + approvals. |
| **7** | GitHub App (secondary to local replay). |

Phase boundaries are strict: do not ship backend persistence in Phase 1; do not ship undeclared adapters in Phase 3, etc.

---

## Out of scope for MVP

- Blocking the developer’s editor or terminal locally.
- Storing raw secrets, env values, or full proprietary source by default.
- LLM-generated finding “explanations” as product truth (deterministic findings only).
- Replacing code review or CI — GitHub App is later and complementary.

---

## Glossary

| Term | Meaning |
|------|--------|
| **Session** | A bounded AI-assisted coding run tied to workspace, repo, device, and policy context. |
| **Event** | An append-only unit in the replay timeline (typed; schema versioned). |
| **Finding** | Deterministic outcome of a rule (e.g., protected path touched). |
| **Policy** | Org/workspace rules that emit warnings, findings, or approval requirements. |
| **Privacy mode** | Safe / Standard / Full — controls what may leave the device (see privacy-model.md). |

---

## Document index

- **architecture.md** — system shape and components.
- **security-model.md** — threats, controls, auth, RLS, secrets.
- **telemetry-schema.md** — event types and payload principles.
- **privacy-model.md** — modes, defaults, prohibited uploads.
- **database-schema.md** — logical tables and relationships.
- **cli-spec.md** — CLI commands and responsibilities.
- **design-system.md** — UX tone, layout, typography, color, branding.
- **cursor-rules.md** — AI assistant rules for this repository.
