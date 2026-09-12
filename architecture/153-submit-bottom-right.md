# 153 · Submit sits where START was

Route: `/student` (stages `overview` → `confidence`).

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/ConfidenceScreen.tsx` | Takes the start screen's frame (`px-10 pt-6 pb-5`); the question and answers sit in a centred `max-w-3xl px-9` column inside it; the button row spans the screen so Submit lands on START's rect; the empty spot is the button itself, invisible. |

## How it connects

```
 iPad screen 1180 × 820, below StudentChrome
 ┌──────────────────────────────────────────────────────────────┐
 │ OverviewScreen   px-10 pt-6 pb-5                             │
 │   header · 5-wide grid of ProblemCard tiles                  │
 │   mt-auto row ──────────────────────────────── [ START ] ────┤ right 1140, bottom 800
 └──────────────────────────────────────────────────────────────┘
                     │ overview/start (lib/session.ts)
                     ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ ConfidenceScreen px-10 pt-6 pb-5           (same frame)      │
 │      ┌ data-confidence-column  mx-auto max-w-3xl px-9 ┐      │
 │      │ BEFORE YOU START / How confident are you?     │      │  x 242 → 938, unchanged
 │      │ ○ confident · ○ not confident · ○ … with…     │      │
 │      └───────────────────────────────────────────────┘      │
 │   mt-auto row ──────────────────────────────── [ Submit ] ───┤ right 1140, bottom 800 — the same rect
 │        after a not-confident answer:  ┌ warm-up offer ┐      │
 │                                       └───────────────┘      │
 │                                        [ Submit ] invisible  │  the spot keeps the row's height exactly
 └──────────────────────────────────────────────────────────────┘
```

## Verified by

vitest (427), eslint, tsc, `next build`; `submit153.mjs`: START then Submit measured against `.ipad-screen` at scale 1, same right / bottom / top edges (1140 / 800 / 753.5), the column's x unchanged (242 → 938), Submit disabled then enabled without moving, the empty spot equal to Submit's rect, the offer above it with its right edge on the button's.
