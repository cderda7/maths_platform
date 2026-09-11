# 104 · The conjured 1 hangs in the margin, and the lit box sweep lives in the repo

Route: `/student?stage=practice` and the practice overlay (the discriminant warm-up's "a"); `scripts/hint-box-sweep.mjs` against a production build.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `conjure` wraps the inserted fragment in `\llap{…}`: zero width, extending left, so nothing moves. |
| `lib/hint.test.ts` | The conjure expectation; the problem layout sweep with no exemption for a conjured fragment. |
| `scripts/hint-box-sweep.mjs` | The pixel sweep: every warm-up on offer, every line written, every hint word hovered; fails on a lit box covering a glyph or fraction bar, or on any glyph moving. Same harness conventions as `scripts/laptop-check.mjs`. |
| `package.json` | `sweep:hint-boxes`. |
| `CLAUDE.md` | The two rules (the maths keeps its spacing; lighting moves nothing) and the sweep as part of done. |

## How it connects

```
 data/practice.ts                        lib/hint.ts  termTex(tex, terms, lit)
 "x^2 + 2x + 5 = 0"                      \llap{\htmlClass{hint-term hint-term-lit hint-term-tight-x}{1}}x^2 + 2x + …
   term "a": insert { before: "x^2", tex: "1" }      ▲ zero width: the 1 is painted to the left of where it stands

                    margin │ problem
                         [1]x² + 2x + 5 = 0        ← x² is where it was without the 1
                           ▲ tight-x: flush against x²

 scripts/hint-box-sweep.mjs ──▶ http://localhost:3121 (HINT_SWEEP_URL)
   for each [data-sequence] warm-up:  open · (scribble → next read line)* · "I need help" → hint · hover each [data-hint-term]
     glyphsIn(problem, read-as)  plain ─┬─ wrapped ─┬─ lit        must be identical   (rule 2)
     OVERLAPS: outermost .hint-term-lit × every glyph / .frac-line of its .katex outside it   must be none   (rule 1)
   exit 1 on any failure; HINT_SWEEP_SHOTS=<dir> saves 3× clips
```

## Verified by

vitest (339), eslint, tsc, `next build`; a standalone KaTeX render of the discriminant problem plain, wrapped and lit measured in headless Chrome (all glyphs identical, the 1 in the margin); `npm run sweep:hint-boxes` against the build, all 30 checks passing.
