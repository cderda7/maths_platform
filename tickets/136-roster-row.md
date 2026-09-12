# 136: The class roster's row: a bigger name, the pill beside it, the avatar at the end

**What to build:** On the class view's roster the student's name is bigger, the **in progress** pill sits to the right of the name on the same line, every in-progress student's pill starts at the same x (no staggering with the name's length), and a new last column after **Set** carries the student's avatar so the eye can find its row again after crossing the skill columns.

**Blocked by:** 46.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of the roster: "make student name bigger text. also put in progress to the right of the student name instead of below it. make a rule that if multiple students are in progress, they're vertically aligned instead of staggered (what would happen if you just had a rule of 'start in progress pill 10px to the right of the student name'). ALSO easy to lose track of what student row you're in as you move right through the row. add column to the right of 'set' & the scores & place the avatar there".

## Solution

- `app/teacher/TeacherLive.tsx`, the roster only:
  - The name is `text-[16px] font-medium leading-6` (was the table's 14 px) in a fixed slot: `box-border min-w-[142px] pr-2.5 whitespace-nowrap`, the slot being the widest name on the roster at 16 px (Ruby Castellanos, 132 px) plus the 10 px the user named. The pill follows in the same flex line, so every in-progress pill starts 142 px from the name's left, whatever the name; a longer name than the roster has would push its own pill right with the padding keeping the 10 px.
  - The pill loses `mt-1`, gains `shrink-0`; the name line and the commentary line are a column inside the cell's flex, the hover buttons still `ml-auto` beside them.
  - The avatar moves from before the name to a new last column (`w-[56px]`, `px-3`, centred, `data-row-avatar`), with an empty header cell (`aria-label="Student, again"`). The drill rows span `columns.length + 4`.
  - Column widths: 380 for the student column (20 + 142 + 88 pill + 12 + 96 buttons + 20 with Sam's row hovered), 96 per category and 132 under a chip longer than ten letters (`columnWidth`: "Communication" is 126 px, every other chip under 94), 92 Confidence, 64 Set, 56 avatar; `min-w-[1204px]`, which is the 1280 × 800 laptop's card to 4 px. The category header cells drop their side padding and the chips are `whitespace-nowrap`, so at the minimum width "New skills" no longer wraps and "Communication" no longer runs under "Reasoning" (both showed at the old 100 px columns whenever the card was at its minimum, as in the user's own window).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Name 16 px on every row; the slot 142 CSS px on every row; Sam's pill on the name's line starting at the slot's end; a pill cloned after the widest name (Ruby Castellanos) starts at Sam's x
- [x] Sam's row is the common row height (the pill adds nothing); the avatar closes every row, 32 px, centred in the last cell; no avatar before the name
- [x] Header chips clear of each other by ≥ 2 px and on one line at 1280 and 1400; the roster fits its card with no scroll at both; no page overflow
- [x] Sam's row hovered: the two buttons right of the pill inside the student cell, clear of the first dot; Sam's row open and the Algebra column view: drill rows span all ten columns
- [x] vitest (403), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks), headless run (`verify.mjs` at 1280 and 1400) with crops
