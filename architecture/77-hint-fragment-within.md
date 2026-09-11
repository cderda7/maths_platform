# 77 · Hint terms can name a later occurrence of a fragment

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay; any hint card.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `TexFragment = string \| { tex, within }`; `HintTerm.tex: TexFragment[]` |
| `lib/hint.ts` | `locateFragment` (fragment → position), `fragmentTex`; `termTex` resolves fragments to spans, `wrap` nests and lights by span position |
| `data/practice.ts` | The fractions warm-up's "denominators" term names all three denominators, each scoped to its fraction |
| `lib/hint.test.ts` | Fractions expectation lights the 9/2's 2; `locateFragment` and shared-box tests |

## How it connects

```
   HintTerm { phrase, within?, tex: TexFragment[], insert? }
                                  │
              "4"  ───────────────┤ bare: first whole occurrence         (findFragment)
              { tex: "2",         │ scoped: first whole occurrence of tex
                within: "\dfrac{9}{2}" }   inside the first occurrence of within
                                  ▼
   lib/hint.ts  locateFragment(tex, f) ─► at   ─┐
                fragmentTex(f).length  ─► end   ─┴─► Span { at, end, lit }  (Map keyed "at:end": one box per piece)
                                                        │
                termTex ─► wrap(tex, spans)  sorted by at, longer first; inner spans re-based to the outer's text
                                                        ▼
                \htmlClass{hint-term}{\dfrac{9}{\htmlClass{hint-term hint-term-lit}{2}}}
                                                        │
   components/PracticePad.tsx  <M tex={termTex(p.tex, p.hintTerms, litTerm)} />   ─► KaTeX (trust)
   components/HintCard.tsx     hover "denominators" ─► onLit(term) ─► litTerm
```

## Verified by

vitest (316 tests, four new); eslint and tsc clean; `next build`; headless Chrome on the built app (port
3134, CDP 9392): after picking "hint" and hovering "denominators", three `.hint-term-lit` fragments;
screenshot shows the 4, the 2 under x and the 2 under 9 filled, with the layout unmoved.
