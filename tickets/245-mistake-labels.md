# 245: Each mistake group on the Mistakes view is labelled with the wrong line its students wrote

**What to build:** On "Where students went wrong", every group of students on the same exact mistake carries a label over its names: the wrong line they all wrote, in the working's red, across the group's columns, collapsed or open.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

An outside review of the app (2026-09-14) called the Mistakes view the best screen and its best idea undocumented: the name clusters inside a problem are distinct wrong answers (Set 6 Q1: Sam and Ethan wrote (x + 2)(x + 3), Liam and Oliver (x − 1)(x − 6), under one slip pill), but collapsed they look like arbitrary clumps of names. "Label the clusters with the actual wrong answer, collapsed, by default."

The user settled the design in a grilling session (2026-09-14):

- The label is the **wrong line** (the mistake group's identity), not the final answer; in 68 of the 122 groups on Sets 1–5 the wrong line is not the last line.
- It sits **over** the names: label → names → slip pill.
- **Every** group is labelled, a student alone on their mistake too (76 of 122).
- Styled like the red wrong line in the open working (soft red fill, red border), spanning the group's columns.
- It **stays** when the problem opens; nothing moves.
- A label too wide for its group shrinks from 17 px to 13 px, then **widens the group's columns** (the card scrolls sideways); maths is never cut or split.
- A group with **two wrong lines** shows both, stacked in one label.
- **Mistakes view only**; the other clustered-name screens are future features.
- On the live set a new group's label just appears; only the name glows.

## Solution

- `lib/mistakes.ts`: `MistakeGroup.wrongLines` (the wrong lines' TeX one by one, from `wrongLinesOf`, which `mistakeKey` now joins).
- `app/teacher/TeacherMistakes.tsx`: a first grid row of labels, one per mistake group across its columns (a button that opens the problem, like a name); names, pills and working move down a row. `FitGrid` takes the column count and owns the column template: labels first (`--label-fit`, one factor per problem down to 13 px, then per-column minimums widened for any label still too wide, re-checked until all fit), then the working's `--fit` on the settled columns.

## Acceptance

- [x] Unit: every mistake group on every set (Sets 1–5 and the live set) has wrong lines equal to each of its students' wrong lines, joined equal to its key; the fixture group with two wrong lines lists both.
- [x] Click-through at 1280×800 and 1440×900 on a production build, all six sets: one label per mistake group reading exactly the red lines of its working; label edges on its columns; labels level, names level, pills under the names; no label maths wider than its box, split, or under 13 px; labels, names and columns unchanged when a problem opens; a label press closes and opens the problem; no label glows; no sideways page scroll. Also at 1024×768 and 800×700, where six problems widen their columns and every label still fits.
- [x] vitest, eslint, tsc, next build, check:laptop
