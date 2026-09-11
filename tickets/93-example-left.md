# 93: The worked example card is left-justified

**What to build:** In every worked example card (the one playing in place of the pad and the compact one beside the follow-up) the problem, each step, a two-case step's boxes and the reveal button all sit against the card's left edge, on one line, instead of being centred.

**Blocked by:** 90 (the card as one column).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the fractions example centred: "have this all be left justified".

## Solution

- `app/globals.css`: `.math-left .katex-display` and `.math-left .katex-display > .katex` set `text-align: left`. KaTeX centres a display block, and the `.katex` block inside it, with its own unlayered rules; a Tailwind utility on the wrapper (layered) would lose to them, so the override is unlayered too, next to the existing `.katex-display { margin: 0 }`.
- `components/PracticeCard.tsx`: the card carries `math-left`; the two-case row and the reveal button drop their `justify-center`.

## Acceptance

- [x] Fractions example: the problem's first glyph, every step's first glyph and the Next step button all measure at x 463 with the card's content edge at 462; factorising likewise, its two boxes at the left; the compact card beside the follow-up at 159 against 158
- [x] vitest (337), eslint, `next build`, headless browser check on the fractions and factorising warm-ups; architecture note, root docs, decision log, future features
