# 319: Where students are during group review, in group colours

**What to build:** the split from ticket 315 during group review: on the left, a row per group in its group colour, showing whose turn it is and on which question; on the right, what is going wrong in the groups.

**Blocked by:** 318.

**Status:** needs-design

**Triage:** `needs-design`: before building, the orchestrating session draws the screen and settles it with Carson.

---

## Problem Statement

The user (2026-09-15): the review modes reuse the structure, "& can have the group review with group color incorporated". Groups are teacher-set from seating (coral, amber, mint, sky, violet; `data/groups.ts`), and each group works through its members' questions in turns (`lib/groupReview.ts`).

## Open before building

- Each group's row: the turn's question and whose it is, the other members' pills, progress through the group's questions
- The right column during group review
- Where the Groups tab's existing live cards (`GroupProgressCard`) go

## Acceptance

Written once the design is settled, in the shape of ticket 315's.
