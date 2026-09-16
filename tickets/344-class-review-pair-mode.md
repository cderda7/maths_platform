# 344: Class review works an example, then the class does a near-identical question

**What to build:** "Write with me" is removed. Class review runs three steps per question the teacher picked: the chosen examples with every iPad frozen, then a similar question (Q*) worked line by line on the board and every iPad, then a second similar question (Q**) that every student works on their own iPad with their lines marked. The teacher moves the class on, and a five-second countdown runs first, as force submit does elsewhere.

**Blocked by:** none on main (310's Q*/Q**, 311/325's line check and 312's marking are all in). Ticket 320 (the teacher's split during class review) builds on this.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

None of the lesson's stages does the thing the worked-example research is strongest on: a method modelled in full, then straight away a near-identical question the student does alone. Class review had two modes and neither did it. With screens frozen the student watches and writes nothing; "write with me" is copying the teacher's lines.

The user (2026-09-15/16) settled the shape:
- Pair mode **replaces write with me entirely**; the mode choice goes.
- **Every student does Q**, and Q** is the whole question**, not a few blank lines.
- **Lines are marked on the student's iPad** as they write.
- **Nothing is recorded as "right after class review"**: the report and the set score do not change.
- **The teacher moves the class on**, with a five-second countdown first, the same as force submit's countdown.

## Acceptance

- [x] Class review setup (`app/teacher/whole-class/WholeClassSetup.tsx`) no longer asks for a mode: no "screens frozen" / "write with me" choice anywhere, and Project needs only the questions and examples. The stored mode (`WholeClassSession.modes`, `FollowMode`, the `wc/mode` action and `BoardControls`' per-question control) goes with it
- [x] For each question, in the order the teacher set, the board runs three steps:
  - **Examples**: as today (the chosen workings, the teacher's marks and pad, every iPad frozen on the slide)
  - **Worked example**: Q* for that question (`data/pairs.ts`), revealed a line at a time by the teacher, on the board and mirrored on every iPad
  - **Students' turn**: Q** on every iPad, each student writing on their own canvas
- [x] On a student's iPad during the third step: the whole question (its stem through the shared stem component), their own pad, and each line marked as they write (`checkStep`): right lines take the ladder's right-line look, a wrong line is red with its misconception chip, exactly as the help steps mark them. Nothing is blanked or given
- [x] The teacher ends the third step with one control ("Next question", or "Finish" on the last). Pressing it starts a five-second countdown shown on the board and on every iPad; when it ends the class moves to the next question's examples, whatever each student has written. A student who finishes early waits on their own work
- [x] The countdown reuses the classroom's existing advance machinery (`advance`, `isPending`, the mm:ss display's `Math.min` guard) with its own five-second grace, so a reload and every tab agree
- [x] The board never shows a count of students (ticket 202); counts belong on the teacher's laptop (ticket 320)
- [x] `lib/setScore.ts`, the teacher's report and Sam's report are unchanged: nothing from class review is marked, scored or recorded there (a test holds it)
- [x] A set with no Q*/Q** (Problem Sets 1–5, and sets made in Create) runs the examples step alone, as class review does today
- [x] The demo: Sam's Q** lines are scripted for at least one question, including one wrong line that is marked and then corrected; the presenter's class review skip still lands in a sensible state
- [x] The student's work in class review lives in the classroom/session state the live view reads (ticket 320), and survives a reload
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 with Sam's iPad, the board and the teacher tab: every step of two questions (examples, Q* revealed, Q** written with a wrong line marked then corrected), the countdown on all three screens, moving to the next question, a reload after the move, no sideways scroll, KaTeX on one line, no difficulty tags, no counts on the board. `sweep:hint-boxes` attempted but not completed to a clean pass — see Verification
- [x] Ticket docs: `architecture/344-class-review-pair-mode.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README

## Notes

- Read `app/teacher/whole-class/`, `app/teacher/board/`, `app/student/screens/FrozenScreen.tsx`, `lib/classroom.ts` (`WholeClassSession`, `GRACE_MS`, `advance`) and ticket 312's `app/student/screens/PracticeSteps.tsx` (the worked example and the marking) first; reuse rather than rewrite.
- Ticket 337 (another session) will add questions moved out of group review to setup's pre-ticks; keep setup's data shape easy to extend.

## Solution

Three steps live on the classroom's own `WholeClassSession` (`step`, `reveal`), not as a student-side concept: `wc/next` walks examples → worked → turn (revealing one line of Q\* at a time, `workedLines`/`pairFor` from ticket 310), and the same "step forward" control (`components/ClassStepControl.tsx`) both reveals a line and — once every line is shown — moves the question from `worked` to `turn`. `lib/classReview.ts` holds the pure pieces: `stepsFor`/`lastStep` (a question with no pair never leaves `examples`), and `turnState`/`turnFor`, which recompute a student's Q\*\* progress from the lines their pad has read, each checked against the step it belongs to with ticket 311's `checkStep` through ticket 312's `markLine` — so undo, a reload and a later live view (ticket 320) all agree without any of them being told what happened.

The countdown is one more `AdvanceKind` (`class-review-next`) with its own five-second `graceFor`, started by "Next question"/"Finish" once every iPad is on `turn`. `components/useClassAdvance.ts` is a single hook mounted on the board, the teacher's laptop and every iPad: whichever tab's clock reaches the deadline first dispatches `wc/advance {id}`, which is idempotent (`movedBy`), so the other tabs' later attempts do nothing. This is the same shape force submit and the other graces use (`isPending`, the `Math.min` guard on the mm:ss display), just a shorter clock.

`app/student/screens/ClassTurn.tsx` draws the student's turn: `PadSection` beside a `Working` column, each written line in the mark it earned (`MARK_LOOK`, the same table `PracticeSteps` reads for the help ladder and the warm-up), a misconception chip on a wrong line, nothing blanked or given. `components/WorkedLines.tsx` draws Q\*'s revealed lines, shared by the board, the teacher's controls and the student's screen, so the three surfaces are pixel-identical for the same state.

Setup dropped its mode question entirely (`app/teacher/whole-class/WholeClassSetup.tsx`): `Project` is disabled only while no question is checked. The demo's class review skip (`lib/demo.ts`) no longer picks a mode either, since a question with a pair always runs all three steps.

### Verification

- vitest 2238 passed (98 new: `lib/classReview.test.ts`), eslint clean, tsc clean, `next build` clean.
- `check:laptop`: 76/76 at 1280×800, no horizontal overflow on any teacher route including `/teacher/whole-class` and `/teacher/board`.
- A headless click-through (`click344.mjs`) against a production build, three tabs (Sam's iPad, the board, the teacher's controls) driven from the demo's "class review" skip:
  - examples on all three screens agree, then the teacher's "Worked example →" moves all three to Q*'s empty working;
  - revealing every line of Q* keeps the board, the teacher's controls and Sam's iPad in step, ending on the students' turn;
  - Sam writes Q2\*\*'s whole working on his own pad (one stroke per burst, the pad's scripted recognition per line): the four right steps, the scripted slip `(2x + 3)(x - 5) = 0` marked wrong with "signs swapped in the pair", the right line after it, then the last step — `[right, right, right, right, wrong, right, right]`, matching `LADDER_SLIPS["q2-star-star"]` exactly; the working column reads "Every line in. Wait for the class." once done;
  - "Next question →" shows the five-second countdown with Cancel on the board and the teacher's controls (visible on the student's screen too, per `useClassAdvance` being mounted there); after it elapses the class is on Q7's examples;
  - a fresh load of `/student` after the move lands back on the frozen screen at the board's current step, with Sam's own first hand-in tagged "your approach" among the examples.
  - Every screenshot was read and checked for layout (no clipped or wrapped maths, the board's calm "no count" panel during the turn, the setup screen with no mode picker and a plain explanatory line under the problem list).
- `sweep:hint-boxes` was started against the worktree's build but did not produce a result: the shared machine had 100+ headless-Chrome processes from other sessions' concurrent work at the time (`ps aux | grep "Google Chrome" | wc -l`), and the sweep's own process sat at ~0% CPU for 15+ minutes with no progress line printed, consistent with resource starvation rather than a failure in this change. This ticket touches no file the sweep exercises (`git diff --stat` has nothing under `lib/hint.ts`, `app/globals.css`'s hint rules, or any `PRACTICES`/pairs hint data); the hint machinery itself is unchanged. Recorded here rather than claimed as a pass; worth a clean re-run once the machine is quieter.

