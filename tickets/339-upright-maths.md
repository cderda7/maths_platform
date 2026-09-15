# 339: Maths is upright everywhere

**What to build:** every typeset maths letter on every surface (Sam's iPad, the teacher's laptop, the board) is upright, KaTeX's roman face, not italic. Ticket 315's split already did this for itself; the rule becomes global.

**Blocked by:** None.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The checkpoint review (2026-09-15) noted maths was italic on every screen except the Mistakes tab's split during individual working (ticket 315, `.upright-maths`), so the same expression changed face between two teacher tabs. Carson: "make global rule for upright instead of italics."

## Decisions (asked 2026-09-15)

- Everywhere, not the teacher side only: the board and Sam's iPad share the examples component with the laptop, so a partial rule would set one example two ways. Carson picked the global rule knowing italic letters are the textbook and exam convention.
- The TeX is unchanged and nothing is spaced (the maths rule): a font rule, not `\mathrm`.

## Solution

- `app/globals.css`: the `.upright-maths .katex .mathnormal, .mathit` rule loses its scope: `.katex .mathnormal, .katex .mathit { font-family: KaTeX_Main, …; font-style: normal }`.
- `app/teacher/StageSplit.tsx`: the `upright-maths` class comes off; its comment points at the global rule.

## Acceptance

- [x] No italic maths letter on any student, teacher or board screen that shows maths (computed `font-style` of every `.katex .mathnormal` / `.mathit`, iframes included)
- [x] Every letter in KaTeX_Main
- [x] The hint boxes: `npm run sweep:hint-boxes` passes (no lit box covers a neighbour, nothing moves)
- [x] `check:laptop` 76/76: no teacher route scrolls sideways at 1440×900 or 1280×800
- [x] vitest, eslint, tsc, next build
- [x] Screenshots checked, with the old italic face forced back on for a before/after pair

## Verification

Click-through `upright339.mjs` (session scratchpad) at 1440×900 against a production build: 20 routes (working, practice, individual review, group review, report, history, Sam's Classroom, a completed report; teacher Classroom, Create, Class, Mistakes on PS6 and PS5, Groups, a report, a pattern's working, holistic, whole-class review, before and after; the board), each with italic letters 0, face KaTeX_Main, no sideways scroll, a screenshot; before/after pair on the working screen and PS5's Mistakes.
