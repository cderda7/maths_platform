# 279: "see history" opens every category's earlier results at once

## Files touched

| File | What it does |
| --- | --- |
| `lib/setHistory.ts` | New `historyCategories`: the shown categories with an earlier result, in column order. `historyReportHref` and `historyReturnHref` lose the `open` category. |
| `lib/setHistory.test.ts` | `historyCategories` over every PS6 student, the first set and an unknown student; the hrefs without `open`. |
| `app/teacher/TeacherLive.tsx` | `openHistory` opens every category `historyCategories` names; `historyFromQuery` does the same for `?history=`; the stacks-only Escape layer is gone; `ClassViewInit` has no `open`. |
| `app/teacher/ClassView.tsx` | No longer passes `open` to the earlier report. |
| `app/teacher/report/EarlierReport.tsx` | The return link is `?history=<student>`. |
| `app/teacher/a/[id]/class/page.tsx` | Reads `history`, `report`, `student`; no `open`. |

## How it connects

```
 Class View roster (TeacherLive)
   row button "see history" ──► openHistory(student)
                                   │
                                   ▼
            lib/setHistory.ts historyCategories(set, student, columns) ◄279
                                   │  = columns with categoryHistory(...).length > 0
                                   ▼
            history = { student, open: [every such category] }
                                   │
                                   ▼
            HistoryBlocker: one stack per open category, side by side
                 │  pill link historyReportHref(set, earlier, student)   (no &open, 279)
                 ▼
 /teacher/a/<set>/class?report=<earlier>&student=<id>
   ClassView ──► EarlierReport ── "← Return" historyReturnHref(set, student)
                 │
                 ▼
 /teacher/a/<set>/class?history=<id>
   page ──► ClassView ──► TeacherLive historyFromQuery ──► historyCategories ◄279
```

A category pill still toggles its own entry in `history.open`; Escape and "close history" set `history` to null.
