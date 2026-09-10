# 62 · Mistakes view: students side by side, one click opens every student's work in columns

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/mistakes/TeacherMistakes.tsx` | Per problem, a one-row grid of student tiles (avatar, name, live pill, `SlipChip` per slipped leaf). Open state is the problem id; when open, every column shows its lines beneath the tile, wrong lines red-tinted, no note, label or chip. The live student's compare link sits under their lines |
| `components/Tag.tsx` | New `SlipChip`: a leaf's short name as a white pill with dark red text and border, `data-slip` |
| `app/globals.css` | New `--color-wrong-deep` token (#9e2f27) for the pill |

## How it connects

```
   lib/mistakes.ts  mistakesByProblem(session)
   ┌────────────────────────────────────────────────┐
   │ [{ problem, rows: [{ id, name, initials, live,  │
   │     lines: [{ tex, verdict }], slips: LeafId[] }]}]│
   └───────────────────────┬────────────────────────┘
                           ▼
   app/teacher/mistakes/TeacherMistakes.tsx      open: problemId | null
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ Card per problem                                                            │
   │  header: label · DifficultyTag · tex            N students · LeafChip×slips │
   │  ─────────────────────────────────────────────────────────────────────────  │
   │  <ol grid grid-flow-col auto-cols-[minmax(230px,1fr)]>   (overflow-x-auto)  │
   │  ┌ li column ─────────┐ ┌ li column ─────────┐ ┌ li column ─────────┐      │
   │  │ button (tile)      │ │ button (tile)      │ │ button (tile)      │      │
   │  │  Avatar  Name LIVE │ │  Avatar  Name      │ │  Avatar  Name      │ click│
   │  │          SlipChip  │ │          SlipChip  │ │          SlipChip  │ any  │
   │  ├── if open ─────────┤ ├────────────────────┤ ├────────────────────┤ ───▶ │
   │  │  line card         │ │  line card         │ │  line card         │ open │
   │  │  line card (wrong: │ │  line card (wrong) │ │  line card (wrong) │ = pid│
   │  │   bg-wrong-soft)   │ │  line card         │ │  line card         │      │
   │  │  line card         │ │                    │ │                    │      │
   │  │  As handed in ·    │ │                    │ │                    │      │
   │  │  Original vs final→│─┼─▶ /teacher/compare │ │                    │      │
   │  └────────────────────┘ └────────────────────┘ └────────────────────┘      │
   └─────────────────────────────────────────────────────────────────────────────┘
                           │ SlipChip                        │ LeafChip (header only)
                           ▼                                 ▼
   components/Tag.tsx  SlipChip ── border/text: --color-wrong-deep (app/globals.css)
                       LeafChip ── unchanged, still names the problem's slipped leaves in the header
```

## Verified by

vitest (280 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port 3143
seeded the demo at "indiv review" from `/student`, opened `/teacher/mistakes` at 1600px and read the DOM:
Q2 has six columns whose tops share one y, each with the student's name and a single "non-monic factorising"
pill below it (computed white background, `rgb(158, 47, 39)` border and text), no leaf chip and no "lines" text
in the strip. Clicking Sam's tile expanded all six columns on one row (4, 3, 3, 3, 3, 3 lines; one red-tinted
line each, `rgb(251, 233, 231)`), with no "Try expanding" text, no step label and no leaf chip in any column,
and the compare link present in Sam's. Clicking Jordan's tile closed Q2; clicking Ethan on Q1 opened Q1's
three columns and left Q2 closed. Screenshots of both states were checked by eye.
