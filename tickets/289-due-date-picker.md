# 289: Due-date picker for an in-class set

**What to build:** on the Questions page of +In-Class PSet, a due-date picker beside the title. The chosen date becomes the set's due date everywhere it is shown (teacher's Classroom cards, Sam's Classroom cards, newest-due-first sorting, the set's pages that show a due date).

**Blocked by:** 288.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "actually implement 'due date picker' in this iteration, don't defer to F_F". Today Create has no due date; Problem Set 6's "Thu 10 Sep" is fixed demo data.

## Decisions

- A small calendar in Edexia's look (tokens in app/globals.css), opened from a field beside the title; shows the date as cards do ("Thu 10 Sep").
- Starts at the next lesson day (the demo's PS6 default stays Thu 10 Sep, so every existing flow and skip is unchanged); the teacher can change it; **it never gates Create** (no confirm gates).
- Cannot pick a day before today (the demo's today).
- The date is stored on the created assignment and survives reload and every tab.
- Ticket 291 reuses this picker for homework; build it as a shared component.

## Solution

- `lib/dueDate.ts`: a due date is stored as a calendar day with its year (`IsoDay`, "2026-09-10") and shown as cards show one (`dayLabel`: "Thu 10 Sep"), so a picked date sorts with the fixtures' days through `dueOrder`. `DEMO_TODAY` is Thu 10 Sep 2026 (the day Problem Set 6 is taught); `DUE_DEFAULT.pset` is today's lesson, so the picker starts at Thu 10 Sep. Month layout (Monday first), day/week/month walks and `dueOrDefault` (a stored day before the earliest, or none, reads as the default) are pure and tested.
- `components/DuePicker.tsx`: the shared picker. A field ("DUE · Thu 10 Sep", as wide as the widest day so the title beside it never changes width) opens a month calendar anchored under its right edge, absolute, over the page. Props `value`, `onChange`, `min` (earliest day), `today`, `note` (a line under the date) and `label`: ticket 291 passes homework's `min` and the "Mistakes from this set go into Homework N" note. Days before `min` show greyed and do nothing; no month before `min`'s. Arrows, Home/End, Page Up/Down walk the days, Enter/Space choose, Escape, a press outside or tabbing out close it; a choice or Escape returns focus to the field.
- `CreateAssignment.tsx`: the title and the picker share a row (the field adds no height, so the goal and the tiles are where they were); the day is kept in the draft on every change. `BlankStart.tsx` shows the same field, inert and greyed.
- `lib/classroom.ts`, `lib/draft.ts`, `lib/create.ts`: `AssignmentDraft.due` and `CreatedAssignment.due`; Generate's draft starts at the default; Create carries the draft's day onto the assignment.
- `lib/assignment.ts`, `lib/assignments.ts`: the live set's `due` is the picked day's label, else the fixture's "Thu 10 Sep"; every card, the Class View's due line, Holistic Assessment's set header and Sam's cards read it from the bundle. `app/student/screens/OverviewScreen.tsx` reads `active.due` instead of the fixture constant (one token). `lib/studentClassroom.ts` is untouched.
- Presenter skips and deep links send the fixture with no day, so Problem Set 6 stays due Thu 10 Sep; "send assignment" fills Create's last step with a fresh generated draft, due Thu 10 Sep.

## Acceptance

- [x] Picker beside the title on Questions; default Thu 10 Sep; changing it shows the new date on the teacher's and Sam's cards and re-sorts them
- [x] Days before today are disabled; keyboard and Escape work
- [x] Opening the picker moves nothing on the page (opens as an overlay)
- [x] Presenter skips still create PS6 due Thu 10 Sep
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
