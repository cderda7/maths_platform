# 243: The teacher's student report gets the Q tiles, and a tile's working opens in the skills card's place

## Files touched

| File | What it does |
| --- | --- |
| `lib/report.ts` | `ProblemReview` / `Reviews`, `sessionReviews`, `recordReviews`, `outcomeOf`, `columnsOf`, `unsolvedOf`, `shownVersions`, `VERSION_LABEL`, `labelSentence`; the old session-based functions sit on top. |
| `data/classmates.ts` | `Classmate.review?`: a record's second submission and group version per wrong problem (filled by ticket 244). |
| `components/OutcomeTiles.tsx` | What happened's tile columns, shared by both reports; `starred`, `lit`, `noteFloor` for the teacher. |
| `components/HierarchyDrill.tsx` | `WorkLines` (one version's marked lines) split out of `ProblemWork`; a wide problem header wraps. |
| `components/StatusKey.tsx` | `split`: two lists of three. |
| `components/Tag.tsx` | `DifficultyTag` never wraps inside the pill. |
| `app/teacher/report/TeacherReport.tsx` | `ReportBody`: skills card with the working panel over it, What happened, the key at the right column's foot; `Versions`. |
| `app/student/screens/ReportScreen.tsx` | Uses `OutcomeTiles` (no visible change). |
| `lib/report.test.ts` | Versions, record reviews, `labelSentence`. |

## How it connects

```
 live Sam: lib/session.ts lines/rework ─┐                         set record: data/pset*/ + data/classmates.ts
 lib/classroom.ts group run ────────────┤                           attempts, wrong, review? (244 fills) ◄243
                                        ▼                                           │
                          lib/report.ts ◄243                                        │
   sessionReviews(session, run) ──► Reviews { [problem]: { first, second, group? } } ◄── recordReviews(record)
                                        │
            ┌───────────────────────────┼──────────────────────────┐
            ▼                           ▼                          ▼
   columnsOf / unsolvedOf        outcomeOf(problem)       shownVersions(problem)
   (first · individual ·        first ▸ individual ▸      first            → [first]
    group · wrong)               group ▸ wrong             individual       → [first, second]
            │                                              group            → [first, second?, group]
            │                                              wrong            → [first, second?, group-last?]
            ▼                                                        │
 components/OutcomeTiles.tsx ◄243 ◄── app/student/screens/ReportScreen.tsx (side column, unchanged)
            │
            ▼
 app/teacher/report/TeacherReport.tsx ◄243  (ReportBody, also inside ClassView's earlier-set report, 237)
 ┌──────────────── left ─────────────────────────┐ ┌──────── right ─────────┐
 │ Card [data-hierarchy]  (size fixed by skills)  │ │ Commentary ── idea ──┐ │
 │  ├ skills (invisible while working is open)    │ │ In their words       │ │
 │  └ [data-report-work] absolute, scrolls inside │ │                      │ │
 │      ← Skills                                  │ │ (mt-auto)            │ │
 │      Q7 · Incorrect                            │ │ Key  StatusKey split │ │
 │      ┌First sub.┐┌Second sub.┐┌Group's last┐   │ └──────────────────────┼─┘
 │      WorkLines (HierarchyDrill) ⚠ chip ─► skill│                        │
 │   or WorkPanel (a skill row / ⚠ chip)          │                        │
 ├────────────────────────────────────────────────┤  lit = idea.problems ◄─┘
 │ Card [data-outcomes]  What happened · notes     │
 │  OutcomeTiles  ★ starred · faded outside idea   │── press ─► ReportWork (lib/reportWork.ts pressWork)
 └────────────────────────────────────────────────┘
```
