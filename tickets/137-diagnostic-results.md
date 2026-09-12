# 137: The diagnostic's result, on the class view, in the flyout and on the board

**What to build:** The class view's diagnostic card stops being a picker: with nothing sent it is a white box with the "Live diagnostic" chip that links to the mistake view, where questions are chosen and sent; once a question is out it shows that question's result and keeps showing it: the question, one cell per option with the option as written, "x/20 students" and the misconception it reveals (five words or fewer), the right one green. The nineteen classmates answer over a few seconds after the push (teacher side only); the demo student answers on the iPad as before. The diagnostic never reaches the board while it is open; once all twenty have answered the board takes it on its own ("x/20 students answered this", the cells with counts, no misconception wording), or earlier by the teacher's hand ("show on board"), until "clear board" or the next question. The mistake view's flyout shows the same result in place of its option grid, per problem and per tab. Withdraw while the class is still answering.

**Blocked by:** 132 (the flyout), 130 (the twenty classmates).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12, interview): "let's simplify the diagnostic here. mainly want it in mistakes view, bc that's what teacher will need to be looking at to make informed diagnostic question. so here, let's simplify it so it's clear as an option, but to do real working like picking actual question & pushing it, that's in mistakes tab." Then: "reserve the right 1/8 of the page for the diagnostic. just a white box with text saying 'diagnostic question'"; "each multiple choice answer box will have the answer as currently written, below that 12/20 students, below that what misconception that surfaces (max 5 word description)"; "ONLY for most recent diagnostic question"; "trickle — but only show on teacher view, not board. ALSO we need to link this up to the board, as AFTER the diagnostic questions have all been answered, the teacher will want to review. have the diagnostic question pushed only to student screens, not the board. after ALL students have submitted, pull up the diagnostic question on the board with a label of x/20 students answered this"; "once a question has been answered, want to have that answer permanently visible — not hover to view. in the simplified permanent view, ONLY show the question & fraction of students & the 5 words summary. also highlight correct answer box in green."

Decisions from the interview: the card keeps its slot and grows in place (the teacher comes back to the class view fresh; Key moving down is no shift they see); before anything is sent the box is a link with no hover; the class view shows the latest question overall, each mistake-view panel its own latest; a written question's classmates follow a rule (most take the marked answer) so its run completes like a fixture's; the correct cell says "correct"; "show on board" from the first answer as well as the automatic 20/20; the board carries no misconception text; wording "Live diagnostic" on both tabs.

## Solution

- `lib/classroom.ts`: the diagnostic moves off the student session onto the classroom (`diagnostics: DiagnosticRun[]`, oldest first): `diagnostic/push` (refused while one is open; the store stamps `at`), `diagnostic/answer` (the demo student's option closes the run), `diagnostic/withdraw` (drops the open run), `diagnostic/board` (the teacher's hand: `shown` / `cleared` on the latest run). `latestDiagnostic`, `openDiagnostic`. `lib/session.ts` loses `diagnostic`, `diagnosticAnswers` and the three actions.
- `data/diagnostic.ts`: `DiagnosticOption.misconception` (five words or fewer, every distractor of the ten fixtures; the correct option has none) and `Diagnostic.picks` (which classmates take each distractor, grounded in their wrong lists and notes; Chloe, who submitted nothing, is the stray wrong answer where nobody else would be).
- `lib/diagnostic.ts`: `CLASS_SIZE` (20), `arrivesAt(index)` (the classmates land between 1.5 and 8 s after the push in a fixed shuffle), `classmatePick` (the fixture's pick or the right answer; `writtenPick` for a teacher-written question: three in five take the marked answer, the rest spread across the distractors), `tally(run, now)` (counts per option, answered, complete), `runFor(c, example, problemId, written?)` (a panel's latest run, per tab), `boardDiagnostic(c, now)` (the latest run when shown by hand or complete, never when cleared).
- `lib/board.ts`: a `diagnostic` kind above every other, carrying the question and the tally.
- `components/DiagnosticResults.tsx`: the shared result (question; 2 × 2 cells: letter, the option fitted with `FitText`, "n/20 students", misconception or "correct"; the right cell `secure-soft`), `size="board"` for the projector without misconceptions. `FitText` accepts a node child with a `fitKey`.
- `app/teacher/DiagnosticCard.tsx` (class view): the link box, or the latest result with the pulsing "n/20 in" and Withdraw while open, "n/20 answered" after, "show on board" / "clear board".
- `app/teacher/DiagnosticPush.tsx` (mistake view only now): flyout as ticket 132; the example tab's option grid becomes the result once its question is out, the own tab's result sits under the editor; "Waiting · n/20 in" with Withdraw; the board links under the latest run's result; the recorded switch is gone (ticket 139 removes it on main too).
- `app/board/SmartBoard.tsx`: `DiagnosticSlide`, the header's "x/20 students answered this" (a pulse while some are still to come).
- `app/student/StudentApp.tsx`, `DiagnosticModal.tsx`: read `openDiagnostic(classroom)`, answer with `dispatchClassroom`; no recorded pill.
- Tests: `lib/diagnostic.test.ts` (27: fixture shape, misconceptions ≤ 5 words, picks name real classmates on distractors only, arrivals, picks, the written rule, the tally over time, runs on the classroom, `runFor` per tab, the board rule and its precedence). Session tests for the old slot removed.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Class view with nothing sent: a white card with the chip and "Mistakes →", a link to `/teacher/mistakes`, in the diagnostic's slot above Key; the board blank
- [x] Sending Q3 from its flyout: the flyout's grid becomes the result at once (four cells, 0/20 each, misconceptions under the distractors, "correct" in green under the right one, "Waiting · 0/20 in" with Withdraw); Q2's send is off
- [x] The class view's card shows the same result without hovering, counts climbing mid-trickle with a pulsing "n/20 in"; at 8 s all nineteen classmates are in (Q3: 4 / 1 / 13 / 1), "show on board" offered, the board still blank, no name on it
- [x] The demo student sees Q3's question (no recorded pill), answers C: the board takes the diagnostic on its own with "20/20 students answered this", 4 / 1 / 14 / 1, the right cell green, no misconception text, nothing overflowing; the class view reads "20/20 answered", no Withdraw, "clear board"; clear → blank; show → back
- [x] The flyout shows the same result with send back and "show on board"
- [x] Withdraw: Q2's question out then withdrawn returns the class view to Q3's result, Q2's flyout to its preview, the student's modal gone
- [x] A second question (Q5) answered: the class view and the board switch to it; Q3's flyout keeps Q3's result without board links
- [x] A written question under Q7 (three options): its result on the own tab under the editor, most on the marked answer, every distractor some, no misconception text, the example tab untouched, the board at 20/20
- [x] Every misconception shown whole (two lines where needed), every option's maths fitted to its cell, no horizontal overflow in the card or the flyout; the result survives a reload; Reset clears it all
- [x] vitest (419), eslint, tsc, `next build`, headless run (`diag.mjs`, 54 checks, twice)
