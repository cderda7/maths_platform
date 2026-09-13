# 237: History shows only real earlier sets, and a pill opens that set's report

## Files touched

| File | What it does |
| --- | --- |
| `lib/history.ts` | The history model with the simulation removed: `historyWith` returns the last five real results, `pillLabel` is the day, `psetName` turns a name into "PSet N". |
| `lib/setHistory.ts` | Reads the registry: `categoryHistory`, `hasEarlierSets`, `historyReportHref`, `historyReturnHref`, `earlierReportSet`. |
| `app/teacher/a/[id]/class/page.tsx` | Passes `history`, `open`, `report` and `student` from the query to `ClassView`. |
| `app/teacher/ClassView.tsx` | Shows the roster (`TeacherLive`), or `EarlierReport` when `?report=` names a valid earlier set. |
| `app/teacher/report/EarlierReport.tsx` | This set's chrome around the earlier set's `ReportBody`, with the way back. |
| `app/teacher/report/TeacherReport.tsx` | Split into `TeacherReport` (chrome plus body) and `ReportBody` (with an optional pulsing `back` button). |
| `app/teacher/TeacherLive.tsx` | "see history" appears only when there are earlier sets; an empty category opens nothing; stacks are bottom-anchored at the tallest stack's spacing; pills link to the report. |
| `lib/*.test.ts` | History rules against synthetic sets and the registry. |

## How it connects

```
 /teacher/a/pset-6/class                         (AssignmentProvider: pset-6)
        │ page.tsx  ?history ?open ?report ?student
        ▼
 ClassView.tsx ── earlierReportSet(pset-6, report, student) ──┐
        │ null                                                 │ pset-4 bundle
        ▼                                                      ▼
 TeacherLive.tsx                                   EarlierReport.tsx
   hasEarlierSets(pset-6)? ── no ──► no "see history"   TeacherChrome (pset-6 tabs, zoom 0.9)
   history mode on Mia                                    ┌─────────────────────────────┐
   categoryHistory(pset-6, mia, graphing)                 │ (( ← Return to PSet 6 ))    │ pulse-loop
        │  [pset-4 Fri 4 Sep, pset-5 Mon 7 Sep]          │ AssignmentContext = pset-4  │
        ▼                                                 │   ReportBody student=mia    │
   HistoryBlocker                                          └──────────────┬──────────────┘
   ┌ FRI 4 SEP ┐ ──── historyReportHref ──────────────────►               │
   ┌ MON 7 SEP ┐      ?report=pset-4&student=mia&open=graphing            │
   [ GRAPHING  ]                                                          │
        ▲                                                                 │
        └────────────── historyReturnHref  ?history=mia&open=graphing ◄───┘

 lib/setHistory.ts ── earlierSources(id) ── registry (lib/assignments) ── data/pset1..5
        └─ resultsFrom: only sets that assessed the category ─► lib/history.ts historyWith (last 5)
```
