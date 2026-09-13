# 230: The debrief's own panes say "Your first submission" and "Your second submission"

**What to build:** On the group review debrief, rename the student's two panes: "Handed in" becomes "Your first submission" and "Reworked" becomes "Your second submission".

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of Sam's Q1 debrief: "change 'handed in' to 'your first submission' & change 'rework' to 'your second submission'". The screenshot's panes read HANDED IN, REWORKED, GROUP'S REWORK; "rework" is the REWORKED pane (the third pane, the group's, is a different label and stays).

## Solution

- `lib/debrief.ts`: `markedVersions` labels the student's versions "Your first submission" and "Your second submission". The label is also the pane's React key and `data-version`, so nothing else changes; the `Eyebrow` sets it in capitals as before.
- `lib/debrief.test.ts`: the three label expectations follow.
- `app/student/screens/GroupDebrief.tsx`: the doc comment names the panes the new way.

## Acceptance

- [x] At 1440 × 900 and 1280 × 800 on Sam's Q1 debrief (marked): the panes read YOUR FIRST SUBMISSION, YOUR SECOND SUBMISSION, GROUP'S REWORK; every label on one line inside its pane; no horizontal scroll (`labels230.mjs`, 10 checks)
- [x] vitest 674, eslint, tsc, next build
