# 82 · A hint's linked words point at the student's own line; a lit fraction is boxed whole

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay.

## Files touched

| File | What it does |
|---|---|
| `app/globals.css` | `.katex .hint-term { display: inline-block }`: the box paints the whole fragment, a fraction included |
| `lib/hint.ts` | `hintAnchor(hint, lineCount)`: 0 the problem, k the student's k-th read line |
| `components/PracticePad.tsx` | `anchors` per shown hint; `termsAt(k)`; the problem wraps `termsAt(0)`, each read line `termsAt(k)`; `litAnchor` → `ReadAs.highlight`; the card's "your line k" |
| `components/ReadAs.tsx` | `decorate(tex, i)` rewrites a line before typesetting; `highlight` tints one line |
| `components/HintCard.tsx` | `note` beside the eyebrow; focus ring on the toggle |
| `data/practice.ts` | Fractions hints 3–5: fragments written against lines 3, 4, 5 |
| `lib/hint.test.ts` | `hintAnchor`; fragments locate in the TeX each hint points at; spacing unchanged in a lit read line; per-line lit markup |

## How it connects

```
   hint.at ─┬─ [0] / absent / not yet written ─► hintAnchor = 0 ─► the problem statement
            └─ [k…], line k written ─────────► hintAnchor = k ─► read-as line k

   PracticePad
     anchors[i] = hintAnchor(hints[i], lines.length)
     termsAt(k) = terms of the shown hints anchored at k
        │
        ├─► <M tex={termTex(p.tex, termsAt(0), litTerm)} />            problem: only the hints about it
        │
        └─► <ReadAs decorate={(tex, i) => termTex(tex, termsAt(i+1), litTerm)} highlight={litAnchor-1} />
               ┌ READ AS ─────────────────────┐
               │ x/4 + x/2 = 9/2 + 6          │  line 1
               │ x/4 + x/2 = 21/2             │  line 2   ◄── Hint 2's "common denominator" lights the 4 and 2 here
               │ x/4 + 2x/4 = 21/2            │  line 3   ◄── Hint 3's "numerators" lights x and 2x here
               │ ▒ 3x/[4] = 21/2 ▒            │  line 4   ◄── Hint 4's "4" lit: the line tinted, the 4 boxed
               └──────────────────────────────┘
     HintCard  "HINT 2  your line 4"  ← note = anchors[i] > 0 ? `your line ${anchors[i]}` : undefined

   .katex .hint-term  inline-block ─► the lit box is as tall as the fragment:  [ 9 ]
                                                                               [ — ]
                                                                               [ 2 ]
```

## Verified by

vitest (327 tests, five new); eslint and tsc clean; `next build`; headless Chrome on the built app
(port 3134, CDP 9392): on a blank pad, hovering "other side" lights one fragment in the problem, 43px
tall (the fraction), where it was a digit's height; four strokes read, hint asked: the card's heading
reads "Hint 2 your line 4"; hovering "4" lights one fragment, in the read-as column, and that line
carries `data-highlight`; hovering "other side" lights 21/2 there; the problem statement wraps only
the opening hint's four pieces. Screenshots of the lit fraction and the tinted line 4.
