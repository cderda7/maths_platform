# 205: A warm-up skill the student leaves turns dark, and the set follows the last one

**What to build:** On the warm-up, a skill chip turns dark blue once the student has been on that skill and moved away, finished or not, whether they left by "Next skill" or by tapping another chip. Once every skill has been opened, the button on the skill on screen reads "On to the set" and goes to the set; it never loops the student back through skills they left unfinished.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "right now, when a student clicks on 'next skill' in warm up, if they haven't worked through that problem all the way, the problem tag remains light blue. change this so that it turns dark blue after student has done new skill. also make it so that once they've gone through all skill pages, clicking 'next skill' to move between them, after the last skill, the student gets the 'on to the set' button instead of a 'next skill' button to loop them back through unfinished skills".

Reproduced on an unmodified production build: pressing "Next skill" straight through already darkened every chip, but tapping the third chip from the first left "fractions" light (a chip tap never counted the skill left), and "Next skill" from the last skill ("non-monic factorising") read "Next skill →" and looped back to fractions and then factorising before the set.

## Solution

- `lib/session.ts`: `leaveSkill(s)` adds the skill on screen to `warmup.done`. Both ways off a skill use it: `warmup/skill-done` ("Next skill") and `warmup/goto` (a chip tap). `done` now means "been on and left", not "worked through"; its doc comment says so. The persisted shape is unchanged, so saved sessions load as before.
- "Next skill" still goes to the nearest skill never opened, past the current one and wrapping round, so a skill jumped over by a chip tap is still offered. Since every skill left is done, the wrap never returns to an opened skill, and once every skill has been opened the button is "On to the set" (and "Skip to the set" hides, as before).
- `app/student/screens/PracticeScreen.tsx`: doc comments only; the chip colour and button label already read `done`.

## Acceptance

- [x] "Next skill" through all four skills with nothing written: each chip dark once reached, the fourth reads "On to the set" and lands on the set
- [x] The screenshot's route: tap chip 3 from chip 1 (fractions dark, factorising light), "Next skill" to the last skill ("Next skill →", one skill never opened), "Next skill" wraps to factorising only, every chip dark, "On to the set", no "Skip to the set", lands on the set
- [x] Every chip tapped (4, 3, 2, 1): all dark, "On to the set", still so after a reload
- [x] vitest 603, eslint, tsc, next build; click-through `click205.mjs` (43 checks)
