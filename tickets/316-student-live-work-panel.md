# 316: Pressing a name on Where students are shows that student's work so far

**What to build:** pressing a student's pill on Where students are opens a panel with how they answered the confidence check and the marked transcription of every question they have moved past. The question they are on shows only its "in progress" tag.

**Blocked by:** 315.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "if teacher clicks on Finn Dlamini in Q4, see Q1 Q2 Q3 but Q4 just has the 'in progress' tag (like the purple dot & stuff) … at this stage just show the existing problems & how he responded to the confidence survey. show teacher the marked transcription of his work. not the Q tile functionality in student report, just show the problems outright. for right now let's not even add in the previous table of green & orange & red pills, add to F_F."

## Acceptance

- [x] Every student pill on Where students are is a button (it looks pressable: hover lift and a pointer)
- [x] Pressing one opens a panel over the left column (the same place the diagnostic flyout opens; the mistakes column stays in view) headed with the student's avatar and name, then their confidence answer as the Class view's Confidence column words it
- [x] Then every question the student has moved past, in order, each as the whole question (`ProblemQuestion`: stem and expression) with the student's marked lines under it (`WorkLines`: red lines with their misconception chips, as the report draws them), shown outright, not as report tiles to press
- [x] Then the question they are on: the whole question and the same "in progress" pill the roster uses (purple dot), no lines. Questions after it are not shown
- [x] A student in the warm-up or not started shows the confidence answer and "No questions yet"
- [x] The panel updates live as the student moves on; it scrolls inside itself when long; nothing behind it moves
- [x] Escape, a press outside, or pressing another pill (which opens that student) closes it; opening a diagnostic closes it
- [x] No skill status pills or history (FUTURE_FEATURES entry)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900: Finn on Q4 (Q1–Q3 marked, Q4 in progress), Sam live with the student tab moving on, a warm-up student, Escape and outside presses, every KaTeX expression on one line and inside the panel
- [x] Ticket docs: `architecture/316.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

On `/teacher/a/pset-6/mistakes` during individual working, every pill on **Where students are** is a button. A press opens the student's work so far over the left column, in the slot the live diagnostic's steps use.

- **The pill.** `StudentPill` is a button (`aria-haspopup`, `aria-expanded`). On hover it lifts a pixel with a soft shadow and a darker border, a transform and a shadow, so nothing around it moves. Keyboard focus shows a ring, and while its panel is open it carries the accent ring the diagnostic's card does. The cursor stays the teacher side's arrow (ticket 61).
- **The panel (`app/teacher/StudentWorkPanel.tsx`).** It is headed with the avatar and name in the display face. Under them, "Confidence" and the answer in the Class view's Confidence column's words and colour ("confident" green; "low", "low: fractions" accent; "—" before an answer). Then every question the student has moved past in set order, each the whole question (`ProblemQuestion`, stem and upright maths) with their marked lines under it (`WorkLines`: red lines with their misconception chips, the curated blue, as the report draws them), shown outright. Then the question they are on, with the roster's "Q4 in progress" pill (purple dot) and no lines. Nothing after it. A student not started, on the check-in or in the warm-up reads "No questions yet". The lines and the pill are set at 125%, the size the teacher's report shows them on screen, since the report sits at 125% of the teacher zoom.
- **The model (`lib/studentWork.ts`).** `workFromPlace(place, problems, lines, confidence)` reads "moved past" from ticket 314's place, the same place that puts the pill in its row, so the panel and the row always agree. On question i the student has moved past the questions before it; handed in, past every question (one with no lines reads "not attempted"); not started, on the check-in or in the warm-up, past none. `studentWorkAt` fills in the lines and the answer. A classmate's lines are the part of their record the stream has reached (`classmatesAt`), which holds exactly the questions answered before the one they are on; their answer shows once they are past the check-in. Sam's lines and answer come from his session, and his question is the one `lib/place.ts` says he is on. `WherePill` now carries its `place`. `confidenceTone` moved into `lib/report.ts` beside `confidenceLabel`, and the Class view uses it.
- **Open and close.** The open student lives in `diagnosticFlyout.ts` beside the open diagnostic, one overlay at a time: `setStudentOpen` closes the diagnostic, and `setFlyoutOpen` closes the panel. The panel closes on Escape (focus back on the pill), a press anywhere outside it, and opening a diagnostic. A press on a pill opens that student, or closes the panel when it is that student's own. The panel is not drawn while the chain view has the page.
- **Size.** The panel is as tall as what it holds, up to the foot of the scroll region as the page lies (measured before paint and on a resize, a style write). Past that, the questions scroll inside it under the fixed head. It reads the model every tick, so it moves on with the student, and it moves nothing behind it.
- **`ProgressPill`** (`app/teacher/ProgressPill.tsx`) is the roster's pill, shared by the Class view and the panel.
- **The split card's "expand".** On the split, the hover "expand" button sits at the header's right beside the counts, not after the question in the middle of the header. It shows on hover, or when something in the card has keyboard focus (`group-has-[:focus-visible]`, which was `group-focus-within`). A mouse press on Live diagnostic, which keeps focus on the button, no longer leaves "expand" showing once the pointer has gone. Ticket 315's screenshot with the diagnostic open showed it floating there.

Verification: vitest 2049 (`lib/studentWork.test.ts` 10: moved past from every kind of place, Finn on Q4 with Q2's misconception, every classmate at every 5 s of the stream against their answered questions and answer, Tomas in the warm-up, Liam's unfinished Q5 before and after his hand-in, Sam from his session; `diagnosticFlyout.test.ts` one more for the one-overlay rule), eslint, tsc, next build, check:laptop 76.

Click-through `click316.mjs`, 59/59 at 1280×800 and 59/59 at 1440×900, with Sam's iPad tab and the teacher tab against a production build and real presses and keys (the set shifted 66 s back so the stream is part-way in):
- every pill a button that lifts on hover
- Finn on Q4: the panel exactly over the left column below the headers and never over the mistakes; avatar, name, "confident" in green; Q1–Q3 with his lines, Q2's red line with its chip; Q4 only in progress; the whole question on each; every KaTeX expression on one line inside the panel, none italic; no difficulty tag or status pills
- the panel scrolls inside itself to show Q4, the page never scrolling
- opening moves nothing behind it
- live: Finn moves to Q5, the panel follows, the columns and headers unmoved
- Escape with focus back on the pill; presses outside on either header; a press inside keeps it
- Tomas in the warm-up: "low: fractions" and "No questions yet"
- a pill below his short panel opens that student
- a diagnostic closes the panel, and the panel opens again after it
- every one of the 19 pills' panels matches its row at one moment
- Sam: "—" and no questions on the check-in; he writes three lines on Q1 on his iPad and the panel moves to "Q1 in progress", with his answer showing; Next: Q2 moves it on, Q1 now with the lines he wrote
- the Class view's Confidence column reads the same words for Finn, Tomas and Sam
- the split card's expand beside the counts on hover, hidden after a mouse press on Live diagnostic, shown on focus returned by Escape

Screenshots checked.

## Judgement calls

- **On the split, a classmate still on the confidence check (or not started) shows "—" as their confidence answer in the panel.** The Class view's column already shows their record's answer then; the panel waits until the place model has them past the check-in, since the answer is not given before that. Sam's shows the moment his session has it.
- **On the split, a student who has handed in shows every question as moved past**, with "not attempted" under a question they wrote nothing on (Liam's Q6–Q10), as the report's `WorkLines` reads an empty answer.
- **The teacher sees the marked lines and the in-progress pill at 125%**, the size the teacher's report shows them on screen, beside a 17 px question like the cards'. At the teacher side's own zoom the report's sizes read about 10 px on a laptop.
- **The pill keeps the teacher side's arrow cursor** (ticket 61, as ticket 324 decided for the homework cells). Hover lift, border and focus ring are its pressable cues.
- **The panel opens at the top (Q1) and keeps its scroll while it updates.** It does not jump to the question in progress; the teacher reads down to it.
- **In the first seconds of the set every pill shows its arrival ring at once.** This is the model as built: every student comes into Starting when the set goes live, so all nineteen rings fade together for 8 s. It is noted, not changed (FUTURE_FEATURES). A teacher reload also replays Sam's ring, since his row entry is carried from the first read.

