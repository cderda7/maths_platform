# 51 · Debrief: a pane that matches the group's rework turns green

Route: `/student` group review, after a correct check (the debrief).

## Files touched

| File | What it does |
|---|---|
| `lib/debrief.ts` | `matchesGroup(lines, group)`: same number of lines, each equal to the group's line at that index once whitespace is collapsed, and at least one line. `MarkedVersion` gains `green`; `markedVersions` sets it from `matchesGroup` on Handed in and Reworked, always `true` on Group's rework |
| `lib/debrief.test.ts` | Q1: `[false, true, true]` with Sam's rework, `[true, true]` when the handed-in version already was the group's, `[false, true]` when it was not; whitespace ignored; reversed order, a prefix and an empty version do not match |
| `app/student/screens/GroupDebrief.tsx` | The `<section data-version>` picks `border-secure-line bg-secure-soft` when `v.green`, else white `border-line`. `data-green` on a green pane. `Lines` takes `onGreen`: an unmarked line box there is `border-secure-line bg-paper/70` instead of `border-line bg-cream/40`; red and blue marks unchanged |

## How it connects

```
 GroupDebrief ── own = { lines, rework } from session; group = groupRework(run, problem).lines
   │
   ├─ markedVersions(problem, own, group) ─▶ [ Handed in · Reworked? · Group's rework ]
   │        each: { label, lines[{tex, mark}], green }
   │        green = matchesGroup(version.lines, group)        Group's rework: always true
   │
   └─ <section data-version data-green?>
        green ──▶ bg-secure-soft  border-secure-line       ← the same tokens as the pill
        else    ──▶ bg-paper, border-line (group's: border-standout-line)
          └─ Lines onGreen={green}
               wrong ──▶ wrong-soft   standout ──▶ standout-soft   (as before)
               plain ──▶ onGreen ? paper/70 on secure-line : cream/40 on line

 [ the group got it · you wrote it ]  bg-secure-soft border-secure-line   (unchanged, ticket 41)
 app/globals.css  --color-secure-soft #e6f5ec  --color-secure-line #bfe4cf  ← the one source of the green
```

## Verified by

vitest (271 tests, six in `debrief.test.ts`); eslint and tsc clean; `next build`. A headless-Chrome
run of the built app on port 3131: skip to group review, two strokes, check → the debrief with the
pill at `rgb(230, 245, 236)` on `rgb(191, 228, 207)`, the Reworked and Group's rework panes the same
two colours with `data-green`, Handed in white; after "show me the marks" the red line in Handed in
and the green panes unchanged.
