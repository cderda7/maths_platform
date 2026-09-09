# 30 · Hint words that light the problem

Routes: `/student?stage=practice` (warm-up on the pad, "I need help" → "hint"), `/student?stage=working`
("I need help" → a skill → "Yes" → the "on its own" practice on the pad, "I need help" → "hint").

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `HintTerm { phrase, tex[] }`; `PracticeProblem.hintTerms?` |
| `data/practice.ts` | Terms on every practice hint that names a part of its problem: monic (constant → 12, middle coefficient → 7) and its follow-up (constant → 10, middle term → − 7x), non-monic (a → 3, b → 10, c → 8, ac → 3 and 8, middle term → 10x), expand (first bracket, second), linear and fractions (one side, other side), null factor law (factors → both brackets), discriminant (b → 2, ac → 5), conclusions (number → −11), sketch (intercepts → both brackets), evaluate (value → −2), worded (height → h), zeros (rule → x² − 9), binomial (first term → x, last term → 5) |
| `lib/hint.ts` (+ test) | `hintSegments(hint, terms)`: runs and terms, whole-word (letters on neither side), every occurrence, longest phrase first, case-insensitive with the hint's capitalisation kept. `findFragment(tex, f)`: first occurrence that is a whole token (not after `^`/`_`, not inside a number or a `\command`). `termTex(tex, terms, lit)`: every fragment wrapped in `\htmlClass{hint-term}`, the lit term's in `hint-term-lit` too; a fragment inside a longer one nests. KaTeX gives the group no spacing, so the typeset layout is identical lit or not (a test compares the spacing of every problem with every term lit against the plain expression) |
| `components/HintCard.tsx` | The hint card: `Card tone="soft"`, "Hint" eyebrow, the segments; a term is a `span` (`data-hint-term`, `tabIndex`, `whitespace-nowrap`) light blue at rest (standout-soft, standout text, standout-line ring) and dark blue while hovered or focused (standout, white); `onLit(term | null)` on mouseover / mouseout / focus / blur |
| `app/globals.css` | `.katex .hint-term` (transition), `.katex .hint-term-lit` (standout fill, white glyphs, 2 px box-shadow so nothing moves) |
| `components/PracticePad.tsx` | `lit` state; the expression is `termTex(p.tex, p.hintTerms, litTerm)`; `HintCard` replaces the plain hint card once the hint was asked for. Both runs (warm-up, mid-set overlay) inherit it; the worked-example card and the set problem are untouched |

## How it connects

```
 data/practice.ts  PracticeProblem { tex, hint, hintTerms?: [{ phrase, tex[] }] }
          │
          ▼
 lib/hint.ts (pure)
   hintSegments(hint, terms) ─▶ [ run | { text, term } … ]        findFragment(tex, f) ─▶ whole-token index
   termTex(tex, terms, lit)  ─▶ "x^2 + \htmlClass{hint-term}{7}x + \htmlClass{hint-term hint-term-lit}{12} = 0"
          │                      (every fragment wrapped, the lit term's fragments classed; nested when one lies inside another)
          ▼
 components/PracticePad  (warm-up run · overlay run)
   ┌ aside ──────────────────────────────────────────────────────────────┐
   │ <M tex={termTex(p.tex, p.hintTerms, lit)} />   .hint-term-lit → dark blue 12 │
   │ HintCard ── hover / focus a word ──▶ onLit(term) ──▶ lit state (local)     │
   │   [constant] [middle coefficient]   light blue at rest, dark blue while lit │
   └────────────────────────────────────────────────────────────────────┘
 WorkingScreen's set problem              plain <M tex={problem.tex} />, never wrapped
```

## Verified by

vitest (161 tests): segments in order; whole words ("b" in "add to b", not "by"; "b" before ²);
every occurrence; longest phrase; missing phrases; nested `10` in `10x` lit either way; two
fragments lit for one word; token boundaries (`2` in `x^2 + 2x` is the coefficient, `1` not inside
`10`, `a` not inside `\alpha`, a `\dfrac` fragment); KaTeX spacing identical for every practice
with every term lit; every phrase found whole in its hint and every fragment found in its TeX.
`tsc --noEmit`, `eslint`, `next build`. CDP click-through on the built app: chooser picks Q1 and
Q2 → fractions, monic, null factor law, non-monic on the pad; on each, the hint opens from the
help menu, every linked word hovered lights the right fragment(s) (the fraction and 12; 12 and 7;
the two brackets; 3, 8, both for "ac", 10x and the nested 10) with the expression's box unchanged,
and moving away clears both; the set problem on the working screen has no `hint-term` spans; the
mid-set "on its own" pad opens from "I need help" → Monic trinomials → Yes, its hint links light
12 and 7 the same way.
