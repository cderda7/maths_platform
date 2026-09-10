# 13 · Submission history with version dropdown (Tier 2)

Route: `/student?stage=history` (reworked run). "Your working →" on the report opens it;
"← Report" returns.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage` gains `history` |
| `lib/session.ts` | `handedInAt`, `reworkedAt` (stamped via `at` on `goto feedback` and `rework/done`); `history/open`, `history/close`; deep-linked runs get fixed times (3:48 pm handed in, 4:07 pm reworked) |
| `lib/store.ts` | `dispatch` stamps `at: Date.now()` on those two transitions so the reducer stays pure |
| `lib/versions.ts` | `versionsOf(session)`: "Handed in" (the frozen original) and "After rework" (rework where present, else the original). `alignVersions(a, b)`: per problem, rows = the longer version's line count, shorter padded with null, plus a `changed` flag |
| `lib/versions.test.ts` | Final uses the rework for Q1–Q3 and the original for Q4; timestamps ordered; Q2 aligns to 5 rows with a padded left row; Q4 unchanged |
| `app/student/screens/HistoryScreen.tsx` | Default: one column, the final version. "Compare with" dropdown lists earlier versions with times; picking one opens it as a left column. Both columns render the same aligned rows at a fixed row height and mirror each other's `scrollTop` (guarded against feedback) |
| `app/student/screens/ReportScreen.tsx` | "Your working →" entry |
| `app/student/StudentApp.tsx`, `app/student/page.tsx`, `app/teacher/TeacherLive.tsx` | Stage wired; teacher stage word |

## How it connects

```
 session.lines (frozen at hand-in) ──┐
 session.rework                     ─┼─▶ versionsOf ──▶ [Handed in · 3:48] [After rework · 4:07]
 handedInAt · reworkedAt            ─┘                        │
                                                              ▼ alignVersions(other, final)
                        HistoryScreen: final only ──dropdown──▶ two Columns, same rows, scrollTop mirrored
```

## Verified by

vitest (50 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run on the deep
link: one column by default; choosing "Handed in" from the dropdown gives two; scrolling the
final column to 220 px puts the original at 220 px; back returns to the report. Screenshot of
the compare view mid-scroll.
