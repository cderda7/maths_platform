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

- **"Follow along with me" rewrite mode.** Teacher says "class, write this down" and student
  screens unfreeze into a guided pad that mirrors the board. Deferred 2026-09-09 so the absolute
  freeze can be experienced first.
- **More views per problem slide.** v3 has two: unmarked, then marked (red and blue, no text).
  Deferred: an "examples hidden, predict first" view; the teacher's misconception note or the
  pattern clue shown under a red line; a correct/incorrect verdict badge per example.
- **Model-solution slide** after the examples.
- **Teacher live annotation / pen** over the projected examples.
- **Presenter view on a second device** (laptop or phone) showing names, notes, correctness and
  the next slide, with the board as a display-only mirror. Deferred: single projected window with
  a name-free control strip in v3.
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
- **Star semantics under detective mode.** The star now reads "not sure about this one" on the
  feedback screen while the report still calls starred problems "right, but worth coming back to"
  for the teacher; decide whether a star on a wrong problem should be shown differently.
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
- **Difficulty tags elsewhere.** Removed from the overview and the chooser at the user's request;
  still shown on the working screen, the reports and the teacher views. Decide whether the
  student should ever see them.
