# 345: Force submit and the count stand above the current stage

**What to build:** On the teacher's horizontal pathway strip, "force submit" moves from beside the current stage pill to directly above it, and "n/19 done" moves above force submit. The two stack over the pill in the clear space under the top bar, taking no layout room, so nothing else on the page moves.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 334 put one pathway strip on the back button's line of Class View and Mistakes, with force submit, the count and end lesson in a row to the right of the current pill. The row makes the strip long: on a four-stage pathway the pills, the two notes and three arrows run 504 px across the top of the page, and force submit — the one thing on the strip the teacher presses — reads as one more item in a list rather than as the control for the stage the class is on.

The user (2026-09-16) asked for force submit above the current stage and the count above force submit, and chose to have the stack hang into the space under the top bar so that the back button, the eyebrow, the title and every card below stay at exactly the pixel they are now.

## Acceptance

- [x] On the live set's Class View and Mistakes, the current (or finished) stage pill carries a two-line stack centred above it: "n/total done" on top, force submit under it, the pill under that. Nothing sits beside the pill except end lesson
- [x] The stack takes no room in the page: it is laid over the 48 px of padding above the back line. The back button, the strip's pills, the eyebrow, the title and every card below keep the rect they had before this ticket, on both tabs, at 1280 × 800 and 1440 × 900
- [x] The stack's height never changes: force submit's countdown ("handing in · 0:47 · Cancel") takes the button's slot without moving the count above it
- [x] The stack clears the top bar: measured headroom between the header's border and the count
- [x] Class review has no count and no force submit, so its pill stands alone with nothing above it; once the lesson is over nothing is above any pill; a finished set has no strip at all
- [x] End lesson is unchanged: it stays beside the current pill on a pathway whose last stage is not class review, and while its minute runs its countdown still takes the place of force submit and the count (the stack empties)
- [x] The decision dot (ticket 335) still sits on the current pill's top-right corner, under the stack, untouched
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280 × 800 and 1440 × 900 against a production build: both tabs, every stage of the pathway, force submit pressed and cancelled, a reload, no sideways scroll
- [x] Ticket docs: `architecture/345.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README

## Notes

- `app/teacher/BackLine.tsx` builds the strip's notes; `components/StagePill.tsx` lays them out (`beside`); `app/teacher/ForceSubmit.tsx` and `app/teacher/EndLesson.tsx` are the two pills.
- The gap above the back line is `TeacherChrome`'s `pt-12` (48 layout px), and `main` is a scroll container, so anything drawn above that is clipped: 48 px is the whole budget for the stack.
