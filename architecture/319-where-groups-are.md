# 319: Where groups are during group review

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupGrid.ts` | New, pure. `gridOf` / `gridAt` build a `GridColumn` per group in review: a `GridCell` per question of the set (`GridTone`: not-in-queue, ahead, left, solved, unsolved, class-review; `current`), `closed`, `total`, `done`, `pen`. `toneOf` reads a question's timeline. `groupCounts`, `countParts`, `everyGroupSolved`, `groupsNotSolved` for the cards. |
| `lib/groupGrid.test.ts` | New. Columns and cells at the start, the end, the red-then-closed path (mint Q10), coral and amber never red, the current cell and the pen, the return's red, the class-review row, card counts and thin lines, a group sitting out. |
| `lib/standings.ts` | `penOf(group)`, the pen and the question on the board for one listed group; `pensAt` maps it. |
| `app/teacher/WhereGroupsAre.tsx` | New. `GroupGrid` (the head row of chips and "n/m", a row per question, the ring and pen avatar, the grey class-review band) and `GroupChip`. |
| `app/teacher/TeacherMistakes.tsx` | The split runs in group review: `GroupGrid` on the left, "Where groups are" / "Where groups went wrong", cards counting groups (`data-group-counts`), group chips in place of names, a footer for groups with nothing written, thin "every group solved" lines, no diagnostic chip. `pillNeeds` measures a misconception chip by its text. |
| `lib/assignments.ts`, `lib/assignments.test.ts` | `landingFor`: group review lands on Mistakes. |

## How it connects

```
 ticket 332 (lib/standings.ts)                         Sam's iPad
 groupsAt(c, session, now) ──────────────┐             group board ─▶ c.group (live run)
   per group in review: colour, members,  │                                   │
   union, live, run (live or simulated)   │◀──────────────────────────────────┘
                                          ▼
                  lib/groupGrid.ts  gridOf(groups, problems, movedToClass)
                  ┌───────────────────────────────────────────────────────────┐
                  │ runTimeline(run) ─▶ toneOf ─▶ GridCell {problem, tone,    │
                  │ penOf(group)  ─▶ current, pen      current}               │
                  │ closed (solved + unsolved) / total (union) · done         │
                  └───────────────┬───────────────────────────┬───────────────┘
                                  │                           │ groupCounts(columns, problem)
                                  ▼                           ▼
 app/teacher/WhereGroupsAre.tsx GroupGrid          TeacherMistakes cards
 ┌──────┬────────┬────────┬────────┬───────┬────────┐   ┌────────────────────────────────────────┐
 │      │ CORAL  │ AMBER  │ MINT   │ SKY   │ VIOLET │   │ Q9  …  2 solved · 1 left for now · 2 still to go │
 │      │  6/6   │  4/4   │  5/7   │ 6/9   │  5/7   │   │ [wrong line]      [wrong line]         │
 ├──────┼────────┼────────┼────────┼───────┼────────┤   │ SKY  CORAL        VIOLET               │
 │ Q7   │ green  │ green  │ red(○) │ red   │ red    │   │ misconception     misconception        │
 │ Q9   │ green  │ green  │ green  │ red   │ (○SP)  │   │ CORAL  unfinished or not attempted     │
 │ Q10  │ green  │ green  │ red    │(○SO)  │ blank  │   ├────────────────────────────────────────┤
 │ …    │ light blue: not in the union             │   │ Q4  every group solved   (thin line)    │
 └──────┴──────────────────────────────────────────┘   └────────────────────────────────────────┘
   (○XX) ring in the group's colour, pen-holder's avatar      counts over the groups whose union has it

 lib/assignments.ts landingFor(…, "group") ─▶ "mistakes"
 GroupChip ─▶ grid head (filled when done) and the cards' chips
```
