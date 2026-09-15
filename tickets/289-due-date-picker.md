# 289: Due-date picker for an in-class set

**What to build:** on the Questions page of +In-Class PSet, a due-date picker beside the title. The chosen date becomes the set's due date everywhere it is shown (teacher's Classroom cards, Sam's Classroom cards, newest-due-first sorting, the set's pages that show a due date).

**Blocked by:** 288.

**Status:** ready-for-agent

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

## Acceptance

- [ ] Picker beside the title on Questions; default Thu 10 Sep; changing it shows the new date on the teacher's and Sam's cards and re-sorts them
- [ ] Days before today are disabled; keyboard and Escape work
- [ ] Opening the picker moves nothing on the page (opens as an overlay)
- [ ] Presenter skips still create PS6 due Thu 10 Sep
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
