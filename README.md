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

`ARCHITECTURE.md` is the running architecture record; `DECISION_LOG.md` records significant
technical decisions and their tradeoffs; `FUTURE_FEATURES.md` collects every idea deferred along
the way (project policy: err on the side of too much). `tickets/` and `architecture/` hold the
per-ticket record, `specs/` the specs. The Sept 7 design-only mockup that used to live beside this
build in `roughdraft_sept7/` was removed on 10 Sep 2026 (see DECISION_LOG.md for the commit that
still holds it).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest: 512 tests over the pure logic in lib/
npm run lint && npx tsc --noEmit && npm run build
npx next start -p 3121 & npm run check:laptop   # every teacher route at 1440×900 and 1280×800, fails on horizontal overflow
EXTRACT_FIXTURES=1 npm run dev                  # problem extraction answers from fixtures/extract instead of the model (no key needed)
node scripts/render-extract-fixtures.mjs        # re-render those fixtures from the demo set (headless Chrome + KaTeX)
```

Two things leave the browser, both through the Anthropic SDK: the help chat on the practice pad
("I need help" → chat, ticket 69), `POST /api/help-chat` streaming a reply from Claude, and problem
extraction (ticket 170), `POST /api/extract` turning typed text, a screenshot or a PDF into problem
drafts streamed one per line. Put an `ANTHROPIC_API_KEY=…` in `.env.local` (gitignored) before
`npm run dev` or `next start` to connect them; without one both routes answer 503, the tutor's bubble
says the chat isn't connected on this device, and the create screen says the upload needs the model.
`EXTRACT_FIXTURES=1` makes extraction answer from `fixtures/extract/` (rendered from the demo set,
matched by the file's hash; typed text through the shorthand parser) so it runs without a key.
Everything else in the demo still runs offline.

Open **/** and pick a side. Use tabs of the same browser: the student iPad in one, the teacher in
another, the board in a third when projecting. Or open **/split** to see any one, two or all
three of them in one tab, fitted to the window (toggles in the dashed toolbar; stacked, the
student over the teacher with the board down the right, or side by side; drag the handle on any
boundary to resize, double-click it to reset); the panes are the real routes and stay in step
with each other and with any other tab. The dashed "Reset demo"
pinned bottom-right on the entry page and every teacher page (and in the split view's toolbar)
restarts everything in every tab; it is a presenter control, not part of the product.

## The demo, in order

Teacher, before the lesson (Edexia Classroom at `/teacher`, New assignment → `/teacher/assignments/create`):

0. **Create** (tickets 119, 121, 154): opens prefilled with the demo set (`data/draft-seed.ts`: the title,
   the goal for the class and ten typed questions, Q1 with +5x and a repeated Q9 for the review step); a title, then
   "Goal for the class" (a goal-oriented message, 280 characters, shown to every student once before
   they start; blank means no goal screen), then the questions typed into tiles in the student's five-wide
   grid, each tile the editor: the typed text on top, the rendered question beneath as you type
   (`x**2 + 5x + 6 = 0`, `1/3x**2`, `sqrt(2)` as KaTeX), Enter for the next tile, Shift+Enter to
   put the expression under the prose, × or Backspace to remove ("Q2 removed. Undo"); press and
   hold a tile to drag it to another slot, the labels renumbering as the others slide (a click
   edits, a hold moves; Alt+arrows move a focused tile; ticket 150). A question can also be a
   picture or a PDF (tickets 171–172): drop a screenshot or a worksheet anywhere on the grid,
   paste a screenshot with ⌘V, or use the ghost tile's Upload link; a shimmer tile holds the
   file's place while `/api/extract` reads it and each problem it finds arrives as a light blue
   tile with ✓ and × (a worksheet of four gives four; a three-page PDF gives every problem on it,
   its page drawn in the tile's corner and "4(a) · p. 2" beside the label), the bar offering
   "Add N" and "Discard N" beside Continue, which keeps them all anyway. Twenty pictures or five
   PDFs a drop, ten MB each, ten pages a PDF; a Word file is told to become a PDF. A typed line
   goes to the same model as you leave the tile (ticket 173): plain English ("half of x squared
   plus 3"), calculator shorthand or TeX all come back as the same clean question, the shorthand
   preview standing in until it does; every focused tile has a "Fix" line under its text ("the
   denominator is 2x", or a line of TeX) that corrects the question in place; a diagram in a
   dropped worksheet is cut out and shown under its question. Continue
   saves the draft and opens the review step.
0b. **Review** (ticket 120, `…/create/review`): the same tiles with a difficulty label on each
   (simple / complex × familiar / unfamiliar, from the bank or a heuristic; tap a label to change
   it; press and hold a tile to reorder, the draft and the create screen following, the labels
   and the decisions kept) and the counts above. "Assess set" runs a bar for five seconds and returns three
   recommendations matched to the set: change Q1 to `x² − 5x + 6 = 0` (the class's sign slip),
   remove the repeat of Q3, add a problem in a context (Try another cycles three). Accept or Keep
   as is, Undo, the grid follows. "Finalise set" opens the pathway screen: the unit focus (the
   inferred unit stands; describe the focus and Reassess to change it) above the review-pathway
   map, then Create.
1. **New assignment** (the older screen, reachable by URL): title, problems from the bank, the inferred QCAA unit to confirm (or
   describe the focus and reassess), and the review pathway on the map. Every
   pathway starts at student submission; then any of individual review, group review and
   class review, in that order, each optional. Pick a column and its siblings fade; leave
   later columns empty to stop there; tap "student submission" to clear the map and start again;
   the sentence under the map reads the pathway back. Create.

Student (`/student`, a 1180×820 iPad in the browser, mouse or trackpad for the pen):

2. Overview (CONTINUE pulses until pressed), the teacher's goal in a speech bubble ("Before you get started, Ms
   Okafor wants you to know…"; skipped when blank), then the check-in: confidence (a not-confident answer is offered the warm-up). Work Q1–Q10 on the pad; each burst of strokes is read as
   one line and the ink is kept. Q1 slips on monic factorising and Q2 on non-monic (a two-minute
   practice is offered on the second), Q3 misuses the null factor law, Q4–Q6 and Q8 hold, Q7
   multiplies only two of three terms by 3, Q9 skips the height (a compounded step, not a
   mistake), and Q10 misreads a negative discriminant. "I need help" runs the same practice flow.
3. **Hand in** → the pathway decides what comes next. The Edexia header on every student screen
   up to class review carries the pathway horizontally beside the student's name (indiv working →
   indiv review → group review → class review, only the stages the assignment has): the stage
   the class is on ringed in purple, stages over in the lit skill button's blue, stages ahead
   light blue, the same pill the teacher's Pathway card lights. The report and the screens it
   opens have no strip: the pathway is behind the student there.
4. **Individual review** (detective feedback): one sentence, "3 of your problems contain a
   mistake. Double-check factorising and algebra.", and the unmarked transcription. Rework any
   problem. Rework Q4 (which was right) and the pad "reads" a classic slip: the one per-problem
   signal in the product appears, "This isn't where your mistake was made. Your original work was
   correct.", with Restore; hand-in waits until it's restored or cleared. After hand-in the same
   sentence reports what still contains a mistake: the scripted rework fixes Q1–Q3 and Q10 but
   slips on Q7 a second way (every term scaled by 3, the third never put back).
5. **Group review** with three mock groupmates: quick pass over the all-correct problem, then the
   union of wrongs with a shared count. The board takes the left two thirds and a "Read as" column
   the right third, filling in one line per burst on every member's iPad. On Liam's Q7 the group
   gets it wrong first, the attempt shown at the top of the column up to the first mistake, and the
   debrief after the group's rework asks Sam to describe his own mistake.
6. **Class review**: the teacher projects; a one-minute countdown shows on every student
   screen; then the iPad freezes on what the board shows: the problem and the same two or three
   examples in the same columns, beside a mirror of the teacher's pad (or the student's own pad in
   "write with me"). No counts on the iPad: a light blue "your approach" tag sits on the
   example that was the student's own first hand-in. When the teacher shows marks on the board,
   the same lines show red and blue on the iPad. End releases everyone to the report.
7. **Report** in the teacher's colours (each category's pill carrying its name in white on its
   status colour, the groups beneath), a 2–3 sentence reflection in a 320 px panel, send.

Teacher, during the lesson (Edexia Classroom at `/teacher` lists the assignments; each opens at
`/teacher/a/<id>`, landing on Class once everyone has handed in or the class is past individual
working, else on Mistakes; every assignment page has "← Edexia Classroom" above its eyebrow):

**The class streams in** (ticket 189). From the moment Problem Set 2 is created, the nineteen classmates work
through it on a fixed script (`data/stream.ts`, read by `lib/stream.ts`), one problem submission at a time: each
submission ticks that problem's correct count on Mistakes and drops the student's name into its cluster with a faint
glow that fades (a name arriving while the pointer rests on its card, or a card above the pointer, waits until the
pointer moves on, so nothing moves under it); Class View's row reads "warming up" or "Q<n> in progress" and gets its
dots when the student hands in; the Classroom card's "n/20 submitted · n mistakes so far" ticks. The first name
lands about 8 s in (Ethan's Q1); Jordan, Tomas, Amelia, Mia and Oliver warm up first; most hand in four to six
minutes in; Jordan answers Q1–Q7 and stays on Q8; Chloe never starts. The end state is 17/20 (Sam is the real
student tab), still individual working. A reload continues from the stored start; Reset demo removes the set; a
presenter skip starts it an hour back (the end state); once Sam hands in (himself or by force submit) the class is
past working and every classmate who started has handed in.

- **Class** (`/teacher/a/pset-2/class`): one column per skill category the set touches (Algebra, Functions, Graphing,
  Communication, Reasoning, New skills), each a pill in the worst status beneath it (groups and
  skills beneath are round dots), half-filled where a student skipped problems; click a pill to drill
  sideways into groups, skills and the marked-up work behind them. Hover a column header for its **see skills** / **full breakdown** buttons
  (the chosen level opens under every student; the open level's button reads **close**, and
  with the full breakdown open it is the only button). Hover anywhere in a student's block (the
  row, or the drill open under it) for three buttons beside the name: **see dot skills** (the
  student's full breakdown, every group of every dot open to its skills; **close** while the row
  is open), **student report** and **see history**; they step aside while the pointer is over one of the row's
  pills or the dot chips of an open drill, since each is its own way in, and for a second after
  it last left one, so a sweep across pills or dots never shows them; the second is waived the
  moment the pointer goes left of the row's first pill, back towards the name, where they show at
  once. **See history** puts
  the roster into history mode for that student: everything else in the card fades, the
  student's six pills widen to carry their category's name in white, and a click on one stacks
  that category's last five recorded results above it (Aug 31 · Sep 2 · Sep 3 · Sep 7 · Sep 9,
  oldest at the top, dated in white, the same height as the pill; several can stand open); a white
  sheet then covers the rows above over the category columns, Algebra through New skills, so
  the stacks never mix with other students' pills, its top edge cutting through a pill halfway
  (or, for the top rows, the heads covered whole and the sheet rising over the "due" line), and
  the five spread evenly from the sheet's top down to today's pill. Nothing moves. The button reads **close
  history**; a click on any other row leaves the mode and opens nothing; a drill under the same
  student stays open beside it. A student with nothing handed in shows a caution triangle and MISSING in
  the Set column. Then the live row's confidence, stage and caution, the classmates, a light
  indigo **New assignment** pill on its own row above the cards over the right column (deep
  indigo text and border; it opens the create screen and is no longer in the bar), and the
  right column, level with the roster: the
  **Pathway** card (indiv working → indiv review → group review → class review: the stage the
  class is on ringed in purple with **force submit** beside it and `N/20 done` right under; one
  press starts a one-minute grace on every student's screen, `● handing in · 1:00 · Cancel` in
  its place, then the stage ends for everyone as it stands: the set handed in, the corrections
  handed in and group review begun, or group review over; class review has no button; stages over
  are the lit skill button's blue; stages ahead light blue), the
  **Class review** card (Set up → / Students frozen · End session; first in the column while a
  session runs), the assignment status
  (in class review · complete), the **Live diagnostic** card: a white box linking to Mistakes
  until a question is out, then the latest question's result kept on screen (each option with
  `n/20 students` and the misconception it reveals, the right one green; a pulsing `n/20 in`
  with **Withdraw** while the class answers; **show on board** / **clear board**).
- **Whole-class setup** (`/teacher/whole-class`): problems ranked by how many struggled, top
  three pre-checked; the example cards on the right stand in the order the class will see (the
  assignment's), and a press held on a card drags it to another place in that order (ticket 150); 2–3 suggested examples per problem chosen by mistake: the correct working,
  then the problem's most common exact mistakes, each slot headed by the mistake's name and
  count (green for correct, red for a mistake) with the skill chip, **unit focus** and
  **fixed in group review** badges, the names under the working (private); a menu on the
  header lists the problem's mistakes with counts to swap the working; **Student screens** (screens frozen / write with me) starts with neither chosen and
  **Project** sits faded until you pick one (press it anyway and it reads **select one** while the
  two options flash light blue). **Project** opens the board and starts the grace.
- **Board controls** (`/teacher/board`): which problem is up, what the board is showing, the
  teacher's pad (mirrored to frozen students and to the board); Previous · screens frozen /
  write with me · Show marks · End · Next.

Smartboard (`/board`, left on the projector, nothing to press): blank (class and title) through
submission and individual review; during group review the race, five rows of four first names
with a colour, a large bar and the percentage, re-ordered as bars move, gold, silver and bronze
for the first three groups home (the other four groups run a scripted ten-minute race; the demo
student's is live); the final standings held once group review is over; during whole-class
review one slide per problem, examples A/B/C with "n/m students" (the same columns the students
see, drawn by one component; lines never wrap, they shrink together in a narrow window), no names,
no marks until the teacher shows them, and the teacher's working pad.
- **Mistakes** (`/teacher/a/pset-2/mistakes`; the old `/teacher/mistakes` redirects there): the stage, its count and **force submit** after the title (the same control as on the Pathway card); problems first, the students who slipped on each under
  one pill per slip, expand for their working; inside a pill the students on the exact same
  wrong line sit together and, open, one box in the pill's red surrounds their working (a
  student alone on theirs boxed alone). Students whose working is identical line for line
  share one column: the work is written once with every one of their names over it, so a
  problem twelve students got wrong in three ways takes three columns. Columns share the card
  down to a floor and the working shrinks to fit them, so a problem scrolls sideways only past
  seven or so distinct workings. Left of every problem's card, level with its header, a small
  box counts the class who got it correct ("15/20 correct"; hover for the wrong and the skipped)
  with the skipped count under it ("3/20 skipped": stopped before it, or no answer handed in);
  the difficulty tag sits after the maths. The class's slips have a shape: twelve
  classmates wrong on Q7 in three ways (the fraction cleared from two terms, the third lost,
  the wrong pair), Amelia alone on Q6, nobody on Q8, and every other problem wrong in at least
  two ways. To the right of every problem a **Live
  diagnostic** chip: click it and the push panel opens from the chip as a flyout, down and to
  the right over the blank space, a little clear of the card (the problems never move), with that problem's own
  suggested question (example) or one you write (make your own), **send to class** at the panel's bottom right;
  the panel collapses as soon as the pointer leaves it, and a question you were writing is still there when
  you open it again; once the
  question is out the tab's option grid is its result (the same cells as the class view's card),
  `Waiting · n/20 in` with Withdraw while the class answers, then the board links; a badge on
  the collapsed chip while its push waits, and the other panels' send buttons wait their turn.
  The nineteen classmates answer over eight seconds after the push; Sam answers on the iPad.
  **Groups** (`/teacher/a/<id>/groups`, only when the pathway has group review): that assignment's own seating groups, frozen from the class defaults when it was created; the class defaults are edited at `/teacher/groups` (the Classroom's Groups link), and a move on one never changes the other. **/teacher/compare**.
  On the class view's roster the name is 16 px with a pill beside it for a student still on the set, **Q4 in progress**
  or **warming up** (Sam before his first screen: **not started**), every pill at one x, their dots not seen until they hand in; the avatar before the name and the same initials closing the row at the far right.
  The roster's header row (Student, the category chips, Confidence, Set) stays in view under the bar
  while the page scrolls, so the categories still read beside the later students.
  **student report** beside a name on the class view opens their individual view (`/teacher/report?student=`):
  the skills as the full dot view (each category's pill carrying its name in white on its status
  colour, all six one width, every group's skills out beneath) fixed on the
  page, nothing to open or close, a skill still showing its work beneath; the platform's
  commentary as a few ideas in a light-blue bubble (an idea lights only the skills behind it),
  and what the student wrote back in a purple-bordered box. A live diagnostic takes the whole board once all twenty have answered, or when the teacher puts it up: the question, each option with its count, the right one green, `x/20 students answered this`; never while the class is still answering unless the teacher says so, and no misconception wording.

## Deep links

`/student?stage=<stage>` starts a fresh run at that stage (`overview`, `goal`, `practice`, `confidence`,
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
  the diagnostic, and what extraction answers in fixture mode; `fixtures/extract/` the rendered
  files a teacher would drop (a problem, a worksheet, a three-page PDF) and their manifest, made by
  `scripts/render-extract-fixtures.mjs`.
- `lib/` pure logic with vitest: the student session reducer and store; the classroom reducer and
  store (assignment, advances, whole-class session); pathway rules; active assignment; detective
  summary and the guard; examples and marks for the board; the frozen view; recognition,
  evaluation, escalation, statuses, groups, report facts, mistakes, peers, versions.
- `specs/` the two specs; `tickets/` one file per ticket; `architecture/` one note per ticket;
  the running record is `../ARCHITECTURE.md`, decisions are in `../DECISION_LOG.md`, deferred
  ideas in `../FUTURE_FEATURES.md`. The copy rule every screen follows is in `specs/spec2.md`.
