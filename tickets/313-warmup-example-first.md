# 313: The warm-up starts each skill with a worked example

**What to build:** each skill in the warm-up runs worked example → completion problem (the student writes the blank last lines) → a problem alone, in place of today's problem-first flow.

**Blocked by:** 312 (shares `PracticePad` and the session's practice run).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Today each warm-up skill opens on a problem attempted cold. The worked example is one option in the help menu and the follow-up opens only after it. The user (2026-09-15) agreed the warm-up should model first, with the same three steps as help from a set question (ticket 312), on the skill itself since there is no Q yet.

Who gets a warm-up does not change. The user: a student who says they are confident is not offered a warm-up ("if a student self-reports as confident, but then we tell them 'go warm up on X' … they will not feel heard"). The student's own answer decides; past sets are for the teacher. Every skill a not-confident student ticks or names gets all three steps. The skill map does not pick a starting step.

## Acceptance

- [x] Each warm-up skill, in today's easiest-first order: step 1, today's practice problem as a worked example (with chat beside it, as ticket 312); step 2, ticket 310's completion problem with its blank lines checked (ticket 311), a wrong line marked and chat only on press, a blank filled in after two wrong lines; step 3, today's follow-up done alone, with hint, chat and "see the example again"
- [x] A student can move on from any step (the skill chips and the warm-up's existing way to the set stay)
- [x] A student who answers confident is never offered a warm-up (a test holds it); "I need help" inside the set is still there for them
- [x] The warm-up may use any skill the set uses, New skills included (New skills means assessed for the first time this week, not first exposure)
- [x] The session records each warm-up skill's step and when it started; ticket 314's place model shows it on the teacher's laptop
- [x] No video option; no difficulty tags on any student screen
- [x] `scripts/warmup-leaves.json` and the hint-box sweep cover every completion problem
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900: a not-confident student through two skills (every step, a wrong line marked then corrected, moving on early), a confident student with no offer; nothing scrolls sideways
- [x] Ticket docs: `architecture/313.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **Three steps per skill in the session** (`lib/session.ts`, `lib/ladder.ts`). `warmup.phases` records, per skill (its practice problem's id), when its worked example, completion problem and problem alone began; the step a skill is on is the furthest recorded (`phaseOf`). `warmup/begin`, `warmup/skill-done` and `warmup/goto` carry `at` and open a skill on the step it was left on, a new skill on its worked example playing from the first step (`openSkill`, the start stamped once). `warmup/next` moves on: "Your turn" once every step of the example has been seen, "On your own" once every blank of the completion problem is right or filled in. `warmupLadder(practice)` gives the three problems (the practice problem, ticket 310's `COMPLETIONS` entry with `blankSteps` on the practice's own skill, its follow-up); `runFirst(s, "warmup")` is the step's problem, so the pad's lines, hints and chat stay per problem as before, and `run/hint` on the completion problem reads the working on screen, as on Q**. The older follow-up and menu example (`run/next`, `run/example`) do nothing on the warm-up. Nothing written reaches the set. A reload lands on the step; an older snapshot opens its skill on the worked example.
- **The same screens as help on a question.** `WorkedStep` and `CompletionStep` moved out of `HelpLadder.tsx` into `app/student/screens/PracticeSteps.tsx` with the step line, the title row and `ExamplePeek`; both routes call them with their own head and footer. The warm-up (`PracticeScreen.tsx`): step 1, the practice problem on the left and its worked example step by step with the chat beside it (silent until the student writes); step 2, the completion problem with its hints and "I need help" (hint, see the example again, chat), the pad, and the Working column (given lines up to the blank being written, each written line marked right or red with its misconception chip, a blank filled in after two wrong lines, "That's every line. Now one on your own." and "On your own →"); step 3, the follow-up on the pad (`PracticePad` with `lead` and `exampleAgain`: its menu is hint, see the example again, chat). The head at every step: "Warm-up", 1 Example › 2 Your turn › 3 On your own, the step's title, the skill chips; "Skip to the set" and "Next skill →" / "On to the set" in the right column's footer. No video, no difficulty tag.
- **The demo slip.** `LADDER_SLIPS` gains the monic completion problem's factors written `(x − 4)(x − 5) = 0` (Sam's sign habit), marked "signs swapped in the pair", then right; `completionScript` takes any `{ id, steps }`.
- **The teacher's laptop** (`lib/place.ts`). Sam in the warm-up is at step 1, 2 or 3 of his current skill, `since` the recorded start, on Where students are.
- **The chat.** `findPractice` finds the completion problems; `chatOn` says `"warmup-completion"`, whose brief says some lines are given and each written line is marked, with no problem set question in it.
- **The offer** reads "2 skills, 3 short steps each, then the set" ("3 short steps, then the set" for one skill).
- **Who is offered.** Unchanged and held by a test: a confident answer goes straight to Q1 with no offer, and "I need help" is there on the set.
- **The hint-box sweep** reaches each warm-up skill through the screens: its completion problem blank by blank (the slip included) and its follow-up line by line; `scripts/warmup-leaves.json` holds each step's line count, held to the data by `lib/hint.test.ts`.

## Verification

- Vitest 2099 (lib/warmupSteps.test.ts 15: every practice problem's three steps and blanks, the fractions blanks as the data gives them, any skill the set uses including New skills, a confident student never offered a warm-up with I need help still there, each step's start recorded and shown by `sessionPlace`, Your turn and On your own waiting on the example and the blanks, the demo slip marked then corrected, two wrong lines filling a blank, the completion and follow-up hints, moving on from any step and a chip reopening the step left on with its times kept, nothing on the set, a reload and an older snapshot, the chat on the completion problem; updated `lib/session.test.ts`, `lib/place.test.ts`, `lib/ladder.test.ts`, `lib/hint.test.ts`, `lib/warmup.test.ts`), eslint, tsc, next build; check:laptop 76; sweep:hint-boxes 384/384 (warm-ups 193: every completion problem blank by blank and every follow-up line by line; questions 191, unchanged after the step screens moved); click-through click313.mjs 236/236 at 1280x800 and 1440x900 against a production build with Sam's iPad tab and the teacher tab (a confident student with no offer and I need help on Q1; not confident with monic and the null factor law: the offer's line, the chat, step 1 with the chat beside the example and no Your turn until every step, a reload on step 1, step 2 showing only the first blank, its menu hint / see the example again / chat, a hint, the example again, Sam's slip marked "signs swapped in the pair" with no chat opened and the blank still open, a reload keeping the marks, corrected, the chat on press, step 3 with its menu, the example again, a hint, a line, the chat, a reload; Next skill onto the null factor law's worked example, its completion problem, a chip back to monic reopening step 3 with its line, a chip back to step 2 of the null factor law, On to the set from step 2, Skip to the set from step 1 of a deep-linked warm-up; Sam's pill on Where students are at warm-up steps 1, 2, 3 and the second skill's step 1 with times; no sideways scroll, every KaTeX on one line, no video, no difficulty tag, screenshots checked); ticket 312's click-through rerun 238/238 (its warm-up checks replaced by this ticket's).

## Judgement calls

- **On the warm-up, "Your turn" shows only once the worked example has been seen to its last step, and "On your own" only once every blank of the completion problem is in** (as "Your turn" on Q*). The student can leave the skill at any step by its chips, "Next skill" or "Skip to the set".
- **On the warm-up, a tap on a skill chip reopens that skill on the step it was left on** (with its lines, hints and chat), not on its worked example.
- **On step 3, the pad has the usual layout (the problem on the left, no worked example card above it)**; "see the example again" shows the worked example in the pad's place until "Back to your turn", as on Q**. It is not saved: a reload returns to the pad.
- **On the confidence screen, the warm-up offer's small line reads "2 skills, 3 short steps each, then the set"** (it read "2 short problems").
- **On the warm-up, the skill chips sit left-aligned under the step's title** (they were centred under "Warm-up"), matching the skill chip on Q**.
- **On the fractions warm-up, step 2 has five of its seven lines to write**, as ticket 310's rule gives; recorded in FUTURE_FEATURES rather than changed.
- **On Sam's iPad, the demo pad's wrong line on the warm-up is on monic factorising** ((x − 4)(x − 5) = 0, then right); other skills' completion problems write their lines right.
- **On the teacher's laptop, a warm-up opened by the demo strip's skip has no recorded start**, so Sam's pill counts from when the laptop first sees it; a warm-up reached through the check-in has its times.

