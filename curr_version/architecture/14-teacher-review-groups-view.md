# 14 · Teacher "during review groups" view (Tier 2)

Route: `/teacher/groups` (Groups tab).

## Files touched

| File | What it does |
|---|---|
| `data/classmates.ts` | `groupStatus` per classmate (static one-liners); `OTHER_GROUPS` (the second, static group) |
| `lib/groups.ts` | `reviewGroups(session)`: the demo student's group from the same `groupPlan` the student sees (live one-line status from stage and `talked`), the other groups from `computePhases` over fixture wrong sets; one shared note per group built from the discussion set and the subskills behind its wrong patterns |
| `lib/groups.test.ts` | Demo group members and note; the live line follows quick pass → discussing n of 3 → finished while classmates stay static; the other group is static with its own note |
| `app/teacher/groups/page.tsx` → `TeacherGroups.tsx` | Two group cards: discussion chips, one row per member (live badge on the demo student), the "Why this group" note |
| `app/teacher/TeacherChrome.tsx` | Groups tab |

## How it connects

```
 session ──▶ groupPlan(session).discussion ─┐
 CLASSMATES[groupmates].wrong               ├─▶ reviewGroups ──▶ Group 1: Sam (live line) + Jordan, Zara, Liam (static lines) + note
 OTHER_GROUPS ▶ computePhases(fixture)      ┘                 Group 2: Priya, Amelia, Tomas + note
 One phase computation (lib/group.ts) serves the student's screens (08) and the teacher's view (14).
```

## Verified by

vitest (53 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run: with
the student on the discussion, the teacher reads "Discussing Q1 · 0 of 3 talked through"; after
one "Talked through" on the iPad it reads "Discussing Q2 · 1 of 3 talked through" within a
batch; two groups, the first's note names Q1–Q3 and the skills behind them.
