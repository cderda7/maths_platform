# 153: Submit sits where START was

**What to build:** On the confidence screen, the Submit button sits in the iPad screen's bottom-right corner, at the exact spot the start screen's START button occupied, so the primary action does not jump between the two screens. The question and the answers keep their centred column.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the confidence screen: "move submit to the bottom right. look at the 'continue' button from the last screen & ensure that it's in the same position on the ipad as in that view, otherwise the jump is random." The start screen's START is the last thing the student tapped; the confidence screen's Submit sat at the right edge of its centred `max-w-3xl` column (x 938 of 1180, 24 px up), so the student's thumb had to travel to a new place for the next tap.

## Solution

- `app/student/screens/ConfidenceScreen.tsx`: the screen takes the start screen's frame (`flex h-full min-h-0 flex-col px-10 pt-6 pb-5`); the eyebrow, the heading and the answers move into a centred `max-w-3xl px-9` column inside it (`data-confidence-column`), so nothing in the column moves (content still starts at x 242 and ends at x 938); the button row spans the screen with `mt-auto … pt-4`, so a `size="lg"` Submit lands on START's rect exactly (right edge 1140, bottom 800, top 753.5). The empty spot left after a not-confident answer is the same button rendered `invisible` (and disabled, aria-hidden, out of the tab order) rather than a fixed-height div, so the row keeps exactly its height; the warm-up offer keeps rising above it.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] On the iPad stage at scale 1, START (start screen) and Submit (confidence screen) have the same right, bottom and top edges: 1140 / 800 / 753.5, i.e. 40 px from the right and 20 px from the bottom
- [x] The heading and every answer row keep their x (242 → 938); the picker ends above the button
- [x] Submit is disabled before an answer and enabled after one, and enabling moves nothing
- [x] After "not confident" + Submit, the empty spot has Submit's exact rect and the offer rises above it with its right edge on the button's, inside the screen
- [x] vitest (427), eslint, tsc, `next build`, click-through (`submit153.mjs`)
