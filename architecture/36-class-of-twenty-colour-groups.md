# 36 · Class of twenty in five colour groups

Routes: `/teacher/groups` (the seating groups, drag between colour columns, and the platform's
suggested groups beneath); every teacher view now lists twenty students.

## Files touched

| File | What it does |
|---|---|
| `data/groups.ts` | `GROUP_COLOURS` (coral · amber · mint · sky · violet), `GROUP_HEX` (fill and soft tints), `SeatingGroups`, `DEFAULT_GROUPS` (five groups of four; Sam in sky with Jordan, Zara and Liam), `GROUP_SIZE` |
| `data/classmates.ts` | Nineteen classmates: the six full ones as before plus thirteen lightweight ones built by `light(...)` (name, confidence, how far they got, a wrong list); `SLIPS` maps every problem to a known slip so a lightweight classmate's wrong problems still carry evaluable lines; `OTHER_GROUPS` (the platform-suggested grouping) extended to cover everyone |
| `lib/seating.ts` (+ test) | Pure seating rules: `groupOfStudent`, `moveStudent` (no-op for own colour or unknown student), `unevenGroups` (any size but four is flagged), `seatingOf` (older stored state → the default), `seated` |
| `lib/classroom.ts` | `groups?: SeatingGroups` on the classroom (per class, persisted and broadcast like the rest); actions `groups/move`, `groups/reset`; the initial state carries the default |
| `app/teacher/groups/TeacherGroups.tsx` | "Seating groups": five colour columns (top border in the colour), chips draggable between them with HTML5 drag and drop, a small colour menu on each chip as the accessible route, the count per column with "uneven" when it is not four; "Suggested by mistakes": the generated groups as before, kept for reporting |
| `lib/examples.test.ts`, `lib/groups.test.ts`, `lib/mistakes.test.ts`, `lib/peers.test.ts` | Class-size assertions now derive from the fixture instead of hard-coding seven |

## How it connects

```
 data/groups.ts  DEFAULT_GROUPS ──▶ classroom.groups (INITIAL_CLASSROOM · seatingOf for older stored state)
 TeacherGroups ── drag / colour menu ──▶ groups/move { student, to } ──▶ moveStudent ──▶ classroom store ──▶ every tab
                   columns read unevenGroups(groups) for the flag
 data/classmates.ts  CLASSMATES (6 full + 13 light, slips from SLIPS) ──▶ classmateEvidence · candidatesFor · mistakesByProblem · peerStruggles · the live grid's rows
 lib/groups.ts  reviewGroups: Sam's group from GROUPMATE_IDS + OTHER_GROUPS (the suggested grouping, unchanged)
```

## Verified by

vitest (213 tests): twenty unique students each seated once in five groups of four, Sam's group
as before; the suggested grouping covers every classmate once; every lightweight wrong problem
has a known slip; the seating rules; the classroom keeps, resets and defaults the groups; every
classmate line evaluable by the same evaluator; the class-size-derived assertions across
examples, groups, mistakes and peers. `tsc --noEmit`, `eslint`, `next build`. CDP on
`/teacher/groups`: five columns of four; a synthetic drag of Priya to sky makes coral 3 and sky 5
with both flagged uneven; the colour menu moves her back; a move of Jordan to mint survives a
reload; five suggested groups beneath. `/teacher`: twenty rows, no horizontal overflow.
`/teacher/mistakes`: the new names appear.
