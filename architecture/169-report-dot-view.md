# 169 · The student report opens to the full dot view, fixed

Route: `/teacher/report` (the demo student) and `/teacher/report?student=<id>` (a classmate).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/report/TeacherReport.tsx` | The individual view. The Skills card no longer holds the browse drill: it is an unpadded `Card` with "Skills" in its own `px-5 pt-5`, then `SkillColumns` in `expanded` mode, `locked` (keyed on the chosen commentary idea, so the restricted result re-mounts as the drill did), then the status key in `mx-5 mb-5`. "Nothing yet" for the demo student with no session stays. |
| `components/SkillColumns.tsx` | The column view (the student's own report since ticket 105) takes `mode` (`groups` or `expanded`), `locked` and `student` as props and passes them to `RowDrill`. The student's report passes `student`; the teacher's report `mode="expanded" locked`. |
| `components/HierarchyDrill.tsx` | `RowDrill` takes `locked` and passes `lockGroups` to every `SkillTree`; a locked tree draws its group rows as fixed `Node`s: a `div` with the button's layout classes, `role="img"`, the same aria-label, `data-fixed`, no hover colour, no `aria-pressed`. Skills stay buttons. The browse drill (the default export, categories → groups → skills one branch at a time) had no user left and is removed, with its `categoryLabel` import. |
| `app/student/screens/ReportScreen.tsx` | Passes `student` to `SkillColumns` explicitly (the prop used to be fixed inside the component). |

## How it connects

```
 /teacher/report?student=tomas                         TeacherReport.tsx
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ <Card data-hierarchy>                    (no padding)                           │
 │   SKILLS                                 px-5 pt-5                              │
 │   ┌─ SkillColumns mode="expanded" locked ───────────────────────────────────┐   │
 │   │  ALGEBRA   FUNCTIONS   GRAPHING   COMMUNICATION   REASONING   NEW SKILLS│   │  chip band, border-b
 │   │  [pill]    [pill]      [pill]     [pill]          [pill]      [pill] UNIT 1  │  data-dot, measured →
 │   │  ● group   ● group     ● group    ● group         ○ group     ● skill   │   │  ColumnBox[] (left, width)
 │   │    ● skill   ● skill     ● skill    ● skill         ○ skill   ● skill   │   │
 │   │    ● skill ● group       ● skill                    ○ group   ● skill   │   │
 │   │  ● group     ○ skill                                  ○ skill           │   │
 │   │  RowDrill mode=expanded locked  → SkillTree ×6 lockGroups               │   │
 │   │      group rows: <div data-node data-fixed>   (was <button aria-pressed>)│   │
 │   │      skill rows: <button data-node>  click → WorkPanel beneath           │   │
 │   └─────────────────────────────────────────────────────────────────────────┘   │
 │   ┌ status key ┐                          mx-5 mb-5 border-t                    │
 └─────────────────────────────────────────────────────────────────────────────────┘
        ▲ result = restrictTo(full, leavesBehind(idea)) when a commentary idea is chosen (key={idea})

 /student?stage=report  ReportScreen.tsx → SkillColumns (mode groups, unlocked, student)   unchanged
 /teacher               TeacherLive.tsx   → RowDrill mode=expanded (see dot skills), unlocked    unchanged
```

Was: `HierarchyDrill` (the browse drill) in a `p-5` card: six category rows with pills, a click opened one category's groups, another one group's skills, the work beside or beneath.

## Verified by

vitest (454), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks, no sideways overflow); `report169.mjs` (session `91f4cc2a-…`'s scratchpad, app on 3331 / CDP 9631, 49 checks): Tomas at 1400 × 1000 and 1280 × 800 and Sam (a student tab at the report stage first) at 1400 × 1000 open to six chips, six pills, six trees, every one of the nine group rows a fixed `div` with its skills out and all fourteen skills buttons; the Skills eyebrow above the chips, the status key under the trees, the card unpadded; every group dot within 2 px of its pill's left edge (the class view's own full dot view measured the same, +1.3 px); no tree reaching its neighbour's column, no overflow of card, frame or document; clicking a group changes nothing and hovering it paints nothing; a skill opens its work beneath (4 problems for fractions), reads pressed, closes on the second click with every group still out; a commentary idea keeps the fixed view with more skills unseen (11 → 24) and the second click restores all; the student's own report still in `groups` mode with twelve clickable groups; the What happened and In group review cards still beneath Sam's skills. Screenshots at rest, with work open, with an idea chosen and for Sam read by eye.
