# 275: Class View roster: the note's new wording, Sam's extra Report link gone

**What to build:** Two changes on a set's Class View roster. The "did you know?" note (ticket 253) reads "**Did you know?** Clicking on a name opens that student's Holistic Assessment." And Sam's row loses the underlined "Report →" link under his name, which no other student has.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), on the note: "change wording to 'Did you know? Clicking on a name opens that student's Holistic Assessment.'" On a screenshot of PS6 Class View with Sam's row hovered (buttons see dot skills / student report / see history, and "Report →" under his name): "this extra report -> should be removed from Sam — weird, & only applies to him". His report stays reachable from the row's "student report" button, like every other student's.

## Solution

- `app/teacher/TeacherLive.tsx`: the note's copy as above (keep Dismiss and its stored dismissal).
- Remove the "Report →" link under Sam's name (around the `Report →` element); check nothing else (tests, click-throughs, laptop-check) depends on it and point them at the row's "student report" button.
- The note is now shorter: re-measure that it still sits in the header row without moving the roster.

## Acceptance

- [ ] Click-through at 1280×800 and 1440×900 on PS6 live and a past set: the note reads exactly the new copy; no "Report →" on Sam's row in any state (in progress, handed in, hovered); Sam's "student report" button opens his report; no roster element moves compared with before the change except Sam's name block
- [ ] vitest, eslint, tsc, next build, check:laptop
