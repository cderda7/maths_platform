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
npm test           # vitest: 753 tests over the pure logic in lib/ and the fixtures in data/
npm run lint && npx tsc --noEmit && npm run build
npx next start -p 3121 & npm run check:laptop   # every teacher route at 1440×900 and 1280×800 (all six sets), fails on horizontal overflow
npm run story:sheet                             # regenerate specs/class-story.md from data/story.ts
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

**Design tuner** (ticket 296, `npm run dev` only): press ⌥C on any page for a panel that tunes the design tokens in
`app/globals.css` on the live page. Colours by lightness, vividness and hue (red moves gap and wrong together until
Split), the status markers' corners and incomplete fill (split, corner to corner, or hatched), all corners, and
the Classroom's box borders (ticket 321: problem set cards and homework cells apart, width, style and colour). Hold
Space to see the saved design, ⌘Z to undo, ⌥-click anything to find its colours; Save to globals.css writes the
changed values. Unsaved changes stay in that browser across reloads (the small tag at the top says so).

**/** opens the presenter's chooser (ticket 286; `/demo`, its address under ticket 265, redirects
there): pick a side there. Use tabs of the same browser: the student iPad (`/student`, Sam's Classroom) in one,
the teacher in another, the board (`/board`) in a third when projecting: in class it opens from the teacher header's **Present board**, and the chooser's board card is a shortcut to it. Or open **/split** to see any one, two or all
three of them in one tab, fitted to the window (toggles in the dashed toolbar; stacked, the
student over the teacher with the board down the right, or side by side; drag the handle on any
boundary to resize, double-click it to reset); the panes are the real routes and stay in step
with each other and with any other tab. The dashed "Reset demo"
pinned bottom-right on the chooser at `/` and every teacher page (and in the split view's toolbar)
restarts everything in every tab; it is a presenter control, not part of the product. Once the teacher has pressed +Homework, the SKIP TO bars on the teacher's
laptop and Sam's iPad also offer "send homework" (Homework 3 sent as generated and refined, due Mon 14 Sep, into Sam's
Future panel) and "homework open" (Problem Set 6's lesson ended, Homework 3 first in Sam's To do, his iPad on his Classroom) (ticket 295).

## The demo, in order

Teacher, before the lesson (Edexia Classroom at `/teacher`, +In-Class PSet → `/teacher/assignments/create`, +Homework → `/teacher/homework/create`):

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
   as is, Undo, the grid follows. "Finalise set" opens the pathway screen: the set's **New skills**
   (ticket 209: the skills at least two problems invoke that the class did not meet under their home in
   its last two sets, Problem Sets 5 and 4, so the discriminant and the null factor law; on at once,
   click a chip to change it, "use suggested" to go back, never a confirm gate) above the
   review-pathway map, then Create.
1. **New assignment** (the older screen, reachable by URL): title, problems from the bank, the inferred QCAA unit to confirm (or
   describe the focus and reassess), and the review pathway on the map. Every
   pathway starts at student submission; then any of individual review, group review and
   class review, in that order, each optional. Pick a column and its siblings fade; leave
   later columns empty to stop there; tap "student submission" to clear the map and start again;
   the sentence under the map reads the pathway back. Create.

   **+Homework** (ticket 291) runs the same screens with no goal box and no pathway: Generate fills Homework 3 (ten
   problems on features of a parabola and roots of a quadratic, `data/homework-draft-seed.ts`), the due date starts at
   Mon 14 Sep and cannot fall on or before Homework 2's Mon 7 Sep, the strip reads QUESTIONS — DIFFICULTY — REFINE — SEND,
   and Refine's Create sends it: it joins Homework 1 and 2 in the homework column to the right of the Classroom's Past cards (ticket 305): each
   cell spans the sets it covers and reads the class's count ("14/20 done"), or "sent · opens after Problem Set 6" until it opens; for the demo a press turns the cell dark grey with "HW insight scoped in FUTURE_FEATURES" for 2.5 s (ticket 324), standing in for the homework insight view.

Student (`/student`, a 1180×820 iPad in the browser, mouse or trackpad for the pen). It opens on Sam's Edexia
Classroom (ticket 264): To do, Missing, Completed. Problem Set 1–5 are Completed, with a homework column to their right (ticket 290):
"HW1 completed" (due Tue 1 Sep, submitted Mon 31 Aug) beside Sets 1–2, a caution "HW2 missing" (due Mon 7 Sep, in a dark red outline; its problems carry into the next homework) beside Sets 3–4; Problem Set 6 shows in To do once
the teacher has pressed Create (or a SKIP TO or deep link sent it). A homework the teacher has sent waits greyed in a Future panel at the top right (ticket 292)
until Problem Set 6's lesson ends; then Homework 3 is first in To do with OPEN, and its HW3 cell opens it too. Every other homework cell
(HW1, HW2, and HW3 while it waits in the Future) shows the teacher's demo placeholder when pressed: dark grey with "HW insight scoped in FUTURE_FEATURES" for 2.5 s (ticket 326).
Both open his Homework 3 (ticket 293): FROM YOUR MISTAKES, every problem he ever got wrong on Problem Sets 6 and 5 as a similar problem
under its set's name (newest first), then EVERYONE, the teacher's ten; a read-only list, numbered in the order he does them.
Missed Homework 2's own problems carry in under their sets (ticket 294), except any whose skill Homework 3 already holds: Sam's Problem Set 4 Q10
carries, its other leftovers and Problem Set 3's Q8 are duplicates; HW2's note shows only when something carried.
START opens a set; the Edexia mark returns:

2. Overview (CONTINUE pulses until pressed), the teacher's goal in a speech bubble ("Before you get started, Ms
   Okafor wants you to know…"; skipped when blank), then the check-in: confidence (a not-confident answer is offered the warm-up; confident goes straight to Q1). The warm-up runs each ticked or named skill in three steps (ticket 313): a worked example with a chat beside it, a completion problem with the skill's lines to write, each marked (the demo writes the monic factors with minus signs, then right), then one alone with hint, chat and "see the example again"; the skill chips, Next skill and Skip to the set at every step. Work Q1–Q10 on the pad; each burst of strokes is read as
   one line and the ink is kept. Q1 slips on monic factorising and Q2 on non-monic (a two-minute
   practice on non-monic is offered on the second), Q3 misuses the null factor law, Q4–Q6 and Q8 hold, Q7
   multiplies only two of three terms by 3, Q9 skips the height (a compounded step, not a
   mistake), and Q10 misreads a negative discriminant. "I need help" (pick the skill) and the offer run the same
   three steps (ticket 312): Q*, a question like it worked step by step with a chat beside it; Q**, another with the
   skill's lines blank, each line written on the pad marked right or red with its misconception chip (the demo writes
   Q2**'s factors with the signs in the wrong brackets, then right) and a blank filled in after two wrong lines; then
   back on the question with "see the example again", a hint and a chat. "Back to Qn" at every step; no video.
3. **Hand in** → the pathway decides what comes next. The Edexia header on every student screen
   up to class review carries the pathway horizontally beside the student's name (indiv working →
   indiv review → group review → class review, only the stages the assignment has): the stage
   the class is on ringed in purple, stages over in the lit skill button's blue, stages ahead
   light blue, drawn by the same stage pill as the teacher's pathway strip (`components/StagePill.tsx`, ticket 334). The report and the screens it
   opens have no strip: the pathway is behind the student there.
4. **Individual review** (detective feedback): one sentence, "3 of your problems contain a
   mistake." with "Double-check" and the skills to check on the line below, then how many
   problems are incomplete, and the unmarked transcription. Rework any
   problem. Rework Q4 (which was right) and the pad "reads" a classic slip: the one per-problem
   signal in the product appears, "This isn't where your mistake was made. Your original work was
   correct.", with Restore; hand-in waits until it's restored or cleared. After hand-in the same
   sentence reports what still contains a mistake: the scripted rework fixes Q1–Q3 and Q10 but
   slips on Q7 a second way (every term scaled by 3, the third never put back).
5. **Group review** with three mock groupmates, once the whole class has handed in its corrections (the
   demo's arrivals take about a minute): the group works only the questions a member still has wrong,
   unfinished or not attempted after individual review, and a member who fixed a question there can
   explain it (ticket 332). A question nobody at the table can explain is left for now after three wrong
   checks and comes back once; sky leaves Q7 unsolved and gets Q9 on its return. A group with nothing
   left sits out: its iPads say "Your group has nothing left to review." and it is in no group count. The board takes the left two thirds and a "Read as" column
   the right third, filling in one line per burst on every member's iPad. On Liam's Q7 the group
   gets it wrong first, the attempt shown at the top of the column up to the first mistake, and the
   debrief after the group's rework asks Sam to describe his own mistake.
6. **Class review**: the teacher projects; a one-minute countdown shows on every student
   screen; then the iPad freezes on what the board shows: the problem and the same two or three
   examples in the same columns, beside a mirror of the teacher's pad (or the student's own pad in
   "write with me"). No counts on the iPad: a light blue "your approach" tag sits on the
   example that was the student's own first hand-in. When the teacher shows marks on the board,
   the same lines show red and blue on the iPad, and whatever the teacher draws over the problem or
   the examples shows over the same maths, in both modes. End releases everyone to the report.
7. **Report** in the teacher's colours (each category's pill carrying its name in white on its
   status colour, the groups beneath), a 2–3 sentence reflection in a 320 px panel, send.

Teacher, during the lesson (Edexia Classroom at `/teacher` lists the assignments; each opens at
`/teacher/a/<id>`, landing on Class once everyone has handed in or the class is past individual
working, else on Mistakes; every assignment page has "← Edexia Classroom" above its eyebrow):

**The class streams in** (ticket 189). From the moment Problem Set 6 is created, the nineteen classmates work
through it on a fixed script (`data/stream.ts`, read by `lib/stream.ts`), one problem submission at a time: each
submission ticks that problem's correct count on Mistakes and drops the student's name into its cluster with a faint
glow that fades (a name arriving while the pointer rests on its card, or a card above the pointer, waits until the
pointer moves on, so nothing moves under it); Class View's row reads "warming up" or "Q<n> in progress" and gets its
dots when the student hands in; the Classroom card's "n/20 submitted" ticks and its "top gaps so far" follow the class (ticket 323). The first name
lands about 8 s in (Ethan's Q1); Jordan, Tomas, Amelia, Mia and Oliver warm up first; most hand in four to six
minutes in; Jordan answers Q1–Q7 and stays on Q8; Chloe never starts. The end state is 17/20 (Sam is the real
student tab), still individual working. A reload continues from the stored start; Reset demo removes the set; a
presenter skip starts it an hour back (the end state); once Sam hands in (himself or by force submit) the class is
past working and every classmate who started has handed in. Inside those times the script also says where each
student is (ticket 314, `lib/place.ts`, for ticket 315's Where students are): everyone opens on the confidence check;
the five warm up after a chat on the skills they named, three steps each (Jordan non-monic; Mia fractions then
non-monic; Oliver monic then non-monic; Tomas fractions; Amelia the discriminant); Liam (Q1), Sofia (Q2), Harper (Q3)
and Finn (Q5) take help in three steps on a question they slipped on; Noah (two on Q3), Ethan (Q4) and Ruby (Q9) ask
for hints. Sam's place comes from his session.

- **Class** (`/teacher/a/pset-6/class`; every set has one, `/teacher/a/pset-1/class` … ): one column per skill category the set touches (Algebra, Functions, Graphing,
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
  that category's results on the earlier sets above it (oldest at the top, the same height as the pill;
  several can stand open; see "The Classroom's six sets" below for what they are); a white
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
  **Class review** card (Set up → / Students frozen · End session; first in the column while a
  session runs; once the lesson is over it reads "Over · went through Q2 and Q7", ticket 335), the assignment status
  (in class review · complete), the **Live diagnostic** card: a white box linking to Mistakes
  until a chain is out, then the current step only (`1st of 3` above the question, `n/20 answered`,
  each option with `n/20 students` and the misconception it reveals, the right one green, live),
  **Withdraw**, and the teacher's one control: **force submit** (a five-second countdown with Cancel),
  then **next question**, or **done** on the last step. Done returns it to the white box.
- **Whole-class setup** (`/teacher/whole-class`): problems ranked by how many struggled, top
  three pre-checked; the example cards on the right stand in the order the class will see (the
  assignment's), and a press held on a card drags it to another place in that order (ticket 150); 2–3 suggested examples per problem chosen by mistake: the correct working,
  then the problem's most common exact mistakes, each slot headed by the mistake's name and
  count (green for correct, red for a mistake) with the skill chip, **unit focus** and
  **fixed in group review** badges, the names under the working (private); a menu on the
  header lists the problem's mistakes with counts to swap the working; **Student screens** (screens frozen / write with me) starts with neither chosen and
  **Project** sits faded until you pick one (press it anyway and it reads **select one** while the
  two options flash light blue). **Project** puts the first problem on the board and starts the grace (the header's Present board pulses if no board is open).
- **Board controls** (`/teacher/board`): which problem is up, the board's A/B/C examples beside the
  teacher's pad (mirrored to frozen students and to the board); the pen works anywhere over the
  question and the examples too, and each mark shows over the same maths on the board and every
  iPad; Previous · screens frozen / write with me · Show marks · End · Next.

Present board (ticket 333): the teacher header, just before the teacher's name on every teacher page, carries
**Present board**. In Chrome and Edge a press (the first asks to manage windows; if that prompt used up the press
it reads **Press again to present**) opens the board sized to the projector, the laptop's second display, with a
thin title bar; elsewhere, or with the permission refused, an ordinary window to drag there. While a board is open
the pill reads **● Board open** (a press brings it forward, never a second board). With no board open it pulses
three times when class review projects, group review starts or a diagnostic goes out. The board header has a
**Fullscreen** button while not fullscreen (never in `/split`'s pane), and the board tries fullscreen on load where a
school's Chrome policy allows it.

Smartboard (`/board`, opened once from the laptop and left on the projector, nothing to press): blank (class and title) through
submission and individual review; during group review the race, five rows of four first names
with a colour, a large bar and the percentage, re-ordered as bars move, gold, silver and bronze
for the first three groups home (the other four groups play simulated boards, every try, hint and
return, on the same clock; the demo student's is live; a group sitting out has no row); the final standings held once group review is over; during whole-class
review one slide per problem, examples A/B/C with "n/m students" (the same columns the students
see, drawn by one component; lines never wrap, they shrink together in a narrow window), no names,
no marks until the teacher shows them, and the teacher's working pad. In class review the board takes
the pen anywhere on the slide (a circle round a line, a cross beside an example), with Undo and
Clear beside the mode toggle; a mark is pinned to the maths under it, so it lands on the same maths
on the laptop and every student's screen.
- **The pathway strip** (ticket 334, Class View and Mistakes of the live set): on the "← Edexia Classroom" line, right-aligned
  on the column's edge, in the same place on both tabs: the stages as pills with thin arrows between (indiv working →
  indiv review → group review → class review, only the set's), at the back button's 13.5 px. Stages over are the lit
  skill button's blue with white text, the current one light blue ringed in purple, stages ahead light blue, and a
  current stage everyone in the room is done with (every group finished before class review, say) blue ringed in
  purple. Beside the current stage: **force submit** (a size up; one press starts a one-minute grace on every student's
  screen, `● handing in 0:59 · Cancel` in its place, then the stage ends for everyone as it stands: the set handed in,
  the corrections handed in and group review begun, or group review over), `n/19 done`, and **end lesson** on a last
  stage that is not class review (its countdown, `● ending lesson · 4 not done · 0:59 · Cancel`, takes the place of all
  three). Class review has no button or count. A finished set shows no strip.
- **The decision card** (ticket 335, Edexia Classroom and the live set's Class View and Mistakes): once more than half of
  the students in the room (Sam included, the absent out) have submitted the question 70% of the way through the set
  (Q7 of 10), a card slides in once from the bottom-right corner, wherever the teacher is: "Most students are close to
  finishing. Let's discuss what's next.", "15 of 19 here have submitted Q7", the planned pathway as the strip's pills with
  what each stage does, and **Later** and **Keep**. It has no backdrop and moves nothing: every press beside it lands, and
  it never covers the strip or the split's diagnostic flyout or student panel (its own presses leave those open).
  **Keep** records the answer and the card goes for good. **Later** tucks it into a small purple dot on the strip's
  current pill and on the live set's Classroom card; the dot opens it again (from the Classroom, on the set's Mistakes
  tab). Ignored until the class leaves individual working (force submit, everyone handing in), it lapses and the plan runs
  as it was. A reload keeps it where it was. Sam's iPad shows nothing of it. **Change** (ticket 336), between Later and
  Keep, turns the card's pathway into the pathway line's toggles in place, top to bottom: indiv working in ink, each review
  in Create's look (on in purple with a ✓, off dashed with its description faded), and in ink any review a student in the
  room has already started (individual review once the first student hands in, group review once someone is at its gate,
  class review once someone is at its wait); Later and **Done**. Done changes the set's pathway for the rest of the
  lesson: both strips follow at once, and each student goes where the new pathway says at their next transition (hand-in,
  corrections handed in, group review done). Group review switched on mid-lesson makes its groups from the set's seating,
  the absent left out, on the same after-corrections rule. The group/class split (ticket 337) builds on it.
- **Mistakes** (`/teacher/a/pset-6/mistakes`; the old `/teacher/mistakes` redirects there): While the live set is on individual working the tab splits in two (ticket 315): **Where students are** on the left, a row per place in lesson order (Starting, Warm-up, Q1 … Q10, Handed in), each student a pill with their detail (the warm-up's skill, a hint, practice, back on the question), the step bar for warm-up and practice and the time in the row in whole minutes ("<1 min here", "2 min here"; dark purple from "3 min here", a student who could use a check-in, ticket 328), or once handed in the time the set took from the check-in ("took 7 min"), an empty row blank (ticket 327); pressing a pill opens that student's work so far over the column (ticket 316: their confidence answer, every question they have moved past with their marked lines, the question they are on "in progress"; Escape or a press outside closes it); **Where students went wrong** on the right, the cards below at half width with the counts in the header and the Live diagnostic at its top left, whose steps open over the left column. During individual review the tab keeps the split, and opening the set lands there (ticket 318): **Where students are** becomes Not started, Q1 … Q10 and Done reviewing, each question with a count of everyone still to fix it ("12 need to fix", blank at none) and each student once, at the problem they have open ("fixed 1 of 3", "2 min here"), Priya (nothing to fix) done from the start and the class joining Done reviewing as they reach the gate; when the column would not fit the pills drop their words, then their names; a pill opens the student's problems to fix with the first submission and the correction so far; the cards name only the students still to fix ("2 fixed · 3 still to fix"), and a card everyone has fixed shrinks to a thin "Q6 · everyone fixed" line. During group review the tab keeps the split and lands there too (ticket 319): **Where groups are** is a grid, a row per question and a column per group in review, each head the group's chip (filled once it has closed every question) and "n/m", each cell light blue (not in the group's queue), blank, green (solved), red (left for now) or dark red with ✕ (unsolved), the question on the board carrying that group's whole table, every present member's avatar in seating order with the ring in the group's colour around whoever holds the pen, sized to the cell (ticket 348); **Where groups went wrong** counts groups ("2 solved · 1 left for now · 1 still to go"), names group chips instead of students, and shrinks a card every group has solved to "every group solved". On all three stages the left column stays on screen while the cards scroll (ticket 346): it sticks inside the scroll region, a column taller than the region riding up to its foot first so every row can still be reached, and the rows fold or the pills shorten exactly as they did at rest. After individual review the title stands alone; problems first, the students who slipped on each under
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
  the right over the blank space, a little clear of the card (the problems never move), with that problem's step
  questions: one per step of the model solution, asked on a similar problem (Q1's on x² − 7x + 12: find the pair,
  factorise, find the zeros), stacked and all expanded, each headed by its step name and how many students slipped
  there on the original, every wrong option the analogue of a slip a student really made. A click on a step's card
  selects it (accent border, a tick), a second click clears it, and **send N to class** under the stack sends the
  selection as a chain in solution order; the flyout grows down with the page and collapses on the × in its top-right
  corner (on the split's box too, ticket 340) or as soon as the pointer leaves it (new mistakes arriving never close it, and what is selected survives the page being drawn again). Sending
  turns the Mistakes page into the chain's focused view under the same bar and tabs: `Q1 x² − 5x + 6 = 0 · Live
  diagnostic`, then every step of the chain side by side in solution order, the row centred (a step already asked keeps
  its counts, misconceptions and who picked what; the step being asked has the accent border; a step still to come shows
  only its question and options, dimmed), and centred under the row `1st of 3 · n/20 answered`, the one control
  (**force submit** with a five-second countdown, **next question**, **done**) and Withdraw; the control stays at the
  window's foot when the row runs taller. A long chain (Q2's five steps) narrows its cards to fit one row, stacking the
  options in one column. A switch to Class and back mid-chain shows the view again; **done** (or Withdraw) brings the
  problems back where the page was scrolled. The class's work stream stands still until done, so Mistakes rows do not
  pile up during the discussion.
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
  and what the student wrote back in a purple-bordered box. On Problem Set 6, a question the student took practice on
  (help on it, or the offer after a repeated slip, even left from the worked example) carries a small muted dot on its
  tile, What happened's line reads `Q2 after practice` and names the warm-up once beside the confidence answer
  (`Warmed up on fractions & non-monic factorising`), and the question's working says `after practice on non-monic
  factorising` beside its result; the score and Sam's own report are unchanged. A live diagnostic chain takes the whole board from the push until done, one step at a time: the question and its options, `1st of 3`, `14/20 answered`, the right option green only once every student has answered or force submit has closed the step (then the totals read over the responders), and the teacher's one control at the bottom right; never a count per option, a name or misconception wording. At the reveal each wrong option's cell also reads what picking it means, `If you chose A, you found a pair that adds to 7, not −7` (the lines hold their space before, so nothing moves). Each iPad shows the same step over whatever the student was doing: the first tap locks the pick in a neutral highlight with `Waiting for the class…`, and at the reveal the right option turns green, the student's own highlight goes, nothing is marked wrong, and the line under the options says what their own pick means: `You chose A, meaning you…`, or `You chose C, correct.`

## The Classroom's six sets

`/teacher` is the Edexia Classroom for 11 Methods (11MAM2, twenty students: Sam and the nineteen in
`data/classmates.ts`). Its heading, **+ New assignment**, the LIVE label and the live card are one pinned
region (ticket 216); only **Past** scrolls, under its edge, newest due first. Before Create there is no
Live section and Past opens in its place. Problem Set 6 stays in Live through every review stage and
moves to Past, done and first, when class review ends (ticket 234).

| Set | Due | New skills | Data |
| --- | --- | --- | --- |
| Problem Set 1 — Surds | Tue 25 Aug | surds | `data/pset1/` (ticket 211) |
| Problem Set 2 — Rationalising and expanding with surds | Fri 28 Aug | surds, binomial identity | `data/pset2/` (212) |
| Problem Set 3 — Expanding and factorising | Tue 1 Sep | binomial identity | `data/pset3/` (213) |
| Problem Set 4 — Non-monic factorising and completing the square | Fri 4 Sep | binomial identity, null factor law | `data/pset4/` (214) |
| Problem Set 5 — Features of a parabola | Mon 7 Sep | null factor law, binomial identity | `data/pset5/` (187, 210) |
| Problem Set 6 — Roots of a quadratic (live) | Thu 10 Sep | discriminant, null factor law | `data/assignment.ts`, `data/classmates.ts` |

Sets 1–5 are finished: each opens on Class, Mistakes, Groups and every student's report with all twenty
students' real working (every line in the set's evaluation table); the board and class review are the live
lesson's, Set 6's. Set 6 is created by Create (or any presenter skip) and streams in.

- **Review outcomes follow one group rule on every set** (tickets 332, 338). A report's "Correct after group
  review" and "Incorrect" read what the group worked after individual review: only the questions a member still had
  wrong, unfinished or not attempted once corrections were in, solved when someone at the table had it right first
  time or fixed it in individual review. Amber sat out Problem Sets 1 and 2 (every slip at the table fixed alone), so
  its four reports there show no group version. Each set keeps one question nobody at a table could explain (violet's
  Q10 on Set 1, mint's Q10 on Sets 2–6); where a rework had fixed it, that rework now slips again.

- **New skills are per set** (ticket 209). Every skill has one home in the taxonomy (null factor law in
  Functions › Zeros, the discriminant in Algebra › Equations, the binomial identity in Algebra › Expanding &
  factorising, surds in Algebra › Number). A set lists its New skills; on that set their evidence shows in the
  New skills column and drill instead of the home column, and on every other set under the home. No skill shows
  in two columns.
- **History** (tickets 215, 237). On a set's Class View, **see history** on a student and a click on a category
  pill stacks the student's results on the earlier sets that assessed that category (New skills: every earlier
  set's New skills result), at most five, oldest at the top, each pill reading its day ("MON 7 SEP"). Only real
  sets: Set 6's Graphing shows two (Sets 4 and 5), a category no earlier set assessed opens nothing, and Problem
  Set 1 has no **see history** at all. A pill opens the student's report on that earlier set inside this set's
  Class View (`?report=<earlier>&student=&open=`, this set's tabs), with a pulsing **← Return to PSet N** back to
  the history. Neighbouring pills, and the newest against today's, move at most one step gap ↔ developing ↔
  solid ↔ secure; Priya is secure everywhere. Sam's today on Set 6 is his live session, which the sheet leaves
  open (after a presenter skip his reasoning and graphing sit two steps from Set 5; see FUTURE_FEATURES.md).
- **The class story sheet** (ticket 210). `data/story.ts` is the single source for every student × category
  × set status and the patterns behind it; `specs/class-story.md` is generated from it (`npm run story:sheet`;
  `data/story.test.ts` fails while the two differ). `data/finishedSets.test.ts` checks every registered set
  equals its sheet column, and `lib/setHistory.test.ts` checks every set × student × category for jumps.

**Adding a finished set.** Author the set to its sheet column first (add the column in `data/story.ts` and
regenerate the sheet if it is a new set). Then a folder `data/psetN/` with `assignment.ts` (`PSN_PROBLEMS`,
ids `psN-q1` … `psN-q10`, and `PSN_ASSIGNMENT`: `id: "pset-N"`, the upper-case title, `due` as the card reads
it, `newSkills` each tagged in at least two problems), `evaluation.ts` (every line anyone wrote, keyed by
problem then exact TeX, doubled backslashes), `classmates.ts` (Sam's record and the nineteen, in class order,
every record full) and `index.ts` exporting `PSN: FinishedSet` (`data/finishedSet.ts`). Register it with one
line in `data/finishedSets.ts` and add `"pset-N"` to `scripts/laptop-check.mjs`. Nothing else changes: the
registry, the evaluation index, seating, the Classroom card, the tabs and history all read the list. Run
vitest (the shared suite and the jump test), then check:laptop.

## Deep links

`/student/a/pset-6?stage=<stage>` (or the older `/student?stage=<stage>`, which redirects there) sends Problem Set 6 if
nothing is sent yet and starts a fresh run at that stage (`overview`, `goal`, `practice`, `confidence`,
`working`, `feedback`, `waiting`, `frozen`, `rework`, `group-pass`, `group-discuss`, `report`,
`peers`, `history`). Add `&run=strong` for a run where every step held. Add
`&pathway=<p>` to create the demo assignment with that review pathway first: `none`, `indiv`,
`group`, `wc`, `indiv,group`, `indiv,wc`, `group,wc`, `indiv,group,wc`. Plain `/student/a/pset-6`
continues the stored run (back to the Classroom while the set is not sent); plain `/student` is the Classroom.
`/student/a/<id>/report` is Sam's read-only report on a Completed set (`pset-1` … `pset-5` always, `pset-6` once his
report is sent), what its card on the Classroom opens; any other set goes back to the Classroom.

Useful starts: `/student?stage=working&pathway=wc` (hand in, wait for the board),
`/student?stage=rework&pathway=indiv,wc` (rework Q4 to trip the guard, then project),
`/student?stage=feedback` (the detective sentence).

`/split?panes=student,teacher,board&layout=beside` opens that set of panes (`panes` is any of
`student`, `teacher`, `board`, comma-separated; `layout` is `stacked`, the default, or
`beside`). Plain `/split` reopens the last choice.

## Where things are

- `app/page.tsx` the presenter's chooser at `/`; `app/demo/` redirects the old `/demo` to `/`.
- `app/student/` the iPad: `layout.tsx` + `StudentShell` (the device and the lesson's clockwork), `page.tsx` Sam's
  Classroom, `a/[id]/page.tsx` + `StudentApp` the set (one screen per stage);
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
  evaluation, escalation, statuses, groups, report facts, mistakes, peers, versions; the line
  check for a blank step (`stepCheck.ts`: right, wrong with its misconception, or unreadable, on
  the one TeX grammar in `texEval.ts`; the same shape of statement with its numbers compared by value).
- `lib/pairs.ts` and `data/pairs.ts`: the worked example-problem pair's questions (Q* and Q** for every Problem Set 6
  question, a completion problem for every practice skill) and `blankSteps`, the one rule for which lines a student writes.
- `specs/` the two specs; `tickets/` one file per ticket; `architecture/` one note per ticket;
  the running record is `../ARCHITECTURE.md`, decisions are in `../DECISION_LOG.md`, deferred
  ideas in `../FUTURE_FEATURES.md`. The copy rule every screen follows is in `specs/spec2.md`.
