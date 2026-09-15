# 304: Every diagnostic distractor says what picking it means, on the board and the student's iPad

## Files touched

| File | What it does |
| --- | --- |
| `data/diagnostic.ts` | `DiagnosticOption.ifChosen`: the rest of "If you chose A, you…", on each of the 105 distractors (35 steps × 3), none on a right option. |
| `lib/stem.ts` | `proseParts`: words with inline `$…$` maths, no "?"; `stemParts` now builds on it. |
| `components/MathProse.tsx` | New. Draws those pieces, each piece of maths nowrap with the punctuation after it. `DiagnosticStem` now renders through it. |
| `components/DiagnosticResults.tsx` | Board only: each wrong option's cell ends in two set lines, "If you chose A," then "you…" scaled to one row (`FitText`, 21 px max), so no word is left alone on a line. They are laid out invisibly from the push and shown on the reveal, so nothing moves. |
| `app/student/screens/DiagnosticModal.tsx` | The status line under the options, after the reveal: "You chose A, meaning you…" or "You chose C, correct." (one line, `FitText`, 17 px max); nothing for a student who never answered. |
| `app/board/SmartBoard.tsx` | Comment only. |
| `lib/diagnostic.test.ts`, `lib/stem.test.ts` | Every distractor has a line and no right option does; the maths typesets; one iPad line long; no names or guesses at why. `proseParts`. |

## How it connects

```
 data/diagnostic.ts  DiagnosticOption { tex, misconception (302), detail (302), ifChosen ◄304, slip }
        │                                   │ teacher-facing                  │ student-facing
        │                                   ▼                                 ▼
        │           DiagnosticResults card / panel               lib/stem.ts proseParts ◄304 ─▶ components/MathProse.tsx ◄304
        │           (name + detail, unchanged)                           ▲ stemParts             │           ▲
        │                                                                │                       │   DiagnosticStem
        ▼                                                                │                       ▼
 lib/board.ts boardContent ─▶ app/board/SmartBoard DiagnosticSlide ─▶ DiagnosticResults size="board"
        (tally.revealed)                                                  every wrong cell: "If you chose A, you …"
                                                                          invisible until revealed (same height)

 lib/diagnosticChain.ts isRevealed ─▶ app/student/screens/DiagnosticModal ◄304
 run.answers[step]                     status line: Waiting for the class… ─▶ You chose A, meaning you …
                                                                          or You chose C, correct.
```
