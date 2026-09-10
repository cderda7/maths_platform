# 40 · Group review on one shared whiteboard

Route: `/student` (stage `group`). Demo: the "group review" skip begins the run on the demo
group's union with the agreed pen order.

## Files touched

| File | What it does |
|---|---|
| `lib/groupReview.ts` (+ test) | The rules: `GroupRun` (members, the union in set order, the pen per problem, the current index, the live board's strokes and hidden transcription, attempts per problem, stuck, resolved, `turnStartedAt`, `scriptDone`, done); `shuffle` and `penOrder` (a seeded shuffle that reshuffles when it runs out; `DEMO_SEED` deals Sam, Zara, Jordan, Liam, Sam, Zara); `checkBoard` (every known line judged, the final line decides; unknown lines are neither); `cutAtFirstMistake` (up to the first wrong line, that line red, the rest a count); `earlierVersions` (everyone's handed-in and reworked work on a problem, cut the same way); `groupProgress` (members' original mistakes on resolved problems over all of them, ready for ticket 42); `turnScript` (a peer's turn as timed events: scribbled strokes per line, the line read, a check, a pause, "we're stuck" where the script says, the next attempt); `ownAttemptScript` |
| `lib/synthetic-ink.ts` | `scribble(text, row)`: deterministic handwriting-like strokes on the pad's ruled lines for a peer's turn |
| `data/group-scripts.ts` | The attempts per union problem: Q1 right; Q2 right; Q3 wrong (the original slip) then right, stuck between; Q7 right; Q9 wrong (the axis given as the height) then right; Q10 right. Every line is in the evaluation table |
| `lib/classroom.ts` | `group?: GroupRun` on the classroom; `group/begin` (idempotent), `group/stroke · undo · clear · line · check · stuck · next`, and `group/scripted { index, event }` applied once by index; a `groupReducer` for the board's own rules (a resolved problem's board is closed; a wrong check keeps the strokes and starts the next attempt's lines afresh; the last `next` marks the run done) |
| `data/types.ts`, `lib/session.ts`, `app/student/page.tsx` | The two old group stages and `talked` replaced by one `group` stage; `group/start` lands there; `group/done` hands off as before |
| `app/student/screens/GroupBoardScreen.tsx` | The board alone while the pen-holder writes: colour chip, label, expression, "n of 6", "you have the pen" / "Jordan has the pen", the four members with the holder filled; the pad live for the holder (Undo, Clear, Check: enabled once a line has been read), a toolbar-less mirror for the others; a wrong check shows "Not yet · read as" cut at the first mistake with "n more lines" above the board; "we're stuck" (any member) opens everyone's earlier work cut the same way, "show the group" makes it the group's; a correct check shows "Correct" with next (Finish on the last) |
| `app/student/StudentApp.tsx` | Begins the run on arrival at the stage (members and union from the group plan); while a peer holds the pen, dispatches their scripted events as their time comes (each once, by index); `group/done` when the run is done |
| `app/student/screens/GroupScreens.tsx` | Deleted (the quick pass and the discussion prompts) |
| `lib/groups.ts`, `lib/demo.ts` | The teacher's group view reads "On the whiteboard"; the "group review" skip begins the run |
| Tests across `lib/*.test.ts` | The collapsed stage; the run, the check, the cut, the scripts, the pen rule, progress, scripted replay |

## How it connects

```
 class-wait ── group/start ──▶ stage group ──▶ StudentApp: group/begin { members, union, now } (once)
 classroom.group = GroupRun  ◀────────────────────────────────────────────────────────────────┐
   pen[problem] = penOrder(union, members, DEMO_SEED)                                          │
   holder = sam:   PadSection live ──▶ group/stroke · bursts ──▶ nextLine(ownAttemptScript) ──▶ group/line (hidden)
                   Check ──▶ group/check ──▶ checkBoard(problem, lines) ──▶ attempt { lines, correct } · resolved
   holder = peer:  StudentApp driver: turnScript(problem)[scriptDone] due ──▶ group/scripted { index, event } ──┘
                   (stroke → the mirror grows · line → hidden · check → attempt · stuck → the reveal)
   wrong check ──▶ "Not yet · read as" = cutAtFirstMistake(problem, attempt.lines), the board kept
   "we're stuck" ──▶ earlierVersions(run, problem, own, solution): four columns, each cut at the first mistake
   correct ──▶ "Correct" · next ──▶ group/next { now } ──▶ index + 1, clean board … last ──▶ done ──▶ group/done ──▶ nextStage
```

## Verified by

vitest (230 tests): the pen rule for several seeds and the demo seed; check and the cut; everyone's
earlier versions; every script attempt readable with wrong attempts before right ones; a peer's
turn as events; the run on the classroom (begin once, board per problem, undo pulls a line back,
a closed board after a correct check, wrong check keeps strokes, stuck per problem, the last next
finishes, scripted events once by index); progress with the agreed jumps. `tsc --noEmit`,
`eslint`, `next build`. CDP on `/student`: the "group review" skip → Q1 with "you have the pen" and
a live pad → two bursts, Check → "Correct", next → Q2 "Zara has the pen", toolbar-less mirror that
fills with scribbled ink and checks correct on its own → Q3 Jordan: the wrong check "Not yet ·
read as" with the null-factor line red and "1 more line", then the stuck reveal with four columns
(Sam's handed-in cut at the slip, his rework whole; Zara and Liam cut at the same slip; Jordan's
model lines) → resolved on the second attempt → a reload keeps the run → Q7 Liam → Q9 Sam: four
bursts, Check → "h = 6" red, Clear, four bursts, Check → correct → Q10 Zara → Finish → the session
moves on (to whole-class waiting under the demo pathway).
