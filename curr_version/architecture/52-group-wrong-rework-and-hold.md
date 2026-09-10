# 52 · Group review: Liam's Q7 checks wrong first; a ten-second hold; the ring fits the button

Route: `/student` group review (the shared whiteboard, then the debrief after a correct check).

## Files touched

| File | What it does |
|---|---|
| `data/group-scripts.ts` | `q7: { attempts: [SLIPS.q7, RECOGNITION_REWORK.q7] }`: Liam's first go is the class's common slip (`x^2 + 6x + 8/3`, wrong at line 1), his second the correct rework. No `stuckAfter` |
| `lib/debrief.ts` | `HOLD_MS` 10 000; `PEER_DEBRIEF_MS` 16 000 (a peer's own debrief, roughly: the hold plus a few seconds writing) |
| `app/student/screens/GroupDebrief.tsx` | Hint "take a moment to reflect". New `HoldRing`: wraps Next, measures itself with a `ResizeObserver`, draws two pixel-sized `<rect>`s (`rx` = half the height) 4 px outside the button, the second dashed by `progress` |
| `lib/groupReview.test.ts` | Q7's turn: two checks, no stuck, first attempt cut at line 0 with two hidden, lines in order |
| `lib/debrief.test.ts` | `HOLD_MS` is 10 000; progress 0.5 at 5 s, 1 at 10 s |

## How it connects

```
 data/group-scripts.ts            lib/groupReview.ts                    classroom (peer turn replay)
 GROUP_SCRIPTS.q7 = {             turnScript("q7")                      StudentApp applies events
   attempts: [ SLIPS.q7,   ──▶     line×3 · check ✗ · +3.5 s ·   ──▶    group/line, group/check …
               REWORK.q7 ] }       line×3 · check ✓
                                          │
            GroupBoardScreen ◀────────────┘
              lastAttempt wrong ──▶ [data-wrong-check] "Not yet · read as"
                                     cutAtFirstMistake: line 1 red · "2 more lines"
              check ✓ ──▶ resolved ──▶ GroupDebrief
                                          │
                lib/debrief.ts            ├─ note ──▶ "show me the marks" ──▶ markedAt
                HOLD_MS = 10 000 ─────────┤     holdProgress(markedAt, now) 0…1 over 10 s
                PEER_DEBRIEF_MS = 16 000  │     holdOver ──▶ Next enabled, hint gone
                (StudentApp: when a peer   └─ <HoldRing progress>
                 holds the next pen, the         ResizeObserver ──▶ {w,h} of the button
                 group moves on this long        <svg w+8 × h+8, left/top −4>
                 after the check)                  rect rx=(h+8−2)/2  accent-line   (track)
                                                   rect same, pathLength 100,
                                                        dashoffset 100 − progress·100  (fill)
                                                 <Button data-next> next | finish
```

## Verified by

vitest (272 tests, one new in `groupReview.test.ts`, the hold test rewritten); eslint and tsc
clean; `next build`. A headless-Chrome run of the built app on port 3140: skip to group review,
Sam's Q1 check, a note, "show me the marks": the ring measured 68 × 44 px around the 60 × 36 px
button (`rx` 21), dash offset 92 → 42 → 0 at 0.5 s, 5.5 s and 11 s, the hint "take a moment to
reflect" shown until Next enabled at 11 s. Then through Zara's Q2 and Jordan's Q3 to Liam's Q7:
the wrong-check panel with one red line and "2 more lines", then the debrief with "the group got
it · Liam wrote it".
