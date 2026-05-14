# Sentyrn — Cursor / AI assistant rules (repository)

Rules for humans and **AI coding agents** working in this repository. They complement `.cursor/rules` and global user rules.

---

## Source of truth

1. **PRD** (`Sentyrn_PRD_v2` or linked canonical doc) defines product scope and build phases.
2. **Phase 0 docs** in repo root (`product-spec.md`, `architecture.md`, etc.) refine PRD for implementation.
3. **InsForge:** Follow official InsForge documentation and the **insforge** / **insforge-cli** skills — no guessed APIs.

---

## Phase discipline

- **Do not skip phases** (e.g. no production DB wiring in “Phase 1 shell only” work) without an explicit user decision recorded in commit message or ADR.
- When starting a phase, re-read the relevant spec files and align tasks.

---

## Git workflow

- **One feature per branch** — use descriptive names: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- **Commit and push** when a logical slice is complete (user preference).
- **Do not open a pull request** unless the user explicitly asks to create a PR.

---

## Security and privacy (always on)

- **Never** commit `.env`, `.env.local`, or `.insforge/project.json` if it contains privileged material; follow `.gitignore`.
- **Never** expose InsForge `API_KEY` / service role to the browser or `NEXT_PUBLIC_*` vars.
- **RLS** on all tenant tables before exposing data APIs.
- **No auth tokens in `localStorage`.**
- Telemetry: respect **privacy-model.md** and **telemetry-schema.md**.

---

## Stack constraints (from PRD)

- Next.js **App Router**, TypeScript, Tailwind, **shadcn/ui**, Zod.
- **@insforge/sdk** for app integration — **do not** add deprecated `@insforge/react` / `@insforge/nextjs` / `@insforge/react-router`.
- **Tailwind v3.4** unless PRD/ADR updates (InsForge skill alignment).

---

## Design

- Follow **design-system.md**: operational calm; **wordmark only on landing**; **mark only** in app UI.
- Typography: **Geist / Geist Sans + IBM Plex Mono** — do not default to Inter.

---

## Debugging and review skills

When debugging failures: follow **systematic-debugging** and **debugging-pr-workflow** (repro first, evidence, then fix).

When the user requests security review: apply **ai-security-review** checklist and gate.

For AI feature work: use **ai-engineer** workflow when attached; delegate per user’s subagent policy.

---

## Definition of done (general)

- Types pass; lint passes; build passes for touched apps.
- New behavior covered by tests where practical (especially RLS and redaction).
- No drive-by refactors outside the requested scope.
