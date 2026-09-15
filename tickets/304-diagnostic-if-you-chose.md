# 304: Every diagnostic distractor says what picking it means, on the board and the student's iPad

**What to build:** each wrong option of every diagnostic step carries a one-line "if you chose A, you…". Once a step is revealed, the board shows the line for every wrong option, and a student's iPad shows only their own: "You chose A, meaning you…", or "You chose C, correct.", with the right answer's green fill.

**Blocked by:** 302 (same option lines in `data/diagnostic.ts`).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), from an outside review: "No explanation attached to any distractor. Each wrong option should carry a one-line 'if you chose A, you…'. At the moment the teacher supplies all the meaning. I like this addition to diagnostic questions. takes cognitive load off teacher. add to the board & student screens after question answered. have board show all if you chose.. for A,B,C,D. on student screen, just show their own (you chose A, meaning...) & mark the correct answer (green fill)."

The same message asked to change the diagnostic's flow; the user withdrew that when asked ("no longer a concern").

## Decisions (asked 2026-09-15)

- The iPad shows the line **on reveal**, the same moment as the board, never straight after the tap, so nobody can pass the answer to a neighbour.
- A right pick reads **"You chose C, correct."**; the right option has no line, and the board shows lines for the three wrong options only.
- A wrong pick is named **only by the line**: no outline or mark on the student's option; the green fill stays on the right answer.
- A line says what the choice gives, never why the student made it (ticket 302's rule for `detail`; no guessed, rushed, misread, mixed up, confused).

## Acceptance

- [x] `DiagnosticOption.ifChosen` on every wrong option of all 35 steps (105 lines) and none on a correct option; inline maths between `$` signs; tested for coverage, KaTeX, and banned words
- [x] Board: after the reveal, each wrong option's cell reads "If you chose A," over "you…" scaled to one row; before it, the lines hold their space unseen, so the reveal moves nothing
- [x] iPad: after the reveal, "You chose A, meaning you…" or "You chose C, correct." on one line under the options, the green fill on the right answer; nothing for a student who never answered; nothing before the reveal
- [x] The teacher's surfaces (class card, flyout, focused view) unchanged
- [x] vitest, eslint, tsc, next build, check:laptop; click-through on board + iPad at 1280×800 and 1440×900

## Solution

`DiagnosticOption.ifChosen` holds the rest of the sentence after "you", beside the teacher-facing `detail` and `misconception`. The 105 lines were written by hand against each option's maths and inserted by script. `lib/stem.ts` gains `proseParts` (words with inline maths, no "?"), and `components/MathProse.tsx` draws it for both the stem (`DiagnosticStem`) and the lines.

On the board, `DiagnosticResults` ends every wrong option's cell with two set lines: "If you chose A," then the clause in a `FitText` at 21 px. The lines are `invisible` and `aria-hidden` until `tally.revealed`, so the cells already have their revealed height. As prose that wraps, most lines left "not −7" or "means none" alone on a second row; `text-balance` halved short lines, and `text-pretty` did not help.

On the iPad, `DiagnosticModal`'s status row (now 28 px tall in every state) shows the student's own line after the reveal, in a `FitText` at 17 px. The option letter is written upper-case in the markup, not by CSS, so it reads as "A" to a screen reader too.

## Verification

vitest 1116, eslint, tsc, next build, check:laptop 76. `click304.mjs` passes 2100/2100 at 1280×800 and 1440×900, over every one of the 35 steps:
- Board before the reveal: three lines laid out, invisible, aria-hidden, no green.
- Board after the reveal: green on the right option; each wrong option's line visible in its own cell, reading "If you chose X, you…", none on the right option; cell rects and the stem unmoved; lines inside their cells, exactly two rows, the clause on one row at 21 px (never scaled down); maths unsplit; no counts or misconceptions; the board fits.
- iPad, each of the four picks: before the reveal, waiting, no line, no green. After it, "You chose X, meaning you…" (or "You chose X, correct." on the right option), green on the right option only, no mark on the pick, one line on one row that fits (16.4 px at the smallest), maths unsplit, card and status row unmoved. Open with no pick: no line. Closed by force submit without an answer: green, no line.
