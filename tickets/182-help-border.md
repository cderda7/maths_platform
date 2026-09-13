# 182: Every "I need help" button has a deep indigo border

**What to build:** The student's two "I need help" buttons (the working screen's, above the problem tiles; the practice pad's, under the hints) get a 1 px deep indigo border (`accent-deep`, the brand's darkest purple) instead of the grey secondary border. Ink text on paper as before; hovering tints the fill soft indigo and the border stays. Nothing moves.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "add dark purple border to each 'i need help' button".

## Solution

- `components/ui.tsx`: a new `Button` variant `deep`: `bg-paper text-ink border border-accent-deep hover:bg-accent-soft`. One variant rather than a className on each button, so the two buttons cannot drift and the border is not fighting the secondary variant's own `border-line-strong` / `hover:border-ink-muted` for order in the compiled CSS.
- `app/student/screens/WorkingScreen.tsx`, `components/PracticePad.tsx`: both "I need help" buttons use `variant="deep"`.
- Docs: this ticket, `architecture/182-help-border.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] Working screen and practice pad: the "I need help" button's border is 1 px solid `rgb(69, 53, 200)` (`--color-accent-deep`), ink text on paper, still a pill, same size and place
- [x] Hover: the border stays deep indigo, the fill turns `accent-soft`, nothing moves; the click still opens the help sheet
- [x] vitest (512), eslint, tsc, `next build`; click-through `help182.mjs` (18 checks across both screens)
