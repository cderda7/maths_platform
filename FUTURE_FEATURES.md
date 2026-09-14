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
- **Follow-ups for every practice.** Only the warm-up has one; the mid-set overlay could offer
  "try one more" too once it uses the same help menu.
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

## Teacher SKIP TO (ticket 263, 2026-09-14)

- **Ending a lesson without class review in the product.** A pathway of individual and/or group review has no End: the Live card stays "in review" forever unless the presenter presses activity completed (`lessonEndedAt`). A teacher's "end lesson" (on the Pathway card, or when group review's race is over) was left out: the ticket asks for presenter jumps, and where the product's End belongs is a screen decision.

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