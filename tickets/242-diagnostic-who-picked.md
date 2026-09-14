# 242: The teacher sees who picked each option and who repeated their own slip, and the class card names the problem

**What to build:** In the Mistakes view's flyout, each option cell of a sent step shows small initials avatars of the students who picked it. A student who picks the analogue of the slip they made on the original problem gets a mark on their avatar. The class view's card labels a running step with its problem ("Q1"), since the similar problem no longer identifies it.

**Blocked by:** 241.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), in the grilling session on similar-problem diagnostics (240, 241), chose from offered options:

- A "Q1" label before the question on the class view's card only, not on the board.
- Initials avatars of who picked each option, in the Mistakes flyout only. The class card and the board get none, and the board stays anonymous.
- A mark on a student's avatar when they pick the analogue of their own original slip, so the teacher sees whether a slip was a one-off or a gap. A one-line summary ("2 of 3 who slipped on Q1 repeated it") was deferred.
- Slip labels stay general, never "Ethan's slip".

## Solution

- `lib/diagnostic.ts`: `pickersAt(run, step, now)` returns the student ids per option, the same arrivals `tally` counts (Sam once he answers). `repeatedSlip(step, studentId, option)` is true when that option's slip is the analogue of a slip in the student's original work on the problem, via 240's step picks mapping.
- `components/DiagnosticResults.tsx`, panel size only: a row of initials avatars (the roster avatar style, smaller) under each cell's count, wrapping inside the cell. A repeated slip shows as a ring or corner dot in the slip colour (the Mistakes view's slip pill red) with the avatar's title reading the student's name and "same slip as on Q1". Cells never change the flyout's width. Avatars appear live as answers land.
- `app/teacher/DiagnosticCard.tsx`: "Q1" before the step's question, in the eyebrow style.
- `FUTURE_FEATURES.md`: a one-line summary under a step's grid ("2 of 3 who slipped on Q1 repeated it"), deferred 2026-09-14 in favour of marks on the avatars.

## Acceptance

- [x] Unit: pickers per option equal the tally counts at every `now` (every 100 ms across an answering step with the demo student's pick, a later step, and a force-submit close without him); `repeatedSlip` is true exactly for students whose original wrong line is that option's slip (Q1 step 2: Ethan and Sam on the signs-flipped option, Liam and Oliver on the product-right option, nobody else), and on every one of the 33 steps a classmate's own pick repeats their slip exactly when it is a tied distractor.
- [x] Click-through at 1280×800 and 1440×900 on a production build: avatars appear as each answer lands, their counts equal the cell's count, and every avatar sits inside its cell with no reflow of the flyout or the problem card; the repeat marks are on exactly the students above; a hover shows the name and "same slip as on Q1"; the class card reads "Q1" and has no avatars; the board and iPad show neither.
- [x] vitest, eslint, tsc, next build, check:laptop

## Done (2026-09-14)

- **Numbers.** vitest 792 (8 new in `lib/diagnostic.test.ts`), eslint clean, tsc clean, next build, check:laptop 62/62, sweep:hint-boxes 132/132. Click-through `who242.mjs` 56/56 checks at 1280×800 and 1440×900 on a production build, three tabs (teacher, board, Sam's iPad).
- **Real marks.** On Q1's Factorise step with Sam picking the signs-flipped option: SO and EK marked in A, OB and LO marked in C, sixteen plain avatars in the correct B. On Find the pair without Sam: EK marked in A, LO and OB in B.
- **Where the avatars sit.** At the foot of each cell, under the count and its misconception (not between them), so the count and label read as on the class card, and an empty cell's held avatar row reads as the cell's bottom padding rather than a gap between "0/20 students" and its label. 22 px round (the roster's 32 px avatar, smaller), 3 px apart, seven to a row in the 460 px flyout; one row is held from the push, so the first answers move nothing.
- **Height.** A cell with more than seven pickers wraps to a second or third row, so the grid row, and the steps under it, grow down as answers land (sixteen on the correct option is three rows, 50 layout px). The flyout's place and width, every cell's width and place, and the problem card never change (asserted at every poll).
- **The mark.** The avatar in the slip pill's colours (dark red border, pale red fill, dark red initials), the title "Ethan Kowalski, same slip as on Q1"; an unmarked avatar's title is the name.
- **Class card.** "Q1" leads the eyebrow line above the question: "Q1" alone for a chain of one, "Q1 · 1ST OF 2" on a longer chain.
- **Whose slip counts.** A mark reads the mistake view's own rows (Sam's live row among them), not the fixture: a classmate who has not handed in the problem yet in the live stream has no row, so no mark (DECISION_LOG 2026-09-14).
