# 287: A Completed set opens its student report

## Files touched

| File | What it does |
| --- | --- |
| `lib/studentReport.ts` | `studentReport(id, classroom, session, now)`: the read-only report's data (set, problems, skills, lines, pathway, reviews, columns, reflection) for a set that is Completed for Sam, else null. PS1–PS5 from `AssignmentBundle.sam`, PS6 from the session once `reportSent`. Pure. |
| `lib/studentReport.test.ts` | Every finished set's columns, pathway and skills equal the teacher's report's computation; PS6 after Send likewise; To do, Missing, not sent and unknown open nothing. |
| `lib/studentClassroom.ts` | `studentReportHref(id)`; each `StudentSetCard` carries `href` (Completed only). |
| `lib/studentClassroom.test.ts` | `href` on every card shape. |
| `app/student/StudentClassroom.tsx` | A Completed card is one whole-card `button[data-open-report]` (hover, press, focus); To do and Missing unchanged. |
| `app/student/useLessonPull.ts` | Class review's freeze and a presenter's jump take Sam to the live set, from the Classroom or a report (moved out of `StudentClassroom`). |
| `app/student/screens/ReportLayout.tsx` | The student report's layout, split from `ReportScreen`: heading row with the holder's actions, skills, What happened, the side column's working (open, switch, close on a press elsewhere or Escape), the holder's reflection and foot. |
| `app/student/screens/ReportScreen.tsx` | The live report on `ReportLayout`: the box, Send, the nudge, mastery and "Your working →". |
| `app/student/CompletedReport.tsx` | The read-only report: `studentReport` into `ReportLayout`, the reflection as text, "Sent to Ms Okafor", "← Classroom" and Escape back, the set's crumb; not Completed goes to the Classroom. |
| `app/student/a/[id]/report/page.tsx` | The route; an id that names no set redirects to `/student`. |
| `data/pset1/classmates.ts` | Sam's PS1 record gains its `clarification` (his sent reflection). |
| `components/OutcomeTiles.tsx`, `lib/reportWork.ts`, `lib/reportWork.test.ts` | `outcomeTemplate(counts, floors, rows, gap)`: a column's one-row tile width is held only while the grid has room (`max(floor, min(row, 100% − others − gaps))`). |
| `README.md` | Deep links name `/student/a/<id>/report`. |
| `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `tickets/287-…` | Docs. |

## How it connects

```
 Sam's iPad (StudentShell ▶ IpadStage, the lesson's clockwork around every route)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ /student  StudentClassroom                                                   │
 │   studentClassroom(classroom, session, now) ── lib/studentClassroom.ts       │
 │     To do      li + [START|CONTINUE] ──────────────▶ /student/a/pset-6        │
 │     Missing    li, nothing to press                   StudentApp (the run,    │
 │     Completed  button = whole card ◄287                homework after Send)  │
 │                  │ card.href = studentReportHref(id)                         │
 │                  ▼                                                           │
 │ /student/a/<id>/report ◄287  page.tsx (unknown id ─▶ /student)               │
 │   CompletedReport ◄287                                                       │
 │     useLessonPull ◄287 (shared with StudentClassroom) ─▶ /student/a/pset-6   │
 │     studentReport(id, …) ◄287 ── null ─▶ router.replace(/student)            │
 │       │                                                                      │
 │       ├─ pset-1…5: AssignmentBundle.sam ─▶ recordReviews ─┐                  │
 │       │            setClassReview (recorded)              ├─▶ columnsOf      │
 │       └─ pset-6:   session (reportSent) ─▶ sessionReviews ┘   hierarchyFor   │
 │                    setClassReview (the board's)                              │
 │       ▼                                                                      │
 │   ReportLayout ◄287 (split from ReportScreen) ◀── ReportScreen (live, Send)  │
 │     skills · What happened (OutcomeTiles ◄287 row floor) · side: working |   │
 │     key + reflection text + "Sent to Ms Okafor" · ← Classroom / Escape        │
 └──────────────────────────────────────────────────────────────────────────────┘
                   same records, same functions
 teacher laptop    ▼
 /teacher/a/<id>/report?student=sam  ReportBody: recordReviews / sessionReviews,
   columnsOf, setClassReview; "In their words" = the record's clarification
   (= Sam's reflection on his report; PS1's added ◄287)
```
