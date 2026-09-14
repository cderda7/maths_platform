# 270: Mark absent is disabled once the student has handed the set in

**What to build:** On a set's Class View roster, the "mark absent" toggle under a student's name is disabled for a student who has already handed the set in, so a stray press cannot grey their work out of every count. A student already marked absent keeps a working "mark present".

**Blocked by:** 250.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), on Problem Set 5's Class View with Zara's row buttons showing: "disable mark absent for an assignment already submitted -- otherwise, teacher might accidentally click on it & erase student work". Since ticket 250 every row but Sam's on the live set offers the toggle, including the nineteen students on a finished set who handed it in.

## Solution

- `lib/absence.ts` `absenceLocked(progress, absent)`: true when the student has handed the set in (`isSubmitted`, ticket 185's one meaning of submitted) and is not marked absent.
- `app/teacher/TeacherLive.tsx`: the row's `locked` flag; the toggle keeps its place and width, is `disabled`, greys (`ROW_DISABLED`: cream-deep, muted ink, no hover), with a tooltip and aria-label saying the student has handed the set in. On the live set a classmate's toggle disables the moment the stream hands their set in.
- "mark present" always acts, so a mark made before a hand-in (or the demo's Chloe on PS6) can be undone.

## Acceptance

- [x] Unit: locked for submitted and present; not for submitted and absent, not started, warming up, working
- [x] Click-through at 1280×800 and 1440×900 (production build): PS5 has twenty toggles, nineteen disabled with the tooltip, Liam's (missing) enabled; a press on Zara's disabled toggle changes nothing and moves nothing; Liam marks absent and present again; PS6 after the report skip: the disabled toggles are exactly the present students who have handed in, Chloe's "mark present" enabled; no sideways scroll
- [x] vitest, eslint, tsc, next build, check:laptop
