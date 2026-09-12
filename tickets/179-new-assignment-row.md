# 179: "New assignment" gets its own row above both cards; the Pathway card is level with the roster again

**What to build:** On the class view the "New assignment" pill leaves the right column (where ticket 176 put it, pushing the Pathway card down) and takes a row of its own between the due line and the two cards, over the right column's left edge. The roster card and the Pathway card start on the same line again, the Pathway card's top on the category heads' top, as before 176. The pill keeps 176's look: light indigo fill, deep indigo text and 1 px border, the accent line tint on hover.

**Blocked by:** 176.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a crop of the class view after ticket 176 showing the Pathway card lower than the roster's header row: "move it so that pathway box is inline with the category headers (as it was before) ; move new assignment to above that. it will sit above both the student table & the pathway box".

## Solution

- `app/teacher/TeacherLive.tsx`: the pill's `flex` row leaves the right column. A new `mt-10 grid grid-cols-[1fr_320px] gap-6` row after the due line holds an empty first cell and the pill in the second, so it stands over the column's left edge; the cards' grid follows with `mt-6` (24 layout px, the column gap), so the pill is the same distance above both cards. The column is `space-y-6` with the Class review card (session running) or the Pathway card first, as before 176.
- `app/teacher/TeacherChrome.tsx`: the header comment points at the row.
- Docs: this ticket, `architecture/179-new-assignment-row.md`, `ARCHITECTURE.md`, `README.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] The pill is in neither card and not in the bar; below the due line, above both cards, flush with the Pathway card's left edge, 24 layout px above the cards
- [x] The roster card and the Pathway card start on the same line; the Pathway card's top on the category heads' top
- [x] Fill `#eeebfc`, text and 1 px border `#4535c8`, hover `#d6d0f7`, fully rounded; a click opens `/teacher/assignments/create`
- [x] No "New assignment" on `/teacher/mistakes`, `/teacher/groups`, `/teacher/report`, `/teacher/assignments/create`
- [x] No sideways overflow at 1400×1000 or 1280×800
- [x] vitest (479), eslint, tsc, `next build`, `check:laptop` (16); click-through `nav179.mjs` (40 checks)
