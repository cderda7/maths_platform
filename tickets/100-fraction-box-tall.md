# 100: A lit box around a whole fraction has more air above and below

**What to build:** When a hint word lights a whole fraction (the x/4 and x/2 of "x terms", the 9/2 of "other side"), the box extends further above the numerator and below the denominator than it does around a digit, so the glyphs do not touch its edges. Nothing else changes: side air as before, no movement.

**Blocked by:** 98 (the per-axis box).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with the fractions warm-up's first hint and "x terms" lit: "extend these fractions a bit vertically." then "like the box".

Ticket 98's default air is 0.08em above and below. Around a digit that looks right because the digit's cell (its line box) already has air of its own above and below the ink; a fraction's box is exactly its glyphs, the numerator's top to the denominator's bottom, so the same padding left the x and the 4 touching the box's edges.

## Solution

- `lib/hint.ts`: a fragment that is itself a fraction (`isFraction`: it starts with `\frac`, `\dfrac` or `\tfrac`) carries `hint-term-tall`.
- `app/globals.css`: `.katex .hint-term-tall` padding `0.2em` above and below, taken back with margin, so the layout is unchanged.
- `lib/hint.test.ts`: the class for `\dfrac` and `\tfrac` fragments; every wrapped whole fraction in the warm-up expectations.

## Acceptance

- [x] Fractions warm-up, "x terms" lit: the two boxes reach 0.2em above the x and below the 4 and 2; "other side" lit on line 4: the 21/2 box likewise
- [x] The sweep of every warm-up, line and hint word: no overlaps, no glyph moves
- [x] vitest (338), eslint, tsc, `next build`, headless browser sweep; architecture note, root docs, future features
