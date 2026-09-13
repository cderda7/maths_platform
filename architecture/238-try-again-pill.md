# 238: "Try again" pops after a wrong check, and the hint rings once

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupReview.ts` | `TRY_AGAIN_MS`, `HINT_RING_MS`, `tryAgainAt`, `tryAgainShowing`, `hintRingAt`: when the pill and the ring are due, derived from the wrong check's stored moment. |
| `app/student/screens/GroupBoardScreen.tsx` | Draws the pill centred over the screen and puts `ring-out` on the hint; hands the durations to CSS as custom properties. |
| `app/globals.css` | `try-again` (pop, one pulse, fade) and `hint-ring` (one purple ring off the hint, after the pill) keyframes; reduced-motion fallbacks. |
| `lib/groupReview.test.ts` | Pins which checks pop the pill and ring, and for how long. |
| `tickets/238-try-again-pill.md` | The ticket. |

## How it connects

```
 Check (pen-holder) → group/check → attempts[q] += { correct: false, at }   (lib/classroom.ts, unchanged)
                                         │  classroom store → every member's iPad
                                         ▼
 lib/groupReview.ts ◄238
   tryAgainAt(run)  = at   if first visit, wrong checks 1 or 2, not closed
   tryAgainShowing  = now < at + TRY_AGAIN_MS (1.6 s)
   hintRingAt(run)  = at + TRY_AGAIN_MS   if it was the 2nd wrong check (hint arrives)
                                         │
                                         ▼
 GroupBoardScreen.tsx  (relative; style --try-again-ms, --hint-ring-ms)
   ┌ board ───────────────┐  ┌ column ─────────────┐
   │                      │  │ NOT YET             │
   │    ( Try again )  ◄──┼──┼─ absolute inset-0,  │  .try-again: 0 → 0.5 s pulse → fade by 1.6 s
   │                      │  │ HINT  .ring-out ◄238│  ::after ring: waits 1.6 s, spreads 0.9 s
   └──────────────────────┘  │ READ AS             │
                             └─────────────────────┘
 t:  0 ─── pill pops/pulses ─── 1.6 s fades ──► ring spreads ─── 2.5 s gone
```
