# 30: Hint words that light the problem

**What to build:** Every practice hint that names a part of its problem ("constant", "middle coefficient", "a", "b", "c", "ac", "factors", "one side") shows that word in light blue as a signal that it points at something; hovering it turns the word dark blue and lights the matching part of the problem's expression in the same dark blue, and moving away restores both. The rule holds wherever a practice problem is worked on the pad, the warm-up and the mid-set "on its own" practice, and never for a problem in the set.

**Blocked by:** 27 (warm-up on the pad), 28 (warm-up chooser), 29 (the shared practice pad).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

A hint that says "multiply to the constant" assumes the student knows which number the constant is. The ones who need the hint most are exactly the ones who may not. The word should point: a resting colour that says "this is a thing you can look at", and on hover, the number itself lights up. With "a", "b" and "c" the pointing matters even more, since the whole move is reading them off.

## Solution

`PracticeProblem` gains optional `hintTerms`: pairs of a phrase in the hint and the TeX fragments of the problem to light. `lib/hint.ts` splits the hint into runs and terms (whole-word, every occurrence, longest phrase first) and wraps the fragments in KaTeX `\htmlClass` groups, always, so lighting one changes colour and never layout; a fragment inside a longer one nests ("10" inside "10x"), and a fragment is only found as a whole token (not the superscript 2 in x²). `components/HintCard` renders the hint with the linked words and reports the hovered term; `PracticePad` lights its expression with `termTex`, so the warm-up and the mid-set practice get it from one place. Fourteen practices carry terms.

## User Stories

1. As a student, I want words like "constant" to look different in the hint, so that I know they point at something.
2. As a student, I want hovering "constant" to light the 12 in the problem, so that I see which number the hint means.
3. As a student, I want the lighting to go away when I move off the word, so that the problem looks normal again.
4. As a student, I want "a", "b", "c" and "ac" to light their numbers, so that reading them off is shown, not described.
5. As a student, I want the same links in the "on its own" practice mid-set, so that help works the same way everywhere it is offered.
6. As a student, I want a problem in the set never to carry these, so that the set stays the set.

## Acceptance

- [x] `HintTerm { phrase, tex[] }` on `PracticeProblem.hintTerms`; `lib/hint.ts` with `hintSegments`, `findFragment`, `termTex`
- [x] `components/HintCard`: resting light blue (standout-soft, standout text, standout-line ring), hovered dark blue (standout, white); phrases never wrap; mouseover / mouseout / focus / blur
- [x] `.hint-term-lit` in `globals.css`: dark blue fill and white glyphs on the lit fragment, no layout change
- [x] Terms on every practice hint that names part of its problem, including a / b / c / ac on the non-monic, the two factors of the null factor law, the nested non-monic middle term, and the signed `- 7x` of the monic follow-up
- [x] `PracticePad` lights its expression and shows `HintCard`; set problems on the working screen untouched
- [x] vitest (segments, whole-word, nesting, token boundaries, KaTeX spacing unchanged for every problem and every lit term, data invariants); tsc, eslint, build clean; CDP hover across four warm-up problems and the mid-set practice
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`
