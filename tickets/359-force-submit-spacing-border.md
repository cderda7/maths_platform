# 359: The below-the-pill stack gets more air, force submit gets a purple border

**What to build:** Space the pill/force submit/count stack (ticket 358) out a bit more — it read as too bunched up once it moved into the clear. Add a purple border to the force submit button specifically (not end lesson, which keeps its own light-blue border).

**Blocked by:** 358.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, after seeing ticket 358 live (2026-09-16): "have them a bit more spaced out. no longer need them so bunched up. also add purple border to the force submit button." The pill-to-button gap (`pt-1`, 4px) and button-to-count gap (`gap-[2px]`, 2px) were sized for ticket 345's over-the-pill stack, where tightness read as "one unit" layered on the pill. Standing in the clear below it since 358, that same tightness just reads as cramped.

## Acceptance

- [x] The pill→force submit and force submit→count gaps are visibly larger than ticket 358's (`pt-2`, `gap-1.5`)
- [x] The spacer that reserves the stack's real layout room (`BELOW_HEIGHT`) grows by exactly the same amount, so the back line's height and everything under it still match the stack's real rendered height — no gap, no overlap
- [x] Force submit's plain-state button has a purple border (`border-accent`, `#5b4ae8`, the same purple used for the current pill's ring and the decision dot)
- [x] End lesson's own border is untouched (`border-standout-line`, still the shared light blue) — the shared `FORCE_PILL` constant carries no border colour any more, each button supplies its own
- [x] Every other pill in the pathway still keeps the same top edge; force submit's pending countdown still doesn't shift any pill sideways (re-verified against a production build with the new spacing)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 against a production build: force submit's border colour, the new spacing, pressed and cancelled, no sideways scroll

## Notes

- `components/StagePill.tsx` (`STACK_BELOW`, `BELOW_HEIGHT`), `app/teacher/ForceSubmit.tsx` (`FORCE_PILL`, the button's own `border-accent`), `app/teacher/EndLesson.tsx` (its own `border-standout-line`).
- No `DECISION_LOG.md` entry: a spacing and colour tweak on top of 358's already-logged decision, not a new tradeoff.
