# 77: Hint terms can name a later occurrence of a fragment; "denominators" lights all three

**What to build:** A hint term's TeX fragments can be scoped: `{ tex: "2", within: "\dfrac{9}{2}" }` means the 2 inside that fraction, however many 2s come before it. On the fractions warm-up, hovering "denominators" lights the 4, the 2 under the first $x$, and the 2 under the 9.

**Blocked by:** 75 (the problem and its hint).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 75 flagged that hovering "denominators" on $\frac{x}{4} + \frac{x}{2} - 6 = \frac{9}{2}$ lit the 4 and the first 2 only: `termTex` wrapped the first whole occurrence of each fragment string, so there was no way to name the second 2. The user: "actually do this. have denominators highlight all."

## Solution

- `data/types.ts`: `TexFragment = string | { tex: string; within: string }`; `HintTerm.tex` is a `TexFragment[]`. The object form mirrors the `within` the hint's phrase side already has.
- `lib/hint.ts`: `locateFragment` resolves a fragment to a position (the first whole occurrence of `within`, then the first whole occurrence of `tex` inside it); `termTex` resolves every fragment to a `[at, end)` span first and `wrap` works on spans, nesting by position. Two terms naming the same span share one box, lit when either is lit. The lit set is keyed by span, not start, so "10" lit inside "10x" does not light the outer box.
- `data/practice.ts`: "denominators" lists all three denominators, each scoped to its fraction.
- `lib/hint.test.ts`: the fractions expectation now includes the lit 2 under the 9; `locateFragment` tests (bare, scoped, later occurrence, absent scope, absent inner) and a shared-box test.

## Acceptance

- [x] Hovering "denominators" lights the 4, the 2 under x, and the 2 under 9; "every term" still lights the four terms and no denominator
- [x] Every existing hint-term test unchanged and passing; layout unchanged while lit (the spacing test covers every warm-up)
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log
