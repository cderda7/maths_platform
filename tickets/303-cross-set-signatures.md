# 303: Error signatures across sets, and pattern wordings that say what is wrong

**What to build:** on Holistic Assessment, every student's recurring kind of error shows as a signature that runs across topics and categories. Sam's seven sign patterns on four sets read as one "Minus signs wrong". Pattern wordings, tags, review reasons and summaries say what is wrong, never why the student is supposed to have gone wrong.

**Blocked by:** 299 (misconception taxonomy), merged.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

From an outside review the user endorsed (2026-09-15): Sam's profile lists sign errors in brackets, a surd product, a factor pair, turning points and completing the square. They sit in different books, weeks and chapters, so each reads as a slip. A topic-binned mastery model can't see that they are one error, but the platform can, from the ink. The user: "let's implement the cross-topic idea for all students."

Also (same day): "avoid speculating about what the student did -- not 'guessed' or 'rushed', just a pure diagnostic. say 'wrong' or 'incorrect' -- describe the issue without trying to diagnose."

## Decisions (with the user, 2026-09-15)

- **Families over the misconception taxonomy (ticket 299).** Each story pattern names the misconception its wrong lines show, and families group the misconceptions. The user approved the family names: Minus signs wrong, Factor pairs wrong, Not undone, Squared brackets wrong, Terms missed, Fractions upside down, Halves wrong, Turning point height wrong, Steps missing, Answer sentence wrong, Null factor law wrong. Covering every taxonomy id needed three more: Surds wrong, Fraction parts lost, Roots wrong.
- **Threshold:** a family on 2 or more sets.
- **Page:** a banner under the name. After measuring, the user chose compact chips over full rows, which scrolled the page on a laptop. Pressing a chip rings the cells it covers and marks its patterns, and its description opens as a flyout.
- **Tiles:** "Across sets" is the first tag group.
- **Wordings:** no diagnosis anywhere: pattern wordings, tags, review reasons and summaries.

## Acceptance

- [x] Every story pattern names a misconception its student's own wrong lines show on its problems (communication patterns none); a test holds it to the ink
- [x] Every misconception is in exactly one family; names say what is wrong
- [x] Signatures computed from the patterns the page surfaces: 2+ sets; Sam "Minus signs wrong" PS2–PS5 across algebra, graphing and New skills; Priya none
- [x] Holistic page: chip line under the summary; press rings cells and marks patterns, flyout moves nothing; same chip, Escape or a press elsewhere clears; no page scroll at 1280×800 and 1440×900, fresh and after PS6
- [x] Tiles: "Across sets" first; a pattern listed once
- [x] No "guessed / not checked / copied / tried / expanded back" in any summary, pattern, tag or review reason (test)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through of every chip

## Solution

See `architecture/303-cross-set-signatures.md`. Verification: vitest 1048; eslint, tsc, next build; check:laptop 74; `click303.mjs` 1880/1880. It covers all 20 pages, fresh and after PS6, at 1280×800 and 1440×900. Every chip is pressed with real mouse events, and the run checks: pressed alone; flyout with description, sets and pattern count, on screen and over no chip; at least two ringed result cells; at least one marked pattern; grid unmoved; no scroll. The same chip again, Escape, or a press elsewhere clears it. Sam has exactly "Minus signs wrong" and Priya has none. No judgemental or diagnosing word on any page, chip, flyout or tile. On tiles, "Across sets" comes first, no multi-set tag sits under a category, and nothing overflows.
