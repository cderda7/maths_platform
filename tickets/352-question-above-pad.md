# 352: The current question stays visible while peeking at the example

**What to build:** on Your turn (and On your own), while "see the example again" is up, the completion problem being worked (the stem + expression) shows at the top of the middle column, above "Your working", since the left column's copy of it is replaced by the worked example for as long as the peek is open.

**Blocked by:** 350 (`ExamplePeek` moving to the left column, this ticket's precondition).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 350 moved "see the example again" into the left column so the drawpad stays up while the student compares against the worked example. It didn't account for the question itself: while peeking, the left column shows the worked example instead of the completion problem's stem and expression, so the student can no longer see what they're solving — only the pad (blank or mid-line) and the "Working" column's scaffolded lines.

Carson, 2026-09-16, on a screenshot of the peek state: "need to see current question on top of middle column."

## Solution

- `CompletionStep`'s middle column: while `peek` is true, render the completion problem's stem, expression (`termTex` with the same hint decoration the left column used) and figure at the top, above `PadSection`, with a `border-b` separating it from "Your working" below. Hidden when not peeking, since the left column already shows it then — no duplicate.
- No change to `WorkedStep` (ticket 350 already put the Example step's question at the top of its middle column, unconditionally, since that step's left column never shows it).
- No change to `PracticePad`'s `exampleAgain` peek (stage 3, "On your own"): it shares the same `CompletionStep`-adjacent left-column peek pattern, but re-check whether its middle column needs the same addition, since the same complaint applies there once peeking.

## Acceptance

- [x] Your turn, peeking: the completion problem's stem + expression (+ figure where present) show at the top of the middle column, above "Your working"; not shown when not peeking.
- [x] On your own, peeking: the same (`PracticePad`'s `exampleAgain` path needed it too — same shared peek pattern, same complaint).
- [x] Help-on-a-question overlay's Your turn: same behaviour (shared `CompletionStep`, no separate code).
- [x] The drawpad, "Undo"/"Clear" and the working column keep working normally with the block present; no layout shift when toggling peek on/off beyond the block itself appearing/disappearing.
- [x] vitest 2279, eslint, tsc, next build, check:laptop 76/76
- [x] Click-through against a production build at 1280×800 and 1440×900 (`click352.mjs`): the question visible above the pad while peeking on both Your turn and On your own, gone when not peeking, the pad still there beside it; no clipped or wrapped maths; screenshots checked
- [x] Ticket docs: `architecture/352-question-above-pad.md`, ARCHITECTURE, README
