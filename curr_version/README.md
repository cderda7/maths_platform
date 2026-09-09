# Edexia · Maths — closed-loop demo

A design-only demo of live, closed-loop maths feedback for QCE Year 11 Mathematical Methods:
a student works a four-problem set by hand on an iPad, the platform reads each line as it's
written and reacts, and the teacher watches the same run move in real time. Built 8 Sep 2026 from
`specs/spec1.md` (v2) through the sixteen tickets in `tickets/`.

Everything is simulated with fixture data: recognition is scripted per line, evaluation is a
lookup table for the demo problems, groupmates are mock, and nothing leaves the browser.

## Run it

```bash
cd curr_version
npm install
npm run dev        # http://localhost:3000
npm test           # vitest: 57 tests over the pure logic in lib/
npm run lint && npx tsc --noEmit && npm run build
```

Open **/** and pick a side. Use two tabs of the same browser: the student iPad in one, the
teacher in the other. "Reset the demo" (entry page or teacher bar) restarts both.

## The demo, in order

Student (`/student`, a 1180×820 iPad in the browser, mouse or trackpad for the pen):

1. Assignment overview, warm-up offer (take it or start), confidence survey.
2. Work Q1–Q4 on the pad. Each burst of strokes is read as one line. Q1 slips on factorising
   (nothing happens), Q2 slips again (a two-minute isolated practice is offered), Q3 slips on
   the null factor law, Q4 holds. "I need help" runs the same practice flow; a second practice
   on one skill raises the teacher's caution flag.
3. Hand in → feedback: red for steps that didn't hold, blue for a curated few that did, a
   detective-work clue per problem, a star on a right-but-unsure problem.
4. Rework on your own (clue only, first attempt unmarked, a second version on the pad).
5. Group review with three mock groupmates: quick pass over the all-correct problem, then the
   union of wrongs with no marks and one shared count.
6. Final report in the teacher's colours, a 2–3 sentence reflection, send.

Teacher (`/teacher`):

- **Class**: the live row (subskill dots, confidence, what they're doing, red caution), static
  classmates, "Worth a look", the practice/help log, and the live diagnostic push.
- **Mistakes**: by problem, then student, click to expand the working with the slip in red.
- **Groups**: each group's one-line statuses and why it formed.
- **Report**: the skills summary beside the student's reflection; **/teacher/compare**: handed-in
  beside final.

## Deep links

`/student?stage=<stage>` starts a fresh run at that stage (`overview`, `practice`, `confidence`,
`working`, `feedback`, `rework`, `group-pass`, `group-discuss`, `report`, `peers`, `history`).
Add `&run=strong` for a run where every step held (`/student?stage=report&run=strong` shows the
mastery entry to the peer-struggle screen). Plain `/student` continues the stored run.

## Where things are

- `app/student/` the iPad app (one client component, one screen per stage);
  `app/teacher/` the teacher pages.
- `components/` the presentational kit, the drawpad, the pad and transcription columns.
- `data/` all fixtures: the assignment, subskills, practice problems, scripted recognition, the
  evaluation table with clues and standouts, classmates, the diagnostic.
- `lib/` pure logic with vitest: session reducer, recognition bookkeeping, evaluation,
  escalation counter, teacher-side statuses, feedback layers, group phases, report facts,
  mistakes, peers, versions, review groups, the cross-tab store.
- `architecture/` one note per ticket; the running record is `../ARCHITECTURE.md`; decisions
  and their tradeoffs are in `../DECISION_LOG.md`.
