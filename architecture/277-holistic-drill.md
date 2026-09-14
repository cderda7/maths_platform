# 277: Holistic page, results open their skills and problems; patterns beside the grid

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/students/HolisticPage.tsx` | `Body` holds the open cell and picked skill (press elsewhere and Escape close them) and lays the header and grid left, the side column right; `useFillHeight` sizes the side column to the scroll region's bottom. `Grid` draws sets newest first, coloured `Cell`s as buttons, and a positioned box the flyout lays over. `Habits` run down the side column inside `FitHeight`. |
| `app/teacher/students/HolisticDrill.tsx` | `CellDrill`: the flyout (the category's `SkillTree` with every group open and fixed, the grey hint, arrows drawn after layout), placed under the row from the pill's left edge, clamped to the grid, above the row when there is no room below. `SkillWork`: a skill's problems in the side column (`ProblemWork` cards in balanced columns inside `FitHeight`). |
| `components/FitHeight.tsx` | A box whose children zoom down (CSS `zoom`, a short search on measured height) until they fit its height; re-fits on resize. |
| `lib/holistic.ts` | `holisticWork(student, set, now)`: the set's `HierarchyResult`, lines and problems for the student from `rosterEvidence`, null for an absent student or unknown set. |
| `lib/hierarchy.ts` | `problemsBehindLeaf(leaf, problems, lines)`: the problems a leaf is read from; working, which no solution tags, reads every problem with lines. |
| `components/HierarchyDrill.tsx` | `WorkPanel` uses `problemsBehindLeaf` (Class View's working panel was empty). |
| `lib/holistic.test.ts`, `lib/hierarchy.test.ts` | Every coloured cell equals its tree's result; the working rule. |
| `tickets/277-holistic-drill.md` | The ticket. |

## How it connects

```
 lib/assignments.ts rosterEvidence ──┬──► lib/holistic.ts holisticView   (cells, habits)
                                     └──► lib/holistic.ts holisticWork ◄277 (result, lines, problems)
                                                         │
 app/teacher/students/HolisticPage.tsx                   │
 ┌───────────────────────────────────────────────┬───────┼──────────────────────────────┐
 │ Header: name, summary                          │ aside │ (useFillHeight ◄277)          │
 │ Grid (PS6 … PS1) ◄277                          │  Habits in FitHeight ◄277            │
 │ ┌SET─────┬ALG──────┬FUN─┬…┐                    │     ── or, a skill picked ──         │
 │ │PS4     │[gap]◄───┼────┼─┼── press ─┐          │  SkillWork ◄277 (HolisticDrill.tsx)  │
 │ └────────┴─────────┴────┴─┘          ▼          │   problemsBehindLeaf (lib/hierarchy) │
 │        ┌ CellDrill flyout ◄277 ─────────┐       │   ProblemWork cards ─┐               │
 │        │ click to see ─╮ ● group        │       │   (components/        │               │
 │        │ examples      ├─► ● skill ─────┼─press─┼─► HierarchyDrill.tsx) │               │
 │        │               ╰─► ● skill      │       │   in FitHeight        │               │
 │        │  SkillTree (HierarchyDrill.tsx)│       │                       │               │
 │        └────────────────────────────────┘       │                                      │
 └───────────────────────────────────────────────┴──────────────────────────────────────┘
   components/FitHeight.tsx ◄277: zooms the aside's content to its height (no scroll)
```
