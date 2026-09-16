# 352: The current question stays visible while peeking at the example

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/PracticeSteps.tsx` | `CompletionStep`'s middle column: while `peek` is true, a `[data-current-question]` block (stem, expression, figure) renders above `PadSection`, with a `border-b` separating it from "Your working"; absent when not peeking, since the left column already shows the question then. |
| `components/PracticePad.tsx` | The identical block, gated on `peek && exampleAgain`, added above `PadSection` in the middle column for the warm-up's stage 3 ("On your own") — the same shared peek pattern ticket 350 gave stage 2, so it needed the same fix. |
| `tickets/352-…`, `ARCHITECTURE.md`, `README.md` | Docs. |

## How it connects

```
 CompletionStep (Your turn) / PracticePad's exampleAgain path (On your own)
   peek = true (via "I need help" → "see the example again")
        │
        ├── left column:  ExamplePeek (the worked example, ticket 350)
        │
        └── middle column:
              ┌─ [data-current-question] (new, this ticket) ──┐
              │  Solve.  x/8 + x/4 − 3 = 3/2                   │  ← only while peek is true
              └────────────────────────────────────────────────┘
              ┌─ PadSection ("Your working") ──────────────────┐
              │  the drawpad, unaffected by peek (ticket 350)   │
              └────────────────────────────────────────────────┘
```

Before this ticket, peeking left the middle column showing only the pad (blank, or mid-line) with
nothing saying what problem it was for — ticket 350 moved the question out of the left column
(replaced by the worked example) but didn't give it anywhere else to go. The block reuses the same
stem/`termTex`/figure rendering the left column used when not peeking, so hints already lit still
decorate the expression the same way.

The block sits above `PadSection` inside the same flex-column wrapper (`min-h-0 flex-col`) rather
than beside it, so `PadSection`'s own `flex-1` still gives the pad whatever height is left — no
change to the pad's own sizing or to the pinned "next" button (ticket 349) beneath it.
