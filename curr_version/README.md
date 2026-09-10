# Edexia · Maths — closed-loop demo

A design-only demo of live, closed-loop maths feedback for QCE Year 11 Mathematical Methods:
a student works a ten-problem set by hand on an iPad, the platform reads each line as it's
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
npm test           # vitest: 208 tests over the pure logic in lib/
npm run lint && npx tsc --noEmit && npm run build
npx next start -p 3121 & npm run check:laptop   # every teacher route at 1440×900 and 1280×800, fails on horizontal overflow
```

Open **/** and pick a side. Use tabs of the same browser: the student iPad in one, the teacher in
another, the board in a third when projecting. Or open **/split** to see any one, two or all
three of them in one tab, fitted to the window (toggles in the dashed toolbar; stacked, the
student over the teacher with the board down the right, or side by side; drag the handle on any
boundary to resize, double-click it to reset); the panes are the real routes and stay in step
with each other and with any other tab. The dashed "Reset demo"
pinned bottom-right on the entry page and every teacher page (and in the split view's toolbar)
restarts everything in every tab; it is a presenter control, not part of the product.

## The demo, in order

Teacher, before the lesson (`/teacher/assignments/new`):

1. **New assignment**: title, problems from the bank, the inferred QCAA unit to confirm (or
   describe the focus and reassess), and the review pathway on the map. Every
   pathway starts at student submission; then any of individual review, group review and
   whole-class review, in that order, each optional. Pick a column and its siblings fade; leave
   later columns empty to stop there; tap "student submission" to clear the map and start again;
   the sentence under the map reads the pathway back. Create.

Student (`/student`, a 1180×820 iPad in the browser, mouse or trackpad for the pen):

2. Overview, warm-up offer, confidence. Work Q1–Q10 on the pad; each burst of strokes is read as
   one line and the ink is kept. Q1 slips on monic factorising and Q2 on non-monic (a two-minute
   practice is offered on the second), Q3 misuses the null factor law, Q4–Q6 and Q8 hold, Q7
   multiplies only two of three terms by 3, Q9 skips the height (a compounded step, not a
   mistake), and Q10 misreads a negative discriminant. "I need help" runs the same practice flow.
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

- **Class**: one column per skill category the set touches (Algebra, Functions, Graphing,
  Communication, Reasoning, Unit Focus), each dot the worst status beneath it, half dots where a
  student skipped problems; click a dot to drill sideways into groups, skills and the marked-up
  work behind them. Then the live row's confidence, stage and caution, the classmates, the
  pathway chip, **Force assignment submit** (confirm, then a one-minute grace on every screen), the
  **Whole-class review** card (Set up → / Students frozen · End session), the assignment status
  (in whole-class review · complete), the live diagnostic push (the example, or one you write).
- **Whole-class setup** (`/teacher/whole-class`): problems ranked by how many struggled, top
  three pre-checked; 2–3 suggested examples per problem with names and correctness (private),
  swappable. **Project** opens the board and starts the grace.
- **Board controls** (`/teacher/board`): which problem is up, what the board is showing, the
  teacher's pad (mirrored to frozen students and to the board); Previous · screens frozen /
  write with me · Show marks · End · Next.

Smartboard (`/board`, left on the projector, nothing to press): blank (class and title) through
submission and individual review; during group review the race, five rows of four first names
with a colour, a large bar and the percentage, re-ordered as bars move, gold, silver and bronze
for the first three groups home (the other four groups run a scripted ten-minute race; the demo
student's is live); the final standings held once group review is over; during whole-class
review one slide per problem, examples A/B/C with "n/m students", no names, no marks until the
teacher shows them, and a mirror of the teacher's working.
- **Mistakes**, **Groups** (only when the pathway has group review), **/teacher/compare**.
  A student's name on the class view opens their individual view (`/teacher/report?student=`):
  the platform's commentary as a few ideas in a light-blue bubble, and what the student wrote
  back in a purple-bordered box.

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

`/split?panes=student,teacher,board&layout=beside` opens that set of panes (`panes` is any of
`student`, `teacher`, `board`, comma-separated; `layout` is `stacked`, the default, or
`beside`). Plain `/split` reopens the last choice.

## Where things are

- `app/student/` the iPad app (one client component, one screen per stage);
  `app/teacher/` the teacher pages, the creation screen with `PathwayMap`, whole-class setup and
  the board; `app/split/` the presenter's split view, the three routes in scaled iframes.
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
