# 42 · Progress bar, leaderboard and medals

Routes: `/board` (the race during group review, the final standings held after it), `/teacher`
(a "Group review" card with every group's bar and the pen-holder), `/student` (the group's own bar
in the whiteboard's header). Demo: the "group review" skip starts the race; the "report" skip
holds the finished standings.

## Files touched

| File | What it does |
|---|---|
| `lib/standings.ts` (+ test) | The race as pure rules. `wrongOf` / `wrongSetsOf` (a member's original mistakes: the demo student's from `feedbackFor(session)`, a classmate's from the fixture), `unionOf` (assignment order), `raceMoments` / `raceProgress` / `raceFinish` (a scripted group's resolved count as a function of elapsed time, the row carried on at its last gap for a longer union), `standingsAt(classroom, session, now)` (one `GroupStanding` per seating group: members, first names, union, resolved / total mistakes, percent, `reachedAt`, `live`, `pen`, `problem`), `rankStandings` (percent, then who got there first, then seating; medals for the first three home), `leaderboardAt`, `ownStanding`, `firstName` |
| `data/race.ts` | `RACE_SCHEDULE`: per colour, the seconds after the start at which each union problem checks correct. Mint home at 3:40 and amber at 4:50 (before the demo group plausibly is), coral at 9:10 and violet at 9:50 (after); sky's row is unused while the demo student sits there |
| `lib/groupReview.ts` | `GroupRun` gains `startedAt` (when group review began: the race's clock) and `resolvedAt` (when each resolved problem checked correct: the tie-break); `beginRun` sets both; `runStartedAt` / `resolvedMoment` read older stored runs (the first turn, the start) |
| `lib/classroom.ts` | `group/check` and `group/scripted` carry `at`; a correct check records `resolvedAt[problem]` (the turn's start when no moment is given) |
| `lib/classroom-store.ts` | `dispatchClassroom` stamps `at` on `group/check` and `group/scripted` as it does on the other time-bearing actions, so the whiteboard screen needn't know |
| `app/student/StudentApp.tsx` | A peer's scripted event carries its scheduled moment (`turnStartedAt + event.at`) |
| `lib/board.ts` (+ test) | `boardContent(classroom, session, now)`: a new `group` kind while the classroom has a run that isn't done (the ranked standings), `holding` once it is done (or the pathway says group review is over) with the same standings, final; `boardWord` reads "standings" during the race |
| `app/board/Leaderboard.tsx` | Five rows drawn in seating order, each translated to its rank (`transform` with a 700 ms ease, so a reorder is one transition and no measuring); per row a medal badge once home, the colour, four first names at 26 px, a 44 px bar with a tick every ten percent and the number at 60 px. No group names, no numbering, nothing to press |
| `app/board/SmartBoard.tsx` | Reads the clock (`useNow`) so the scripted race moves; `Race` draws the `group` and `holding` kinds (a pulsing dot while live) in place of the old holding placeholder |
| `app/teacher/GroupProgressCard.tsx`, `app/teacher/TeacherLive.tsx` | "Group review" card in the right column, from the moment a run exists until whole-class review ends: every group's bar in seating order with its percent, "done" once home, "Sam has the pen · Q1" for the demo group; never the leaderboard's order, never a medal |
| `app/student/screens/GroupBar.tsx`, `app/student/screens/GroupBoardScreen.tsx` | The student's own group's bar and number in the whiteboard header (one `<GroupBar />` between the problem and the pen pill); nothing about any other group |
| `lib/demo.ts` (+ tests) | The "report" skip carries a finished run (begun ten minutes ago, home six minutes in), so the held standings have every group across the line |
| `README.md` | The smartboard's group-review states described |

## How it connects

```
 group/begin { at } ──▶ classroom.group.startedAt        group/check { at } (stamped by the store) ──▶ run.resolvedAt[problem]
                                                                                 ▲
                                          StudentApp: group/scripted { …, at: turnStartedAt + event.at } ┘

 lib/standings.ts  standingsAt(classroom, session, now)   (seating order, one per colour)
   the demo student's group (live):  groupProgress(run, wrongSetsOf(run.members, session))
                                     percent = Σ members' mistakes on run.resolved / Σ members' mistakes on the union
                                     reachedAt = max resolvedAt · pen = penHolder(run) · problem = currentProblem(run)
   every other group (scripted):     union = unionOf(classmates' wrong lists) · RACE_SCHEDULE[colour]
                                     raceProgress(row, |union|, now − startedAt) → resolvedCount · reachedAt
   rankStandings: percent ↓, reachedAt ↑, seating → rank · medal (gold / silver / bronze for the first three at 100 %)

 lib/board.ts  boardContent(classroom, session, now)
     run ∧ ¬done ──▶ { kind: group,   standings }         run.done ∨ group review over ──▶ { kind: holding, standings }
                          │                                                   │
                          ▼                                                   ▼
 /board · SmartBoard (useNow) ▶ Race ▶ Leaderboard: rows by seating, translateY(rank × 100 %), width = percent %, ticks, medal badge
 /teacher · TeacherLive ▶ GroupProgressCard (useNow): standingsAt, seating order, bar + percent, pen-holder, "done"
 /student · GroupBoardScreen header ▶ GroupBar: ownStanding(classroom, session) → the live group's bar and number
```

## Verified by

vitest (251 tests): the progress rule (a union of three with 2, 2 and 1 members wrong jumps
40 %, 40 %, 20 %; the demo group 10, 30, 30, 10, 10, 10); each other group's union and mistake
total from the seating and the wrong lists; two scripted finishes under five minutes and two at
nine or more, all inside ten, the rows sized to the fixture's unions; a longer union carrying on
at the last gap, a shorter one finishing early; progress a monotone function of elapsed time;
the start (five at zero, the demo group live with Sam on the pen for Q1) and five minutes in
(mint and amber home, coral and violet level at 43 % with violet first by arrival); ranking by
percent, arrival, then seating; medals only to groups at 100 %, in finishing order, none for
fourth and fifth; 100 % locking the position against later finishers; the report jump's held
standings (everyone home, the demo group bronze behind mint and amber); a correct check recording
its moment, a scripted check carrying its own, an old stored run counting from its start; the
board kinds per skip, the standings on `group` and `holding`, "standings" / "holding" for the
indicator, no surname on the board. `tsc --noEmit`, `eslint`, `next build`. CDP, three tabs
sharing storage: the "group review" skip → the board at `group` with five rows, four first names
each, every bar at zero and 600 px wide, no medal, no group name, no number, no interactive
element; the teacher's card with five groups in seating order at 0 %, "Sam has the pen · Q1",
indicator "Board · standings", no horizontal overflow at 1440 or 1280; two strokes on the
whiteboard 1.3 s apart, Check → Correct, the iPad's bar at 10 %, the board's sky row at 10 %
and first with a fill a tenth of the track, the teacher's sky row at 10 %; `startedAt` moved back
five minutes → mint gold, amber silver, violet above coral at 43 % each, Sam's group last, the
mint row's transform sampled mid-transition; ten minutes → mint, amber, coral (bronze), violet
(nothing), sky at 10 %, the teacher's card still in seating order with four "done"; the "report"
skip → `holding` with everyone at 100 %, mint · amber · sky · coral · violet, three medals,
nothing interactive, indicator "Board · holding".
