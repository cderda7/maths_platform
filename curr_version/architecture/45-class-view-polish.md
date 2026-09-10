# 45 · Class view polish

Route: `/teacher` (the grid).

## Files touched

| File | What it does |
|---|---|
| `components/FitText.tsx` | New. One nowrap line at `max` px that measures itself against its parent and scales its font down to fit; re-fits on resize (`ResizeObserver`) |
| `lib/report.ts` (+ test) | `confidenceLines(label)` → `{ head, skills }`: "low: a, b" split so each skill is its own line |
| `data/taxonomy.ts` (+ test) | Unit Focus `short` is "New skills" (the header chip) |
| `data/classmates.ts` | `Classmate.when` removed everywhere; Chloe Abara `done: 0`, groupStatus "Nothing submitted" |
| `lib/hierarchy.ts` (+ test) | `classmateEvidence`: `submitted: c.done > 0`, so a missing student gets no half-dots |
| `app/teacher/TeacherLive.tsx` | Column widths 280 · 100×n · 96 · 64 (min 1040). `STACK_IDLE` / `STACK_ACTIVE` button styles. Row: `group/row`; the name is a plain span (`data-student-name`); `[data-row-actions]` holds **see dot skills** (`openRow(id, "groups")`, pressed while open) and **student report** (`Link`, `data-student-link`). Header: `group/head`; the chip hides on hover behind `[data-column-controls]`, one button per level (`data-expand`, `data-level`), `setColumnLevel(c, level)` opens or, if already at that level, closes; the chip is indigo while its column is open. `ConfidenceCell` renders the head then a `FitText` per skill. `Missing` (`data-missing-mark`) is the triangle over MISSING in the Set cell; `data-missing` on the row. `headerClick` / `headerDouble` / `headerNext` and the header's double-click and title are gone |

## How it connects

```
 /teacher · TeacherLive
   header th (group/head)
     ALGEBRA chip ──hover──▶ chip invisible; [skills] [sub-skills] stacked over it
                                 │ click ─▶ setColumnLevel(c, level)
                                 │           same level already open ─▶ column = null
                                 │           else ─▶ column = { category, level, boxes }
                                 ▼
     chip turns indigo while column.category === c; the open level's button reads "close …"
     (unit is two-layer: one button, [skills])

   row tr (group/row)
     [PR] Priya Raman   [see dot skills]   ● ● ● ● ● ●   confident   10/10
                        [student report]
          │                   │                                │
          │                   │ click ─▶ openRow(id, "groups") │  ConfidenceCell
          │                   │         (pressed while open)   │    low:
          │                   └─ Link /teacher/report?student= │    fractions           (13 px)
          │                                                    │    non-monic factorising (FitText, ~9.5 px)
          └─ plain span, no link, no underline

     [CA] Chloe Abara   ○ ○ ○ ○ ○ ○   —    ⚠ MISSING      done: 0 → classmateEvidence.submitted = false
                                                          → every dot unseen, no half-dots
```

## Verified by

vitest (266 tests: 262 + 4 new); eslint and tsc clean (the `PageProps`/`LayoutProps` errors are
Next's generated types, absent before a build); a headless-Chrome run of the built app on port
3131: headers end NEW SKILLS · CONFIDENCE · SET; no `h:mm` text in the Set column; Confidence
cell 92 px at the page's scale (was 77); "non-monic factorising" at 9.5 px, one line, the other
named skills at 13 px; Chloe's row `data-missing`, mark text "! MISSING", confidence "—", six
unseen dots, her report page opens without error; the name is a `SPAN`; row actions hidden until
hover, then two 77×17 px buttons `rgb(232,240,250)` on `rgb(69,53,200)` at 11 px, same left edge;
"see dot skills" opens `data-open="groups"` (equations · expanding & factorising · number &
fractions · …), reads pressed, closes on a second click; header controls hidden until hover, then
`skills` / `sub-skills`; skills → `data-column-open="groups"` with 20 column drills and the button
reading `close skills`; sub-skills → `expanded`, `close sub-skills`; closes from either level; the
unit header has one button.
