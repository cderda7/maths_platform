# 45 · The teacher pane scales with its height

Route: `/split` (presenter page), the teacher pane.

## Files touched

| File | What it does |
|---|---|
| `lib/split.ts` | `PANES`: the teacher's design is now `{ width: 1280, height: 800, fit: "fill" }`, a 1280 × 800 laptop, where it had a width only. Nothing else changes: `frameFor` already fits a `fill` design by height when it has one |
| `lib/split.test.ts` | A test that the teacher is that laptop and that `frameFor` halves it in a half-height pane and fills a bigger pane at scale 1; the "one surface without a height" test now says every surface has one |

## How it connects

```
 PaneFrame (SplitView.tsx) ── useSize(pane) ──▶ frameFor(pane, design) ──▶ iframe: left · top · width · height · scale
                                                       │
            fill, design {width, height}:  scale = min(1, paneW / designW, paneH / designH)
                                           frame = paneW / scale × paneH / scale   (covers the pane)

   student  { 1264 + 40, 904 + 40 }   the iPad stage; it centres the device in the spare width
   teacher  { 1280, 800 }             the laptop; the page centres itself (max-w-[1640px] at zoom 0.8 = 1312 CSS px)
   board    { 1440, 810, letterbox }  unchanged

 stacked, 2000 × 1150 window, default row split:   pane 1176 × 503
   student  scale 0.556  (by height)     teacher  scale 0.629  (by height, was 0.919 by width)
 divider dragged down, teacher pane 1176 × 130:    teacher scale 0.161, a thumbnail of the whole page (was a cropped corner)
 teacher alone, 1974 × 1048:                        scale 1, frame = pane, scrolls (unchanged)
 three beside on 1440 × 900:                        teacher 462 wide → scale 0.361 by width (unchanged)
```

## Verified by

vitest (263 tests); eslint clean; a headless-Chrome run of the built app on port 3113 over
`/split` at 2000 × 1150 and 1440 × 900: the iframe's `data-scale` and the teacher document's
`innerWidth` / `main` offset at the default split, after dragging the student/teacher divider each
way, without the board, teacher alone, and three side by side; screenshots of each.
