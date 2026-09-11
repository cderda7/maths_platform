# 83 · A lit hint word lights only the line its hint points at; a lit box has a touch more room

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/PracticePad.tsx` | `litAt(k)`: the lit term reaches only the piece at `litAnchor`; the problem and other lines get `undefined` |
| `app/globals.css` | `.katex .hint-term` padding `0.12em 0.1em`, margin `-0.12em -0.1em` |

## How it connects

```
   hover "x terms" in Hint 2 (anchor 3)
        │  litTerm, litAnchor = 3
        ▼
   termTex(p.tex,   termsAt(0), litAt(0) = undefined)   problem: boxes, nothing lit
   termTex(line 1,  termsAt(1), litAt(1) = undefined)
   termTex(line 2,  termsAt(2), litAt(2) = undefined)   ← was litTerm: x/4 here shares a span with Hint 1's x/4 and lit too
   termTex(line 3,  termsAt(3), litAt(3) = litTerm)     ← x/4 and 2x/4 lit, line tinted

   .hint-term  padding 0.12em 0.1em / margin −0.12em −0.1em  →  the box grows 0.12em up and down, the line box does not
```

## Verified by

vitest (327 tests); eslint and tsc clean; `next build`; headless Chrome on the built app (port 3134,
CDP 9392): two hints given at lines 2 and 3; hovering hint 2's "x terms" lights two fragments, both in
line 3, none in line 2; the three read-as line boxes are 56px before and while lit; screenshot.
