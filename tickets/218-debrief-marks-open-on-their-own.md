# 218: The group debrief has nothing to write; the marks open on their own

**What to build:** After the group's rework checks correct, the debrief shows the three versions unmarked (the green view) for five seconds, then opens the marks by itself; Next appears with the marks and waits out the ten-second hold beside "take a moment to reflect". No "Describe the mistake you made." / "Describe the mistake your peers most likely made." box and no "show me the marks" button.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshots of the Q1 debrief with the describe box and "show me the marks", and the Q2 debrief with the marks and the reflect hold): "want to skip the 'describe mistake' section, both for 'describe your mistake' & 'describe peer's mistake'. too much cognitive demand. instead, first show image 2 -- just the green view. hold for 5 seconds. then, automatically show marks. once marks show, 'next' button then appears & goes through the 10 second thing with the 'reflect' text next to it as it currently is".

## Solution

- `lib/debrief.ts`: the prompt rules (`debriefPrompt`, `PROMPT_TEXT`, `functional`, `DebriefPrompt`) are gone. `UNMARKED_MS` (5 s), `marksAt(resolvedAt)` and `marksOpen(resolvedAt, now)` time the marks from the group's check; `HOLD_MS` (10 s) runs from there. `DebriefNote` is just `{ done }`.
- `lib/session.ts`: `debrief/note` and `debrief/marks` are gone; `debrief/done` sets `done` once.
- `app/student/screens/GroupDebrief.tsx`: the note card is replaced by a row holding "take a moment to reflect" and Next in its hold ring. The row is `invisible` (and `aria-hidden`) until the marks open, so the three versions keep their height when Next appears. `data-phase` is `unmarked` / `marked`.
- `lib/report.ts`, `app/teacher/report/TeacherReport.tsx`: the report's "In group review" notes (which would now always read "Nothing written yet") are gone; the card holds Starred alone.
- The clock is the group's `resolvedAt`, shared by every member and kept in the classroom store, so a reload keeps the moment. A peer's scripted next turn still waits `PEER_DEBRIEF_MS` (16 s), which covers 5 + 10 s and a press.

## Acceptance

- [x] Sam's Q1 and Zara's Q2: the debrief opens unmarked with no describe box, no show-marks button and no visible Next; still unmarked at 3.5 s; marks, Next (disabled), reflect text and ring after 5 s; the versions keep their height; an early press does nothing; Next on and reflect gone after 15 s; Next moves on (`review218.mjs`, 20 checks)
- [x] A reload in the unmarked phase stays unmarked and opens the marks on time; a reload in the hold keeps the marks and the hold
- [x] The teacher report renders with no empty notes block and no error
- [x] vitest 603, eslint, tsc, next build
