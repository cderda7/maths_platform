# 177: The row buttons read "see history" and sit a pinch bigger and further apart

**What to build:** On the class view the third row button reads **see history** (was "see history in…"; **close history** while on, unchanged), and the three stacked buttons beside a name (see dot skills · student report · see history) are a pinch bigger and a pinch further apart: 11.5 px text (was 11), 2 px above and below the line (was 1.5), 3 px between buttons (was 2). Each button is 15.5 px tall and the stack 52.5, so every roster row is 6.5 px taller than ticket 175 left it (81.5; a row whose confidence word runs to three lines 84.5). With that row height the pill midline of the row above falls exactly on a history stack's top, so the cream's cut rule gains a floor: a pill whose midline is within 6 px of the stacks' top is covered whole and the cut moves to the next pill up (or the heads), so at least 6 px of cream always stands between the oldest date and the half pill above it. Nothing else on the roster changes.

**Blocked by:** 175.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the three buttons: "change see history in... to change history. also make the text a pinch bigger & space them out a pinch more". Asked which label: **see history** (the same verb as "see dot skills").

## Solution

- `app/teacher/TeacherLive.tsx`: `ROW_BUTTON` is `py-[2px] text-[11.5px]` (was `py-[1.5px] text-[11px]`), the stack's gap `gap-[3px]` (was `gap-0.5`), the idle label "see history"; the comment over the constants records the new arithmetic and that ticket 175's "no row grows" no longer holds. `HISTORY_CLEAR_PX` (6): `HistoryBlocker` takes only pill midlines at least that far above the stacks' top.
- `README.md`: the button's name.
- Docs: this ticket, `architecture/177-row-buttons-pinch.md`, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] The three buttons read see dot skills · student report · see history; **close history** while history mode is on, **see history** again after leaving
- [x] Each button 96 × 15.5, the stack 52.5 px; every roster row 81.5 (Mia 84.5), the same at rest, in history mode and with two histories open; no sideways overflow at 1400 or 1280
- [x] At least 6 px of cream above every stack: Tomas's (row 5) cut is through Jordan's pill (row 3) with Amelia's row covered whole, row 3's cut through row 1's pill, row 2's cream covers the heads and spills to the "due" line
- [x] Everything ticket 175 verified still holds on the taller rows: the cream's top on a pill midline, the top rows' spill to the "due" line, the stacks, the exits (`buttons177.mjs`, 156 checks, ticket 175's run with the new sizes and the clearance)
- [x] vitest (479), eslint, tsc, `next build`, `check:laptop` (16)
