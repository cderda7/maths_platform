# 53 · Group review header: the progress bar stays put on "the group got it"

Route: `/student` group review: the whiteboard and the debrief after a correct check.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/GroupHeader.tsx` | New. The header both screens render: `grid min-h-9 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4`, `data-group-header`. Left column: the `font-display` label, the `math-lg` equation, then `children`. Middle: `GroupBar`. Right column: `right`, end-aligned |
| `app/student/screens/GroupBar.tsx` | The percentage span gains `w-11` (44 px) so the middle column is the same width for "0%", "10%" and "100%"; comment updated |
| `app/student/screens/GroupBoardScreen.tsx` | The hand-rolled flex header replaced by `<GroupHeader>` with `1 of 6` as children and the pen chip (`data-pen`) as `right`. The `Group` chip list, the wrong-check panel and the board are unchanged |
| `app/student/screens/GroupDebrief.tsx` | The hand-rolled header replaced by `<GroupHeader>` with the `the group got it · you wrote it` pill (`data-correct`) as `right` and no children; the bar now shows here |

## How it connects

```
 GroupBoardScreen ──────────────────────────────────┐        GroupDebrief ──────────────────────────────┐
   <GroupHeader label tex right=[pen chip]>          │          <GroupHeader label tex right=[got-it pill]>
     children = "1 of 6"                             │            (no children)
                                                     │
   ┌────────────── minmax(0,1fr) ─────────┬── auto ──┴───────────┬──────── minmax(0,1fr) ─────────────┐
   │ [Q1] [x² − 5x + 6 = 0] [1 of 6]      │ ▓▓░░░░░░░░░░ 320×20  │ w-11 "0%"  │            [you have the pen] │  whiteboard
   │ [Q1] [x² − 5x + 6 = 0]               │ ▓▓░░░░░░░░░░ 320×20  │ w-11 "10%" │  [the group got it · you wrote it] │  debrief
   └──────────────────────────────────────┴──────────────────────┴────────────┴────────────────────────────────────┘
        ▲ equal outer columns keep the middle one centred            ▲ fixed width keeps the middle column one size
                                              GroupBar ── ownStanding(classroom, session) ──▶ percent, colour
```

Why a grid and not `justify-between`: with three flex items the middle one lands at
`left width + (free space) / 2`, so any change in the pen chip's or percentage's width moves it.
Equal `minmax(0,1fr)` columns put the middle column at the same x whatever the outer content is.

## Verified by

vitest (271 tests, unchanged); eslint and tsc clean; a headless-Chrome run of the built app on
port 3133: skip to group review, write two lines, Check. `getBoundingClientRect` of the track is
`[512, 156, 320, 20]` and of the percentage `[844, 154, 44, 24]` on both the whiteboard and the
debrief, and the header row is 39 px tall on both. Before the fix the debrief had no bar, and a
first attempt that kept the pill beside the equation measured the track 5 px to the left and the
header 54 px tall (the equation wrapped).
