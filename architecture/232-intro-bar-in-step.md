# 232: The group intro's bar and time left move in step

## Files touched

| File | What it does |
| --- | --- |
| `lib/store.ts` | `useFrameNow(active)`: a `requestAnimationFrame` clock, subscribed only while active. |
| `lib/groupIntro.ts` | `introSecondsLeft`: whole seconds to the nearest, clamped to the read. |
| `lib/groupIntro.test.ts` | "0:15" only while the bar is within a sixtieth of half; clamps. |
| `app/student/screens/GroupBoardScreen.tsx` | Ticks the frame clock while the intro shows and hands it down. |
| `app/student/screens/GroupIntro.tsx` | Bar width and label from the same `now`; no CSS animation. |
| `app/globals.css` | `intro-drain` keyframes removed. |

## How it connects

```
 useNow (1 s) ──┐
                ├─ max ─► now ─► GroupIntro ─┬─► bar width  = 1 − introProgress(run, now)
 useFrameNow ───┘   (while introShowing)     └─► "0:15"     = introSecondsLeft(run, now)
 (every frame)                                        │
                                  both from run.startedAt (the board's opening)
 once now ≥ startedAt ─► the board; useFrameNow unsubscribes
```
