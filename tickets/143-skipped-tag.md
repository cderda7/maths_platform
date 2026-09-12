# 143: The count box reads "correct", and a "skipped" box hangs under it

**What to build:** The box beside each problem card reads "2/20 correct" instead of "2/20 right", and a second box of the same style sits right under it reading "6/20 skipped": the students who neither got the problem correct nor appear among the wrong under it (stopped before the problem, or handed it in without an answer).

**Blocked by:** 142.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "change 2/20 right to 2/20 correct. then add a tag below to say x/20 skipped."

## Solution

- `app/teacher/mistakes/TeacherMistakes.tsx`: `skipped = CLASS_SIZE − right − rows.length` per problem; the two tags share one style (`COUNT`) in a column stretched to the wider one, 6 px apart, whose top padding `(PROBLEM_HEADER + 2 − COUNT_H) / 2` centres the correct box on the header row (`COUNT_H = 22`: 12 px text, 4 px padding and 1 px border each side). The correct box's tooltip reads "n of 20 got it correct · w wrong · s skipped"; the skipped box's says what skipped means. `data-skipped="q1:2"`.
- `README.md` follows.

## Acceptance

- [x] Every problem: "n/20 correct" and "m/20 skipped", n + wrong rows + m = 20; the correct box level with the header row, the skipped box the same width 4–6 window px under it
- [x] Without a session Q1 15 / 2, Q7 2 / 6, Q9 8 / 7 (five wrong: Ethan and Harper slipped on it before stopping); with Sam's hand-in Q1 15 / 1, Q4 12 / 3, Q7 2 / 5, Q9 8 / 7 (his Q9 has no answer, so he is skipped there)
- [x] vitest, eslint, tsc, `next build`, headless click-through (`skipped143.mjs`) at 1800 and 1280
