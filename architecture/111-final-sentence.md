# 111 · The pad asks for the final answer as a full sentence once a worded problem's working is read

Route: `/student?stage=working`, Q9 or Q10, every line of the working read.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Problem.answerAs?: "sentence"`: the problem is asked in words and wants its answer in words. |
| `data/assignment.ts` | Q9 ("Where does it land…") and Q10 ("say what that means for the graph") carry the flag; the other eight do not. |
| `lib/recognition.ts` | `scriptDone(script, revealed)`: every scripted line has been revealed (false with no script). Pure, beside `nextLine` and `afterUndo`. |
| `lib/recognition.test.ts` | `scriptDone` before, at and after the last line, after an undo, and for an empty script. |
| `components/PadSection.tsx` | A `note` prop. The pad card is a flex column: the canvas in a `flex-1` box, then a `<p data-pad-note>` at the foot when a note is given (accent-soft box, `mx-6` so its edge sits on the ruled lines' 24px inset, `.offer-in`). |
| `app/student/screens/WorkingScreen.tsx` | `askSentence = p.answerAs === "sentence" && scriptDone(RECOGNITION[p.id], lines)`; passes the note text when it holds. |

## How it connects

```
 pen up + idle ──▶ onBurstEnd ──▶ nextLine(RECOGNITION[q], lines, strokes) ──▶ line/reveal ──▶ session.lines[q]
                                                                                                    │
 Undo ──▶ lines/undo ──▶ afterUndo ────────────────────────────────────────────────────────────────┤
                                                                                                    ▼
 WorkingScreen:  p.answerAs === "sentence"  &&  scriptDone(RECOGNITION[q], lines)
                                    │
                                    ▼ note = "Provide your final answer as a full sentence."
 PadSection ── pad card (flex column) ──┬── DrawPad (flex-1; ink redrawn from the top, so it stays put)
                                        └── <p data-pad-note> at the foot, inside the border
```

The box is derived state: nothing new is stored, so a reload shows it again (the lines are in the session) and an undo that withdraws the last line removes it. `PadSection`'s other callers (the practice pad, the rework pad, the group board, the teacher's board) pass no note and render as before.

## Verified by

vitest (341), eslint, tsc, `next build`; the headless click-through `sentence.mjs` (port 3131, CDP 9433): Q9 fresh has no box, two bursts read two lines and still no box, the third reads "turning point at x = 3" and the box appears at the foot of the pad with the canvas top unmoved, a fourth burst reads nothing and the box stays, two undos take the third line and the box away, Q1's three lines show no box, Q10's two lines show it and a reload keeps it; `npm run sweep:hint-boxes` against the same build (the pad card's structure changed under the practice pad too).
