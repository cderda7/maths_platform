# 26: Hierarchical skill category dashboard

**What to build:** Replace the flat one-column-per-subskill teacher grid with a category → group → leaf hierarchy over a fixed Methods taxonomy. Leaves get a five-level proportional status, groups and categories roll up worst-first, and clicking a dot expands the row sideways into groups, leaves and the marked-up work behind a leaf. Grow the fixture assignment to ten problems so the hierarchy has something to show. Add a Unit Focus confirmation card to assignment creation.

**Blocked by:** 24 (student freeze / marked view), 19 (assignment creation with pathway map).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

A teacher opens the live view during a lesson to answer one question: who needs me, and for what. Today the grid shows one column per subskill. That works for six subskills. A real Methods assignment touches fifteen to thirty, and at that point the grid is a wall of dots the teacher can't scan. The signal they need, "Tomas is stuck and it's the fractions, not the factorising", is buried in a row of thirty identical-looking cells, and there is no way to click a dot and see the work that produced it.

The same flatness leaks into the student's final report, which lists every subskill as a flat row, and into assignment creation, which has no notion of which QCAA unit the assignment's named facts and formulas come from.

## Solution

The teacher grid shows at most seven fixed-order category columns, and only the categories this assignment actually touches, so a six-subskill assignment and a thirty-subskill assignment look the same width. Each category dot is the worst status of anything beneath it, so a single real gap is never averaged away. Clicking a student's category dot expands that row into a strip that flows right: the category, its groups stacked vertically, then the leaves of the chosen group, then the student's marked-up work for that leaf with the familiar blue standout and red wrong-line marks. Groups and leaves inside the strip sort worst-first so the eye lands on the problem.

Leaf status is proportional rather than all-or-nothing, on a five-level scale, so one slip in four attempts reads as solid rather than developing. After a student submits, any leaf whose problems they skipped shows as a half dot, so incompletion is visible without being counted as failure.

The student's final report renders the same hierarchy and drill for themselves only. Assignment creation gains a Unit Focus card that shows the inferred QCAA unit, asks the teacher to confirm, and lets them describe the focus in plain language to have it reassessed.

## User Stories

1. As a teacher, I want the live grid to show a handful of category columns rather than one per subskill, so that I can scan the whole class in one glance regardless of how many subskills the set touches.
2. As a teacher, I want categories with no tagged subskill in this assignment to be omitted, so that the grid never shows an empty Stats column on an algebra set.
3. As a teacher, I want category columns in a fixed canonical order, so that my spatial memory of the grid survives the lesson as submissions arrive.
4. As a teacher, I want a category dot to be the worst status of anything beneath it, so that a real gap in one leaf is never laundered into a reassuring colour by averaging.
5. As a teacher, I want to click a student's category dot and see that category's groups for that student, so that I can narrow from "Algebra" to "Expanding & Factorising".
6. As a teacher, I want to click a group and see its leaves, so that I can narrow from "Expanding & Factorising" to "non-monic trinomials".
7. As a teacher, I want groups and leaves inside the drill sorted worst-first, so that the actual problem is the first thing I read.
8. As a teacher, I want the drill to expand the row sideways without covering any other student's dots, so that I can keep an eye on the rest of the class while I look at one student.
9. As a teacher, I want to click a leaf and see the student's work on the problems that invoke that leaf, marked with the blue standout and red wrong-line marks I already know, so that I find the mistake without opening their submission separately.
10. As a teacher, I want the leaf's own lines emphasised within that marked-up work, so that I see the relevant step first but still have the surrounding context.
11. As a teacher, I want the work popup to open to the right of the leaves rather than over them, so that I can click through several leaves without re-opening anything.
12. As a teacher, I want only one row expanded at a time, so that the grid stays readable.
13. As a teacher, I want a five-level leaf scale (secure, solid, developing, gap, not seen yet), so that one slip in four does not read the same as two slips in four.
14. As a teacher, I want leaf status computed only from work the student attempted, so that a student who ran out of time is not shown as red.
15. As a teacher, I want a half dot on any leaf where the student skipped problems after submitting, so that I can tell incompletion from failure at a glance.
16. As a teacher, I want the dots large enough that a half dot is unmistakable, so that I never misread a half dot as a full one.
17. As a teacher, I want the caution flag to still force a leaf to gap, so that the second-practice signal from ticket 05 is not weakened by the proportional scale.
18. As a teacher, I want classmates' dots to come from the same evidence as the demo student's, so that a classmate's dot and their popup can never disagree.
19. As a teacher, I want a Communication category that reflects whether working is shown in followable single steps, so that a student who jumps three steps at once is visible even when the answer is right.
20. As a teacher, I want Communication to never be judged against a target number of lines, so that a student who takes a different valid route is not penalised for it.
21. As a teacher, I want a Reasoning category that only appears when a problem asks the student to show, prove, justify or interpret, so that it carries signal when it does appear.
22. As a teacher, I want a Unit Focus category grouping the named facts and formulas of the unit (null factor law, binomial expansion identity), so that I can see whether the gap is the named rule or the generic procedure.
23. As a teacher, I want a problem to be tagged with both the named fact and the procedure when it uses both, so that I can tell a student who knows the null factor law but botched the factorising from one who did the reverse.
24. As a teacher creating an assignment, I want the system to infer the QCAA unit from the problems and ask me to confirm it, so that Unit Focus is labelled correctly without me picking from a list.
25. As a teacher creating an assignment, I want to describe the focus in plain language and have the unit reassessed, so that I can correct a wrong inference without leaving the screen.
26. As a teacher, I want the confirmed unit shown as the Unit Focus group label on the live grid, so that the drill reads "Unit 1" not "unit_1".
27. As a teacher, I want the update cadence footer and batched repaint to behave exactly as today, so that the hierarchy doesn't change the rhythm of the live view.
28. As a teacher, I want the teacher final report and the mistakes and review views to use the same leaf names and statuses, so that vocabulary is consistent across every teacher surface.
29. As a student, I want my final report to show my own categories, groups and leaves with the same drill as the teacher's, so that "what my teacher sees" is literally what my teacher sees.
30. As a student, I want that drill and marked-up work to appear only after the session ends, so that I am never told which line is wrong while I am still working.
31. As a student, I want my report to see only my own row, so that no classmate's status is exposed to me.
32. As a student, I want detective feedback to name the leaf ("double-check your non-monic factorising"), so that the hint is actionable rather than "double-check your Algebra".
33. As a student, I want my report's subskill summary grouped under category headings, so that fifteen leaves are readable rather than a flat list.
34. As a student on the iPad, I want the drill to collapse earlier columns to a breadcrumb when there is no width for four, so that the same component works on the device without a different design.
35. As a student sent to independent practice, I want a practice problem for the leaf I got wrong, so that practice is about the actual gap.
36. As a developer, I want every leaf ID to be a stable dot-notation key checked at compile time, so that the tagger and the dashboard can never disagree on a name.
37. As a developer, I want unknown leaf IDs dropped with a logged warning rather than silently or fatally, so that taxonomy drift is visible without blocking a teacher.
38. As a developer, I want tag confidence stored on the tag even though this layer ignores it, so that confidence-tiered rendering can be added later without a data migration.
39. As a developer, I want a test that every leaf with an authored wrong verdict has a practice problem, so that independent rework can never dead-end at runtime.
40. As a developer, I want the taxonomy module versioned, so that a General or Specialist taxonomy or an editable one can coexist later.
41. As a demo presenter, I want the fixture assignment to have ten problems that light up six of the seven categories with at least one red and one orange at category level, so that the worst-first roll-up visibly earns its keep.

## Implementation Decisions

### Taxonomy

- A single typed module exports the taxonomy as a const tree with a `version` field. Seven categories in canonical order: Algebra, Functions, Graphing, Communication, Reasoning, Stats, Unit Focus. Each category has groups; each group has leaves. Leaf IDs are `category.group.leaf` and the leaf ID type is derived from the tree so an unknown ID is a compile error at every authored site.
- Communication holds Process & Rigor. Reasoning holds Reasoning & Justification and Interpretation & Translation. The remaining category and group content follows the feature request verbatim, with the example ID for chain rule corrected to live under Unit Focus, Unit 3.
- Unit Focus groups are the four QCAA units. Leaf lists are closed and modestly expanded beyond the request (product and quotient rule alongside chain rule in Unit 3, discriminant in Unit 1). Tagger-proposed open leaves are a future feature.
- The taxonomy exposes lookups from leaf to group and category, canonical order, and display names in three forms (full name, short name for headers and chips, description), mirroring the current subskill record.
- An ID that does not resolve is dropped with a logged warning at the point tags are read. Never silent, never fatal.
- The existing six subskill IDs are removed and every authored site is remapped: `algebra` → linear equations; `fractions` → fractions, decimals & percentages; `factoring` → monic or non-monic trinomial factorising per problem; `expansion` → distributive expansion; `graphing` → quadratic graphs plus reading graph features for intercept and turning-point reads; `roots` → quadratic equations. Unit 1 named facts (null factor law, binomial expansion identity, discriminant) are added as second tags where a step uses them. Functions appears via zero-finding on the two problems that move between a function and its graph.
- Logged in the decision log: taxonomy as code rather than data.

### Tags

- A solution step and a line verdict each carry one or more leaf IDs rather than a single subskill. A tag is an object with the leaf ID and an optional confidence. This layer does not read confidence.
- A line verdict may carry a `compounds` flag meaning the authored line skips a step a reader could not follow. It is set per authored line, never inferred from line counts.
- The detective feedback cap of three names leaves by short name.

### Status and roll-up

- Status is a five-level closed union: `secure`, `solid`, `developing`, `gap`, `unseen`. Leaf status is the proportion of held lines over attempted lines tagged with that leaf: 100% secure, at least 80% solid, at least 60% developing, otherwise gap; no evidence is unseen. A leaf under caution is gap regardless. Communication's showing-complete-working leaf is the proportion of lines without the compounds flag.
- A pure roll-up takes a map of leaf statuses and returns group and category statuses, worst-first in the order gap, developing, solid, secure, unseen. A parent with only unseen children is unseen. The half-dot marker is a separate boolean per node, not a rank: true when the student has submitted and any problem invoking a leaf under that node has no recognised lines. Colour on a half dot is still computed from attempted work only.
- The same status derivation runs for every student. Classmate attempt transcriptions run through the existing line evaluator; the verdict table is extended so their scripted errors mark. Frozen status literals on classmates are removed. Classmates with no errors carry attempts equal to the model solution. Logged in the decision log: a single evidence path.
- The per-student contract used by the grid, the reports, the peer and mistakes derivations becomes a hierarchy result: leaf statuses plus rolled-up group and category statuses plus half-dot markers, keyed by taxonomy IDs.
- Logged in the decision log: worst-first roll-up over averaging, and the five-level scale.

### Teacher grid

- Columns are the categories that have at least one tagged leaf in the active assignment, in canonical order. The column group is computed, not hardcoded. The Set and confidence columns and the caution flag are unchanged.
- Dots grow from 10px to 15px. A new `solid` colour token (light green) joins the existing secure, developing and gap tokens in the theme. Half dots fill the left half.
- Dots become buttons with an accessible name of the form "Algebra: developing" and support keyboard activation. Only one row is expanded at a time.
- Clicking a dot expands that row into a full-width strip beneath it laid out as up to four columns flowing right: the category name and status, its groups stacked vertically as labelled dots sorted worst-first, the chosen group's leaves stacked vertically sorted worst-first, and the work panel for the chosen leaf. Clicking a different category dot on the same row swaps the strip's content. Clicking the open dot again collapses it.
- The work panel lists only the problems that invoke the chosen leaf, renders the student's recognised lines as text and TeX with the existing marked-view treatment (blue standout, red wrong), and emphasises the lines tagged to the chosen leaf with a left rule. A skipped problem shows as "not attempted".
- The batched 3-second repaint and the cadence footer are untouched; the strip re-derives from the same batched snapshot.

### Student report and other surfaces

- The student's final report renders the same hierarchy component for their own row only, after session end, drill and work panel included. Earlier stages never show it. On the iPad stage the component collapses already-visited columns to a breadcrumb when four columns do not fit.
- The student report's subskill summary lists leaves under category headings. Detective feedback names leaves.
- Teacher final report, mistakes, review-groups and original-versus-final views consume the hierarchy result and leaf short names; their layouts are otherwise unchanged.

### Assignment creation

- The creation screen gains a Unit Focus card showing the inferred unit and its title, a Confirm button, and a "Not quite? describe the focus" text field. Submitting the field re-infers by keyword: calculus, derivative or rate → Unit 3; exponential, log or series → Unit 2; statistics, sample or distribution → Unit 4; otherwise Unit 1. The card shows the new inference with a "reassessed from your note" caption. Confirmation writes the unit onto the created assignment in the classroom store.
- The assignment's `unit` becomes structured (unit number, topic, title) rendered to the existing eyebrow string. The fixture assignment is confirmed at Unit 1.

### Fixture assignment

- Ten problems. q1 to q6 as today. q7 factorises `(1/3)x² + 2x + 8/3`, tagged fractions, non-monic trinomial factorising and the binomial expansion identity. q8 reads a root off a drawn quadratic rendered as inline SVG, tagged reading graph features and zero-finding. q9 is a worded model, `h = -x² + 6x`, find the landing point and greatest height, tagged interpreting worded problems, quadratic graphs, reading graph features, zero-finding. q10 shows `x² + 4x + 5 = 0` has no real solutions and explains what that means for the graph, tagged the discriminant, formal justification and drawing conclusions in context.
- Sam's scripted run keeps the existing errors and adds: q7 multiplies only two of three terms by 3 (fractions gap); q8 correct; q9 finds the landing point but reads the turning point as the intercept midpoint without the height, with the compounds flag on that line; q10 states the discriminant is negative and writes no conclusion. Net category state: Algebra developing via the fractions leaf, Communication solid, Reasoning gap, the rest secure or solid.
- Difficulty tags, pathway placement, classmate `done` counts, wrong sets and attempts are extended for the four new problems. Practice problems are authored for every leaf that has an authored wrong verdict, and the practice record type becomes partial over leaf IDs.

## Testing Decisions

A good test drives the system through the same events a user produces and asserts what a user would see, never how it was computed. Here that means feeding recognised lines into the session reducer and asserting the hierarchy result, exactly as the existing status tests do.

- **Primary seam, session events → hierarchy result.** The existing status test file is the model: reveal scripted lines for q1 to q10 and assert leaf, group and category statuses and half-dot markers. Cover the five thresholds, worst-first propagation at both hops, unseen-only parents, the caution override, the half dot appearing only after submit and only where problems were skipped, and colour on a half dot ignoring skipped problems. The full scripted run asserts the agreed end state: Algebra developing, Communication solid, Reasoning gap.
- **Classmate evidence through the same seam.** Each classmate's attempts run through the evaluator and produce the statuses their existing fixture notes describe. A test asserts no classmate has a line that evaluates to unclear, which would silently under-report.
- **Taxonomy invariants.** Every leaf ID in the tree round-trips to its group and category; canonical order is stable; an unknown ID is dropped with a warning and never throws; every leaf tagged anywhere in the fixture resolves; every leaf with an authored wrong verdict has a practice problem.
- **Unit inference.** The keyword inference is a pure function with a table of inputs to units.
- **Reducer-level surfaces already tested** (feedback, report, mistakes, peers, examples, pathway) get their expectations updated to leaf IDs and the five-level scale; no new test shape.
- **Browser check.** No new automated browser seam. The grid, the sideways strip, the half dot and the work panel are verified end to end via the CDP tab procedure recorded in project memory, on both the teacher route and the student report on the iPad stage, with screenshots reviewed for the 15px dot, the light-green token and the breadcrumb collapse.

## Out of Scope

- Cross-assignment persistence of any status.
- A real auto-tagger, a real step-granularity detector, or any confidence thresholding in this layer.
- Tagger-proposed Unit Focus leaves.
- Header-level column zoom (whole-class view at group level).
- A class summary row of counts per category.
- Live (pre-submission) marked-up work for students, and the broader question of where else marked-up copy appears for students.
- General Mathematics and Specialist Mathematics taxonomies.

Each of these is appended to `FUTURE_FEATURES.md` with today's date as part of this ticket.

## Further Notes

- The working tree already contains uncommitted work growing the assignment from four to six problems and adjusting the classmate fixtures and several tests. This ticket builds on top of that state; it should be committed first under its own message.
- Decision log entries to write: taxonomy as code; worst-first roll-up over averaging; the five-level status scale; a single evidence path for all students.
- Architecture note at `architecture/26.md`, folded into the root `ARCHITECTURE.md`, per the standing instruction.

- [ ] Taxonomy module with derived leaf ID type, lookups, canonical order, version
- [ ] Tags on steps and verdicts; six legacy IDs remapped across every authored site
- [ ] Five-level status, proportional leaf rule, worst-first roll-up, half-dot markers
- [ ] Classmates derive statuses from evaluated attempts; frozen literals removed
- [ ] Fixture grows to ten problems with Sam's scripted errors and classmate attempts
- [ ] Practice coverage for every leaf with a wrong verdict, enforced by test
- [ ] Teacher grid: computed category columns, 15px dots, half dots, accessible buttons
- [ ] Sideways drill strip with worst-first groups, leaves and marked-up work panel
- [ ] Student report renders the same component for self after session end; breadcrumb collapse on iPad
- [ ] Detective feedback and report summary use leaf names under category headings
- [ ] Creation screen Unit Focus card with confirm and keyword reassessment
- [ ] Tests per Testing Decisions; existing suites updated
- [ ] `FUTURE_FEATURES.md`, `DECISION_LOG.md`, `architecture/26.md`, `ARCHITECTURE.md`
