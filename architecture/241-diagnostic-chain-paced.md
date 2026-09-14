# 241: The teacher sends a chain of step questions and paces the class through them, the answer revealed once everyone has answered

## Files touched

| File | What it does |
| --- | --- |
| `lib/diagnosticChain.ts` (new) | The chain's run state and its reducer, with no import of `lib/classroom` or `lib/diagnostic`. `DiagnosticRun` is `steps` (solution order), `pushedAt`, `openedAt[]` (one per step reached; the last is current), `answers` (the demo student's pick and its moment, per step id), `forcedAt` (force submit's moment, per step id), `endedAt`, `withdrawn`. `closedAt(run, i)` derives a step's close: the twentieth answer (last classmate at 8 s, or Sam's if later) or force submit plus 10 s, whichever is first. `isRevealed`, `forceDeadline`, `chainPosition` ("1st of 3"), `inSolutionOrder`, `chainReducer` (push, answer, force, force-cancel, next, end, withdraw, each refused outside its phase), `chainPauses` (each chain from push to end), `migrateRun` (a pre-241 run reads as an ended chain of one). `CLASS_SIZE`, `TRICKLE_*`, `arrivesAt`, `DIAGNOSTIC_FORCE_MS` live here. |
| `lib/classroom.ts` | `DiagnosticRun` and the diagnostic actions come from `lib/diagnosticChain`; the reducer delegates every `diagnostic/*` action to `chainReducer`. `latestDiagnostic`, `liveDiagnostic` (was `openDiagnostic`). `migrateClassroom` converts stored pre-241 runs. `diagnostic/board` removed. |
| `lib/classroom-store.ts` | Stamps `at` on every `diagnostic/*` action (a step's close is derived from those moments). |
| `lib/diagnostic.ts` | `tally(run, now, index = current)` counts arrivals after the step opened and before it closed; after a force submit close the total is the responders; `Tally.revealed`. `runFor` returns `{ run, index }` of a step's latest non-withdrawn send. `boardDiagnostic` removed. |
| `lib/stream.ts` | `StreamSet.pauses`; `streamElapsed(start, pauses, now)` leaves chain time out of the classmates' clock; `wallAt` maps a stream moment back to wall time (so arrival order and "just arrived" keep working). |
| `lib/assignments.ts` | The live bundle carries `pauses: chainPauses(c.diagnostics)`; a finished set's are empty. |
| `lib/board.ts` | `diagnostic` content while a chain is out: `run`, current `question`, `tally`, `position`, `last`; it outranks every other board state and gives it back when the chain ends. |
| `components/DiagnosticControl.tsx` (new) | The teacher's one control on the board, the flyout and the class card: force submit → countdown "closing in 0:07 · Cancel" → next step, or back to work on the last step. |
| `components/DiagnosticResults.tsx` | The board variant shows no count per option and no misconception, and the right option green only once `tally.revealed`; teacher variants unchanged. The board stem is balanced across its lines. |
| `app/board/SmartBoard.tsx` | `DiagnosticSlide`: "1st of 2", "14/20 answered" (pulse while answering), the step, the control at the bottom right. |
| `app/student/StudentApp.tsx`, `app/student/screens/DiagnosticModal.tsx` | The modal reads the live run and `now`: "1st of 3", first tap locks (neutral ink highlight, "Waiting for the class…", options disabled), at the reveal the right option green and the highlight gone; no Send and no way out; shown over every screen until back to work. |
| `app/teacher/DiagnosticPush.tsx` | Step cards select and clear on click (accent border, corner tick), `send N to class` under the stack sends in solution order; while a chain is out nothing selects, the chain's steps keep the tick, opened steps show live results, the current one a band ("1st of 2 · 14/20 answered" and the control) with Withdraw under it. |
| `app/teacher/DiagnosticCard.tsx` | While a chain is out: the current step only, "1st of 3" above the question, "n/20 answered", the live grid, Withdraw and the control; empty box again after back to work or a withdraw. |
| `lib/diagnostic.test.ts`, `lib/stream.test.ts` | The three-step walk, phase refusals, reveal at the twentieth answer, force submit countdown / cancel / totals over responders, withdraw, migration, storage round trip, the board, stream clock and Mistakes rows pausing and resuming. |

## How it connects

```
 app/teacher/DiagnosticPush.tsx  (Mistakes flyout)
   click step cards ─► selected ids ─► send N to class
        │ diagnostic/push { steps }                        every diagnostic/* action
        ▼                                                  stamped with `at` by
 lib/classroom-store.ts ── dispatchClassroom ──────────────► lib/classroom.ts classroomReducer
   (localStorage + BroadcastChannel: every tab)                     │ delegates
        │                                                           ▼
        │                                           lib/diagnosticChain.ts ◄241
        │                                             DiagnosticRun { steps, openedAt[], answers,
        │                                                             forcedAt, endedAt, withdrawn }
        │                                             chainReducer: push → answer → force ⇄ cancel
        │                                                            → next … → end | withdraw
        │                                             closedAt = min(20th answer, forcedAt + 10 s)
        │                                             isRevealed(run, i, now) · chainPosition
        │                                                  │                         │ chainPauses
        ▼                                                  ▼                         ▼
 ┌──────────────── derived at `now` in each tab ────────────────┐     lib/assignments.ts bundle.pauses
 │ lib/diagnostic.ts tally(run, now, i): counts before the close│              │
 │   total = 20, or the responders after a forced close         │              ▼
 └───────┬───────────────────────┬──────────────────────┬───────┘     lib/stream.ts streamElapsed/wallAt
         │                       │                      │               (classmates' clock stands still
         ▼                       ▼                      ▼                while a chain is out)
 teacher laptop            lib/board.ts           app/student/StudentApp.tsx       │
  DiagnosticPush band        diagnostic content     └► DiagnosticModal              ▼
  DiagnosticCard (class)     └► SmartBoard           "1st of 3", first tap locks,  lib/mistakes.ts rows
  counts + green live          DiagnosticSlide       green at reveal, own pick     (Mistakes view pauses)
         │                     no counts, green       loses its highlight
         │                     at reveal only
         └───────────┬───────────────┘
                     ▼
     components/DiagnosticControl.tsx ◄241 (board · flyout · card, first press wins)
       force submit → closing in 0:0s · Cancel → next step | back to work
```

Ticket 242 reads the same run: who picked each option at `now` is the classmates `tally` counts (arrivals between the
step's `openedAt` and its `closedAt`) plus Sam's `answers[step]`, and a repeated slip compares a picker's own wrong line
with the option's `slip`.
