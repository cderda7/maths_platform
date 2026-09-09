# 16 · Diagnostic MCQ push (Tier 2, lowest priority)

Routes: the control lives on `/teacher` (Class view, right column); the interrupt appears on
`/student` over whatever screen is showing.

## Files touched

| File | What it does |
|---|---|
| `data/diagnostic.ts` | One fixture question (a factorisation of 2x² + 7x − 4, four options, the correct one, why a teacher would push it) |
| `lib/session.ts` | `diagnostic` (pending push: question + recorded flag) and `diagnosticAnswers[]`; actions `diagnostic/push`, `diagnostic/answer` (clears the pending push, logs the answer with its recorded flag, ignores answers with nothing pending), `diagnostic/withdraw` |
| `lib/diagnostic.ts` | `isCorrect(questionId, option)` |
| `lib/session.test.ts`, `lib/diagnostic.test.ts` | Push → answer → logged, stage untouched, double answer ignored; withdraw; correctness |
| `app/student/screens/DiagnosticModal.tsx` | The interrupt: question, recorded/not-recorded badge, four options, "Send answer"; rendered by `StudentApp` above every stage while a push is pending |
| `app/teacher/DiagnosticPush.tsx` | The control: question preview with the correct option tinted, recorded switch, "Push to the class"; while pending, a "waiting for Sam" band with Withdraw; then the response with correct/not and recorded/not |
| `app/teacher/TeacherLive.tsx` | Mounts the control in the right column |

## How it connects

```
 teacher tab                          lib/store.ts (shared session)                 student tab
 DiagnosticPush ── diagnostic/push ──▶ session.diagnostic = { questionId, recorded } ──▶ StudentApp: DiagnosticModal over any stage
                                                                                        │ Send answer
 DiagnosticPush ◀── batch (3 s) ────── session.diagnosticAnswers += { option, recorded } ◀── diagnostic/answer (stage, lines untouched)
   "Sam answered B, the right one · recorded"
```

## Verified by

vitest (57 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run: the
teacher flips the switch to recorded and pushes; the student tab, mid-Q1 with a line already
read, shows the modal; picking B and sending closes it with Q1 and its line still there; within
a batch the teacher reads "Sam Okonkwo answered B, the right one · recorded".

## Follow-up · 2026-09-09 (spec v3 session)

- `DiagnosticPush` has two tabs in the same shape: **Example** (the fixture) and **Your own**
  (question, optional TeX expression, up to four options, tap a letter to mark the right one).
  `lib/diagnostic.ts` gained `customQuestion(stem, tex, options, correct)` (valid with a stem, two
  or more options and a correct one among them) and `questionFor`; `isCorrect` takes the inline
  question. A teacher-written question travels inside `diagnostic/push` and stays on the answer,
  so the response line judges it without a fixture. `DiagnosticModal` renders either.
- Copy: "Push"; the response reads `Sam · B · right · recorded`.
