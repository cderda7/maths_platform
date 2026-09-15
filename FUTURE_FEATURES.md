# Future features — Edexia · Maths

Deferred ideas: if it came up and was not built, it goes here. Each entry says where it came
from and why it was deferred, so a later decision has its context. Newest at the bottom of each
section. Policy: every work session that scopes something out appends it here (see `CLAUDE.md`).
Hand-written notes live in `## Carson's notes` at the bottom; agents add sections above it and
leave it alone.

Pruned 2026-09-14: built, duplicated, rejected, demo-only and tiny tuning entries removed; dev
tooling gathered under its own heading above Carson's notes.

## The warm-up offer after the confidence answer (from tickets 71–72, 2026-09-11)

- **A teacher switch on the offer.** The warm-up is offered to every student who answers "not
  confident" or "not confident with…", never to one who answers "confident". A per-assignment
  setting (always offer / offer to the not-confident / never) is a classroom-store field and one
  branch in the reducer; deferred until a teacher asks for it.

## Review pathways

- **Edit the pathway after creation.** Teacher changes the pipeline once students have started;
  students already past a removed stage keep their history, students not yet there follow the
  new shape. Deferred 2026-09-09: pathway is fixed at creation in v3.
- **"Continue tomorrow."** A pacing node on the pathway map: pause the class at the end of a
  stage and resume next lesson. Becomes meaningful once the pathway is editable after creation.
  Shown on the map now as a dashed, disabled node.
- **Per-student pathway overrides** (a student who finished early goes to peers; a struggling
  student skips group). Not discussed in detail; noted as the natural next step once pathways
  exist.

## Whole-class review

- **"Follow along with me" rewrite mode.** Built 2026-09-10 (ticket 34) as "write with me": the
  student's pad goes live to copy the teacher's working, switchable per problem from the board.
  Still open: recognising or keeping that writing anywhere beyond the session, and a stroke
  channel instead of broadcasting the whole classroom state per stroke.
- **More views per problem slide.** v3 has two: unmarked, then marked (red and blue, no text).
  Deferred: an "examples hidden, predict first" view; the teacher's misconception note or the
  pattern clue shown under a red line; a correct/incorrect verdict badge per example.
- **Model-solution slide** after the examples.
- **Teacher live annotation / pen** over the projected examples.
- **Presenter view on a second device** (laptop or phone) showing names, notes, correctness and
  the next slide, with the board as a display-only mirror. Built in part 2026-09-10 (ticket 38):
  the board is display-only at `/board` and the laptop's `/teacher/board` holds the controls and
  the pad. Still open: names, notes and correctness on the laptop page, and the next slide's
  preview.
- **Swap an example mid-session** from the presenter view without names reaching the projector.
- **Class-level percentage variants**: per-subskill percentages, "n of m attempted", a footer
  for students matching none of the shown examples. Deferred: per-example "n/m students" only,
  denominator = students who handed in that problem.
- **Board slide for not-attempted students** or a prompt for them to attempt live.
- **Auto-record which examples were discussed** into the teacher's report for the lesson.

## Feedback and review design

- **Where else the red and blue step marks belong.** v3 removes red marks and per-problem slip
  counts from the student feedback screen and hides blue standouts there, because student-led
  review is now the whole individual stage. Their one student-facing placement in v3 is the
  whole-class *marked* view: the board shows marks on the anonymous examples and, at the same
  moment, each student's frozen screen shows marks on their own work. The user wants to expand on
  this (2026-09-09): candidates are the final report, the history view after whole-class review,
  a teacher toggle to reveal marks after individual review, and pathways without whole-class
  review that currently never show the student any marks.
- **"Still wrong or worse" detection on originally-wrong problems.** The v3 guard fires only when
  a correct problem is broken. Extending it to "your fix is also wrong" or "your fix is worse
  than the original" is a distinct design: it risks leaking where the mistake is. Deferred
  2026-09-09.
- **Teacher-set hint threshold** (hint at ≥ 1, ≥ 2, never) per assignment. v3 hints whenever at
  least one problem has a mistake.
- **Live count updates during rework** as an opt-in scaffold for younger students. Deferred to
  avoid the guess-and-check oracle.

## Group review

- **Persistent teacher settings for group formation**: never pair two named students, always
  pair, maximum group size, mix by confidence. Requested 2026-09-09.

## Force submit and pacing

- **Per-student grace extension** (teacher grants one student more time).
- **Force submit at a chosen time** ("hand in at 10:40") rather than now plus one minute.
- **Teacher-adjustable grace length** (30 s, 1 min, 2 min) per class.

## Data and platform

- **Derivations honour the chosen problem subset.** Ticket 19 (2026-09-09) filters the student
  screens to the problems the teacher picked, but `feedbackFor`, `versionsOf`, `reportFacts` and
  the teacher views still iterate the fixture's four problems (unchosen ones just have no lines,
  and the report says "of 4"). Thread the active problem list through `lib/` when the bank grows.
- **A real problem bank** larger than the six fixture problems, with search and tagging by
  subskill; the creation screen's list is the fixture today.
- **Multi-student student store** keyed per student; the classroom store is already shaped for
  it. Needed before any of the above runs with a real class.
- **Ink rendering in the history compare view** and in the teacher's original-vs-final view
  (with the student's consent setting), now that strokes are persisted.

## Whole-class review (from the build, 2026-09-09)

- **Star semantics under detective mode.** The star is now a bare marker (no caption) the student
  can set while working through the set and again in review (2026-09-10); the feedback list and
  the report show which problems carry one. The teacher's report still calls starred problems
  "right, but worth coming back to"; decide whether a star on a wrong problem should be shown
  differently, and whether the star should carry a one-word reason later.

## Skill hierarchy (from ticket 26, 2026-09-09)

- **A real auto-tagger** and a **step-granularity detector**; today tags and the `compounds` flag
  are authored per line, and tag confidence is stored but never read (confidence-tiered
  rendering later, without a data migration).
- **Tagger-proposed Unit Focus leaves** beyond the closed lists per unit.
- **A class summary row** of counts per category under the grid.
- **Live marked-up work for students** before submission, and the broader question of where else
  marked-up copy appears for students (the report drill shows it after the session ends).
- **General and Specialist Mathematics taxonomies**, as further versions beside `methods-1`.
- **Escalation by leaf or by group.** Ticket 26 counts mistakes per group so the classic demo
  moment (monic then non-monic slip → practice) still fires; a per-leaf counter would be stricter
  and a per-category one looser. Make it a teacher setting.

## UI copy

- **Add descriptions back selectively.** v3 strips every screen to the copy rule in spec2. Once
  the terse version has been used, decide screen by screen where a line of explanation earns its
  place (first-run tooltips, an optional "learn more" per screen, teacher onboarding copy).

## Warm-up (from ticket 27, 2026-09-10)

- **Video help.** The help menu lists "A video" as a dead link. Where the clips come from and how
  they are keyed to leaves is open (company decision, 2026-09-10).
- **A chain of follow-ups.** One follow-up per worked example today (`followUp` is recursive, so a
  second is a data change). Decide when the chain stops: a fixed count, or the student's choice.
- **Warm-up visible to the teacher.** The warm-up is deliberately invisible to the grid. A small
  "warmed up · asked for a hint" note on the student row is cheap once wanted.

## Warm-up chooser (from ticket 28, 2026-09-10)

- **Problem bank as the source of warm-ups.** Each warm-up step serves the hand-written practice
  for that leaf. The real thing draws (or generates) a problem from a bank tagged by leaf and
  difficulty; `warmupSequence` is the seam.
- **Perceived ease as data.** `EASE` is a fixed list. Make it per unit, or learn it from the
  class's leaf statuses.
- **A real interpreter for the chat.** `interpret` is a regex table over English skill words and
  "Qn" references. Replace with a model call that returns leaf ids and problem ids; keep the
  honest reply ("one problem covers … ; … can come in the set").
- **Practices per unit.** Every practice lives in Unit 1 algebra and graphs. Each unit needs its
  own so the chooser can serve a Unit 3 focus.
- **Quadratic equations as a warm-up.** Excluded from the warm-up focus (`NOT_WARMED`): it is the
  whole of this set, and isolating it made the warm-up as hard as the set (2026-09-10). Other sets
  will have their own "whole-set" leaf; make the exclusion per assignment.

## Hint links (from ticket 30, 2026-09-10)

- **Click for clarity.** The user described the light-blue words as a signal that the student "can
  click on it for clarity"; only hover was specified, so click does nothing yet. A tap or click
  could open a one-line definition ("the constant is the term with no x") or pin the lighting.
- **Touch.** Hover does not exist on the iPad. Tap-to-toggle (tap the word to light, tap again or
  tap elsewhere to clear), or light while the finger is down.
- **Words that name nothing in the expression.** "Axis of symmetry", "turning point", "the pair",
  "the picture" have no fragment to light. Either light the relevant part of a figure, or show a
  tiny inline sketch, or leave them plain (today).
- **Fragment addressing.** Links find a fragment by its text (first whole occurrence). A
  structured expression with addressable terms would remove the ambiguity and let the same
  mechanism light a term in the "Read as" lines and the worked-example steps.
- **Authoring at scale.** Fourteen practices have hand-written terms. A real problem bank needs
  the interpreter (or the model that writes the hint) to emit the pairs, then a check like the
  current test that every phrase and fragment resolves.
- **Lighting in the worked example.** The example's steps ("Found the pair: 3 × 4 = 12") could
  light the same 12 when hovered, tying the hint, the step and the problem together.
- **Branching in every line view.** "Read as" now shows a two-case line ("x = −2 or x = 1") as
  two half-width boxes side by side (2026-09-10). The marked views (feedback, frozen screen,
  history, the teacher's work panel) still show the line whole; extend `branchesOf` there, and
  decide how a red mark on one branch is drawn.
- **Right answer, wrong route.** "Check" in group review judges every known line and lets the
  final line decide (2026-09-10). A student can reach the correct final answer by a dysfunctional
  or incorrect strategy; a novel route is neither right nor wrong to the evaluator. Decide how to
  catch and surface that (a route check against known methods, a teacher flag, a prompt to
  explain the route).

## Group review on a shared whiteboard (tickets 36–42, planned 2026-09-10)

- **Individual verification after the group's last problem.** One short problem per student to
  recover the signal a shared board loses on the quiet student. Dropped from the plan; decide
  later whether it feeds the teacher's grid.
- **Force submit and start group review as one gesture.** Ticket 39's "start group review now"
  leaves a student still writing the set alone; the teacher presses force submit first. A single
  "move everyone to group review" that forces the set, then the corrections, then opens the gate
  would be one press.
- **Synthetic ink that looks like the line.** A peer's turn draws deterministic scribbles per
  line (ticket 40). Rendering the actual TeX as a handwriting font path, or recorded strokes per
  line, would make the mirror read as the working.

## Teacher on a laptop (from ticket 37, 2026-09-10)

- **The 0.8 zoom.** The teacher root is drawn at `zoom: 0.8` so the class grid fits; the ticket
  keeps it. Revisit whether the grid should instead reflow (fewer visible subskill columns with a
  horizontal scroll inside the table only) so text reads at full size on a 1280-wide laptop.

## The smartboard surface (from ticket 38, 2026-09-10)

- **Examples on the laptop too.** The controls page shows which problem is up and the board
  indicator, not the examples; the teacher reads them off the wall. Deferred: a small read-only
  strip of A/B/C on the controls page, if pointing at the wall turns out not to be enough.
- **A countdown on the board during the grace.** The board shows the first slide the moment the
  teacher projects, while students still have their minute. Deferred: "whole-class review in
  0:42" on the wall, so the room sees the same clock the iPads do.
- **What the board shows after End.** Blank today. Candidates: a closing card (problems reviewed,
  the class's most common slip), or the group-review standings again.
- **Hide my working from the wall.** The board mirrors the teacher's ink. A per-problem toggle
  ("just the students' pads", "just the wall") would let the teacher scribble privately.
- **A stroke channel.** Every teacher stroke still broadcasts the whole classroom state (noted
  under whole-class review); with three surfaces listening it is one more reason.
- **Join code or QR on the blank board.** The blank state is the class and the title. A
  join code for late devices, or the day's plan, are candidates for that empty wall.
- **Board typography for the back of the room.** Sized for a 1440 × 810 projector image; not yet
  checked on a 4K wall or a small classroom TV. A `?scale=` or a font-size step is the likely fix.

## Progress bar, leaderboard and medals (from ticket 42, 2026-09-10)

- **The platform's commentary is fixture text** (ticket 43). A classmate's ideas are authored
  notes and their clarification a scripted line; the demo student's ideas are the evaluation
  table's teacher notes, one per distinct note. A real build generates the 2–3 sentence
  commentary from the run and lets the student reply from their report screen (the reflection
  already exists; a reply threaded against each idea does not).

## Start screen as a grid of tiles (from ticket 47, 2026-09-10)

- **Skill chips on the start screen.** Gone entirely on 2026-09-10 at the user's request (the
  ticket-44 chip column). The warm-up chooser is the only place before the set where a skill name
  appears. If the student should be able to see a problem's skills before starting, a long-press
  or flip on a tile is the natural home; not built.

## Warm-up concerns chat (from ticket 48, 2026-09-10)

- **The chooser page.** Removed on 2026-09-10 at the user's request: the problem cards to tick,
  the skills-by-category panel and "warm up on these →". The confidence screen's ticks are the
  seed now. If picking by problem is wanted again, an answer in the chat can already name a
  question ("Q2") and its skills join the warm-up; a row of tappable problem labels under the
  textarea would make that visible without bringing the page back.
- **The chat reading the answers.** The questions are scripted from the ticked skills; the
  answers are stored and only mined for skill words and "Qn" references (`interpret`). Nothing
  replies to what the student actually said. A real tutor would pick the warm-up problem's
  difficulty, or its hint, from the concern ("I mix up the signs" → the hint about sign pairs),
  and the teacher could read the concerns on the individual view.
- **Concerns on the teacher's side.** The student's own words about each skill are in
  `warmup.messages` and shown nowhere. The individual view (ticket 43) shows the confidence
  answer; the concerns beside it, one line per skill, would be the natural place.
- **The open question for an overall answer.** A student who answered "confident" or "not
  confident" overall and still chose to warm up gets "Let's do a warm up. Tell me a little bit
  about what you'd like to warm up on." and, if the answer names nothing, the default factorising
  problem alone. The confidence screen could instead send an overall answer straight to a default
  sequence, or ask for skills at that point.
- **A done skill reopened.** A tap on a dark chip reopens that problem with its working still
  there; finishing it again keeps it done and moves on. There is no way to un-do a skill, and no
  fresh copy of the problem; a "try it again" that clears the pad for that problem was not built.

## Feedback summary chips and level column labels (from ticket 50, 2026-09-10)

- **Tappable skill chips in the detective sentence.** The three purple bubbles ("factorising",
  "non-monic factorising", "null factor law") are inert. A tap could jump to the first problem in
  the list where that skill slipped, or open the same skill drill the teacher's view has. Deferred
  because the review is meant to stay detective: the student finds the mistake, the app never
  points at a line.

## Debrief: a pane that matches the group's rework turns green (from ticket 51, 2026-09-10)

- **A correct version in different words.** Only a line-for-line match earns the green. A
  student whose rework checks correct by another route (say, the quadratic formula for Q1) still
  sits in a white box beside the group's green-worthy one. `functional()` already knows the
  version passes; a second, paler tint ("also right") or a small "checks out" word in the eyebrow
  would say so. Deferred because the user asked for the match case only.

## Whole-class review: writing on the smartboard (from ticket 54, 2026-09-10)

- **Board-sized toolbar.** Undo and Clear on the board reuse `PadSection`'s ghost buttons at the
  laptop's size, small for a wall. A larger toolbar variant for the board (and a pen colour or
  thickness for the projector) is deferred until the board is tried on a real smartboard.
- **The rest of the controls on the board.** Only the pad and the mode toggle moved to the board;
  previous / next, show marks and End stay on the laptop so the wall shows nothing the class
  need not see. If teaching from the board sticks, a small strip of those four could join the
  header.

## Student report: outcome tiles and the required reflection (from ticket 58, 2026-09-10)

- **Correct but dysfunctional problems, and how to batch them.** A tile lands in a "correct"
  column when no line of that version is wrong (the "every step held" rule), so a version whose
  lines are all right but that stops short of the answer, or ends on a line the evaluation table
  does not know, counts as correct on the student's report, while the group review's check
  (`checkBoard`) also demands that the last line be a known correct one. The user raised the
  open question of how to batch such "correct but dysfunctional" problems: their own column, a
  mark on the tile, folding them into incorrect, or a teacher setting. Nothing decides it yet;
  `problemOutcome` is the one place to change once it is decided.
- **Whole-class review has no column.** Only individual and group review produce a per-student
  check, so a pathway of `wc` alone shows two columns; if whole-class review ever records
  something per student (a diagnostic answered, a "write with me" version), a fifth outcome
  belongs between group and incorrect.
- **The practice line and the stars left the student's report.** "Practice · monic factorising ·
  Q2 · taken" and the Starred card were removed with the text card; the data is still in the
  session and on the teacher's report. If a student should see what they starred (to revisit it
  from the report), a star on the tile is the natural place.

## Mistakes view: students side by side (from ticket 62, 2026-09-11)

- **Wide problems scroll sideways.** Columns are at least 230px, so a problem with eight or more
  students scrolls horizontally inside its card; a wrap into a second row of columns, or narrower
  columns with smaller maths, is a possible alternative once real class sizes are known.

## Help chat (from ticket 69, 2026-09-11)

- **The two ways in as tappable choices.** The tutor asks "which one makes more sense to you?" in
  prose; a structured reply could render the two ways as buttons under the bubble so a tap answers.
  Deferred: the user asked for a conversation, and buttons would turn the question back into a menu.
- **A tutor's opening turn from the model.** The opener is fixed copy ("What's got you stuck?") so
  opening the chat costs nothing; a model-written opener could lay out the two ways before the
  student types. Deferred: it would speak before knowing what the student is stuck on.
- **The chat on the set's problems.** Only the practice pad has the chat; "I need help" on a problem
  in the set still goes to the skill picker and isolated practice. The brief would need the set
  problem's solution steps and the marked lines. Deferred until the practice-pad chat has been used.
- **Teacher's-eye view of the chats.** The lines are on the run per problem, so a teacher page could
  show what each student asked and where the tutor sent them; nothing reads them yet.
- **Ways in on the three single-way problems** (fractions, null factor law, conclusions) are left
  empty on purpose; the tutor is told there is one way. If a teacher wants a second framing there
  (e.g. "undo the division" vs "multiply both sides"), it is one more fixture line.
- **No rate limit or abuse guard on the route.** Anyone who can reach the app can spend on the key;
  fine for a demo on a laptop, not for a deployment.

## Fractions warm-up and the help button (from ticket 75, 2026-09-11)

- **The fractions problem has no second way in for the help chat.** Clearing denominators is the one
  route the tutor is told about; "work with the fractions as they are" (collect $\frac{3x}{4}$) is a
  legitimate second framing a teacher might want offered.
- **The other warm-up problems were not re-graded for difficulty.** The user found the fractions one
  too easy; monic, null factor law and the rest are unchanged and may deserve the same look.

## The fraction problem stays wrong after the individual review (from ticket 76, 2026-09-11)

- **The clue for the new slip is not shown to the student.** "Multiplied through by 3" and its clue
  are in the evaluation table for the teacher's views and the marks; the rework has no individual
  feedback screen after it, so the student meets the mistake in the group. If a second individual
  pass is ever added, the clue is ready.

## Several hints per problem (from ticket 78, 2026-09-11)

- **The worked example does not know which hints were shown.** Its steps follow the hints' path for
  the fractions problem by construction only; nothing checks the two agree.

## Every warm-up line is one step (from ticket 79, 2026-09-11)

- **The set's pair-check rows still pack two facts on a line.** Q2's and Q7's `ac = −8, 8 + (−1) = 7`
  and `2 × 4 = 8, 2 + 4 = 6`. Left as they are: those exact strings are keys in the evaluation
  table, lines in the classmates' scripts, Sam's Q7 rework and the group review's versions, so
  splitting them is a data change across every fixture and the versions diff. (Q5's turning point
  row was split into the height and the point in ticket 81, 2026-09-11, at the user's ask.) The
  warm-up bank follows the one-step rule and a test guards it; the set could follow once the
  evaluation table is keyed by step rather than by string.
- **The pad has no idea a row is "two steps".** The recognition is scripted, so the row shape is
  whatever the fixture says. A real recogniser would produce one line per burst of ink and the
  question of which rows to merge would be its own.

## Hints that read the student's work (from ticket 80, 2026-09-11)

- **A model-written hint from the brief.** The product version of ticket 80: one sentence written
  from the help chat's brief (problem, reference working, the read lines, the fixed hints as
  material) under the chat prompt's guardrails, with `pickHint`'s answer as the offline fallback and
  the thing to show while it streams. Deferred: the mockup should work without a key.
- **Hints for a slip, not just a position.** `positionOf` places the student by the step their last
  line matches; it cannot say "line 2 is wrong". The set's problems have evaluation verdicts per line
  (`lib/evaluate`) and the warm-up does not; once it does, a hint could carry `on: "slip"` and point
  at the line to check rather than the next move.
- **Hints for a path the reference working does not take.** The fractions hints follow one path
  (move the 6 first). A student who clears every denominator first is on a valid path with no hints
  written for it; `positionOf` will count their lines and offer whatever fits that count. A second
  hint list per approach (the help chat already has `approaches`) would fix it.
- **Real ink.** With a recogniser that reads what was actually written, `positionOf` should match any
  line, not only the last, and `at` may want to become a predicate on the lines. The `pickHint`
  signature is the seam.

## Hints pointing at the student's line (from ticket 82, 2026-09-11)

- **"Reference back to the student work in text."** The user's phrase; taken as the eyebrow's "your
  line 4" plus the lit fragment in that line. A fuller version would write the line into the hint
  ("In 3x/4 = 21/2, …"), which would let the hint read on its own in a transcript.

## The chat's emphasis and "How about…?" (from ticket 84, 2026-09-11)

- **Emphasis in the closing line and the help chat.** Only the concerns chat's tutor bubbles split
  `**…**` into bold. "Thanks. Let's start with fractions." and the pad's help chat render plain; the
  same `emphasis` could bold the skill there too, and the help chat's replies could name the move.

## Every point in the factorising warm-up has a hint (from ticket 85, 2026-09-11)

- **The spelt-out hint gives the two equations, not the answers.** One more ask could give the
  answers with the working ("x = −3 or x = −4, because …"), as a last resort before the worked
  example; deferred because the worked example already does that, step by step.
- **The hint texts hard-code the fixture's numbers.** "x + 3 = 0 and x + 4 = 0" is written for this
  problem; a generated warm-up would need the hints generated too, from the steps.

## "Another hint" opens the chat while the current hint is unused (from ticket 86, 2026-09-11)

- **The pad cannot tell a wrong line from progress.** A line the pad could not place counts as
  moving on, so a student who writes 2 × 6 = 12 under the pair hint gets the next hint rather than
  the chat. Real recognition could mark the line and keep the hint stalled, or open the chat on the
  slip.
- **The opening line is fixed.** "Let's talk more about hint 2 before another one. What is it asking
  you to do here, in your own words?" is the same on every problem. A per-hint opener (naming the
  linked words, or quoting the hint) is a field on `Hint`; a model-written opener is a first API
  turn with the cost and the 503 case that come with it (logged in the decision).
- **The tutor is briefed, not enforced.** Whether the model holds back the next hint is down to the
  brief's rule; nothing on the server checks its reply against the hint list.
- **Leaving the chat for the pad.** The tutor is told to send the student back to write the line,
  but the chat stays open in the read-as column while they write; a "back to the pad" affordance,
  or closing the chat when a line is read, was not asked for.
- **A stall could also gate the worked example.** The same "have you used the hint?" thought applies
  to "worked example" straight after a hint; not touched, since the example is the fuller help by
  design.

## The skill box in the chat (from ticket 89, 2026-09-11)

- **A tappable skill box.** The box names a skill the warm-up will open on; a tap could jump the
  pad to that skill once the chat is over, or show the skill's one-line description. Not asked for.

## The worked example as one column with a chat beside it (from ticket 90, 2026-09-11)

- **Asking about a step by tapping it.** "Question about a step?" still needs the student to say
  which; a tap on a step could open the box with "step 2:" typed, or light the step the tutor is
  talking about (the `data-step` hooks are there). Not asked for.
- **A "why this step?" quick ask.** One tap that sends "why step n?" for the latest step revealed
  would save the typing on an iPad. Deferred until the chat is seen used beside the example.
- **Enforcing "shown" server-side.** The brief tells the tutor which steps are on screen; nothing
  checks a reply against the unshown steps' TeX. A post-filter that blanks a pasted unshown step is
  possible if the model is seen leaking one.

## No help button during the worked example (from ticket 95, 2026-09-11)

- **No way to ask for a hint mid-example.** A student partway through the steps who wants the pad's
  hint, not the chat, has to finish the example first. The "Question about a step?" chat is the
  intended route; if it is not enough, the example's card could carry a small "hint" of its own.

## "Talk it through" on the hint card, the bare help menu (from ticket 99, 2026-09-11)

- **The pill on reopened earlier hints.** Only the latest hint carries "Talk it through"; a
  reopened hint 1 with hint 2 showing has none. If a student wants to talk about an earlier hint,
  the plain chat is there. A per-hint opener ("Let's go back to hint 1…") would be needed first.
- **The pill while the worked example plays.** Hidden, like "I need help" (ticket 95); the
  chat beside the example is headed "Question about a step?" and has no room for the hint
  opener. If the example's chat should also take a hint question, the opener would need a
  variant that names the step.

## Reflective listening in the concerns chat (from ticket 102, 2026-09-11)

- **A live reflection, not a fixed line.** The three reflections are fixed for the demo
  ("Gotcha. It sounds like…" is deliberately unfinished as the marker). The user: "add to F_F
  making this dynamic; i'll add API keys later." The live version: after each answer, one model
  call that restates the student's own words in a sentence or two (reflective listening from the
  empathetic-tutor framework), the skill name boxed as the questions do; then the fixed question.
  The reflection would be stored with the answer (it cannot be re-derived on reload, unlike every
  other tutor line), with the fixed line as the fallback while the call is out or fails, and the
  typing dots held until it arrives. Needs an API key and a server route; see the decision log.
- **A live closing line.** "Thank you for those insights. Let's start with ___." could likewise
  sum up what the student said across all their answers before naming the first skill.
- **The plain "not confident" student who names a skill mid-chat.** The user (ticket 102):
  "later i'll have it refactor after the general not confident student mentions a skill or two,
  & then iterate back through the questions & reflective listening." Today a student who ticked
  no skill gets one open question and, if the answer names skills (`interpret`), those skills go
  into the warm-up's focus, but the chat closes after that one answer. The future shape: after
  the open answer, the tutor reflects, then walks the named skills one by one ("How about with
  fractions?") with a reflection after each, then closes; the turn list becomes a function of the
  answers so far, not only of the seed.

## The 6 written as 12/2 in the fractions working (from ticket 106, 2026-09-11)

- **The step's label on screen.** Step labels ("Wrote the 6 over 2, to match the other fraction")
  reach only the help chat's system prompt; the worked example card shows the maths alone. A
  student who cannot see why 6 became 12/2 has to ask the chat.

## The "full sentence" box at the foot of the pad (from ticket 111, 2026-09-11)

- **Only the two worded problems ask.** `answerAs: "sentence"` is set on Q9 and Q10 by hand. A
  rule that reads it off the problem (a stem ending in a question mark, or a solution step tagged
  `reasoning.interpret.worded` / `reasoning.justify.conclusions`) would cover a new set without
  a flag; deferred until there is a second assignment to check it against.
- **Every problem.** If the box should appear after every problem's working (a sentence for
  "Solve for x" too), it is the flag on the other eight problems and nothing else.

## The factorising row and its kinds (from ticket 112, 2026-09-11)

- **Other rows with kinds.** The same fold could serve "graphs" (sketching, reading features) or
  "equations" (linear, quadratic, simultaneous); `pickerRows` is the one place to add a row.
- **A kind-only warm-up when the student ticks one kind.** Today one kind means one warm-up
  problem for that kind; the other kind is never offered as a follow-up. If the student slips on
  the monic problem, the non-monic one could be offered as the next step.

## The answer field under the working (from ticket 114, 2026-09-11)

- **Nothing reads the sentence yet.** `session.answers[q]` is typed and kept, but the report, the
  teacher's mistake view and the marking (`evaluate`) do not look at it; Q9 still reads as the
  compounded step whatever is typed. Showing it under the working on the history and teacher
  screens, and letting a complete sentence clear the communication slip, are the next steps.
- **No "done" signal.** The chat box has "send"; this field has Enter, which only ends the typing.
  If the sentence should be submitted (and the field lock), a pill or the hand-in could do it.

## The hand-in check and the star tiles (from ticket 115, 2026-09-11)

- **No way to close the card and stay put.** The card closes on a way back (a label, a tile, the
  jump), a pen stroke on the pad, or Confirm submit; there is no ✕ or Escape. A student on a blank Q10
  who wants to write it has to start writing, which does close it.
- **Blank means no recognised line.** A problem with ink the recogniser has not turned into a line
  (a stray mark) counts as blank and is listed. Counting strokes instead would treat any mark as an
  attempt.
- **Not-attempted problems are recorded, not shown.** Confirm submit puts the blank problems in the
  session's `notAttempted` (as the teacher's force submit does); no screen reads it yet. The feedback
  screen's rework list says "not attempted" from the lines themselves.
- **The check does not run for the rework hand-in.** The feedback screen's own hand-in (rework/done)
  has its guard and no blank check; a student who never reworks a broken problem is not asked.

## Incomplete problems on the handed-in screen (from ticket 116, 2026-09-11)

- **A slip made while finishing a problem that was blank at hand-in is never counted.** The
  user's instruction: finishing Q1 on the rework pad with a wrong step must not add to "N
  problems in your first submission contain a mistake." So this session tells the student nothing
  about that slip: not the mistakes box, not the chips, not the post-rework notice ("Every problem
  holds now." can follow a wrong rework of a blank problem), and the guard cannot fire on it. The
  teacher's mistake views read the rework as before. Decide later whether such a slip should show
  somewhere (a third line, a row marker, the notice), and whether the group review's
  correct-by-absence treatment of blank problems should read the rework too.
- **"Unfinished" on the teacher's side.** The teacher's report and the class views still show
  line counts and "not attempted"; the three-state progress (`progressOf`) could replace them so
  the teacher sees who stopped short as well as who never started.
- **Hand in with work outstanding.** The button stays enabled with incomplete problems (a forced
  hand-in with blanks is a path the teacher relies on). A confirm ("Hand in with 3 unfinished?")
  like the working screen's blank check could be offered here too.

## Teacher assignment creation as the landing screen (from a chat, 2026-09-11)

- **Preview as the student.** Because the tiles are the student's component, a preview is the same
  screen with the affordances hidden, not a second rendering. Cheap once the draft screen exists.

## The create screen: typing questions into tiles (from ticket 119, 2026-09-11)

- **Questions bigger than the tile.** The user: "no internal scroll. for rn we'll assume all
  questions will fit." A tile is fixed at the grid's square and clips (ASSUMPTIONS.md). A long
  worded question, or a focused tile whose text box plus rendering exceed the square, is cut off.
  Options: the focused tile grows and its row with it; the tile scrolls inside with a fade; the
  text shrinks to fit (`FitText`); a taller row proportion.
- **Adding a graph or figure to a typed question.** The user: "put adding a graph in F_F. we'll
  leave Q8 but yeah not possible to generate new graph organically." The bank's Q8 carries a
  `figure` id drawn by `components/Figure`; a typed question has no way to attach one. Options: a
  figure picker from a small library, an upload, or a function plotter fed from the expression
  (the expression is already TeX; a plotter would need it as a function).
- **Worked solutions, difficulty and skills per question.** The old screen showed difficulty tags
  and leaf chips; the create screen shows none (the user: "eliminate all this"). Where they
  belong, if anywhere, is the review screen's decision; the model solution (`Problem.solution`)
  the student's marking runs on has no source for a typed question at all.

## Genuine assignment creation, from nothing (from ticket 121, 2026-09-11)

- **From-nothing creation, next round.** What the blank flow needs before it is the product:
  where the questions come from (typing is one source; a photo of a textbook page, a paste from a
  PDF, "three more like Q4", the bank searched by skill, last term's set cloned), the typing
  convention taught (see "The create screen: typing questions into tiles"), sub-parts, figures,
  worked solutions or at least an answer per question so the marking has something to run on, and
  a real bank behind it (see "A real problem bank" under Data and platform). The seed should then
  go, or become a "start from the demo set" choice.

## The review step: difficulty, assessment, recommendations, pathway (from ticket 120, 2026-09-11)

- **Real labelling.** The difficulty labels come from matching a question's expression to the
  bank, then a fixture for the two draft-only questions, then a twenty-line heuristic (words in
  the stem, a context, a fraction or a root, "show that" or "exact"). A model that reads the
  question is the real thing; the popover to relabel is the correction either way.
- **Real assessment.** The three recommendations are scripted fixtures matched by expression. A
  real assessment would read the set against the unit's leaves and the class's current gaps and
  write its own reasons; the card shape (what, why, the evidence line, Accept / Keep as is, Undo)
  is what it would fill. The bar's three lines are the honest outline of what it would do.
- **Recommendations that react to the teacher.** A relabel never changes the assessment, and
  reassessing after Back replays the same three (with the answers cleared). Deferred: a live
  assessment would take the labels as input.
- **Editing a proposed problem.** The addition offers three alternatives and Try another; a
  teacher cannot edit the proposed text or write their own on the card. An Edit that turns the
  stem into the create screen's text box, or "add my own", would sit beside Try another.
- **The decline that is not honoured.** Keeping `x^2 + 5x + 6 = 0` leaves it in the assignment's
  `questions` but the student still runs the bank's −5x (see ASSUMPTIONS). Honouring it means the
  bank holding both variants with full solutions, hints and scripted slips, or the student side
  running on typed questions with a model solution generated for each.
- **The evidence behind the change.** "7 of 20 students slipped on the sign of the factor pair in
  monic factorising" is a fixture sentence. The real line comes from the leaf statuses the
  mistakes view already computes, for the previous set.

## The Pathway card marks where the class is (from ticket 129, 2026-09-12)

- **Who is not done.** Hovering the count could list the students still on the stage (the ten
  still working, the two not yet in at the gate), the way the confirm line of Force assignment
  submit counts them. Not asked; deferred.

## One column per identical working (from ticket 138, 2026-09-12)

- **Near-identical working.** Two students who differ by one right line (Q9's four-line and
  three-line routes to "h = 6") stay two columns inside one box; the user asked for exact
  matches only. A looser key (the wrong line plus the lines after it, or ignoring skipped
  right steps) deferred until a teacher asks why two columns look the same.

## The right count (from ticket 140, 2026-09-12)

- **Over the class or over those who reached it.** The box reads "n/20"; "8/20" on Q9 is eight
  of the eleven who reached it. The tooltip holds the split; a second number in the box
  ("8/11 reached") or a hover card deferred until the teacher asks.
- **Click to see who.** The box is part of the header, so clicking it opens the problem; a
  list of the right students (or the unfinished) on click deferred; the class view has the grid.
- **Q8 has no card.** Nobody slipped on Q8, so the view has no card and no box for it,
  though `rightCount` covers it; a row of the problems nobody got wrong ("Q8: 15/20 right,
  nobody wrong") deferred.
- **The live student's rework.** The count reads the first hand-in like the rows; a second
  number after review ("15/20 → 18/20") deferred with the rework view.

## The header row and the zoom (from ticket 142, 2026-09-12)

- **The zoom is a constant.** 0.72 is the user's 90% of 0.8; a teacher's own zoom preference
  (a control in the chrome, remembered per teacher) deferred; the browser's zoom still works on
  top of it.

## The student's pathway strip (from ticket 151, 2026-09-12)

- **The student's own position.** The strip shows the class's stage, as the teacher's card does,
  so on the report while other groups are still finishing it keeps group review ringed. A
  student-centric variant (the report, peers and history screens all over; the gate and the board
  group review; waiting and frozen class review) deferred until it is wanted; the decision is in
  `DECISION_LOG.md`.
- **A count beside the current pill.** The card's "N/20 done" would tell a waiting student how
  many are still to come; left off the header for room (the crumb can be long). The class-wait
  screen still shows the readiness count.
- **Tapping a pill.** The strip is not interactive. Tapping an over stage to see what happened
  there (the corrections, the group's board) deferred.
- **Everything over with no class review.** With a pathway that ends at group review, the class
  never leaves "group review" on either side (nothing marks the group stage over once every
  group is done); a stage-over rule from the standings deferred with ticket 129's card.

## Class review examples chosen by mistake (from ticket 148, 2026-09-12)

- **Another route to the same mistake.** An option's example is its largest identical column;
  a student who reached the same wrong line another way (Q9's four "h = 6" by two routes) is
  never the example. A second-level pick inside an option (route 1 of 2), deferred.
- **A name for a student, still.** The dropdown of names is gone; a teacher who wants one
  particular student's working (a strong student's standout route) has no way to pick it.
  A "by student" tail on the menu, deferred until asked for.
- **Other groups' fixes.** "fixed in group review" reads the demo student's group run only,
  because the other groups race on a script and never record attempts. When the other groups
  have runs, the badge should read all of them.
- **A mistake fixed for some, not others.** The badge fires when any member of the resolving
  group is on the mistake; the count still includes everyone. Splitting an option into fixed
  and unfixed halves, deferred.
- **The diagnostic in the picker.** A diagnostic result's per-option count could sit beside
  the matching mistake in the menu ("12/20 picked this on the diagnostic"). Deferred.

## Force submit per stage (from ticket 145, 2026-09-12)

- **The gate line is gone; force submit on indiv review is "start group now".** Ending
  individual review for everyone is what opened the gate, so one control does both. A separate
  "start group now" that waits for the corrections rather than forcing them is not offered.
- **No confirmation step.** "Force assignment submit" asked "N still working · 1 minute to
  finish" first; the button beside the pill starts the grace at once, with Cancel for the minute.
  A confirm line does not fit beside a pill in the 320 px card. If a teacher ever presses it by
  accident and misses the minute, an "undo the hand-in" for the last advance would be the fix.
- **Force submit on group review ends the scripted race where it stands** (`endedAt`), and the
  board's final standings hold there; a group that was mid-problem shows its bar short. A
  "finish the problem on the board first" grace for the group with the pen was not asked for.

## Submit on START's spot (from ticket 153, 2026-09-12)

- **One frame for every student screen's primary action.** Ticket 153 gives the confidence screen the start screen's frame by repeating its classes (`px-10 pt-6 pb-5`, `mt-auto … pt-4`, a `size="lg"` button) so Submit lands on START's rect. The other student screens (working, feedback, the group board, the report) each place their primary action their own way; a shared `ScreenFrame` / `PrimaryAction` slot would pin every screen's next tap to the same corner and make the alignment a property rather than a measurement. Deferred: the user asked for these two screens, and the working screen's actions live in the pad's own toolbar.

## Only unseen mistakes in the picker (from ticket 157, 2026-09-12)

- **Swapping two slots.** A teacher who wants A and B the other way round has no direct move:
  each menu hides the other's option. A drag or a swap arrow between slots, deferred.
- **A fourth slot.** Q7 has four options and three slots, so one mistake is always off the
  board. `MAX_EXAMPLES` stays three (the board's columns); a fourth column when the problem
  has four distinct workings worth showing, deferred.

## The teacher's goal for the class (from ticket 154, 2026-09-12)

- **The teacher sees the goal back.** Creation is the only teacher-side view of the goal for
  now; the assignment overview, the class view and the projected board could show it (and the
  board could open the lesson with it). Deferred until asked for.

## 2026-09-12 · Drag to reorder (ticket 150)

Press-and-hold reordering landed on the create screen, the review's difficulty grid and the class
review setup's example cards (`useReorder`, `lib/reorder`). Left out, and why:

- **The recommendations grid does not drag.** Step two's grid is the set as the answers leave it,
  with the assessment's addition appended and a changed question in its target's place; its order
  is the draft's, which the difficulty step and the create screen reorder. Dragging there would
  need the addition's position stored (an `order` on the review keyed by id, applied in
  `applyReview`). Deferred until a teacher asks to put the added question anywhere but last.
- **Undo of a move.** The create screen's one-step undo covers a removal only; a move is not
  undoable except by moving back. A move could join the same "Undo" line.
- **Moving several at once.** No multi-select; one item per hold.
- **The setup's order is not stored.** `order` on the class review setup is component state: a
  reload puts the cards back in assignment order (the ticks and examples reset too, as before).
  If the setup ever persists, the order goes with it.
- **The board's slide order after Project.** Once projected, the order is fixed (`wc/setup`);
  reordering from the board controls is a separate control.

## The student sees the board in class review (from ticket 161, 2026-09-12)

- **The student's own versions in class review.** The frozen screen used to show the student's
  handed-in and reworked lines with their ink; now it shows the board's examples. A way back to
  one's own work during class review (a fold-out, or a fourth column on request) is deferred: the
  user asked for the board's view, and the tagged example is the student's own mistake.
- **A tag when the student's mistake is not one of the examples.** The tag sits on the example
  whose exact mistake is the student's first hand-in's; a student whose mistake the teacher did not
  put up sees no tag at all (and a student who never attempted the problem sees none either). A
  "your response wasn't one of these" note, or showing their own lines as an extra column, deferred.
- **The tagged example's lines are a classmate's.** The example is the largest identical column of
  that mistake, so the tagged working can be a step shorter or longer than the student's own (Q2:
  the example has three lines, Sam wrote four). Showing the student's own lines inside the tagged
  column, keeping the board's letter, is a possible refinement.

## The roster's heads stick under the bar (from ticket 167, 2026-09-12)

- **The card's own sideways scroll in a narrow window.** Below the 1280 laptop the frame now
  scrolls sideways as a whole (the clipped card takes its content's width) where the card used to
  scroll alone. If the teacher side ever lays out for narrower windows, the roster wants a real
  narrow layout (fewer visible categories, or a horizontal scroller inside the card with the heads
  stuck by JavaScript) rather than either scroll.

## The title as the header's crumb everywhere (from ticket 168, 2026-09-12)

- **The stage names the crumbs used to carry.** "Warm-up", "Your report", "Where the class is
  finding it hard" and "Your working" no longer appear in the header. The warm-up is not on the
  pathway strip, so the warm-up screens now name themselves only in their own headings; if that
  reads as unplaced, the strip could grow a warm-up stage before "indiv working".

## The student report's full dot view (from ticket 169, 2026-09-12)

- **The browse drill is gone.** `HierarchyDrill`'s default export (categories → groups → skills one
  branch at a time, the work beside) had no user after this ticket and was deleted; its last
  version is at `ebd613d`. A compact one-branch view for a narrow surface (the iPad's report, a
  phone) would start from `SkillTree` and `WorkPanel` rather than from that.

## Assignment upload: what the interview scoped out (2026-09-13, tickets 170–173)

The interview that shaped tickets 170–173 (one extraction funnel for typed, pasted, dropped and
uploaded problems) settled the following as later, each on purpose.

- **Word documents.** Docx is not accepted; the bar says "export it as a PDF". A server-side
  conversion (LibreOffice or a docx-to-PDF service) is a heavy dependency for a one-step export.
  Deferred 2026-09-13 (Q13).
- **Google Docs links, PowerPoint, URLs dropped from a browser.** Only files and pasted images
  go in. A link needs fetching, auth and a converter; slides need a rasteriser. Deferred (Q6).
- **Server-side file storage.** Sources, thumbnails and figure crops live in the browser's
  IndexedDB; a draft opened on another machine has tiles but no thumbnails or crops, and nothing
  survives a cleared browser. Storage with auth, buckets and lifetimes is its own build (Q12).
- **More than the caps.** Twenty images or five PDFs per drop, ten MB a file, ten pages a PDF;
  extras are left out and named. A twenty-page chapter needs the cap lifted and progress per page,
  and a way to cancel a long extraction (Q6, Q25).
- **Marking a region or a page range before extraction.** Everything is extracted and the
  teacher ticks what to keep. A region picker (drag a box on the thumbnail) or "pages 3–5" would
  cut cost and noise on long documents (Q8).
- **Cropping as a fix tool.** A bad read is fixed by editing the TeX or by a plain-language Fix
  line; re-cropping the image region by hand is not built (Q5).
- **The model emitting worked solutions, answers, difficulty and taxonomy leaves.** Drafts are
  stem and TeX only; the symbolic grading engine is assumed to derive the rest (`ASSUMPTIONS.md`).
  When the engine is real, or when a teacher wants to see the answer under the question before
  students do, the extractor's prompt is the place (Q10, Q19, Q23). Difficulty labels and the
  recommendations on the review step stay heuristic and scripted for uploaded drafts too.
- **Uploaded and typed problems reaching students.** Create is a wall back to the demo set
  (`ASSUMPTIONS.md`); only the review pathway varies. A draft figure (a crop under the question)
  is shown to the teacher only (Q11, Q21).
- **The `$…$` delimiter and the shorthand grammar's future.** With the model normalising every
  typed line, the shorthand grammar (`lib/mathInput.ts`) is a preview only; whether to keep
  extending it, teach it, or let it fall behind the model is open. The explicit delimiter entry
  above ("Teaching the typing convention") stays deferred (Q9).
- **A re-extract button.** A tile whose read is badly wrong is fixed line by line or discarded
  and the file dropped again; "read this one again" from the source is not built (Q5).
- **Handwritten and photographed pages.** Screenshots and exported PDFs are the day-one inputs;
  a phone photo of a textbook page (skew, shadow, low contrast) goes through the same route
  untested. A deskew or contrast pass before sending is not built (Q6).
- **"Three more like Q4", the bank searched by skill, last term's set cloned.** Other sources
  into the same funnel (the from-nothing entries above); the funnel is built so they end in the
  same drafts and tiles (Q2).
- **Cancelling an extraction in flight.** A shimmer tile has no cancel; the request runs to its
  end. An abort per file is an `AbortController` the client already threads (Q16).

## Labelled category pills (from ticket 174, 2026-09-13)

- **The class view's roster still draws bare pills under chips.** The two reports now carry the
  category name inside the pill; the roster (`/teacher`) keeps its 28 × 13 pills and the header
  chips, since its columns are 80–132 px and a labelled pill would not fit the narrow ones. If the
  roster should match, its `columnWidth` would grow to the widest name's pill and the roster's
  1208 px budget at 1280 would need a trade elsewhere.

## The extraction route (from ticket 170, 2026-09-13)

- **Dropped lines are counted, not shown.** `done` carries `dropped`; nothing on the screen says
  "the model wrote 2 lines that did not parse" yet (ticket 171 could word it in the bar).

## Category history on the class view (from ticket 175, 2026-09-13)

- **Confidence and Set history.** Asked for as an option ("also option to show confidence & set
  history") and deferred in the interview: the cream sheet already spans through the Set column,
  so five stacked confidence words and five set counts above those cells would slot in without
  anything moving. The Set column is 64 px and the confidence column 84, so the stacks would carry
  short text (`10/10`, `low`) at the history pills' 9 px.
- **History mode for a second student.** One student at a time; a click on another row leaves the
  mode. Comparing two students' trails side by side (two rows un-faded, two sheets) was not asked
  for.

## "New assignment" above the Pathway card (from ticket 176, 2026-09-13)

- **Only reachable from the class view.** The pill left the bar, so Mistakes, Groups, the
  student report and the create screen itself have no way to a new assignment except the Class
  tab. If teachers start assignments from elsewhere, a bar entry (or a keyboard shortcut) could
  come back beside the name.

## No pathway strip on the report (from ticket 178, 2026-09-13)

- **A finished trail instead of nothing.** The report's header is blank where the strip was.
  A version of the strip with every pill in the "over" blue (the pathway as a record of what the
  class did) was not asked for; "just have blank" was.

## Pictures on the create screen (from ticket 171, 2026-09-13)

- **"No questions found" is silent about why.** A screenshot of a heading or a blank page gets
  the empty message; the model's own reason is not asked for.
- **Twenty parallel requests.** A 20-image drop opens twenty streams at once; the browser queues
  past six per host. A small pool (four at a time) would keep the first tiles arriving sooner.

## PDFs on the create screen (from ticket 172, 2026-09-13)

- **Password-protected and broken PDFs.** `openPdf` fails and the marker carries no thumbnail;
  the read then goes to the route, which sends the bytes to the model. A locked PDF should be
  refused on the tile with a word about the password; today it falls through to the route's
  answer.

## Typed lines through the model, Fix and figures (from ticket 173, 2026-09-13)

- **The reading dot is the only sign of a read; a failed read says nothing.** By the interview's
  choice (Q22 applied to typing). A one-time line in the bar the first time a read fails would
  tell a teacher on a machine with no key why their plain English never changes.
- **No undo for a Fix.** The undo line covers removals only; a wrong Fix is fixed with another
  Fix or by editing the text.
- **The Fix picture is the whole page.** For a PDF page with ten problems the model gets the page
  and the draft; a box per problem from the extraction would let the Fix send only its region.

## Edexia Classroom run (planned 2026-09-13, tickets 184–189)

- **Delete the live diagnostic, or move it into the review stages.** It stays on Class View and
  Mistakes for now, because the teacher will later push a diagnostic to interrupt students in the
  review modes; the user flagged that deleting it "might make more sense" (2026-09-13).
- **Insight into how individual review and group review went.** A finished set's Class View shows
  the individual working results only; what changed in review (who fixed what, which groups
  resolved which mistakes) has no screen yet (2026-09-13).
- **More than one class.** Edexia Classroom assumes Ms Okafor teaches one class (11 Methods,
  twenty students); a class switcher, per-class defaults and cross-class views are deferred
  (see ASSUMPTIONS.md, 2026-09-13).
- **A due-date picker.** Problem Set 2 is due Thu 10 Sep and Problem Set 1 Thu 3 Sep, fixed; the
  create review step has no due-date field (2026-09-13).

## Assignments and their routes (from ticket 185, 2026-09-13)

- **Report, compare, class review setup and the board are Problem Set 2's only.** They stay at
  `/teacher/report`, `/teacher/compare`, `/teacher/whole-class` and `/teacher/board`, wrapped in
  Problem Set 2's provider, because they read Sam's live session. Moving them under
  `/teacher/a/<id>/…` (a finished set's student report, its compare) is deferred to when a second
  set has that data (ticket 187 or later).
- **A row still on the set opens empty drills.** Its pills are not-seen until the student hands in, so
  "see dot skills" and history mode open on nothing, as Chloe's row always did; showing the live
  student's partial evidence while he works (as before ticket 185) is deferred.
- **The landing is decided once, in the browser.** The classroom and the session live in
  localStorage, so `/teacher/a/<id>` renders the chrome and then replaces itself; a server-side
  redirect needs a backend.
- **Resetting an assignment's groups to the class defaults.** `groups/reset` with an assignment
  returns its fixture copy; a "copy the class defaults again" action on the assignment's Groups tab
  is not built.

## Edexia Classroom cards (from ticket 186, 2026-09-13)

- **An insight on the live card.** The live card shows counts only; "top gap so far" (already
  computed for every card) could show once enough work is in, without flickering as it changes.
- **Card actions.** Archive, duplicate, reopen or delete a set from its card; the card is one link.
- **A side column.** The cards span the chrome's container; a side column (this week's lessons,
  class-wide gaps across sets) is deferred.

## Problem Set 1 and past sets (from ticket 187, 2026-09-13)

- **Past sets on the student side.** Problem Set 1 is teacher-side only; the student's own history
  and report for an earlier set (and a "last time you slipped on this" line in the warm-up) are
  deferred.
- **Re-opening a finished set.** A finished set's Class and Mistakes are read-only: no force submit,
  no live diagnostic, no class review, no group progress. A "review again" or "send a follow-up
  diagnostic on last week's gap" action from a past set is deferred.
- **Cross-set insight on Class View.** "Mia slipped on non-monic factorising in both sets" could be
  a line or a marker on the row; today it is only visible through history mode.

## Create from blank (from ticket 188, 2026-09-13)

- **Generate is one fixed set.** It always fills Problem Set 2 — Roots of a quadratic; a choice of
  simulated sets (Problem Set 3, a Surds set) or a generated set from a topic is deferred.
- **Creating a second time overwrites Problem Set 2.** New assignment after Create opens blank again
  and a second Create replaces the one live set (same id, a new start time); real multi-set creation
  needs ids per created set.
- **Confirm groups has no reset.** Moves stay until Create or Reset demo; a "back to the class
  defaults" link on the card is not built, nor an "also update class groups" option (see the run's
  section above).

## Multi-part problems (assumption added 2026-09-13)

- **Problems with parts (a), (b), (c) or i, ii, iii.** Every problem is assumed to be one part
  (`ASSUMPTIONS.md`), so nothing models a stem shared by parts, marks per part, or a part that uses
  an earlier part's answer. Real worksheets and exams are full of these; supporting them touches the
  problem data shape, the student's writing screen (which part is being answered), mistakes and the
  report (a mistake belongs to a part), the pathway and class review (examples chosen per part), and
  the create screen (see "Sub-parts (a), (b), (c)" and "Sub-parts as one problem" above). Deferred:
  the demo set has no multi-part problem and the assumption keeps every screen to one stem, one answer.

## No counts on the board (from ticket 202, 2026-09-13)

- **A teacher toggle to show counts on the board.** Removed outright; if a teacher ever wants the class
  to see how common an approach was, it would be a per-slide switch in the board controls, off by default.

## Live stream follow-ups (from ticket 189, 2026-09-13)

- **Stream after Sam hands in.** Once Sam hands in the class is past working and every classmate has handed
  in at once; an early hand-in jumps the counts. Letting classmates keep working through individual review
  needs the readiness arrivals and group review to read the stream too.
- **Jordan's work before he hands in on the report.** A classmate's individual report reads the full record
  even while they are still on the set; it could show only what has been answered, with "still working".
- **A per-event feed.** A small "Ethan submitted Q1 · 8 s ago" ticker on Class View or the Classroom card.
- **Unfinished work as its own event.** Liam's Q3 and Ethan's and Harper's Q9 (wrong, past their answered
  count) arrive with the hand-in; a partial-attempt event would let them arrive while the student works.

## Hint openers and hints on every warm-up (from tickets 198 and 203, 2026-09-13)

- **Follow-up problems on other warm-ups.** Only factorising has a "Try one more" follow-up. The new
  per-point hints make adding follow-ups for the rest mechanical.

## Talk it through lands in the chat (from ticket 204, 2026-09-13)

- **The on-screen keyboard on a real iPad.** The box is focused from an effect after the press, which
  desktop browsers honour. iPad Safari raises the keyboard only for a focus made inside the tap's own
  handler, so on a real tablet the cursor may sit in the box with no keyboard until tapped. The demo runs
  in a desktop browser; revisit (focus the box synchronously in the handler) when it runs on tablets.

## Warm-up skills left count as done (from ticket 205, 2026-09-13)

- **The teacher never hears which warm-ups were left unfinished.** `warmup.done` is the student's
  path only. Sending "left fractions after one line" to the teacher side would help pick who needs a
  word before the set; out of scope for a chip colour change.

## Fractions hints for the numbers (from ticket 206, 2026-09-13)

- **A student who adds 9/2 + 6 in one go.** Writing "… = 21/2" straight after "… = 9/2 + 6" skips
  the 12/2 line; the pad places it as line 3 and offers the x-terms hint, so the "over 2" and "add
  them" hints are never seen. Right for a student who can do it, but nothing checks the 21/2 was
  reached correctly (a student writing 15/2 gets no hint about it). Deferred: the ask was the missing hint.

## Group debrief without a note (ticket 218, 2026-09-13)

- **A lighter way for students to say what went wrong.** The written note ("Describe the mistake you
  made" / "your peers most likely made") was removed as too much cognitive demand. If the teacher
  wants that signal back, a one-tap choice from the problem's taxonomy mistakes, or an optional
  note after Next, would ask less. Deferred: the user wanted the step gone, not replaced.
- **The teacher report's "In group review" notes.** Removed with the note. A replacement could show
  how long each student stayed on the marks, or whether they fell behind the board.

## Classroom pinning and ordering (from ticket 216, 2026-09-13)

- **Filtering or grouping past sets.** With six sets a scroll is fine; a term's worth would want
  grouping by week or unit, or a search.

## A problem the group cannot get (tickets 221–223, 2026-09-13)

- **A student who got it right helps the stuck group.** Raised with the ladder: the teacher could
  send a student who solved the problem (Priya on Q7) to the group before or instead of the hint.
  Not answered when the ladder was agreed; the ladder was built without it.
- **Linked words in the board's hint.** The practice pad's hints light the part of the problem a
  word points at; the board's hint is the evaluation table's clue, with no terms. Terms per wrong
  line of every set problem would be needed.
- **The teacher sees the hint go up.** The teacher's class view does not show that a group has
  reached the hint, only (ticket 223) a problem it could not solve.
- **Thresholds per problem or per group.** Hint after 2, leave after 3, close on the return are
  fixed; a teacher setting, or thresholds that follow the problem's difficulty, were not scoped.

## Group intro leftovers (ticket 220, 2026-09-13)

- **Reading pace per student.** The read is 130 words a minute for everyone. A student with a
  reading support plan, or English as an additional language, may need longer; a per-student
  multiplier set by the teacher (the board would still open for the group together) was not scoped.
- **Read aloud.** A play button that reads the two paragraphs, for students who read slowly.
  Deferred: no audio anywhere in the build yet.
- **Teacher-edited message.** The paragraphs are fixed in `lib/groupIntro.ts`. The teacher could
  write their own at Create, like the goal (ticket 154), and the read time would follow the words.
- **Show it once per student, or shorter the second time.** Every group review shows the full read.
  A student on their fifth set might get a one-line reminder instead. Deferred until there is more
  than one set's group review in a run.

## New skills per set follow-ups (from ticket 209, 2026-09-13)

- **Tune or explain the inference.** Create reads "met" as assessed under its home in either of the
  last two sets, and needs at least two problems. A one-line reason per chip ("not in Sets 4 or 5")
  or a teacher setting for the window would make the suggestion easier to trust. Deferred: two sets
  and two problems reproduce the agreed lists, and every chip can be switched.
- **The unit eyebrow is separate from New skills.** `Assignment.unit` still names "Unit 1 · Topic 1".
  Create no longer infers a unit (the Unit focus card is gone), so a created set in another unit
  would keep the fixture's eyebrow. Deferred: every set in the demo is Unit 1.

## Leaving a problem for now (ticket 222, 2026-09-13)

- **The pen-holder chooses to keep going or move on.** The third wrong check leaves automatically
  after 6 s; a group that feels close cannot stay. A "one more go" control was not asked for.
- **More than one return.** A problem left for now comes back once; the ladder ends there. A group
  that was nearly there on its return still closes unsolved.
- **The unsolved debrief names what to look for.** It shows the three versions and says the class
  will look at it together; it could point at the step every version got wrong.

## The teacher and a problem the group could not get (ticket 223, 2026-09-13)

- **A nudge when a group reaches the hint or leaves a problem.** The class view's card shows the line
  once a problem is left; it does not alert, and says nothing at the hint (two wrong checks).
- **Unsolved problems sort first in class review setup.** The badge marks them; the problem list and
  the suggested examples keep their order (the problem rows are left alone, as asked on 2026-09-12).
- **The group's own last try as an example.** Class review's examples are the students' individual
  working; the group's four tries on Q7 are not offered as a candidate.
- **The report says what comes next.** The note says Q7 was not solved in group review; it could say
  it will be reviewed with the class, once the class review is known to include it.

## History pills follow-ups (ticket 215, 2026-09-13)

- **Hover detail on a history pill.** A real pill could show the set's title and the student's
  score in the category on hover. Deferred: the link opens the full set.

## Finished sets groundwork follow-ups (ticket 210, 2026-09-13)

- **Sentence answers in narrow Mistakes columns**: a problem with four or more distinct wrong workings shrinks each column so a long `\text{…}` answer overflows its box at 1280 (the fit clamps at 13 px and maths never wraps). Set 5's Q10 was folded to three columns instead. A real fix would give such a grid a wider floor (scrolling inside the card) or let a text-only sentence line wrap at word boundaries. Deferred: the data can avoid it and the rule "maths never splits" needs the user's call for sentences.
- **Board and class review on a finished set**: both are the live lesson's screens; a past set has Class, Mistakes, Groups and reports. Reopening a past set's class review (to reuse examples) was not asked for.

## Group review pacing (ticket 228, 2026-09-13)

- **A student who wants longer on a debrief.** The debrief now goes by itself at the end of the hold;
  there is no "stay" or pause. A student who was mid-thought is moved on.
- **The teacher (or presenter) chooses who writes.** The demo pins pens in data (`DEMO_PENS`); in a
  real class the shuffle deals them. A teacher override, or a "pass the pen" (FUTURE_FEATURES above),
  was not asked for.

## Classroom Live section (ticket 234, 2026-09-13)

- **A review-stage line on the Live card.** In review the Live card shows the Past line (tag, submitted,
  top gap). It could name the stage instead ("group review · 3 of 5 groups done") with the pathway's
  counts from `classStages`. Deferred: the user asked only that it stay in Live with the tag.

## Report working in the side column (ticket 233, 2026-09-13)

- **Fixed height budget.** The report fits because the live set's skill tree is about 420 px tall. A created set with many more skills could overflow again; a compact skills layout (two rows of categories) would be the fallback.

## Not yet card and the wiped board (ticket 235, 2026-09-13)

- **Bring the last attempt back onto the board.** A wrong check wipes the ink; a group that wanted to fix one line has to rewrite the lot. A "put it back" control beside Undo/Clear could restore the wiped strokes. Deferred: the user asked for the board to erase.

## Problem Set 2 follow-ups (ticket 212, 2026-09-13)

- **Conclusions leaf on a misread sentence**: Set 2's wrong Q10 sentences are tagged interpreting the question only, so "drawing conclusions in context" reads *not seen* on Amelia's, Isla's and Lucas's reports. Tagging them conclusions too would make one sentence a gap (the leaf has one line per set). A reasoning roll-up that weighs a one-line leaf differently was not in scope.

## PSET in the student header (ticket 236, 2026-09-13)

- **A short title a teacher writes.** Only "Problem Set N — …" shortens; a created set titled another way ("Quadratics review — roots, discriminant and graphs") still truncates beside the pathway strip. A short-title field on the create screen, or shortening words like "Unit"/"Topic" too, would cover it. Deferred: the demo's sets all follow the Problem Set pattern.

## Problem Set 3 follow-ups (ticket 213, 2026-09-13)

- **A show-that's own verdict for "claimed, not shown"**: Tomas and Lucas write a wrong line and then the true conclusion; the conclusion is marked right because the statement is true. A verdict for "a true line that does not follow from the one above" would let the teacher see the gap on the conclusion itself. Deferred: a new verdict kind across the evaluation, the Mistakes tab and the reports, not one set's data.

## Problem Set 4 follow-ups (ticket 214, 2026-09-13)

- **A "right after a wrong line" state**: Isla's Q5 writes x² − 3x + 10 = 0 and then the right factors; the table can only call the later lines ok. A verdict for "right, but not from the line above" would describe it.

## Try again pill and hint ring (ticket 238, 2026-09-13)

- **Tries left.** The pill could say how many checks remain before the problem is left for now. Deferred: it would add pressure and give away the ladder.
- **Sound or haptics.** A soft tap on the iPads as the pill pops. Deferred: the demo has no audio anywhere.

## History follow-ups (ticket 237, 2026-09-13)

- **Next/previous set inside the earlier report** (step from Set 4 to Set 5 without going back to the history). Deferred: out of scope.

## Step diagnostics (ticket 240, 2026-09-14)

- **Step diagnostics for sets made through Create.** Their problems have no class slips and no similar problem yet, so each still falls back to one fixed question (`FALLBACK_STEP`). Deferred: needs authored or generated similar problems and slip analogues per problem.
- **Figures in a step question.** Q8's "read the intercepts" step asks without a graph (the diagnostic has no figure slot on the flyout, the board or the iPad). Deferred: nobody slipped on Q8 and every surface would need a figure.
- **Generated similar problems and distractors.** All 33 steps are hand-authored and hand-checked. Deferred: generation needs a checker as strict as the unit tests before anything reaches a projector.
- **Common-slip picks from real data.** A few students who have not reached a problem pick a common slip by hand-authored name (Chloe, Liam, Grace, Harper, Jordan, Tomas, Oliver, Noah). Deferred: a model of likely slips per student would replace the list.
- **Slip counts per step from a mapping, not the wrong line.** A step counts a student when their wrong line is one a distractor mirrors, so one slip (Q1's pair) counts on both "Find the pair" and "Factorise". Deferred: fine for the demo; a per-step attribution of where a slip began would separate them.

## Pathway line (ticket 246, 2026-09-14)

- **Remember a teacher's usual pathway.** Every new set starts undecided; the last set's pathway could be offered as a one-press choice (never preselected). Deferred: the user wanted the teacher to choose each time.

## Mistake group labels (ticket 245, 2026-09-14)

- **The same labels on other clustered-name screens.** Class review's examples on the board and the live diagnostic's "who picked each option" (ticket 242) also group students by one mistake. Deferred: the user scoped the labels to the Mistakes view, where the review named the gap; those screens show the work beside the names already.
- **A count on the label** ("×5"). Not asked for; the names under it already show how many.

## Teacher report tiles follow-ups (ticket 243, 2026-09-14)

- **The second submission and the group's rework on the student's own report.** The student's tile still shows only their first attempt in the side column; the teacher now sees every version. Deferred: the user asked for the teacher's side.
- **The skills lit behind a problem while its working is open**, so the teacher sees which skills the problem touched. Deferred: the working covers the skills by the user's choice.
- **Stars on a record.** Only the live session keeps stars; a set record has none to show. Deferred: no data.

## Paced diagnostic chains (ticket 241, 2026-09-14)

- **Anonymous per-option counts on the board at the reveal.** Deferred: a lone student on a wrong option ("1/20 answered this way") could be embarrassed in front of the class. Could come back with a minimum count per option, or as percentages.
- **Withdraw from the board.** The board carries the one control only; Withdraw stays on the laptop (flyout and class card). Deferred: withdrawing is a teacher-side correction, not something to do in front of the class; add it if teachers stand at the board through a chain.
- **A chain across several problems.** A chain is chosen in one problem's flyout; selections do not carry to another problem's flyout. Deferred: the agreed flow selects steps within a flyout.
- **A shared clock across devices.** Reveals and refusals use each tab's own `Date.now()`, fine on one machine. Deferred: real devices would need a server time.
- **Stage timers pausing during a chain.** Only the classmates' work stream pauses; stage graces and group review timers run on. Deferred by the ticket.

## Who picked each option (ticket 242, 2026-09-14)

- **A mark for a student who got the step right after slipping on the original ("fixed it").** Only a repeat is marked. Deferred: not agreed; the plain avatar in the correct cell already says it.
- **Clicking an avatar to open that student's working on the original problem.** Deferred: not agreed; the hover names the student and the working is beside the flyout on the Mistakes view.
- **Marks from the student's whole record rather than the problems they have handed in so far.** A classmate who has not reached the problem in the live stream picks from their scripted work but gets no mark. Deferred: a mark claims "same slip as on Q1", which only a submitted Q1 can back.

## ICW plan after the CTO's feedback (tickets 250–259, 2026-09-14)

- **A walk-around mode for the teacher on an iPad or iPhone.** In an in-class lesson the teacher walks the room; a glanceable "who needs me now" list (help requests, stuck students, a rework that broke a problem that was right) would suit a phone better than the laptop's full views. Deferred 2026-09-14 by the user ("add to F_F — the ipad/iphone mode"): the laptop views come first.
- **Projector mirroring safety.** Many classrooms mirror the laptop to the projector, which would put the private teacher views (names, marks) on the board. Deferred 2026-09-14: the user chose to assume the display is extended, never mirrored (ASSUMPTIONS.md); the board's launch from the laptop is ticket 259.
- **Students with nothing to review (Priya).** A student with zero mistakes has an empty individual review. One idea: give them insight into classmates' mistakes and have them reteach a short mini-lesson. Deferred by the user: "pretty niche, while a good practice for both Priya & the class, many teachers wouldn't use it", and it adds another path when the CTO's concern is too many.
- **A protocol for mixed-ability group talk.** Going through a group's union of wrong problems tends to become the strongest student giving answers while the weakest student's mistakes are exposed (names are hidden on the board, not in the group). Roles (who explains, who checks, who writes) or turn-taking prompts could help. Deferred 2026-09-14 by the user ("fair add to F_F").
- **Correcting a wrong mark or a misread line.** With a real OCR and grading backend, a misread will happen in a pilot's first lesson; the teacher needs to override a mark and the student to say "that's not what I wrote". Out of scope 2026-09-14: the demo has no OCR and assumes a symbolic grading engine.
- **The homework model: individualised practice.** Ticket 256 only shows problem types going into a homework bank after the reflection; the practice itself (homework screens, choosing problems of each type, spacing) is the next product model after in-class work. Deferred 2026-09-14 by the user: refine the in-class model first.
- **The holistic page for a student reachable from more places (the Mistakes view, group review, the board setup).** Deferred 2026-09-14: agreed entries are Edexia Classroom's Holistic Assessment and a name in Class View (tickets 252, 253).
- **Homework that adds novel problems, not only similar ones.** Ticket 256 turns each wrong problem into a similar problem (same type, different numbers or set-up). Later the bank could also add new problems: combinations of skills the student has met separately, and extensions one step past what the set asked. Deferred 2026-09-14 by the user ("add to F_F thought of how to add new questions that also add novel problems, like combos of skills & extensions"): the homework model comes after in-class work.
- **A Classroom for every student.** Ticket 264 builds Sam's only. Deferred 2026-09-14 by the user ("we'll only do this for Sam"): Sam is the only student with a live iPad.

## Escape everywhere (ticket 247, 2026-09-14)

- **Focus trap inside modals.** Tab can still move focus behind a Scrim or the quick check. Deferred: not asked for; a trap would pair with the stack's walls.

## Absent students (ticket 250, 2026-09-14)

- **The student's own report and holistic page saying they were absent.** The teacher's student report for an absent student (`/teacher/a/<set>/report?student=chloe`) shows nothing about the absence; ticket 251's across-sets grid is where "absent" lands per set. Deferred: not in the ticket's list of screens.
- **Marking a groupmate absent after group review has begun.** The live board's run keeps the members it began with (pens, progress); only the scripted groups regroup. Deferred: absences are marked at the start of the lesson (ticket 255's first decision), and changing a run's members mid-turn needs its own rules.
- **The student side's peer statistics** ("missed by n of 19", `lib/peers.ts`) still count every classmate. Deferred: a student screen, and the ticket scoped the counts to the set's teacher screens.
- **An absence on a set's history pills and the Class View's history stack.** A pill for a set the student was absent from still reads the story's status (nothing, on PS1–PS5). Deferred: no earlier set has an absent student in the demo data.
- **Marking absence from other screens** (the Groups tab's chips, the Mistakes view, a quick "who's here" roll call at the start). Deferred: the ticket put the toggle on the Class View roster; ticket 255 raises the decision at the start of the lesson.
- **Absences affecting homework and the reflection** (an absent student gets the set as homework, or catch-up work). Deferred: the homework model comes after in-class work.

## Homework bank (ticket 256, 2026-09-14)

- **A way back from the homework screen to the report.** The screen has no back button; SKIP TO report reaches it. Deferred: ticket 264's Classroom becomes where a finished set is reopened.
- **More than one similar problem per type, or generated ones.** One hand-authored problem per PS6 problem, none for Sets 1–5. Deferred: only PS6 runs live; novel homework problems are already listed under tickets 250–259.
- **The teacher seeing what went into each student's homework.** Nothing on the teacher side shows the bank. Deferred: not in the ticket.

## A student across every set (ticket 251, 2026-09-14)

- **Habits matched by meaning, not only identical words.** The holistic page merges a habit only when its words are the same on two sets; "right split, the signs put into the wrong brackets" (PS4) and "right split, signs in the wrong brackets" (PS5) stay two rows. Deferred: a short label per habit is ticket 252's call ("a short label field in the data if needed").
- **Sam's own habits on the live set.** His Set 6 column is live from his session, but the page lists no habits for it (the sheet has none for a live row). Deferred: his session's commentary ideas could feed it; not asked for.
- **A trend line or arrow per category** (improving, slipping) beside the grid row. Deferred: the grid already reads left to right, and ticket 175 kept results an average, not a trend.
- **Printing or exporting the holistic page** for a parent meeting or report card. Deferred: not asked for.

## Sam's Classroom (ticket 264, 2026-09-14)

- **Missing sets being opened late.** A Missing card opens nothing; a real student would still hand the set in late. Deferred: Sam is never missing a set in the demo.
- **Status on a card beyond its section** (handed in, marked, the score, a due-soon or overdue flag). Deferred: the ticket asks for the name and due date.
- **A notice on the Classroom** (the post-rework sentence, a forced hand-in) waits until the set is opened. Deferred: it belongs to the set's next screen.
- **The student's Classroom when several sets are live**, and assignments other than Problem Set 6 being sent. Deferred: one live set in the demo.

## Record review follow-ups (ticket 244, 2026-09-14)

- **Habits carried by the group's rework.** The rules read literally leave nine cases where a habit reads "Correct after group review" because the group's single rework checked for a groupmate: Jordan and Liam on Set 4 Q1 and Q2 (Sam's repeated signs-in-the-wrong-brackets slip), Finn and Sofia on Set 6 Q2 (Oliver's repeated guessed pairs), and Liam on Set 6 Q1, Q2 and Q3 (the demo group's scripted run solves them). Deferred: the user asked for the literal reading and a list; a per-member "did it stick" mark beside a solved group version would let a habit stay wrong on a board the group got right.
- **"One-off" across sets.** A slip repeated set after set (Aiden scaling part of an expression) is a one-off on each set by the per-set reading. Deferred: fuzzy matching of habit texts across sets.
- **Per-group gating on the live set.** A classmate's group version shows once the whole class has finished group review (or class review starts); a group that finished early waits, and a teacher who ends group review early shows none until class review. Deferred: gate by that group's standing (`standingsAt`) and the run's `endedAt`.
- **Review that follows the Groups tab.** Records' group versions use the frozen seating; a student moved on a set's Groups tab keeps their old group's version. Deferred: finished sets' seating is not edited in the demo.
- **Sam's live second submission as a record.** Sam's Set 6 report reads his session; his finished records now carry review, his live one does not need to. Deferred: nothing to show.

## A name opens the holistic page (ticket 253, 2026-09-14)

- **Dismissals per teacher account, across devices.** The "did you know?" dismissal lives in this browser's localStorage; a second laptop or a cleared browser shows it again. Deferred: the demo has no accounts or server.
- **A general tips system** (a queue of one-time "did you know?" notes, one at a time, a "show tips again" setting). Deferred: one note was asked for; its key and hook are shaped so a second could follow.

## Holistic Assessment tiles (ticket 252, 2026-09-14)

- **The same slip across categories** (Tomas copies a bracket's sign in Graphing and in New skills) reading as one tag. Deferred: tags are grouped by category, as agreed.
- **Sorting or filtering the tiles** (most gaps first, by category, by habit, by name) and a name search. Deferred: not asked for; the class order matches the Class View.
- **A tag press opening that habit on the student's page** (scrolled to its row, or its first working). Deferred: the whole tile is one link, as the Classroom's cards are.

## Mark absent once handed in (ticket 270, 2026-09-14)

- **The reducer refusing `absence/set` for a handed-in student**, not only the roster's disabled button. Deferred: the reducer has no view of the live stream's progress at `now` or the finished records; only the roster dispatches it today.
- **Locking mark absent for a student mid-set on the live lesson** (warming up, a Q in progress), who also has work on screen. Deferred: the ask was sets already submitted; a student can leave the room mid-lesson.
- **A student marked absent who then hands in** (live set) being brought back automatically, or a prompt to. Deferred: the teacher's mark stands until they press mark present (no system-decides).
- **An "absent" override for a handed-in student** (a teacher who wants a submission left out of the counts, e.g. work done at home while away). Deferred: not asked for; the disabled button is the guard.

## Holistic grid turned (ticket 269, 2026-09-14)

- **A category chip on the holistic grid that opens that category across the sets** (its skills per set, as Class View's "see skills"): the user asked only for the look; deferred until a teacher needs a drill on this page.

## Whole question on teacher screens (ticket 271, 2026-09-14)

- **A figure thumbnail that opens full size.** PS6 Q8's graph shows as a small thumbnail beside its question (64 px, 120 on the live diagnostic view, 96 on board controls), too small to read its tick labels. Deferred: the user asked for a small thumbnail; a hover or press that opens it at 300×190 would let the teacher read the axes.

## Homework bank faster (ticket 274, 2026-09-14)

- **Showing what is in the folder.** With no count, nothing says how many types went in beyond the dashed slots; opening the folder to list them (with the other problems homework will have) waits for the homework screens.

## Holistic results open their skills (ticket 277, 2026-09-14)

- **A link from the problems to the set's report.** The problems panel has no "open in report"; the set's row head and the patterns' Q links still open the report.

## Skill tree closes on another row (ticket 280, 2026-09-14)

- **A way to the groups-only view from the roster.** A row tap and a pill both open the full tree now; the groups-only row view (the old single tap) has no entry. Not asked for; the column header's "see skills" still shows groups for every student.

## Patterns, recent ones only (ticket 276, 2026-09-14)

- **The page groups rows by pattern.** The student's page still lists a pattern's wordings as separate rows in set order (Tomas's "the fraction turned over dividing surds" on PS1 and "solved 2x + 1 = 0 as x = −2" on PS4 are one pattern three rows apart). The rows now carry their tag (`data-pattern-tag`); a row per pattern with its wordings under it would read the way the tiles do. Not asked for: the ticket changed which patterns surface, not how the page lays them out.
- **A per-student window.** The window is the class's latest five sets; a student who missed recent sets (Liam, PS3 and PS5) loses an old pattern he had no chance to repeat. A window over the sets each student sat was considered and left out (DECISION_LOG, ticket 276).
- **Hidden patterns on request.** A "show older patterns" disclosure on the student's page for what the window drops (ten PS1-only patterns once PS6 is sent). The user asked for them not to surface; a teacher looking back over a term may still want them.
- **The window's size as a setting.** `RECENT_SETS` is 5 in code; a term with more sets may want a teacher's choice, or a date window.
- **PS1-only patterns vanish the moment PS6 is sent.** Sending counts as an assignment before anyone hands it in, so the tiles change with the send. Kept to the rule as worded; a window that waits for the live set's first results would soften the jump.

## Group review takes every problem not right (ticket 278, 2026-09-14)

- **A student who hands in only 2 of 10.** Under the new rule such a student brings eight problems to their group, most of which the group then works for them. The user called it an extreme edge case; the demo data will keep every student at five or more (ticket 281). How a group should treat a member who barely started (a cap, the teacher told, a different debrief) is open.
- **A debrief on a problem the student had right first time.** Sam now debriefs Q4, Q5, Q6 and Q8, which only a groupmate never reached; his first submission sits green beside the group's rework. A lighter moment (no hold, or "you showed them") was not asked for.
- **Real-run pacing of a ten-problem board.** A real class with a long union may run past the lesson; a teacher control to cap a group's union (hardest first, or the teacher's pick) is not built.
- **An incomplete first submission reads as correct first try on the report.** `holds` counts a first submission with no wrong line as right, so Sam's Q9 (stopped before the height) sits under Correct first try though his group had to finish it. Seen in 278's click-through; left to ticket 282, which decides not attempted and incomplete tiles together.

## Dev tooling

- **The guard inside `npm test`.** `check:laptop` needs a built app on a port and a Chrome, so it
  stays a separate command (2026-09-10). A vitest wrapper that builds, starts Next on a free port,
  runs the check and tears down would make one command cover everything, at the cost of a
  minute per run; worth it once there is a CI job.
- **More sizes.** Only 1440 × 900 and 1280 × 800 are measured. Candidates: 1366 × 768 (the
  common Windows laptop), 1536 × 864 (1920 at 125 %), 1512 × 982 (14-inch MacBook), and a
  browser zoomed to 110 % / 125 %, which is how many teachers actually run a laptop.
- **Vertical fit.** The check is horizontal only. The board is `h-screen` by design; a vertical
  rule for the other pages (the live grid's header row and the first student visible without
  scrolling at 800 px tall) would need a per-page definition of "what must be above the fold".
- **Deeper states.** Each route is measured on a fresh load. An open skill drill, the diagnostic
  push modal, the force-submit grace pill, an assignment with every skill chosen, the groups page
  mid-drag and a whole-class session mid-projection could all be driven before measuring.
- **Student and presenter routes.** `/student` is a fixed-size stage and `/split` fits itself
  to the window, so they are out of scope here; a variant of the check over the iPad stage at
  the stage's own minimum window would catch a regression in `IpadStage`'s fit.
- **A screenshot on failure.** The failure names the element and its right edge; a PNG of the
  offending route in the scratchpad would make the fix faster.
- **The sweep's default port is 3121, shared with the laptop check.** Another agent's app on
  that port makes the sweep read their build; set `HINT_SWEEP_URL` to your own.
- **Fixtures from real worksheets.** The deterministic fixtures are rendered from the demo set;
  a real (licensed) worksheet or textbook page as a fixture would test the model on handwriting,
  scans and photographed pages (Q24).
- **Fixtures for handwriting and photos.** The rendered fixtures are clean KaTeX; a photographed
  or handwritten page fixture (licensed) would test the real cases. The render script is the
  place to add a page with skew or shadow.
- **The sweep does not open the chat.** `sweep:hint-boxes` now walks all 15 warm-ups and passes the stall
  notice, but checks only lit boxes. The openers are covered by the scratchpad click-through
  (`click199.mjs`), not a repo script. Fold a chat check into a checked-in script if the openers change again.
- **Guard against widening a hint when a step is added.** Ticket 106 added a line and stretched a hint
  over it rather than writing one. The ticket 199 test only requires some hint per point. A test that
  every warm-up hint has exactly one point would stop this, but some future warm-up may want a hint
  that honestly covers two lines; left as a review habit for now.
- **Retire the old-name map.** `lib/renamedSets.ts`, its redirects and its step in `migrateClassroom`
  exist only for browsers and links from before the rename. Once no demo machine holds pre-rename
  state, the map can be deleted with its tests. Kept for now because presenters' browsers carry
  state across days.
- **Session store has no version or migration hook.** It needed none this time (it holds no set ids),
  but a future rename of Set 6's `q1` … `q10` would. A `migrateSession` beside `hydrateSession` would
  be the place.
- **Retire `LEAF_ALIASES`.** The map exists for browsers holding pre-209 sessions and created sets.
  Remove it with its tests once no demo machine carries that state (see the ticket 208 note on
  `lib/renamedSets.ts`).

## Teacher "send assignment" opens Create (ticket 272, 2026-09-14)

- **Keeping the teacher's own draft through "send assignment".** The jump replaces any draft in progress with the demo's; stashing and restoring it was not asked for.
- **Opening the set from other student screens.** Only Sam's Classroom answers a jump by navigating; a jump that leaves nothing out takes him home through `StudentApp`'s not-sent rule as before.
- **A Create bar that never covers content at rest.** Since ticket 272 every Create step leaves the floating bar's whole height under its content (`CREATE_BAR_CLEARANCE`), so the last row scrolls clear of Back and Create; before scrolling, at 1280x800, the pair still floats over the Confirm groups card's violet column (Ruby's row). A bar in its own row under the scroll region, like the presenter strip, would never cover anything but costs every Create step about 70 px of height; not asked for.
- **Where an addition goes with no removal accepted.** It still comes last; choosing a slot for it (by difficulty, or by the teacher dragging it) was left out.

## Skill tree as a sheet (ticket 284, 2026-09-14)

- **The column view as an overlay.** A header's "see skills" / "full breakdown" still opens a row under every student and reflows the roster; a per-row overlay cannot hold twenty trees. Left as is (not asked for); ticket 280's anchoring still keeps the pressed row still.
- **Opening upward near the bottom.** A tree under the last students runs past the card and adds scroll room; opening it over the rows above when there is more room there was left out.
- **A close control on the sheet.** The sheet closes on its blank paper, another row, Escape or the row's "close"; no × of its own.

## Set score on the first submission (ticket 285, 2026-09-14)

- **The score after review beside it.** The Set column reads the first submission only; a second figure for where review left the student (the report's final columns) was not asked for and would crowd the column.
- **The score anywhere else.** The holistic page, the Classroom's set cards and the student's history show no per-set score; carrying it there was not asked for.
- **A class average or spread per set.** Not asked for.
- **Telling "ran out of time" from "wrong" in the number.** Unattempted problems score as not right (Grace 7/10 on Problem Set 5 with nothing wrong); a split such as "7/7 of 10" was left out, the missing and progress marks carry it.

## Teacher end lesson (ticket 273, 2026-09-14)

- **End lesson on the Mistakes tab.** Force submit sits in the Mistakes tab's title row too (ticket 185); end lesson is only on the Class View's Pathway card, as the ticket asked. The Mistakes tab's force submit waits while end lesson's minute runs.
- **Ending a lesson that has class review without projecting it.** A pathway with class review still ends only through class review's End; skipping class review on the day (the teacher decides there is no time) has no control.
- **Students whose tab was closed at the deadline.** As for every advance, a student tab opened more than a minute after the deadline (`STALE_MS`) does not apply it, so that student is not moved to the report; the lesson itself still ends from the teacher's tab.
- **Force submit on the last stage beside end lesson.** Both stay on the last stage: force submit ends the stage (students to their report) but leaves the set Live; end lesson does that and ends the lesson. Whether the last stage needs force submit at all, or end lesson should take its place, was not asked; the two pills stack above the count.
- **Presenter SKIP TO over the iPad's bottom notice.** At 1280x800 Sam's SKIP TO strip (fixed to the window) overlaps the bottom of any notice on the iPad (seen with "Your teacher ended the lesson." on the report) by about 10 px; a presenter-only overlay, not moved.

## The class data follows the group rules (ticket 281, 2026-09-14)

- **A student who hands in only 2 of 10** (the user: an extreme edge case). The demo data now keeps everyone at five or more; how a group and the report treat a member who barely started is open.
- **Students who fixed a problem on their own rework beside a group that left it unsolved.** The literal rule counts only first submissions as "had it right", so these read *own rework* while their table's last try stays wrong: PS1 violet Q10 (Oliver, Sofia); PS2 mint Q10 (Isla, Lucas); PS3 mint Q10 (Isla, Lucas); PS4 mint Q10 (Lucas); PS5 mint Q9 (Isla, Lucas, Harper), mint Q10 (Harper), sky Q4 (Sam, Zara); PS6 mint Q7 (Isla, Lucas), sky Q7 (Jordan, Zara; scripted), violet Q7 (Oliver, Ruby). A rule where a member's fixed rework can show the group (and the exception's place beside it) is the user's call.
- **Liam's Sets 3 and 5 could not stay *not seen*.** He had handed nothing in there, so five problems give every category he wrote in a result (chosen to sit one step from his neighbours). If the intent was to keep those sets missing, the data would need "attempted" to mean something other than handed in.
- **Liam's five on Sets 1, 2, 4 and 6 are shaped by the status rule.** Only lines in categories the sheet already saw: Set 1's Q3 and Q4 end on surd slips rather than his square-root habit (the collecting line is algebra); Set 4's Q3 is one line and Q4 has the right brackets then the fraction flipped (every factor-zero line is New skills or functions); Set 6's Q5 stops after the roots (every turning-point line is graphing). A less contrived story would need a status to move.
- **Group tries on the records.** Finished sets store only the group's rework or last try; the rule "a real member's slip before the try that holds, within two or three" is checked only on the live script. Storing tries would let the report show the group's path.
- **The sky Q7 return's last try** (the brackets' signs flipped, ticket 221's script) shows no slip a member made; re-scripting the presenter's own return was left alone.
- **Q1, Q2 and Q10 on Sam's board hold first time** though Sam slipped on them (278's scripts); showing his slip first would lengthen the presenter's board.
- **Pens on Sam's board**: Liam now writes his own Q5; Jordan holds the pen twice, Sam and Zara three times. A fairer spread was not asked for.
- **Harper as mint's only helper on Q10, three sets running.** Sets 2–4 each needed a status-safe repeated slip at a table with one helper; a class with more variety in who cannot do the last problem would need more authored work.
- **Class review picks** take the class's most common slip first, from a table that left the problem unsolved; the teacher's own choice on the live set (ticket 282) may differ, and a rule for picking a contrasting second example is open.
- **Regenerating review data** runs through a one-off generator (the rule plus hand-written last tries); a checked-in `npm run review:data` would make the next data change cheaper.

## Report: not attempted and covered in class review (ticket 282, 2026-09-15)

- **An "incomplete" word on an unfinished first submission.** Sam's Q9 now sits where its later versions put it, but its First submission pane shows only the lines; a *not finished* marker (as *not attempted* has) was not asked for.
- **Homework for an unfinished problem.** `everWrong` (`lib/homework.ts`) still sends only problems with a wrong line or nothing written; Sam's unfinished Q9 stays out of his homework bank.
- **The covered column during class review.** On the live set the column appears at the board's End; showing the covered problems slide by slide while the teacher is at the board was left out (tiles would move under a teacher reading a report).
- **Covered for a student absent from group review.** A problem class review covered stays Incorrect for a student whose group never took it on (absent that day); whether class review covers them too is open.
- **Covered on a pathway without group review.** With no group stage, any problem still wrong that class review showed is covered; no set has such a pathway, so it is covered by a unit test only, and whether that reads right to a teacher is untried.
- **Which examples the report shows.** The Class review pane shows every example the board showed, the correct working included when the teacher chose it; marking which one is the student's own approach (the frozen screen's "your approach") was not asked for.
- **A student's own report scrolling inside long working.** Sam's side column stacks up to four versions and scrolls inside when they run past Send (ticket 233's rule); fitting them without a scroll was not asked for.
- **The report's column floors as measured widths.** Label and note floors are constants checked by the click-through; measuring text at run time would survive a font or wording change.
- **An earlier set's report opened from history still scrolls at 1280×800.** The report shown inside a later set's Class View (`?report=…&student=…`, ticket 237) carries its pulsing Return button above the eyebrow, so with this ticket's fix it still scrolls 42–44 px (the fix here took about 44 px off it too). Fitting it means moving or shrinking that button, which ticket 237 placed; left for its own ticket.
- **Escape on Sam's report from a script.** A synthetic `keydown` on `document` (no bubbling) does not close his working though it closes the teacher's; real key presses do (ticket 247). Not investigated further.

## The chooser at `/` again (ticket 286, 2026-09-15)

- **A cold visitor's first impression.** Ticket 265's outside-review concern (the Student card first, so the student's report is what a newcomer sees) returns with `/` as the chooser; ordering the cards teacher first, or a short "start here" on the Teacher card, was not asked for.
- **A way back to the chooser from inside a surface.** The teacher chrome's brand is a label (ticket 184) and the iPad has no link out, so returning to `/` means typing it; a presenter-only link beside Reset demo was not asked for.

## Create strip: Refine and Send (ticket 288, 2026-09-15)

- **The strip on the Questions page.** The strip still shows only on the review route (Difficulty, Refine, Pathway); the Questions page, whose name is its first label, has none. Adding it there moves the title's neighbours and ticket 289 is about to put a due-date picker beside the title, so it was left for the user to ask.
- **Cancelling a send under the light.** Back and a second Create do nothing during Send's 600 ms; an explicit "undo" in that window was not asked for.
- **Internal step id `assessment`.** Refine's id stays `assessment` (the ticket allowed it); renaming it to `refine` across the review state, `data-step` attributes and click-throughs is a cleanup for when those are next touched.
- **A spaced glyph in "+In-Class PSet".** The button keeps its separate + glyph with the old gap, so it reads "+ In-Class PSet" on screen while its text is exactly "+In-Class PSet"; a tight "+In" was not asked for.

## Detective stage for weak students (raised 2026-09-15)

- **Tier the detective disclosure by how much of the set held up.** Individual review's detective sentence (ticket 21, `lib/feedback.ts`) gives every student the same message: how many problems contain a mistake, no locations, go find them. For a strong student with one or two slips that is a puzzle worth solving. For a weak student who got 1 of 10 right, "5 of your problems contain a mistake" is a search through nearly the whole set with no foothold, and reads as punishment rather than a puzzle. The idea: scale how much the app reveals to the share of the set the student got right. A mostly-right student keeps the bare count; a student with most of the set wrong is told where to look (which problems, or the first line that went wrong on some of them) so the rework is fixing mistakes, not hunting for them. Not scoped yet: where the tier boundaries fall, what each tier reveals, whether the teacher sees or sets the tiers, and how it sits with the no-location rule and the guard for correct problems made wrong. Deferred because it changes ticket 21's core rule and needs Carson's call on the tiers.

## Outside review of the lesson phases (raised 2026-09-15)

A phase-by-phase review of the student lesson, checked against the evidence each phase rests on. Its individual review point (tier the detective disclosure) is the section above. The rest follows in lesson order, through the report and homework. None is scoped or ticketed yet: each changes a core rule of an existing phase and needs Carson's call.

- **Warm-up: measure the prerequisites instead of asking about them.** Today the warm-up chat asks the student how they feel about three prerequisites (factorising, fractions, null factor law), and the answer fills the CONFIDENCE column on the teacher's class view. The review calls self-report the weakest tool in the product: a diagnostic platform opens its lesson with a feelings survey. Its example is Liam O'Connell, who says "confident" and scores 1/10. That confident-but-wrong cell is the most useful thing in the class view, and today it shows up only by luck. The proposal: three short prerequisite items, one per skill, each with a confidence tag. That gives the same confident/correct quadrant on purpose. The chat stays for the student's own words about their worries, which the review found useful, but it no longer decides anything (the warm-up offer, the column). Open questions: whether the items are marked or only feed the column, how the confidence tag is asked, what the teacher's column shows (two values or a quadrant), and how this sits with Carson's note on no prepractice of subskills below. Deferred because it replaces the warm-up's core instrument (tickets 71–72).
- **Individual working: a tripwire for a repeated error.** Silence while working (no right/wrong, live READ AS) is sound: deferred feedback, productive struggle, QCAA cognitive-demand bands. But nothing guards it. The reviewer made a sign error on Q1 and carried it through the whole set with nothing stopping them. The proposal: when the same error class shows up three times in one set, offer the matching prerequisite skill. It is an offer, not a correction: nothing is marked, and the student can decline and keep going. Open questions: whether three is the right count, whether it is per set or across sets, how live error-class detection works (the transcription would need to be classified while the student writes, not at hand-in), what the offer looks like on the canvas without breaking the silence, and whether the teacher sees that it fired. Deferred: it needs live classification of errors, which the product does not have yet.
- **I need help: a short run of minimally different items, not one example.** Routing to a named prerequisite skill, explicitly NOT MARKED, is the right instinct: break the skill down, keep the stakes low, give help that isn't the answer. The review found two problems with how it works. (1) It doesn't match the request. The reviewer said their trouble was the coefficient in front of x² and got a monic example. The practice item has to match the difficulty the student named, here a non-monic trinomial. (2) One isolated item teaches nothing. Practice is a sequence where one thing changes each time, so the student notices what stayed the same. The proposal: about five items that differ minimally (for example, the same trinomial with only the leading coefficient changing, then only a sign), built from the question generator for the named sub-skill. Open questions: who authors or checks the variation sequences, how the student's words map to a sub-skill (the chat already reads them), whether the student can leave partway, and what the teacher sees. Deferred: it needs an authored or generated variation set per sub-skill. Update (ticket 300, 2026-09-15): problem (1) is fixed. A student who ticks factorising and then names non-monic in the warm-up chat, including "the coefficient in front of the x²", now practises non-monic, and the I need help picker already did. Problem (2) stays deferred by Carson's call: a five-item run turns a short detour into a mini lesson. For now every practice skill behaves the same way: one problem, its worked example, then exactly one follow-up that changes one thing (a sign, a coefficient, the other case).
- **Class wait: cut the blank screen, fill it with spaced retrieval.** After hand-in the student sees a blank screen reading "3 of 19 handed in" until the class moves on. The review says to cut it: dead time is where behaviour goes, and nothing in the evidence supports it. The product already has each student's full skill history and a question generator, so the wait could become a spaced retrieval queue drawn from Problem Sets 1–5, weighted to the skills that student got wrong or hasn't seen in a while. Open questions: whether retrieval answers are marked or recorded (and whether the teacher sees them), how the queue stops cleanly when group review starts (mid-item), whether it counts toward anything (it must not change the set score, see ticket 285), and the item source (existing set problems versus generated ones). Note: the "3 of 19" count also reads against the class of twenty (Sam + 19); check whether that screen counts Sam when this is picked up. Deferred because it adds a new activity to the lesson flow.
- **Group review: every student works, and the board stops ranking.** Seating groups of four with a rotating pen, and instructions that teach how to discuss ("be gracious… advocate for yourself"), are peer instruction of a sort. The review calls it half right, and says the wrong half is the loud one. (1) Spectating. At any moment three of the four watch a peer write on their own screen, so most of the group is passive. (2) The board's live group percentage, re-ranked as it changes, is a leaderboard running over the discussion. It rewards the quickest student grabbing the pen and dictating, which is the opposite of what the instruction text asks for. The proposal: give the three without the pen something that needs them. Options: each commits their own answer or first line before the pen writes; each holds a named role (checker, explainer, questioner); or each writes on their own canvas and the group compares. On the board, drop the live ranking: show groups in a fixed order (seating) with progress that doesn't reorder, or show nothing until the teacher reveals it. Open questions: which way of involving the other three fits the seating groups (teacher-set, mixed ability) and the 2–3 tries a groupmate needs to fix a slip; whether a group's share of problems solved should show at all while it works; how the pen still rotates so no one student holds it; and how this sits with Carson's note on strong students reteaching during group review. Deferred because it changes group review's core mechanic (the shared pen) and the board's group view.
- **Group review: flag a group where nobody can explain a problem.** Nothing stops four students who share a misconception from agreeing, confidently, on the same wrong answer. Their slip is the same, so nobody in the group pushes back. The app already knows each student's error profile, so before group review starts (and on the teacher's class view while it runs) it could flag each group and problem where nobody got the problem right and everybody slipped the same way. The teacher then chooses: visit the group, send a student who got it right (see "A problem the group cannot get"), or save the problem for class review. This is a flag only. Groups stay the teacher's seating groups and are never regrouped by error. Open questions: what counts as "nobody can explain" (nobody right first time, or nobody right after individual review too), whether the flag shows on the board or only on the laptop, and how it fits with the ladder the group already gets (hint after 2, leave after 3, tickets 221–223). Deferred because it adds a new signal to the teacher's view during group review.
- **Class review: ask the class to commit before the teacher talks.** The review calls class review the best-designed screen in the product: the teacher picks problems by how many struggled, shows three real student solutions per problem (labelled by misconception on the laptop, anonymous and unlabelled on the board, privately tagged "your approach" on the owner's iPad), with screens frozen or write with me. It raises two points. (1) Write with me is copying. Copying feels like learning but is close to worthless, so the mode needs rethinking: the student writes the next line before the teacher does, or rewrites their own solution afterwards, not traces the teacher's (see Carson's note on write with me below). (2) The bigger one: three solutions sit frozen on every student's iPad (the review says thirty; the class is twenty) and nobody is asked to commit. One button on every iPad, "Which is right?" (tap A, B or C, or "none"), turns watching into retrieval and gives the teacher the class's answer spread before they say anything. The laptop shows the spread; the board does not, until the teacher reveals it. Open questions: whether the owner of a solution votes too (they know one of the three), whether the vote is anonymous to classmates, whether it is recorded or counts toward anything (it must not change the set score, ticket 285), and whether it is a third mode beside frozen and write with me or comes before both. Deferred because it changes class review's modes and adds a live response to the board flow.
- **Report: say the outcome ladder out loud, and show n on every skill.** The review calls the report the best idea in the product and says it is undersold. It replaces a score with a trajectory. "Correct after individual review" is a different, and in learning terms better, outcome than "correct first try", and the reviewer knows no other product that reports it. Pitch: put it front and centre in sales material and on the teacher's side, not only on the report's tiles. Its concerns: (1) about 25 skill nodes (Algebra, Functions, Graphing, Communication, Reasoning, New skills) on a small screen, with meaning carried by colour alone; a label, pattern or number is needed beside the colour (accessibility, colour-blind students). The student device here is an iPad, not a phone, but a phone view would make this worse. (2) A node coloured "developing 60–79%" from two items is noise that looks like measurement. Show n (the number of items behind each node), and fade or hold back the band until there is enough evidence, the same way "not seen yet" already does. Open questions: the minimum n for a band, whether n shows on the student's report or only the teacher's, and how the skill tree sheet (ticket 284) and holistic tiles (ticket 252) show it too. Deferred because it touches every skill surface.
- **Homework: roughly 60% current topic, 40% spaced retrieval of skills that are fading.** The review reads homework as "finish the classwork" and calls it a wasted asset. The product holds skill × set × date × evidence for every student, which is a forgetting curve nobody uses. The proposal: each student's homework is about 60% the current topic (today's similar problems from the homework bank, ticket 256) and 40% retrieval of earlier skills, chosen by how long since each was last shown correct and how shaky it was. The review calls this the highest-value unbuilt feature and says it is not hard. Open questions: the decay model (simple days-since plus last outcome, or a fitted curve), whether the 60/40 split is fixed or a teacher setting, where retrieval items come from for Sets 1–5 (no bank problems exist for them yet), how the teacher sees what each student got, and how it fits with tickets 290–295 (homework column, create and send, missed homework carrying over). Deferred: the homework model follows the in-class model (ICW plan, 2026-09-14), and tickets 290–295 are building its first version now.

## Completed set opens its report (ticket 287, 2026-09-15)

- **"Your working" on an old set's report.** The live report's history screen (`HistoryScreen`, every version of the final working side by side) is session-bound; the read-only report on PS1–PS5 and PS6 after Send has no way into it. Records hold first and second submissions, so a history for a finished set is possible; not asked for.
- **"Where the class is stuck" on an old set.** The mastery button (`isMastery`) is left off the read-only report; on a finished set it would need the classmates' records rather than the live stream.
- **When the report was sent.** The read-only report says "Sent to Ms Okafor" with no date; the records keep no send time.
- **A cue on the Completed card that it opens.** The whole card is the press target with a hover lift and press state, but no chevron or label; on a real iPad (no hover) a first-time student may not know it opens. Left plain so ticket 290's homework cells beside the cards have room.
- **Reports for the other nineteen.** Only Sam has an iPad Classroom (FUTURE_FEATURES, "A Classroom for every student"); every classmate's records already carry a `clarification`, so their read-only reports would need only a student switch.
- **The teacher's notes on the student's report.** The teacher's commentary ideas stay teacher-side; whether a student should see them on an old set was not discussed.
- **Measured tile rows.** What happened's one-row floor uses estimated tile widths (36 px, 42 for Q10) and a CSS `min()` against the card; measuring tiles would make "Q9 Q10" wrap exactly where it must and nowhere else.

## No example-problem pair anywhere in the lesson (raised 2026-09-15)

- **A third class review mode: the teacher works an example, then the class does a near-identical one.** An outside review points out that none of the lesson's nine phases does this: the teacher models a full method, and straight away the class gets a near-identical problem. It is the strongest result in the worked-example research, and it is how good maths teachers actually run a lesson. Neither existing mode does it. "Write with me" is copying: the student traces the teacher's lines. With screens frozen, the student watches and does nothing after. The proposal is a third mode beside the two. On the board, the teacher works the example while every iPad stays frozen. When the teacher is done, screens unfreeze onto a problem that differs from it in one thing (a coefficient or a sign, not a new structure). Each student works it on their own canvas. The teacher's laptop shows every student's ink coming in live, like the individual working view. The review notes every piece already exists: the board's writing, frozen screens, a student's canvas, live ink on the teacher's side, and the question generator for the near-identical problem. Open questions: whether the example is a class review problem (one of the ticked struggled problems) or a fresh one; who writes or checks the near-identical problem (generated from the example, or picked by the teacher); whether the student's attempt is marked or recorded, and whether it counts toward anything (it must not change the set score, ticket 285); what the laptop shows as ink comes in (every canvas, or only the ones that go wrong, with the error taxonomy); whether students who already got the original right still do the pair (see Carson's note on write with me below); how it ends (the teacher closes it, or it moves on once most have finished); and how it sits with the "commit before the teacher talks" vote (Outside review of the lesson phases, above). Deferred because it adds a new mode to class review and a new live view to the teacher's laptop.

## Due-date picker (ticket 289, 2026-09-15)

- **Fixtures' due dates as calendar days.** Created sets store an ISO day (`IsoDay`), finished sets still carry a label ("Mon 7 Sep") with no year; `dueOrder` sorts by month and day only. Moving every fixture to a day with its year (and sorting by it) waits for a second term or year, which one class in one term does not need.
- **A real "today".** `DEMO_TODAY` is fixed at Thu 10 Sep 2026 so the demo reads the same any day; a product reads the school's calendar and time zone.
- **Lesson days and the timetable.** The default is "the next lesson day", which for the demo is today's lesson; a timetable (which days the class meets, public holidays, school holidays greyed in the calendar) was not asked for.
- **A due time.** Only a day is picked; in-class sets are due at the end of the lesson and homework at a time the school sets.
- **Changing a sent set's due date.** The picker is on Create only; editing the date on a live set (from its Class View or the Classroom card) was not asked for.
- **Weekend days.** Saturdays and Sundays can be chosen; whether a school allows a weekend due date is a school setting.

## No variation, no intelligent practice (raised 2026-09-15)

- **Practice sequences, not practice questions.** Practice that doesn't vary one thing at a time doesn't teach students what the thing depends on. Today a set is a list of separately chosen problems: neighbouring problems can change the coefficient, the sign, the structure and the context all at once, so a student who gets Q3 right and Q4 wrong can't tell which change mattered. The idea: the unit of practice becomes a sequence where each item differs from the one before in one deliberate way (only the leading coefficient, then only a sign, then only the form it is written in), and the student is asked to notice what stayed the same and what the change did. This applies wherever the product hands a student problems: the in-class set built on Create, homework (the homework bank, ticket 256, and the 60/40 retrieval idea above), the I need help route ("a short run of minimally different items", Outside review of the lesson phases, above), the diagnostic's similar problem (ticket 240) and the example-problem pair (above). Open questions: whether a sequence is authored, generated from one seed problem, or picked by the teacher from a generated run; how the teacher sees and edits the dimension each step varies on Create (a Pathway-like line, ticket 246); how the set score (ticket 285) and skill evidence count items that are deliberately near-identical; whether a sequence contrasts on purpose (a case that looks the same but isn't, e.g. a difference of squares beside a trinomial) as well as varies smoothly; and how a mistake is read in a sequence (the step where it first went wrong names the dimension the student hasn't got). Deferred because it changes the unit the question generator, Create and the homework bank all work in, and needs Carson's call on how sequences are built.

## No spacing, no interleaving, no decay (raised 2026-09-15)

- **A forgetting curve on the skill map, and retrieval that feeds from it.** Once a skill reads Secure (100%) it stays Secure forever: nothing in the product lets it fade, so "Secure 100%" three weeks after the last time the student showed it is a claim the evidence no longer supports. Skills are also practised in blocks (one set, one topic) and never come back unless a later set happens to need them, so there is no spacing and no interleaving either. The idea has three parts. (1) Decay on the skill map: every skill status (secure, solid, developing, gap, `lib/hierarchy.ts`) weakens with time since the student last showed it correct, so the report's skill tree, the skill tree sheet (ticket 284), the holistic tiles (ticket 252) and the history pills show what is likely still true today, not what was true on the day of the set. (2) Retrieval into homework: the fading skills are what the 40% retrieval share of each student's homework draws on (Outside review of the lesson phases, above). (3) Retrieval into the wait gate: the same fading skills fill the class wait after hand-in instead of the blank "handed in" screen (same section, above). A retrieval item answered right resets that skill's clock; answered wrong, it drops the skill a step. Mixing old skills in with the current topic is the interleaving. Open questions: the decay model (a fixed half-life per band, days since last correct plus how shaky it was, or a fitted per-student curve); whether decay shows as a new colour, a fading of the existing colour, or a "last seen" note beside it (history pills already walk one colour step at a time and must not jump); whether the teacher and the student see the same decayed map; whether a skill's status on a past set's report stays as it was that day (it should: the report is a record) while the live map decays; how retrieval evidence counts toward skill status without changing any set score (ticket 285); and where retrieval items come from for Sets 1–5 (no bank problems exist for them yet). Deferred because it changes what every skill surface means and depends on the homework model (tickets 290–295) and a retrieval item source.

## Design tuner (ticket 296, 2026-09-15)

- **Round chips are not tunable.** `rounded-full` is a static Tailwind utility (a stadium), used by chips, avatars and round buttons alike; a "chip corners" control needs chips to use their own token so avatars stay circles. Deferred: the user asked about the status markers, which are tunable.
- **Type, spacing and shadows.** Display and body font choice, the type scale, a density control and card shadow strength would be the next levers; sizes and spacing change layout, so each would need the laptop fit check re-run under the proposal. Deferred to keep the first tuner to colour and shape.
- **Literal colours in SVG.** `components/Figure.tsx` (axes, curve, labels), `components/InkView.tsx` / `DrawPad.tsx` (the pen), the homework folder in `HomeworkScreen.tsx` and the medal ribbons in `app/board/Leaderboard.tsx` paint with hex literals, so the tuner cannot move them. The ribbons are deliberately their own red; the figure and folder could read tokens.
- **Several proposals side by side.** Space compares proposal against saved; named snapshots (A, B, C) with a key to cycle would compare two directions without saving either.
- **Hover a colour to see where it is used.** Outlining every element painted with a row's token while it is hovered, the inverse of ⌥-click.
- **Contrast readout.** A WCAG contrast figure beside text tokens against paper and cream, so a deeper or lighter proposal shows when it stops reading.
- **Sharing a proposal.** Proposals live in one browser's localStorage; a copyable link or JSON would let a proposal travel to another machine without saving it to the file.
- **The labelled category pill keeps `rounded-md`.** `SkillColumns`' pill follows the Corners scale, not the marker pill token; give it its own token if its corners should move with the small pills.
- **A unit test for the panel.** The panel is covered by the click-through (`tuner296.mjs`: drag, Space, undo, split, ⌥-click, markers, corners, reload, Save, pixel identity) and the model by vitest; no component test renders it.

## Diagnosis stops at the teacher (raised 2026-09-15)

- **"Build practice from this" on the student's profile.** The product finds what a student keeps getting wrong and then hands the teacher nothing to do about it. Sam's profile is the clearest case: across Sets 1–5 the slips are nearly all signs (a factor pair's signs swapped, signs put in the wrong brackets, a turning point read with the sign flipped, half of b taken with the wrong sign; `data/story.ts`), which calls for a sign-focused practice sequence. The system already has the diagnosis (patterns, ticket 276), the atomiser that breaks a problem into its steps and the question generator, yet the teacher still has to build that practice by hand, at 10pm. The idea: one button on the profile, "build practice from this". It takes the student's recent patterns, picks the steps where they go wrong, and generates a short run of practice aimed at exactly those steps (a sequence that varies one thing at a time, No variation, no intelligent practice, above). The teacher reads it, can change it, and sends it as that student's homework or as their I need help run. This is the feature that decides whether teachers are still using the product in week 9: a diagnosis that ends in more work for the teacher gets ignored once term gets busy. Open questions: whether it builds from one pattern or from every recent pattern (latest five sets only, ticket 276); whether it builds for one student or for everyone who shares the pattern (grouping by error is FF only and review groups stay seating-based, so this would be a practice set, not a review group); where it lands (a homework draft in the homework bank, ticket 256, a Create draft, or a per-student slot in the 60/40 homework split, Outside review of the lesson phases, above); how much the teacher must look at before it can be sent (no confirm gate on the button itself, but the teacher chooses what goes out); how the practice counts toward skill status and never the set score (ticket 285); and what the student sees it called (it describes what they do, never a trait). Deferred because it depends on the homework model (tickets 290–295) and on practice sequences, and needs Carson's call on how much the teacher reviews before it goes out.

## Behaviour, not traits (ticket 298, 2026-09-15)

- **Cross-topic error signatures as a first-class pattern.** Sam's seven patterns across five topics are one error (a minus belongs to the term that follows it). His summary names it by hand; the platform doesn't detect it. The patterns are grouped per category (`data/patternTags.ts`), so a signature that runs across categories has no place on the page or the tiles. A signature tag per student (authored first, detected from line-level mistakes later) could open the holistic page and the tile, and could target practice at the rule rather than the topic. Deferred: not asked for beyond the wording.
- **"Slip" as the teacher-facing word.** "3 slipped here", "No slips yet", "same slip as on Q1" read as a one-off lapse, where the holistic evidence often shows a systematic pattern. Not raised by the user; worth a wording pass with the same rule.
- **Trait words in hint and practice copy and in internal names.** Hint text ("a guessed pair can look right") and identifiers (`Q8_RUSHED`, `Q4_GUESSED`) and the "Detective stage for weak students" section title are not shown in any profile; left as they are.
- **Extend the trait-word test to every student-facing and parent-facing string.** Today it covers only the story sheet.

## Homework column (ticket 290, 2026-09-15)

- **Overlapping homework.** The model assumes a homework is due before the next is created (ASSUMPTIONS.md, HOMEWORKS NEVER OVERLAP), so every set belongs to one homework and the column has one cell per row. Two homeworks open at once (a long project homework beside a weekly one, a teacher setting next week's early) would need a set to belong to more than one homework and the column to show more than one cell a row. Deferred by the agreed model.
- **Homework cells beside To do and Missing.** The column exists only beside Completed. A set that is Missing still has its homework (its problems were never done, so nothing is "ever wrong" from it, but the teacher's 10 are); where that homework's cell goes when none of its sets is Completed is undecided: today it has no cell at all.
- **A homework finished late.** Missed is final and the caution stays for good; whether a student who finishes a missed homework later sees any acknowledgement (a "done late" note under the triangle) was not discussed.
- **The due date's time of day.** A homework is on time if finished on its due day and missed from the next day; a real school would set a time (start of the lesson, 9 am) and a time zone.
- **A real calendar.** The demo's day is fixed (`DEMO_TODAY`, Thu 10 Sep, ticket 289) and dates carry no year (`dueOrder`); homework status on a real product reads the clock and full dates.
- **Homework records for the other nineteen.** Only Sam has a homework history (`SAM_HOMEWORK_STORY`) because only Sam has a Classroom; the teacher's view of every student's homework status is ticket 291's future feature.
- **Pressing a completed or missed cell.** Cells are not pressable; reading back a finished homework (ticket 293's future feature) could open from the completed cell, and a missed cell could show which problems carried over.

## Practice offer tripwire (ticket 297, 2026-09-15)

- **"Same mistake" by kind of error, across topics.** The simulated student's tripwire was "same error class three times": a sign error in factorising, then a sign lost solving a factor, then a sign in a turning point. The counter keys on the taxonomy group, so those are three different topics and never trip. Needs an error-kind tag on every wrong line of every evaluation table (ticket 299's misconception ids could be it) and a rule for which practice a cross-topic kind points to. Deferred: the user kept same topic.
- **A third factorising slip in Sam's script.** The re-offer after "Not now" can't be shown on the iPad demo: Sam's pad has two factorising slips (Q1, Q2) and none after. A demo run that declines and slips again (or a presenter toggle) would show it, but every teacher screen reads Sam's scripted lines, so it ripples through the story data. Deferred: proven in the reducer.
- **Undo, then write a different wrong line.** A wrong line is counted once per `problem#line index`, so undoing it and writing another wrong line at the same position is not counted. The scripted pad always reads the same line, so it can't happen in the demo; real recognition would need the key to include the line itself.
- **How insistent a re-offer should be.** After "Not now" the offer returns on every same-topic slip, reading "third mistake", "fourth mistake"… Whether a second decline should quiet it for a while, or say something different from the first offer, was not discussed.
- **The offer's title and body name different things.** "2 minutes on expansion?" names the leaf the practice is on, "This is your third mistake on factorising" the topic (expanding is inside expanding & factorising, whose student word is "factorising"). Pre-existing; reads oddly when the practice leaf is not factorising itself.
- **Offering the prerequisite rather than the topic.** The review asked to "offer the prerequisite"; the offer goes to the most fundamental leaf slipped within the topic, not a prerequisite from another topic (expanding under factorising is within it). A prerequisite graph across groups would be needed.

## Misconception taxonomy (ticket 299, 2026-09-15)

- **Story patterns, tile tags and notes carry misconception ids.** `data/story.ts` patterns, `data/patternTags.ts` and the records' `notes` are free text tied to the data only by problem number and category. With ids, a student's pattern would be a misconception seen on two or more problems, the Holistic tiles could group by it across categories (the cross-topic signature Sam's summary names by hand), and the sheet's wordings could be checked against the lines they describe. Deferred: the user scoped 299 to evaluation lines; hundreds of wordings to sort.
- **Counts across classes and schools.** `lib/misconceptionCounts.ts` counts one class's sightings; "how common is null factor law without zero nationally" needs sightings stored per class (ids only, no names or working), aggregated server-side, and a denominator (students who attempted a problem where the misconception was possible, not just those who made it). No backend exists.
- **A misconception view for the teacher.** No screen shows the counts: a list of the class's misconceptions across sets (students, sets, trend), opening to the lines behind each, would be the teacher-facing use of the taxonomy. Not asked for.
- **Misconception-level diagnosis per student.** A student's misconceptions over the last five sets (the patterns window, ticket 276) as the basis for practice ("build practice from this", above) and for the detective clue.
- **Sorting a new line into the taxonomy.** Every id is authored per line today. A real evaluator would propose an id for a new wrong line from its `about` sentences (or say "none fits"), with a teacher confirming, and new misconceptions would be proposed when lines fit nothing.
- **Taxonomy governance.** Retiring and splitting ids (the rule is written, no code supports a retired id), versioning (`MISCONCEPTION_VERSION`), and mapping to an external taxonomy (Eedi's) so counts can be compared.
- **Grain review.** Some misconceptions are broad ("applied to some terms only" spans surds, factorising and fractions; "not what the question asked" spans a missing quantity and a swapped one). A pass with a teacher on where to split, before counts accumulate.
- **Top gap ties.** PS1's top gap is a three-way tie at three students broken by problem order; a card could show a tie honestly ("3 misconceptions on 3 students each") or rank by sightings second.
- **PS3–PS5 read the same top gap.** "brackets don't expand back" on three cards in a row is true but reads repetitive; a card could show the top gap's trend ("3rd set running") instead of repeating it.
- **Rename speculative wording in hints, clues and the sheet's reasons.** Clues and notes ("a guessed pair can look right"), review reasons ("one root found by trying") and practice copy still use the words the naming rule bans for mistake names.

## Misconception chips (ticket 301, 2026-09-15)

- **Open the misconception from its chip.** The chip opens nothing. A misconception view (ticket 299's future features: the class's misconceptions across sets, the lines behind each) would give it somewhere true to go.
- **A way back to the tagged skill from a red line.** The removed link took a teacher from a red line to the skill it was tagged to in one press; if that is missed, a quiet skill label beside the chip or in the line's tooltip could return it without naming the mistake by skill.
- **Student-facing misconception names.** Sam's report shows the teacher's names ("perfect square sign wrong"). A student-worded variant per misconception (like `studentLeafName` for skills) was not asked for.
- **The rework side of Compare.** A still-wrong rework line (Sam's Q7) is unmarked on the right by design, so it names no misconception; whether Compare should show that the rework repeated the same misconception is open.

## Homework create and send (ticket 291, 2026-09-15)

- **A teacher view of homework results.** Homework cards on the teacher's Classroom open nothing: who finished, who missed, which own problems each student got, how the class did on the teacher's ten. Deferred by the ticket: the demo has only Sam's homework history.
- **An "opens" date for homework.** A homework opens when its last covered lesson ends (ticket 292); a teacher might want to set when it opens (Friday afternoon, after a test) beside its due date on Questions. Deferred by the ticket.
- **Homework 4's own generated set.** +Homework after Homework 3 is sent starts Homework 4 (due Mon 21 Sep), but Generate fills in the same ten as Homework 3; a week's draft should follow that week's sets. Deferred: the demo stops at Homework 3.
- **Blocking a new homework while one is open.** The no-overlap assumption (ASSUMPTIONS.md) says a teacher does not create the next homework before the current one is due; +Homework does not stop them. Whether to hide +Homework, warn, or allow overlapping homework is undecided.
- **A goal message for homework.** Homework's Questions page has no goal box because nothing shows it to students; a note from the teacher at the top of the homework screen (ticket 293) could use one.
- **Where homework sits on the teacher's Classroom.** Homework cards are in Past among the sets, so Homework 3 shows under Past while it is still to come ("sent"); a Scheduled or Homework section, or Live once it opens, may read better once homework has a results view.
- **Editing or unsending a sent homework.** Nothing takes a sent homework back or changes its ten or its due date.
- **Homework's own assessment lines.** The assessing bar still reads "Checking coverage against Unit 1" for homework; homework's could name the week's sets and each student's own problems.
- **Refine for homework that knows the own problems.** The scripted assessment is fixed; a real one would check the teacher's ten against what each student's own problems already cover (the removal's reason says so in words only).

## Future panel and the homework gate (ticket 292, 2026-09-15)

- **Timetabled sets, not just the demo's Problem Set 6.** A homework waits for the lesson of every set in its window, and the only set counted before its Create is the demo's live Problem Set 6. A real class would need the week's timetable (which lessons are planned before the homework's due date) to know what a homework waits on. Deferred: one live set in the demo.
- **A homework whose sets never have a lesson.** If a covered set is created but its lesson is never ended, the homework waits in the Future indefinitely; a teacher control ("open now") or opening on the due date's eve could release it. Deferred by the ticket (opening is on the lesson's end only).
- **Taking an opened homework back to Future.** Once open, a homework stays open; the presenter's "send assignment" re-sends Problem Set 6 but leaves Homework 3 open. Ticket 295's shortcuts may want a way to rewind it.
- **A stamp moment for class review's End.** `wc/end` carries no time, so a homework opened by it is stamped at its `sentAt`; a timed `wc/end` would give the real moment for a "homework opened at" line.
- **Several homeworks in the Future panel.** The panel lists every waiting homework, but under the no-overlap assumption there is at most one; a stack of them would push the panel past To do's first row, over the column beside it.
- **Telling Sam when homework opens.** Homework 3 moves into To do silently; a toast or a pulse on OPEN when it arrives while he is on the Classroom could draw his eye.
- **The homework screen.** `/student/homework/<id>` shows only its heading and the way back until ticket 293 lists his own problems and the teacher's ten.
- **The teacher's Classroom's "opens after" line.** Sam's panel says what the homework waits on; the teacher's Homework 3 card still reads only "sent" until it opens.

## Practice follow-ups and the named kind (ticket 300, 2026-09-15)

- **The mid-set nudge practises the most basic slip, not the latest.** Two slips in one skill group (all of expanding & factorising is one group) offer practice on the easiest skill slipped on (`fundamentalLeaf` in `lib/session.ts`): a non-monic slip on Q2 after a monic slip on Q1 offers monic, and a non-monic slip after an expanding slip offers expanding. That is the opposite of ticket 300's rule for what the student names. Left alone because a detected slip is not the student naming a skill, and ticket 297 (tripwire) is reworking that nudge; needs Carson's call.
- **The concerns chat still asks about the kind it has dropped.** With factorising ticked as both kinds the chat asks about factorising, then "How about with non-monic factorisation?", even when the first answer already named non-monic and the warm-up has narrowed to it. The turns come from the ticks alone (`concernTurns`); a live tutor would skip the question.
- **The help chat cannot change the problem.** On the pad the chat can talk about the student's difficulty but has no way to swap the practice for the kind they describe ("my problem is the coefficient in front of the x²" on the monic problem). A tool call that reroutes the pad to another leaf's practice would close the gap.
- **Skill words are a regex list.** "Coefficient in front of the x²", "leading coefficient" and "a isn't 1" now read as non-monic (`NONMONIC_SAID` in `lib/warmup.ts`); anything else a student might say ("the ones with a big number first") still reads as nothing. A model reading the answer, as the help chat already does, is the real fix.
- **The follow-up is always the same problem.** Every skill's follow-up is one hand-written problem; a second visit to the same skill (the warm-up then the mid-set practice) shows the same pair. A small bank per skill, or generated follow-ups, would vary it.

## Homework presenter shortcuts (ticket 295, 2026-09-15)

- **A SKIP TO bar on the board.** The board has no presenter bar; homework's moments do not change it, so none was added. A presenter projecting alone might still want the jumps there.
- **Rewinding an opened homework to the Future.** "send homework" after Problem Set 6's lesson has ended re-sends Homework 3 and it opens at once, as the real send would; a jump that also restarts the lesson would show the Future panel again. Deferred: it means rolling back a lesson the presenter ended.
- **Sam's skips keeping a sent homework.** Sam's skips rebuild the demo from nothing and drop Homework 3 (only the +Homework mark survives), so after "working" the presenter presses "send homework" again. Carrying it would need a rule for a homework opened against a lesson that has started again.
- **Marking "started creating homework" from the create screen itself.** Only the +Homework press marks it; reaching `/teacher/homework/create` by typing the address or after Reset demo on that page does not. Deferred: the ticket names the press.
- **A landing for the teacher's own screen on "homework open".** It leaves the teacher where they are (as activity completed does); landing on the Classroom to show the card turn "open" is a one-line change if the presenter prefers.
- **Grouping the presenter's buttons.** The teacher's strip now holds five jumps in one pill; a divider between the lesson's jumps and the homework's could help once more are added.

## Homework screen (ticket 293, 2026-09-15)

- **Answering homework.** The screen is a read-only list; working a problem on the pad, with the same recognition, marking and review as a set, is the next step. Deferred by the ticket (no answering).
- **Done and undone marks.** No problem shows whether it is done; once answering exists, a mark per row and a count on the To do card and the HW cell. Deferred by the ticket.
- **Reading back a finished homework.** A completed or missed homework has no screen (only an open one renders); the HW1 and HW2 cells could open a read-only view of what was in them and what was done. Deferred by the ticket.
- **Snapshot a student's own problems at opening.** Problem Set 6's own problems read Sam's session as it stands, which equals the session at opening because no stage writes after the lesson ends; a real backend should store each student's list when the homework opens, so a later reset or a late rework cannot change it.
- **A similar problem for every problem.** Only Problem Set 6's ten and Problem Set 5's Q4, Q6 and Q9 (Sam's) have similar problems; any other student's list, or a problem without one, would leave it out. Generating (or authoring) a similar problem per bank problem with a shape check would lift that. Ticket 294 adds Problem Sets 3 and 4's for Sam.
- **One numbering with the teacher's.** Sam's list numbers everything in one run (his own 1–8, the teacher's ten 9–18) while the teacher sees Q1–Q10; a shared reference ("Everyone Q3") may be needed once students ask about a problem.
- **Where a similar problem came from.** A row does not say which original it replaces ("like Q4"), nor the type line the folder animation shows; a quiet link back to his report's problem could help him revise before starting.
- **Other students' homework screens.** Only Sam has a student view; each classmate's list follows from their records, but nothing shows it (the teacher could preview a student's homework from the report).
- **Lots of own problems.** A student who got most of two sets wrong gets a long list before the teacher's ten; a cap, or the dedupe of ticket 294 extended beyond missed homework, may be wanted.

## Error signatures across sets (ticket 303, 2026-09-15)

- **Detect a pattern's misconception from the lines, not author it.** 210 of 222 story patterns resolve from the student's wrong lines alone. The 12 ambiguous ones (a problem carrying two patterns' errors, or a line with two misconceptions) are why the id is authored and tested for now. A real class has no story sheet: patterns would have to be clustered from sightings (`lib/misconceptionCounts.ts`) directly. Deferred: the demo's patterns are authored.
- **Say which kinds of sign error in a signature.** A lit "Minus signs wrong" marks its patterns, but the chip and flyout don't break it down (e.g. "turning point and root signs ×3, factor pair signs ×2"). Deferred: not asked for; the flyout has room for one more line.
- **Practice aimed at the signature, not the topic.** "Minus signs wrong" across four topics suggests one short practice on the rule (a minus belongs to the term that follows it) in mixed contexts. Deferred: see FUTURE_FEATURES "build practice from the student's profile".
- **Signatures on the Class View and the teacher's per-set report.** A student's signature could flag a new slip of the same family on the live set ("again: Minus signs wrong"). Deferred: holistic page and tiles only.
- **A class-level signature view.** How many students share a family across sets, to plan a whole-class re-teach. Deferred: not asked for.
- **Tile category groups hold one-set patterns only now.** The tiles' collapse-by-tag logic (`holisticTiles`) never meets a multi-set tag any more; it could be simplified to one tag per wording. Left in place: harmless, and it keeps working if the threshold ever rises above two.

## Diagnostic misconceptions (ticket 302, 2026-09-15)

- **Diagnostic sightings on a teacher screen.** `diagnosticSightings` exists and nothing shows it: a student's pick of the same misconception their own working showed (ticket 242's repeated slip) could read as a confirmed misconception in the student's report or a misconception view.
- **Distractors designed from the taxonomy.** Distractors are authored per step. A generator could pick one distractor per likely misconception for the step's skill, so no two options share a misconception and every option's count means something distinct.
- **Grain of the seven distractor-only entries.** "wrong feature given" covers intercepts, the turning point, the axis, the landing and coefficients; "value substituted wrong" covers a lost power and a lost coefficient. Real student work may show these deserve splitting before counts accumulate.
- **Student-facing detail.** The detail is teacher-facing; a student-worded version after the reveal is ticket 304's `ifChosen`.

## Missed homework carries over (ticket 294, 2026-09-15)

- **The gap from a missed homework's teacher problems.** Only a missed homework's own problems carry; its teacher's ten are never done, so a student who missed Homework 2 never practises what the teacher set for that week. The user flagged this concern: the teacher (or the next homework's Generate) could see who missed which teacher problems and pick one or two of their skills back up, or the report could name the gap. Deferred by the user's call: carrying the ten too would double the load.
- **Per-problem homework progress.** A homework record keeps only the day it was all done, so a partly done missed homework carries every own problem, done or not. Once answering exists, carry only the undone ones.
- **Chains of missed homeworks.** Only the homework directly before carries; if Homework 1 and 2 were both missed, Homework 1's leftovers (which went into Homework 2) do not travel on into Homework 3. Deferred: the demo has one missed homework.
- **Show the student what was dropped as covered.** A dropped leftover disappears silently (the user rejected a "covered in current HW" note); a teacher-side view of which leftovers were judged duplicates, and by which problem, could let the teacher override the judgement.
- **One skill per problem, authored for every bank problem.** Problem Sets 1–4 read the outline's first leaf and 5–6 are tagged by hand; a teacher's typed question has no skill and never counts as a duplicate. A skill picker in the create flow (or inference from the model solution) would cover new problems.
- **Dedupe by a finer type than the taxonomy leaf.** Completing the square to a turning point and completing the square alone share the binomial identity, so one drops the other; a problem-type level below the leaf would keep more variety. Deferred: the user defined duplicate as the same taxonomy skill.
- **Teacher's view of a student's homework.** The teacher cannot see which leftovers carried into a student's homework; a preview on the report or the Class View would show it.

## If-you-chose lines (ticket 304, 2026-09-15)

- **Check each line against its option's maths.** `detail` is held to its option by maths checks in `lib/diagnostic.test.ts`; `ifChosen` only for coverage, typesetting, length and wording. A check that "adds to $7$" really is the pair's sum would catch a line left stale after an option is edited. Deferred: lines were checked by hand once; the numeric checks need a small grammar per line kind.
- **A reason on the right option.** The board shows lines for the wrong options only and a right pick reads "correct" (the user's call, 2026-09-15). A one-line why ("−3 and −4 multiply to 12 and add to −7") could reinforce the rule for students who picked it. Deferred: not wanted now.
- **Lines for generated diagnostics.** A set made through Create falls back to one fixed question; once its steps are generated from its own slips, each distractor needs its line generated with it. Deferred with generated steps.
- **The student's line after the diagnostic.** The iPad line goes when the teacher presses next or done. It could stay in the student's report beside the problem the step checked ("In the quick check you chose A, meaning…"). Deferred: not asked for.
- **Teacher-edited lines.** A teacher may word a line for their class, or turn the board lines off for a step they want to discuss first. Deferred: no editing surface for diagnostics yet.
- **Change the diagnostic's flow.** The user raised it with this ticket and withdrew it the same day ("no longer a concern"). Recorded in case it returns.

## Teacher homework column (ticket 305, 2026-09-15)

- **Count late finishers.** The cell counts only students who finished by the due date ("14/20 done"); a student who finished Homework 2 a day late (Jordan, Grace) counts nowhere. The user asked for this to be recorded: a second figure ("2 late") or a split bar would show the teacher who is catching up. Deferred: the agreed cell reads done only.
- **Press a cell for homework results.** Cells are not pressable; a teacher view of a homework's results (who did it, who missed, which problems carried) is already listed under ticket 291. The cell is the natural way in once it exists.
- **Live counts for an open homework.** Homework 3's count stays 0/20 because no student can answer homework yet; once answering exists, the count should rise live as students finish, as the Live card's submitted count does.
- **Homework records from real submissions.** Homework 1 and 2 for the class are authored demo data (`CLASS_HOMEWORK_STORY`); a real class would record each student's finishing time from their homework screen.
- **A column beside Live.** The column exists beside Past only; a Live set's upcoming homework shows nothing beside it. If teachers want to see what a live set feeds into, a muted cell beside Live could show it. Deferred: the agreed rule is Past only, matching Sam's side.
- **Narrow laptops.** The column costs every card 230 layout px; below 1280 px a title or top-gap chip could truncate. Deferred: the laptop sizes checked are 1280×800 and 1440×900.

## Worked example-problem pairs and Where students are (tickets 310–320, 2026-09-15)

- **An experiment: the three-step help against today's on-demand help.** Same set, same class, two conditions. The outcome is not the set score but right first time on the next set, and retention on a spaced item about three weeks later. Needs real classes and a record of which condition and which steps each student took. Deferred: the demo has one simulated class.
- **The skill map choosing where a student starts.** Solid skills could start at the completion problem and secure ones skip to the problem alone (the expertise-reversal argument). Rejected for now by the user: the student's own answer decides; revisit if students who ticked a secure skill find the worked example slow.
- **An optional quick check for confident students on a shaky skill.** One problem before the set on a skill the past sets show as a gap, framed as the student's choice. Not built: the user chose that confident students are never offered a warm-up.
- **A required self-explanation step.** After the worked example, the student says in their own words what a step did. Left out because the completion step does the job with a checkable line and typing on an iPad is slow; worth trying if completion lines turn out to be copied from the example.
- **Video for the "why".** Video came off the help menu: it assumes headphones, which students rarely have in class, and a static worked example beats it for how to do a step. A clip explaining why a method works is a different job and could return with captions.
- **The tutor speaking up on a wrong completion line.** The user chose a marked line and chat on the student's press; a nudge after a second wrong line is the obvious next step if students sit on marked lines.
- **Q* and Q** for sets made through Create.** Problem Set 6's are hand-written. A created set needs them generated with its problems, and maybe shown to the teacher on Refine.
- **A student-side "after practice" marker.** The marker is on the teacher's report only; Sam's own report could show it too.
- **Minutes on a step changing colour.** Where students are shows how many minutes each student has been on a step as a plain number. Colouring it past a limit (5 minutes was proposed) as the one "go and look" signal is Carson's open call.
- **Skill history in the student panel.** Pressing a name shows the confidence answer and marked work only; the Class view's category status pills and history pills were left out by the user for now.
- **A chain of more than one completion step.** Fading one more line at a time (two completion problems before the problem alone) is the fuller faded-guidance sequence; one keeps practice short (see the five-item runs entry).

## Where each student is (ticket 314, 2026-09-15)

- **A slower demo stream.** The stream runs the set in about seven minutes, so a warm-up step lasts 5 to 40 seconds and a help step 4 to 9; ticket 315's minutes on a step mostly read 0. A presenter speed control (real time, or the stream at a quarter speed) would let the minutes mean something in a demo. Deferred: hand-in times and answered problems had to stay as they are.
- **Step times for Sam from his session.** `since` is null for Sam until tickets 312 and 313 record when each step began; `carrySince` covers the gap by holding the first time a screen saw a place.
- **Per-student step lengths.** Every classmate splits a warm-up skill 35/40/25 and a question's help at 20/45/75%; a student who reads the worked example slowly or finishes the steps quickly could have their own shares.
- **Help that fixes the answer.** The classmates take help on questions they still get wrong, because the records fix their answers; a story where help on a question leads to it being right needs records that show that (and the after-practice marker, ticket 317, would then show it).
- **Hints and help on the warm-up itself.** A student warming up can ask for a hint or chat on the warm-up pad; the place model shows only the step, not a hint within it.
- **The repeated-slip offer as its own detail.** The model does not tell help asked for from the practice offer taken after a repeated slip (`PracticeEntry.reason`); the teacher might read those differently.
- **More than one help per question, or help after a hint.** The script allows one of each per question and the timeline places them independently; a student who takes a hint and then help on the same question would need an order.
- **The confidence check's words.** A classmate's check is a fixed six seconds; the check could show what they answered as it lands (the Class tab shows the answer only after).
- **Where students are on a finished set.** A finished set's places are its records (handed in or not started) with no times; a replay of the lesson's places from recorded events is a later idea.

## The blank-step line check (ticket 311, 2026-09-15)

- **Tests over ticket 310's blanks.** Every Q** blank and every warm-up completion blank: its right line right, each authored slip wrong with its id, junk unreadable. Deferred to ticket 312: 310 had not landed on main while 311 was built, so the check was tested on Problem Set 6's steps, the practice bank and every finished set's evaluation table instead.
- **Judging a sentence.** Words in `\text{…}` count as the same only when they are the same words (case, punctuation and spacing aside). "The graph never meets the x-axis" and "The parabola does not touch the x-axis" say the same thing and read as wrong. A blank on a conclusion step needs a meaning check (a model call, or a list of accepted sentences per step). Deferred: 310's rule puts the named skill's steps in the blank, and the practice skills' last two steps are mostly maths.
- **Equivalent statements in another form.** The check compares form, so `(2 - x)` for `-(x - 2)` inside a product, `\tfrac{6}{2}` for `3`, `0.5` for `\tfrac{1}{2}` and a line with both sides multiplied by −1 are wrong. A second tier could evaluate the two lines and answer "right, written differently" as its own result, so a screen can accept it and still show the step's form. Deferred: no screen asks for it yet, and "same step" is the rule the ticket set.
- **More slips named.** The check names eleven misconceptions. Others in the taxonomy fit a rewrite of the expected line just as well: collecting-sign (a term's sign flipped in a collected sum), rearranging-sign (a term moved without its sign changing), square-sign and middle-not-doubled for perfect squares, halving-wrong, discriminant-formula, root-missing (one of two cases dropped), nfl-without-zero, vertex-y-wrong, x-for-y, discriminant-root-count ("two" for Δ < 0). Deferred: each needs its own rule and tests against the tables. The five the ticket named are covered, with six more.
- **The evaluation tables' broader labels.** Four older wrong lines are labelled "brackets don't expand back" (PS3 Q5, PS3 Q8, PS4 Q4, PS5 Q8), but by the taxonomy's own descriptions they are "product right, sum wrong" or "signs swapped in the pair", which is what the check names. Relabelling them would change counts on the teacher's Mistakes and signatures screens. Deferred: that is a data decision for Carson, and ids are counted across sets.
- **Hint position from the same equivalence.** `positionOf` (`lib/hint.ts`) still matches a line to a step by exact TeX with whitespace removed. It could use the check's canonical form, so a reordered line still counts as being at that step for hints. Deferred: no ticket asks for it, and changing it moves which hint a student gets.
- **Handwriting recognition output.** The check reads TeX and the typing shorthand. A real recogniser's output (MathML, or TeX with `\left.`, `\mathbf`, implicit multiplication spaces) needs its own normalisation in front of `readLine`. Deferred with recognition itself.
- **Demo slips as data.** `warmupScript(p, slips)` and `padScript(steps, slips)` take the wrong lines a demo run writes, but no named slips data exists yet. Ticket 312 chooses which blanks show a wrong line in its click-through.

## Design tuner borders (ticket 321, 2026-09-15)

- **Borders for every large card.** Borders tunes only the Classroom's problem set cards and homework cells; report panels, the Future panel and other `rounded-2xl` cards keep `border-line`. Deferred: the user chose per-kind controls for the two boxes they were looking at.
- **A sent homework cell's border in the tuner.** The teacher's not-yet-open cell keeps its own dashed line-strong border and takes no tokens, so it stays distinct; a "not yet open" border kind could tune it.
- **State border colours in Borders.** To do (accent), completed (green), missed (dark red) and hover colours still come from their colour families; Borders could list them per kind.
- **Border colours that follow `line`.** The two border colours start at `line`'s hex but don't move with it; the token file would need a way to say "follows".
- **Shadow per kind.** Card shadows (`shadow-card`, `shadow-lift`) aren't tunable; a shadow strength beside the border would round out the box look.

## Carson's notes

Hand-written by Carson. Agents: append new sections *above* this heading and never edit,
reformat or move anything below it.

### BIGGEST CONCERNS

- assignment creation & upload
- clicking on student name / avatar -- should this link to the student report, or to a more
  longitudinal tracker?

- **Ask where mistake is** before starting work; in indiv review; student has 3 'tokens' to use
  in asking 'is this problem one that i made a mistake on?' before revising.

- **Address effiency** in addition to current handling of correctness.

- **No prepractice of subskills**; student self-identifies as 'lacking confidence in {}', &
  for unconfident student, first error triggers 'additional practice' ; for confident student,
  this happens upon second error with {}.

-**Goal** at beginning -- for now, script from teacher.
  -Later: student self-identification of goal.
- **Low confidence students** receive message from teacher.
  - Motivated by idea that acknowledgement of feelings has positive influence on intrinsic
    motivation.

- **Diagnostic question** functionality expanded to recommend what diagnostic question to send
  to class. Opens window based on subskills, & targeted diagnostic question to reveal
  misconceptions. Ordering of subskill diagnostic questions based on student performance.
  Questions persist -- that way, if a teacher likes a question but don't immediately use it,
  they can come back & access it later.

-**NEED TO REVISE GROUPING** so that it yes groups students with similar issues in some
  teacher view (which currently doenst' exist, need to think through that), but that the
  review groups are a static setting from the teacher -- so that way group review is
  seamless & doesn't require 'have everybody move around', moreso just work with your
  table group. STILL, consider identifying highly functional studnets & have them work
  on reteaching -- oooh but maybe like as the group review work happens, instead of
  separate from it.

-**NEED TO EDIT TEACHER WORKFLOW TO ADOPT LAPTOP MODEL** -- having teacher working on iPad is
  dumb assumption.

-**DIAGNOSTIC QUESTION** & revealing to teacher the misconceptions in distractor wrong answers,
  & when the teacher chooses to online record studnet answers, analytics there -- what
  misconceptiosn their students hold. look into Eedi

-**TEACHER REVIEW & WRITE WITH ME** -- part of grade, or no? compliance? but what about kids
  that already got that problem right?

-**ADD API KEY** for real chat simulation (in 'i need help')

-**REFINING REVIEW** -- consider if we want students doing group review with same questions,
  or if we should start setting up pathways to differnet problems or activities dependent
  on group performance/understanding.

-**ASSIGNMENT CREATION** tiles moveable --rn deleteable, but can't reorder.

-**DIAGNOSTIC QUESTIONS** add to teacher mistakes panel.