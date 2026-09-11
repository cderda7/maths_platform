# 76: The fraction problem stays wrong after the individual review

**What to build:** In the demo, Sam's independent rework of Q7 is a second slip, not the fix: this time every term is scaled by 3 and the third is never put back. So the fraction problem is still wrong after the individual review, and the group review has something to do on it: Liam's first go checks wrong, "we're stuck" shows Sam both of his own earlier versions cut at the first mistake, and the debrief after the group's rework asks him to describe his own mistake beside his two wrong versions and the group's right one.

**Blocked by:** 52 (Liam's Q7 checks wrong first).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The scripted rework fixed all five slipped problems, so by the time the group reached Q7 Sam already had it right. The struggle the group review is for (a group that gets it wrong, a student who sees their own earlier work while it is still unresolved, a debrief that asks about your own mistake) was hidden: the debrief prompt was always "describe the mistake your peers most likely made", the report's group column was always empty.

## Solution

`RECOGNITION_REWORK.q7` becomes a different wrong path (`x² + 6x + 8`, the pair, `(x + 2)(x + 4)`), the evaluation table learns the new first line as a fractions slip ("Multiplied through by 3"), and the group script's second Q7 attempt is the model solution instead of the rework path. No component changes: the notice, the report's columns, the stuck reveal, the debrief prompt and the history all follow from the data.

## Acceptance

- [x] After the rework the notice reads "1 of your problems still contains a mistake. Double-check fractions."
- [x] On Liam's Q7 turn, "we're stuck" shows Sam's Handed in and Reworked versions each cut at its first (different) mistake
- [x] The Q7 debrief has three panes, both own versions red on the first line, prompt "describe the mistake you made"
- [x] The report puts Q7 under "Correct after group review"; the group's Q7 rework is the model solution
- [x] vitest (310), eslint, tsc, `next build`, browser check; architecture note and root docs
