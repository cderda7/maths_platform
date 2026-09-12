# 140: A box left of each problem's label counts the class who got it right

**What to build:** On the mistake view, a small box to the left of every problem's "Q1" label reading "15/20 right": how many of the class of twenty got that problem right. Its tooltip splits the rest into the students shown wrong under it and those who never finished it. Also: log "marking correct but inefficient answers" in FUTURE_FEATURES.md.

**Blocked by:** 138.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of the mistake view's Q1–Q3 cards: "to the left of the Q box, add a little box saying how many students got the problem correct. add marking for correct but inefficient answers in F_F."

## Solution

- `lib/mistakes.ts`: `rightCount(problem, index, session, me?)`: each classmate who reached the problem (`index < done`, the rule that gives them the model solution on the skill grid) and is not wrong on it, plus the live student when his first hand-in on it is clean (`feedbackFor`) and finished (`progressOf`). `ProblemMistakes.right` carries it; `CLASS_SIZE` (20) is re-exported for the view. Sam at the feedback stage is right on Q4, Q5, Q6 and Q8, wrong on five, and on Q9 neither: his working stops at the axis of symmetry, so it is unfinished.
- `app/teacher/mistakes/TeacherMistakes.tsx`: the box before the label inside the header's left group (`data-right="q1:15"`): a 12 px `rounded-md` cream box, the fraction semibold in ink, "right" muted, with a `title` of "15 of 20 got it right · 3 wrong · 2 didn't finish it". The header row's height is still set by the label and the maths.
- `FUTURE_FEATURES.md`: a section on marking answers that are right but took the long way, and this ticket's deferrals.
- Tests: `lib/mistakes.test.ts` (every problem against the fixture rule with and without the live session; Q1 fifteen, Q7 two, Q4 twelve with Sam; Q8 countable though absent from the view).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Every problem card on `/teacher/mistakes` shows "n/20 right" left of its label; n is 15 on Q1 and 2 on Q7 with no live session, 12 on Q4 with Sam's hand-in
- [x] The box sits left of the label with the header's usual gap, centred on the row, shorter than the label; the row's height is unchanged open or closed at 1800 and 1280 px
- [x] The tooltip's three numbers add up to twenty
- [x] vitest, eslint, tsc, `next build`, headless click-through (`right140.mjs`) with crops
