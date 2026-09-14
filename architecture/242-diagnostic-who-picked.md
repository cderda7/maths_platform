# 242: The teacher sees who picked each option and who repeated their own slip, and the class card names the problem

## Files touched

| File | What it does |
| --- | --- |
| `lib/diagnostic.ts` | `arrivalsAt(run, now, index)` (private): every answer that counts on a step at `now`, in the order it landed (the classmates between the step's open and its close, the demo student's pick). `tally` now counts those arrivals; `pickersAt(run, now, index)` lists their student ids per option, so the two never disagree. `repeatedSlip(step, studentId, option, rows)`: the option's `slip` is a wrong line in that student's own row on the problem. `studentFor(id)` (a classmate or the demo student), `problemLabelOf(step)` ("Q1"; null for the fallback question), `SlipRow` (also typing `slippedAt`). |
| `components/DiagnosticResults.tsx` | Takes `pickers` (option id → `Picker[]`) and draws them at `size="panel"` only: a wrapping row of 22 px initials avatars at each cell's foot, one row held from the push; `PickerAvatar` wears the slip pill's red when `repeatedOn` is set, titled "Name, same slip as on Q1". `Picker` exported. |
| `app/teacher/DiagnosticPush.tsx` | For every step with a result (the chain that is out, or its latest send), `pickersAt` mapped to names and initials, each marked by `repeatedSlip` against the problem's `rows`, passed to `DiagnosticResults`. |
| `app/teacher/DiagnosticCard.tsx` | The eyebrow above the question leads with the step's problem: "Q1", or "Q1 · 1st of 3". No pickers are passed, so no avatars. |
| `lib/diagnostic.test.ts` | Pickers equal the tally at every 100 ms (answering, the demo student's pick, a later step, a forced close), arrival order kept; Q1 Factorise marks exactly Ethan and Sam on A, Liam and Oliver on C; on all 33 steps a pick repeats a slip exactly when the option mirrors a wrong line in the student's row; no row, no mark; names and labels. |

The board (`app/board/SmartBoard.tsx`) and the iPad (`app/student/screens/DiagnosticModal.tsx`) are unchanged: they never receive pickers.

## How it connects

```
 lib/diagnosticChain.ts  DiagnosticRun { steps, openedAt[], answers, forcedAt }   closedAt(run, i)
        │
        ▼
 lib/diagnostic.ts ◄242
   arrivalsAt(run, now, i) ── classmates: openedAt + arrivesAt(k) ≤ cutoff, classmatePick(step, k)
        │                     demo student: answers[step] before the cutoff
        │                     sorted by the moment each landed
        ├──► tally(run, now, i)      counts per option, answered, total, revealed
        └──► pickersAt(run, now, i)  { a: ["sam", "ethan"], b: [...16], c: ["oliver", "liam"], d: [] }

 data/classmates.ts + lib/session.ts (Sam's hand-in)
        │
        ▼
 lib/mistakes.ts mistakesByProblem ─► rows per problem (wrong lines, as the teacher sees them at now)
        │                                   │
        │                                   ▼
        │                     repeatedSlip(step, id, option, rows) ◄242
        │                       option.slip (data/diagnostic.ts, ticket 240) is a wrong line in id's row
        ▼
 app/teacher/TeacherMistakes.tsx ── rows ──► app/teacher/DiagnosticPush.tsx (flyout)
                                               pickersAt ─► studentFor(id) ─► { name, initials,
                                                                               repeatedOn: "Q1" | undefined }
                                                        │ pickers
                                                        ▼
                                  components/DiagnosticResults.tsx size="panel"
                                   ┌ A (x+3)(x+4) ─────────┐ ┌ B (x−3)(x−4) ──────────┐
                                   │ 2/20 students         │ │ 16/20 students         │
                                   │ signs flipped in pair │ │ correct                │
                                   │ (SO)(EK)  ◄ red: same │ │ PR IM TR HS AP FD CA   │
                                   │           slip as Q1  │ │ JW LT ZH MN SP AC GO … │
                                   └───────────────────────┘ └────────────────────────┘

 app/teacher/DiagnosticCard.tsx (class card) ── problemLabelOf(step) ─► "Q1 · 1ST OF 3" eyebrow, no pickers
 lib/board.ts ─► app/board/SmartBoard.tsx          no pickers, no label (anonymous)
 app/student/StudentApp.tsx ─► DiagnosticModal     no pickers, no label
```
