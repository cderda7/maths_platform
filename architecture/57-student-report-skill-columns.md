# 57 · Student report: the skills laid out as the teacher's class-view row

Route: `/student` at the report stage (`/student?stage=report`).

## Files touched

| File | What it does |
|---|---|
| `components/SkillColumns.tsx` | New. The student's skills as the teacher's grid row: a header of category chips (`data-column-heads`), a row of category dots (`data-dot`, the "Unit 1" label beside the flat category's), and beneath them `RowDrill` in `groups` mode with `student`. Measures each dot's position relative to the rows (divided by the iPad stage's scale) into `ColumnBox[]` so each tree starts under its dot, exactly as `TeacherLive.columnBoxes` does |
| `components/HierarchyDrill.tsx` | `RowDrill`, `SkillTree` and `WorkPanel` take `student`: skills named by `studentLeafName`, no `DifficultyTag` in the work panel. A work line is `flex-wrap` so a blame chip drops to a second row in a narrow card |
| `app/student/screens/ReportScreen.tsx` | The skills card renders `SkillColumns` instead of `HierarchyDrill`; the card is `shrink-0` with no `overflow-hidden`, so it grows with an opened skill's work instead of clipping it |

## How it connects

```
   /student  ReportScreen                                   /teacher  TeacherLive (unchanged)
   ┌──────────────────────────────────────────────┐          ┌───────────────────────────────┐
   │ Card data-hierarchy                          │          │ table: one row per student    │
   │  SkillColumns                                │          │  chips ─ dots ─ RowDrill      │
   │   ┌ heads   ALGEBRA  FUNCTIONS … NEW SKILLS  │          │  columnBoxes(student) ──┐     │
   │   ├ dots      ●        ●      …   ● UNIT 1   │          └─────────────────────────┼─────┘
   │   │            measured → ColumnBox[]        │                                    │
   │   └ RowDrill mode="groups" student ◄─────────┼── same component, same boxes ──────┘
   │        SkillTree per column (student names)  │
   │        WorkPanel beneath (no difficulty tag) │
   └──────────────────────────────────────────────┘
          ▲ sessionHierarchy(session) · sessionEvidence(session).lines
   lib/hierarchy.ts
```

The teacher's grid and the student's card now share the drill row: `RowDrill` owns the trees,
the open groups, the chosen skill and the work panel; each screen only supplies where the dots
are. `HierarchyDrill` (the browse outline) remains for the teacher's individual view.

## Verified by

vitest (272 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on
port 3114 at `/student?stage=report`: six chips read ALGEBRA … NEW SKILLS with "UNIT 1" beside the
last dot; every category's groups are shown with no click; each tree's first dot centre equals its
category dot centre to 0.1 px in all six columns; no skills are open until a group is clicked;
"expanding & factorising" opens factorising / non-monic trinomials / distributive expansion; the
factorising skill shows Q1, Q3, Q5, Q7 beneath with no difficulty tag; the card grows to fit.
