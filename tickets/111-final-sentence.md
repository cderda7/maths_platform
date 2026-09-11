# 111: The pad asks for the final answer as a full sentence once a worded problem's working is read

**What to build:** On the working screen, once every scripted line of a worded problem's working has been read (Q9, Q10), a box appears at the foot of the pad, inside its border: "Provide your final answer as a full sentence." It is not there before the last line, it goes away when undo takes the last line back, and a "Solve for x" problem never shows it.

**Blocked by:** 03 (simulated recognition: the pad reads one line per burst), 18 (the problem set).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of Q9 with its three lines read: "after this student has finished their work, add a text box into the draw pad (at the bottom) that says 'Provide your final answer as a full sentence.'" Q9 is asked in words ("Where does it land, and what is its greatest height?") and the scripted run stops at "turning point at x = 3", the compounded step the report calls a communication slip: the working is done but nothing on the pad says what the answer is.

## Solution

- `data/types.ts`: `Problem.answerAs?: "sentence"`, the flag for a problem asked in words.
- `data/assignment.ts`: Q9 and Q10 carry it; the eight "solve / find / factorise" problems do not.
- `lib/recognition.ts`: `scriptDone(script, revealed)`, true once every scripted line has been revealed (false for a problem with no script). Test in `lib/recognition.test.ts`.
- `components/PadSection.tsx`: a `note` prop. The pad card is now a column: the canvas, then, when a note is given, a `<p data-pad-note>` at the foot of the paper (accent-soft box, inset 24px to line up with the ruled lines, rising in with `.offer-in`). The canvas gives up the height; its ink is redrawn from the top, so nothing written moves.
- `app/student/screens/WorkingScreen.tsx`: passes the note when the problem is `answerAs: "sentence"` and `scriptDone` holds for its lines.

## Acceptance

- [x] `/student?stage=working`, Q9: no box; three bursts read the three lines and the box appears at the foot of the pad reading "Provide your final answer as a full sentence."; a fourth burst reads nothing and the box stays; two undos take the third line and the box away
- [x] Q1 with its three lines read: no box; Q10 with its two: the box; a reload keeps it
- [x] The box's left edge sits on the ruled lines' inset; the canvas top does not move when the box appears
- [x] vitest (341), eslint, tsc, `next build`, the headless click-through (`sentence.mjs`), `npm run sweep:hint-boxes` (PadSection is shared with the practice pad); architecture note, root docs, decision log, future features
