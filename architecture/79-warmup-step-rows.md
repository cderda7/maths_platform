# 79 · Every warm-up line is one step, and two cases branch side by side

Routes: `/student?stage=practice` (the warm-up pad and its worked example), the mid-set practice overlay on `…?stage=working`.

## Files touched

| File | What it does |
|---|---|
| `data/practice.ts` | Graph features: six rows (`x^2 - 2x - 8 = 0`, factorised, `x = 4 or x = -2`, axis, height, `(1, -9)`); sketch: seven rows (roots, height at 0, `(0, 3)`, axis, height, `(2, -1)`, the sketch); the pair checks in monic, its follow-up and non-monic are one fact per row |
| `components/PracticeCard.tsx` | A step whose line has two cases renders them as two boxes side by side (`data-branches`), matching the read-back |
| `lib/warmup.test.ts` | Guard over the bank and follow-ups: every "or" line branches in two, no "⇒ … = … = …" chain, no `\quad`; the graph-features script pinned |
| `lib/session.test.ts` | The default warm-up's example tests count its steps from `PRACTICE` (five now) and its follow-up's (four) |

## How it connects

```
   data/practice.ts   PRACTICES["graphing.quadratics.features"].steps
     ┌───────────────────────────────┬────────────────────────┐
     │ x^2 - 2x - 8 = 0              │ Intercepts: y is 0     │
     │ (x - 4)(x + 2) = 0            │ Factorised             │
     │ x = 4 \;\text{or}\; x = -2    │ x-intercepts           │  ◄── the "or" line, no "⇒" in front of it
     │ x = (4 + (-2))/2 = 1          │ Axis of symmetry       │
     │ y = 1 - 2 - 8 = -9            │ Height on the axis     │
     │ (1, -9)                       │ Turning point          │
     └───────────────────────────────┴────────────────────────┘
                 │ warmupScript(p)  (one line per burst)                 │ steps (one row per reveal)
                 ▼                                                        ▼
   components/PracticePad.tsx ── nextLine ──► run.lines[p.id]     components/PracticeCard.tsx
                 │                                                        │
                 ▼                                                        ▼
   components/ReadAs.tsx                                          worked example row
     branchesOf(tex) ── 2 ──► ┌ x = 4 ┐ ┌ x = -2 ┐                branchesOf(tex) ── 2 ──► label │ [x = 4] [x = -2]
                      ── 1 ──► ┌ (1, -9) ┐                                        ── 1 ──► label │ (1, -9)

   lib/warmup.test.ts   for every problem + followUp, every step:
                          "or" ⇒ branchesOf(tex).length === 2 · no /\Rightarrow…=…=/ · no "\quad"
```

`lib/branches.ts` is unchanged: its rule that an "or" behind a "⇒" stays whole still holds, and the
guard test makes sure no warm-up line is written that way.

## Verified by

vitest (318 tests); eslint and tsc clean; `next build`; headless Chrome on the built app (port 3152,
CDP 9440): the warm-up with fractions, graph features and sketching ticked, graph features open →
six bursts give six read-back rows, the third two boxes `x = 4` · `x = −2` → "I need help" → "worked
example" → six labelled rows, the roots as two boxes → the sketch problem → seven rows, the first
two boxes `x = 1` · `x = 3`; screenshots of each.
