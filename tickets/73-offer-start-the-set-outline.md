# 73: Offer callout: "Start the set" in the accent outline

**What to build:** In the warm-up offer callout on the confidence screen, "Start the set" keeps its white fill but its border and text go the accent indigo, so it reads a pinch stronger than a plain secondary button while "Warm up" stays the one filled button.

**Blocked by:** 72 (the callout).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user liked "Start the set" being the quieter of the two, but the grey secondary outline read as almost inert next to the filled "Warm up". It should still be clearly a live choice.

## Solution

A new `outline` variant on `Button` (white fill, accent border, accent-deep text, accent-soft on hover) used by the callout's second button. Nothing else on the screen changes.

## Acceptance

- [x] "Start the set" has an accent border and accent text on a white fill; "Warm up" unchanged
- [x] eslint, tsc, `next build`, browser check; architecture note and root docs
