# 349: The warm-up's way-on buttons stay in view; "Next skill" checks the warm-up is finished

**What to build:** On the warm-up's worked-example and completion steps, "Your turn →" and "On your own →" are pinned to the corner of the middle column instead of sitting at the end of scrollable content, so a long worked example (fractions: 7 steps) never hides them behind a scroll. "Next skill →" is greyed out until the skill's own follow-up (the third step, alone on the pad) is finished; a press before then asks "Are you sure you'd like to move on from {skill}? You haven't finished the whole warm-up." rather than silently leaving.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson (2026-09-16), from a screenshot of the fractions warm-up: the worked example's seven steps run past the fold, so "Your turn" sits below the last step and needs a scroll to reach — on first landing on the step, a student sees the example but no way on. Separately: "Next skill" was always enabled, so a student could jump to the next skill (or the set) mid-way through a step without finishing the current one's three parts, and nothing said so.

Carson also asked, mid-ticket, for "Your turn" and "On your own" to stay unconfirmed — a press always moves straight on — distinct from "Next skill", which is the one control checked.

## Acceptance

- [x] On the worked-example step, "Your turn →" is pinned to the bottom-right corner of the middle column once the example has been shown in full; it never moves when the example's own content is scrolled, and needs no scroll to reach
- [x] On the completion step, "On your own →" is pinned to the bottom-right corner of the pad's column once every blank is filled in, not at the end of the (also scrollable) working list on the right
- [x] Both buttons still act at once, unconfirmed: a press moves straight to the next step
- [x] "Next skill →" (and "On to the set" on the last skill) reads greyed out until the current skill's own follow-up, alone on the pad, has every line written; a press before then does not leave — it raises a corner confirm, "Are you sure you'd like to move on from {skill}? You haven't finished the whole warm-up.", with "Keep going" and the same label to confirm
- [x] The confirm never goes stale: switching skill (a chip) while it is open drops it, and finishing the alone problem while it is still open closes it without a second press
- [x] A warm-up with no worked/completion split (a practice with no ladder, none in the current bank) is held to the same rule: greyed out until its one pad problem is finished
- [x] vitest, eslint, tsc, next build; a click-through against a production build covering: the pinned button's position unaffected by scrolling the example; both way-on buttons acting with no confirm; "Next skill" disabled, confirmed, cancelled, and finishing the problem while the confirm is still open; a chip switch dropping a stale confirm; the button enabling and acting directly once the problem is done
- [x] Ticket docs: `architecture/349-warmup-pinned-controls.md`, ARCHITECTURE, DECISION_LOG

## Notes

- `app/student/screens/PracticeSteps.tsx`'s `WorkedStep` and `CompletionStep` are shared with `app/student/screens/HelpLadder.tsx` (ticket 312's Q*/Q**/back-to-Q on a set question); `CompletionStep`'s new `next` prop is optional so `HelpLadder`'s call (message-only `done`, its own "Back to Qn" in `footer`) is unaffected.
- `sweep:hint-boxes` was not run: this ticket touches no worked-example/completion layout the sweep measures (it checks hint-term boxes and glyph positions inside the left `aside` and the working column, never the "Your turn"/"On your own"/"Next skill" buttons or their containers).
