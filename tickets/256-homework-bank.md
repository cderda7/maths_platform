# 256: After the reflection, each problem a student got wrong turns into a similar one and goes into their homework bank

**What to build:** After a student submits their reflection, a new screen shows their skill dots and their Q tiles marked right or wrong. Each tile of a problem they ever got wrong expands to show its question, the question changes live into a similar one (same type, different numbers or set-up), and then it shrinks and flies into a Homework folder. Right tiles stay.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Planning conversation (2026-09-14): nothing from an in-class lesson carries into the next. The homework model (individualised practice) is not being built yet, but the user wants the motivation now: "post student seeing report & submitting reflection, they get an update on 'this problem type will be added to future homework'. i think we could have it move to a next screen that just shows the dot skills & the Q tiles & when they got it right/wrong & an animation where they move to a HW file."

Which problems go: any problem wrong at any point, including ones fixed in review, and it must be clear that it is the problem type, not the same problem. The user then sharpened how that is shown: "question expands, & student sees the question change live — like can see it's similar type, but diff numbers / diff set up." Order agreed: expand, change, then fly.

## Solution

- Student stage after the reflection's submit: the report's skill dots and the Q tiles (OutcomeTiles' look), right and wrong by the first submission.
- Data: one hand-authored similar problem per PS6 problem (`data/`), same skills as the original with different numbers or set-up, its TeX checked in tests with `lib/texEval.ts` (ticket 240's diagnostics are step questions on similar problems and may be a starting point, not a substitute).
- Sequence, one ever-wrong tile at a time in set order: the tile expands in place as an overlay (the grid never reflows) to show the original question; the question changes into the similar one (numbers and terms cross-fading or rolling where they differ, so the shared shape visibly stays); a short line under it names what stays the same (the problem type); the tile shrinks and flies into the Homework folder, whose count ticks up. One headline in the copy rule's style.
- A student with nothing ever wrong (Priya) sees the tiles stay and a line saying nothing was added.
- The homework bank is only this screen's data for now (no homework screens); the student SKIP TO gains the stage.
- `prefers-reduced-motion`: the original and similar question shown side by side, the tiles appear in the folder without flying.
- Maths never splits across lines; no extra spacing inside maths.

## Acceptance

- [ ] Unit: which problems go (wrong at first submit and fixed, still wrong, never wrong, not attempted); every PS6 similar problem parses and differs from its original
- [ ] Click-through on the iPad at 1280×800 and 1440×900: reflection submit leads here; each of Sam's ever-wrong tiles expands without moving its neighbours, shows its original then the similar question, then lands in the folder and the count equals the ever-wrong problems; right tiles never move; reduced motion; no maths split or clipped inside the iPad frame
- [ ] vitest, eslint, tsc, next build, sweep:hint-boxes
