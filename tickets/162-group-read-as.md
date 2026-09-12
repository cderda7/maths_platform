# 162: Group review reads the board live, in a column beside it

**What to build:** On the group whiteboard the board takes the left two thirds and a "Read as" column the right third, as on the working screen: every line the board reads appears in the column as it is written, on the pen-holder's iPad and on every watcher's. After a wrong check the attempt cut at the first mistake sits at the top of the column ("Not yet", the wrong line red, "n more lines") and the next attempt's lines read in beneath it.

**Blocked by:** 40 (the shared board), 52 (the wrong check on Q7).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "add the live 'read as' to group review. have the pad take up the left 2/3 ; have the read as be a column on the right side. as in other places." Until now the board's transcription was hidden until Check (the 2026-09-10 decision kept recognition to the check), so the four members saw ink and nothing read; the wrong check's panel then opened above the board, full width, and pushed the pad down.

## Solution

- `app/student/screens/GroupBoardScreen.tsx`: the row under the members is `grid-cols-[2fr_1fr] gap-5`; the board card is the left cell, an `aside` (`data-read-as`) the right. `ReadAs` in the aside shows the run's shared `lines` (one `RevealedLine` per line, the same list the next burst reads on from), the shimmer while the pen-holder's burst is being read, and an empty line that names the writer ("Lines appear here as you write." / "…as Liam writes."). The wrong-check block (`data-wrong-check`) moves into the column, above the live lines, compact, its eyebrow "Not yet" so the column has one "Read as". The aside's top padding is the pad's plus the card's border, so the two eyebrows sit on one line. Undo and Clear also end the shimmer.
- Nothing in `lib/` changes: `run.lines` was already classroom state shared by every member, so the watchers' columns follow the pen-holder's for free.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md` (the 2026-09-10 "transcription only at the check" alternative is now the design), `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Q1 (Sam's pen): the board is exactly twice the column's width, both span the row, a gap between; the two eyebrows on one line; the column reads "Read as" with "Lines appear here as you write."; Check off
- [x] Each burst reads one line into the column ("(x − 2)(x − 3) = 0", then "x = 2 | x = 3" as two boxes); Check on after the first; Undo withdraws the last; a correct check opens the debrief
- [x] Q7 (Liam's pen, a watcher): "Liam's working" with no toolbar, "Liam checks when ready", "Lines appear here as Liam writes."; Liam's three lines appear one by one (0, 1, 2, 3); the wrong check puts "Not yet" with the first line red and "2 more lines" at the top of the column and the live list empties; the second attempt's lines read in under it while it stays; the correct check opens the debrief
- [x] vitest (453), eslint, tsc, `next build`, headless run (`group162.mjs`, 27 checks)
