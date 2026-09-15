# 300: The named kind of factorising is practised, and every practice skill has one follow-up

**What to build:** a student who names non-monic practises non-monic. Every practice skill behaves like monic's: one problem, its worked example, then exactly one follow-up.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

An outside review of the lesson phases, on "I need help": "I said my problem was a coefficient in front of the x², and got a monic example. And a single practice item teaches nothing … This should be five minimally different items, not one."

The user (2026-09-15) scoped it down: "suddenly subskill review has become its own mini lesson. My main concern is that identifying 'non-monic' as the issue should lead to 'non-monic' practice … add the 'one item teaches nothing' concern to F_F. But for right now, I just want consistent behaviour." The inconsistency they named: only monic had a second problem after its worked example, and the other fourteen skills had none. Asked how to make them consistent, they chose "every skill gets one", opening after the worked example like monic's.

Reproduced in the browser before any change (`repro300.mjs`):

| Route | What the student names | Practised (before) |
| --- | --- | --- |
| Ticks factorising, chat: "the coefficient in front of the x² throws me" | non-monic | monic first (`x² + 7x + 12`) |
| Ticks factorising, chat: "the non-monic ones" | non-monic | monic first |
| Ticks factorising + non-monic | non-monic | non-monic |
| Q2 → I need help → Non-monic factorisation | non-monic | non-monic |

Ticking factorising with neither kind counts as both kinds. The chat's answers could add skills but never narrow them, so easiest-first put monic ahead. The coefficient wording read as nothing.

## Acceptance

- [x] Factorising ticked as both kinds narrows to the one kind the chat answers name in words; answers that name both, neither or only a question leave both; a kind ticked on its own is never dropped
- [x] "coefficient / number in front of (on, before) the x²", "leading coefficient" and "a isn't 1" read as non-monic, also alongside "factorise"
- [x] Every one of the 15 practice skills has exactly one follow-up (`<id>-2`) on the same leaf: the same working with one thing changed, a hint for every point, the same choice of ways in when the first has one; a test holds the bank to it
- [x] The follow-up opens after the worked example in the warm-up and in the mid-set practice alike; its own worked example ends on the screen's own button
- [x] The hint-box sweep walks every follow-up too (`scripts/warmup-leaves.json` holds both line counts)
- [x] The sketch's closing line fits its column (it scrolled sideways in both worked-example columns, the first problem's too)
- [x] "One item teaches nothing" recorded in FUTURE_FEATURES (the existing entry updated) with this ticket's deferred ideas
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900

## Solution

`focusLeaves` in `lib/warmup.ts` reads which factorising kinds the student's words name. When the ticks hold both kinds and the words name exactly one, the other is left out of the seed. A question the student mentions can still add it. `NONMONIC_SAID` holds the non-monic phrasings and keeps plain "factor" from meaning both kinds when one of them is said. `data/practice.ts` gains fourteen follow-ups:

- non-monic `3x² − 10x + 8`
- expand `(x + 3)(x − 5)`
- linear `x(x − 4) = 12`
- fractions `x/10 + x/5 − 4 = 1/2`
- null factor law `(x + 4)(x − 7) = 0`
- discriminant `x² + 6x + 5 = 0` (two roots)
- turning point `y = x² − 6x + 5`
- show that `x² + 10x + 25 = 0`
- conclusions `Δ = 12`
- sketch `y = (x + 1)(x − 3)`
- evaluate `f(−3)` for `2x² + x − 5`
- worded `h = 30t − 5t²`
- zeros `x² − 25`
- binomial `(x − 3)²`

The sketch's last step reads "opens up, min at (2, −1)" (and (1, −4)). The intercepts are already lines above it.

Verification: vitest 1032, eslint, tsc, next build, check:laptop 74, sweep:hint-boxes 263/263 (all 30 problems, every line, every hint word). `click300.mjs` 250/250: the warm-up routes above now give non-monic, monic when monic is named and both when neither is. For all 15 skills at both sizes, the worked example leads only to "Try one more →", the follow-up opens beside it as its own problem headed One more and not marked, nothing overflows, there are no difficulty tags, and the follow-up's worked example ends on Next skill or On to the set. Over the set: Q2 → non-monic → its follow-up is the non-monic follow-up → Back to Q2.

Deferred (FUTURE_FEATURES, "Practice follow-ups and the named kind"): the mid-set nudge's most-basic-slip rule, the chat asking about a dropped kind, the help chat unable to switch problem, regex skill words, one fixed follow-up per skill.
