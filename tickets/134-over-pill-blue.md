# 134: A stage the class has finished is the skill button's blue

**What to build:** On the class view's **Pathway** card a stage the class has moved on from is the dark blue of a lit skill button on the student's warm-up (`bg-standout`, white text), not the navy ink of ticket 129. Everything else on the card stands.

**Blocked by:** 129.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of the warm-up's skill buttons (**fractions** lit dark blue, the others light): "instead of black when done with a review stage, do the dark blue as in here".

## Solution

- `app/teacher/TeacherLive.tsx`: the over pill's classes are `bg-standout text-white` (the lit skill button's fill, `--color-standout` #2f6fb3) in place of `bg-ink text-white`.

## Acceptance

- [x] Over pills read as the same blue as a lit skill button; current and ahead pills unchanged; nothing moves
- [x] vitest, eslint, tsc, `next build`, headless click-through (`stage.mjs`, 34 checks, the over-pill check now asserting `--color-standout`) with crops
