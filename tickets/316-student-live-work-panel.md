# 316: Pressing a name on Where students are shows that student's work so far

**What to build:** pressing a student's pill on Where students are opens a panel with how they answered the confidence check and the marked transcription of every question they have moved past. The question they are on shows only its "in progress" tag.

**Blocked by:** 315.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "if teacher clicks on Finn Dlamini in Q4, see Q1 Q2 Q3 but Q4 just has the 'in progress' tag (like the purple dot & stuff) … at this stage just show the existing problems & how he responded to the confidence survey. show teacher the marked transcription of his work. not the Q tile functionality in student report, just show the problems outright. for right now let's not even add in the previous table of green & orange & red pills, add to F_F."

## Acceptance

- [ ] Every student pill on Where students are is a button (it looks pressable: hover lift and a pointer)
- [ ] Pressing one opens a panel over the left column (the same place the diagnostic flyout opens; the mistakes column stays in view) headed with the student's avatar and name, then their confidence answer as the Class view's Confidence column words it
- [ ] Then every question the student has moved past, in order, each as the whole question (`ProblemQuestion`: stem and expression) with the student's marked lines under it (`WorkLines`: red lines with their misconception chips, as the report draws them), shown outright, not as report tiles to press
- [ ] Then the question they are on: the whole question and the same "in progress" pill the roster uses (purple dot), no lines. Questions after it are not shown
- [ ] A student in the warm-up or not started shows the confidence answer and "No questions yet"
- [ ] The panel updates live as the student moves on; it scrolls inside itself when long; nothing behind it moves
- [ ] Escape, a press outside, or pressing another pill (which opens that student) closes it; opening a diagnostic closes it
- [ ] No skill status pills or history (FUTURE_FEATURES entry)
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900: Finn on Q4 (Q1–Q3 marked, Q4 in progress), Sam live with the student tab moving on, a warm-up student, Escape and outside presses, every KaTeX expression on one line and inside the panel
- [ ] Ticket docs: `architecture/316.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES
