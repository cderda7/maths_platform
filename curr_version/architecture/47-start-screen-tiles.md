# 47 · Start screen as a grid of tiles

Route: `/student` at the `overview` stage (the "start" skip).

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/OverviewScreen.tsx` | The start screen, rewritten again. Header: unit eyebrow, title with "Ms Okafor · due …" on its baseline. Body: an `<ol data-problems>`, `grid-cols-5 gap-3`, one `aspect-square` `<li data-problem>` per problem holding a `ProblemCard chips={false} compact`. Footer: `[WARM UP] [START]` (`Button variant="accent"`, `uppercase tracking-[0.08em]`), `mt-auto` + `justify-end` so they sit in the bottom-right corner whatever the grid's height. The local `ProblemRow`, the inline `.math-row` expression and the chip column from ticket 44 are gone |
| `components/ProblemCard.tsx` | Two new props. `chips` (default `true`): render the problem's `LeafChip`s or not. `compact` (default `false`): `p-3.5`, an 18 px label, 12.5 px stem, plain-size display maths, a 100 px figure, so a whole problem (Q8 with its parabola, Q9 with its four-line stem) fits in a 208 px square. The chooser passes neither and is unchanged |
| `app/globals.css` | `.math-row .katex` removed; nothing used it once the rows went |

## How it connects

```
 StudentApp (stage === "overview")
   │  onPractice → practice/accept        onStart → practice/decline
   ▼
 OverviewScreen ── useAssignment() ──▶ active.title, active.problems
   ├─ header: Eyebrow(unitLabel) · h1(title) + teacher · due
   ├─ <ol data-problems  grid-cols-5 gap-3>
   │     └─ <li data-problem aspect-square> × 10
   │           └─ ProblemCard chips={false} compact ──▶ p.label · p.stem · <M tex display> · Figure (100 px, Q8)
   │                     (no LeafChip: chips={false})
   └─ footer  mt-auto justify-end: [WARM UP] [START]   Button variant="accent" uppercase

 WarmupPickScreen ── ProblemCard (defaults: chips, p-5, selectable) ── unchanged

 On the 1180 × 820 stage: tiles 208 × 208, grid 1100 × 433, buttons' bottom edge at the
 stage's bottom padding; every tile's scrollHeight equals its clientHeight.
```

## Verified by

vitest (262 tests, unchanged); eslint and tsc clean; a headless-Chrome run of the built app on
port 3116: ten `[data-problem]` tiles at 208 × 208 in five columns, none overflowing, no skill
name in the list's text, both buttons `text-transform: uppercase` in `rgb(91, 74, 232)` on white
with their right edge at the stage's right padding and bottom edge at its bottom padding, "warm
up" and "start" both landing on the confidence screen; the chooser at `?stage=warmup-pick` still
shows ten selectable cards with their chips at 20 px padding.
