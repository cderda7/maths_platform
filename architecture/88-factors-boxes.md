# 88 · The factorising hints say "factors", and the two lit factor boxes sit clear of each other

Route: `/student?stage=practice` (the factorising warm-up), the practice overlay and the read-as column.

## Files touched

| File | What it does |
|---|---|
| `data/practice.ts` | The `w-monic` hints and the follow-up's say "factor(s)" where they said "bracket(s)"; the null-factor-law hint's linked phrase is `factors`, and its second sentence says "one of them" so the word appears once. |
| `lib/hint.ts` | `termTex` writes `\kern0.7em` (was `\;`) between two fragments that abut, so the two lit boxes, each padded 0.1em and ringed 2px beyond its fragment, do not touch. |
| `lib/hint.test.ts` | The abutting-fragments test expects the new gap; the two spacing tests key on it. |

## How it connects

```
   HintCard  "The two [factors] multiply to give [0] …"     hover "factors"
       │
       ▼
   termTex(line 3 tex, terms, lit = factors)                lib/hint.ts
       (x + 3)(x + 4) = 0
       └──────┘└──────┘  two fragments that abut (end of one = start of the next)
       ▼
   \htmlClass{hint-term hint-term-lit}{(x + 3)} \kern0.7em \htmlClass{hint-term hint-term-lit}{(x + 4)} = 0
                                                 ───┬────
                                                    │  0.7em ≥ 2 × (0.1em padding + 2px ring) + air
       ▼                                            │
   .katex .hint-term            app/globals.css     │  padding 0.12em 0.1em; margin takes it back
   .katex .hint-term-lit                            │  box-shadow 0 0 0 2px
       ▼
   ReadAs line 3:   ┌───────┐   ┌───────┐
                    │(x + 3)│   │(x + 4)│ = 0       ~4px between the rings at the read-as size
                    └───────┘   └───────┘
```

## Verified by

vitest (334 tests); eslint clean; a CDP click-through of the built app (`factors.mjs` in this session's
scratchpad): three strokes on the pad, "I need help" → hint, hover "factors": the hint card reads
"The two factors multiply to give 0 …", the lit fragments are `(x+3)` and `(x+4)`, and their painted
extents (border box plus ring) are 1006–1066 px and 1070–1130 px, so 4.5px apart.
