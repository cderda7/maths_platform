# 98: The lit hint box fits its surroundings per axis; the maths keeps its own spacing everywhere

**What to build:** No warm-up problem or read-as line has any spacing the hint machinery added: `(x - 2)(x + 5) = 0` is typeset with the brackets flush, as KaTeX sets it, hint open or not. The lit box has a little air at the sides and above and below, except on an axis where something is typeset flush against the fragment: no side air for the 7 of 7x, a superscript or the other factor of a product; no air above or below for a numerator or a denominator, so the box never crosses the fraction bar. Two lit boxes that touch are parted by a hairline. Nothing moves when a box appears.

**Blocked by:** 97 (the box's side padding), 88 (which it reverses), 83 (the box's padding).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), first with the null factor law warm-up at rest showing a wide gap between the two factors: "bruh! yous a liar. you've way spaced out the two factors here … fix this factor concern & ensure that your earlier fix didn't corrupt any other parts of the warm up". Then, with a read-as line where the lit denominators' boxes were tall and narrow and ran up into the fraction bar: "in this view (when it's not a concern of bleeding into variable), i want the box to be wider & shorter. again wack that it's doing overlap with an unrelated part of the equation (in this case, the horizontal dividing line of the fraction). revise that throughout the project, as well please. it's just like we're going back & forth & making rules that are too general that then fuck something else up".

Ticket 88 wrote `\kern0.7em` between two wrapped fragments that abut so their padded boxes had air between them; ticket 97 removed every box's side padding for the sake of 7x and left the kern. Both were one rule for every box. The box has to fit what is beside it, per side.

## Solution

- `lib/hint.ts`: `wrap` writes no gap of any kind; `termTex` never changes the TeX's spacing. Each wrapped fragment's classes say how its box fits: `hint-term-tight-x` when a glyph, a superscript or subscript, or another wrapped fragment is typeset flush against it on either side (`flushBefore`, `flushAfter`, abutting spans); `hint-term-tight-y` when it is the whole numerator or denominator of a `\frac`, `\dfrac` or `\tfrac` (`inFraction`); `hint-term-abut` on the second of two abutting fragments. The conjured 1 is tight at the sides.
- `app/globals.css`: `.hint-term` padding `0.08em 0.14em` (wider and shorter than the `0.2em 0` of ticket 97), taken back with margin; `.hint-term-tight-x` zeroes the sides, `.hint-term-tight-y` the top and bottom; `.hint-term-abut` clips 1px off the box's left so two touching lit boxes read as two.
- `lib/hint.test.ts`: the classes per case (flush glyph, superscript, bracket after a digit, operator, command name, numerator, denominator, nested inside a wrapped fraction); the factors with no kern; the two layout sweeps (every warm-up problem and read line, at rest and with every term lit) with no exemptions.

## Acceptance

- [x] Null factor law: `(x - 2)(x + 5) = 0` has identical glyph positions plain, wrapped and lit; the two lit boxes touch with a hairline between
- [x] Fractions read-as lines: the lit 4 and 2 (denominators), the x and 2x (numerators) have boxes wider than before that stop short of the fraction bar; the whole-fraction boxes (`x/4`, `x/2`) keep their air
- [x] Monic: the 12's box wider and shorter; the 7's tight at the sides beside the x
- [x] Sweep of every warm-up on offer (fractions, monic, null factor law, non-monic), every line of the working written one at a time, every hint offered at each point, every linked word hovered: no lit box in the problem or the read-as column intersects any glyph or fraction bar outside it, and no glyph moves on wrapping or lighting
- [x] vitest (338), eslint, tsc, `next build`, headless browser sweep; architecture note, root docs, decision log, future features
