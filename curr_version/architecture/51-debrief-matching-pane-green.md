# 51 · Debrief: a pane that matches the group's rework turns green

Route: `/student` group review, after a correct check (the debrief).

## Files touched

| File | What it does |
|---|---|
| `lib/debrief.ts` | `matchesGroup(lines, group)`: same number of lines, each equal to the group's line at that index once whitespace is collapsed, and at least one line. `MarkedVersion` gains `matches`; `markedVersions` sets it on Handed in and Reworked, always `false` on Group's rework |
| `lib/debrief.test.ts` | Q1: `[false, true, false]` with Sam's rework, `[true, false]` when the handed-in version already was the group's; whitespace ignored; reversed order, a prefix and an empty version do not match |
| `app/student/screens/GroupDebrief.tsx` | The `<section data-version>` picks `border-secure-line bg-secure-soft` when `v.matches`, else the old white (`border-line` / `border-standout-line` for the group's). `data-matches` on the green pane. `Lines` takes `onGreen`: an unmarked line box there is `border-secure-line bg-paper/70` instead of `border-line bg-cream/40`; red and blue marks unchanged |

## How it connects

```
 GroupDebrief ── own = { lines, rework } from session; group = groupRework(run, problem).lines
   │
   ├─ markedVersions(problem, own, group) ─▶ [ Handed in · Reworked? · Group's rework ]
   │        each: { label, lines[{tex, mark}], matches }
   │        matches = matchesGroup(version.lines, group)      Group's rework: always false
   │
   └─ <section data-version data-matches?>
        matches ──▶ bg-secure-soft  border-secure-line     ← the same tokens as the pill
        else    ──▶ bg-paper, border-line (group's: border-standout-line)
          └─ Lines onGreen={matches}
               wrong ──▶ wrong-soft   standout ──▶ standout-soft   (as before)
               plain ──▶ onGreen ? paper/70 on secure-line : cream/40 on line

 [ the group got it · you wrote it ]  bg-secure-soft border-secure-line   (unchanged, ticket 41)
 app/globals.css  --color-secure-soft #e6f5ec  --color-secure-line #bfe4cf  ← the one source of the green
```

## Verified by

vitest (270 tests, six in `debrief.test.ts`); eslint and tsc clean; `next build`. A headless-Chrome
run of the built app on port 3131: skip to group review, two strokes, check → the debrief with the
pill at `rgb(230, 245, 236)` on `rgb(191, 228, 207)`, the Reworked pane the same two colours with
`data-matches`, Handed in and Group's rework white; after "show me the marks" the red line in
Handed in and the green pane unchanged.
