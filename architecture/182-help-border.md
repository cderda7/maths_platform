# 182 · Every "I need help" button has a deep indigo border

Route: `/student` (working screen and practice pad).

## Files touched

| File | What it does |
|---|---|
| `components/ui.tsx` | `Button` gains the `deep` variant: paper fill, ink text, 1 px `accent-deep` border, `accent-soft` fill on hover. |
| `app/student/screens/WorkingScreen.tsx` | The left column's "I need help" (above the problem tiles) is `variant="deep"` (was `secondary`). |
| `components/PracticePad.tsx` | The pad's "I need help" (under the hints, hidden while a worked example plays) is `variant="deep"` (was `secondary`). |

## How it connects

```
 Button({ variant })                                   components/ui.tsx
   primary   ink fill, white text
   secondary paper, ink text, line-strong border ──► hover: ink-muted border   (was the help buttons')
   deep      paper, ink text, accent-deep border ──► hover: accent-soft fill    ◄── ticket 182
   outline   paper, accent-deep text, accent border
   …

 WorkingScreen.tsx  aside                    PracticePad.tsx  aside
 ┌ Q1 · Solve for x.        ┐                ┌ Warm-up · chips · Solve. ┐
 │ x² − 5x + 6 = 0          │                │ x/4 + x/2 − 6 = 9/2      │
 │ …                        │                │ [Hint 1]                 │
 │ ╭──────────────────────╮ │  deep indigo   │ ╭──────────────────────╮ │
 │ │     I need help      │ │  1 px border   │ │     I need help      │ │
 │ ╰──────────────────────╯ │                │ ╰──────────────────────╯ │
 │ PROBLEMS  Q1 Q2 Q3 …     │                └──────────────────────────┘
 └──────────────────────────┘
        │ onClick                                     │ onClick
        ▼                                             ▼
   setHelpOpen(true) → the help sheet (which skill / how much help), unchanged
```

## Verified by

vitest (512), eslint, tsc, `next build`; `help182.mjs` (session `b05a83d8-…`'s scratchpad, app on 3401 / CDP 9701, 18 checks): on `/student?stage=working` and on a warm-up's pad, the button's border 1 px solid `rgb(69, 53, 200)`, ink text on white, a pill; hovered, the border unchanged, the fill `rgb(238, 235, 252)`, the rect unmoved; the click opens the help sheet. Screenshots of both, plain and hovered, read by eye.
