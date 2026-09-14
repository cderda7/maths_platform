# 253: A student's name in Class View opens their holistic page, with a one-time "did you know?"

**What to build:** On a set's Class View, pressing a student's name or avatar opens that student's holistic page under the set (`/teacher/a/[set]/students/[id]`, Back → this Class View). A "did you know?" note next to the names tells the teacher Holistic Assessment is also in Edexia Classroom; its Dismiss hides it for good.

**Blocked by:** 251.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): clicking a student's name or avatar should go "to a 'between assignments' report, not just single assignment", with the risk that the feature is hidden behind a name, so "add a 'did you know?' note telling teacher that they can also get to this view by clicking on student name." Placement and lifetime agreed: "have it on Class View next to the names — have a 'dismiss' option & that permanently saves, so once a teacher has dismissed it once it never pops up again."

## Solution

- Class View roster: name and avatar become one link to the holistic page under the set. The per-assignment report stays reachable from the holistic page's set column (ticket 251).
- The note sits beside the roster's name column as an overlay that never reflows the grid (see the flyout rule: open over blank space, nothing resizes). One line plus Dismiss.
- Dismissal is stored per teacher in its own localStorage key, read with `useSyncExternalStore` (no setState in effects). Demo reset does not bring it back.

## Acceptance

- [x] Click-through at 1280×800 and 1440×900: every name and avatar opens the right student under the set; Back returns to Class View; the note shows beside the names and moves nothing; Dismiss hides it; a reload and a demo reset keep it hidden; clearing the key shows it again
- [x] vitest, eslint, tsc, next build, check:laptop
