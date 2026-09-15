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

- [ ] Class review setup (`app/teacher/whole-class/WholeClassSetup.tsx`) no longer asks for a mode: no "screens frozen" / "write with me" choice anywhere, and Project needs only the questions and examples. The stored mode (`WholeClassSession.modes`, `FollowMode`, the `wc/mode` action and `BoardControls`' per-question control) goes with it
- [ ] For each question, in the order the teacher set, the board runs three steps:
  - **Examples**: as today (the chosen workings, the teacher's marks and pad, every iPad frozen on the slide)
  - **Worked example**: Q* for that question (`data/pairs.ts`), revealed a line at a time by the teacher, on the board and mirrored on every iPad
  - **Students' turn**: Q** on every iPad, each student writing on their own canvas
- [ ] On a student's iPad during the third step: the whole question (its stem through the shared stem component), their own pad, and each line marked as they write (`checkStep`): right lines take the ladder's right-line look, a wrong line is red with its misconception chip, exactly as the help steps mark them. Nothing is blanked or given
- [ ] The teacher ends the third step with one control ("Next question", or "Finish" on the last). Pressing it starts a five-second countdown shown on the board and on every iPad; when it ends the class moves to the next question's examples, whatever each student has written. A student who finishes early waits on their own work
- [ ] The countdown reuses the classroom's existing advance machinery (`advance`, `isPending`, the mm:ss display's `Math.min` guard) with its own five-second grace, so a reload and every tab agree
- [ ] The board never shows a count of students (ticket 202); counts belong on the teacher's laptop (ticket 320)
- [ ] `lib/setScore.ts`, the teacher's report and Sam's report are unchanged: nothing from class review is marked, scored or recorded there (a test holds it)
- [ ] A set with no Q*/Q** (Problem Sets 1–5, and sets made in Create) runs the examples step alone, as class review does today
- [ ] The demo: Sam's Q** lines are scripted for at least one question, including one wrong line that is marked and then corrected; the presenter's class review skip still lands in a sensible state
- [ ] The student's work in class review lives in the classroom/session state the live view reads (ticket 320), and survives a reload
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900 with Sam's iPad, the board and the teacher tab: every step of two questions, the countdown on both screens, a reload inside each step, no sideways scroll, KaTeX on one line, no difficulty tags, no counts on the board
- [ ] Ticket docs: `architecture/344.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README

## Notes

- Read `app/teacher/whole-class/`, `app/teacher/board/`, `app/student/screens/FrozenScreen.tsx`, `lib/classroom.ts` (`WholeClassSession`, `GRACE_MS`, `advance`) and ticket 312's `app/student/screens/PracticeSteps.tsx` (the worked example and the marking) first; reuse rather than rewrite.
- Ticket 337 (another session) will add questions moved out of group review to setup's pre-ticks; keep setup's data shape easy to extend.
