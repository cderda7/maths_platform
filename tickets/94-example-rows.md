# 94: Every worked example step is a ruled row, spaced like the problem and the first step

**What to build:** In every worked example card, each step sits under its own grey rule with the same air above and below the rule as there is between the problem and the first step (24px each side at full size, 16px compact). The reveal button keeps the same gap under the last step, with no rule.

**Blocked by:** 93 (the left-justified card).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the fractions example: "i like the spacing betwen the problem & the first line of work. the 1st & 2nd line of work are too smushed. have the same spacing between the 1st & second as you do between problem & 1st. add same grey line as well."

The list had one rule at its top (`border-t` on the `<ol>`, 24px each side) and 20px between steps with nothing between them.

## Solution

- `components/PracticeCard.tsx`: the `<ol>` loses its rule and spacing; every step `<li>` carries `mt-6 border-t border-line pt-6` (`mt-4 … pt-4` compact), so the first step's rule is the one that was there and each later step gets the same. The button's `<li>` has the top margin only.

## Acceptance

- [x] Fractions and factorising examples: every step measures 24px from the glyphs above to its rule and 25px (24 plus the 1px rule) from the rule to its own glyphs, the button 24px under the last step; compact card 16 and 17
- [x] Before the first step is shown, the button sits 24px under the problem
- [x] vitest (337), eslint, `next build`, headless browser check; architecture note, root docs, future features
