# 286: The site's front page is the presenter's chooser again

## Files touched

| File | What it does |
| --- | --- |
| `app/page.tsx` | The presenter's chooser, back from `app/demo/page.tsx` (ticket 265) unchanged: the Student, Teacher and Smartboard cards (`data-board-link`), the one-tab split link (`data-split-link`) and Reset demo. Rendered at `/` with no redirect. |
| `app/demo/page.tsx` | Now a server `redirect("/")` (a static 307), so the address ticket 265 gave the chooser still works. |
| `app/page.test.ts` | Pins both: `/` renders without redirecting, `/demo` redirects to `/`. |
| `README.md` | "Run it" and "Where things are" name `/` as the chooser and `/demo` as its redirect. |
| `ARCHITECTURE.md` | The system diagram's app box and the ticket row. |
| `DECISION_LOG.md` | Why the front page is the chooser again. |
| `tickets/286-root-is-chooser.md` | The ticket, done. |

No component links to `/` (the `Brand` wordmark is a label, ticket 184), and "← Edexia Classroom" goes to `/teacher`, so nothing else moved.

## How it connects

```
 presenter / visitor                      old link or bookmark
      │ GET /                                  │ GET /demo
      ▼                                        ▼
 app/page.tsx ◄286 (was app/demo/)        app/demo/page.tsx ◄286
 the chooser                              redirect("/") ─307─▶ /
 ┌──────────────┬──────────────┬──────────────┐
 │ Student·iPad │ Teacher      │ Smartboard   │
 │ /student     │ /teacher     │ /board       │
 └──────┬───────┴──────┬───────┴──────┬───────┘
        │              │              │
        │   Or see all three in one tab ─▶ /split ─▶ iframes of the three
        ▼              ▼              ▼
   StudentApp     Classroom.tsx    Board
   (IpadStage)    (Edexia          (blank until
                   Classroom)       class review)
```
