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

## The non-monic skill's name (from ticket 108, 2026-09-11)

- **"Monic trinomials" kept its name.** Only the non-monic leaf was renamed ("Non-monic
  factorisation"); its sibling still reads "Monic trinomials" in the picker, the confidence and
  peer screens. If the pair should match, it would become "Monic factorisation" in the same
  place in `data/taxonomy.ts`.
- **The short form is still "non-monic factorising".** Chips, the feedback sentence and the
  confidence copy use the `short` form, so they read "non-monic factorising" while the picker
  reads "Non-monic factorisation". If the noun form should carry through, the short would
  change too (and the fixtures and tests that quote it).

## The practice prompt's copy (from ticket 109, 2026-09-11)

- **"2 minutes" is a fixed claim.** The heading promises two minutes whatever the practice; the
  isolated practices are one problem each, so it is roughly right, but nothing measures it. A
  heading that reads the practice's actual length (or a timer on the overlay) was not asked for.
- **The line break is hard-coded.** The body breaks after the first sentence with a `<br />`,
  which is right at the card's fixed 560px width on the iPad stage. If the card ever becomes
  fluid, two `<p>`s (or `white-space: pre-line` on a `\n`) would carry the break the same way.
- **Only this card changed case.** The help picker ("Which skill?") and the overlay's chips keep
  their existing casing; ticket 31's lowercase "in the student's words" rule now applies only to
  the skill names inside the sentences, not the sentences themselves.

## The 6 written as 12/2 in the fractions working (from ticket 106, 2026-09-11)

- **A hint of its own for the new line.** The common-denominator hint now covers three lines
  (the 6 moved, the 6 as 12/2, the numbers combined). A student who has moved the 6 but not yet
  written it over 2 could be told that first ("Write the 6 over the same denominator as the 9/2,
  then add the tops"), with "6" and "9/2" as its linked words on their own line; the stall rule
  would then hold them at that line instead of letting the x-terms hint through.
- **The step's label on screen.** Step labels ("Wrote the 6 over 2, to match the other fraction")
  reach only the help chat's system prompt; the worked example card shows the maths alone. A
  student who cannot see why 6 became 12/2 has to ask the chat.
- **Every whole number in a fraction working.** The same intermediate line would help the
  mid-set overlay problems that add a whole number to a fraction; none does today.

## The monic skill's name (from ticket 110, 2026-09-11)

- **The student still sees "Factorising".** The teacher's tree reads "Monic factorisation" next
  to "Non-monic factorisation"; the student-name override in `data/taxonomy.ts` keeps the
  student's picker, confidence and peer screens at plain "Factorising" so the qualifier only
  appears when they meet the non-monic case. If the student should see the full name too, the
  override goes and the warm-up chat's "Let's start with ___." would say "monic factorisation".
- **The short forms are still "-ing".** "monic factorising" and "non-monic factorising" in chips,
  the feedback sentence and the confidence copy (see ticket 108's notes).

## The "full sentence" box at the foot of the pad (from ticket 111, 2026-09-11)

- **Only the two worded problems ask.** `answerAs: "sentence"` is set on Q9 and Q10 by hand. A
  rule that reads it off the problem (a stem ending in a question mark, or a solution step tagged
  `reasoning.interpret.worded` / `reasoning.justify.conclusions`) would cover a new set without
  a flag; deferred until there is a second assignment to check it against.
- **The box asks and nothing answers.** The pad reads no fourth line for Q9 (the script ends at
  "turning point at x = 3"), so a sentence the student writes under the box is ink the read-as
  column never shows, and the report still marks Q9 as the compounded step. A scripted sentence
  ("The ball lands 6 m away and reaches 9 m.") revealed by the next burst, and the report reading
  it, was not asked for.
- **The rework pad does not ask.** The individual-review pad ("If needed, correct it here") uses
  the same `PadSection` but passes no note; Q10's rework script ends in a sentence already.
- **A box the student can dismiss.** The note has no close; it stays until a line is undone. A
  tap to dismiss it (remembered per problem in the session) was not asked for.
- **A typed answer.** "Text box" was read as a box of text on the paper, not an input: the pad is
  handwriting and the read-as column is its transcript. A typed sentence field under the pad,
  read into the report as the final answer, is the other reading.
- **Every problem.** If the box should appear after every problem's working (a sentence for
  "Solve for x" too), it is the flag on the other eight problems and nothing else.

## The factorising row and its kinds (from ticket 112, 2026-09-11)

- **The chat's words for the two kinds.** With both kinds chosen the offer reads "Warm up on
  factorising & non-monic factorisation first?" and the chat "Let's do a warm up on factorising &
  non-monic factorisation.", because the student names are still "Factorising" (monic) and
  "Non-monic factorisation". Now that the student picks "monic" and "non-monic" under
  "factorising", the names could become "monic factorising" / "non-monic factorising", or the
  chat could say "factorising (monic and non-monic)" when both are ticked. Left as is until the
  user says which; the override lives in `STUDENT_NAMES` in `data/taxonomy.ts`.
- **Other rows with kinds.** The same fold could serve "graphs" (sketching, reading features) or
  "equations" (linear, quadratic, simultaneous); `pickerRows` is the one place to add a row.
- **A kind-only warm-up when the student ticks one kind.** Today one kind means one warm-up
  problem for that kind; the other kind is never offered as a follow-up. If the student slips on
  the monic problem, the non-monic one could be offered as the next step.
- **The row's rank.** The row sits where the first factorising leaf ranked; ranking it by the two
  leaves' combined count would move it up a place or two on some sets.

## The confidence list's room (from ticket 113, 2026-09-11)

- **Fixed spacing, not a fit rule.** The screen fits seven skills plus two kinds at the iPad size
  by tightened spacing; an eighth skill, a second row with kinds, or a shorter window would
  scroll again. A layout that sizes the rows to the window (or lists the skills in two columns
  when there are many) would hold for any set.
- **Opening the kinds pushes the rows below down.** The list grows in place; a slide-open of the
  two kind rows (height transition) would make the shift read as an expansion.

## The answer field under the working (from ticket 114, 2026-09-11)

- **Nothing reads the sentence yet.** `session.answers[q]` is typed and kept, but the report, the
  teacher's mistake view and the marking (`evaluate`) do not look at it; Q9 still reads as the
  compounded step whatever is typed. Showing it under the working on the history and teacher
  screens, and letting a complete sentence clear the communication slip, are the next steps.
- **No "done" signal.** The chat box has "send"; this field has Enter, which only ends the typing.
  If the sentence should be submitted (and the field lock), a pill or the hand-in could do it.
- **Kept through clear.** Clearing the working leaves the typed sentence, which comes back when
  the last line is read again. If a clear should also empty the sentence, `lines/clear` drops it.
- **One sentence, one line.** Enter blurs rather than breaking the line (Shift+Enter still does).
  A student who wants two sentences types them on one line; the field grows with them anyway.
- **The rework pad.** The individual-review pad passes no `answer`; Q10's rework script ends in
  the sentence, so it was not needed there.

## The hand-in check and the star tiles (from ticket 115, 2026-09-11)

- **The blue box needs a pointer.** The "Return to Q2, Q3, Q4" labels box in blue under the mouse;
  an iPad has no hover, so on the device they are accent-coloured text that responds to a tap and the
  box only ever shows on a laptop. If the tap target should read as a box on touch too, the labels
  would need a resting outline (or the box on `:active`).
- **No way to close the card and stay put.** The card closes on a way back (a label, a tile, the
  jump), a pen stroke on the pad, or Confirm submit; there is no ✕ or Escape. A student on a blank Q10
  who wants to write it has to start writing, which does close it.
- **"Confirm submit" beside "Hand in".** The user asked for those words; every other button on the
  student side says "Hand in". "Confirm hand in" would match if that matters.
- **The card's heading is new copy.** "Hand in with Q7 blank?" / "Hand in with blanks?" was not
  asked for; the user named only the buttons. It could go, leaving the buttons alone.
- **Blank means no recognised line.** A problem with ink the recogniser has not turned into a line
  (a stray mark) counts as blank and is listed. Counting strokes instead would treat any mark as an
  attempt.
- **The jump order wraps round.** From Q7 with Q2 and Q9 blank, the jump offers Q9 then Q2. Set
  order from the top (Q2 first) is the other choice.
- **The feedback screen's list still shows "Q1 ★".** The star-only tile is the working screen's
  Problems list only; the rework list on the feedback screen keeps the label with a star beside it,
  as does the teacher's report.
- **The "← Q9" back button stays while returning.** With "Jump to Qn" and "Hand in" beside it the
  three fit the column at 12px side padding; if the labels ever grow (Q100), the back button would be
  the one to lose its label.
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
- **The mistakes box could be dynamic across the rework.** It now reads the first hand-in only
  ("in your first submission" while anything is incomplete). The user: "add to F_F if I want to
  make this dynamic". A live version would count problems whose latest version contains a mistake
  (the `final` summary already computes it) and drop the "first submission" clause once the rework
  covers everything.
- **Q9 in the scripted demo never finishes.** Its recognition script stops at "turning point at
  x = 3" and it has no rework script, so the demo's handed-in screen always shows at least "1
  problem is incomplete." Either give Q9 a rework script ending in the greatest height, or mark
  that compounded line as an answer.
- **"Unfinished" on the teacher's side.** The teacher's report and the class views still show
  line counts and "not attempted"; the three-state progress (`progressOf`) could replace them so
  the teacher sees who stopped short as well as who never started.
- **Hand in with work outstanding.** The button stays enabled with incomplete problems (a forced
  hand-in with blanks is a path the teacher relies on). A confirm ("Hand in with 3 unfinished?")
  like the working screen's blank check could be offered here too.
- **The stored `notAttempted` list.** `session.notAttempted` (from a teacher's force-submit) is
  the blank-at-hand-in list as stored state; `progressOf` now derives the same thing plus
  "unfinished" from the lines. One could replace the other.
- **The typed sentence is taken as an answer unread.** Any non-blank text in ticket 114's field
  finishes a worded problem: "idk" counts. Nothing marks the sentence, so it can add to neither
  box. When the sentence is read (a model, or a scripted check), the answer flag belongs on it and
  a wrong one should count as a mistake.

## The "we're stuck" mode is gone (from ticket 117, 2026-09-11)

- **Removed, not fixed.** The user (2026-09-11): "let's delete the we're stuck mode. it's fucked up --
  just shows the right answer if somebody in the group got it wrong. remove it entirely". The
  reveal put every member's handed-in work side by side, and a member who never slipped on the
  problem (Jordan on Q3, who never reached it) had the model solution standing in for their work,
  so the group was handed the answer the moment anyone pressed it. The button, the reveal, the
  `group/stuck` action, the run's `stuck` list, `earlierVersions` and the script's `stuckAfter`
  are all deleted rather than left behind a flag.
- **A stuck mode that does not give the answer away.** If a group really stalls, the useful things
  are a hint on the board (the practice pad's hint machinery, ticket 85/86, applied to the group's
  problem), a nudge to the teacher (the pen-holder's group shows on the teacher's live view as
  stalled, ticket 42's race already knows the timing), or the pen passing to another member. Any of
  these could take the freed spot at the left of the action row.
- **Showing earlier work without the model solution.** The reveal's first-mistake cut was sound; the
  give-away was the stand-in for a member with no attempt. A version that shows only members who
  actually slipped, and says "not attempted" (which it already could) for the rest, would be a
  smaller ask than the mode was. Deferred: the user wants it gone, and the debrief after a correct
  check already puts three versions side by side.
- **Historical docs keep the old behaviour.** Tickets 40, 52 and 76 and their architecture notes and
  decision-log entries still describe the button, the reveal and the scripted Q3 press as they
  were built; only the root README, ARCHITECTURE.md and the code changed.
- **Stored runs from before this ticket still carry `stuck: []`.** The classroom store's `GroupRun`
  no longer has the field; a run persisted in localStorage before the change keeps an extra key
  nothing reads. Harmless; a store version bump would clear it if the shape ever needs one.

## Teacher assignment creation as the landing screen (from a chat, 2026-09-11)

- **The teacher lands mid-creation, not at a blank.** The user (2026-09-11): "i want to model the
  teacher going from having no problems to having all of them. well actually that's not exactly
  true, i'm fine with them jumping into the 10 problems … as if we're encountering them mid
  assignment creation. so i want the teacher landing screen to be that." So `/teacher` becomes the
  draft of "Roots of a quadratic — Set 3": the ten problems as the same five-wide tiles the
  student's start screen shows (ticket 47's `ProblemCard` compact tile), with editing affordances
  on top. The set the teacher sees is the set the student sees. Not built yet; scoped in the chat.
- **The from-nothing flow.** A blank draft, then a topic or unit, then problems arriving from
  somewhere: searching the bank by subskill, typing or pasting one, a photo of a textbook page,
  "give me three more like Q4", cloning a past set. Deferred 2026-09-11: the user chose to land
  with the ten already there; the sourcing surfaces are each a screen of their own, and the bank is
  the fixture (see "A real problem bank" under Data and platform).
- **The teacher dashboard.** What sits above one assignment: this class's other sets, other
  classes, what is due, what is being marked. The user: "tomorrow i'll think more through the
  teacher dashboard & yeah all that." Deferred to 2026-09-12. Until then the class view (today's
  `/teacher`, `TeacherLive`) needs a home once the draft takes the landing route: a tab in the
  teacher chrome, or the assignment's own "class" view reached from the draft once it is assigned.
- **What a tile can do.** Remove; swap for a sibling (same skills, different numbers); edit the
  stem or the expression in place; drag to reorder, the labels renumbering; a dashed "+" tile at the
  end. Which of these land first is open. A tile is the student's tile, so any affordance must sit
  on it without changing the card's size: the grid stays the student's grid.
- **Coverage beside the grid.** The current form's leaf chips (skills the chosen problems touch)
  and the unit-focus card (ticket 26's infer / confirm / reassess) move from a form to a rail or
  footer beside the tiles. Worth adding there: the unit's skills *not* touched by any chosen problem,
  the difficulty spread (the teacher side may show `DifficultyTag`; the student side never does), a
  rough time estimate. Deferred: none of it exists as a derivation yet beyond `leavesTouched`.
- **Pathway, due date and class on the tile screen.** The pathway map (ticket 19) and the due
  date have no natural spot on a grid of problems. Likely a footer strip, "Assign" at the right where
  the student's "START" sits. The pathway stays fixed at creation (see Review pathways).
- **Preview as the student.** Because the tiles are the student's component, a preview is the same
  screen with the affordances hidden, not a second rendering. Cheap once the draft screen exists.
- **A draft that survives a reload.** `NewAssignment` keeps title, chosen problems and pathway in
  component state and dispatches `assignment/create` once. A landing screen that *is* the draft
  needs the draft in the classroom store (a `draft` beside the active assignment), so a reload, or
  a walk to the class view and back, keeps the teacher's edits. Same shape as the whole-class setup
  view's local state (noted under Whole-class review).
- **More than one assignment.** The classroom store holds one active assignment. A dashboard, a
  drafts list, or "clone last week's set" all need a list keyed by id, with the student side reading
  the assigned one. Deferred with the dashboard.
- **The old form.** Once the tile screen is the landing, `app/teacher/assignments/new` (title
  field, checklist of problems, unit focus, pathway map) either becomes the tile screen's route or
  is deleted; the "New assignment" pill in the teacher chrome points at whichever survives.

## The create screen: typing questions into tiles (from ticket 119, 2026-09-11)

- **Teaching the typing convention.** The user (2026-09-11): "i'll type in basic like coding
  language, eg x**2 & want that to render as KaTeX. add to F_F bc that's obv not intuitive for
  teacher." Nothing on the screen says how to type maths (the user: "nothing at all -- i'll
  resolve later"); the live tile is the only teacher. Options when it is resolved: a quiet line
  under the grid ("Type maths as you would on a calculator: x**2, 1/3, sqrt(2)"), a first-run
  example tile, a "?" beside the title, or a small palette of buttons that insert the forms.
- **An explicit maths delimiter.** Backticks or `$…$` around maths would remove every wrong guess
  of the detector (it sets "Q3" and "2 marks" in maths, and "as x grows" leaves the x in prose);
  deferred with the LaTeX concern. The parser already reads `$`-free text, so a delimiter would be
  an addition, not a change.
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
- **Sub-parts (a), (b), (c).** A tile is one question; there is no sub-part. A newline is already
  taken for the prose/expression split, so sub-parts would want their own affordance (a "+ part"
  in the tile, or "a)" at the start of a line).
- **Reordering tiles.** No drag or move; a removed tile comes back where it was. A drag handle, or
  Alt+arrows while a tile is focused, would do.
- **Worked solutions, difficulty and skills per question.** The old screen showed difficulty tags
  and leaf chips; the create screen shows none (the user: "eliminate all this"). Where they
  belong, if anywhere, is the review screen's decision; the model solution (`Problem.solution`)
  the student's marking runs on has no source for a typed question at all.
- **An undo stack.** One removal is restorable ("Q2 removed. Undo", Cmd+Z); a second removal
  replaces it. A stack is a list instead of a value.
- **Empty tiles in the middle.** A tile emptied with select-all-delete, not Backspace, stays as an
  empty numbered tile with the ghost's placeholder but a solid border; it is dropped from the
  draft. Backspace in it removes it. A blur could remove it too.
- **The old screen.** `/teacher/assignments/new` stays reachable by URL, unlinked, until the
  review screen replaces it; then it and `PathwayMap`'s home should go or move.
- **The draft is the classroom store's.** It is mirrored to every tab and survives Reset demo only
  as far as `reset` clears it (it does). A teacher with two tabs open on the create screen would
  see the last writer win on reload, not live.

## Genuine assignment creation, from nothing (from ticket 121, 2026-09-11)

- **The create screen is prefilled for now.** The user (2026-09-11): "i don't want this blank
  view -- i want it prefilled for now, & for genuine assignment creation to be a next round
  concern." With no draft in the store the screen seeds the demo set from `data/draft-seed.ts`
  (ten typed lines, Q1 with +5x and a repeated Q9 for the review step's recommendations). The
  blank flow of ticket 119 (one ghost tile, type, Enter, paste) still exists once the draft is
  emptied, and is what a real teacher would start from.
- **From-nothing creation, next round.** What the blank flow needs before it is the product:
  where the questions come from (typing is one source; a photo of a textbook page, a paste from a
  PDF, "three more like Q4", the bank searched by skill, last term's set cloned), the typing
  convention taught (see "The create screen: typing questions into tiles"), sub-parts, figures,
  worked solutions or at least an answer per question so the marking has something to run on, and
  a real bank behind it (see "A real problem bank" under Data and platform). The seed should then
  go, or become a "start from the demo set" choice.
- **The seed's ids are fixed.** `seed-1…10` reappear after every Reset demo, in every tab; fine
  for a demo, wrong once drafts are listed or shared.
- **One fixture, two readers.** The review step's branch carried its own copy of the paste when
  this landed; it should import `DEMO_PASTE` from `data/draft-seed.ts` so the two never drift.

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
- **The QCAA 60-20-20 split.** Considered as a bar on the recommendations step and dropped: the
  user (2026-09-11) "that's only for final assessment, not necessarily practice -- we're going
  for a blend of problem difficulties, but not aiming for the 60-20-20 idea". A practice set has
  no target split; if one is ever wanted it is a teacher setting, not a rule.
- **Editing a proposed problem.** The addition offers three alternatives and Try another; a
  teacher cannot edit the proposed text or write their own on the card. An Edit that turns the
  stem into the create screen's text box, or "add my own", would sit beside Try another.
- **The decline that is not honoured.** Keeping `x^2 + 5x + 6 = 0` leaves it in the assignment's
  `questions` but the student still runs the bank's −5x (see ASSUMPTIONS). Honouring it means the
  bank holding both variants with full solutions, hints and scripted slips, or the student side
  running on typed questions with a model solution generated for each.
- **Typed questions that reach students.** Create stores the finalised questions as typed beside
  the bank ids; only the bank ids run. A question the bank does not hold (anything the teacher
  writes, the garden or the rocket alternative) is on the assignment and never on a student's
  screen. The teacher's views do not yet list `assignment.questions` either; the class view's
  title line could.
- **The class is twenty.** The evidence line counts a class of twenty; the fixture roster is
  eight. A single class-size constant, or the roster grown to twenty, would reconcile the peer
  screen's "of 8" with it.
- **The evidence behind the change.** "7 of 20 students slipped on the sign of the factor pair in
  monic factorising" is a fixture sentence. The real line comes from the leaf statuses the
  mistakes view already computes, for the previous set.
- **The old screen.** `/teacher/assignments/new` still renders, unlinked, sharing `PathwayMap` and
  `UnitFocus` from `app/teacher/assignments/`. Now that the review step has both, it can go.
- **Animation.** The pills arrive 90ms apart on the difficulty step, every time the step is
  entered (including a reload); the bar is a CSS animation timed to `ASSESS_MS`. Reduced-motion
  users get the pills without the rise; the bar still fills.
- **Step persistence and two tabs.** The review lives in the classroom store like the draft, so a
  second tab sees the step change live; the assessing run is local to the tab that pressed it.
- **Removed tiles vanish.** Accepting the removal drops the tile and renumbers at once (the card's
  line says "Q9 removed" with Undo). A greyed tile in place was considered and not built: the
  numbering would jump at Finalise.

## The difficulty pill rotates on tap (from ticket 122, 2026-09-11)

- **The popover, reverted.** Ticket 120 opened the four labels under the pill; the user chose a
  single tap that moves to the next label in the fixed order instead. Deferred with it: any way
  to jump straight to a label (a long press opening the four, or a keyboard's arrow keys), and
  any sign on the pill that it is tappable beyond the hover shadow and the helper line.
- **Rotation on the recommendations grid.** The pills there are static; a relabel is the
  difficulty step's business. If a teacher wants to relabel a changed or added question, the
  addition's label is the fixture's and cannot be changed anywhere.

## No Confirm on the unit focus (from ticket 123, 2026-09-12)

- **The confirmation, reverted.** The review step's unit focus no longer asks to be confirmed
  and Create is on at once (the user: "messes up workflow. leave the option to clarify though").
  The old screen keeps its Confirm; when it goes, `UnitFocus`'s `onConfirm` goes with it.
- **Reassess by note only.** The only way to change the unit is to describe the focus and
  Reassess, by keyword. A unit picker (the four units as pills) beside the note would be the
  direct correction; deferred, the note is the demo's story.

## Class review as the stage's name (from ticket 124, 2026-09-12)

- **The name in code.** On screen the third stage is now "class review" everywhere (the user:
  "need to make that consistent"), but the stage id is still `whole-class`, the route is
  `/teacher/whole-class`, the store field is `wholeClass`, the actions are `wc/*` and the
  components are `WholeClassCard` / `WholeClassSetup`. Deferred: a rename of the identifiers to
  match; nothing a user sees depends on it, and the `?pathway=wc` deep link and the
  `data-whole-class-card` hooks in the check scripts would all move with it.
- **Docs that keep the old name.** Ticket titles and architecture notes from tickets 23–54 and
  the decision log say "whole-class review" as the history they are; only the README's
  live description was updated.

## Category markers as pills (from ticket 125, 2026-09-12)

- **A pill row in the key.** The class view's key still shows one dot per status; the category
  pills use the same colours, so the key was left alone. A second column of pills in the key
  (or a one-line "categories are pills, groups and skills dots") would spell it out; deferred
  until a teacher asks what the two shapes mean.
- **Centring the tree under the pill.** A group's dot hangs from the pill's left edge (the
  column measurement reads the marker's left). Centring the dot under the pill instead would
  put the tree's text under the pill's right half; kept left-aligned as the outline convention.
- **Pill width from the column.** The pill is a fixed 28 × 13. A pill that grows with its
  column (a bar, not a marker) would read as a progress meter, which it is not; deferred.

## The pill's corners (from ticket 126, 2026-09-12)

- **The chip's radius verbatim.** The user asked the pill to "mimic the shape of the category
  header"; the header chip is 6 px on 22 px, and 6 px on the 13 px pill would still be almost a
  stadium, so the pill scales it to 4 px. If the two are ever the same height (a taller pill, or
  the pill replacing the chip as the header), one radius token for both.
- **A shared "category chip" token.** The header chip's `rounded-md bg-standout-soft` and the
  pill's `rounded` live in two files; a `CATEGORY_RADIUS` constant in `components/Tag.tsx` would
  keep them from drifting. Deferred: two call sites.

## The pill hides the row's buttons (from ticket 128, 2026-09-12)

- **The header chip the same way.** A column header hovered swaps its chip for the see skills /
  full breakdown buttons; the user's "two options, not both at once" reasoning would also argue
  for the chip itself being the click target with the buttons for everyone else. Not asked;
  deferred until the header's hover is revisited.
- **A gap between pill and buttons as a cue.** With the pointer moving from the name across to
  the first pill the buttons vanish at the pill's edge; a short fade instead of a cut would
  read less like a flicker. Kept instant to match every other hover reveal on the grid.
- **Touch.** On a touch screen there is no hover, so neither the buttons nor the pill's hover
  ring show before the tap; the pill tap drills and the buttons only appear through focus-within.
  Fine on the teacher's laptop; a tablet teacher view would need an always-visible affordance.

## The live diagnostic beside each problem (from ticket 127, 2026-09-12)

- **More than one push at a time.** The session has one diagnostic slot, so while a push waits
  every other panel's "send to class" is off (with a title). Queueing pushes, or several open
  at once with the student answering them in turn, deferred until a teacher wants two out.
- **A panel that opens itself.** A panel whose push is waiting when the page loads (reload,
  another tab) stays collapsed with the badge on its chip; opening it automatically was
  deferred (the session arrives after mount, and an unasked-for open would push the cards
  about).
- **The response line's third word.** The line under a push still says "recorded" / "not
  recorded" while the switch says "respond online"; "responded online" there was deferred
  until the recorded mode does something different for the student.
- **"Respond online" off means what?** With the switch off the student still gets the modal;
  a true not-recorded mode (a show of hands, the question on the board only, nothing on
  devices) needs the board to carry the question. Deferred.
- **A suggested question that reads the slips.** The example is a fixture per problem. Picking
  it from the slip pill under the problem (a different check for a null-factor-law slip than
  for a sign slip on the same problem) deferred until the fixtures cover more than one slip
  per problem.
- **Answers across the class.** The response line reads the demo student only; a count and a
  bar per option once classmates answer, deferred with the rest of the mocked class.
- **Stable card widths.** Opening a panel narrows that problem's card (the panel takes 380 px
  from the row); reserving the column for every row would keep the cards one width but leave
  a chip floating in empty space beside each collapsed row. Kept the chip at the right edge;
  revisit if the reflow annoys.

## The grace after a pill (from ticket 131, 2026-09-12)

- **Two seconds is a guess.** `PILL_GRACE_MS` is one constant; a teacher who reads slowly
  between pills may find the buttons popping up mid-thought, a fast one may find the wait long.
  Tune it once a teacher has used the grid for a session.
- **Grace on the header chip too.** The column header's see skills / full breakdown buttons
  still swap in the instant the chip is hovered; the same grace (and the same "the chip is its
  own way in" rule from ticket 128's deferred note) would make the two hovers consistent.
- **A fade at the end of the grace.** The buttons appear in one frame when the clock runs out
  while the pointer is resting; a short fade-in there would read as "you have been still" rather
  than as something jumping. Kept instant to match the other hover reveals.
- **Per-row clocks.** Deliberately one clock for the grid; if a teacher ever complains that
  moving from a pill in one row to the name in the next feels slow, a per-row clock is a
  `Record<string, number>` in the same place.

## The Pathway card marks where the class is (from ticket 129, 2026-09-12)

- **A count for class review.** The user asked for `N/20 done` beside the current stage; class
  review has no per-student count (the class is frozen together), so its ringed pill carries
  nothing and the class review card above it says `problem 1 of 2`. A note such as `problem 1 of 2`
  beside the pill would repeat the card; deferred.
- **The working stage and a missing student.** The class moves to individual review when the
  live student hands in, so the `indiv working` pill goes navy while a classmate still shows
  MISSING on the grid. The grid keeps that; a pill that stays lit until Force assignment submit
  fires, or a small `1 missing` under the navy pill, was not asked for. Deferred until the
  classmates are live rather than fixtures.
- **Who is not done.** Hovering the count could list the students still on the stage (the ten
  still working, the two not yet in at the gate), the way the confirm line of Force assignment
  submit counts them. Not asked; deferred.
- **The individual review count and the classmates' fixture.** The classmates hand in corrections
  on a scripted timeline anchored to the live student's, so `indiv review` reads `0/20 done` until
  the live student reaches the gate even though most classmates finished their sets long before.
  A per-classmate `arrivedAt` in the fixture would let the count climb on its own clock.
  Deferred; the demo's story is the live student's.
- **Centred pills.** The column moved to the card's left so the note beside the current pill has
  the rest of the width (the countdown with Cancel needs about 125 px). Centred pills with the
  note hanging in the card's padding, or a wider side column, are alternatives if the left-aligned
  column reads wrong.

## Drill dots as markers (from ticket 133, 2026-09-12)

- **The marked-up work too.** A problem's card in the drill (the work behind a skill) is not a
  marker: resting the pointer on it lets the buttons back after the second. If a teacher reads
  work with the pointer parked on it and finds the buttons popping up, add `[data-work-problem]`
  to `MARKER`.
- **The column view's drills.** With a column open under every student, each row's drill nodes
  are markers already (same tbody); the header's own controls remain instant. Same note as 131.
- **One second is a guess too.** Halved from two on the user's feel; `PILL_GRACE_MS` is the one
  place to move it.

## More mistakes, more kinds of mistake (from ticket 130, 2026-09-12)

- **Q8's mirrored read stays unused.** The evaluation table has always carried "x = −1 or
  x = −3" for Q8; the user wanted one problem nobody got wrong, and Q8 already was it, so the
  line is still nobody's. A student who makes it would need a different problem to be the
  clean one.
- **A third kind on more problems.** Q7 has three strategies; every other problem with a slip
  has two. A third on Q2 (the split found, then grouped wrongly) and Q5 (the axis from the
  wrong pair of roots) were sketched and not written; the box-per-mistake view (ticket 131)
  will show whether two is enough to read.
- **Mistakes the demo student can make.** The six new wrong lines are classmates' only; the
  demo student's scripted run and rework paths never write them, so their clues are seen
  through peers and examples but never in the student's own detective feedback. A run that
  reaches one of them is a recognition-script change.
- **Noah is the one eligible student right on Q7.** Chosen so a near-clean student remains;
  if a later fixture wants Q7 to be the whole class, Noah is the last to fall.
- **Liam's Q3 with `done: 2`.** Pre-existing: Liam is wrong on Q3 with two problems finished.
  Left alone because the class view and standings read it as they always have; a pass over
  `done` versus `wrong` for every classmate belongs with the full versions of the lightweight
  thirteen.
- **The race is hand-tuned.** `RACE_SCHEDULE` rows are re-tuned by hand whenever the unions
  change (mint and violet this time). A schedule derived from the union (a pace per group and
  the moments computed) would survive the next fixture change without a test failing first.
- **Sam's twelfths.** The demo group's bar now moves 17, 42, 67, 83, 92, 100 rather than round
  tens; nobody asked for round numbers and the rule (a problem's weight is how many of the
  group got it wrong) is the point, but a design pass on the race might prefer equal steps.

## The over pill's blue (from ticket 134, 2026-09-12)

- **One token for "done".** The Pathway card's over pill, the warm-up's lit skill button and the
  hint box's lit term all use `--color-standout` on white by hand; a `done` semantic token (or a
  shared class) would keep them in step if the blue ever moves. Not asked; deferred.
- **The current pill's ring.** The lit skill button that is current carries a light blue ring
  with an offset; the Pathway card's current pill uses the accent purple ring the user asked for.
  If the two are ever meant to match, the ring is the one place to change.

## The diagnostic flyout (from ticket 132, 2026-09-12)

- **Supersedes "Stable card widths" above.** The panel is now a flyout from the chip; the card
  never resizes.
- **Two flyouts at once.** Any number can be open; a lower one paints over the one above it
  where they overlap (later sibling wins). Closing the others when one opens, or an outside
  click closing the open one, deferred until a teacher trips over the overlap.
- **Focus on open.** The chip in flow is replaced by the card's own chip when the panel opens,
  so keyboard focus drops; moving focus to the card's chip on open deferred.
- **Flyout on a laptop.** On a window narrower than the flyout needs it shifts left over the
  problem card (16 px from the edge). A flyout that opens leftward or under the chip when
  there is no room to the right, deferred.
- **Resize while open.** The clamp runs when the flyout mounts, not on window resize; a
  resize with a flyout open can leave it off the edge until it is closed and reopened.

## The box per exact mistake (from ticket 135, 2026-09-12)

- **Twelve columns on one screen.** The user wanted a crowded problem's columns to narrow
  until all twelve fit unscrolled; the card is capped near 1426 layout px, so that is 118 px a
  column and maths under 9 px. The floor stayed at 186 px (the widest Q7 line at 13 px) and Q7
  scrolls sideways past about seven and a half columns. Wrapping the students onto a second
  row of columns, pills and boxes per row, is the way to show all twelve; it was set aside as
  its own design ticket (the pill spanning its students is the idea the wrap breaks). The
  other agent's ticket 138 (identical working shares one column) is the other route.
- **The box while collapsed.** Chosen: nothing shows until the problem is open. The name row
  could carry the same box (round-one option (b), two rectangles either side of the pill)
  so a teacher sees the split before opening; deferred until the open state has been used.
- **The live badge in a narrow column.** At 186 px "Sam Okonkwo · LIVE" truncates to "Sa…"
  because the badge keeps its width; the badge could drop under the name, or to a dot, when
  the column is narrow. Deferred with the name-truncation decision.
- **Prose lines.** Q10's sentences (`\text{…}`) are the widest lines in the fixtures and set
  the shrink for that problem; they are prose and could wrap at spaces while maths stays on
  one row. Deferred: the user chose shrink over wrap in the interview.
- **A box that says what the mistake is.** The box carries no label (the user: no second
  pill). A hover title, or the teacher note of the wrong line as a tooltip on the box's edge,
  would name it without a pill. Not asked.
- **Per-cell fit.** The whole problem shrinks by one factor so its columns read as one row;
  a student with one long line drags every column down with them. Per-cell sizes would look
  ragged; a per-cell cap only for that student's long line was not tried.
- **Measurement versus CSS.** `FitGrid` measures in a layout effect; a pure-CSS rule (font in
  `cqw`) was tried first and could not serve Q5 (four short columns) and Q10 (four long ones)
  at once. If container-relative typography ever knows content width, the effect goes.

## One column per identical working (from ticket 138, 2026-09-12)

- **Near-identical working.** Two students who differ by one right line (Q9's four-line and
  three-line routes to "h = 6") stay two columns inside one box; the user asked for exact
  matches only. A looser key (the wrong line plus the lines after it, or ignoring skipped
  right steps) deferred until a teacher asks why two columns look the same.
- **Names in a crowded column.** Seven names over one column wrap to four rows and the
  header row of the whole problem grows with them; a "+3 more" fold past a few names, or
  avatars alone with names on hover, deferred.
- **Whose column is it.** The compare footer ("As handed in · Original vs final") sits under
  the column the live student is in, though six classmates share it; a per-student footer or
  the footer beside the live student's name deferred.
- **Click a name.** The whole header cell expands the problem; clicking one name to open that
  student's report deferred (the class view has the report button).
- **Sort within a column.** Students keep fixture order inside a column (the live student
  first because the rows put him first); alphabetical or by confidence deferred.

## The roster's row (from ticket 136, 2026-09-12)

- **The name slot is a constant.** 142 px is the widest name on the demo roster at 16 px plus
  10; a roster with a longer name would push that one pill right (the padding keeps the 10 px)
  while the others stay aligned. Measuring the widest name at runtime (a FitText-style pass, or
  a CSS `ch` budget) deferred until a real roster needs it.
- **Category column widths are a two-step rule.** `columnWidth` gives 96 px, or 132 past ten
  letters, which fits the demo taxonomy's chips; a taxonomy with a twelve-letter chip other than
  "Communication", or two long chips, wants the width from the chip itself. Deferred.
- **The laptop budget is spent.** At 1280 × 800 the roster is 1204 of the card's 1208 px. Any
  further column (or a wider pill) means narrowing something: the Pathway column from 320, or
  the roster scrolling inside its card (which `scripts/laptop-check.mjs` forbids). Noted, not
  changed.
- **An avatar at both ends.** (Done in ticket 141.) The user's words were "place the avatar there"; it moved. If the
  leading avatar is wanted back as well, the student column needs about 44 px more (the avatar
  and its gap), which the budget above does not have at 1280 without a trade.
- **The Set column's "in progress"** under the count says what the pill now says on the same row;
  "handed in" is still only there. Dropping the duplicate deferred.
- **The last column's header is blank.** A repeated "Student" label, or the initials column
  sticky at the card's right edge while the card scrolls (below 1280), deferred.

## An unrecorded diagnostic, answered with fingers (from ticket 139, 2026-09-12)

- **The idea.** A live diagnostic the class answers by raising fingers (one for A, two for
  B…) rather than on their devices, so a student can commit to an answer without feeling it
  goes on their record; the teacher reads the room, nothing is stored. The "respond online" /
  "not recorded" switch (tickets 25, 127) was the first cut at it.
- **Why it is out.** The user (2026-09-12): the idea is good but "too nuanced"; the switch was
  a decision to make before every push, friction on the one thing the panel does. Removed
  entirely: one "send to class", no recorded flag anywhere in the model, no pill on the
  student's modal.
- **If it comes back.** As a distinct action, not a mode on the same button: a second, quieter
  control ("ask for fingers") that puts the question on the board and nothing on devices, with
  the teacher tallying by eye or tapping counts; the student side never sees it, so nothing to
  feel recorded by. Needs the board (ticket 44's slide) to carry a diagnostic. Defaults matter
  more than the option: the online push stays the primary, one-tap path.

## The diagnostic's result (from ticket 137, 2026-09-12)

- **Supersedes, in the ticket 127 section above:** "The response line's third word", "'Respond
  online' off means what?" (the switch and the flag are gone, ticket 139 removes them on main
  too) and "Answers across the class" (the counts are here, per option).
- **Reveal the right answer on a click.** The board marks the correct cell green the moment it
  goes up. A teacher may want the class to vote before seeing it: the cells plain first, a tap
  to reveal (the class view's card already knows). Deferred as a board control.
- **Misconception text for a written question.** The four-option editor has no field for the
  five words a distractor reveals, so a written question's cells show the count alone. A small
  input per distractor, and a bank of past written questions, deferred.
- **Who picked what.** The tally is counts only; the fixture picks name the classmates but no
  screen lists them. A hover or a drill from a cell to the students on it (and from there to
  their working on the mistake view), deferred until the class's answers are real.
- **Grounded picks only.** The classmates' picks follow their wrong lists and notes; Chloe (who
  submitted nothing) is the wrong answer where a distractor would otherwise be empty, and a few
  plausible stretches (Harper, Ruby and Finn reading the axis as an intercept on Q5). Revisit
  with the fixtures when the mistakes change again.
- **Three options on the board.** A written question with three options leaves the 2 × 2 grid's
  fourth cell empty on the projector. A one-row layout for three, deferred.
- **The clock's second.** Counts move on the teacher side's one-second clock, so the last
  classmate can show up to a second after the 8 s mark; the click-through waits 9.8 s. A finer
  tick for the diagnostic alone, deferred.
- **Trickle on the board.** The classmates' answers trickle only on the teacher's screens; the
  board shows counts only once it is up. A live board count while the class answers (the
  teacher putting it up early sees the pulse and a climbing count already), deferred as a mode.
- **Older sessions.** A stored student session from before this ticket keeps its `diagnostic`
  and `diagnosticAnswers` fields, unread; a hydration step that drops them, deferred.
- **The card's height.** With a result the class view's card is tall and Key moves down; the
  user chose this over a fixed slot (the teacher returns to the view fresh). A collapse to the
  question line with the cells folded, deferred until the column gets crowded.

## Marking correct but inefficient answers (asked for 2026-09-12, with ticket 140)

- **A third verdict beside right and wrong.** The user: "add marking for correct but
  inefficient answers." Today a line is `ok` or `wrong` (or `unclear`), and a problem is right,
  wrong or unfinished (ticket 140's box). An answer that is right but took the long way (the
  quadratic formula on Q1's monic that factorises, expanding then refactorising on Q3, solving
  both roots when the question wants the discriminant's sign on Q6 and Q10) needs its own mark:
  `inefficient` on the working, or a per-problem "efficient route" length the hand-in is
  measured against. Where it would show: the student's feedback screen (an amber line, "works,
  but there is a shorter way", never counted as a mistake), the teacher's mistake view (a third
  group under the problem in a third colour, or a count in ticket 140's box: "15/20 right, 3 the
  long way"), the class grid's dots (a status between solid and secure, or a mark on the dot),
  the report. Grace's jumps are the opposite case (right, steps skipped) and already have a
  teacher note; the two should read apart. Deferred: it needs the evaluation table to know an
  efficient route per problem and fixture attempts that take the long way; the hand-written notes
  below ("Address efficiency") already hold the intent.

## The right count (from ticket 140, 2026-09-12)

- **Over the class or over those who reached it.** The box reads "n/20"; "8/20" on Q9 is eight
  of the eleven who reached it. The tooltip holds the split; a second number in the box
  ("8/11 reached") or a hover card deferred until the teacher asks.
- **Colour.** The box is neutral cream at every count; tinting it (green when everyone who
  reached it was right, red under half) deferred so the red stays for the pills.
- **Click to see who.** The box is part of the header, so clicking it opens the problem; a
  list of the right students (or the unfinished) on click deferred; the class view has the grid.
- **Q8 has no card.** Nobody slipped on Q8, so the view has no card and no box for it,
  though `rightCount` covers it; a row of the problems nobody got wrong ("Q8: 15/20 right,
  nobody wrong") deferred.
- **The live student's rework.** The count reads the first hand-in like the rows; a second
  number after review ("15/20 → 18/20") deferred with the rework view.

## The roster's avatar at both ends (from ticket 141, 2026-09-12)

- **Column widths are still a rule of thumb.** `columnWidth` buckets a chip by its letter count
  (about 8 px a letter plus 20); a taxonomy whose chip breaks the estimate (wide letters, a long
  two-word name) wants the width measured from the chip. Measuring at mount (a ref callback, as
  the diagnostic flyout's clamp does) would also let the columns tighten to the chip exactly;
  deferred with the same note as ticket 136.
- **The laptop budget is spent again.** 1204 of 1208 px at 1280 × 800 with both avatars. The next
  thing added to a row (a column, a wider pill, a third button) is a trade: the Pathway column
  from 320, the 16 px name, or the card scrolling (which `scripts/laptop-check.mjs` forbids).
- **The pill lost 6 px of padding** (`px-1.5 gap-1`) to fit; if it reads cramped beside the
  16 px name, the 6 px has to come from somewhere else in the budget above.

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

-**REFINING REVIEW** -- consider if we want students doing group review with same questions,
  or if we should start setting up pathways to differnet problems or activities dependent
  on group performance/understanding.

-**ASSIGNMENT CREATION** tiles moveable --rn deleteable, but can't reorder.

-**DIAGNOSTIC QUESTIONS** add to teacher mistakes panel.