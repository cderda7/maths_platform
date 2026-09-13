# 231: The stall notice has a close × too

**What to build:** The same small × as the "I'd like a…" menu (ticket 229) in the top-right corner of the stall notice, "Let's talk through the previous hint before giving you another."

**Blocked by:** 229.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), after 229 noted the stall notice as a follow-up: "add to the previous hint first message as well." The notice closed only on a scrim click or Escape.

## Solution

- `components/PracticePad.tsx`: a `CardClose` component (the 229 × moved out of `HelpMenu`: `absolute right-3 top-3`, 32 px round, muted ink, cream-deep on hover, `aria-label="Close"`, `data-card-close`) drawn by both `HelpMenu` and `StallNotice`, whose card is now `relative`. It calls each card's `onClose`. The notice's text wraps as before and clears the ×.

## Acceptance

- [x] At 1440 × 900 and 1280 × 800, for the help menu and the stall notice: one × labelled Close inside the top-right corner, at least 4 px clear of every text line, hover ground, a real click closes; Talk it through still leads on from a reopened notice; no horizontal scroll (`close231.mjs`, 24 checks)
- [x] vitest 654, eslint, tsc, next build
