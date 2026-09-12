# 169: The student report opens to the full dot view, fixed

**What to build:** On the teacher's individual view (`/teacher/report`, `?student=<id>` for a classmate) the Skills card shows the class view's full dot view from the start: one column per category the set touches, the category chip over its pill, every group beneath its pill with every skill out under it, exactly what "see dot skills" opens under a roster row. Nothing on it collapses or expands: the group rows are plain text, not toggles, and there is no button to open or close anything. A skill still opens the work behind it beneath the columns; the commentary's idea filter still lights only the skills behind an idea in the same fixed view.

**Blocked by:** 125.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of Sam's report showing the old browse drill (six category rows, each opening to its groups on a click, then to skills, one branch at a time): "in student report, automatically open to full dot view. don't have functionality for collapse or expand here. just show full dot view fixed".

## Solution

- `components/SkillColumns.tsx` (the student's own report's column view, ticket 105) takes `mode` (`groups` | `expanded`), `locked` and `student` as props: the teacher's report renders it `mode="expanded" locked`, the student's own report as before (`groups`, unlocked, `student`).
- `components/HierarchyDrill.tsx`: `RowDrill` takes `locked`; a locked tree's group rows are fixed `Node`s, drawn as a `div` with the same layout, no hover, no `aria-pressed` (`data-fixed`), so `openGroups` stays as the mode set it (every group). A skill is still a button that opens `WorkPanel` beneath the columns. The old browse drill (the file's default export, `HierarchyDrill`) had no user left and is removed.
- `app/teacher/report/TeacherReport.tsx`: the Skills card is unpadded; "Skills" sits in its own `px-5 pt-5`, then `SkillColumns` (its chip band edge to edge, keyed on the chosen idea as the drill was), then the status key in `mx-5 mb-5`. "Nothing yet" for the demo student with no session is unchanged.
- Docs: this ticket, `architecture/169-report-dot-view.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] `/teacher/report?student=tomas` and `/teacher/report` (Sam, with a session) open to six columns (Algebra · Functions · Graphing · Communication · Reasoning · New skills), every group's skills out, the drill in `expanded` mode and locked
- [x] Every group row is fixed plain text (a `div`, no `aria-pressed`); clicking one changes nothing; hovering one paints nothing
- [x] Every skill is still a button: clicking one opens its work beneath the columns (pressed), the same skill again closes it, every group still out meanwhile
- [x] Choosing a commentary idea keeps the same fixed view with fewer skills lit; the idea again shows everything
- [x] Every group dot starts on its category pill's left edge, as on the class view; no tree reaches its neighbour's column; no sideways overflow at 1400 × 1000 or 1280 × 800 (`check:laptop`, 16 route/size checks)
- [x] The student's own report is unchanged (`groups` mode, groups still clickable)
- [x] vitest (454), eslint, tsc, `next build`; click-through `report169.mjs` (49 checks)
