# 256: After the reflection, the problem types a student got wrong go into their homework bank

**What to build:** After a student submits their reflection, a new screen shows their skill dots and their Q tiles marked right or wrong, and the tiles of every problem they ever got wrong move into a Homework folder in an animation. The copy makes clear the *type* of problem is saved for homework, not the same problem.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Planning conversation (2026-09-14): nothing from an in-class lesson carries into the next. The homework model (individualised practice) is not being built yet, but the user wants the motivation now: "post student seeing report & submitting reflection, they get an update on 'this problem type will be added to future homework'. i think we could have it move to a next screen that just shows the dot skills & the Q tiles & when they got it right/wrong & an animation where they move to a HW file."

Which problems go: any problem wrong at any point, including ones fixed in review ("but also make it somehow clear that it will be the problem type, not that they'll be practicing the exact same problem later").

## Solution

- Student stage after the reflection's submit: the report's skill dots and the Q tiles (OutcomeTiles' look) right and wrong by the first submission.
- Each tile that was ever wrong carries its problem type (the problem's skill in words, e.g. "solving with the formula"), then moves into a Homework folder; right tiles stay. One headline in the copy rule's style plus one line making clear it is problems like these, not these problems.
- A student with nothing ever wrong (Priya) sees the tiles stay and a line saying nothing was added.
- The homework bank is only this screen's data for now (no homework screens); SKIP TO gains the stage.
- Respects `prefers-reduced-motion` (tiles appear in the folder without flying).

## Acceptance

- [ ] Unit: which problems go (wrong at first submit and fixed, still wrong, never wrong, not attempted); type labels for every PS6 problem
- [ ] Click-through on the iPad at 1280×800 and 1440×900: reflection submit leads here; Sam's ever-wrong tiles each show their type and land in the folder; right tiles don't move; reduced motion; no maths split; nothing clips inside the iPad frame
- [ ] vitest, eslint, tsc, next build, sweep:hint-boxes
