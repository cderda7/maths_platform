# 137 · The diagnostic's result: class view, flyout, board

Routes: `/teacher` (the card), `/teacher/mistakes` (the flyout), `/student` (the modal), `/board`.

## Files touched

| File | What it does |
|---|---|
| `lib/classroom.ts` | `DiagnosticRun` and `diagnostics: DiagnosticRun[]` on the classroom; `diagnostic/push`, `answer`, `withdraw`, `board`; `latestDiagnostic`, `openDiagnostic`. |
| `lib/classroom-store.ts` | Stamps `at` on `diagnostic/push`. |
| `lib/session.ts`, `lib/session.test.ts` | The session's diagnostic slot, answers and actions removed. |
| `data/diagnostic.ts` | `DiagnosticOption.misconception`; `Diagnostic.picks` (classmates per distractor) on all ten fixtures. |
| `lib/diagnostic.ts` | `CLASS_SIZE`, `arrivesAt`, `classmatePick` / `writtenPick`, `tally`, `runFor`, `boardDiagnostic`. |
| `lib/board.ts` | The `diagnostic` board kind, first in `boardContent`. |
| `components/DiagnosticResults.tsx` | The shared result block (card and board sizes). |
| `components/FitText.tsx` | Accepts a node child (`fitKey`) so typeset maths fits a cell. |
| `app/teacher/DiagnosticCard.tsx` | The class view's card: link box, or the latest result with status, Withdraw and the board links. |
| `app/teacher/DiagnosticPush.tsx` | The mistake view's flyout: results per tab, waiting band, board links; no switch. |
| `app/teacher/TeacherLive.tsx`, `app/teacher/mistakes/TeacherMistakes.tsx` | Wire the card and the flyout (no `session` prop). |
| `app/board/SmartBoard.tsx` | `DiagnosticSlide`. |
| `app/student/StudentApp.tsx`, `app/student/screens/DiagnosticModal.tsx` | Read the open run from the classroom, answer into it; no recorded pill. |
| `lib/diagnostic.test.ts` | 27 tests. |

## How it connects

```
 /teacher/mistakes                        classroom store (localStorage + BroadcastChannel)
 ┌──────────────────────────────┐          ┌──────────────────────────────────────────────┐
 │ DiagnosticPush (flyout)      │  push    │ diagnostics: DiagnosticRun[]                 │
 │  example | make your own     │ ───────► │  { questionId, question?, pushedAt,          │
 │  preview ─► DiagnosticResults│          │    answer?, board?: shown|cleared }          │
 │  Waiting · n/20 in  Withdraw │ withdraw │        ▲ answer          ▲ board on/off      │
 │  show on board / clear board │ ───────► │        │                 │                   │
 └──────────────────────────────┘          └────────┼─────────────────┼───────────────────┘
                                                    │                 │
 /student                                           │   /teacher      │
 ┌──────────────────────────────┐                   │   ┌─────────────┴────────────────────┐
 │ StudentApp                   │                   │   │ DiagnosticCard                   │
 │  openDiagnostic(classroom)   │ ── answer ────────┘   │  no run: chip + "Mistakes →" link│
 │  ─► DiagnosticModal          │                       │  run: DiagnosticResults          │
 └──────────────────────────────┘                       │   n/20 in · Withdraw │ n/20 answered│
                                                        │   show on board / clear board    │
 lib/diagnostic.ts  (pure, time-driven)                 └──────────────────────────────────┘
   tally(run, now):  classmates i with now − pushedAt ≥ arrivesAt(i)  →  counts[classmatePick(q, i)]++
                     + the demo student's answer          ⇒ { counts, answered, total: 20, complete }
   classmatePick:    fixture.picks[option] ∋ id ? option : correct     (written: writtenPick, 3 in 5 right)
   boardDiagnostic:  latest run; cleared → null; shown → run; else complete ? run : null

 /board                                                  lib/board.ts
 ┌──────────────────────────────┐          boardContent: diagnostic ► whole-class ► group ► holding ► blank
 │ SmartBoard ─► DiagnosticSlide│ ◄──────  { kind: "diagnostic", question, tally }
 │  "x/20 students answered this"│
 │  DiagnosticResults size=board│  (no misconceptions, no names)
 └──────────────────────────────┘
```

## Verified by

vitest (419), eslint, tsc, `next build`; the click-through `diag.mjs` (student, teacher, mistakes and board tabs in one headless Chrome, 54 checks, run twice): the link box; sending from a flyout turns its grid into the result at once; the class view's counts climb through the trickle to 19/20 with the board blank; the demo student's answer completes the run and the board takes it with "20/20 students answered this", 4 / 1 / 14 / 1, the right cell green, no misconception text, nothing overflowing; clear and show by hand; withdraw restores the previous result everywhere; a second question moves the class view and board while the first panel keeps its result; a written three-option question completes under the rule; every misconception whole, every option's maths fitted, no overflow; the result survives a reload; Reset clears it.
