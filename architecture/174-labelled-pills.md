# 174 · The category pill carries its name; the header band goes; the reflection panel narrows

Routes: `/teacher/report` (and `?student=<id>`), `/student` at the report stage.

## Files touched

| File | What it does |
|---|---|
| `components/SkillColumns.tsx` | The column view both reports share. The chip band over the columns is gone; `CategoryPill` is the marker and the header in one: the category's name in white uppercase on the status colour, hollow with a grey name when not seen yet, a left-half colour / right-half tint when problems were skipped. Every pill stacks every column's name in one grid cell (`gridArea: 1 / 1`), its own visible, the rest `invisible`, so all six are the widest name's width. `fitPills` sizes the text to the row (11 → 9 px, padding 10 → 6) from a canvas measure of the widest name as set; the measuring effect depends on the fitted size so the trees' boxes follow the pills' final lefts. The unit label hangs `left-full ml-2` off the pill. |
| `components/HierarchyDrill.tsx` | `textWidth(text, size, weight)` exported for the pill measure (was module-private, regular weight only). |
| `app/student/screens/ReportScreen.tsx` | The report grid's right column is 320 px (was 440): the reflection panel. |

## How it connects

```
 SkillColumns (both reports)
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ [data-dots] grid: repeat(6, 1fr) 0.5fr                                             │
 │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
 │  │ ALGEBRA │ │FUNCTIONS│ │GRAPHING │ │COMMUNIC.│ │REASONING│ │NEW SKILLS│ UNIT 1   │  CategoryPill ×6, one width
 │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │  (each holds all six names,
 │  ● group      ● group      ● group      ● group      ○ group      ● skill           │   five invisible)
 │    ● skill …                                                                       │
 │  RowDrill (trees start on each pill's left edge, as before)                        │
 └────────────────────────────────────────────────────────────────────────────────────┘
   useLayoutEffect [columns, pillSize]:
     pillSize = fitPills(names, cell.clientWidth − 8)   ← canvas: textWidth(NAME, size, 600) + tracking + pad + border
     boxes    = pill lefts / widths                     ← re-measured once the pills have their fitted size
   teacher's report: cell ≈ 167 px → 11 px text, 93 px pills, 27 px gaps
   student's report: cell ≈ 115 px → 9 px text, 101 px pills, 13 px gaps   (panel 320 px, was 440)

 Was: a [data-column-heads] band of blue chips (ALGEBRA …) over a row of bare 28 × 13 pills,
      the chips overlapping on the iPad; the reflection panel 440 px.
```

## Verified by

vitest (454), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks); `pills174.mjs` (session `91f4cc2a-…`'s scratchpad, app on 3341 / CDP 9641, 66 checks): Tomas at 1400 × 1000, Amelia at 1280 × 800, Priya at 1400 × 1000 on the teacher's report and Sam's own report on the iPad stage: no header band; six pills with their names uppercase and the other five stacked invisibly; one width per row (93.3 px teacher, 101.5 px student) that fits the widest name with padding, one line tall; coloured pills white on colour (half ones on a gradient), not-seen pills hollow and grey; 27 px gaps on the teacher's, 13 px on the student's; UNIT 1 right of the NEW SKILLS pill on its line; every tree's first dot on its pill's left edge beneath it; no tree in its neighbour's column; no overflow; the teacher's still the fixed expanded view at 11 px with the eyebrow above; the student's still the groups view at 9 px, the pills the first thing in the card; the reflection panel 320 px with its heading on one line, textarea and send button in place. Screenshots of all four read by eye.
