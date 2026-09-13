# 193: The create screen's pathway step labels are accent chips

**What to build:** On the create screen's pathway step, the three card labels (Unit focus, Review pathway, Confirm groups) render as the filled accent chip Class View uses for its Pathway and Live diagnostic labels: white uppercase text on the indigo accent, rounded.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshots of the pathway step and of Class View's side column): "put unit focus & review pathway & confirm groups in dark purple box -- like the pathway & live diagnostic buttons here".

## Solution

- `app/teacher/assignments/UnitFocus.tsx`: the "Unit focus" eyebrow takes `DIAGNOSTIC_CHIP` (the class string Class View's Live diagnostic chip and the Mistakes tab already share).
- `app/teacher/assignments/create/review/PathwayStep.tsx`: "Review pathway" and "Confirm groups" take the same class; Confirm groups' chip is `shrink-0` so the long helper text beside it can never wrap it.

## Acceptance

- [x] All three labels: accent background, white uppercase text, rounded, one line, the same height, at 1280 and 1400
- [x] No horizontal scroll
- [x] vitest 566, eslint, next build; click-through `chips193.mjs` (22 checks)
