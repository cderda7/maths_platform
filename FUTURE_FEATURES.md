# Future features — Edexia · Maths

Deferred ideas, kept deliberately generous: if it came up and was not built, it goes here. Each
entry says where it came from and why it was deferred, so a later decision has its context.
Newest at the bottom of each section. Policy: every work session that scopes something out
appends it here (see `CLAUDE.md`). Hand-written notes live in `## The warm-up offer after the confidence answer (from tickets 71–72, 2026-09-11)

- **A teacher switch on the offer.** The warm-up is offered to every student who answers "not
  confident" or "not confident with…", never to one who answers "confident". A per-assignment
  setting (always offer / offer to the not-confident / never) is a classroom-store field and one
  branch in the reducer; deferred until a teacher asks for it.
- **Re-offering the warm-up mid-set to a "confident" student who then slips.** The mid-set practice
  overlay already catches a second mistake on a group; a fuller "want the warm-up after all?" after
  the first few problems would need a rule for when confidence was misjudged. Deferred: the overlay
  covers the case narrowly.
- **A way back from the offer to the answer.** The list locks once Submit is tapped; a student who
  mis-ticked has no undo short of "Reset demo". Deferred on purpose (the interview settled that the
  offer is a fork, not a form); a small "change answer" link under the callout is the cheap version.
- **An exit from the concerns chat.** The chat has no "skip to the set"; the pad has one. Deferred
  on purpose: the chat is one message per ticked skill and the student chose it a tap earlier.
- **The count line as a duration.** "2 short problems, then the set" counts one problem per ticked
  skill; "about 5 minutes" would need timing data from real runs. The plain "not confident" line
  says "a few" because the chat decides the count.
- **The callout covers the bottom of the dimmed list.** It floats over the locked answers so
  nothing reflows; on a two-skill answer it hides the last two or three skill rows. If a student
  needs to re-read what they ticked, the question line names the skills; a taller stage could show
  both.

## The concerns chat's rhythm (from ticket 74, 2026-09-11)

- **Timings are constants, not tuned.** A 400 ms beat, 1 s of dots, 1.2 s after the closing bubble.
  Real students will tell whether a second of dots reads as "thinking" or as lag; a per-bubble
  duration scaled to the bubble's length is the obvious refinement.
- **The help chat on the pad keeps its own convention.** There the reply streams from the model and
  only the send button disables; the box stays open. Bringing the two chats to one rule (box off
  while the tutor writes, pulse when it's your move) is one change in `HelpChat` once the rhythm
  here has been seen in use.
- **Keystrokes while the box is off are dropped.** A student who starts typing before the question
  has landed loses those letters. Buffering them into the draft would let a fast student get ahead
  of the tutor, which is what the disabled box is there to prevent; noted in case it frustrates.
- **A "skip the pause" for the demo.** Presenters walking the flow several times may want the
  bubbles at once; `?fast=1` or a Reset-demo option is a one-line switch on the constants.
- **The closing bubble names the first skill by ease.** It uses the first leaf of the focus by
  `EASE`; if a later ticket lets the student pick which skill to open on, the line should follow.

## Carson's notes` at the bottom;
agents add sections above it and leave it alone.

## Review pathways

- **Edit the pathway after creation.** Teacher changes the pipeline once students have started;
  students already past a removed stage keep their history, students not yet there follow the
  new shape. Deferred 2026-09-09: pathway is fixed at creation in v3.
- **"Continue tomorrow."** A pacing node on the pathway map: pause the class at the end of a
  stage and resume next lesson. Becomes meaningful once the pathway is editable after creation.
  Shown on the map now as a dashed, disabled node.
- **Explicit "end individual review now" and "end group review now"** teacher actions with the
  same one-minute grace as force submit. Deferred 2026-09-09: starting whole-class review already
  ends any stage.
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
- **Examples mirrored onto student screens** as a teacher toggle, so students can compare at
  their desk. Deferred: own work only, to keep the board the shared object of attention.
- **Tell the owner which letter is theirs** on their own frozen screen, as a toggle. Deferred:
  anonymous even to the owner, to avoid the "everyone looks at Sam" moment.
- **Class-level percentage variants**: per-subskill percentages, "n of m attempted", a footer
  for students matching none of the shown examples. Deferred: per-example "n/m students" only,
  denominator = students who handed in that problem.
- **Aggregate on the frozen student screen** (e.g. how many classmates share my approach).
- **Board slide for not-attempted students** or a prompt for them to attempt live.
- **Background-tab clocks.** The countdown and the freeze use each tab's own 1 s clock; a browser
  may throttle timers in a hidden tab, so a teacher's backgrounded live view can lag the true
  deadline. Fine on the smartboard and the iPad, worth a server clock later.
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
- **Group review that starts only when the whole group has arrived** rather than immediately on
  the student's own transition.

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

- **Setup view state is local.** Swapped examples and toggled problems live in the setup page's
  component state until Project; a reload before Project loses them. Persist a draft session in
  the classroom store if setup gets longer.
- **Frozen screen layout toggle**: versions are side by side on the landscape iPad; the spec said
  stacked. Offer stacked as an option if the ink blocks get tall.
- **Star semantics under detective mode.** The star is now a bare marker (no caption) the student
  can set while working through the set and again in review (2026-09-10); the feedback list and
  the report show which problems carry one. The teacher's report still calls starred problems
  "right, but worth coming back to"; decide whether a star on a wrong problem should be shown
  differently, and whether the star should carry a one-word reason later.
- **Group review after a forced hand-in** uses whatever lines exist; a student handed in with
  nothing on a problem counts as "not attempted" in feedback but as correct-by-absence in the
  group's quick-pass set. Decide how not-attempted should count.

## Live diagnostic

- **Teacher-written questions are not saved.** The "Your own" tab holds one question in component
  state; a reload loses it and there is no bank of past questions. Add a per-teacher question
  bank and "push again".
- **Plain-text options.** Options are typeset as TeX; a plain sentence renders in maths italics.
  Detect prose and wrap it in `\text{}` or offer a text/maths toggle per option.

## Skill hierarchy (from ticket 26, 2026-09-09)

- **Cross-assignment persistence** of leaf statuses, so a category dot reflects the term, not one
  set.
- **A real auto-tagger** and a **step-granularity detector**; today tags and the `compounds` flag
  are authored per line, and tag confidence is stored but never read (confidence-tiered
  rendering later, without a data migration).
- **Tagger-proposed Unit Focus leaves** beyond the closed lists per unit.
- **Header-level column zoom**: click a category header to see the whole class at group level.
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
- **Multimodal help inside the set.** "I need help" during the set still goes skill picker →
  practice overlay. Offer the same hint / worked example / video choice there, with the hint
  drawn from the practice's `hint` (already authored for every practice).
- **Confidence-driven warm-up.** The confidence answer now precedes the warm-up but does not
  choose it: `PRACTICE` is always monic factorising. Pick the warm-up from the "depends on the
  skill" category, or suggest one when the answer is "not confident". Would move the offer from
  the overview onto the survey.
- **A chain of follow-ups.** One follow-up per worked example today (`followUp` is recursive, so a
  second is a data change). Decide when the chain stops: a fixed count, or the student's choice.
- **Follow-ups for every practice.** Only the warm-up has one; the mid-set overlay could offer
  "try one more" too once it uses the same help menu.
- **Warm-up visible to the teacher.** The warm-up is deliberately invisible to the grid. A small
  "warmed up · asked for a hint" note on the student row is cheap once wanted.
- **Hints as a hint ladder.** One sentence per problem today. A second, more specific hint, or a
  hint that names the step the student is on, once tagging is live.

## Warm-up chooser (from ticket 28, 2026-09-10)

- **Problem bank as the source of warm-ups.** Each warm-up step serves the hand-written practice
  for that leaf. The real thing draws (or generates) a problem from a bank tagged by leaf and
  difficulty; `warmupSequence` is the seam.
- **Composite warm-ups, pulled.** A first cut served one problem covering the whole focus (a
  rational equation for "factorising and fractions"). It was harder than the set and was replaced
  by one skill at a time (2026-09-10). Worth revisiting only with a difficulty measure that keeps
  a composite below the set's easiest problem.
- **Perceived ease as data.** `EASE` is a fixed list. Make it per unit, or learn it from the
  class's leaf statuses.
- **Skipping one skill.** "Skip to the set" leaves the whole warm-up; a per-skill skip (or
  reordering the strip by dragging) is a small addition.
- **Content tree in the chooser.** The chooser shows the assignment's skills by category. The user
  wants a content tree soon: the taxonomy (or the unit's content) browsable as a tree, so a
  student can point at something the set does not name.
- **A real interpreter for the chat.** `interpret` is a regex table over English skill words and
  "Qn" references. Replace with a model call that returns leaf ids and problem ids; keep the
  honest reply ("one problem covers … ; … can come in the set").
- **Practices per unit.** Every practice lives in Unit 1 algebra and graphs. Each unit needs its
  own so the chooser can serve a Unit 3 focus.
- **Selection also from the skills list.** Chips in the skills panel are display only; tapping a
  chip could add it to the focus directly, as a third input beside problems and words.
- **Difficulty tags elsewhere.** Removed from the overview, the chooser, the working screen and
  the rework screen at the user's request (2026-09-10), along with the skill chips on the working
  screen (skills now surface only through "I need help"). Still shown on the reports and the
  teacher views. Decide whether the student should ever see them.
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
- **Review screen density.** With the pad and "Read as" beside the submitted lines (ticket 32), the
  review pane is three narrow columns on the iPad. If it gets cramped, collapse "What you
  submitted" to a toggle, or stack it over the pad in portrait.
- **A third version for whole-class review.** The frozen screen lays out three versions at two
  thirds of the width, but group review produces no version of its own today, so only "Handed
  in" and "Reworked" ever appear. Decide whether group review writes a version.
- **Marks on the frozen screen's split lines.** A two-case line now shows as two boxes there; a
  red mark colours both. Decide whether a mark can point at one branch.
- **Right answer, wrong route.** "Check" in group review judges every known line and lets the
  final line decide (2026-09-10). A student can reach the correct final answer by a dysfunctional
  or incorrect strategy; a novel route is neither right nor wrong to the evaluator. Decide how to
  catch and surface that (a route check against known methods, a teacher flag, a prompt to
  explain the route).
- **Difficulty tags are teacher-only.** Every student surface is now free of them (sweep of
  2026-09-10: working, review, whole-class, peers, group, history, the student report's drill).
  The rule is in `components/ProblemCard.tsx` and `HierarchyDrill`'s `student` flag; keep it.

## Split view (from ticket 35, 2026-09-10)

- **Divider extras.** Boundaries drag and double-click to reset (2026-09-10). Not yet: keyboard
  nudging of a focused handle (arrow keys), a "reset all sizes" button on the toolbar, sizes in
  the URL for a shareable exact setup, and snapping to the defaults when a drag comes close.
- **Other fitted arrangements.** Stacked is fixed at student over teacher (3/5) with the board
  down the right (2/5), fitted to the window (2026-09-10). Two earlier layouts were dropped and
  could return as options: "two over one" with the board across the bottom, and a scrolling
  stack of full-size rows (the iPad at true size). The column split is now draggable, which
  covers a presenter who wants a bigger board.
- **Scale override.** Panes scale to fit their design viewport. A per-pane "1:1" or a zoom
  slider would trade overview for legibility when one pane is the focus.
- **Route per pane.** The teacher pane always opens on Class; the tabs inside it navigate. A
  toolbar choice of teacher tab (Class · Mistakes · Groups · Report · New assignment) and of the
  student's deep link (`?stage=` and `?pathway=`) would make a split URL reproduce a full setup.
- **Sync-state button.** The user's motivation mentioned a shared "sync state" control. The
  stores already sync, so today it is unneeded; if a pane ever holds state of its own (a scroll
  position, a selected tab) a "line everything up" button belongs on the toolbar.
- **Static harness for other origins.** A `file://` page with iframes would let a reviewer point
  panes at two different builds (main and a worktree on another port) side by side. Deferred:
  the in-app route covers the one-build case and keeps the styles.
- **More surfaces.** A second student (another name, another run) as a fourth pane would show
  group review from both sides. Needs the store to hold more than one session.
- **Keyboard shortcuts.** 1 / 2 / 3 to toggle panes, L for the layout, when the focus is not in
  a pane.

## Group review on a shared whiteboard (tickets 36–42, planned 2026-09-10)

- **Individual verification after the group's last problem.** One short problem per student to
  recover the signal a shared board loses on the quiet student. Dropped from the plan; decide
  later whether it feeds the teacher's grid.
- **Full scripted attempts for the thirteen new classmates.** Ticket 36 adds them as lightweight
  entries (name, confidence, wrong list, group). A full version, with every line evaluable like
  the six existing classmates, is a candidate for an overnight run.
- **Passing the pen.** The pen is a random draw by design; a "pass the pen" for a stuck holder was
  considered and left out so the draw stays the point.
- **Peers seeing each other's reflections.** Teacher-only by decision; a group-visible variant
  would turn the reflection into a performance.
- **Force submit and start group review as one gesture.** Ticket 39's "start group review now"
  leaves a student still writing the set alone; the teacher presses force submit first. A single
  "move everyone to group review" that forces the set, then the corrections, then opens the gate
  would be one press.
- **Synthetic ink that looks like the line.** A peer's turn draws deterministic scribbles per
  line (ticket 40). Rendering the actual TeX as a handwriting font path, or recorded strokes per
  line, would make the mirror read as the working.
- **A stroke channel for the shared board.** Every stroke broadcasts the whole classroom state;
  fine for one live member, not for four real iPads.
- **"We're stuck" before any check.** Any member can press it at any time during a problem; decide
  whether it should wait for a wrong check, and whether pressing it should count anywhere.

## Teacher on a laptop (from ticket 37, 2026-09-10)

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
- **A class-level group-review signal.** The holding state reads the demo student's session
  (their group review ending is the class's) until ticket 40 gives the classroom a group session
  of its own; then `boardContent` should read that and nothing per-student.
- **Hide my working from the wall.** The board mirrors the teacher's ink. A per-problem toggle
  ("just the students' pads", "just the wall") would let the teacher scribble privately.
- **The board indicator elsewhere.** It sits on the live view and the controls page. Deferred:
  the teacher chrome's header on every page, so Mistakes / Groups / Report show it too.
- **A stroke channel.** Every teacher stroke still broadcasts the whole classroom state (noted
  under whole-class review); with three surfaces listening it is one more reason.
- **Join code or QR on the blank board.** The blank state is the class and the title. A
  join code for late devices, or the day's plan, are candidates for that empty wall.
- **Board typography for the back of the room.** Sized for a 1440 × 810 projector image; not yet
  checked on a 4K wall or a small classroom TV. A `?scale=` or a font-size step is the likely fix.
- **Catching up after lingering.** A student who stays in a debrief past the group's move rejoins
  a board already in progress and may miss a wrong check or a "we're stuck" on the next problem.
  Decide whether the board should replay what they missed.
- **The hold length.** Twenty seconds is fixed (ticket 41). Make it a teacher setting, or scale it
  with how many lines are marked.

## Progress bar, leaderboard and medals (from ticket 42, 2026-09-10)

- **Sam's own check stamped by the screen.** The store stamps `at` on `group/check`, so the
  whiteboard screen (being edited for ticket 41 at the same time) didn't need touching. Cleaner
  later: the screen passes `at: Date.now()` itself like `group/next` does, and the fallback to the
  turn's start in the reducer goes.
- **The scripted race after reseating.** `RACE_SCHEDULE` rows are sized to the default seating's
  unions; a group made bigger by a drag on the groups page carries on at its row's last gap.
  Deferred: derive each row from a finish time and a pace curve so any union size lands on the
  intended finish.
- **The demo student's group by seating, not by fixture.** The run's members still come from
  `GROUPMATE_IDS` (ticket 08); if the teacher drags Sam to another colour, that colour's row goes
  live with the run's members and sky's row runs scripted with three seated names. Deferred until
  the run is begun from the seating groups.
- **A sound or a flash when a group finishes.** The bar fills and the medal appears; a room may
  want a cue. Deferred: keep the board silent until asked.
- **Resolved-problem ticks under the bar.** The bar shows mistakes resolved, not problems; a small
  "3 of 6" or a row of dots per union problem would show a group where it is in its list.
  Deferred: the percent is the race's one number.
- **A clock on the board.** "4:12 in" beside the heading would give the room the pace. Deferred:
  nothing on the board that isn't the race.
- **Teacher's card shows the demo group only in detail.** The other groups' pen-holders are not
  in the fixture (the race has no turns). Deferred: a pen order per scripted group so the card
  can read "Priya has the pen · Q4" for everyone.
- **Old-style figures in the percent.** Playfair's digits are old-style (a small 0); a lining
  figure set (`font-variant-numeric: lining-nums`) may read better from the back of the room.
  Not changed: it matches the rest of the board's display type.
- **What the board shows after the whole-class review ends** (from ticket 38) now has a candidate
  with content: the final standings again, since they are computable at any time from the run.
- **Teacher notes on hover only** (2026-09-10, undone the same day). The hover bubble under a
  name lasted one commit; commentary now lives on the individual view only (ticket 43). If notes
  ever return to the class view, the touch problem stands: there is no hover on a tablet.
- **Suggested-by-mistakes groups, hidden** (2026-09-10). The teacher wants only the seating
  groups on the groups page for now. `reviewGroups` and its cards stay in the code behind
  `SHOW_SUGGESTED` in `TeacherGroups.tsx`; a "compare with suggested" toggle is the likely way
  back, once a real grouping algorithm replaces the fixture's shared-mistake pass.
- **The platform's commentary is fixture text** (ticket 43). A classmate's ideas are authored
  notes and their clarification a scripted line; the demo student's ideas are the evaluation
  table's teacher notes, one per distinct note. A real build generates the 2–3 sentence
  commentary from the run and lets the student reply from their report screen (the reflection
  already exists; a reply threaded against each idea does not).
- **Category chips on the class view need a tap target** (ticket 43). The "expand" button is
  hover-only, like the double-click it fronts; on a tablet neither exists.
- **Lowercase by CSS, not by data** (ticket 43). Group and skill names are lowercased with
  `text-transform` in the drill's `Node`; the taxonomy still holds capitalised names, and other
  surfaces (skill chips, the mistakes view, the student side) show them as authored. Decide once
  whether the taxonomy itself should be lowercase.

## Start screen simplified (from ticket 44, 2026-09-10)

- **A skill summary for the set.** The "Covers" pills and "Leans on" chips came off the start
  screen on 2026-09-10 at the user's request. The per-problem chips are the only skill words on
  that screen now; the warm-up chooser's "Skills" section is where the set's skills are laid out.
  If a whole-set view is wanted again, a tap on a chip that lights the same skill on every row
  would do it without a panel.
- **A figure thumbnail that opens.** Q8's parabola sits at 120 px in its row; a tap to see it
  full size was not built. The working screen shows it at full size.
- **Problem rows that open the problem.** The rows do nothing on tap. A tap could jump the
  student to that problem once the set has started; deferred, the set starts at Q1.

## Class view polish (from ticket 46, 2026-09-10)

- **Row and header buttons on a tablet.** "see dot skills" / "student report" beside a name and
  "skills" / "sub-skills" over a header appear on hover (and keyboard focus); a tablet has
  neither. A long-press or a persistent small handle would be needed there.
- **MISSING in the key.** The caution triangle over MISSING (a student who handed nothing in)
  has no row in the Key card. Add one if teachers ask what it means.
- **A missing student everywhere else.** Chloe Abara has `done: 0`. Her individual view opens
  with every skill unseen and the groups page still seats her; a real build would show
  "nothing submitted" on the report and let the teacher chase or exclude her. Force submit
  counts her among those still working.
- **Confidence words that shrink.** A named skill in the Confidence column shrinks to one line
  (`FitText`), down to whatever fits: "non-monic factorising" lands near 9.5 px. If that reads
  too small, the alternative is a wider column or a tooltip with the full list.
- **Wording of the header control.** "skills" (the groups) and "sub-skills" (the leaves) were
  chosen to match "see dot skills"; the drill itself still says groups and skills in code. The
  user asked to try something and refine, so expect the words to change.
- **The live row's Set sub-line.** Timestamps are gone from the Set column for classmates; the
  demo student's "handed in" / "in progress" sub-line stays, though the pill beside the name says
  the same. Drop one of them.

## Start screen as a grid of tiles (from ticket 47, 2026-09-10)

- **Skill chips on the start screen.** Gone entirely on 2026-09-10 at the user's request (the
  ticket-44 chip column). The warm-up chooser is the only place before the set where a skill name
  appears. If the student should be able to see a problem's skills before starting, a long-press
  or flip on a tile is the natural home; not built.
- **A figure that fills its tile.** Q8's parabola sits at 100 px inside a 208 px square; its axis
  numerals are too small to read. A tile that gives the figure the space the stem does not need,
  or a tap to enlarge, was not built.
- **The band between the tiles and the buttons.** Ten squares leave about 120 px empty above
  the button row. A line of set-level information (how many problems, expected time, whether a
  warm-up is suggested) could sit there; nothing was put there so the screen stays quiet.

## Warm-up concerns chat (from ticket 48, 2026-09-10)

- **The chooser page.** Removed on 2026-09-10 at the user's request: the problem cards to tick,
  the skills-by-category panel and "warm up on these →". The confidence screen's ticks are the
  seed now. If picking by problem is wanted again, an answer in the chat can already name a
  question ("Q2") and its skills join the warm-up; a row of tappable problem labels under the
  textarea would make that visible without bringing the page back.
- **Skipping a question, or the chat.** Every question must be answered before the warm-up
  starts; a student with nothing to say about a skill has to type something. A "nothing in
  particular" tap that records an empty answer, or "skip to the warm-up" on the chat, was not
  built so the screen has one thing on it.
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
- **Question order.** The chat asks about the skills in the order they were ticked; the pad then
  walks them easiest first. Asking in ease order too would make the two match; not changed
  because the user specified "{1}, {2}, & {3}" as the ticked order.
- **Chip size on the pad.** The strip's buttons keep the 11.5 px chip size the rest of the pad
  uses; the user's mock drew them larger (about 14 px). Left as is so the strip and the overlay's
  single chip match.
- **A done skill reopened.** A tap on a dark chip reopens that problem with its working still
  there; finishing it again keeps it done and moves on. There is no way to un-do a skill, and no
  fresh copy of the problem; a "try it again" that clears the pad for that problem was not built.

## Feedback summary chips and level column labels (from ticket 50, 2026-09-10)

- **Tappable skill chips in the detective sentence.** The three purple bubbles ("factorising",
  "non-monic factorising", "null factor law") are inert. A tap could jump to the first problem in
  the list where that skill slipped, or open the same skill drill the teacher's view has. Deferred
  because the review is meant to stay detective: the student finds the mistake, the app never
  points at a line.
- **Chip type size on the review card.** The chips reuse `LeafChip` at 11.5 px inside 15 px prose
  so they match every other chip on the student side. A larger, prose-sized chip only for this
  card was not built; revisit if the card reads as too small on a real iPad.
- **A shared header row for the review's three columns.** The three eyebrows are levelled by
  taking the pad's inset away and top-anchoring its header; a single header grid that owns all
  three labels and the Undo / Clear buttons would be the sturdier structure if a fourth column
  ever arrives.
## Debrief: a pane that matches the group's rework turns green (from ticket 51, 2026-09-10)

- **A correct version in different words.** Only a line-for-line match earns the green. A
  student whose rework checks correct by another route (say, the quadratic formula for Q1) still
  sits in a white box beside the group's green-worthy one. `functional()` already knows the
  version passes; a second, paler tint ("also right") or a small "checks out" word in the eyebrow
  would say so. Deferred because the user asked for the match case only.
- **A partial match.** A version that has the group's first line but not the second gets nothing.
  Tinting just the matching line boxes green, inside a white pane, would show how far the student
  got on their own; not built so the pane reads as one signal.
## Group review: a wrong first go on Q7, a ten-second hold (from ticket 52, 2026-09-10)

- **The group's failed attempts in the debrief.** The debrief shows only the group's correct
  rework. A fourth column (or a row under it) listing the attempts that checked wrong, cut at the
  first mistake, would keep the whole story visible after the fact. Offered as an option; the user
  chose the wrong first go on Q7 instead.
- **A hold that adapts.** Ten seconds is fixed for everyone. It could shorten when the student's
  own versions match the group's (nothing new to look at) and lengthen when the Handed in pane
  has several red lines.
- **A peer who is still writing when the group moves on.** `PEER_DEBRIEF_MS` is a single constant
  tied to the hold; a real peer's debrief length would come from their device, not a timer.
- **The ring's last frame.** The ring is cut the instant the hold ends (2026-09-10 follow-up,
  the user asked for it removed). Its fill animates one second behind the clock, so the last
  frame seen is about 90 % full. A short fade-out, or a fill that completes before the cut,
  would read as "done" rather than "gone". Not asked for; left as is.

## Group review header: the progress bar stays put on "the group got it" (from ticket 53, 2026-09-10)

- **The debrief shows less of the header than the whiteboard.** The whiteboard has `1 of 6` and
  the four name chips under the header; the debrief has neither, so those still appear and vanish
  around a correct check. Carrying both across, with the pen-holder chip dark as on the board,
  would make the whole top of the screen still. Deferred because the user asked about the bar.
- **The pill and the pen chip are different sizes in the same slot.** `you have the pen` is 13 px
  with 6 px vertical padding, `the group got it · you wrote it` 12.5 px with 4 px, so the right
  edge of the header changes height by 3 px across the check. One chip style for the slot would
  remove the last flicker there.

## Whole-class review: writing on the smartboard (from ticket 54, 2026-09-10)

- **Two writers, one ink.** The board and the laptop both append to the same stroke array, so a
  teacher writing on the board while a colleague writes on the laptop interleave, and Undo on
  either surface removes the last stroke whoever drew it. Fine for one teacher with a pen in one
  hand; a per-surface undo (strokes tagged with their origin) was not built.
- **Board-sized toolbar.** Undo and Clear on the board reuse `PadSection`'s ghost buttons at the
  laptop's size, small for a wall. A larger toolbar variant for the board (and a pen colour or
  thickness for the projector) is deferred until the board is tried on a real smartboard.
- **The rest of the controls on the board.** Only the pad and the mode toggle moved to the board;
  previous / next, show marks and End stay on the laptop so the wall shows nothing the class
  need not see. If teaching from the board sticks, a small strip of those four could join the
  header.
- **Position text.** "1 of 2" was removed from the student screen, the board and the laptop's
  problem card; it lived on in the teacher's board indicator ("Q2 · 1 of 2") until ticket 55
  removed that too, so nothing now says where the class is in the set. A quiet dot strip on the
  board (one dot per projected problem) would say it without words.

## Class view words and the board chip (from ticket 55, 2026-09-10)

- **What the board is showing, on the laptop.** The "Board · blank / holding / Q2 · 1 of 2 ·
  marks" chip is gone from the class view and board controls at the user's request ("never have
  this"). `boardContent` still knows; if a teacher ever needs to check the projector without
  looking at it, a small line inside the whole-class card is the place, not a chip by the title.
- **A "close all" for the grid.** Rows and columns each close from their own "close"; there is no
  one control that shuts every open drill. Add one if teachers open several rows at once.
- **Row buttons on a tablet.** Unchanged from ticket 46: the block-wide hover helps on a laptop
  only; a tablet still has no way to reach "see dot skills" / "student report".

## Student report as the teacher's row (from ticket 57, 2026-09-10)

- **Every skill visible at once.** The card shows each category's groups open, as the teacher's
  "see skills" level does; the skills beneath a group still open on a click, as on the teacher's
  grid. If the user wants the "full breakdown" level (every skill under every group, no clicks),
  `SkillColumns` can pass `mode="expanded"` to `RowDrill`; the columns are ~96 px on the iPad
  card, so the names would drop to the 9 px fit and wrap.
- **The collapsed outline is gone from the student side.** `HierarchyDrill`'s browse outline
  now serves only the teacher's individual view; if the student's card ever needs a compact form
  (a phone), that outline is the candidate.
- **"monic factorising" in "What happened".** The practice line under the columns still names
  the skill as the teacher does; `reportFacts` is shared with the teacher's report, so a student
  flag there would let the student read "factorising".
- **The "New skills" chip.** The student's header uses the teacher's category short names, so
  the Unit Focus column reads NEW SKILLS with "UNIT 1" beside its dot, as on the grid; a
  student-facing chip word could differ.

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
- **The teacher's report still reads the old sentences.** `reportFacts` ("5 of 10 problems with
  a slip", "Reworked Q1 …", the practice line, the stars) is unchanged and the teacher's
  `/teacher/report` still lists them; the student's tiles are built from `outcomeColumns`. The
  teacher's view could show the same tiles so the two read the same.
- **The practice line and the stars left the student's report.** "Practice · monic factorising ·
  Q2 · taken" and the Starred card were removed with the text card; the data is still in the
  session and on the teacher's report. If a student should see what they starred (to revisit it
  from the report), a star on the tile is the natural place.
- **The demo's group column is empty.** The scripted rework fixes all five slipped problems, so
  no problem of the demo student's reaches the group column on the report; a demo that leaves
  one wrong after the rework (Q7, say) would show all four columns filled.
- **Empty columns.** An empty column reads "None" and keeps its width so the layout never
  shifts; collapsing it would give the filled columns more room on a two-of-four report.

## Class view: "see dot skills" opens the full breakdown (from ticket 59, 2026-09-10)

- **No row-level groups button any more.** The row's hover button now opens every group with its
  skills; the groups-only level is reachable only by a single tap on the row itself, which a
  teacher cannot discover. If the groups level is worth keeping, the row stack could grow a
  third button ("see skills" / "full breakdown" / "student report") to mirror the header.
- **A tall row on a small screen.** With every group open a row's drill runs to ~14 skills across
  six columns; on a laptop the class list below it moves a long way. A "collapse all" chip in
  the drill, or remembering which groups the teacher closed, would ease that.

## Mistakes view: students side by side (from ticket 62, 2026-09-11)

- **Marking the clicked student.** One click opens every column of a problem; the tile the teacher
  clicked is not distinguished from the others. A ring or a scroll-into-view on the clicked column
  would help on a problem with more students than fit across the screen.
- **Wide problems scroll sideways.** Columns are at least 230px, so a problem with eight or more
  students scrolls horizontally inside its card; a wrap into a second row of columns, or narrower
  columns with smaller maths, is a possible alternative once real class sizes are known.
- **Two-line working in a column.** A long line (a surd answer, a quadratic-formula step) is wider
  than a 230px column at 17px and wraps inside its card; no fixture line does today.

## Mistakes view: shared pills (from ticket 63, 2026-09-11)

- **The student count is gone from the problem header.** A teacher scanning for the worst problem
  now counts columns; a small count beside the difficulty tag, or ordering the problems by how
  many slipped, would give that back if it is missed.
- **A student with two different slips on one problem** gets their own group and pill pair. No
  fixture student does today; if it happens the pills sit side by side in the cell, which may need
  a stacked layout.

## Mistakes view: expand / close / close all (from ticket 64, 2026-09-11)

- **"close all" only while something else is open.** Closing the only open question goes straight
  back to "expand" rather than offering a dead "close all". If the teacher expects the word to
  appear every time, it could show disabled instead.
- **No keyboard path to "close all".** The button is reachable by Tab (focus-within shows it), but
  the armed state is cleared on mouse leave only; a keyboard-only teacher never sees "close all".
- **Open questions are not remembered across a reload** or a visit to the compare view and back.

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
- **Ink read live into the chat.** The tutor sees the lines as read at the moment the student sends;
  a line written while a reply streams is only seen on the next turn.
- **A partial reply on a dropped connection is thrown away** and the bubble says "I lost that one";
  keeping the partial text would need a marker that it was cut short.
- **Ways in on the three single-way problems** (fractions, null factor law, conclusions) are left
  empty on purpose; the tutor is told there is one way. If a teacher wants a second framing there
  (e.g. "undo the division" vs "multiply both sides"), it is one more fixture line.
- **Prompt caching and effort tuning.** The brief is short enough that caching likely never kicks in;
  effort is the API default. Worth measuring once real transcripts exist.
- **No rate limit or abuse guard on the route.** Anyone who can reach the app can spend on the key;
  fine for a demo on a laptop, not for a deployment.
- **The chat is not cleared by "Reset demo"?** It is: the run is part of the session, which the
  reset drops. Noted so nobody adds a second reset.

## Fractions warm-up and the help button (from ticket 75, 2026-09-11)

- **A hint term can only light the first occurrence of a fragment.** Done in ticket 77 (2026-09-11):
  a fragment can be `{ tex, within }`, the first occurrence inside an enclosing fragment.
- **The fractions problem has no second way in for the help chat.** Clearing denominators is the one
  route the tutor is told about; "work with the fractions as they are" (collect $\frac{3x}{4}$) is a
  legitimate second framing a teacher might want offered.
- **The other warm-up problems were not re-graded for difficulty.** The user found the fractions one
  too easy; monic, null factor law and the rest are unchanged and may deserve the same look.

## The fraction problem stays wrong after the individual review (from ticket 76, 2026-09-11)

- **Picked up:** the report note from ticket 58 ("a demo that leaves one wrong after the rework (Q7,
  say) would show all four columns filled") is now the demo: Q7 sits under "Correct after group
  review".
- **Liam's Q7 turn never presses "we're stuck".** The reveal of everyone's earlier work on Q7 only
  appears if Sam presses it himself (the script has `stuckAfter` on Q3 only). A scripted stuck on
  Q7 would show the reveal to a presenter who just watches; deferred so Q3 stays the one scripted
  stuck and Q7 stays the one the student chooses.
- **A second slip in the rework is only on Q7.** Q1–Q3 and Q10 are still correct on the first rework.
  A rework that slips on a second problem (Q2's non-monic, say) would put two problems in the group
  column and make the notice plural; one is enough to see the struggle.
- **The clue for the new slip is not shown to the student.** "Multiplied through by 3" and its clue
  are in the evaluation table for the teacher's views and the marks; the rework has no individual
  feedback screen after it, so the student meets the mistake in the group. If a second individual
  pass is ever added, the clue is ready.
- **The teacher's mistakes and compare views now show Q7 twice for Sam** (handed in, reworked, both
  wrong). Not re-checked pixel by pixel in this ticket; the data shape (two versions, one wrong line
  each) is the same as any other reworked problem.

## Several hints per problem (from ticket 78, 2026-09-11)

- **Hints that read the student's work.** The user (2026-09-11): "i also wonder how we can make hints
  responsive to the student, at least for this mockup. like not prescriptive hints (for instance, i
  hate that about Leibniz) -- but reading student work, & a hint that will help them from there."
  Today's hints are a fixed ordered list per problem; the only thing on the pad that reads the
  student's lines is the help chat. Sketched: (1) for the mockup, a hint chosen by rule from the
  read-back rather than by count: each hint carries a `when` (no lines yet / the 6 still on the left /
  x terms together but unlike denominators / a slip on a line) and "hint" picks the first whose
  condition holds, falling back to the next in order; (2) for the product, the same one-line hint
  written by the model from the brief the help chat already has, with the fixed list as the fallback
  and the guardrails from the chat prompt. (1) done in ticket 80 (2026-09-11): `Hint.at` and
  `pickHint`; (2) still open, below.
- **Every other problem still has one hint.** Only the fractions warm-up has several; the shape allows
  any number, so the rest can grow as the pedagogy is written, each with an `at`.
- **Hint labels count from 1 even when the second never comes.** Done in ticket 80: the cards are
  labelled in the order the student received them, whichever hints those were.
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
- **Three-case lines.** `branchesOf` splits only two cases; a line with three ("x = 0 or x = 2 or
  x = −2") stays whole. No fixture has one yet.
- **A branch box that overflows.** The read-back's two boxes are half-width each and scroll
  sideways inside if a case is long (`x = \tfrac{1}{2}` fits; a surd might not). The worked
  example card's boxes only wrap the flex row.
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
- **Collapsed hints lose their linked words until reopened.** The one-line form is plain text; the
  problem still wraps their fragments (so the layout never moves) but nothing lights them.
- **No "why this hint" for the teacher.** The session stores which hints each student was given and
  in what order, which is enough for a teacher view of "who needed what where"; nothing shows it yet.

## Hints pointing at the student's line (from ticket 82, 2026-09-11)

- **A hint's line can vanish under it.** A hint given at line 4 points at read-as line 4; if the
  student undoes back to two lines, `hintAnchor` falls to the latest of the hint's lines that still
  exists, or to the problem, and the fragments (written for line 4) may not resolve there, so the
  linked words go quiet. Picked over storing the anchor in the session: a line that is gone should
  not be pointed at. A reworded fallback ("this was about a line you have undone") is one option.
- **Fragments are written against the reference working's line.** On the pad that is what the
  student's line is; with real ink the line may be equivalent but differently written, and the
  fragment lookup would need to match by meaning, not string.
- **The tint on the read-as line is the only cross-column cue.** On the iPad the read-as column is
  the far side of the screen from the hint; a lit word that points there could also scroll the line
  into view when the column is long.
- **"Reference back to the student work in text."** The user's phrase; taken as the eyebrow's "your
  line 4" plus the lit fragment in that line. A fuller version would write the line into the hint
  ("In 3x/4 = 21/2, …"), which would let the hint read on its own in a transcript.
- **Collapsed hints lose their linked words until reopened** (from ticket 80) still holds, now for
  the read-as line as well as the problem.

## The chat's emphasis and "How about…?" (from ticket 84, 2026-09-11)

- **Emphasis in the closing line and the help chat.** Only the concerns chat's tutor bubbles split
  `**…**` into bold. "Thanks. Let's start with fractions." and the pad's help chat render plain; the
  same `emphasis` could bold the skill there too, and the help chat's replies could name the move.
- **The "How about the / with" rule is a suffix heuristic.** Named rules are picked by their last
  word (law, rule, identity, formula, distribution) or a leading "the". A skill added later that is
  a thing without such a word ("sampling", "gradient") gets "How about with …?"; a per-leaf phrasing
  in the taxonomy would make it exact. Deferred: two shapes cover every skill the warm-up serves.
- **A student typing `**` sees it as typed.** Deliberate; if the chat ever grows rich text for the
  student's side (markdown, maths), the split would move to a shared renderer.
- **The setup bubble stays plain by design** ("Let's do a warm up on a, b, & c."): the user asked
  for the emphasis only in the bubble about one skill. A variant that bolds the *current* skill in a
  pinned strip, rather than in the bubble, was not asked for.

## Every point in the factorising warm-up has a hint (from ticket 85, 2026-09-11)

- **Only the two factorising problems and the fractions one have hints per point.** The other
  warm-ups (null factor law, discriminant, non-monic, the graph ones) still carry one general hint;
  a student stuck mid-way on those gets "Shown" and nothing more, the very gap this ticket closed
  for factorising. Same shape, one afternoon of writing.
- **A hint for the wrong pair.** A student who writes 2 × 6 = 12 is at position 1 and gets "check
  it adds to 7 as well", which is right, but the pad cannot say "2 and 6 add to 8, not 7": the
  reference working has one path and the pad only knows the line was not on it. A per-line
  diagnosis would need the pad to read the line, not just place it.
- **The spelt-out hint gives the two equations, not the answers.** One more ask could give the
  answers with the working ("x = −3 or x = −4, because …"), as a last resort before the worked
  example; deferred because the worked example already does that, step by step.
- **Hints ahead of their point read as forecasts.** A blank-pad student asking five times is walked
  through the method one hint at a time. If that is too much, the "ahead" fallback in `pickHint`
  could stop after one hint ahead and point at the worked example instead.
- **The hint texts hard-code the fixture's numbers.** "x + 3 = 0 and x + 4 = 0" is written for this
  problem; a generated warm-up would need the hints generated too, from the steps.
- **Sign trap in the follow-up.** Its last hint says "the answers come out positive" but does not
  link the minus signs in the brackets; a lit "− 2" and "− 5" (fragment `- 2` inside `(x - 2)`)
  would make the point visually.

## "Another hint" opens the chat while the current hint is unused (from ticket 86, 2026-09-11)

- **The pad cannot tell a wrong line from progress.** A line the pad could not place counts as
  moving on, so a student who writes 2 × 6 = 12 under the pair hint gets the next hint rather than
  the chat. Real recognition could mark the line and keep the hint stalled, or open the chat on the
  slip.
- **Stalled means "the latest hint".** An earlier hint left unused behind a later one is not
  checked. Fine while hints come one per point, in order.
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
- **The general-hint problems never stall.** The null factor law, discriminant, non-monic and graph
  warm-ups each have one hint without a point, so "another hint" simply reads "Shown" there. Giving
  them per-point hints (ticket 85's note) brings them under this rule for free.

## The skill box in the chat (from ticket 89, 2026-09-11)

- **The box borrows the standout blue.** The palette's one blue is the curated-correct step mark;
  the chat chip reuses its soft fill, line and text colours. If the two ever share a screen (a
  chat beside marked work), the chip wants its own token, a lighter sky blue.
- **A tappable skill box.** The box names a skill the warm-up will open on; a tap could jump the
  pad to that skill once the chat is over, or show the skill's one-line description. Not asked for.
- **The box's padding splits the word from its full stop** ("[factorising] ."). Tight now
  (`px-1.5`); a negative right margin on a box that ends a sentence would close the gap.
- **The closing line and the pad's help chat still render plain** (carried from ticket 84).

## "Factors" in the hints, and the two lit boxes apart (from ticket 88, 2026-09-11)

- **The lit box still hugs what follows it.** A lit `(x + 4)` is followed by `= 0` with KaTeX's
  relation space (0.28em) between them; the box's padding and ring eat 0.1em plus 2px of it, so
  the equals sign sits a hair off the ring. Same on the left of a lit fragment after a `+`. A
  fix would hoist a little extra space around a lit box (in `hoistSpacing`, or a margin on the
  `mspace` next to a `.hint-term`) without moving the rest of the line; deferred because the
  line must not shift when a word lights.
- **The gap between abutting boxes is a fixed 0.7em.** It is sized for the read-as column's font;
  at the large problem size (`math-lg`) the 2px ring is a smaller share and the gap is roomier
  than it needs to be. An em-only ring (`box-shadow: 0 0 0 0.12em`) would make the gap exact at
  every size.
- **"Bracket" survives in the expanding warm-up's hints** ("the first bracket", "one bracket's
  terms") on purpose: there the student is expanding a bracket, not reading a factor. If the
  vocabulary should be one word everywhere, that is a separate pass over `data/practice.ts`.

## Ink text in the skill box (from ticket 91, 2026-09-11)

- **The box is a subtle cue at 15px.** With ink text the soft fill and the line are all that mark
  the skill. If it proves too quiet on the iPad, a slightly stronger line (`standout-line` is
  #c3d7ee) or a touch more padding is the lever; the text stays ink.
- **The same box could name the skill elsewhere.** The closing line ("Thanks. Let's start with
  fractions.") and the pad's skill buttons use no box; one shared `SkillBox` span would keep the
  three consistent if the cue is kept.

## The worked example as one column with a chat beside it (from ticket 90, 2026-09-11)

- **Aligning on the equals sign.** The steps are centred under the problem; a true working column
  lines the equals signs up (KaTeX `aligned`, or a per-step measure of the `=` glyph's x and a
  translate). Deferred: one `aligned` block cannot reveal a step at a time or box a two-case step,
  and centring already puts every step on the problem's axis.
- **Asking about a step by tapping it.** "Question about a step?" still needs the student to say
  which; a tap on a step could open the box with "step 2:" typed, or light the step the tutor is
  talking about (the `data-step` hooks are there). Not asked for.
- **The captions as a hover.** The step labels are still on the data (the brief reads them). A
  hover or long-press on a step could show its caption for a student who wants the one-liner
  without a chat turn. Deferred: the user asked for the captions gone.
- **A "why this step?" quick ask.** One tap that sends "why step n?" for the latest step revealed
  would save the typing on an iPad. Deferred until the chat is seen used beside the example.
- **The example chat's opener when a pad chat already exists.** A transcript begun on the pad keeps
  its stored opener beside the example (the heading changes, the first bubble does not). A pad line
  for the tutor marking the switch ("Now the worked example…") would read better; not asked for.
- **Enforcing "shown" server-side.** The brief tells the tutor which steps are on screen; nothing
  checks a reply against the unshown steps' TeX. A post-filter that blanks a pasted unshown step is
  possible if the model is seen leaking one.
- **The chat's `Enter` on an iPad.** With the box not autofocused beside the example, the student
  taps it first; a Return key on the iPad keyboard sends (Enter without shift). Fine on hardware
  keyboards, worth a look on the on-screen one.

## The chat under the read-as lines (from ticket 92, 2026-09-11)

- **The read-as cap is a fixed 45%.** With many lines read and the chat open, the read-as list
  scrolls behind a hard edge (the fifth fraction line is cut mid-way). A fade at the edge, or a cap
  that follows how many bubbles there are, would look better; not asked for.
- **The chat does not auto-close when a line is read.** The tutor sends the student back to the
  pad, and their new line appears above the chat, which is the point of keeping the column; the
  chat stays open until "close". Closing it on a read line, or shrinking it to a strip, is an
  option if it crowds the lines.
- **No scroll-into-view for a lit line.** With the read-as list capped, a hint word can light a
  line that is scrolled out of the visible part of the list; the tint is there but unseen. The
  earlier note (ticket 82) about scrolling the lit line into view applies more now.
- **The overlay's narrower column.** The mid-set practice overlay shares this pad; with the chat
  and five lines in its 320px column both halves are tight. Not measured on a real iPad yet.

## The worked example left-justified (from ticket 93, 2026-09-11)

- **The pad's own problem is still centred.** The left column's problem statement (and the
  follow-up's "One more") keep KaTeX's centring; only the worked example card carries
  `math-left`. If the two should match, the same class on the pad's problem wrapper does it.
- **Aligning on the equals sign is now closer.** With every step on the left edge, lining the
  equals signs up is a per-step left padding measured from the `=` glyph; the ticket 90 note
  about `aligned` still applies.
- **`math-left` is a global class.** Any display maths that wants the left edge can use it; the
  read-as column, the model solution and the board all centre today, by KaTeX's default.

## Ruled rows in the worked example (from ticket 94, 2026-09-11)

- **No rule above the reveal button.** The rule marks a step; the button sits 24px under the last
  step without one. A rule above the button would read as "the next step goes here", which is a
  fair alternative if the bare button looks unfinished.
- **The rows are taller now.** Six fraction steps at 24 + rule + 24 each run to about 400px under
  the problem; the card scrolls inside the centre column. A tighter compact rhythm (the 16px one)
  for the full card on a short iPad is the lever if it feels long.
- **The read-as column has no rules.** The student's own lines beside the pad are boxed rows with
  8px between; the worked example's ruled rows are a different rhythm. Matching them one way or
  the other was not asked for.

## No help button during the worked example (from ticket 95, 2026-09-11)

- **Hint cards stay while the example plays.** Hints already shown remain under the problem with
  no button beneath them; whether they should collapse or go while the example is the help was not
  asked. Their linked words still light the problem.
- **No way to ask for a hint mid-example.** A student partway through the steps who wants the pad's
  hint, not the chat, has to finish the example first. The "Question about a step?" chat is the
  intended route; if it is not enough, the example's card could carry a small "hint" of its own.

## The lit hint box beside a flush glyph (from ticket 96, 2026-09-11)

- **The thin space shows at rest.** 7x, 3x² and 10x in a hinted problem now read with a
  0.1667em gap after the coefficient, lit or not, because moving the x only while the word is
  hovered was ruled out (ticket 30: lighting never moves the layout). If the resting gap reads as
  "7 x" to a teacher, the alternatives are a narrower box (the sides at 0.06em, which crowds a
  fraction) or letting the x shift on hover.
- **Only letters, digits and brackets count as flush.** A fragment followed by a superscript
  (`\htmlClass{}{x}^2`) or by a glyph command (`\Delta`, `\sqrt`) gets no gap; no warm-up has
  one yet. Add the case to `flushAfter` when a problem needs it.
- **The ring is gone.** The 2px box-shadow in the box's own colour only enlarged the box; its
  size is now all padding, in em, so the box scales with the read-as lines. A visible ring in a
  second colour (an outline round the fill) would be a new look, not a return.

## The lit hint box the width of its fragment (from ticket 97, 2026-09-11)

- **The 7 kisses the box's edge.** Computer Modern's 7 has almost no right side bearing, so with
  no side padding the lit 7 touches the box's right edge while the 12 and the 10 sit with a little
  air (their glyphs have bearings). Air on the left only (the "+" side has room) would centre the
  7 better but make every box lopsided; not done.
- **Two-term spacing stayed at 0.7em here; ticket 98 removed it the same day.** The user saw the
  gap between the factors and called it the same fault.
- **Ticket 96's thin space is the recorded alternative** if a box that hugs the 7 ever reads as
  too tight: `\,` between the coefficient and the variable, at rest as well as lit. The user
  rejected it because it splits 7x.

## The lit box fitted per axis (from ticket 98, 2026-09-11)

- **The hairline between two touching boxes is 1px of clipped box.** The second of two abutting
  fragments has its lit box start 1px in (`clip-path`), so the page shows through. At 3× it reads
  clearly; at 1× on a non-retina screen it is one light pixel. A 2px inset would still clear a
  bracket's ink (0.11em) but not a glyph with no left bearing; not done.
- **Only two things count as "flush".** A letter, digit, bracket, superscript or subscript beside
  the fragment (sides), and a fraction bar above or below it (top and bottom). A radical's bar
  (`\sqrt`), an overline, a big operator's limits or a matrix would need their own case in
  `lib/hint.ts` when a warm-up first uses one; the sweep in the ticket's script is the check.
- **The default air is 0.08em above and below, 0.14em at the sides.** Chosen by eye on the 12
  and the denominators at the problem's size (21.6px) and the read-as size (16px). Both numbers
  live in one CSS rule.
- **No warm-up TeX is altered by the hint machinery now.** The sweeps assert it. If a future
  hint wants a visible gap between two fragments, put it in the problem's TeX by hand so the
  problem at rest is what the teacher wrote, never in `termTex`.

## "Talk it through" on the hint card, the bare help menu (from ticket 99, 2026-09-11)

- **A word on the greyed "another hint".** While the latest hint is stalled the menu's hint pill
  is greyed with no explanation (the notes are gone by request). If students open the menu and
  stall there, a one-line helper under the pills ("act on hint 1 first, or talk it through") could
  come back; not added, the pill on the hint card is meant to be the answer.
- **The pill on reopened earlier hints.** Only the latest hint carries "Talk it through"; a
  reopened hint 1 with hint 2 showing has none. If a student wants to talk about an earlier hint,
  the plain chat is there. A per-hint opener ("Let's go back to hint 1…") would be needed first.
- **The pill while the worked example plays.** Hidden, like "I need help" (ticket 95); the
  chat beside the example is headed "Question about a step?" and has no room for the hint
  opener. If the example's chat should also take a hint question, the opener would need a
  variant that names the step.
- **Hover and focus rings on the menu pills.** Hover is accent-soft fill; there is no
  focus-visible ring beyond the browser default. A keyboard pass over the whole overlay is still
  owed (see earlier notes on the help chat).
- **The popup is as narrow as its widest pill.** "worked example" sets the width (248px with
  padding); a longer option label later (a fifth row, a two-word video label) widens every pill.
  If the menu grows, a fixed 280px with left-aligned pills may read better than fit-width.

## The tall box round a whole fraction (from ticket 100, 2026-09-11)

- **0.2em above and below is by eye** on x/4 at the problem's size and 21/2 on a read line. A
  fraction with a taller numerator (a squared term, a nested fraction) gets the same 0.2em; the
  box grows with the fraction, so it should hold.
- **Only `\frac`, `\dfrac` and `\tfrac` count.** A radical, a binomial or a matrix as a whole
  fragment would get the digit's 0.08em; add it to `isFraction` (rename it) when a warm-up first
  wraps one.
- **The side air is unchanged (0.14em).** In the screenshot the x/4 box sits 0.08em from the "+";
  if that reads as cramped, the fraction box could take 0.2em at the sides too, but the "+" has
  its own 0.22em of spacing to give, so it was left.

## The stall notice behind "hint" (from ticket 101, 2026-09-11)

- **Ticket 99's greyed "another hint" is superseded**: the row reads "hint" and answers a stalled
  press with the notice. The note above about a helper line under the pills no longer applies.
- **The notice could name the hint** ("hint 2") or quote its first words when several are
  stacked; the sentence is fixed for now ("the previous hint").
- **A stalled press when no further hint exists** shows the notice too ("before giving you
  another" is then not quite true); once the student moves past the hint the pill greys as
  before. A variant sentence for the last hint was not asked for.
- **The notice is a second card, not the menu reshaped.** If the two-card sequence (menu, then
  notice) ever feels like a detour, the sentence and its pill could replace the menu's contents
  in place, keeping one card on the scrim.

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
- **More than three fixed lines.** A fourth answer and beyond reuse "A lot of students share
  that struggle." If a demo seeds five or more skills and the repeat shows, a fourth and fifth
  line could be added to `REFLECTIONS`.
- **Reflection length and the chat's pace.** Each later turn now takes 2.8s to reach its
  question. If the chat feels slow with many skills, the reflection's dots could be shorter than
  the question's (`turnSteps` takes one dots length for every bubble today).

## The chat capped at the bottom of the column (from ticket 103, 2026-09-11)

- **The cap is a share of the column (42%), not a number of bubbles.** A five-line reply fills the
  visible list and the student's own line scrolls just above it. A cap of "the last two bubbles,
  whatever their height" would need measuring; not asked for.
- **No drag handle to resize the chat.** The student cannot trade read-as space for chat space by
  hand; the split is fixed. Deferred: a sash between the two lists, remembered per device.
- **No "new reply" marker when scrolled up.** If the student scrolls the transcript up while a reply
  streams in, the scroll-to-end effect pulls the list back down on each chunk. A "jump to latest"
  pill that only appears when the student has scrolled away was not asked for.
- **Ticket 90's 45% cap on the read-as list is gone**: the read-as list scrolls on its own once
  the chat takes its share. The note above about the read-back staying in view still holds.

## The centred "Talk it through" pill (from ticket 105, 2026-09-11)

- **Centred, not full width.** The pill keeps its content width under the text. A full-width
  pill (like "I need help" below the card) would match that button's shape but make the hint
  card read as a second button; not done, and the two would then compete.
- **The collapsed hint's line has no pill**; a reopened earlier hint has none either (ticket 99).
  If earlier hints ever get one, the same centred row applies.

## The closing bubble's hold (from ticket 107, 2026-09-11)

- **A hold tied to reading time, not the turn.** The thanks stays up 2.8s, the length of a whole
  tutor turn. When the closing line is live (a summary of the student's answers, see ticket 102's
  notes) it will be longer, and the hold could scale with its word count, or the pad could wait
  for a "let's go" press instead of a timer.
- **The same hold for the pad's own closings.** Other timed hand-offs (the practice prompt, the
  debrief) keep their own waits; if 2.8s reads right here, the others could be checked against it.
## The conjured 1 in the margin, the sweep in the repo (from ticket 104, 2026-09-11)

- **The 1 overhangs whatever is to its left.** `\llap` paints the conjured fragment to the left of
  where it stands; the only use has x² at the start of the line, so it hangs into empty margin. A
  conjured fragment mid-line (an implied 1 before a later x) would sit on top of the operator
  before it; `conjure` would need `\mathllap` with a kern-free gap or a raised marker instead.
- **The sweep runs the warm-ups on offer, not every problem in `data/practice.ts`.** The
  discriminant, sketching and evaluation problems reach the pad only through the mid-set
  overlay; the sweep could open the overlay by writing the session's `overlay` leaf into
  localStorage (see the testing memory note on rewriting the session shape) to cover them.
- **The sweep's default port is 3121, shared with the laptop check.** Another agent's app on
  that port makes the sweep read their build; set `HINT_SWEEP_URL` to your own.
- **The rules could be enforced at build time.** A lint on `data/practice.ts` that any TeX
  written by hand may contain `\,` or `\kern` but `lib/hint.ts` may not (a grep in a vitest)
  would stop the ticket 96 mistake before a screenshot does.

## Carson's notes

Hand-written by Carson. Agents: append new sections *above* this heading and never edit,
reformat or move anything below it.

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
