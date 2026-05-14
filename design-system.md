# Sentyrn — Design system (MVP)

Visual and UX foundations for the **web product** and how they relate to the **landing page**. Aligns with PRD tone: **calm, operational, precise, infrastructural, trustworthy, modern, composable** — **not** cyberpunk, SIEM, or “hacker” UI.

References: Cursor, Linear, Vercel, Raycast, Stripe (density and clarity, not clones).

---

## Branding and logo usage

| Context | Treatment |
|---------|-----------|
| **Landing / marketing** | Use the **S** mark **and** the word **Sentyrn** (hero, footer, OG images as needed). |
| **Dashboard and all signed-in product UI** | **Logo mark only** — do not show the full “Sentyrn” wordmark in app chrome (sidebar, top bar, settings). The wordmark is **landing-only**. |
| **Favicon / app icon** | Mark only. |

**Asset handling:** Store optimized SVG/PNG under `apps/web/public/brand/` (or equivalent) in Phase 1; source exports live outside repo or in a protected asset pipeline — do not commit oversized raw exports.

---

## Product feel

**Do**

- Generous whitespace, clear hierarchy, readable tables.
- Subtle borders and surfaces; restrained motion for state changes.
- Precise monospace for replay and technical content.

**Do not**

- Neon cyber grids, glitch effects, “matrix” tropes.
- Alarmist reds everywhere — reserve accent for real risk (see colors).

---

## Typography

**PRD originally suggested Inter for UI; product direction is to avoid generic Inter** in favor of a cohesive, distinctive stack that still reads as **neutral infrastructure**.

| Role | Font | Usage |
|------|------|--------|
| **Marketing / landing** | **Geist** (or Geist Sans variable) | Hero, section titles, marketing body. |
| **Product UI** | **Geist Sans** (same family as Geist where possible) | Navigation, tables, forms, settings, cards — one coherent family with marketing. |
| **Monospace** | **IBM Plex Mono** | Replay timeline, CLI excerpts, logs, traces, diffs, code snippets. |

**Implementation note (Phase 1):** Use `next/font` (Google or Vercel font packages) per Next.js docs; verify license and subsetting for performance.

---

## Color system (from PRD)

Use CSS variables in implementation.

| Token | Hex | Usage |
|-------|-----|--------|
| **Background** — Deep Graphite | `#0B1020` | Page background |
| **Surface** — Soft Indigo | `#151B2E` | Cards, panels, elevated surfaces |
| **Primary text** — Cool White | `#E6EAF2` | Primary copy |
| **Secondary text** — Slate Lavender | `#94A0B8` | Muted labels, metadata |
| **Accent** — Electric Crimson | `#FF445C` | Sparingly: critical findings, live recording, violations |
| **Success** — Soft Cyan | `#4FD1C5` | Approved sessions, healthy traces, success states |

**Logo palette (from brand assets):** Periwinkle `#8E97B8`, navy `#3C486B`, black `#000000`, wordmark accent red (e.g. `#FF3B3F` / align to Electric Crimson for UI consistency — **harmonize in implementation** so marketing and product share one accent definition where the mark appears on `#0B1020`).

---

## Layout

### Desktop (primary)

```text
Left: Navigation (collapsible)
Center: Replay / session content
Right: Findings + approvals panel (collapsible / resizable)
```

### Mobile

**Fully operational** (PRD): hamburger nav → session cards → expandable replay timeline → findings/approval drawer.

Touch targets and bottom-sheet patterns should follow platform conventions.

---

## Components (Phase 1)

- **Stack:** Tailwind CSS + shadcn/ui (PRD).
- **Tailwind:** PRD specifies **Tailwind v3.4** per InsForge ecosystem guidance — do not upgrade to v4 unless PRD/ADR explicitly changes this.
- Prefer shadcn primitives over bespoke widgets for accessibility baseline.

---

## Content and tone

- UI copy: short, imperative, **no blame** (“3 findings” not “You broke auth”).
- Empty states: explain what will appear after first `watch` session.

---

## Accessibility

- WCAG-minded contrast on graphite surfaces (validate accent on crimson).
- Keyboard navigation for timeline and findings panel.
- Respect `prefers-reduced-motion` for non-essential animation.

---

## Related documents

- **product-spec.md** — surfaces and scope.
- **cursor-rules.md** — AI implementation guardrails.
