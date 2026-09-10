# 44 · Start screen simplified

Route: `/student` at the `overview` stage (the "start" skip).

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/OverviewScreen.tsx` | The start screen, rewritten. Header: unit eyebrow, title with "Ms Okafor · due …" on its baseline, and the two buttons (`variant="accent"`) on the right. Body: an `<ol data-problems>` of `ProblemRow`s, one per problem, that fills the rest of the stage. The "Covers" / "Leans on" panel, `categoriesTouched` and `leavesTouched` are gone from this screen. `ProblemRow` (local): a three-column grid, 44 px label · stem with `<M tex>` inline (`.math-row`) and a 120 px `Figure` when the problem has one · 500 px of right-aligned `LeafChip student`s |
| `app/globals.css` | `.math-row .katex { font-size: 1.25em }`: an expression set inline after its stem |

`components/ProblemCard.tsx` is untouched; the warm-up chooser still uses it.

## How it connects

```
 StudentApp (stage === "overview")
   │  onPractice → practice/accept        onStart → practice/decline
   ▼
 OverviewScreen ── useAssignment() ──▶ active.title, active.problems
   ├─ header: Eyebrow(unitLabel) · h1(title) + teacher · due · [warm up] [start]  (Button variant="accent")
   └─ <ol data-problems> ── ProblemRow × 10 ── problemLeaves(p) ──▶ LeafChip student
                             │
                             ├─ p.label · p.stem + <M tex={p.tex}> (.math-row, inline)
                             ├─ p.figure → <Figure> at 120 px (Q8)
                             └─ chips, right-aligned, 500 px column

 Row heights on the 1180 × 820 stage: 42 (one line) · 54–66 (a wrapped stem or chip line) · 89 (Q8's figure)
 → 623 px for ten rows, the list's full height: no scrolling.
```

## Verified by

vitest (256 tests, unchanged); eslint and tsc clean; a headless-Chrome run of the built app on
port 3113: no "Covers" / "Leans on" text, ten `[data-problem]` rows, the list's `scrollHeight`
equal to its `clientHeight`, both buttons `rgb(91, 74, 232)` on white text, "warm up" and
"start" both landing on the confidence screen.
