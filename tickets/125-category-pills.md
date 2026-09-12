# 125: Category markers are pills; groups and skills keep their dots

**What to build:** At the top level of every skill grid and drill, the category marker is a pill (28 × 13, fully rounded) instead of a 15 px dot. The groups and skills beneath keep their round dots. Same colours, same half fill, same hover ring and click behaviour.

**Blocked by:** —.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the class view: "want to keep dot for groups / skills, but at the top level (the category level, as you're seeing here) instead want pill shape. cleaner visual experience."

Every level of the hierarchy used the same round marker, so a category row and a group row read alike until the indent was noticed.

## Solution

- `components/Tag.tsx`: `StatusDot` takes `shape?: "dot" | "pill"`; the pill's size is `PILL_SIZE` (`h-[13px] w-[28px]`), the half fill and the unseen outline unchanged; `data-shape` on the marker.
- `app/teacher/TeacherLive.tsx`: the class grid's category button holds a pill in a 28 × 40 hover area (the ring is a pill too); the labels beside a marker (the column name in a column view, "Unit 1" beside the flat category) start 20 px from the centre instead of 12, clear of the pill's end.
- `components/SkillColumns.tsx`: the student's report row, the same pill and label offset.
- `components/HierarchyDrill.tsx`: `Node`'s `keepCase` becomes `category`, which also swaps the dot for the pill; the report's browse drill passes it at the top level. Trees under a pill align their group dots' left edges with the pill's left edge (what the column measurement already gave: an outline whose parent marker is wider).
- `components/StatusKey.tsx` unchanged: the key explains colours, one dot each.

## Acceptance

- [x] Class view: every category marker a pill, half and unseen pills drawn as before; the trees under a drilled row and a clicked category are dots
- [x] Column view label and the "Unit 1" label clear the pill
- [x] Report drill (`/teacher/report?student=…`): pills at the top level, dots for groups and skills
- [x] Student report row: pills above, dots beneath
- [x] vitest (390), eslint, tsc, `next build`, headless run (`pills.mjs`, `pills2.mjs`)
