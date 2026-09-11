# 75 · Practice pad: "I need help" under the question; a harder fractions warm-up

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay on `…?stage=working`.

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | The left column: title, chip strip, stem, problem, hint card, and now "I need help" straight after them (`mt-5`) instead of pushed to the foot (`mt-auto`) |
| `data/practice.ts` | The `algebra.number.fractions` practice: `\dfrac{x}{4} + \dfrac{x}{2} - 6 = \dfrac{9}{2}`, four steps, the clearing-denominators hint and its two hint terms |
| `lib/hint.test.ts` | Pins the new TeX and the `\htmlClass` markup `termTex` produces when "denominators" or "every term" is lit |

## How it connects

```
   data/practice.ts  PRACTICES["algebra.number.fractions"]
     tex ──────────────────────────────┐
     steps[].tex ─► warmupScript ─► nextLine (lib/recognition): the four lines the pad "reads"
     hint, hintTerms ─► HintCard (phrases) ─┐
                                            ▼
   components/PracticePad.tsx  <aside>      termTex(tex, hintTerms, lit)  ─► <M> (KaTeX, trust)
     Warm-up · NOT MARKED
     [chips]                                 "every term"   lights x/4, x/2, 6, 9/2
     Solve.                                  "denominators" lights the 4 and the 2 inside the x fractions
     x/4 + x/2 − 6 = 9/2                     (first whole occurrence of each fragment: the 9/2's 2 is not lit)
     [Hint card]        ← only after "hint" is picked
     [ I need help ]    ← was mt-auto at the foot; now mt-5 under whatever is above it
```

## Verified by

vitest (312 tests, one new); eslint and tsc clean; `next build`; headless Chrome on the built app (port
3134, CDP 9392): before the hint the button's top is 20px under the maths block, after picking "hint"
the card sits between them and the button follows the card; hovering "denominators" lights two
fragments; screenshots of both states.
