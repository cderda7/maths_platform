# 199: The Mistakes tab's force submit a size larger

**What to build:** On the live set's Mistakes tab, the "force submit" button in the title row is a bit larger.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, after ticket 195): "make force submit a bit larger".

## Solution

- `app/teacher/ForceSubmit.tsx`: `inline` (the Mistakes tab) sets the button at 13.5 px with `px-3 py-1` (was 12 px, `px-2.5 py-1`): 115 × 27 layout px, still just under the 30 px stage pill beside it. Class View's copy (not inline) is unchanged at 12 px. A 14 px `px-3.5 py-1.5` try measured 32 px tall, taller than the pill, and was dropped.

## Acceptance

- [x] At 1280, 1400, 1512 and 1000 px: the button 13.5 px, between 26 px and the pill's height tall, its right edge still on the cards' right edge (every ticket 195 check still passes)
- [x] Class View's force submit still 12 px
- [x] vitest, eslint, next build; click-through `stage199.mjs` (54 checks)
