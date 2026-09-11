# 87 · The factorising warm-up's second hint no longer lists the pairs to try

Route: `/student?stage=practice` (the factorising warm-up), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `data/practice.ts` | The `w-monic` hint at position 1 is one sentence: "Once you have a pair that multiplies to 12, check it adds to 7 as well." |

## How it connects

```
   PRACTICES["algebra.expand-factor.monic"].hints[1]   at: [1]  (after the product line)
     text   "Once you have a pair that multiplies to 12, check it adds to 7 as well."   ← "The pairs to try: …" removed
     terms  "pair" → 3, 4 · "12" → 12          both phrases still in the text; fragments still in line 1 (3 × 4 = 12)
```

## Verified by

vitest (330 tests: the fixture test finds every phrase whole in its hint and every fragment in the
line the hint points at); eslint clean. Data only: no screen or rule changed.
