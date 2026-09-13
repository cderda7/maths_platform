# 234: Problem Set 6 stays in Live until class review ends

**What to build:** On the Edexia Classroom, the live set stays in the Live section, pinned, from individual working through individual review, the gate, group review and class review. While the class is working its line is the live line ("● live · n/20 submitted · n mistakes so far"); from the moment the class is in review the card carries the "in review" tag instead, still in Live. It moves to Past, tagged "done", only once class review has ended. The card never grows or moves when the class moves on.

**Blocked by:** 186, 216.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "pset 6 has been moved out of 'live' & to 'past' in Edexia Classroom. restore it to 'live'". Since ticket 186 a set left Live as soon as the class was past individual working (Sam handing in, or group review starting), so in a demo run past that point Problem Set 6 sat in Past as "in review". Asked which rule they wanted: "want Live until class review has concluded. when in review tag is on, should never move out of live".

Reproduced on main's server with the click-through below: after the "indiv review" skip Live was empty and Problem Set 6 was first in Past.

## Solution

- `lib/classroomCards.ts`: a live set's section is `live` while any stage is current (`currentStageOf` not null) and `past` once every stage is over (class review ended). Status is `live` on working, `in review` on any review stage, `done` when none is current. Finished sets are unchanged (always past, done).
- `app/teacher/Classroom.tsx`: a card's line follows its status, not its section: `live` draws the live line, `in review` and `done` the tag, submitted and top gap line. Both chips (the status tag and the top gap) are 31 px in a 28 px line; they overhang it by `-my-0.5`, so every card is 135 layout px whatever its status and the pinned Live card does not grow 3 px when the class goes into review (past cards lose the same 3 px, all cards now one height). The chips themselves are unchanged.

## Acceptance

- [x] Unit: every review skip (indiv review, class wait, group review, report, class review) gives Problem Set 6 `section: live, status: in review`; ended class review gives `past, done` (`lib/classroomCards.test.ts`)
- [x] Click-through `live234.mjs` at 1440×900 and 1280×800 (68 checks): working shows the live line in Live; each review skip shows the in review tag in Live, not in Past, pinned, card height equal to the live card's, the chip still 31 px, past cards the same height, no horizontal scroll; the teacher's End button on the class page moves it to Past, done, first. The same script against main's server fails from the indiv review skip on (the reproduction).
- [x] vitest 677, eslint, tsc, next build, check:laptop 30
