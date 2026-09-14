# 275: Class View roster: the note's new wording, Sam's extra Report link gone

**What to build:** Two changes on a set's Class View roster. The "did you know?" note (ticket 253) reads "**Did you know?** Clicking on a name opens that student's Holistic Assessment." And Sam's row loses the underlined "Report →" link under his name, which no other student has.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), on the note: "change wording to 'Did you know? Clicking on a name opens that student's Holistic Assessment.'" On a screenshot of PS6 Class View with Sam's row hovered (buttons see dot skills / student report / see history, and "Report →" under his name): "this extra report -> should be removed from Sam — weird, & only applies to him". His report stays reachable from the row's "student report" button, like every other student's.

## Solution

- `app/teacher/TeacherLive.tsx`: the note's copy as above (keep Dismiss and its stored dismissal).
- Remove the "Report →" link under Sam's name (around the `Report →` element); check nothing else (tests, click-throughs, laptop-check) depends on it and point them at the row's "student report" button.
- The note is now shorter: re-measure that it still sits in the header row without moving the roster.

## Acceptance

- [x] Click-through at 1280×800 and 1440×900 on PS6 live and a past set: the note reads exactly the new copy; no "Report →" on Sam's row in any state (in progress, handed in, hovered); Sam's "student report" button opens his report; no roster element moves compared with before the change except Sam's name block
- [x] vitest, eslint, tsc, next build, check:laptop

## Added 2026-09-14

- **The note fits its words.** Review of the first pass: the shorter copy left the note's first line ending in a wide blank run before Dismiss. One line does not fit between STUDENT and the first category chip (about 496 layout px needed, 338 there) at 1280×800 or 1440×900, so the text takes two balanced lines (`text-wrap: balance`) and its box narrows to the wider line; the note stays an overlay, so no chip or roster element moves.
- **Sam's pill only while he works.** The user: the live student's "in progress" pill after he has handed in was a mistake. On the live set's roster Sam's pill shows only while he is on the set (warming up, "Qn in progress"; "not started" before his first screen as before); once he has handed in PS6 there is no pill, so his row looks like every classmate's.

### Acceptance (added)

- [x] At 1280×800 and 1440×900 the note is two balanced lines with its text box as wide as its wider line (no blank run before Dismiss), still inside the Student head and clear of the first chip; every roster rect equals main's except Sam's name block
- [x] PS6 with Sam working: his row shows "Qn in progress"; handed in and report sent: no pill on his row; a past set: no pill; nothing else on the roster moves except Sam's name block
