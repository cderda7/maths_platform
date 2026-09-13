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
- ~~**Confidence words that shrink.**~~ Done in ticket 190: labels stay at 13 px, wrap between
  words onto at most three lines, and a longer answer names what fits and counts the rest ("+1").
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
  stem or the expression in place; drag to reorder, the labels renumbering (landed, ticket 150); a
  dashed "+" tile at the end. Which of these land first is open. A tile is the student's tile, so any affordance must sit
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
  Alt+arrows while a tile is focused, would do. (Landed 2026-09-12, ticket 150: press-and-hold
  anywhere on the tile, and Alt+arrows.)
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

## The header row and the zoom (from ticket 142, 2026-09-12)

- **The zoom is a constant.** 0.72 is the user's 90% of 0.8; a teacher's own zoom preference
  (a control in the chrome, remembered per teacher) deferred; the browser's zoom still works on
  top of it.
- **Older width budgets.** Tickets 37, 127 and 136 sized the roster and panels for a 1280
  laptop at 0.8 (1600 layout px); at 0.72 the same laptop lays out at 1778, so those budgets are
  loose. Re-tightening the roster (a wider name slot, both avatars) is a trade ticket 141 opened.
- **The box's own line.** The right box is level with the header row by a shared constant
  (`PROBLEM_HEADER`); a header that grows (a two-line question) would leave the box high. A
  measured centre, or the box inside a same-height flex wrapper the card also uses, deferred.
- **The live pill elsewhere.** The pill came off the mistake view only; the class view's roster
  still marks the live row. Dropping it everywhere, or one marker for "this is the demo's live
  student" across the teacher's surface, deferred.
- **Tag colours.** "complex unfamiliar" borrows the amber of the `developing` status; a fifth
  hue reserved for difficulty alone (no overlap with statuses) deferred until a screen shows both
  side by side.
- **Flyout gap.** 11 layout px (8 on screen) between the card and the panel; if the user wants
  more, `ml-5` on the diagnostic is the one knob (the chip moves with it).

## The skipped tag (from ticket 143, 2026-09-12)

- **What "skipped" holds.** The class less the correct and the wrong: a classmate who stopped
  before the problem, the live student whose working reaches no answer (Sam's Q9), and the
  live student before any hand-in at all. A split ("2 didn't reach it · 1 no answer"), or a
  third tag for the unfinished, deferred until a teacher asks which is which.
- **A wrong that came after stopping.** Ethan and Harper slipped on Q9 though their `done`
  says they stopped before it, so they are wrong, not skipped; the fixture's `done` and `wrong`
  are not reconciled. Deferred with ticket 130's fixture notes.
- **Reading the two tags across problems.** The tags are the same width within a problem, not
  across the page (a "15/20" is wider than a "2/20"); a fixed width for the column so every
  tag lines up down the page, deferred until the eye complains.
- **Click a tag.** Neither tag does anything on click; a list of who skipped (or who got it
  correct) deferred with ticket 140's note.

## The flyout collapses on leave (from ticket 144, 2026-09-12)

- **No grace.** The panel closes the instant the pointer crosses its edge; a slip along the
  border while reading closes it and the chip must be clicked again. A short grace (150 ms or
  so, cancelled on re-entry) deferred until it bites.
- **Typing with the mouse elsewhere.** A teacher who clicks into "make your own", starts typing
  and lets the mouse drift out of the panel loses the panel (not the text). Holding the panel
  open while an input inside has focus, or while a key was pressed in the last second,
  deferred; the user asked for the plain rule.
- **The draft is memory, not storage.** The tab and the written question survive a collapse
  because they are the component's state; a reload of the page, or a switch to the Class tab
  and back, starts them empty. Keeping a draft per problem in the classroom store (as the sent
  question already is) deferred until a teacher loses one.
- **Touch.** A finger has no leave; on a tablet the chip toggles the panel as before, with no
  way to close it but the chip.
- **The class view's card.** Only the mistake view's flyout collapses; the class view's
  diagnostic card is a fixed box and does not open or close.

## Student screens: no default on the setup page (from ticket 146, 2026-09-12)

- **Remember the last choice.** The setup page starts with neither mode chosen every time; a
  teacher who always projects with screens frozen re-picks it each lesson. Pre-filling from
  the previous class review (still shown as a choice, not a default) deferred until a second
  lesson exists in the demo.
- **The board keeps a default.** From the board a problem with no mode of its own still reads
  as frozen (`currentSlide`'s fallback for sessions stored before modes existed). The setup
  page always sends a mode now, so the fallback is for old data only; removing it means a
  migration of stored classrooms. Deferred.
- **A nudge on Project.** Project is simply off with "Choose one to project." beneath the two
  options; a pointer over the disabled button explaining why (a title, or the options
  outlined) deferred until someone hovers it puzzled.

## The "select one" nudge (from ticket 147, 2026-09-12)

- **Supersedes "A nudge on Project" (ticket 146).** Pressing the faded Project now answers
  with "select one" on the button and a three-beat light-blue flash on both options.
- **Focus with the flash.** The flash is visual only; moving keyboard focus to the first option
  on the press (so Space or the arrows pick one) deferred until the page has keyboard use.
- **The same nudge for "no problem checked".** With every problem unchecked Project is simply
  disabled; a press does nothing. Flashing the problem list the same way deferred: unchecking
  all three is a deliberate act, not an oversight.
- **Scroll the options into view.** On a short window the options can sit above the fold when
  Project is pressed; scrolling them into view before the flash deferred.

## One flash (from ticket 149, 2026-09-12)

- **Three beats became one.** The user: "1 flash will suffice." A single 600 ms beat on each
  press; a longer or repeated cue only if a teacher misses the single one.

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
- **A narrow crumb rule.** The longest crumb ("Where the class is finding it hard") ends 200 px
  clear of the strip at iPad width; a crumb that grew past that would need to truncate.

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
- **A slide per mistake.** The user kept the problem as the slide's unit; a review organised by
  misconception across problems ("guessed pair" on Q1, Q2 and Q3 as one slide) was proposed
  and set aside. Revisit if a teacher wants to teach a habit rather than a problem.
- **Unit focus as a rank.** The badge marks a mistake on the unit's leaf; it does not lift it.
  The user chose badge only.
- **The board at a narrow window.** On a 1400 px window the board's example columns wrap
  inline maths mid-line (`2x^2 + 7x −` / `4 = 0`); a projector is wider. Pre-existing; a
  nowrap plus fit for the board's lines, deferred.
- **The diagnostic in the picker.** A diagnostic result's per-option count could sit beside
  the matching mistake in the menu ("12/20 picked this on the diagnostic"). Deferred.

## The picker's menu width (from ticket 152, 2026-09-12)

- **A menu wider than its slot.** The menu now takes the slot's width, so a long name with a
  badge wraps to two lines in a narrow column. A menu that widens leftwards over the
  neighbouring slot when the slot is narrow (the card's `overflow-hidden` clips anything past
  its edge) was set aside; the user asked for the narrower bubble.
- **Three-column slots at 1280 px.** Each slot is about 300 px wide at the laptop width and
  the menu with it; every current name fits on two lines. A longer written-question name
  would wrap further; a cap on the name length in the editor, deferred.

## Force submit per stage (from ticket 145, 2026-09-12)

- **The gate line is gone; force submit on indiv review is "start group now".** Ending
  individual review for everyone is what opened the gate, so one control does both. A separate
  "start group now" that waits for the corrections rather than forcing them is not offered.
- **No confirmation step.** "Force assignment submit" asked "N still working · 1 minute to
  finish" first; the button beside the pill starts the grace at once, with Cancel for the minute.
  A confirm line does not fit beside a pill in the 320 px card. If a teacher ever presses it by
  accident and misses the minute, an "undo the hand-in" for the last advance would be the fix.
- **"N still working" is gone with the confirm.** The count under the button says the opposite
  (`10/20 done`); hovering it could list who is not done. Not asked.
- **Force submit on group review ends the scripted race where it stands** (`endedAt`), and the
  board's final standings hold there; a group that was mid-problem shows its bar short. A
  "finish the problem on the board first" grace for the group with the pen was not asked for.
- **Force submit on indiv review without group review next.** A correcting student moves to the
  class review wait or the report; the classmates have no scripted review end, so the `indiv
  review` count stays at what the gate recorded (nothing, when there is no gate). Deferred until
  the classmates are live.
- **The button beside class review.** None: class review is ended from its own card. A "force
  submit" there could mean "end the session" and would duplicate that card's End session.
- **A wider card, a longer label.** "force submit" at 12 px is 64 layout px wide beside the
  190 px "indiv working" pill, leaving 17 px inside the card; "force assignment submit" or the
  13.5 px Button would not fit. If the card ever widens, the button can take the standard size.

## Submit on START's spot (from ticket 153, 2026-09-12)

- **One frame for every student screen's primary action.** Ticket 153 gives the confidence screen the start screen's frame by repeating its classes (`px-10 pt-6 pb-5`, `mt-auto … pt-4`, a `size="lg"` button) so Submit lands on START's rect. The other student screens (working, feedback, the group board, the report) each place their primary action their own way; a shared `ScreenFrame` / `PrimaryAction` slot would pin every screen's next tap to the same corner and make the alignment a property rather than a measurement. Deferred: the user asked for these two screens, and the working screen's actions live in the pad's own toolbar.
- **The warm-up offer over the list.** With the button row spanning the screen, the offer now rises at the screen's right edge and floats over the bottom of the dimmed skill list (it already did at the column's edge, by design: nothing moves). If it ever reads as covering the student's own ticks, the offer could sit to the right of the column instead of over it; the column leaves 206 px either side.

## Only unseen mistakes in the picker (from ticket 157, 2026-09-12)

- **An inert header.** With every option on show the slot's header keeps its colour but loses
  the chevron and does nothing on a click (a title explains). A greyed look, or a menu with one
  muted line "every mistake is already shown", was set aside as more furniture for a state the
  suggestion already puts the teacher in on most problems.
- **Swapping two slots.** A teacher who wants A and B the other way round has no direct move:
  each menu hides the other's option. A drag or a swap arrow between slots, deferred.
- **A fourth slot.** Q7 has four options and three slots, so one mistake is always off the
  board. `MAX_EXAMPLES` stays three (the board's columns); a fourth column when the problem
  has four distinct workings worth showing, deferred.

## The teacher's goal for the class (from ticket 154, 2026-09-12)

- **The teacher sees the goal back.** Creation is the only teacher-side view of the goal for
  now; the assignment overview, the class view and the projected board could show it (and the
  board could open the lesson with it). Deferred until asked for.
- **A pill for the goal.** The goal is a sub-step of the start, not a stage on the header's
  pathway strip or the teacher's Pathway card. Set aside: it is a twenty-second read.
- **A student's own goal.** Carson's note: later, student self-identification of a goal after
  reading the teacher's. The screen has room under the bubble for it.
- **A message to the not-confident.** Carson's note: low-confidence students receive a message
  from the teacher (acknowledging feelings). The same field shape, shown after the check-in
  rather than before; deferred.
- **Rich text, a cap the teacher can feel.** Plain text, line breaks kept, 280 characters with a
  counter; the textarea refuses more rather than warning. Bold, a link, a longer message with a
  scrolling bubble, all set aside.
- **The bubble at three lines or fewer.** The bubble's size follows the text; a one-line goal
  sits in a wide bubble with air at the sides. A narrower bubble for short goals, deferred.
- **The pulse on later CONTINUEs.** Only the overview's button pulses (the tiles beside it are
  what confuses); the goal and check-in buttons are the only thing on their screens. A pulse
  that starts after a few seconds of no click, and a pulse that stops after three beats, were
  both set aside for the continuous slow ring.
- **The older create screen.** `/teacher/assignments/new` has no goal field; an assignment
  created there reads the fixture's goal. Left as is: the screen is reachable by URL only.

## 2026-09-12 · Drag to reorder (ticket 150)

Press-and-hold reordering landed on the create screen, the review's difficulty grid and the class
review setup's example cards (`useReorder`, `lib/reorder`). Left out, and why:

- **The recommendations grid does not drag.** Step two's grid is the set as the answers leave it,
  with the assessment's addition appended and a changed question in its target's place; its order
  is the draft's, which the difficulty step and the create screen reorder. Dragging there would
  need the addition's position stored (an `order` on the review keyed by id, applied in
  `applyReview`). Deferred until a teacher asks to put the added question anywhere but last.
- **Touch.** Pointer events cover a finger, but nothing stops the page panning under a held
  tile, no `touch-action` is set, and the long-press context menu is not guarded. A hold on an
  iPad needs a look on the device.
- **Auto-scroll near the viewport's edge.** A drag to a slot off screen (a long set, a tall
  column of cards) has no auto-scroll; the boxes are measured once at the hold, so a wheel
  scroll mid-drag also puts the slots out of date. Re-measure on scroll, and creep the window
  near the edges.
- **A visible handle or hint.** The hold is discoverable by accident; the lift is the only sign it
  took. A grip glyph on hover, or a one-time "hold to move" line, is a copy decision.
- **Alt+arrows in a text box.** They override the word-jump keys while a tile is being edited. A
  different chord, or arrows only when the tile (not its text box) has focus, if it bites.
- **Undo of a move.** The create screen's one-step undo covers a removal only; a move is not
  undoable except by moving back. A move could join the same "Undo" line.
- **Moving several at once.** No multi-select; one item per hold.
- **Drop animation.** On release the held item snaps from under the pointer to its slot; a short
  settle transition would read better than the snap.
- **The setup's order is not stored.** `order` on the class review setup is component state: a
  reload puts the cards back in assignment order (the ticks and examples reset too, as before).
  If the setup ever persists, the order goes with it.
- **Reordering the problem list itself.** Ruled out by the user: the list is for choosing, ranked
  by struggle; the cards are the order.
- **The board's slide order after Project.** Once projected, the order is fixed (`wc/setup`);
  reordering from the board controls is a separate control.

## The review pad reads every problem (from ticket 158, 2026-09-12)

- **A scripted second version for Q5, Q6 and Q8.** Problems that held read their own hand-in
  again when reworked. A distinct correct route per problem (the quadratic formula for Q5, say)
  would make reworking a right answer worth watching; deferred until a demo needs it.
- **Finishing Q9 in the deep-linked run.** `reworkedSession` leaves Q9 unfinished so the group,
  class-wait and class-review fixtures are unchanged; a deep link that lands past the rework with
  Q9 finished (and the board's counts moved to match) is a separate change.
- **A row label that counts the rework.** After Q9 is finished its row reads "3 lines", the first
  hand-in's count; the one rework line is not counted because a problem that had lines at hand-in
  keeps that count. "3 + 1 lines", or the total, deferred.
- **Q9's greatest height in two lines.** A substitution line (`h = -(3)^2 + 6(3)`) before the value
  would read more like a student's page; it needs a marking-table entry and a second burst before
  the box counts down, so the one-line version stays for the demo.

## The post-rework notice (from ticket 159, 2026-09-12)

- **The count notice stays.** The user asked for "Every problem holds now." to go; the notice that
  names what is still wrong ("1 of your problems still contains a mistake. Double-check
  fractions.") is unchanged and still sits over the next screen until dismissed. Whether it should
  go too (the next screen is the news either way), or move off the demo strip's tabs which it
  covers on the iPad frame, is open.
- **A quiet mark for a clean rework.** Nothing now tells the student their rework came out clean:
  the waiting screen, the board or the report simply arrives. A small line on the waiting screen
  ("Nothing left to fix"), or a tick on the pathway strip's indiv review pill, deferred.
- **"Every problem holds now." as a summary head.** `summaryParts` still produces the sentence for
  the final version's `head`; nothing displays it today. Left in place for a report or history line
  that might want it.

## 2026-09-12 · The drag hold at 150 ms (ticket 160)

- **A slow click now lifts.** At 150 ms a deliberate trackpad press held a beat lifts the tile;
  releasing without moving drops it back and the swallowed click means the tile does not open
  for editing, so the teacher presses again. If that bites, a hold that only counts once the
  pointer has been still for a couple of frames, or a per-device threshold (touch longer,
  mouse shorter), would recover it.
- **No visible countdown.** Nothing shows during the 150 ms; the lift is the first sign. A faint
  ring filling under the pointer would make the wait legible, if it is ever felt again.

## The group board read live (from ticket 162, 2026-09-12)

- **Marks in place.** After a wrong check the cut sits in a block above the live list; marking the
  red line in the list itself would keep the attempt on screen while the next one is written, but
  the reducer empties the lines on a wrong check (the next attempt starts clean), so the block
  stays a block. Deferred.
- **The block once the rework is under way.** The "Not yet" block stays until the problem
  resolves, so while the second attempt is read the column holds both. Fading it once new lines
  exist, or collapsing it to one line ("attempt 1: line 1 wrong"), deferred.
- **A watcher's shimmer.** The pen-holder sees the shimmer while a burst is read; a watcher sees
  the line land with no warning, since a peer's scripted turn has no pen-down event. A
  "recognising" event on the classroom, deferred.
- **The board's double frame.** The pad's card sits inside the board card (two rounded borders),
  as it did before this ticket. Flattening it to one frame with the column's eyebrow level was
  left for a pass over the whole screen.
- **Check under the column.** The working screen's footer sits inside its column with a rule
  above; the group board's Check keeps its own row under the grid. A shared footer, deferred.
- **Hint lighting in group review.** The practice pad's `decorate` / `highlight` on the column
  (a lit hint word pointing at a line) has no hints to point from here. Not planned.
## The teacher bar's tabs (from ticket 163, 2026-09-12)

- **The current tab's mark.** With every tab an indigo pill, the current page is the one filled
  deep indigo with white text. If that reads too loud next to the white "New assignment", a
  quieter mark (a darker soft fill, an underline, a bold label) is the alternative.
- **"Black" as ink.** The "New assignment" pill's border and text are the design's ink
  (`#14123a`), the navy every heading uses, not `#000`. If a true black is wanted it is one token
  change (`border-ink text-ink`), but it would be the only pure black on the teacher side.
- **Hover on the tabs.** The tabs tint to the accent line colour on hover; the current tab does not
  change on hover. A pressed state for the pills (a slight scale, as the student's buttons have) is
  not done.
- **Keyboard focus rings.** The pills keep the browser's default focus ring; a ring in the accent
  colour to match the student's controls is deferred.

## The header crumb beside the wordmark (from ticket 164, 2026-09-12)

- **Only the group review lost its crumb.** The strip names four stages (indiv working, indiv
  review, group review, class review) but only the group review and class-wait screens carried
  the stage's name as their crumb; the working, review and frozen screens show the assignment
  title there, which the strip does not say, so those stay. If the title ever moves into the
  screen's own heading, the crumb on those screens becomes redundant the same way and could go
  through the same `null` entry.
- **"Warm-up" stays.** The warm-up is not on the strip (it comes before individual working), so
  its crumb is the only place the header names it. Putting the warm-up on the strip as a stage
  before "indiv working" was not asked for.
- **The class name on the overview, goal and check-in.** These screens still show the class
  name as the crumb; whether the header needs it at all now that the strip is there (and the
  overview's own heading names the assignment) is not decided.

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
- **"You got this one right" on the correct example.** A student whose first hand-in was correct
  sees the tag on the correct example, which reads a little oddly ("your initial response" on the
  model answer). A different wording for that case is deferred.
- **Counts for the teacher's eye only.** The board still reads "13/19 students" because the user
  asked for it there; whether a projected count belongs on the wall at all (it names how many got
  it wrong) is a question for a later pass.
- **Per-line fitting on the board.** `ExampleColumns` shrinks every column's lines together when a
  window is narrower than the design width; the letter and the corner do not shrink, so a very
  narrow board (under ~1000 px) keeps a 44 px letter over 12 px lines. Scaling the whole card is
  deferred: the board is designed at 1440 and the split view letterboxes it.
- **The student's pad title in write with me.** The pad is 310 px so "Write with me" and Undo /
  Clear share a line; a narrower pad with a tighter toolbar would give the examples more room.

## The teacher bar's tabs at the left (from ticket 165, 2026-09-12)

- **Two moves in one day.** Ticket 163 put the tabs at the right beside "New assignment"; this
  ticket puts them back at the left beside the brand, keeping 163's pill colouring. The bar now
  reads places at the left, actions and identity at the right. If the placement moves again, the
  pill classes are the constant and only the group they sit in changes.
- **The gap after "· Maths".** `gap-5` is the student header's brand-to-crumb gap, so the two bars'
  left groups are built the same way. A rule or dot between the wordmark and the first pill (the
  brand as a label, the pills as controls) was not asked for.
- **"New assignment" alone at the right.** With the tabs gone the white pill stands next to the
  teacher's name; a divider between the action and the identity is not done.
- **The tabs on a narrow window.** At 1280 the left group ends at 348 px of the 1280, so there is
  room to spare; a window narrow enough for the two groups to meet is below anything the teacher
  side lays out for (the roster alone is 1204 px at 1280).

## The roster's heads stick under the bar (from ticket 167, 2026-09-12)

- **A shadow or tint once the row is stuck.** The heads sit on plain paper with their 1 px line
  whether at rest or stuck; a soft shadow under the row only while it is stuck (an
  `IntersectionObserver` on a sentinel above the table, or `scroll-state()` container queries when
  they are broad enough) would show the rows passing under more clearly. Not asked for.
- **Sticky heads on the other teacher tables.** The mistakes page's and the groups page's tables
  scroll their header rows away as the roster did; the same `HEAD` class string would do for them.
  Deferred until one of them is long enough to need it.
- **The "Student" head as a stuck row's label.** With the categories always in view, the stuck
  row could also carry the class name or the assignment title at its left in place of "STUDENT",
  a true sub-header. The bar already names neither; deferred.
- **The card's own sideways scroll in a narrow window.** Below the 1280 laptop the frame now
  scrolls sideways as a whole (the clipped card takes its content's width) where the card used to
  scroll alone. If the teacher side ever lays out for narrower windows, the roster wants a real
  narrow layout (fewer visible categories, or a horizontal scroller inside the card with the heads
  stuck by JavaScript) rather than either scroll.

## The title as the header's crumb everywhere (from ticket 168, 2026-09-12)

- **The report says the title twice.** The report screen's eyebrow over "Your report" is the
  same "ROOTS OF A QUADRATIC — SET 3" the header now carries, an inch above it. The class-review
  screen and the working screen do the same with their problem headings only partly. Dropping
  the report's eyebrow (as ticket 56 dropped the confidence screen's duplicate crumb) was not
  asked for; it is one line in `ReportScreen`.
- **The stage names the crumbs used to carry.** "Warm-up", "Your report", "Where the class is
  finding it hard" and "Your working" no longer appear in the header. The warm-up is not on the
  pathway strip, so the warm-up screens now name themselves only in their own headings; if that
  reads as unplaced, the strip could grow a warm-up stage before "indiv working".
- **The class name is gone from the header.** The overview, goal and check-in screens showed
  "11 Methods B" (the class) as their crumb; nothing on the student side names the class now. The
  overview's own card could carry it.
- **A long title.** The header fits a 212 px title with 200 px to spare before the strip at iPad
  width; a title twice as long would collide. A truncation rule (ellipsis at a fixed width, the
  full title in a tooltip) is not done.

## The student report's full dot view (from ticket 169, 2026-09-12)

- **Column widths sized to the labels.** The report's six columns are equal sixths of the card
  (`repeat(6, minmax(0, 1fr)) 0.5fr`), so the longest label in a column sets its text size:
  9.5–11.5 px at the teacher frame's 0.72 zoom (the class view's own dot view fits at 9–10.5).
  The roster gives each category its own width (`columnWidth`, 80–132 px); the report has room for
  more (the card is about 1085 layout px inside at 1400) and could size each column to its widest
  skill name so the text reads at 12.5 or 13.5. Not asked for.
- **A student with nothing handed in.** Sam's report before any session says "Nothing yet" in a
  plain card; it could show the six columns with every pill and dot unseen (hollow), as the class
  view's MISSING row would, so the shape of the report is there before the evidence.
- **Group rows out of the tab order.** A fixed group row is a `div` with an image role; a screen
  reader reads its name and status but keyboard focus skips from skill to skill. If the rows should
  be reachable, `tabindex="0"` on the fixed node with no action is one line.
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
- **Sub-parts as one problem.** A worksheet's 4(a), (b), (c) become one tile each with the stem
  repeated and the label carrying the part; a tile that holds parts together is not built (Q20).
- **A typed tile changing after blur.** The parser's preview is replaced by the model's TeX on
  Enter or blur, with no tint; a teacher who looked away may find the render changed. A subtle
  "updated" flash, or a diff when the two differ materially, was not asked for (Q17).
- **Typed input with no model configured.** The parser's TeX stands silently; only uploads show
  "Not configured". A one-time notice on the create screen that typing is running without the
  model would be a line in the bar (Q22).
- **The `$…$` delimiter and the shorthand grammar's future.** With the model normalising every
  typed line, the shorthand grammar (`lib/mathInput.ts`) is a preview only; whether to keep
  extending it, teach it, or let it fall behind the model is open. The explicit delimiter entry
  above ("Teaching the typing convention") stays deferred (Q9).
- **A re-extract button.** A tile whose read is badly wrong is fixed line by line or discarded
  and the file dropped again; "read this one again" from the source is not built (Q5).
- **Fixtures from real worksheets.** The deterministic fixtures are rendered from the demo set;
  a real (licensed) worksheet or textbook page as a fixture would test the model on handwriting,
  scans and photographed pages (Q24).
- **Handwritten and photographed pages.** Screenshots and exported PDFs are the day-one inputs;
  a phone photo of a textbook page (skew, shadow, low contrast) goes through the same route
  untested. A deskew or contrast pass before sending is not built (Q6).
- **"Three more like Q4", the bank searched by skill, last term's set cloned.** Other sources
  into the same funnel (the from-nothing entries above); the funnel is built so they end in the
  same drafts and tiles (Q2).
- **Cancelling an extraction in flight.** A shimmer tile has no cancel; the request runs to its
  end. An abort per file is an `AbortController` the client already threads (Q16).
- **Keyboard access to the drop target.** The Upload link is the keyboard route; the overlay and
  drop are pointer-only by nature. Paste works from the keyboard. Not audited beyond that (Q7, Q14).

## Labelled category pills (from ticket 174, 2026-09-13)

- **The class view's roster still draws bare pills under chips.** The two reports now carry the
  category name inside the pill; the roster (`/teacher`) keeps its 28 × 13 pills and the header
  chips, since its columns are 80–132 px and a labelled pill would not fit the narrow ones. If the
  roster should match, its `columnWidth` would grow to the widest name's pill and the roster's
  1208 px budget at 1280 would need a trade elsewhere.
- **9 px on the iPad.** The student's report fits six equal pills only at 9 px text with 6 px
  padding (13 px gaps) in its 115 px columns. A narrower reflection panel than 320, dropping the
  pills' letter-spacing at small sizes, or per-column widths would each buy a size step; none was
  asked for.
- **Font-load timing.** The pill fit measures the name on a canvas with the page's body font; it
  re-runs on resize but not on `document.fonts.ready`, so a first paint before Inter loads could
  fit one step too large or too small until the next resize. Not seen in the click-throughs
  (production builds, font preloaded).
- **The half pill's tint.** A half pill (problems skipped) fades its right half to a 45 % tint of
  the status colour under white text; the key at the bottom still draws the half dot as a grey
  left half. Whether the key should show the new pill treatment was not asked.
## The extraction route (from ticket 170, 2026-09-13)

- **The live model unverified from this machine.** No key or CLI profile here, so the one-problem
  fixture has not been through the real model; the acceptance item is open. First run with a key:
  drop each fixture, read the drafts against the manifest, and tune the brief where they differ.
- **Effort and thinking for extraction.** The route sends the model's defaults (adaptive thinking,
  default effort). A worksheet read is a reading task; a lower effort would be faster and cheaper
  and may read as well. Measure on real worksheets before setting it.
- **Dropped lines are counted, not shown.** `done` carries `dropped`; nothing on the screen says
  "the model wrote 2 lines that did not parse" yet (ticket 171 could word it in the bar).
- **The server-side page cap is best effort.** `pdfPageCount` counts `/Type /Page` objects; a PDF
  with compressed object streams reads as unknown and passes to the model. The browser counts for
  real (ticket 172); a server-side PDF library would make the route's own cap exact.
- **Image transforms.** The API can transform images server-side (`transform` on an image block);
  a photographed page could be deskewed or downscaled there. Not set.
- **A refusal mid-stream.** A source the model declines with nothing emitted gets an `error`
  "declined"; a refusal after some drafts is treated as done. No retry on a fallback beyond the
  API's own `fallbacks: "default"`.
- **Fixtures for handwriting and photos.** The rendered fixtures are clean KaTeX; a photographed
  or handwritten page fixture (licensed) would test the real cases. The render script is the
  place to add a page with skew or shadow.
- **The fixture beat is a constant.** 120 ms per draft in fixture mode (`FIXTURE_BEAT_MS`); a
  slower beat would show the shimmer longer in a demo. An env knob is one line.
- **One request for several sources.** The route accepts many sources per request and the model
  tags each draft with its source; the client (ticket 171) sends one request per file for
  parallelism. If per-request cost matters, several small images could share one request.

## Category history on the class view (from ticket 175, 2026-09-13)

- **Confidence and Set history.** Asked for as an option ("also option to show confidence & set
  history") and deferred in the interview: the cream sheet already spans through the Set column,
  so five stacked confidence words and five set counts above those cells would slot in without
  anything moving. The Set column is 64 px and the confidence column 84, so the stacks would carry
  short text (`10/10`, `low`) at the history pills' 9 px.
- **Real history.** `historyFor` is a seeded simulation around today's status; the five dates are
  the same for every student and category. With more than one assignment in the data, the five
  would be the last five sets whose taxonomy touched the category, each rolled up by
  `hierarchyFor` on that set's evidence, dated from the set, and a category a set never touched
  would be skipped rather than shown hollow.
- **More than five, and a hover for each.** The stack could show every recorded set on a long
  hover, or a tooltip on a dated pill could name the set ("Set 2 · Completing the square") and the
  status word; today a dated pill carries only its date, and the stack's `aria-label` reads the
  five out.
- **One width for every pill.** The interview chose every pill the widest name's width, which
  Inter's uppercase cannot fit inside the 80 px Algebra column (COMMUNICATION is 88 px at 9 px);
  each pill takes its own name's width instead. A shorter name for Communication (COMMS, or a
  two-line chip) would let the pills match.
- **The width animation outside Chrome.** The pill widens over 150 ms only where
  `interpolate-size: allow-keywords` is supported (Chrome 129+); Safari and Firefox snap. A fixed
  per-category width table would animate everywhere at the cost of a measurement per font.
- **The header's stack and the row's stack differ in height.** The row's three buttons are 15.5 px
  each (ticket 177: 11.5 px text, 2 px above and below, 3 px apart; ticket 175 had them at 14 to fit
  the old two-button height); the column heads' buttons are still 21 px. Trimming the heads' to match,
  or growing the row's once more, would make the two stacks one design.
- **History mode for a second student.** One student at a time; a click on another row leaves the
  mode. Comparing two students' trails side by side (two rows un-faded, two sheets) was not asked
  for.
- **Keyboard.** Faded rows keep their buttons in the tab order (invisible, not `display: none`),
  so a keyboard user can still reach "see dot skills" on a faded row and open a drill under the
  cream. `inert` on faded tbodies would close that.
- **The sheet's notch** (gone in ticket 181: the sheet is one white rectangle over the category
  columns only, Algebra through New skills, so it never reached the Confidence column and needs
  no apron). What remains: a white sheet on a white card shows only by what it cuts (the half
  pills at its top edge) and by the page it rises over for the top rows; a faint 1 px line along
  its top edge would make the sheet itself visible without going back to cream.
- **The five's spacing on a tall sheet.** Ticket 181 spreads the five dated pills evenly from the
  sheet's top to today's pill, so on a mid-roster row (a 155 px sheet) they sit about 15 px
  apart and over the "due" line about 12; a taller sheet (a drill open above, a three-line
  confidence row) spreads them further. A ceiling on the gap (say 20 px) with the surplus left
  above the oldest would keep the column reading as one trail on any sheet.

## "New assignment" above the Pathway card (from ticket 176, 2026-09-13)

- **Only reachable from the class view.** The pill left the bar, so Mistakes, Groups, the
  student report and the create screen itself have no way to a new assignment except the Class
  tab. If teachers start assignments from elsewhere, a bar entry (or a keyboard shortcut) could
  come back beside the name.
- **While a class-review session runs.** The Class review card leads the column then (ticket
  129), so the pill sits above *that* card, not directly above the Pathway card. If it should
  always touch the Pathway card, it moves between the two; if it should not show during a
  session at all, gate it on `wcInUse`.
- **The roster's top and the pill's top are level.** The Pathway card therefore starts 55 layout
  px lower than the roster card. Putting the pill in the title row's empty 320 px cell (the H1
  grid already reserves it) would keep the two cards level and still place it over the column.
- **The create screen's own "New assignment" heading** (`/teacher/assignments/new`, the older
  screen) is unchanged; the pill still points at `/teacher/assignments/create`.

## No pathway strip on the report (from ticket 178, 2026-09-13)

- **A finished trail instead of nothing.** The report's header is blank where the strip was.
  A version of the strip with every pill in the "over" blue (the pathway as a record of what the
  class did) was not asked for; "just have blank" was.
- **The report while the class is still mid-pathway.** A student reaches the report only when
  the session ends (or through the demo strip's skip), so the report never shows a live class
  stage. If a student could read their report while others are still in group review, the strip
  might earn its place back there.
- **The peers view and the student's own working** lost the strip with the report so it does
  not flicker on the way there and back; if those screens should name the class's stage, put
  `peers` and `history` back in `pathwayStages`'s reach in `StudentApp`.
## Pictures on the create screen (from ticket 171, 2026-09-13)

- **The bar over the last row.** Discard N · Add N · Continue float bottom-right and cover the
  corner of the last tile in a full row at 1400 and 1280 (Continue alone did before); the note
  pill adds to it. A bar that sits in the page flow under the grid, or a bottom padding sized to
  the bar, would clear it.
- **Thumbnails of mostly-white screenshots read as blank squares.** The 160 px thumbnail of a
  one-problem screenshot is a white square with a few grey marks; a crop to the ink's bounding box
  before scaling, or a border in the tint colour, would read better.
- **A dropped file's questions all land at the end.** Drop order is the grid order; a drop onto a
  particular tile could insert there instead (the overlay is one target).
- **A pending tile is not draggable and a drag over one shows nothing special.** Fine while
  markers are brief; a long read leaves an inert tile in the grid for the duration.
- **The note clears on the next edit only.** A note about a refused file stays until the teacher
  types or drops again; a timed fade or a × on the pill would let them clear it.
- **"No questions found" is silent about why.** A screenshot of a heading or a blank page gets
  the empty message; the model's own reason is not asked for.
- **Retry re-reads the whole file.** "Try again" resends the source from IndexedDB; a partial
  read (some drafts, then a network drop) keeps the drafts it got and re-reads everything, so a
  second attempt can duplicate them. A "resume from draft n" is not built.
- **The undo line and the drop note share a corner of attention.** A discard's "Q12 removed.
  Undo" sits under the grid; the note sits in the bar. Two places for two transient messages.
- **The file input accepts images only.** PDFs are named "not yet" until ticket 172 widens it.
- **Twenty parallel requests.** A 20-image drop opens twenty streams at once; the browser queues
  past six per host. A small pool (four at a time) would keep the first tiles arriving sooner.
- **A prose stem with a bare number sets it as maths.** "after 5 seconds" renders the 5 in KaTeX
  by the shorthand's token rule; invisible at this size, but a stem like "Question 3 asks" is
  read the same way. A rule that leaves a lone integer in prose alone is a token tweak.
- **`$` in a typed price.** Two dollar signs on a typed line now make a maths run; a teacher
  typing "$5 and $7" gets "5 and" set as maths. An escape (`\$`) is not read.
- **Keyboard access to keep and discard.** ✓ and × are buttons and tab in order; there is no
  shortcut (Enter to keep, Delete to discard) on a focused unconfirmed tile.

## The row buttons' grace ends left of the first pill (from ticket 180, 2026-09-13)

- **An exit to the right as well.** Deferred: the grace still holds right of the last marker (past
  the New skills pill, over Confidence, Set and the closing avatar). The buttons sit on the left, so
  a teacher over the right-hand columns is not heading for them; if that ever reads as lag, the same
  `markerMove` could take the last pill's right edge as a second line.
- **A grace tuned by distance rather than time.** Deferred: the second could shrink with the
  distance travelled from the last marker (a pointer that has moved 200 px is not hopping pills).
  Kept a fixed second with the leftward exit, which covers the case the user hit.

## "New assignment" on its own row (from ticket 179, 2026-09-13)

- **Ticket 176's "cards not level" note is resolved**: the pill now has a row of its own and
  the Pathway card is back on the roster's line. The other 176 notes (only reachable from the
  class view; the create screen's own heading) still stand.
- **An empty left cell.** The pill's row leaves the roster's width blank. Roster-wide actions
  (export, a filter, the assignment status that now sits on the due line) would fit there if
  the class view ever needs a toolbar.
- **Right-aligned instead.** The pill is flush with the Pathway card's left edge; flush with
  the column's right edge (under the avatar in the bar) is the other reading of "above the
  pathway box". One class swap (`justify-end`).
## PDFs on the create screen (from ticket 172, 2026-09-13)

- **The page thumbnail is a blank at 40 px.** An A4 page drawn at 160 px and shown at 40 is 28
  × 40 with the text invisible; it says "page 2", not what is there. A crop to the draft's own
  region (once ticket 173 has the box), or a larger thumbnail on hover, would show the problem.
- **Parts of the same page share one thumbnail.** Deliberate (one draw per page); a per-draft
  crop would be the better picture at the cost of a draw per draft.
- **The worker fetch on the first drop.** About 1 MB the first time a PDF is opened; nothing
  says "loading" during it beyond the shimmer tile. A prefetch when a file is dragged over would
  hide it.
- **Password-protected and broken PDFs.** `openPdf` fails and the marker carries no thumbnail;
  the read then goes to the route, which sends the bytes to the model. A locked PDF should be
  refused on the tile with a word about the password; today it falls through to the route's
  answer.
- **A PDF's first page as the marker's picture, then the draft's page.** Two draws for page one
  (marker and first draft) since the marker is drawn before the document is reopened in `run`;
  keeping the document open across both would save one.
- **Ten pages as a hard cap.** A twelve-page worksheet is refused whole; a page-range picker or
  "read the first ten" would take the common case.
- **Landscape and mixed-size pages.** `fitScale` fits the longer side; a landscape page's
  thumbnail is wide and short in a square corner. Fine; not designed for.
- **Docx conversion.** Still deferred (the interview); the note says "export it as a PDF".
- **Scanned PDFs.** A scan is an image per page inside a PDF; the model reads it as an image and
  the page thumbnail draws it; handwriting and skew are untested (no such fixture).

## Typed lines through the model, Fix and figures (from ticket 173, 2026-09-13)

- **The preview and the reading disagree for a beat.** "half of x squared plus 3" previews as a
  bare 3 (the shorthand's token rule) and then becomes ½x² + 3; a teacher watching sees a jump.
  A quieter preview for a line the parser cannot read well (plain prose, no expression) would
  hide the wrong guess until the model answers.
- **Every blur with a change is a model call.** Typing a ten-question set by hand is ten calls;
  fine at demo scale, a cost at class scale. A debounce is not the answer (blur is already the
  debounce); a batch of several changed tiles into one request is.
- **The reading dot is the only sign of a read; a failed read says nothing.** By the interview's
  choice (Q22 applied to typing). A one-time line in the bar the first time a read fails would
  tell a teacher on a machine with no key why their plain English never changes.
- **A Fix on a typed tile turns its shorthand into TeX.** The teacher's own words are gone from
  the textarea after a Fix; keeping them as a "was" line, or undo for a Fix, is not built.
- **No undo for a Fix.** The undo line covers removals only; a wrong Fix is fixed with another
  Fix or by editing the text.
- **The Fix picture is the whole page.** For a PDF page with ten problems the model gets the page
  and the draft; a box per problem from the extraction would let the Fix send only its region.
- **Figures on the student side.** A draft's figure never reaches a student (Create is a wall,
  `ASSUMPTIONS.md`); when it does, `Problem.figure` is a fixed library id and needs a data-URL or
  stored-image variant.
- **The figure hides while editing.** The editor and the Fix line push it under the tile's
  edge; a taller focused tile, or the figure beside the text, would keep it in view during a Fix
  about the figure.
- **Figure crops are boxed by the model, not checked.** A box that misses the diagram gives a
  crop of white space; nothing flags an almost-empty crop.
- **A figure's full PNG is per browser.** Like every source (ticket 171); the small JPEG on the
  draft is what a reload on another machine would have.
- **Reading a pasted list through the model.** A paste splits into tiles locally and only the
  focused tile is read on blur; the other pasted lines stay on the parser's reading until each is
  focused and changed. Reading every new tile once would be a loop over the paste.
- **The fixture Fix rules are three regexes.** Enough for the click-through; a real Fix reads
  the sentence. The live model is still unverified from this machine (ticket 170's open item).

## Deep indigo border on "I need help" (from ticket 182, 2026-09-13)

- **Other secondary buttons stay grey.** Only the two "I need help" buttons moved to the new
  `deep` variant. If the deep indigo border should become the student side's standard
  secondary look (Undo, Clear, "Skip to the set" and the rest), that is a one-line change to
  the `secondary` variant instead; deferred until asked, since the user named only these two.
- **A `deep` primary.** There is no filled deep-indigo button; `accent` fills with the lighter
  accent. If a filled version of this button is wanted later it belongs beside `deep` in
  `components/ui.tsx`.

## Bigger hit areas on the primary actions (from ticket 183, 2026-09-13)

- **Only the named eight carry the band.** Other bottom-right actions were left as they are:
  the working screen's "Hand in" and "Next: Q2 →", the warm-up offer's "Warm up" / "Start the
  set" (8 px apart, so a band would cover the neighbour), the feedback screen's "Done", the
  practice prompt's buttons, the teacher's review steps' Assess / Create / Finalise, the setup
  page's Create, the create bar's Discard / Add (12 px from Continue: their bands would meet
  Continue's). Deferred because the user named Continue, Submit and Send.
- **The reach is fixed at 12 px.** A `hit={8}` or a `reach` size would let a button in a tight
  row take a smaller band; not built, a class on the side (`before:-left-2`) does it for now.
- **The hover tint starts 12 px early.** A pointer in the band hovers the button, so the pill
  tints before the pointer reaches it. Harmless on a touch screen (no hover); on a laptop a
  `:hover` that keys off the pill only would need the band to be a sibling, not a pseudo-element.
- **Not tested on an iPad.** The click-through emulates a finger tap through Chrome's touch
  events; the real device (Safari, its own tap slop, the pencil) is the test the review asked
  for and this machine cannot run.
- **The two chat sends' left band is the 8 px gap.** A wider gap (12 px) would let the band be
  even; deferred because the gap is the chat's design.
- **A grow-wrap that mirrors the placeholder.** `QuestionTile` now feeds the placeholder to the
  mirror while empty; the same fix belongs to any other grow-wrap textarea with a long
  placeholder (none today).


## Edexia Classroom run (planned 2026-09-13, tickets 184–189)

- **Delete the live diagnostic, or move it into the review stages.** It stays on Class View and
  Mistakes for now, because the teacher will later push a diagnostic to interrupt students in the
  review modes; the user flagged that deleting it "might make more sense" (2026-09-13).
- **Let the teacher end the review stages.** Force submit ends individual working; nothing yet
  lets the teacher close individual review or group review and mark a set finished. Problem Set 1
  is simply fixed as finished (2026-09-13).
- **Insight into how individual review and group review went.** A finished set's Class View shows
  the individual working results only; what changed in review (who fixed what, which groups
  resolved which mistakes) has no screen yet (2026-09-13).
- **More than one class.** Edexia Classroom assumes Ms Okafor teaches one class (11 Methods,
  twenty students); a class switcher, per-class defaults and cross-class views are deferred
  (see ASSUMPTIONS.md, 2026-09-13).
- **The student side waits for an assignment.** Sam's tab works exactly as before, even before the
  teacher creates Problem Set 2; a "nothing assigned yet" screen that opens the set on Create would
  make the end-to-end flow honest but would break student-only demos (2026-09-13, round 3 Q3).
- **Real assignment creation.** The create screen starts blank with one "Generate simulated
  assignment" button; typing, dropping pictures and PDFs and the Fix line (tickets 170–173) stay in
  the code but are unreachable from the blank start (2026-09-13).
- **A due-date picker.** Problem Set 2 is due Thu 10 Sep and Problem Set 1 Thu 3 Sep, fixed; the
  create review step has no due-date field (2026-09-13).
- **Updating the class default groups from the create flow.** Moves in "Confirm groups" apply to
  that assignment only; the user first asked for moves to write back to the defaults, then chose
  to keep defaults editable only in the Classroom so a one-off absence doesn't pollute future sets.
  A "also update class groups" option is the middle path (2026-09-13).
- **Real history.** Only the newest history pill per skill comes from a real set (Problem Set 1);
  the four older pills stay generated until more past sets exist (2026-09-13).
- **More past assignments.** The user cut the plan from two past sets to one (Problem Set 1) for
  cost; a longer back catalogue (and a Surds set, the syllabus's first part) is deferred (2026-09-13).


## Assignments and their routes (from ticket 185, 2026-09-13)

- **The Classroom is a plain list.** `/teacher` lists the registry's sets as links with "New
  assignment"; ticket 186 builds the cards (live above past, counts, top gap).
- **Report, compare, class review setup and the board are Problem Set 2's only.** They stay at
  `/teacher/report`, `/teacher/compare`, `/teacher/whole-class` and `/teacher/board`, wrapped in
  Problem Set 2's provider, because they read Sam's live session. Moving them under
  `/teacher/a/<id>/…` (a finished set's student report, its compare) is deferred to when a second
  set has that data (ticket 187 or later).
- **A row still on the set opens empty drills.** Its pills are not-seen until the student hands in, so
  "see dot skills" and history mode open on nothing, as Chloe's row always did; showing the live
  student's partial evidence while he works (as before ticket 185) is deferred.
- **The progress pill has little room.** "Q10 in progress" beside Ruby Castellanos's slot clears the
  row buttons by under 10 px at 1280 and 1400; longer words (a problem label like "4(a)", a
  "Q10 · warming up") would need the pill under the name or a wider student column.
- **The landing is decided once, in the browser.** The classroom and the session live in
  localStorage, so `/teacher/a/<id>` renders the chrome and then replaces itself; a server-side
  redirect needs a backend.
- **The Classroom-level Groups page has no back link.** It opens from the header's Groups link and
  the header's wordmark is not a link; a link from the brand to the Classroom is deferred to 186's
  header.
- **Resetting an assignment's groups to the class defaults.** `groups/reset` with an assignment
  returns its fixture copy; a "copy the class defaults again" action on the assignment's Groups tab
  is not built.
- **Old deep links beyond Mistakes.** Only `/teacher/mistakes` redirects (the class view's old `/teacher`
  is now the Classroom, and `/teacher/groups` is now the class defaults, so bookmarks to those land
  on the new pages).

## Edexia Classroom cards (from ticket 186, 2026-09-13)

- **One title, cased as typed.** The cards show a registry `name` in sentence case while the
  fixture's `title` stays upper-cased for the student's eyebrow; storing one title as the teacher
  typed it and upper-casing it in CSS where the eyebrow wants capitals would drop the second field.
- **An insight on the live card.** The live card shows counts only; "top gap so far" (already
  computed for every card) could show once enough work is in, without flickering as it changes.
- **The top gap by skill, not by exact cluster.** A student slipping on two leaves in one problem
  forms their own cluster; counting leaves across clusters would name the skill more robustly but
  would stop matching the Mistakes tab's pills.
- **The empty LIVE note.** With nothing live the section shows "Nothing live right now. A new
  assignment goes live when you create it."; a call to action inside it (or hiding the section)
  is a copy decision left for the demo run.
- **Ordering by date.** "Newest first" is the registry's order; sorting by due or start date needs
  dates on every set (created sets have `startedAt`, fixtures do not).
- **Card actions.** Archive, duplicate, reopen or delete a set from its card; the card is one link.
- **The brand as a link home.** The header's wordmark still is not a link to the Classroom; the
  back links and the Groups page's back link cover the way home for now.
- **A side column.** The cards span the chrome's container; a side column (this week's lessons,
  class-wide gaps across sets) is deferred.
- **Assignment-level counts on Groups and Class.** The Classroom's numbers (submitted, mistakes so
  far) are not repeated on the assignment's own header.

## Problem Set 1 and past sets (from ticket 187, 2026-09-13)

- **More than one past set.** The history reads every finished set older than the one on screen
  (`earlierAssignmentIds`), so a Problem Set 0 or a unit test would slot in, but only Problem Set 1
  exists; the four August pills stay simulated until there is data behind them.
- **A student absent from a set in their history.** Liam missed Problem Set 1, so his Sep 3 pill on
  Problem Set 2 is hollow (nothing seen). Skipping the set and showing an older simulated result
  instead, or marking the pill "missed", is a copy decision for the demo run.
- **Past sets on the student side.** Problem Set 1 is teacher-side only; the student's own history
  and report for an earlier set (and a "last time you slipped on this" line in the warm-up) are
  deferred.
- **Re-opening a finished set.** A finished set's Class and Mistakes are read-only: no force submit,
  no live diagnostic, no class review, no group progress. A "review again" or "send a follow-up
  diagnostic on last week's gap" action from a past set is deferred.
- **Live-lesson routes per set.** Compare, class review setup and the board are still Problem Set 2's
  pages outside `/teacher/a/<id>`; only the report moved under the id.
- **Cross-set insight on Class View.** "Mia slipped on non-monic factorising in both sets" could be
  a line or a marker on the row; today it is only visible through history mode.
- ~~**Long confidence skill names.**~~ Done in ticket 190: no confidence label shrinks; a skill wraps
  between its words and an answer too long for three lines reads "low: fractions +1".
- **Authored Problem Set 1 practice and warm-ups.** Problem Set 1 has no practice problems, hints,
  standouts or diagnostics of its own; they would be needed if it ever ran live.

## Create from blank (from ticket 188, 2026-09-13)

- **The blank start is a picture, not a form.** Title, goal and the ghost Q1 are inert until Generate;
  typing a set from scratch, dropping a picture or PDF and the Fix line (tickets 119, 171–173) work only
  on the generated screen, and the blank screen refuses a dropped file.
- **Generate is one fixed set.** It always fills Problem Set 2 — Roots of a quadratic; a choice of
  simulated sets (Problem Set 3, a Surds set) or a generated set from a topic is deferred.
- **Creating a second time overwrites Problem Set 2.** New assignment after Create opens blank again
  and a second Create replaces the one live set (same id, a new start time); real multi-set creation
  needs ids per created set.
- **A draft stored before ticket 188 opens blank.** Its questions are kept in the store but not shown
  until Generate replaces them; migrating an old draft to `generated` was not worth it for a demo store.
- **Reload on the generated screen still scrolls to the ghost Q11.** The editor focuses the ghost on
  mount (pre-188 behaviour), which scrolls the grid at 1280 × 800; only the Generate press itself skips
  the focus. Opening without a focused tile, or focusing without scrolling, is a small follow-up.
- **Confirm groups has no reset.** Moves stay until Create or Reset demo; a "back to the class
  defaults" link on the card is not built, nor an "also update class groups" option (see the run's
  section above).
- **Before Create, Problem Set 2's pages show "Not in the Classroom".** The tabs, `/teacher/mistakes`,
  report, compare, class review setup and the board all show the card with a New assignment link rather
  than redirecting; a redirect to the Classroom would hide why.
- **Turning group review off at the bottom of the pathway step shifts the page.** Confirm groups leaves
  with it, the scroll clamps, and the map moves under the pointer when the teacher had scrolled down;
  keeping the step's height, or resetting the scroll on each review step, is deferred.
- **The review bar floats over scrolling content.** Back and Create are pills over the page (the
  content ends above them at max scroll); a full-width footer bar with its own backdrop was not built.
- **Skips set the start an hour back.** Every presenter skip creates Problem Set 2 with `startedAt` one
  hour before the jump so ticket 189's stream is over; a skip that lands mid-stream is not offered.

## Confidence labels in a narrow column (from ticket 190, 2026-09-13)

- **A richer hover for "+1".** The whole answer of a shortened confidence label ("low: fractions +1")
  is the native `title` tooltip, which appears after a delay and cannot be styled or reached by touch.
  A small flyout (over blank space, never reflowing the row) listing the named skills would read
  better. Deferred: the native tooltip was enough to make the label legible without new UI.
- **Short names per leaf for the grid.** "non-monic factorising" and "sketching parabolas" take two
  lines each; a grid-only short form ("non-monic", "sketching") would let both of Mia's skills show
  in full. Deferred: a third name per leaf beside `name` and `short` to author and keep consistent.
- **Which skill a shortened label keeps.** A label that cannot show both skills keeps the first that
  fits, in the student's tick order. Keeping the skill most related to the student's mistakes (or the
  one the class is weakest on) would be more useful to the teacher. Deferred: needs a ranking rule.
- **The same rule elsewhere.** The report and the individual view write confidence as a sentence and
  have room; if a confidence label appears in another narrow place (the Mistakes rows, the board),
  reuse `confidenceForms` rather than `FitText`.

## Sticky key (from ticket 192, 2026-09-13)

- **Only Class View's key rides the bottom.** The student report (`/teacher/a/<id>/report`) has the same
  StatusKey inside its card, left where it is; the request named Class View's right column.
- **On a window too short for the column, the key waits below the cards above.** On pset-2 at 1280 × 520
  the Pathway and Live diagnostic cards fill the view, so the key only appears once they scroll away.
  Collapsing the key to a one-line strip on short windows is not built.

## Stage group right-justified (from ticket 195, 2026-09-13)

- **The countdown pushes the pill and count left for its minute.** With the group pinned to the cards' right
  edge, "handing in 1:00 · Cancel" is wider than "force submit". Reserving its width all the time was built and
  dropped (a gap before the button in the normal state). A countdown that fits the button's own width (e.g. the
  button itself turning into "1:00 · cancel") would keep everything still; not built.

## Multi-part problems (assumption added 2026-09-13)

- **Problems with parts (a), (b), (c) or i, ii, iii.** Every problem is assumed to be one part
  (`ASSUMPTIONS.md`), so nothing models a stem shared by parts, marks per part, or a part that uses
  an earlier part's answer. Real worksheets and exams are full of these; supporting them touches the
  problem data shape, the student's writing screen (which part is being answered), mistakes and the
  report (a mistake belongs to a part), the pathway and class review (examples chosen per part), and
  the create screen (see "Sub-parts (a), (b), (c)" and "Sub-parts as one problem" above). Deferred:
  the demo set has no multi-part problem and the assumption keeps every screen to one stem, one answer.

## Sticky side cards (from ticket 196, 2026-09-13)

- **On a short window the top cards scroll rather than pin.** When the scroll region can't fit the
  pinned cards and the Key (1280 × 520, or 1280 × 640 with class review's card), the top group scrolls
  away as before and only the Key pins. Collapsing the Pathway card to a one-line strip once scrolled, so
  both fit, is not built.
- **No shadow under the pinned cards.** Rows pass beside them, not under them, so none was added; if the
  column ever overlaps the roster (a narrower layout), a pinned card would want an edge.

## Back to Classroom button (from ticket 200, 2026-09-13)

- **The student report's "← Class view" is still a text link.** `/teacher/a/<id>/report` has no
  Classroom link; its way back is "← Class view" at the right of the header, still small indigo text.
  Left alone because the request named the Edexia Classroom link; if the button reads well, the report's
  back link could take the same box (it sits right-aligned beside the student's name, so check the row).
- **One back affordance per page.** The assignment tabs (Class View, Mistakes, Groups) could also give the
  button a sticky place under the bar so it stays in reach on long pages; not built, the page is one scroll
  from it.

## No counts on the board (from ticket 202, 2026-09-13)

- **A teacher toggle to show counts on the board.** Removed outright; if a teacher ever wants the class
  to see how common an approach was, it would be a per-slide switch in the board controls, off by default.
- **The empty corner on the board's example cards.** Left empty rather than filled (e.g. with the mistake
  name, which would give the answer away before marks are on); revisit if the letter row looks sparse.

## Live stream follow-ups (from ticket 189, 2026-09-13)

- **Stream after Sam hands in.** Once Sam hands in the class is past working and every classmate has handed
  in at once; an early hand-in jumps the counts. Letting classmates keep working through individual review
  needs the readiness arrivals and group review to read the stream too.
- **Jordan's work before he hands in on the report.** A classmate's individual report reads the full record
  even while they are still on the set; it could show only what has been answered, with "still working".
- **A per-event feed.** A small "Ethan submitted Q1 · 8 s ago" ticker on Class View or the Classroom card.
- **Unfinished work as its own event.** Liam's Q3 and Ethan's and Harper's Q9 (wrong, past their answered
  count) arrive with the hand-in; a partial-attempt event would let them arrive while the student works.
- **Teacher-set pace.** A presenter control to speed the stream up or pause it (the script is a pure
  function of the start time, so a pause is a stored offset).
- **Held arrivals hint.** While the pointer holds a card, a quiet "+2 new" beside it would say names are
  waiting.
- **Chloe while live.** She reads MISSING from the first second; "not started" until the teacher force
  submits may read kinder during the lesson.
- **Older click-throughs refreshed.** classroom186, pset187 and routes185-after188 predate tickets 186–191
  (pset-2 before Create, the finished set's Pathway card, the plain list's links) and no longer run as
  written; ticket 189's stream189.mjs covers their live-set essentials.

## Diagnostic flyout text and unbroken maths (from ticket 194, 2026-09-13)

- **Class View's diagnostic card keeps its compact text.** The request pointed at the mistake view's
  flyout; `DiagnosticCard` in Class View's narrow side column still sets its result at 14 / 12.5 px.
  A `size="panel"` pass there would need the side column's width traded with the roster.
- **Mistake headers on a phone-width window clip their maths.** With maths never wrapping, seven of
  Problem Set 2's problem headers at 400 px wide end 7–26 px past the card's clip (the teacher side is
  laptop-only). A header that drops the expression to its own row under the label on narrow widths is
  not built; it would change `PROBLEM_HEADER`, which the chip and count boxes centre on.
- **The flyout covers part of its own problem card at 1280.** Wider (460 px) and clamped to the
  viewport, it lies over the card's right column there, as the 380 px panel already did by less.
  Opening it leftward or as a side sheet on narrow laptops is not built.

## Hint openers and hints on every warm-up (from tickets 198 and 203, 2026-09-13)

- **Straight from "hint" to the chat, no stall notice.** Asked in ticket 198. The user kept the notice, so
  pressing "hint" on a stalled hint still shows "Let's talk through the previous hint before giving you
  another." first. Revisit if the extra tap feels slow in a classroom run.
- **The card's opener names no hint.** "What is the hint asking you to do, in your own words?" is
  correct when the card is the only one on screen, but with three cards the student may not know which
  hint is meant. The brief knows (the latest card), and the chat opens beside it. Consider lighting the
  latest card while its chat is open.
- **Hints for a student's own route.** Every warm-up now has a hint per reference step, picked by the
  step the last line matches, else by line count. A student who expands first on linear, or uses the
  quadratic formula on factorising, gets the reference path's hint for that position. Hints per
  approach (the `approaches` list already names two ways in on most warm-ups) would follow their route.
- **Split-looking linked letters in a word.** Discriminant's "b² − 4ac" lights b, a and c as boxes
  inside the word, so at rest it reads "b ² − 4 a c" with gaps from the ring padding. Formal
  justification's first hint does the same. A tighter in-word box style (no side padding when `within`
  is set) would read as one expression.
- **The sweep does not open the chat.** `sweep:hint-boxes` now walks all 15 warm-ups and passes the stall
  notice, but checks only lit boxes. The openers are covered by the scratchpad click-through
  (`click199.mjs`), not a repo script. Fold a chat check into a checked-in script if the openers change again.
- **Follow-up problems on other warm-ups.** Only factorising has a "Try one more" follow-up. The new
  per-point hints make adding follow-ups for the rest mechanical.
- **Collapsed cards in the brief.** The tutor's list of cards on screen does not say which earlier cards
  the student has collapsed or reopened.

## Talk it through lands in the chat (from ticket 204, 2026-09-13)

- **The on-screen keyboard on a real iPad.** The box is focused from an effect after the press, which
  desktop browsers honour. iPad Safari raises the keyboard only for a focus made inside the tap's own
  handler, so on a real tablet the cursor may sit in the box with no keyboard until tapped. The demo runs
  in a desktop browser; revisit (focus the box synchronously in the handler) when it runs on tablets.
- **A closed chat forgets its draft.** Typing in the box, closing the chat and pressing "Talk it through"
  again reopens an empty box: the draft lives in `HelpChat`'s state and goes with it. Keep the draft in
  the run (like the messages) if students lose half-written replies.

## Warm-up skills left count as done (from ticket 205, 2026-09-13)

- **Finished and visited look the same.** A chip turns dark once the student has been on the skill,
  finished or not, so neither the student nor the teacher can tell a skill worked through from one
  opened and left. A distinct mark (a tick on a finished chip, or a lighter "opened" shade) would show
  it; deferred because the ask was one colour for "been there" and the warm-up is not marked.
- **The teacher never hears which warm-ups were left unfinished.** `warmup.done` is the student's
  path only. Sending "left fractions after one line" to the teacher side would help pick who needs a
  word before the set; out of scope for a chip colour change.

## Fractions hints for the numbers (from ticket 206, 2026-09-13)

- **A student who adds 9/2 + 6 in one go.** Writing "… = 21/2" straight after "… = 9/2 + 6" skips
  the 12/2 line; the pad places it as line 3 and offers the x-terms hint, so the "over 2" and "add
  them" hints are never seen. Right for a student who can do it, but nothing checks the 21/2 was
  reached correctly (a student writing 15/2 gets no hint about it). Deferred: the ask was the missing hint.
- **Guard against widening a hint when a step is added.** Ticket 106 added a line and stretched a hint
  over it rather than writing one. The ticket 199 test only requires some hint per point. A test that
  every warm-up hint has exactly one point would stop this, but some future warm-up may want a hint
  that honestly covers two lines; left as a review habit for now.

## Group debrief without a note (ticket 218, 2026-09-13)

- **A lighter way for students to say what went wrong.** The written note ("Describe the mistake you
  made" / "your peers most likely made") was removed as too much cognitive demand. If the teacher
  wants that signal back, a one-tap choice from the problem's taxonomy mistakes, or an optional
  note after Next, would ask less. Deferred: the user wanted the step gone, not replaced.
- **The teacher report's "In group review" notes.** Removed with the note. A replacement could show
  how long each student stayed on the marks, or whether they fell behind the board.
- **Adaptive timings.** The 5 s unmarked view and the 10 s hold are fixed. A longer pause when the
  student's own versions differ a lot from the group's (more to compare) was not scoped.

## Six-set rename leftovers (from ticket 208, 2026-09-13)

- **Retire the old-name map.** `lib/renamedSets.ts`, its redirects and its step in `migrateClassroom`
  exist only for browsers and links from before the rename. Once no demo machine holds pre-rename
  state, the map can be deleted with its tests. Kept for now because presenters' browsers carry
  state across days.
- **Set numbers are hand-written in three places.** The fixture's upper-case title, the registry's
  sentence-case name and the draft seed's title each spell "Problem Set 6". Deriving the name from
  one set number would make the next renumbering a one-line change. Deferred: the rename was the ask,
  and tickets 211–214 add Sets 1–4 through the same registry.
- **Session store has no version or migration hook.** It needed none this time (it holds no set ids),
  but a future rename of Set 6's `q1` … `q10` would. A `migrateSession` beside `hydrateSession` would
  be the place.

## Classroom pinning and ordering (from ticket 216, 2026-09-13)

- **A call to action where the Live section was.** Before Create the Classroom now shows no Live
  section at all (the dashed "Nothing live right now" note is gone, ticket 216). A quiet prompt to
  create the next set could take that place; deferred as a copy decision for the demo run.
- **Pin the PAST label too.** Only the heading and Live are pinned, as asked; the PAST label scrolls
  away with its cards. A second sticky label under the Live card would keep the section named while
  scrolling a long history.
- **A year on due dates.** `dueOrder` reads "Mon 7 Sep" as a day of the year with no year, fine for
  one class and one term; sets spanning a new year (or a second class's calendar) need a real date on
  every fixture.
- **A fade or hairline at the pinned edge.** Past cards pass under a plain cream edge; a soft shadow
  appearing only once Past has scrolled would signal the pin, but it was left out to keep scroll 0
  identical to today.
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
- **The teacher sees the read.** The class view shows group review at 0% for the 39 s; a "reading
  the intro · 0:24" label on the group review card would say why nothing moves.
- **Show it once per student, or shorter the second time.** Every group review shows the full read.
  A student on their fifth set might get a one-line reminder instead. Deferred until there is more
  than one set's group review in a run.
- **The forced notice on the board.** The "N of your problems still contain a mistake" notice now
  waits for the board, but it still tells the student their own count once there, which sits
  awkwardly with keeping individual mistakes out of group review. Dropping it when group review is
  next was not asked for.

## New skills per set follow-ups (from ticket 209, 2026-09-13)

- **Name a New skill's home in the drill.** The New skills column lists skills flat. A small "from
  Functions" beside each would tell the teacher where its evidence goes on sets that do not list it.
  Deferred: the ticket kept the drill's layout, and the review's chips carry the home as a tooltip.
- **Tune or explain the inference.** Create reads "met" as assessed under its home in either of the
  last two sets, and needs at least two problems. A one-line reason per chip ("not in Sets 4 or 5")
  or a teacher setting for the window would make the suggestion easier to trust. Deferred: two sets
  and two problems reproduce the agreed lists, and every chip can be switched.
- **Escalation grouping after the move.** Practice prompts count mistakes per home group. The null
  factor law now shares "finding zeros" with zero-finding, and the binomial identity shares
  factorising with monic and non-monic. Worth a look once real classes use it, to see whether a New
  skill's slips should count on their own. Deferred: the demo's scripted runs play the same.
- **Retire `LEAF_ALIASES`.** The map exists for browsers holding pre-209 sessions and created sets.
  Remove it with its tests once no demo machine carries that state (see the ticket 208 note on
  `lib/renamedSets.ts`).
- **The unit eyebrow is separate from New skills.** `Assignment.unit` still names "Unit 1 · Topic 1".
  Create no longer infers a unit (the Unit focus card is gone), so a created set in another unit
  would keep the fixture's eyebrow. Deferred: every set in the demo is Unit 1.

## Leaving a problem for now (ticket 222, 2026-09-13)

- **The pen-holder chooses to keep going or move on.** The third wrong check leaves automatically
  after 6 s; a group that feels close cannot stay. A "one more go" control was not asked for.
- **More than one return.** A problem left for now comes back once; the ladder ends there. A group
  that was nearly there on its return still closes unsolved.
- **The demo student's own turn reaching the leave.** Sam never holds the pen on a problem that is
  left in the demo; his turns follow the same rules but the presenter would have to write three wrong
  attempts to see it, and the pad's script has only as many attempts as `GROUP_SCRIPTS` gives.
- **The unsolved debrief names what to look for.** It shows the three versions and says the class
  will look at it together; it could point at the step every version got wrong.
- **A real pen-holder's ink across tries.** A scripted peer now clears the board before each later
  try; a real pen-holder's ink stays (so a line can be fixed), which piles up over several tries.

## Group intro at 30 s (ticket 224, 2026-09-13)

- **A read time that follows the message.** Ticket 220 worked the time out from the words (130 wpm
  plus a 4 s look); ticket 224 fixed it at 30 s on the user's call and removed the formula. If the
  message is ever teacher-written or much longer, a derived time (or a check that warns when the
  words outrun 30 s) would come back. Deferred: the user chose the number.

## The teacher and a problem the group could not get (ticket 223, 2026-09-13)

- **A nudge when a group reaches the hint or leaves a problem.** The class view's card shows the line
  once a problem is left; it does not alert, and says nothing at the hint (two wrong checks).
- **Unsolved problems sort first in class review setup.** The badge marks them; the problem list and
  the suggested examples keep their order (the problem rows are left alone, as asked on 2026-09-12).
- **The group's own last try as an example.** Class review's examples are the students' individual
  working; the group's four tries on Q7 are not offered as a candidate.
- **The report says what comes next.** The note says Q7 was not solved in group review; it could say
  it will be reviewed with the class, once the class review is known to include it.

## Student report key (ticket 225, 2026-09-13)

- **A words-only key on the student side.** The student's report shows the teacher's key with its percentage bands, on the user's call. If the "no scores" framing for students comes back, `StatusKey` could take a prop that hides the band column on student screens.
- **Key lined up with the skills.** On both reports the key starts at the card's 20 px padding, about 7 px left of the first category pill and skill dots, which sit inside `SkillColumns`' grid. Aligning the key's dot column to the first skill dot would need the key to read `SkillColumns`' measured pill left. Deferred: the two reports match today, and the offset is the teacher report's existing look.

## History pills follow-ups (ticket 215, 2026-09-13)

- **Real results that jump.** Twenty student × category pairs move more than one colour step from
  Set 5 to Set 6 today (listed in `KNOWN_REAL_JUMPS`, `lib/setHistory.test.ts`). Deferred: real
  results are the class story sheet's (ticket 210); the test fails on any new jump and the list
  should empty when the story sheet re-authors them.
- **Two-digit set numbers.** "PS12 · WED 30 SEP" is about 83 layout px at 9 px, wider than the
  Algebra column's pill (76 inside). Deferred: the class has six sets; if it passes nine, shorten to
  "PS12 · 30 Sep" or let the Algebra column grow.
- **Say where a linked pill came from.** Following "PS5 · Mon 7 Sep" opens Set 5's Class View on the
  same student's history; a small "from Problem Set 6" back link would make the jump reversible
  without the browser's back button. Deferred: back works, and the Classroom button is there.
- **Simulated history on created sets and other classes.** The simulated walk is seeded per student
  and category only, so a second class with the same student ids would show the same walks, and the
  year is fixed at 2026 (`parseDay`). Deferred: one demo class, one year.
- **Hover detail on a history pill.** A real pill could show the set's title and the student's
  score in the category on hover. Deferred: the link opens the full set.

## Group review entry (ticket 226, 2026-09-13)

- **One clock guard for every effect.** `StudentApp`'s gate and board effects now wait for `useNow`'s
  first tick; the advance effect is safe only because a deadline is never 0. A `useLiveNow` that
  returns null until the clock ticks would make the guard impossible to forget. Deferred: three
  effects, and the rest of the app reads `now` for display only.
- **Rejoin a group run from a link.** A `?stage=group` link always starts over. A presenter who wants
  to hand a second device into the same run mid-board has to use plain `/student`. A `?rejoin` flag
  was not asked for.

## Full reports at 125% (ticket 227, 2026-09-13)

- **A skill still opens its work on the student's report.** Groups are fixed rows now, but a skill row is still a button that shows the lines behind it beneath the columns, as on the teacher's report. Left in because it isn't a collapse/expand of the tree; making skills plain text too is a one-prop change if wanted.
- **The teacher bar changes size on the report.** The 125% zoom covers the whole frame, so the bar is larger there than on Class view. Zooming only the body would keep the bar steady but misalign it with the page on wide windows.
- **Denser columns on the iPad report.** With every skill out, the student's six columns set names at 9 px and some three-word names take three lines. A two-row layout (categories over two rows) or giving the Skills card the reflection column's width would give them room. Deferred: the request was the full view in the existing layout.
- **One text size across columns.** Each column fits its own size, so New skills reads at 13.5 px beside 9 px columns. A shared size would look steadier at the cost of the wider columns.

## Help menu close (ticket 229, 2026-09-13)

- ~~**A × on the stall notice too.**~~ Done in ticket 231.
- **A shared card-with-close component.** Ticket 231 made `CardClose` inside `PracticePad.tsx` for the pad's two cards. If overlays elsewhere (the practice prompt, the worked example) want the corner ×, move it beside `Scrim` in `PracticePrompt.tsx` or make `Scrim` take the card and draw it.

## Finished sets groundwork follow-ups (ticket 210, 2026-09-13)

- **Sentence answers in narrow Mistakes columns**: a problem with four or more distinct wrong workings shrinks each column so a long `\text{…}` answer overflows its box at 1280 (the fit clamps at 13 px and maths never wraps). Set 5's Q10 was folded to three columns instead. A real fix would give such a grid a wider floor (scrolling inside the card) or let a text-only sentence line wrap at word boundaries. Deferred: the data can avoid it and the rule "maths never splits" needs the user's call for sentences.
- **Board and class review on a finished set**: both are the live lesson's screens; a past set has Class, Mistakes, Groups and reports. Reopening a past set's class review (to reuse examples) was not asked for.
- **Story sheet from the teacher's side**: the sheet is a developer contract; a teacher-facing "class arc" view (each student's categories across all sets) could be built from the same data once Sets 1–4 exist.
- **Create's New skills inference with more sets**: `recentSets("pset-6", 2)` becomes Sets 5 and 4 once 214 lands; the inferred list should still be discriminant and null factor law, but a test pinning it against the full registry was not added here.
- **Grace, Tomas and Jordan never reach the worded problem**: reasoning is *not seen* for them on most sets, so their reasoning history is mostly hollow. A later set could put a short worded problem earlier.

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