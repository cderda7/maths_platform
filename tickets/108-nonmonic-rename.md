# 108: The non-monic skill is "Non-monic factorisation"

**What to build:** The skill the taxonomy calls "Non-monic trinomials" is named "Non-monic factorisation" everywhere its full name shows: the "Which skill?" picker under "I need help", the confidence and peer screens, the warm-up chat's "Let's start with ___." and the help chat's prompt.

**Blocked by:** 26 (the taxonomy).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the "Which skill?" picker listing "Non-monic trinomials", "Null factor law", "Fractions": "rename this skill non-monic factorisation".

## Solution

- `data/taxonomy.ts`: the `algebra.expand-factor.nonmonic` leaf's `name` is "Non-monic factorisation". Its `short` ("non-monic factorising", the chip and sentence form) and its description are unchanged, as is the id, so nothing tagged with it moves.

## Acceptance

- [x] Q2's "I need help" picker lists "Non-monic factorisation", "Null factor law", "Fractions" (headless, `picker.mjs`)
- [x] vitest (340), eslint, tsc, `next build`; architecture note, root docs, future features
