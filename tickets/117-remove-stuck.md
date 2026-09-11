# 117: The "we're stuck" mode is removed from the group board

**What to build:** Delete the group board's "we're stuck" mode entirely: the ghost button under the board, the reveal of everyone's earlier work on the problem, the scripted press on Jordan's Q3 turn, and the state and rules behind them. The action row under the board keeps Check for the pen-holder (or "… checks when ready" for the others) at the right.

**Blocked by:** 40 (built the mode), 76 (relied on it for Q7's two own versions).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "let's delete the we're stuck mode. it's fucked up -- just shows the right answer if somebody in the group got it wrong. remove it entirely -- add to F_F".

`earlierVersions` stood the model solution in for a member with no recorded attempt on the problem, so the reveal showed the correct working whenever one member had never slipped on it (Jordan on Q3, who never reached Q3). The mode's only behaviour was the reveal.

## Solution

- `app/student/screens/GroupBoardScreen.tsx`: the button, the `stuckOpen` state and the `Scrim` reveal are gone; the action row is `justify-end` so Check (or the waiting line) sits at the right on its own.
- `lib/groupReview.ts`: `GroupRun.stuck`, `earlierVersions`/`EarlierVersions` and the `"stuck"` `TurnEvent` are removed; `turnScript` keeps its 3.5 s pause after a wrong check and loses the 7 s reveal pause.
- `data/group-scripts.ts`: `TurnScript.stuckAfter` and Q3's `stuckAfter: 0` are removed.
- `lib/classroom.ts`: the `group/stuck` action and its reducer case are removed; a scripted event is a stroke, a line or a check.
- Tests: the `earlierVersions` test and the stuck assertions are removed; the Q3 turn test counts its two attempts' lines instead. `lib/standings.test.ts`'s old-run fixture loses `stuck: []`.
- Root docs: README step 5, `ARCHITECTURE.md`'s diagram and table; a decision-log entry; a FUTURE_FEATURES section on a stuck mode that does not give the answer away. Tickets 40, 52 and 76 and their notes are left as history.

## Acceptance

- [x] No "we're stuck" button on any turn; no reveal ever opens; the word "stuck" appears nowhere on the group board
- [x] Jordan's Q3 turn still checks wrong once (the board's transcription up to the first mistake, "1 more line") and then writes the rework and resolves into the debrief
- [x] Check sits flush right under the board on Sam's turn; "Jordan checks when ready" flush right on a peer's
- [x] vitest (346), eslint, `next build`, headless run (`stuck-gone.mjs`) with screenshots; architecture note, root docs, decision log, future features
