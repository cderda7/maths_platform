# 342: A stem's maths is TeX, said once

**What to build:** no question stem writes maths as text or repeats the expression shown after it. A text copy of the expression goes; maths a stem needs of its own is inline `$…$` TeX, typeset on every screen that shows a stem (Sam's iPad, the board, the teacher's laptop, Create, homework).

**Blocked by:** 339 (upright maths, which made the text copies stand out).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Checking ticket 339's screenshots (2026-09-15): several stems carried maths as sans text beside upright serif KaTeX, most visibly Problem Set 6's Q10, "…say what that means for the graph of y = x² + 4x + 5." above `x^2 + 4x + 5 = 0`. Carson: "yeah no don't want the duplicate expression thing. remove duplicates; keep TeX."

## Decisions (asked 2026-09-15)

- A text copy of what the TeX shows goes; the TeX stays.
- Maths a stem needs that the TeX does not show ("For f(x) = x² − 3x + 1, find", "Write in the form a(x + h)² + k") becomes inline TeX (Carson picked inline TeX over leaving it as text).
- Taken as the same rule (my reading, flagged to Carson): a worded problem whose TeX holds every relation (PS4 Q10's rectangle, PS2 Q10's, PS1 Q10's tile) states the relations once, in the TeX, and names its letters in the words; a diagnostic step's "Given that …" carries the step before's result without repeating the expression it asks about.
- Left as they are: single letters in prose ("Solve for x.", "after t seconds"), and the Refine recommendation's garden problem, whose words carry the length its TeX leaves out.

## Solution

- `components/StemWords.tsx` (new, moved out of `ProblemQuestion`): a stem's words with its `$…$` maths set in KaTeX, unbroken with the punctuation after it, hyphens unbroken. Used by `ProblemQuestion` and, in place of the bare string, `WorkingScreen`, `FeedbackScreen`, `PracticeSteps` (both steps), `FrozenScreen`, `SmartBoard`, `PracticePad`, `ProblemCard`, `PracticeCard` and `HomeworkFlight`.
- `lib/homework.ts`: `stemWords` reads a `$…$` piece as one word, so `wordDiff` never cuts into maths; `glueRuns`/`glueStem` (no-break spaces for text maths) are removed; `sameTypeLine` reads a change inside maths as numbers.
- Data: PS6 Q10, its Q*/Q** and homework similar end "…for the graph."; the ball and stone practice stems say "is given below"; the discriminant and f(x) stems carry `$y = …$` / `$f(x) = …$`; PS4 Q8 and its similar `$a(x + h)^2 + k$`; PS4 Q10 and its similar "A rectangle's length $l$ cm and width $w$ cm satisfy the following."; PS2 Q10 "A rectangle's length $\ell$ cm and width $w$ cm are given below."; PS1 Q10 "A square tile's area is given below."; the Create seed's Q10 line; diagnostic steps q2 factorise and solve, q3 factorise, q5 intercepts and q10 context.
- Tests: `lib/stemMaths.test.ts` reads every `stem:` under `data/` (190): balanced `$`, no maths notation outside `$…$`, no side of a stem's inline maths equal to a side of its TeX (19 text-maths stems and 5 repeats on main before this ticket, 0 after). The homework, homework list, Create seed, pairs and diagnostic chain tests follow the new stems (a chain step's result may sit in its expression).

## Acceptance

- [x] No stem writes maths as text or repeats its expression (guard test over every data file)
- [x] Inline maths typeset wherever a stem shows; no "$" on screen
- [x] The homework change animation keeps a piece of maths whole
- [x] vitest, eslint, tsc, next build, `check:laptop` 76/76
- [x] Screenshots checked at 1440×900 and 1280×800

## Verification

vitest 2128 (`lib/stemMaths.test.ts` 4), eslint, tsc, next build; `check:laptop` 76/76; click-through `stems342.mjs` (session scratchpad) against a production build at 1440×900 and 1280×800: teacher Mistakes on PS4 (Q8 and Q10 inline maths typeset), PS2 (Q10) and PS1 (Q10), no "$" and no text maths on any, no sideways scroll; Sam's Q10 reads "…for the graph."; Create's generated Q10 tile has no text copy; screenshots checked. (The script's PS6 Mistakes stem check read a fresh demo with the set not yet sent, so it had no card to read; Q10 is checked on Sam's iPad and Create instead.)
