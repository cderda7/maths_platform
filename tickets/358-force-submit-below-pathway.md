# 358: Force submit and the count move below the current stage

**What to build:** Reverse ticket 345's stack: it now hangs below the current stage pill instead of above it, and its internal order flips — the pill on top, force submit under it, "n/total done" at the bottom.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 345 put the count and force submit in the dead 48 px of padding above the back line, over the current pill, so the strip below never moved. The user (2026-09-16) found that spot easy to miss — "it gets lost in the header" — and asked for the stack moved below the pill instead, in the order pill, force submit, count, so force submit reads as the pill's own control and sits where a teacher scanning down the page actually looks.

Below the pill there is no equivalent dead space to hide in — the roster head (Class View) and Mistakes sit right under the back line. So unlike 345, this stack takes real layout room: the back line grows by the stack's height while the class is live and the current stage has a count, and everything below it moves down by that amount. `BackLine.tsx` already publishes its own rendered height as `--backline-h` off a `ResizeObserver` (ticket 356) specifically so the roster head and other stuck elements can reposition when this row's height changes — this ticket is the first thing to actually make that height vary, so it doubles as the first real test of that mechanism.

## Acceptance

- [x] On the live set's Class View and Mistakes, the current (or finished) stage pill carries a stack centred under it, in flow: the pill, then force submit, then "n/total done". Nothing sits beside the pill except end lesson
- [x] The stack takes real layout room: the back line's rendered height grows while it is shown, and the roster head (Class View, `sticky top-0` off `--backline-h`) and the page content below move down to match, at 1280×800 and 1440×900
- [x] Every other pill in the pathway keeps the same top edge as the current pill's own pill — the stack under the current stage does not shift its neighbours up, down, or sideways
- [x] The stack's height never changes while shown: force submit's countdown ("handing in · 0:47 · Cancel") takes the button's slot without moving the count under it, and without the row height itself jumping
- [x] Class review has no count and no force submit, so its pill stands alone with nothing under it; once the lesson is over nothing is under any pill; a finished set has no strip at all
- [x] End lesson is unchanged: it stays beside the current pill on a pathway whose last stage is not class review, and while its minute runs its countdown still takes the place of force submit and the count
- [x] The decision dot (ticket 335) stays on the pill's bottom-right corner (ticket 345); not moved back to the top-right, since nothing new stands there — flagged as a judgment call, not asked for
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900 against a production build: both tabs, every stage of the pathway, force submit pressed and cancelled, a reload, no sideways scroll, roster head lands directly under the grown back line
- [x] Ticket docs: `architecture/358.md`, ARCHITECTURE, DECISION_LOG, README

## Notes

- `app/teacher/BackLine.tsx` builds the strip's notes; `components/StagePill.tsx` lays them out (`above` → `below`); `app/teacher/ForceSubmit.tsx` and `app/teacher/EndLesson.tsx` are the two pills.
- This reverses the specific layout mechanism ticket 345 chose (absolute, over the dead padding) but keeps its other decisions: narrower stack-sized force submit, the fixed-height pending slot, end lesson beside the pill.
