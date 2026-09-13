# 207: The Live diagnostic's example options sit in an even two-column grid

**What to build:** In the mistake view's Live diagnostic flyout, the example tab's options A–D sit in two equal columns: A as wide as C, B and D starting on one line, the same grid the result takes after a send.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, a screenshot of Q5's flyout with each option chip as wide as its maths, so B started further right than D): "make ABCD in consistent grid -- A as wide as C so there's not this stagger effect".

## Solution

- `app/teacher/DiagnosticPush.tsx`: the example options are a `grid grid-cols-2 gap-2` list instead of wrapping chips; each cell holds its letter and its maths in a `FitText` (16 px, scaled down only if an option is wider than its half), so a long option never wraps or runs past its cell.

## Acceptance

- [x] Every diagnostic on Problem Set 2 (all problems in), at 1280 and 1440: four cells of one width, A over C and B over D, rows level, no split maths, no maths past its cell, the panel inside the viewport (`grid207.mjs`, 110 checks)
- [x] vitest 603, eslint, tsc, next build
