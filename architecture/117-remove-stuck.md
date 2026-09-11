# 117 · The "we're stuck" mode is removed from the group board

Route: `/student?stage=group`, the group board on any turn.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/GroupBoardScreen.tsx` | The board, the wrong-check panel and the action row. The "we're stuck" button, its `stuckOpen` state and the `Scrim` reveal are gone; the action row is `justify-end`, so Check (the pen-holder) or "… checks when ready" (the others) sits at the right alone. `Scrim`, `earlierVersions` and `ASSIGNMENT` are no longer imported. |
| `lib/groupReview.ts` | The rules. `GroupRun` loses `stuck`; `earlierVersions` and `EarlierVersions` are deleted; `TurnEvent` is a stroke, a line or a check; `turnScript` pauses 3.5 s after a wrong check then starts the next attempt (the 7 s reveal pause is gone). `cutAtFirstMistake` stays for the wrong-check panel. |
| `data/group-scripts.ts` | `TurnScript` is `attempts` only; Q3 no longer carries `stuckAfter: 0`. |
| `lib/classroom.ts` | The `group/stuck` action and its `groupReducer` case are removed; `group/scripted` maps stroke, line and check only. |
| `lib/groupReview.test.ts`, `lib/standings.test.ts` | The `earlierVersions` test and every stuck assertion removed; the Q3 turn test checks its two attempts' line count; the old-run fixture drops `stuck: []`. |
| `README.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` | Step 5 of the walkthrough, the system diagram and ticket table, the decision, the deferred ideas. |

## How it connects

```
 GroupBoardScreen (per turn)
 ┌──────────────────────────────────────────────────────────────┐
 │ GroupHeader  Q3 (x−3)(x+2)=6  3 of 6  ▓▓▓░░ 40%  [pen pill]  │
 │ (You)(Jordan)(Zara)(Liam)                                     │
 │ ┌ NOT YET · READ AS ──────────── up to the first mistake ─┐  │  ◀ lastAttempt(run) wrong
 │ │ (x−3)(x+2)=6 · ▌x−3=6▐ ▌x+2=6▐ · 1 more line             │  │    cutAtFirstMistake(pid, lines)
 │ └──────────────────────────────────────────────────────────┘  │
 │ ┌ JORDAN'S WORKING ────────────────────────── Undo  Clear ─┐  │
 │ │  PadSection: run.strokes (read-only unless mine)          │  │
 │ └──────────────────────────────────────────────────────────┘  │
 │                                    [ Check ]  ── or ──  "Jordan checks when ready"   ◀ justify-end
 └──────────────────────────────────────────────────────────────┘
          (was: "we're stuck" ghost button at the left ──▶ Scrim ──▶ earlierVersions(...) four columns)

 classroomReducer            groupReducer                 turnScript(problem)
 group/stroke ──────────────▶ strokes                     stroke… line … check
 group/line ────────────────▶ lines (hidden)              (wrong) ─ 3.5 s ─▶ stroke… line … check
 group/check ───────────────▶ attempts, resolved          (was: ─ 3.5 s ─ stuck ─ 7 s ─▶ …)
 group/next ────────────────▶ index+1 | done
 group/scripted {event} ────▶ one of the three above
          (was: group/stuck ─▶ run.stuck += problem)
```

The debrief (`GroupDebrief`, ticket 41) is unchanged: after a correct check it still shows the student's own versions beside the group's, which is where earlier work is compared now.

## Verified by

vitest (346), eslint, `next build`; a headless run (`stuck-gone.mjs`, port 3153) that skips to group review (Sam's Q1: no `[data-stuck]`, no reveal, no "stuck" in the page text, Check flush right at 0px from the row's edge), fast-forwards to Jordan's Q3 turn, sees the wrong check at ~10 s with "1 more line", waits through the 3.5 s where the scripted press used to fire (nothing opens), and sees the debrief for Q3 at ~26 s; screenshots of Sam's turn and Jordan's wrong check.
