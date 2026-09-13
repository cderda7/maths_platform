# 236: The student header reads PSET 6, so the set's title never truncates

**What to build:** The set title beside the wordmark in the student header shortens "PROBLEM SET 6" to "PSET 6", so "PSET 6 — ROOTS OF A QUADRATIC" fits whole beside the four-stage pathway strip instead of cutting to "PROBLEM SET 6 — ROOTS OF A QU…".

**Blocked by:** 168, 185.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the student header during individual working ("PROBLEM SET 6 — ROOTS OF A QU…" beside indiv working → indiv review): "change header from Problem Set... to PSET 6 -- ROOTS OF... so the truncation doesn't need to happen."

## Solution

- `lib/crumbTitle.ts`: `crumbTitle(title)` replaces a leading "Problem Set N" (any case) with "PSET N"; any other title is unchanged.
- `app/student/StudentApp.tsx`: the crumb is `crumbTitle(title)`. The stored title, the overview's heading, history's eyebrow and every teacher screen keep "PROBLEM SET 6 — …".
- `StudentChrome`'s `truncate` stays as the fallback for a longer created title.

## Acceptance

- [x] Unit: `crumbTitle` shortens the live set, Set 1 and a mixed-case two-digit title, and leaves other titles alone (`lib/crumbTitle.test.ts`)
- [x] Click-through `crumb236.mjs` (65 checks) at 1440×900 and 1280×800 on every skip target (start, warm-up, working, indiv review, class wait, group review, class review, report): crumb reads "PSET 6 — ROOTS OF A QUADRATIC", tooltip the same, not truncated (scrollWidth ≤ clientWidth), after the brand and clear of the strip, header 56 px, no horizontal scroll
- [x] vitest 719 (after rebasing onto ticket 212), eslint, tsc, next build
