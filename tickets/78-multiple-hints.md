# 78: A problem can carry several hints, given one per ask; the fractions warm-up teaches like terms first

**What to build:** A practice problem has an ordered list of hints instead of one. "I need help" → "hint" shows the first under the problem; the menu then reads "another hint · Show 2 of 2 →" and adds the second beneath the first; when none are left the row is greyed "All shown". The fractions warm-up gets two: first "Get the like terms together: move the 6 across to the other side, away from the x terms." (move, never "add"), then "To combine the x terms they need a common denominator, but only one those two share. It doesn't have to work for the whole line." Its worked example follows the same path: move the 6, combine the numbers, a common denominator for the two x terms only, combine, clear, divide.

**Blocked by:** 77 (scoped fragments, which the second hint uses), 69 (the help menu).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on the "multiply every term to clear the denominators" hint: "not good advice. change the hint to moving the 6 away from the xs -- combine like terms. also i want to set up multiple hints. like rn we only offer 1. i'd like for this one, for the first to be about moving 6 -- & not telling the student to add 6 to both sides, but encouraging them to move the 6 to the other side to get like terms together (so don't tell them to add -- just to move the 6). then, second hint should be about finding common denominator. & should find some way of emphasizing that common denominator doesn't need to be for whole problem, just for like terms that you want to combine".

## Solution

- `data/types.ts`: `Hint { text, terms? }`; `PracticeProblem.hints: Hint[]` replaces `hint` + `hintTerms`. Every fixture migrated (one hint each, terms moved inside).
- `lib/session.ts`: a run's `hinted` is a count per problem id, not a list of ids; `run/hint` shows the next hint and is a no-op at the last. `hydrateSession` turns a stored list of ids into one hint shown each.
- `components/PracticePad.tsx`: the hints shown so far stack under the problem ("Hint 1", "Hint 2"; plain "Hint" when the problem has one); the problem wraps the terms of every shown hint together, so lighting never moves the layout. The menu row is "hint" / "another hint" with "Show n of m →", and "All shown" when spent.
- `components/HintCard.tsx`: takes one `Hint` and a label; the lit term is matched by identity so the same phrase in two hints lights only the one hovered.
- `lib/helpChat.ts`: the tutor's brief lists the hints in order.
- `data/practice.ts`: the fractions problem's new steps, `why`, and two hints; the second's "common denominator" lights the 4 and the 2 under the x's, via scoped fragments.
- Tests: session (count, stop at last, hydration), hint (both hints' terms together, first alone, lit markup per term, the wording rules), warm-up bank, help chat brief.

## Acceptance

- [x] Fresh problem: menu row "hint · Show →"; after one: "another hint · Show 2 of 2 →" and the first card under the problem; after two: both cards, row "another hint · All shown" disabled
- [x] Hint 1 says move, not add; hovering "6", "other side", "x terms" lights those pieces. Hint 2 names a common denominator for the two x terms only; hovering it lights the 4 and the 2 under the x's
- [x] The maths block's box is unchanged after the second hint's terms are wrapped
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
