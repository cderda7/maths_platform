# 312: I need help on a question runs Q* worked, Q** finished, then back to Q

**What to build:** during the set, "I need help" (and the practice offer after a repeated slip) runs three steps on the student's iPad: Q*, a whole question like Q fully worked; Q**, a second one with the named skill's lines blank for the student to write; then back on Q itself. Video comes off the help menu everywhere.

**Blocked by:** 310 (the questions), 311 (the line check), 314 (the teacher's place model reads this ticket's session state).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

Today "I need help" on a question opens a skill practice (`HelpPicker` → `PracticeOverlay` → `PracticePad`): an isolated problem on the named skill, attempted cold, with a flat help menu (hint, worked example, video, chat), and a follow-up that opens only after the worked example has been seen. No student is guaranteed to see the method modelled, and the isolated skill problem leaves the jump back to the full question to the student.

The user (2026-09-15) set the new flow: Q → Q* (a whole different question, worked) → Q** (another, the student finishes it) → back to Q. They also said:

- Video comes off the supports: "assumes student has headphones — unlikely in practice".
- A wrong line in Q** is marked; the student opens chat if they want it. The tutor never opens it on its own.
- The practice offer after a repeated slip ("Two minutes on monic?", `lib/escalation.ts`) opens the same three steps.
- Help is never gated on having written something first. A student can ask before writing anything.
- "I need help" is still there for students who said they were confident.

## Acceptance

- [ ] On the working screen, "I need help" → the picker (which skill is getting in the way) → **Q\***: Q*'s whole question (stem and expression, `ProblemQuestion`) and its worked example, step by step as the worked example plays today, with chat beside it (a tap on a line asks about that line; the tutor answers about Q*, never Q)
- [ ] Then **Q\*\***: Q**'s whole question, its given lines shown, the named skill's lines blank (ticket 310's rule). The student writes each blank on the pad. Each line is checked (ticket 311): right moves on, wrong is marked red in place with its misconception chip where known, and nothing else happens. After two wrong lines on the same blank, that blank fills in and the student carries on
- [ ] Then **back on Q**, with "see the example again" (reopens Q*'s worked example) beside hint and chat
- [ ] The help menu everywhere (warm-up, practice, back on Q) has no video option
- [ ] Chat opens only when the student presses it, at every step
- [ ] "Back to Qn" is there at every step and returns to Q with the student's own lines untouched
- [ ] The repeated-slip practice offer opens the same three steps, on the skill the slip was on
- [ ] The session records, per question, that practice was taken, on which skill, how far the student got (Q*, Q**, back on Q) and when each step started; a reload lands on the same step. Ticket 314's place model reads it: Sam's place on the teacher's laptop shows the step
- [ ] Nothing written in Q* or Q** is marked on the set; the set score rule (`lib/setScore.ts`, right first time) is unchanged
- [ ] The hint-box sweep covers every Q** hint (`npm run sweep:hint-boxes` against a production build, per project CLAUDE.md): no lit box covers a neighbour, nothing moves
- [ ] No difficulty tags on any student screen
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; a click-through at 1280×800 and 1440×900 on Sam's iPad: the full route from I need help on Q2 through a wrong line marked and corrected, back to Q2, plus Back to Q2 from each step and a reload on each step; nothing scrolls sideways, every KaTeX expression on one line
- [ ] Ticket docs: `architecture/312.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES for anything deferred

## Notes

- Reproduce today's flow in the browser before changing it.
- The warm-up keeps today's behaviour in this ticket (ticket 313 changes it), but loses video.
