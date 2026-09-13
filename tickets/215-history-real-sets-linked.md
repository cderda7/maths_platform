# 215: History pills read real sets, link to them, and never jump

**What to build:** In a student's history on a set's Class View, a category's five pills are the last five earlier sets that assessed that category, reaching back through the Classroom; for New skills, each earlier set's New skills result. Real pills read "PS5 · Mon 7 Sep" and open that set's Class View. When fewer than five sets assessed the category, simulated pills fill the top of the stack: the oldest dated a week before the class's first set (Tue 18 Aug), the rest between that date and the first set, never after it; they are not links. Neighbouring pills, and the newest against today's pill, never move more than one step (red ↔ orange ↔ light green ↔ dark green).

**Blocked by:** 209.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "say 3/5 test communication -- top pill date should be oldest (a week before PSet1, 2nd pill should be in between top pill & PSet 2 date)"; simulated pills stay before the first set so they read as pre-Edexia; "don't want 'dark green today, red a week ago' … students have a level of consistency between assignments (obviously wnat variation, but don't want random jumping)". Today five generated dates (Aug 11–28) and a seeded shuffle that can put red beside light green; only the newest pill is real and none link.

## Solution

- History from the registry: per category, the earlier sets whose problems touch it (New skills: every earlier set), last five, oldest first.
- Simulated pills as a one-step walk ending one step from the oldest real pill (or today's), dated from the first set's date backwards.
- Pill label with the set's short name and day; a real pill is a link to that set's Class View, keyboard-focusable; the stack's aria-label names the sets.
- Works with Sets 5 and 6 alone and picks up 211–214 as they land.

## Acceptance

- [ ] Set 6, a category Set 5 did not assess: its pills skip Set 5; with too few sets the simulated pills are dated 18 Aug and between 18 Aug and the first set
- [ ] Real pill labels and links land on the right set's Class View
- [ ] Test over every set × student × category: no neighbouring pair (and newest vs today) more than one step; Priya dark green throughout
- [ ] No overflow in the history stack at 1280 and 1440 with the longer labels
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through opening history on several students on Set 6 and Set 5, following a link
