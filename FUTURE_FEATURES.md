# Future features — Edexia · Maths

Deferred ideas, kept deliberately generous: if it came up and was not built, it goes here. Each
entry says where it came from and why it was deferred, so a later decision has its context.
Newest at the bottom of each section. Policy: every work session that scopes something out
appends it here (see `CLAUDE.md`).

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

## Class view polish (from ticket 45, 2026-09-10)

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
