# Edexia · Maths — QCE Methods mockup

Design-only mockup of step-aware maths feedback for QCE Year 11 Mathematical Methods, built around
one topic: finding the roots of a quadratic. No backend, no auth, no real grading — everything is
static data under `/data`.

This folder is the whole mockup. From the repo root the scripts delegate here (`npm run dev`), or:

```bash
cd roughdraft_sept7
npm install
npm run dev
```

Then open http://localhost:3000.

## Screens

Student
- `/student` — practice landing: the set, tagged by difficulty, with warm-ups mixed in
- `/student/work` — working through: the differentiated-pacing flow. Toggle between Priya and Jordan
  (scripted) and Sam, who hasn't started — type working line by line, check it, revise, continue
- `/student/tutor` — tutor chat beside a live step-by-step evaluation, with the example / hint / video picker
- `/student/check-in` — confidence check-in before and after a problem
- `/student/teacher-view` — what your teacher sees, with a student comment field

Teacher
- `/teacher` — class dashboard with prerequisite-subskill flags
- `/teacher/assignments/new` — assignment builder with auto-generated subskill breakdown
- `/teacher/students/jordan` — student detail, classwide hint, and suggested hints

Deep links for review: `/student/work?who=jordan&stage=1&phase=evaluated`,
`/student/tutor?turn=5&help=example`, `/student/work?who=sam` (blank attempt), and
`/student/work?who=sam&problem=q2&lines=2x^2+7x-4=0|(2x+4)(x-1)=0&confidence=certain&phase=evaluated`
(a typed attempt already checked; separate lines with `|`).

Tests: `npx vitest run` covers the simulated step evaluator in `lib/evaluate.ts`.

See `decisions_log.md` for assumptions and design decisions, and `ARCHITECTURE.md` for how the
files fit together.
