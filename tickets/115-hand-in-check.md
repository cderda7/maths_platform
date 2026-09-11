# 115: The hand-in check over blank problems, and star-only tiles

**What to build:** On the working screen, Hand in over a set with problems still blank opens a card in the bottom right instead of handing in: "Hand in with Q4 blank?" with "Return to Q4" and "Confirm submit", or for several "Hand in with blanks?" with "Return to Q2, Q3, Q4", each label a button that sits in a blue box under the pointer. Returning puts the student on that problem with Hand in in the footer as on Q10, plus "Jump to Qn" to its left while another blank problem remains. A starred problem's tile in the Problems list is the star alone, purple when the problem has working, white when it is blank.

**Blocked by:** —.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of Q10 on the working screen: "after clicking hand in, open up a pop up in the bottom right -- 'return to Q4' (or whichever one they skipped) or 'confirm submit'. if multiple questions are skipped, say 'return to Q1, Q2, Q3' & have the Q1 get put in a blue box that student can click on to return to question. well by that i mean like whatever question they hover over, so could also click to Q1 first. if it was just that 1 question, then have the hand in button at bottom right after student finishes, as it would appear normally when doing Q10. also if student stars a problem replace the Q1 tile with just a star (don't see Q1 text at all -- just the star for simplicity. purple box with star if starred problem that was completed ; white box with star if starred problem that wasnt' completed. if multtiple questions need answering, after answering Q1, have two pop ups -- hand in as normal & 'jump to Q2' to the left of it."

## Solution

- `lib/session.ts`: `blankProblems(s)` lists the set's problems with no recognised line, in set order (force submit now uses it too). A new `handInCheck` field: `"open"` while the card is up, `"returning"` from the moment the student goes back until the set is handed in, `null` otherwise. `hand-in` over a blank problem sets it `"open"` instead of handing in; `hand-in/confirm` hands in as it stands with the blanks recorded in `notAttempted`; `hand-in/return` moves the pad to the problem and sets `"returning"`. A problem tile (`problem/goto`) or a pen stroke under the open card is a way back too. `hydrateSession` gives an older stored session `null`.
- `lib/store.ts`: `hand-in/confirm` is stamped with the time like `hand-in`.
- `app/student/screens/HandInCheck.tsx`: the card, absolutely placed bottom right over the Hand in button, 340px wide. One blank problem: a heading "Hand in with Q7 blank?", a secondary "Return to Q7" and the accent "Confirm submit". Several: "Hand in with blanks?", a line "Return to Q2, Q3, Q4" whose labels are buttons in the accent colour that take the standout blue box (`bg-standout-soft`, `border-standout-line`) on hover, then "Confirm submit".
- `app/student/screens/WorkingScreen.tsx`: the footer's right side is Hand in on the last problem or while returning; while returning, "Jump to Qn" (secondary) sits to its left when another blank problem exists, n being the next blank one after this in set order, wrapping round. With three buttons in the 320px column the back button's side padding drops to 12px (inline, as the Button's own `px-4` outranks a utility) and the gaps tighten to 6px, so nothing wraps or spills. A starred problem's tile shows ★ at 16px in place of its label, its colour as before (ink when current, purple once started, white when blank), with `aria-label` "Qn, starred". The card renders while `handInCheck` is `"open"`, unless the help picker or a practice overlay is up.

## Acceptance

- [x] Q1 written and starred: its tile is a star on ink while current, on purple after; Q3 starred blank: a star on white (headless click-through, `tiles.png`)
- [x] Hand in on Q10 with eight blank: "Hand in with blanks? / Return to Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10 / Confirm submit"; the run stays on the pad; the card survives a reload of `/student`; Q4 under the pointer is boxed in `rgb(232, 240, 250)` with a `rgb(195, 215, 238)` border
- [x] Return to Q4: the pad on Q4, card gone, footer "← Q3", "Jump to Q5", "Hand in", all on one line inside the column; Hand in from the still-blank Q4 asks again
- [x] Return to Q2, written: "Jump to Q3" (the next blank); the jump lands on Q3
- [x] Everything but Q7 written, Hand in on Q10: "Hand in with Q7 blank? / Return to Q7 / Confirm submit"; Return to Q7: the footer is Hand in alone, before and after writing; Hand in then lands on feedback with nothing recorded as not attempted
- [x] A fresh run, Hand in on Q10, Confirm submit: feedback, all ten recorded as not attempted
- [x] vitest (347, seven new on the check and hydration), eslint, `next build`; architecture note, root docs, decision log, future features
