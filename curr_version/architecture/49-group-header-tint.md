# 49 · Group review header: no colour label, names in the group colour, a big progress bar

Route: `/student?stage=group`.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/GroupBoardScreen.tsx` | Header row and the `Group` chip list. The `● sky` colour chip before `Q1` is gone. Each `<li>` in the member list that is not the pen-holder now carries `style={{ borderColor: GROUP_HEX[colour].fill, backgroundColor: GROUP_HEX[colour].soft }}` and ink text, plus `data-group-colour`; the holder keeps `bg-ink text-white`. `colour` still comes from `groupOfStudent(seatingOf(classroom.groups), DEMO_STUDENT.id)` |
| `app/student/screens/GroupBar.tsx` | The group's own progress bar: track `h-5 w-[320px]` (was `h-2 w-[140px]`), fill still `GROUP_HEX[colour].fill`, the percentage `text-[16px] font-medium text-ink` (was 12.5 px muted), gap 12 px |

## How it connects

```
 GroupBoardScreen (stage === "group")
   │  colour = groupOfStudent(seatingOf(classroom.groups), DEMO_STUDENT.id) ?? "sky"
   ├─ header row (flex justify-between)
   │    ├─ [Q1] [x² − 5x + 6 = 0] [1 of 6]          ← the colour chip that stood before Q1 is removed
   │    ├─ GroupBar session ── ownStanding(classroom, session) ──▶ percent, colour
   │    │     └─ track 320 × 20  ▓▓▓▓░░░░░░░░  fill GROUP_HEX[colour].fill   16 px "0%"
   │    └─ [you have the pen]  (unchanged)
   └─ <ul aria-label="Group">
         ├─ <li> holder      bg-ink text-white                       (unchanged)
         └─ <li> others      border GROUP_HEX[colour].fill, bg GROUP_HEX[colour].soft, text-ink
                             data-group-colour={colour}

 data/groups.ts  GROUP_HEX.sky = { fill #4f8fd6, soft #e6f0fb }  ← the only source of the tint
```

## Verified by

vitest (267 tests, unchanged); eslint clean; a headless-Chrome run of the built app on port
3131 at `/student?stage=group`: the header reads `Q1 · x² − 5x + 6 = 0 · 1 of 6 · 0% · you have
the pen` with no colour word; the `You` chip is `rgb(20, 18, 58)` on itself, Jordan, Zara and
Liam are `rgb(230, 240, 251)` with a `rgb(79, 143, 214)` border; the bar track measures 320 × 20.
