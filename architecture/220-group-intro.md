# 220: A read before group review

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupIntro.ts` | The message, its read time (`GROUP_INTRO_MS`, 39 s from 75 words), when a board opens, whether the intro is showing and how far through, the tile columns. Pure. |
| `lib/groupIntro.test.ts` | Read time, the message's words, the clock from the class's start, the drain, the race held at zero, the begin idempotent. |
| `lib/readiness.ts` | `startedAt`: the moment the class went into group review. |
| `app/student/StudentApp.tsx` | Begins the run with the board's opening time; holds the forced hand-in notice during the read. |
| `app/student/screens/GroupIntro.tsx` | The screen: heading, two paragraphs, tiles, the draining bar and time left. |
| `app/student/screens/GroupBoardScreen.tsx` | Shows the intro until the board opens. |
| `app/globals.css` | `intro-drain` keyframes. |
| `lib/demo.ts` | The group review jump opens its board after the read. |
| `lib/readiness.test.ts`, `lib/standings.test.ts`, `lib/demo.test.ts` | Follow the new clock. |

## How it connects

```
 class gate (lib/readiness)                 teacher's force-review grace
   last hand-in ──┐                              deadline ──┐
                  └──────────► readiness.startedAt ◄────────┘
                                      │
 StudentApp  stage "group", no run    ▼
   group/begin at = boardOpensFor(startedAt, now) = class start + GROUP_INTRO_MS
                                      │
                                      ▼
 classroom.group.startedAt = turnStartedAt = board opens
          │                    │                         │
          ▼                    ▼                         ▼
 GroupBoardScreen        StudentApp peer script     standingsAt (race)
 now < startedAt ?       now >= turnStartedAt+at    elapsed = max(0, now - startedAt)
   ├─ yes: GroupIntro      (waits for the read)       (all bars 0 during the read)
   │    heading, text, tiles (run.problems), bar
   └─ no:  the board (Sam's pen on Q1)
```
