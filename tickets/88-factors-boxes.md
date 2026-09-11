# 88: The factorising hints say "factors", and the two lit factor boxes sit clear of each other

**What to build:** Every "bracket(s)" in the factorising warm-up's hints (and its follow-up's) becomes "factor(s)", so the linked word in the null-factor-law hint reads "factors". And when the two factors of a product are lit together in the read-as column, their two boxes no longer overlap: the gap the pad writes between abutting fragments is wide enough for both boxes' padding and rings.

**Blocked by:** 85 (the monic hints), 83 (the lit box's padding).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11, with a screenshot of the read-as column showing `(x + 3)` and `(x + 4)` lit as two boxes that overlapped): "rename brackets as factors. also ensure that the two boxes around each factor don't overlap".

Two abutting fragments were separated by a thin space (`\;`, 0.28em). Each box paints 0.1em of padding plus a 2px ring beyond its fragment, so the two boxes needed about 0.44em between the fragments and had 0.28em: they overlapped by a few pixels.

## Solution

- `data/practice.ts`: the `w-monic` hints at positions 2, 3 and 4, the factorise approach's hint, and the follow-up's hints at positions 2 and 3 say "factor"/"factors" instead of "bracket"/"brackets". The linked phrase in the null-factor-law hint is now `factors`; that hint's second sentence becomes "A product is only zero when one of them is zero" so "factors" appears once and lights once.
- `lib/hint.ts`: `termTex` writes `\kern0.7em` between abutting fragments instead of `\;`. At the read-as size that leaves about 4px of air between the two rings.
- `lib/hint.test.ts`: the abutting-fragments test expects the new gap; the two spacing tests recognise it.

## Acceptance

- [x] The null-factor-law hint reads "The two factors multiply to give 0. A product is only zero when one of them is zero, so set each factor equal to zero on its own.", with "factors" the linked word
- [x] No hint of the factorising warm-up or its follow-up says "bracket"
- [x] Hovering "factors" lights `(x + 3)` and `(x + 4)` as two boxes with visible space between them (CDP: painted extents 1006–1066 and 1070–1130 px)
- [x] vitest, eslint; architecture note, root docs
