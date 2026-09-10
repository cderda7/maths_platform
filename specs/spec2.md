# Review Pathways, Whole-Class Review and Detective Feedback — Spec (v3)
QCE Math Methods Platform — current build

Status: ready-for-agent. Supersedes nothing; extends `spec1.md` (v2, same folder). Decisions below were
settled in a design interview on 2026-09-09; open ideas that came up and were deliberately
deferred are in `FUTURE_FEATURES.md` at the repo root.

## Problem Statement

The build has exactly one review pipeline after a student hands in: individual review, then
group review. A teacher cannot choose a different shape for a different lesson. In particular
there is no way to run the most common review a maths teacher actually does: put the problem on
the board, show how several students approached it, and ask the class which one is right and
why. When the teacher wants to do that today, the platform is in the way: student screens keep
running, student names and marks are one tap from the projector, and there is no notion of
"the class is looking at problem 3 right now".

Two adjacent problems surfaced while designing this:

- The teacher has no way to move the class on. If time runs out, students who have not finished
  simply never reach review.
- The current feedback screen is too direct. It marks every wrong step red and counts slips per
  problem, which removes the detective work that the individual review stage is supposed to be.

## Solution

1. **Pathways.** At assignment creation the teacher picks the review pathway on a small map:
   every pathway starts at *1st submit*; after it the teacher may add *individual review*,
   *group review* and *teacher-led whole-class review*, in that order, each optional, each at
   most once. Eight pathways result, including "submit only". The student's flow after hand-in
   follows the chosen pathway; teacher screens for stages not in the pathway are not offered.
2. **Whole-class review.** A teacher-owned session: a private setup view to choose problems and
   2–3 anonymised, transcribed examples per problem (auto-suggested, swappable), then a projected
   board view with zero student-identifying data. Each problem slide has two views: the
   examples unmarked ("which is right?"), then the examples with the red and blue step marks
   ("now look"). As the teacher moves between problems and views, every student's iPad is frozen
   on their own work for that problem, in their own ink plus the transcription, with nothing to
   tap; when the teacher shows marks, the student's own work shows its marks too. Ending the
   session lands students on the report-and-reflection screen.
3. **Teacher force submit.** From the live class view, the teacher can hand in for the whole
   class. Every teacher-driven advance (force submit, starting whole-class review) gives students
   a visible one-minute grace before it takes effect.
4. **Detective feedback.** The feedback screen becomes one conversational sentence: how many
   problems contain at least one mistake, plus a hint naming the subskills to double-check. No
   per-problem or per-line marks. Rework opens every problem. The single exception to "no
   per-problem feedback in the program" is a live guard: if the student's rework makes a
   problem that was correct wrong, a banner says so immediately, hand-in is blocked until they
   restore or clear that problem, and the force-submit grace exists precisely so they get to do
   that.
5. **Persisted ink.** Handwriting strokes are stored per problem per version so the frozen screen
   can show the student's actual handwriting.
6. **Simplify every screen.** v2 put far too much text on screen. Before any new screen is built,
   every existing student and teacher screen is cut to the copy rule below, and every new screen
   is built to it. Descriptions are easier to add back later than to weed out.

## Copy rule

Applies to every screen, both sides, existing and new. It is the first ticket.

- Headlines are two to four words, never a full sentence.
- Any explanatory sentence that does not change what the user does next is removed.
- Labels over sentences ("3 problems · 1 with a mistake"), with one deliberate exception: the
  detective feedback sentence stays a sentence, so discovery reads as conversation rather than
  instruction.
- At most one line of helper text per screen, and only where a first-time user would otherwise
  be stuck.
- Legends, "what this means" panels and "why this happened" notes go, unless they are the
  content of the screen (the report's subskill summary stays).
- The projected board is the tersest screen in the product.

## Domain vocabulary

- **Pathway**: the ordered list of review stages after 1st submit. Stages: `individual`,
  `group`, `whole-class`. Valid iff strictly increasing in that order. The current build's only
  pathway is `[individual, group]`; that stays the default when no assignment has been created.
- **1st submit**: everything up to and including hand-in (overview, practice, confidence,
  working). Not a review stage; present in every pathway.
- **Individual review**: the feedback screen (detective sentence) followed by rework. Feedback is
  the first step *of* individual review, not part of 1st submit.
- **Group review**: unchanged: quick pass over problems no member got wrong, then discussion of
  the union of wrong problems. It keeps its per-problem reveal. When it follows 1st submit
  directly it uses first-submit slips.
- **Whole-class review (WC)**: the projected, teacher-led session. Terminal in every pathway
  it appears in. Writes nothing to any student's versions.
- **Frozen**: the student stage during WC. View only, no controls.
- **Waiting**: the student stage after hand-in (or after rework) when the next stage is WC and
  the teacher has not started it, or when there is no next stage yet to show.
- **Force submit**: teacher hands in the class's work at 1st submit. Unattempted problems are
  recorded as not attempted.
- **Grace**: the universal one-minute countdown shown to every student between a teacher-driven
  advance and its effect.
- **Example**: one student's transcribed working for one problem, shown anonymously on the board
  with a letter (A, B, C).
- **Slide**: one chosen problem on the board. Every slide has two **views**: `unmarked` (examples
  and counts only) and `marked` (the same examples with red and blue step marks, no text).
- **Bucket**: the set of students whose final work on a problem shares an outcome: fully
  correct, or a mistake in the same subskill. Buckets are coarse by design ("similar error
  type, even if not exact").
- **Final version**: the rework if individual review happened, otherwise the first submit.
- **Guard**: the live "this isn't where your mistake was made, your original work was correct"
  banner on a rework that breaks an originally-correct problem.

## User Stories

### Pathway selection (teacher)

1. As a teacher, I want to create an assignment (title, problems from the bank) in the current build, so that the pathway choice has a real home instead of a hardcoded constant.
2. As a teacher, I want to see the review pathway as a map with 1st submit fixed and bold at the top, so that I understand every pathway starts the same way.
3. As a teacher, I want to tap a stage in the next column and see it bold while its siblings fade, so that the choice I made is unmistakable.
4. As a teacher, I want the following column to show only the stages that can legally follow my choice, so that I cannot build an invalid pathway.
5. As a teacher, I want to tap a faded sibling to switch my choice and have anything I picked downstream cleared, so that changing my mind is one tap.
6. As a teacher, I want to stop after any column simply by not picking further and pressing submit, so that "submit only" and "individual review only" are ordinary choices, not special modes.
7. As a teacher, I want a one-line sentence under the map reading the chosen pathway in words (e.g. "1st submit → individual review → done"), so that I can confirm before I submit.
8. As a teacher, I want a dashed, disabled "continue tomorrow" node on the map labelled coming soon, so that the map matches the way I already think about pacing without pretending the feature exists.
9. As a teacher, I want the chosen pathway shown as a compact chip on the assignment header and card, so that I remember what shape this lesson has.
10. As a teacher, I want teacher screens for stages not in the pathway (review groups, for instance) to be hidden for that assignment, so that the teacher side reflects the choice.
11. As a teacher, I want the pathway to be fixed once created for now, so that the student flow cannot change under students mid-assignment.

### Student flow by pathway

12. As a student on a submit-only pathway, I want hand-in to take me straight to the report and reflection screen, so that a quiz or diagnostic has no review step.
13. As a student on a pathway with individual review, I want hand-in to take me to the detective feedback screen, so that the review begins with my own thinking.
14. As a student on a pathway that goes from 1st submit straight to group review, I want to move straight into the group quick pass using my first-submit work, so that the group has a shared target.
15. As a student on a pathway whose next stage is whole-class review, I want a calm "Handed in" waiting screen until my teacher starts the session, so that I am not left on a dead screen.
16. As a student, I want the same waiting screen after rework when whole-class review is next, so that the transition is consistent.
17. As a student, I want my stage transitions to follow the pathway automatically, so that I never have to know which pathway the teacher chose.
18. As a demo presenter, I want the app to behave exactly as today when no assignment has been created, so that every existing screen, deep link and test keeps working.
19. As a demo presenter, I want the reset control to clear the created assignment and any whole-class session along with the student session, so that every tab restarts together.

### Detective feedback (individual review)

20. As a student, I want the feedback screen to tell me how many of my problems contain at least one mistake, so that I know the size of the job without being told where.
21. As a student with one or more problems containing mistakes, I want a hint naming the subskills to double-check (up to three), so that I have a direction, not an answer.
22. As a student, I want the feedback to read as one conversational sentence rather than a label, so that discovery feels like a conversation, not an instruction.
23. As a student with no mistakes, I want to be told every problem held, so that I can move on with confidence.
24. As a student, I want no red marks, no per-problem slip counts, and no per-problem clue anywhere on the feedback screen, so that nothing points at the mistake.
25. As a student, I want to keep the star on a problem I got right but felt unsure about, so that my own confidence rating survives the redesign.
26. As a student, I want the blue standout marks gone from this screen, so that the correct lines cannot be found by elimination; they return in the whole-class marked view.
27. As a student in rework, I want to open and revise any problem, including ones that were correct, so that the hunt is real.
28. As a student in rework, I want my first attempt shown beside the pad with no marks, so that I can compare while I rewrite.
29. As a student in rework, I want no live count updates while I work, so that the count cannot be used as a guess-and-check oracle.
30. As a student handing in my rework, I want the same sentence pattern to report how many problems still contain a mistake, with no per-problem reveal, so that the framing is consistent.
31. As a student, I want my rework to be the final version and my first attempt preserved untouched, so that history and compare views stay truthful.

### The guard (only per-problem feedback in the program)

32. As a student who reworks a problem that was correct and writes a line that does not hold, I want an immediate banner on that problem saying this isn't where my mistake was made and my original work was correct, so that I stop before digging further.
33. As a student, I want that banner to appear the moment the offending line is transcribed, not when I leave the problem, so that it interrupts the mistake in progress.
34. As a student, I want a one-tap "restore my original" action on the banner, so that recovering is easy.
35. As a student, I want hand-in of my rework blocked while any originally-correct problem is currently broken, with the blocked reason shown, so that I cannot accidentally submit worse work.
36. As a student whose original had a mistake and whose rework is still wrong, I want no feedback about it, so that detective work stays detective work.
37. As a student, I want the guard to fire only on originally-correct problems, so that it never leaks where my real mistakes are.

### Teacher force submit and grace

38. As a teacher, I want a "hand in for everyone" action on the live class view during 1st submit, so that I can move the class on when time runs out.
39. As a teacher, I want a confirmation that tells me how many students are still working before it fires, so that I do not do it by accident.
40. As a student, I want a visible one-minute countdown ("Your teacher is moving the class on in 1:00") when the teacher forces hand-in, so that I can finish my line.
41. As a student, I want my in-progress work handed in as-is when the countdown ends, with unattempted problems recorded as not attempted, so that nothing I wrote is lost.
42. As a student, I want a brief notice that my teacher handed in the class's work, so that the jump to the next stage is explained.
43. As a student mid-rework with a broken originally-correct problem when the teacher forces the class on, I want the guard banner visible from second one of the countdown and the restore action available, so that I have that minute to put my original back.
44. As a student, I want the countdown to apply universally, not only when I have a broken problem, so that the rule is easy to understand.
45. As a teacher, I want starting whole-class review to be the way I end individual or group review early, so that I do not need a separate button for now.

### Whole-class review setup (teacher, private)

46. As a teacher, I want a "Start whole-class review" entry on the live class view when the pathway includes it, so that the session is one tap away.
47. As a teacher, I want a private setup view listing every problem with how many students struggled on it, the top three pre-checked, so that a default session is short and well-targeted.
48. As a teacher, I want to check or uncheck problems freely, so that I control what the class reviews.
49. As a teacher, I want 2–3 auto-suggested examples per chosen problem, diversified by bucket (one fully correct plus one per distinct error subskill), so that the board shows contrast.
50. As a teacher, I want to see the owning student's name and correctness beside each suggested example in setup only, so that I know what I am about to project.
51. As a teacher, I want to swap any suggested example for another student's work on that problem, so that I can pick the misconception I want to discuss.
52. As a teacher, I want the live demo student's actual transcribed work to be a candidate when they attempted the problem, so that the pipe is demonstrably real.
53. As a teacher, I want a "Project" action that opens the board view and freezes the class, so that setup and projection are clearly separate moments.

### Whole-class review board (projected)

54. As a teacher at the smartboard, I want one slide per chosen problem showing the statement and the 2–3 examples side by side labelled A, B, C, so that the class can compare approaches.
55. As a teacher, I want each example to carry its bucket count as "12/25 students" in both views, so that the class sees how common each approach was and "which is right?" is more interesting.
56. As a teacher, I want the denominator to be the number of students who handed in that problem, so that the counts make sense without a footer.
57. As a teacher, I want the unmarked view to show no student names, avatars, handwriting or correctness marks anywhere, including the control strip, so that the class has to decide for itself.
58. As a teacher, I want a "Show marks" control that switches the slide to the marked view, with red on steps that didn't hold and blue on the curated standout steps, marks only and no text, so that I narrate the misconception myself.
58a. As a teacher, I want next from the marked view to open the next problem unmarked, and previous to step back one view, so that the two-beat rhythm repeats per problem.
58b. As a teacher, I want a small "problem 2 of 3" indicator in a name-free control strip, so that I can drive it by touch.
59. As a teacher, I want an "End session" control on the board, so that I release the class from the same window.
60. As a teacher, I want the board to be its own route so that I can drag it to the projector display.
61. As a student in the class, I want to see the board's examples in transcription only, so that nobody is identified by handwriting.
62. As the owner of an example, I want *not* to be told which letter is mine, so that no one looks at me when I react.

### Whole-class review freeze (student)

63. As a student, I want my iPad to lock the moment the teacher projects, wherever I was in the assignment, so that everyone is looking at the board.
64. As a student, I want my screen to follow the board: when the teacher moves to problem 3, I see my own work on problem 3, so that I can compare without touching anything.
65. As a student, I want to see my own handwriting and its transcription for the current problem, unmarked while the board is unmarked, so that I recognise my own thinking before anyone points at it.
65a. As a student, I want my own work to show its red and blue step marks the moment the teacher switches the board to the marked view, so that the first time I see red on my line is right after the class saw what that mistake looks like on an anonymous example.
66. As a student who reworked the problem, I want both versions stacked, original then reworked, each with ink and transcription, so that I can see how I changed my approach.
67. As a student who never attempted the current problem, I want the problem statement and a short "you haven't attempted this one yet" note, still frozen, so that the screen is never blank or confusing.
68. As a student, I want a quiet banner saying my teacher is reviewing this problem with the class, so that the lock is explained.
69. As a student, I want no buttons, links, pads or menus to respond while frozen, so that "frozen" means frozen.
70. As a student, I want to see only my own work, never the board's examples, so that the board stays the shared object of attention.
71. As a student, I want to be released to the report and reflection screen when the teacher ends the session, so that the only remaining action is mine to take.
72. As a student who was still writing when the freeze arrived, I want my in-progress work kept as-is and shown, so that nothing is lost.

### Whole-class session lifecycle

73. As a teacher, I want the freeze to persist until I explicitly end the session, even if the board tab is closed, so that a dropped projector cable does not release the class.
74. As a teacher, I want a "Students are frozen · End session" banner on the live class view whenever a session is active, so that I always have an escape hatch.
75. As a teacher, I want the assignment to read as "in whole-class review" while active and "complete" afterwards, so that the lifecycle is visible.
76. As a teacher, I want swapping examples mid-session to be unavailable, so that names never reach the projector; ending and re-entering setup is the way to change them.

### Ink

77. As a student, I want my strokes kept per problem for my first attempt and my rework, so that the frozen screen and history can show my actual handwriting.
78. As a student, I want undo and clear to keep ink and transcription in step across a reload, so that the two versions never desynchronise.
79. As a teacher, I want ink never to appear on the board or in teacher views, so that anonymity holds.

### Documentation policy

80. As the product owner, I want a `FUTURE_FEATURES.md` at the repo root that collects every deferred idea, erring on the side of too much, so that scoping never loses an idea.
81. As the product owner, I want that policy recorded in the project instructions, so that every future session keeps the file current.

### Simplification

82. As a student, I want every screen cut to the copy rule, so that I read what to do, not why the product is clever.
83. As a teacher, I want every teacher view cut to the copy rule, so that live status is scannable at a glance during a lesson.
84. As the product owner, I want the simplification done before any new screen is built, so that new screens inherit the standard and nothing is simplified twice.

## Implementation Decisions

### Two shared stores, one seam pattern

- The existing student session store (localStorage snapshot plus BroadcastChannel, pure reducer,
  teacher tab batched at 3 s) is kept as the seam for student-owned state.
- A second store of the same shape holds **classroom state**: teacher-owned, shared across every
  tab. It has its own pure reducer and its own localStorage key and channel message type. It
  contains: the created assignment (title, chosen problem ids, pathway), the pending teacher
  advance (kind: force-submit or whole-class-start; deadline timestamp), and the whole-class
  session (chosen problems in order, chosen example refs per problem, current slide index,
  status: setup, active, ended).
- Both reducers are pure and tested by action replay, matching every existing `lib/` module.
  Screens render view models derived from the two states and dispatch actions; no screen holds
  flow state of its own except transient pad interaction.
- Two stores rather than one because the writers and lifetimes differ (teacher writes classroom
  state once per lesson; the student writes session state on every stroke). The multi-student
  build will key the student store per student and keep the classroom store as is.
- Reset clears both stores.

### Pathway model

- A pathway is an array of review stages drawn from `individual | group | whole-class`, valid
  iff strictly increasing in that fixed order. A pure pathway module exposes: validity, the
  stages that may follow a given prefix (for the map), the next student stage after a given
  stage under a pathway, and the human sentence for the chip and the map summary.
- The student reducer consults the pathway (from classroom state, defaulting to
  `[individual, group]` when none is created) on exactly three transitions: after hand-in, after
  rework hand-in, and after group done. Hand-in and force-submit resolve to the same action.
- Two new student stages: `waiting` (next is whole-class and the session is not active, or
  nothing else to show yet) and `frozen` (whole-class session active). `frozen` overrides any
  stage while a session is active; when the session ends, the student lands on `report`.
- Assignment creation writes to classroom state; the student side reads title and problem set
  from there when present, otherwise from the fixture, so the fixture remains the default demo.

### Assignment creation screen

- Ported from the Sept 7 mockup into the current build under a teacher route: title, problem
  picker from the bank, then the pathway map as the last section, then submit.
- The map is three columns. Column one is the fixed bold "1st submit". Column two offers the
  three review stages; picking one bolds it, fades its siblings, and fills column three with the
  stages that may legally follow. Column three behaves the same. Any faded node is tappable and
  clears downstream picks. A dashed disabled "continue tomorrow" node with a coming-soon label
  hangs off 1st submit. The summary sentence updates live. Submit writes the assignment.
- After creation, teacher navigation shows a pathway chip and hides links to teacher screens for
  stages not in the pathway (review groups when group is absent; whole-class controls when WC is
  absent).

### Detective feedback

- A pure feedback-summary module returns: the count of problems with at least one wrong line in
  the given version, the ordered distinct subskills of those mistakes, and the rendered sentence.
  Rule: hint present iff count ≥ 1, naming distinct subskills in first-occurrence order, capped at
  three. Zero mistakes renders the "every problem held" sentence. The sentence is deliberately a
  full sentence (the one exception to the copy rule).
- The feedback screen renders that sentence, the star affordance per problem, and the plain
  transcription of every problem with no verdict-derived styling of any kind. Standouts are not
  rendered on the student side for now (they remain in the data and in teacher views).
- Rework lists every problem, not only those with slips. The rework index ranges over the whole
  assignment. The first attempt is shown unmarked beside the pad.
- On rework hand-in, the student sees the same sentence computed over the final version, then
  proceeds by pathway.

### The guard

- A pure guard module answers, for a problem: was the first version fully correct, and does the
  current rework contain a wrong line. The guard is *tripped* iff both. It is evaluated on every
  rework reveal, undo and clear, so the banner appears and disappears live.
- The banner text is fixed: "This isn't where your mistake was made. Your original work was
  correct." It carries a "Restore my original" action that clears the rework for that problem
  (leaving the first version as final). The student may also clear or undo manually.
- Rework hand-in is refused while any problem is tripped; the hand-in control shows the reason.
- The guard never fires for problems whose first version had a mistake. Teacher views are
  unaffected.

### Teacher advances and grace

- Two teacher advances exist: force-submit (valid while any student is at or before working) and
  whole-class start (valid whenever the pathway includes WC and a session is in setup). Both
  write a pending advance with a deadline one minute ahead into classroom state.
- Every student tab shows a countdown banner while an advance is pending. When the deadline
  passes, the student reducer applies the advance locally: force-submit becomes the hand-in
  action (unattempted problems recorded as not attempted, a short notice shown once);
  whole-class start moves the student to `frozen`. Applying the advance is idempotent so that
  multiple tabs and reloads converge.
- The guard's block on hand-in does not apply to a forced hand-in: after the grace, the work is
  handed in as it stands. The grace is the student's chance to restore.
- Force-submit lives on the live class view with a confirmation dialog stating how many students
  are still working. There is no explicit "end individual review" or "end group review" for now.

### Whole-class session

- Setup view (teacher, private route): problems listed with struggle counts derived from the
  existing mistake data; top three pre-checked. Per chosen problem, 2–3 suggested examples.
- A pure examples module: buckets every student's final version of a problem into "correct" or
  one error subskill (the first wrong line's subskill), counts bucket sizes, and suggests
  examples by taking one correct example then one per distinct error bucket in descending bucket
  size, capped at three, minimum two when available. The live demo student is a candidate like
  any classmate. Denominator is students who handed in that problem. Students matching no shown
  example are not displayed.
- Classmate fixtures gain scripted transcriptions per problem so that examples exist. These are
  authored data, consistent with the existing wrong-set fixtures.
- The board is a separate teacher route rendering the active session: statement, A/B/C example
  columns with transcription and "n/m students", a Show-marks control, previous, next, slide
  indicator, end. The session's position is (slide index, view) with view `unmarked | marked`.
  Next from `marked` goes to the next slide `unmarked`; previous steps back one view. The
  unmarked view shows no names, avatars, ink or verdicts anywhere. The marked view adds the
  existing red layer (every step that didn't hold) and blue layer (curated standouts) to the
  examples, marks only, no clue or "why" text; counts show in both views. End writes status
  ended and clears the session, releasing students to `report`.
- Classmate example transcriptions gain standout entries where a step deserves one, using the
  same authored table as the demo student's, so blue appears on classmate examples too.
- The student frozen screen derives its view model from the classroom session's current
  position and the student's own versions: the problem statement; for each version present, ink
  and transcription stacked (original then reworked); or the not-attempted note. While the board
  is `unmarked`, the transcription carries no marks; while `marked`, it carries the same red and
  blue layers the feedback module already computes for that version. A fixed one-line banner
  explains the lock. The screen renders no interactive elements. Teacher-pushed diagnostics are
  not delivered while frozen.
- The live class view shows an "in whole-class review" status and the frozen-students banner
  with an End session action while a session is active.

### Persisted ink

- Strokes are stored in the student session per problem per version alongside the recognised
  lines. Undo and clear operate on both together through the reducer, so the two cannot drift.
- Ink is rendered read-only on the frozen screen and is available to the history screen. It is
  never read by any teacher view or the board.

### Simplification sweep

- First ticket. Every existing screen on both sides is edited to the copy rule; no behaviour
  changes. Each removed passage is either deleted or, if it explained a product decision worth
  keeping, moved to the relevant `DECISION_LOG.md` or `FUTURE_FEATURES.md` entry.
- New screens in later tickets are reviewed against the copy rule as an acceptance criterion.

### Documentation

- `FUTURE_FEATURES.md` at the repo root, seeded with every deferred idea from the interview. The
  project instructions gain a policy line requiring every session to append deferred ideas
  there, erring towards too much. The project instructions' layout note is corrected to point at
  the current build.

## Testing Decisions

A good test exercises a pure module through its public shape with realistic fixture data and
asserts the externally visible result: the stage the student lands on, the sentence the
student reads, the letters and counts the board shows, whether hand-in is allowed. Tests do not
inspect internal fields for their own sake and do not render React.

Modules under test, each with a colocated vitest file like the existing ones:

- **Pathway rules**: validity of all eight pathways and rejection of out-of-order or repeated
  stages; legal successors for every prefix; next stage after hand-in, rework and group under
  each pathway, including the default when nothing is created.
- **Student session reducer** (existing tests extended): routing by pathway across all eight
  pathways; waiting and frozen stages; pending-advance application and idempotence; forced
  hand-in recording not-attempted problems; ink kept in step with lines under reveal, undo and
  clear for both versions; guard blocking and unblocking rework hand-in; restore-original.
- **Classroom reducer**: assignment creation, pending advance with deadline, session setup,
  project, navigate, end, reset.
- **Feedback summary**: zero, one, two and many wrong problems; hint present whenever count ≥ 1;
  distinct subskill ordering and the cap of three; identical behaviour over first and final
  versions.
- **Guard**: tripped only for originally-correct problems with a wrong rework line; clears on
  undo, clear and restore; never fires for originally-wrong problems.
- **Examples**: bucketing by first wrong subskill; suggestion order and cap; denominator;
  inclusion of the live student; no names or verdicts in the board view model.
- **Board view model**: position stepping (next from marked opens the next slide unmarked,
  previous steps back one view); unmarked view carries no verdicts; marked view carries red and
  blue and nothing textual; counts in both.
- **Frozen view model**: correct version stacking; not-attempted case; problem follows the
  session's current slide; marks appear only while the board is marked.

Prior art: `session.test.ts` (action replay through the reducer), `group.test.ts` (set logic and
the "no correctness data leaks into the discussion view" assertion, which the board view model
test mirrors), `feedback.test.ts` and `versions.test.ts` (per-version derivations).

Screens are verified by build, lint, type-check and a headless two-tab click-through: teacher
creates an assignment with each pathway shape, student runs it; teacher forces hand-in and the
countdown is observed; teacher projects and the student tab is seen to follow slides and to
have no responsive controls.

## Out of Scope

- Changing the pathway after creation, and "continue tomorrow" pacing.
- Teacher "follow along with me" rewrite mode during whole-class review.
- Model-solution or annotation slides on the board beyond the two views; a second-device
  presenter view; swapping examples mid-session; examples mirrored onto student screens.
- Explicit "end individual review" or "end group review" actions.
- Any change to group formation, group screens, or teacher mistake, compare, report and
  review-groups views beyond gating by pathway.
- Detecting "still wrong or worse" reworks on originally-wrong problems.
- Any further placement of the red and blue step marks beyond the whole-class marked view.
- Persistent teacher settings for group review (never pair two named students).
- Class-level percentages beyond the per-example count; any aggregate on the frozen screen.
- Real multi-device or multi-student sync; a backend.

## Further Notes

- The board's counts require every displayed student to have a final version for the problem.
  Fixture classmates therefore gain scripted transcriptions; the live student's work is real.
- "Frozen" is deliberately absolute in this version. The rewrite mode that relaxes it is the
  first entry in `FUTURE_FEATURES.md` for this area, because the interaction design of the
  freeze should be experienced before deciding how much to give back.
- The guard is the one intentional exception to the detective principle. Its copy is fixed and
  its scope is narrow on purpose; widening it is a product decision, not a bug fix.
- Ticket order agreed: simplification sweep first; then pathway model and routing (with
  FUTURE_FEATURES seeded), creation screen with the map, persisted ink, detective feedback and
  the guard, teacher force submit and grace, whole-class setup view, board plus freeze plus
  session end, then documentation and the project-instruction corrections. The detective
  feedback redesign and the guard slot in before force submit, since force submit's grace exists
  for the guard.
- The marked view is the first place the student sees line-level colour on their own work in
  this version. Whether it belongs anywhere else stays an open question in `FUTURE_FEATURES.md`.
