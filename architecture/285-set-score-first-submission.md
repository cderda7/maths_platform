# 285: The Set column is the first-submission score

## Files touched

| File | What it does |
| --- | --- |
| `lib/setScore.ts` | New, pure. `recordScore(record, problems)`: problems inside `done` and off `wrong`. `sessionScore(session, problems)`: problems with first-submission lines, no wrong line, and an answer (a line marked as one or the typed sentence); `rework` never read. `setScoreText(progress, right, total)`: "7/10" once submitted, "—" before. |
| `lib/setScore.test.ts` | PS5's scores, agreement with the report's Correct first try on every finished record and with group review's union for the live student, rework ignored, the column's words. |
| `app/teacher/TeacherLive.tsx` | The roster's `set` for a record row and the live student's row comes from `lib/setScore.ts`; `setSub` ("handed in"), `HANDED_IN` and the `problemsStarted` import are gone; the cell is `[data-set-score]`, the dash muted. |
| `tickets/285-set-score-first-submission.md` | The ticket. |

## How it connects

```
 data/pset*/classmates.ts          lib/session.ts (live)
 Classmate { done, wrong, review } StudentSession { lines, answers, rework }
        │                                   │
        │ done, wrong only                  │ lines + answers only (never rework)
        ▼                                   ▼
 ┌──────────────────── lib/setScore.ts ◄285 ────────────────────┐
 │ recordScore ──────┐                ┌────── sessionScore      │
 │                   ▼                ▼                         │
 │        setScoreText(progress, right, total)                  │
 │        submitted → "7/10"   still on the set → "—"           │
 └───────────────────────────────┬──────────────────────────────┘
                                 │        lib/progress.ts
                                 │        rosterProgress ──┐
                                 ▼                         ▼
 app/teacher/TeacherLive.tsx  rows[].set ──► Class View "SET" cell [data-set-score]
                               (Missing / absent marks unchanged)

 Same rule as:  lib/group.ts reviewProblemsOf / recordReviewProblems (278)
                lib/report.ts outcomeOf(...) === "first" (report's Correct first try)
```
