# 115 · The hand-in check over blank problems, and star-only tiles

Route: `/student` while working (the working screen), Hand in pressed with a problem still blank; the Problems tile list on the same screen.

## Files touched

| File | What it does |
|---|---|
| `lib/session.ts` | `blankProblems(s)`: the set's problems with no recognised line, in set order (force submit records these too). `handInCheck` on the session: `"open"` while the card is up, `"returning"` from the way back until hand-in, `null` otherwise. `hand-in` over a blank problem opens the check instead of handing in; `hand-in/confirm` hands in as it stands with the blanks in `notAttempted`; `hand-in/return` moves the pad to the problem and marks the run returning; a tile (`problem/goto`) or a pen stroke (`ink/stroke`) under the open card is a way back too; a force submit clears it. Older stored sessions hydrate with `null`. |
| `lib/store.ts` | `hand-in/confirm` is stamped with the time, like `hand-in`. |
| `app/student/screens/HandInCheck.tsx` | The card, bottom right over the Hand in button (340px): "Hand in with Q7 blank?" with "Return to Q7" and "Confirm submit", or "Hand in with blanks?" with "Return to Q2, Q3, Q4" (each label a button that takes the standout blue box under the pointer) and "Confirm submit". |
| `app/student/screens/WorkingScreen.tsx` | The footer's right side: Hand in on the last problem or while returning, with "Jump to Qn" to its left while another blank problem remains (the next blank one after this, wrapping round). The back button and the gaps tighten so the three fit the 320px column. A starred problem's tile is ★ in place of its label, its colour as before. The card renders while the check is open and no picker or overlay is up. |
| `lib/session.test.ts` | Seven tests on the check: the blank list, Hand in opening it or going through, Confirm submit recording the blanks, Return and the returning mode, the tile and the stroke as ways back, the force submit, hydration. The routing tests hand in from a set with every problem attempted. |

## How it connects

```
 WorkingScreen footer                          lib/session.ts
 ┌──────────────────────────────┐              ┌────────────────────────────────────────────┐
 │ [← Q9]   [Jump to Q7] [Hand in]│──hand-in──▶ │ blankProblems(s) empty?                      │
 │           (while returning)   │              │   yes → stage: next stage, handInCheck null │
 └──────────────────────────────┘              │   no  → handInCheck "open"                   │
                 ▲                              └───────────────┬────────────────────────────┘
                 │ go(jump) = problem/goto                       │ "open"
                 │                                               ▼
 ┌──────────────────────────────┐              ┌────────────────────────────────────────────┐
 │ HandInCheck card (bottom right)│              │ hand-in/return {index} → problemIndex,      │
 │ "Hand in with blanks?"        │──return───▶  │   handInCheck "returning"                   │
 │ Return to [Q2], [Q3], [Q4]    │              │ hand-in/confirm → handed in, notAttempted    │
 │              [Confirm submit] │──confirm──▶  │ problem/goto or ink/stroke while "open" →    │
 └──────────────────────────────┘              │   "returning" (the card closes)              │
                                                └────────────────────────────────────────────┘
 Problems tiles: session.stars ∋ id → "★" in place of the label; ink / purple / white as before
```

The rule that a blank set asks first lives in the reducer, so the teacher's force submit, a reload mid-check (`handInCheck` is persisted with the session) and the tests all see the same behaviour; the screen only decides what the footer and the card show for each `handInCheck` value.

## Verified by

vitest (347), eslint, `next build`; a headless click-through (`handin.mjs`, port 3131) writing and starring Q1, starring the blank Q3, handing in from Q10 with eight blank (card text, the blue box on the hovered Q4 measured, the card surviving a reload of `/student`), returning to Q4 (the three footer buttons measured on one line inside the column), Hand in from the blank Q4 asking again, Return to Q2 then "Jump to Q3", everything but Q7 written and the single-blank card, Return to Q7 with Hand in alone before and after writing, the hand-in landing on feedback with nothing not attempted, and a fresh run's Confirm submit recording all ten; screenshots `tiles.png`, `check-multi.png`, `check-hover.png`, `returning.png`, `check-single.png`, `single-return.png`.
