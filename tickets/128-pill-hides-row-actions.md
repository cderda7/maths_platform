# 128: A category pill under the pointer hides the row's buttons

**What to build:** On the class grid the two buttons beside a student's name (**see dot skills** / **close**, **student report**) show while the pointer is anywhere in the student's block, except while it is over one of the row's category pills. The pill is its own way into the student; the buttons are the way in for a teacher who would not think to click a pill. Off the pill (the name, the cell padding between pills, the confidence and set cells, the drill row underneath) the buttons come back.

**Blocked by:** 125.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of two hovered rows showing both the buttons and a lit pill: "let's exclude the pill itself from opening up the 'close' 'expand' button. 'close & expand' are for teachers who might not intuitively see the clicking on the pill as an option, but if a teacher is clicking into the pill, they likely prefer that functionality. so it's more about having 2 options than both available at same time. make it so that if the teacher is in the row but NOT a pill, close & expand are visible, but if inside pill, that goes away".

## Solution

- `app/teacher/TeacherLive.tsx`: the row-actions `div` adds `group-has-[[data-dot]:hover]/row:invisible` beside its `group-hover/row:visible` and `group-focus-within/row:visible`. The `tbody` is the `group/row`; a hovered `[data-dot]` (the category cell's button) inside it hides the buttons. Pure CSS, no state: the `:has()` rule has higher specificity than the hover rule and comes after it in the compiled sheet.
- Keyboard focus is untouched: a pill focused by Tab with the pointer away still shows the buttons (focus-within), so the keyboard path keeps both.
- The column header's own hover controls are separate and unchanged.

## Acceptance

- [x] Pointer on the name, between pills, on the confidence cell, in the drill row: buttons visible
- [x] Pointer on the first or last pill, before and after clicking it: buttons hidden
- [x] Pill focused by keyboard, pointer away: buttons visible
- [x] vitest (390), eslint, tsc, `next build`, headless click-through (`rowactions.mjs`, 12 checks) with crops
