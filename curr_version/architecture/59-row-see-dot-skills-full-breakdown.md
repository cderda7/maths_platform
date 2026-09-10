# 59 · "see dot skills" beside a name opens the row's full breakdown

Route: `/teacher` (hover a student's row, click **see dot skills**).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The row's hover button calls `openRow(id, "expanded")` (was `"groups"`), so the drill mounts with every group of every category open. The component comment now says the button opens the full breakdown |

## How it connects

```
   hover a student's block (tbody.group/row)
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ [ZH] Zara Haddad  [see dot skills]  ● ● ● ● ● ● UNIT 1   confident  10/10│
   │                   [student report]                                       │
   └────────┬─────────────────────────────────────────────────────────────────┘
            │ click                        (row single tap ─▶ openRow(id, "groups")
            ▼                               row double tap ─▶ openRow(id, "expanded"))
   openRow(id, "expanded")  ──▶  open = { student, mode: "expanded", columns: columnBoxes(id) }
            │
            ▼
   <RowDrill mode="expanded" …>          components/HierarchyDrill.tsx (unchanged)
     openGroups = allGroups  (every group of every column starts open)
   ┌──────────────────────────────────────────────────────────────────────────┐
   │  [equations]   [function notation] [quadratic graphs] [process & rigor]  │
   │   linear eq.    evaluating a fn     reading graph…     showing complete… │
   │   quadratic eq.[zeros & solving]    sketching…                           │
   │  [expanding &   zero-finding                          [reasoning & …]    │
   │   factorising]                                          formal justif.   │
   │   distributive…                                         drawing concl.   │
   │   monic trin.                                          [interpretation…] │
   │   non-monic…                                            interpreting…    │
   │  [number & fractions]                                                    │
   │   fractions                                                              │
   └──────────────────────────────────────────────────────────────────────────┘
     click a skill ─▶ its work panel beneath (as before)
     [close] (same button) ─▶ setOpen(null)
```

## Verified by

vitest (280 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on
port 3133 clicked `[data-see-skills]` on Zara Haddad's row: the row went to `data-open="expanded"`,
the drill mounted with `data-mode="expanded"` and 14 skill items visible under nine open group
chips in one click (screenshot); a second click on the button (reading "close", `aria-pressed`)
removed the drill.
