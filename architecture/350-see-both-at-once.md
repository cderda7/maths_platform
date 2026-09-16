# 350: The worked example never hides the student's own pad

## Files touched

| File | What it does |
| --- | --- |
| `components/PracticeCard.tsx` | The shared "worked example" box drops its top-right `LeafChip` (the "fractions" pill); the stem/expression render alone when `question` is true, no wrapping row. |
| `app/student/screens/PracticeSteps.tsx` | `WorkedStep` (the Example step): the left `<aside>` now holds only the caller's `head`; the stem, expression and figure move to the top of the middle `[data-example]` column, above the `Worked example` eyebrow and card. `ExamplePeek`: rebuilt for a narrow column — `compact`, wrapped in `FitHeight` so it zooms to fit rather than scroll. `CompletionStep` (Your turn): `peek` now swaps only the left column's lower half (question, hint cards, "I need help") for `ExamplePeek`; the pad and the working column render unconditionally, regardless of `peek`. |
| `components/PracticePad.tsx` | The warm-up's stage 3 ("On your own") gets the identical treatment: `peek && exampleAgain` renders `ExamplePeek` inside the left `<aside>` (below the title/header, above where the question used to sit) instead of swapping the middle column; the middle column is `PadSection` whenever `run.example` is false, `peek` or not. |
| `tickets/350-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `README.md` | Docs. |

## How it connects

```
 app/student/screens/PracticeScreen.tsx (warm-up)      app/student/screens/HelpLadder.tsx (help on a set Q)
   phase "worked"    → <WorkedStep/>                      step "example"/"again" → <WorkedStep/>
   phase "completion"→ <CompletionStep/>                  step "completion"      → <CompletionStep/>
   phase "alone"     → <PracticePad exampleAgain=…/>              (both pass their own `head`/`footer` only)
        │                                                              │
        └───────────────────────────────┬──────────────────────────────┘
                                         ▼
                     app/student/screens/PracticeSteps.tsx
   ┌─ WorkedStep ──────────────────────────────────────────────────────────┐
   │ ┌──────────┐ ┌─ [data-example] ───────────────┐ ┌── chat ──────────┐ │
   │ │  head    │ │ Solve.  x/4 + x/2 − 6 = 9/2     │ │ Question about   │ │
   │ │ (eyebrow,│ │ ── WORKED EXAMPLE ──            │ │ a step?          │ │
   │ │ steps,   │ │ <PracticeCard question={false}  │ │                  │ │
   │ │ title,   │ │   — no pill (ticket 350)>        │ │                  │ │
   │ │ chips)   │ │                                  │ │                  │ │
   │ └──────────┘ └─────────────────────────────────┘ └──────────────────┘ │
   └─────────────────────────────────────────────────────────────────────┘

   ┌─ CompletionStep ────────────────────────────────────────────────────┐
   │ ┌─ aside ──────────┐  ┌─ PadSection (always) ──┐  ┌─ Working ─────┐ │
   │ │ head             │  │  YOUR WORKING           │  │ given/blank   │ │
   │ │ peek ? ExamplePeek│  │  (drawpad, unaffected   │  │ lines, marked │ │
   │ │      : question  │  │   by peek)              │  │               │ │
   │ │   + hints         │  │                          │  │               │ │
   │ │   + "I need help" │  │                          │  │               │ │
   │ └──────────────────┘  └─────────────────────────┘  └───────────────┘ │
   └─────────────────────────────────────────────────────────────────────┘
                    ▲
                    │ ExamplePeek (compact, FitHeight-fit, "Back to your turn")
                    │ — the same component components/PracticePad.tsx's
                    │   `exampleAgain` path renders in its own aside, stage 3
                    └── PracticeCard (question, shown=all steps, compact) + Button
```

`ExamplePeek` used to be a whole-column replacement: the middle column's `[data-example]`/pad slot,
full width, uncompacted. It now renders inside a 300 px `<aside>`, `compact`, and its steps are
wrapped in `FitHeight` (ticket 277) — measured at full size, then zoomed down by a short binary
search until the box's height is clear, never a scrollbar. The "Back to your turn" button sits
outside the `FitHeight` box so it is never shrunk or clipped.

Both `CompletionStep` and `PracticePad`'s `exampleAgain` path call the same `ExamplePeek`, so the
fix is one component doing one thing everywhere the warm-up offers "see the example again" — the
decision to change both call sites rather than one is logged in `DECISION_LOG.md`'s 2026-09-16
entry.

`WorkedStep`'s question move is layout-only: `question` (the `StepQuestion` prop) still comes from
the same caller in the same shape; it just renders in `[data-example]` instead of the left
`<aside>`, above a `border-t` rule that separates it from the `Worked example` eyebrow and card.
