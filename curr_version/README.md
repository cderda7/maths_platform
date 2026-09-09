# Edexia · Maths — closed-loop demo

A design-only demo of live, closed-loop maths feedback for QCE Year 11 Mathematical Methods:
a student works a four-problem set by hand on an iPad, the platform reads each line as it's
written and reacts, and the teacher watches the same run move in real time, chooses the review
pathway, and can put the class's work on the board. Built 8–9 Sep 2026 from `specs/spec1.md`
(v2, tickets 01–16) and `specs/spec2.md` (v3, tickets 17–25) in `tickets/`.

Everything is simulated with fixture data: recognition is scripted per line, evaluation is a
lookup table for the demo problems, classmates are mock, and nothing leaves the browser. Two
small stores are mirrored across tabs of one browser: the student session and the teacher-owned
classroom.

## Run it

```bash
cd curr_version
npm install
npm run dev        # http://localhost:3000
npm test           # vitest: 106 tests over the pure logic in lib/
npm run lint && npx tsc --noEmit && npm run build
```

Open **/** and pick a side. Use tabs of the same browser: the student iPad in one, the teacher in
another, the board in a third when projecting. "Reset" (entry page or teacher bar) restarts
everything in every tab.

## The demo, in order

Teacher, before the lesson (`/teacher/assignments/new`):

1. **New assignment**: title, problems from the bank, and the review pathway on the map. Every
   pathway starts at student submission; then any of individual review, group review and
   whole-class review, in that order, each optional. Pick a column and its siblings fade; leave
   later columns empty to stop there; tap "student submission" to clear the map and start again;
   the sentence under the map reads the pathway back. Create.

Student (`/student`, a 1180×820 iPad in the browser, mouse or trackpad for the pen):

2. Overview, warm-up offer, confidence. Work Q1–Q4 on the pad; each burst of strokes is read as
   one line and the ink is kept. Q1 and Q2 slip on factorising (a two-minute practice is offered
   on the second), Q3 on the null factor law, Q4 holds. "I need help" runs the same practice flow.
3. **Hand in** → the pathway decides what comes next.
4. **Individual review** (detective feedback): one sentence, "3 of your problems contain a
   mistake. Double-check factorising and algebra.", and the unmarked transcription. Rework any
   problem. Rework Q4 (which was right) and the pad "reads" a classic slip: the one per-problem
   signal in the product appears, "This isn't where your mistake was made. Your original work was
   correct.", with Restore; hand-in waits until it's restored or cleared. After hand-in the same
   sentence reports what still contains a mistake.
5. **Group review** with three mock groupmates: quick pass over the all-correct problem, then the
   union of wrongs with a shared count.
6. **Whole-class review**: the teacher projects; a one-minute countdown shows on every student
   screen; then the iPad freezes on the student's own work for the problem on the board, ink and
   transcription, both versions, nothing to tap. When the teacher shows marks on the board, the
   student's own lines show red and blue too. End releases everyone to the report.
7. **Report** in the teacher's colours, a 2–3 sentence reflection, send.

Teacher, during the lesson (`/teacher`):

- **Class**: the live row (subskill dots, confidence, stage, caution), static classmates, the
  pathway chip, **Hand in for everyone** (confirm, then a one-minute grace on every screen), the
  **Whole-class review** card (Set up → / Students frozen · End session), the assignment status
  (in whole-class review · complete), the live diagnostic push.
- **Whole-class setup** (`/teacher/whole-class`): problems ranked by how many struggled, top
  three pre-checked; 2–3 suggested examples per problem with names and correctness (private),
  swappable. **Project** opens the board and starts the grace.
- **Board** (`/teacher/board`, drag to the projector): one slide per problem, examples A/B/C with
  "n/m students", no names, no marks until **Show marks**; Previous · Next · End.
- **Mistakes**, **Groups** (only when the pathway has group review), **Report**,
  **/teacher/compare**.

## Deep links

`/student?stage=<stage>` starts a fresh run at that stage (`overview`, `practice`, `confidence`,
`working`, `feedback`, `waiting`, `frozen`, `rework`, `group-pass`, `group-discuss`, `report`,
`peers`, `history`). Add `&run=strong` for a run where every step held. Add
`&pathway=<p>` to create the demo assignment with that review pathway first: `none`, `indiv`,
`group`, `wc`, `indiv,group`, `indiv,wc`, `group,wc`, `indiv,group,wc`. Plain `/student`
continues the stored run.

Useful starts: `/student?stage=working&pathway=wc` (hand in, wait for the board),
`/student?stage=rework&pathway=indiv,wc` (rework Q4 to trip the guard, then project),
`/student?stage=feedback` (the detective sentence).

## Where things are

- `app/student/` the iPad app (one client component, one screen per stage);
  `app/teacher/` the teacher pages, the creation screen with `PathwayMap`, whole-class setup and
  the board.
- `components/` the presentational kit, the drawpad, `InkView`, the pad and transcription columns.
- `data/` all fixtures: the assignment, subskills, practice problems, scripted recognition
  (including the Q4 rework slip), the evaluation table with clues and standouts, classmates,
  the diagnostic.
- `lib/` pure logic with vitest: the student session reducer and store; the classroom reducer and
  store (assignment, advances, whole-class session); pathway rules; active assignment; detective
  summary and the guard; examples and marks for the board; the frozen view; recognition,
  evaluation, escalation, statuses, groups, report facts, mistakes, peers, versions.
- `specs/` the two specs; `tickets/` one file per ticket; `architecture/` one note per ticket;
  the running record is `../ARCHITECTURE.md`, decisions are in `../DECISION_LOG.md`, deferred
  ideas in `../FUTURE_FEATURES.md`. The copy rule every screen follows is in `specs/spec2.md`.
