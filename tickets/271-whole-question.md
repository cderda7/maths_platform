# 271: Every problem on a teacher screen shows the whole question

**What to build:** User 2026-09-14, on the Mistakes page (PS5 Q7–Q9) and Jordan's report (PS5 Q8): "ever time you post a Q in analytics, need to see the whole Q -- in msot places you're just posting the equation, but i have no idea what the studetn is meant to do with the equation".

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- `components/ProblemQuestion.tsx`: a problem as the student was asked it, the stem's words then the expression, read as one line of prose. It wraps between words, never inside the maths (`.katex` nowrap) and never at a hyphen (`unbrokenHyphens` in `lib/stem.ts`, so "x-intercepts" stays whole in a narrow column).
- Every teacher screen that named a problem by its bare expression now shows it:
  - **Mistakes** header: "Q8 Write in factorised form, then give the x-intercepts and the axis of symmetry. y = 2x² + 5x − 3 [complex familiar] close". One line at 1280 for every problem but PS5 Q10's long fountain stem, which wraps to two (header 87 px, the rest still 69).
  - **Student report**, the open problem: label, tag, then the question beside them, wrapping under itself.
  - **Skill working** (the report's skill view, and the student's own report): the question under the label.
  - **Live diagnostic** focused view: the header reads "Q2 · Live diagnostic", the whole question on its own line under it (a 26 px expression in a 48 px display line was too much once the words joined it).
  - **Class review setup**: the problem list and each example card's header.
  - **Board controls**: the stem was already there but truncated after the maths; now the question reads in order and wraps.
  - **Before and after** (compare): the card header.

## Acceptance

- [x] Mistakes on PS5 and PS6: every header reads stem then expression; Q10's two-line header holds its tag and action
- [x] Jordan's report, PS5 Q8 and Q10 open, and the non-monic factorisation skill view: whole questions, nothing clipped, "x-intercepts" never splits
- [x] Live diagnostic on PS6 Q2, class review setup and board controls screenshotted at 1280×800
- [x] Every problem on every set has a stem (vitest)
- [x] vitest 913, eslint, tsc, next build, check:laptop 74; the ticket 244 report sweep on this build
