# Edexia · Maths — QCE Methods mockup

Design-only mockup of step-aware maths feedback for QCE Year 11 Mathematical Methods, built around
one topic: finding the roots of a quadratic. No backend, no auth, no real grading — everything is
static data under `/data`.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Screens

Student
- `/student` — practice landing: the set, tagged by difficulty, with warm-ups mixed in
- `/student/work` — working through: the differentiated-pacing flow, toggle between two sample students
- `/student/tutor` — tutor chat beside a live step-by-step evaluation, with the example / hint / video picker
- `/student/check-in` — confidence check-in before and after a problem
- `/student/teacher-view` — what your teacher sees, with a student comment field

Teacher
- `/teacher` — class dashboard with prerequisite-subskill flags
- `/teacher/assignments/new` — assignment builder with auto-generated subskill breakdown
- `/teacher/students/jordan` — student detail, classwide hint, and suggested hints

Deep links for review: `/student/work?who=jordan&stage=1&phase=evaluated`,
`/student/tutor?turn=5&help=example`.

See `decisions_log.md` for assumptions and design decisions.
