# 318: Where students are during individual review

**What to build:** the split from ticket 315 during individual review: on the left, a row per question being reworked (and one for done), each student in the row they are on; on the right, what is going wrong as they rework.

**Blocked by:** 315, 316.

**Status:** needs-design

**Triage:** `needs-design`: before building, the orchestrating session draws the screen and settles the right column with Carson.

---

## Problem Statement

The user (2026-09-15): "we'll reuse this same structure for when they're in different review modes." Individual review is when each student reworks their own wrong questions (`rework/*` in `lib/session.ts`). The teacher's laptop today shows it on the Class view.

## Open before building

- What the right column shows during rework (the reworked lines coming in? the questions still wrong?)
- Which tab the teacher lands on during individual review, and whether the split replaces that tab's view
- Whether pressing a name (ticket 316) shows the rework lines beside the first attempt

## Acceptance

Written once the design is settled, in the shape of ticket 315's.
