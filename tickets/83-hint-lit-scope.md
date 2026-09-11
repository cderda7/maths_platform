# 83: A lit hint word lights only the line its hint points at; a lit box has a touch more room above and below

**What to build:** Two refinements to ticket 82. (1) Hovering a linked word lights the piece only in the line that hint points at, never the same fragment on another line (the x/4 in line 2 no longer lights with the x/4 in line 3). (2) The lit box gets a little vertical air, so a fraction's numerator and denominator sit clear of its edge; the layout does not move.

**Blocked by:** 82.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of hint 2's "x terms" lighting x/4 in both line 2 and line 3: "refinement -- only refer to current student step, not all instances in student work. also, fractions are still a bit smushed -- stretch the box around it vertically a touch".

The lit set inside `termTex` is keyed by span, so a term passed as lit to another line lit any fragment there with the same text; and the box's padding was horizontal only.

## Solution

- `components/PracticePad.tsx`: `litAt(k)` hands the lit term only to the piece its hint points at (`litAnchor`); the problem and every other line get none.
- `app/globals.css`: `.hint-term` padding `0.12em 0.1em`, taken back with the matching negative margin.

## Acceptance

- [x] Hints at lines 2 and 3 showing; hovering hint 2's "x terms" lights x/4 and 2x/4 in line 3 only
- [x] The read-as line boxes are the same height lit and unlit; the lit fraction box clears the numerator and denominator
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs
