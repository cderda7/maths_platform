# 241: The teacher sends a chain of step questions and paces the class through them, the answer revealed once everyone has answered

**What to build:** In the flyout the teacher selects one or more step questions and sends them as a chain. The class stops work. The board and every iPad show the chain one step at a time ("1st of 3"). A step's correct answer turns green on the board and on every iPad only once all students have answered, or after force submit. The teacher leads a discussion, then moves on from the board or the laptop: **next step**, and on the last step **back to work**. Students stay on the diagnostic until then.

**Blocked by:** 240.

**Status:** todo

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), in the grilling session after 240's step questions were agreed:

- "i like that option to select multiple & send chain, implement in this iteration"
- "in chain mode, teacher pushes all at once, but class stops & discusses & gets right answer revealed after each step in the chain"
- "board projects question, & students don't go from answering to back to their work — instead, correct answer gets highlighted green & student laptops show this as well. don't mark their og answer — they'll know what they just answered, & risk of stigma of having wrong answer marked & like permanently there. so yeah just mark correct answer. DONT reveal correct answer until all student have answered. then teacher is going to lead a discussion — so teacher can move on from either the board or from their laptop. students stuck on the page until then."
- On force submit: "teacher has same 'force submit' option, but this time with a 10 second countdown" … "instead of 18/20 answered, just have totals be /18 if 2 didn't respond" … "keep 8 seconds & have the 10 second countdown as option, even if we don't use it, that's fine"
- On the class card: "don't show student count or prev steps in chain or future steps in chain. only thing is a count for multistep chains: 1st of 3, 2nd of 3, … to show students how many diagnostic questions are in the chain"
- On the board: "board goes 1 step at a time, with same 1st of 3 idea". No per-option counts on the board at the reveal, because a "1/20 students answered this way" could embarrass a student. "14/20 answered" for the step on the board is fine.

## Agreed behaviour

**Selecting and sending (flyout)**
- Click a step's card to select it (accent border and a small tick). Click again to clear it. Nothing starts selected.
- One button under the stack reads **send N to class**. It is disabled at zero, and disabled while another chain is out.
- The chain runs in solution order, whatever order the steps were clicked in. One step selected is a chain of one.

**Running a step**
- The board takes over as soon as a chain is sent, and returns to whatever it showed before after **back to work**. Today's **show on board / clear board** controls are removed.
- **Board:** the step's question and options, "1st of 3" (chains longer than one), and "14/20 answered". It never shows per-option counts, before or after the reveal.
- **Student iPad:** the step's question and options with "1st of 3". The first tap locks the pick, shown in a neutral highlight with "Waiting for the class…", and it cannot be changed. The iPad stays on the diagnostic, with no way back to the work.
- **Teacher's laptop:** everything is live from the push, on both the flyout and the class card: per-option counts, the correct option in green, and "14/20 answered".
- **Reveal:** when every student has answered the step, the correct option turns green on the board and on every iPad. The neutral highlight on each student's own pick disappears, and nothing marks any pick as wrong. Nothing is revealed before that.

**The teacher's one control** (the same on the board, in the flyout and on the class card, whichever is pressed first)
- Answers still coming in: **force submit** (10-second countdown, cancellable, styled like the stage's force submit). At zero, the step closes, anyone who has not answered is left out, the step's totals read over the responders (/18), and the reveal happens.
- Revealed, not the last step: **next step**.
- Revealed, last step: **back to work**. It closes the chain, every iPad returns to where the student was, and the board returns.
- There is no going back a step.
- **Withdraw** stays as a separate action that discards the whole chain.

**Class view card** while a chain is out: the current step only, with its question and live result grid (teacher side), "1st of 3", and the one control. No previous or later steps. The step's number of answers is shown on the teacher side only.

**Timing:** each classmate answers a step 1.5–8 s after that step opens (the current `arrivesAt` spread, restarted per step). Sam answers for real. The countdown exists even though the simulated class usually finishes first.

**The class's work pauses (simulated classmates only):** while a chain is out, the classmates' work stream (`lib/stream.ts`) pauses and resumes where it left off, so Mistakes rows do not pile up during the discussion. Stage timers are untouched.

## Solution sketch

- `lib/classroom.ts`: `DiagnosticRun` becomes a chain: its step ids in order, the current step index, a per-step open time, the demo student's answer per step, a per-step closed-at time (set by all answered or force submit), and a phase per step: answering → revealed. Actions: `diagnostic/push` (steps), `diagnostic/answer` (current step), `diagnostic/force` (starts the 10 s countdown; `diagnostic/force-cancel`), `diagnostic/next`, `diagnostic/end`, `diagnostic/withdraw`. `diagnostic/board` goes.
- `lib/diagnostic.ts`: `tally(run, step, now)` counts only arrivals before the step's close. `revealed(run, step, now)` is true once every student has answered or force submit has closed the step. The board no longer decides visibility on its own.
- `lib/stream.ts`: the classmates' clock subtracts the time spent inside chains.
- `app/teacher/DiagnosticPush.tsx`, `app/teacher/DiagnosticCard.tsx`, `app/board/SmartBoard.tsx`, `app/student/screens/DiagnosticModal.tsx`, `components/DiagnosticResults.tsx`: as agreed above. The board and iPad variants show no counts; the teacher variants do.
- `FUTURE_FEATURES.md`: anonymous per-option counts on the board at the reveal (deferred 2026-09-14: a lone student on a wrong option could be embarrassed; maybe with a minimum count, or as percentages); going back a step in a chain.

## Acceptance

- [ ] Unit: the reducer walks a three-step chain push → answer → reveal → next → … → end; answers and force submit are refused outside their phase; a second push is refused while a chain is out; withdraw clears it.
- [ ] Unit: reveal only when all 20 have answered; force submit closes at 10 s, the totals leave out non-responders, cancel restores answering; the stream clock excludes chain time.
- [ ] Click-through at 1280×800 and 1440×900, three tabs (teacher, board, Sam's iPad), on a production build: select steps 3 and 1 and the chain runs 1 then 3 with "1st of 2"/"2nd of 2"; the board and iPad show no counts and no green before the reveal; Sam's pick locks neutral; green appears on the board and iPad when the 20th answer lands and Sam's own pick loses its highlight; **next step** from the board advances the laptop and the iPad, and **next step** from the laptop advances the board; force submit counts down 10 s, cancel works, and at zero the totals read /19 without Sam; **back to work** returns the iPad to Sam's working and the board to its previous screen; Mistakes rows do not grow during the chain and resume after; the class card shows only the current step.
- [ ] vitest, eslint, tsc, next build, check:laptop
