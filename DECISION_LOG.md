# Decision log — Edexia · Maths (current build)

Significant technical decisions for the closed-loop demo. Newest at the bottom.
Product and pedagogy decisions inherited from the Sept 7 mockup are in its `decisions_log.md`,
last present at commit `e40040c` under `roughdraft_sept7/` (the folder was removed on 10 Sep 2026;
see the entry of that date).

## 2026-09-08 · Fresh app in `curr_version/`, kit ported from the roughdraft

**Decision.** Start a new Next.js 16 / React 19 / Tailwind 4 / KaTeX app in `curr_version/` and
copy in only the roughdraft's design tokens and small presentational kit (card, button, eyebrow,
tags, KaTeX wrapper, brand mark). Do not extend the roughdraft app.

**Context.** The v2 spec re-scopes the demo around a single scripted student loop on an iPad
frame plus a teacher tab. The roughdraft has eleven screens, three sample students and a
tutor-chat script that the demo doesn't want, and its navigation assumes a desktop product.

**Alternatives considered.** Extend the roughdraft in place (fastest start, but every screen would
need its nav and routing reworked and the dead screens would confuse a demo audience). Start from
`create-next-app` with no port (clean, but the visual language would drift from edexia.ai for no
reason).

**Tradeoffs.** Two apps in one repo until the roughdraft is deleted; root scripts now point at
`curr_version/` with `*:roughdraft` variants. Some duplicated kit code between the two.

**Defence.** The demo reads as the same product as the mockup and the marketing site from the
first screen, and nothing unrelated to the closed loop ships in the demo bundle.

## 2026-09-08 · iPad stage: true-size 1180×820 screen, scaled to fit

**Decision.** Student screens render inside a fixed 1180×820 logical-point landscape screen
(the 10th-generation iPad) with a dark bezel. The whole device is CSS-scaled down uniformly when
the browser viewport is smaller, never reflowed.

**Alternatives considered.** A responsive layout capped at iPad width (would look like a narrow
website, not a device). A fixed frame that overflows on small laptops (unusable on a 13-inch
screen when the demo is projected).

**Tradeoffs.** Text is slightly smaller than true size on small laptops; drawing input in later
tickets must divide pointer coordinates by the scale factor.

**Defence.** Every layout inside the frame is designed once at real iPad size, which is what the
demo is selling, and the frame still fits on any laptop.

## 2026-09-08 · Simulated recognition maps bursts of strokes to scripted lines

**Decision.** The pad reveals the next pre-authored line for the current problem when a burst of
strokes ends: pen up followed by 850 ms with no new stroke. Each revealed line remembers the
stroke count at that moment; undoing below it withdraws the line, and the next burst re-reveals
it. The timing lives in the pad component, the rules in a pure module with tests.

**Context.** The spec replaces MyScript with scripted recognition "timed to stroke completion".
A handwritten line of algebra is many strokes, so per-stroke reveal would race ahead of the hand;
per-line reveal on a short idle reads naturally to an audience.

**Alternatives considered.** Reveal on a fixed timer regardless of ink (looks fake when the
student pauses). Reveal on a "done" button per line (breaks the live feel the demo is selling).
Segment the ink geometrically by row (fragile with mouse scribbles and adds nothing to the demo).

**Tradeoffs.** A student who pauses mid-line sees the line appear early; drawing more than the
script has lines leaves extra ink unread. Both are acceptable for a scripted demo and the
presenter controls the pacing.

**Defence.** Visually indistinguishable from recognition at demo distance, zero integration
risk, and the bookkeeping is unit-tested so undo can't desynchronise ink from transcription.

## 2026-09-08 · Caution flag = second practice entry on a subskill, whatever triggered it

**Decision.** The escalation counter tracks, per subskill, mistakes since the last practice and
how many times practice has been triggered. A second mistake triggers practice and resets the
count. A second *practice entry* on the same subskill raises the caution flag. "I need help"
runs the identical trigger path, so a self-identified practice counts as an entry.

**Context.** The spec says "1st = no-op, 2nd = trigger + reset, repeat-2nd-after-reset = caution"
and separately that the help button "runs the identical flow a system-detected trigger would".
Read together, the flag is about entering practice twice, not about a particular count.

**Alternatives considered.** Count only detected mistakes toward caution (then help would be a
free action and the demo would need four factorising slips in four problems to show the flag).
Raise caution on the first mistake after a reset ("about to enter" read literally; too eager and
the teacher would see red before anything has actually looped).

**Tradeoffs.** A student who asks for help twice on one skill flags the teacher, which is the
intended reading of self-identification but could feel punitive if the copy were wrong; the copy
frames it as a fact for the teacher, not a mark against the student.

**Defence.** The demo path shows the whole loop in four problems: a detected practice on Q2, then
one help request, then red on the teacher side. And undo-then-redraw can't inflate the count
because counted mistakes are keyed by problem and line index.

## 2026-09-08 · Cross-tab session: localStorage snapshot + BroadcastChannel, no backend

**Decision.** The one student session lives in a small external store. Every change is written
to localStorage and posted on a BroadcastChannel; the teacher tab reads the store on a 3-second
batch. A named `?stage=` deep link starts a fresh run; a plain `/student` continues the stored
one; Reset writes a fresh session so every tab restarts together.

**Context.** The demo runs on one laptop with the iPad tab and the teacher tab side by side or
alt-tabbed. The spec calls the teacher view "live (batched)" and the brief is design-only, no
persistence.

**Alternatives considered.** A local dev API with server-sent events (real "sync", but a
server to keep alive during the demo and nothing the audience can see). Rendering both sides in
one window (robust, but hides the two-device story the loop is about). Pure in-memory state
(a reload or a late-opened teacher tab would show nothing).

**Tradeoffs.** Works only across tabs of one browser profile; a second machine would need the
API. localStorage can be cleared by the browser. The 3-second batch is a design choice made
visible in the legend, not a limitation.

**Defence.** Zero infrastructure, survives reloads, and the batched cadence is exactly the
product behaviour the spec describes for the teacher side.

## 2026-09-08 · Blue "standout" steps are curated per run kind, not derived

**Decision.** The blue layer is a hand-authored table: for each problem, which correct lines
stand out and whether that applies to a strong run, a weak run, or both. The run kind is the
only thing derived (any step that didn't hold makes it a weak run).

**Context.** The spec wants blue to mean "worth noticing", not "correct": novel moves for a
strong run, the harder steps that still held for a weaker one. Judging novelty or difficulty
needs a model of the student and the problem; the demo has fixture data.

**Alternatives considered.** Highlight every correct step (blue becomes noise and the
philosophy is lost). Mark the last correct step before a slip (arbitrary and often trivial).

**Tradeoffs.** New problems need their standouts authored. Two run kinds is coarse.

**Defence.** It shows exactly the feedback philosophy the demo is selling, and it lives in the
same table as the verdicts, so the real build swaps the table for a model call behind the same
`feedbackFor` shape.

## 2026-09-09 · Copy rule: labels over sentences, no legends, one helper line per screen

**Decision.** Every screen on both sides is cut to a fixed copy rule (spec v3): headlines of two
to four words; any explanatory sentence that does not change what the user does next is removed;
labels over sentences; at most one line of helper text per screen; no legends or "what this
means" panels unless they are the content of the screen. The detective feedback sentence is the
one deliberate exception and stays a full sentence.

**Context.** The v2 build explained itself on every screen: intros, legends, "not marked" footers,
per-status explanation lines. The user's verdict was that it was far too much text and that
descriptions are easier to add back than to weed out.

**Alternatives considered.** Keep the copy and add a "less text" toggle (two copies to maintain,
and the default is still the wordy one). Trim only the student side (the teacher views were the
wordiest). Trim per screen by taste (no rule means the next screen drifts back).

**Tradeoffs.** A first-time user loses some hand-holding: the status dots have no legend, the
confidence options have no blurbs, the warm-up has no pitch. Some product stance ("no marks
anywhere") is no longer stated on screen and lives only in the docs.

**Defence.** The rule is short enough to apply to every future screen and to check in review,
the demo audience is shown the product rather than told about it, and `FUTURE_FEATURES.md`
records where a line of explanation might earn its way back.

## 2026-09-09 · Two shared stores: the student session and a teacher-owned classroom

**Decision.** Teacher-owned state (the created assignment with its pathway; later the pending
class advance and the whole-class session) lives in its own store, `lib/classroom-store.ts`,
with the same localStorage-plus-BroadcastChannel shape as the student session store but its own
key, channel and pure reducer. The student reducer takes the pathway as an environment argument
rather than reading the other store.

**Context.** Spec v3 lets the teacher choose a review pathway at assignment creation and, later,
freeze the class. That state has a different writer (the teacher, once per lesson) and lifetime
(the class, not one run) from the student session, which changes on every stroke.

**Alternatives considered.** Fold the pathway into `StudentSession` (simplest today; but a reset
of one student would forget the lesson's pathway, and a second student would need a copy).
One combined "demo state" store (one key; but every stroke would rewrite and rebroadcast the
teacher's state, and the multi-student build would have to split it anyway).

**Tradeoffs.** Two stores to reset together (`resetSession` does both). A reducer with an
environment argument is one more thing to pass in tests, mitigated by a default that is the
build's original pathway so every earlier test holds unchanged.

**Defence.** The seam matches who owns what: the multi-student build keys the student store per
student and keeps the classroom store as is. And the pathway is a pure rule (`lib/pathway.ts`),
not an enumerated list, so eight pathways cost the same as one.

## 2026-09-09 · A pathway is a rule, not a list

**Decision.** A review pathway is an ordered subset of `individual < group < whole-class`, each
optional, each at most once. Validity, legal successors and the next student stage are derived
from the order; nothing enumerates the eight pathways by hand.

**Context.** The teacher picks the pathway on a three-column map; the student flow needs the next
stage after hand-in, after rework and after group review.

**Alternatives considered.** Hardcode the six pathways in the user's sketch (misses the
three-step path and submit-only, and the map would need per-pathway wiring). A general graph
(more than the product needs; the fixed order is the pedagogy).

**Tradeoffs.** Adding a fourth review stage later means placing it in the order, which may not be
linear forever.

**Defence.** The map is "pick the next stage from those later in the order", the reducer is
"what follows the stage just finished", and both are one function each with a test over all
eight pathways.

## 2026-09-09 · Ink lives in the session, rounded, and undo pops ink and lines together

**Decision.** Strokes are stored in the student session per problem per version, beside the
recognised lines, rounded to a tenth of a pad pixel. Undo and clear are reducer actions that
change ink and lines in one step; the pad only appends strokes.

**Context.** Spec v3's frozen screen shows the student's own handwriting for the problem on the
board, and history should show it too. Before this, strokes were component state and vanished on
stage exit; only the transcription survived.

**Alternatives considered.** A separate ink store (a second key to keep in step with the session
on every undo; drift is exactly the bug to avoid). Storing a rendered PNG per problem (smaller
for long pages, but loses vector quality on the projector and cannot be undone stroke by
stroke). Full-precision coordinates (three times the bytes for no visible gain).

**Tradeoffs.** Every stroke rewrites and rebroadcasts the session snapshot; a very long page of
ink grows the snapshot into the hundreds of kilobytes, well inside localStorage but worth
watching if pages get longer. Old snapshots without the fields are filled from the initial
session on load.

**Defence.** One source of truth means undo can never desynchronise handwriting from
transcription (unit-tested), a reload or second tab redraws the same ink, and the frozen screen
and history render from the same vector data through one component.

## 2026-09-09 · Detective feedback: one sentence, one exception

**Decision.** After hand-in the student reads one conversational sentence (how many problems
contain a mistake, which subskills to double-check, hint whenever at least one problem is wrong,
at most three subskills) and an unmarked transcription. Rework opens every problem. The only
per-problem feedback in the product is the guard: a rework that makes an originally-correct
problem wrong gets an immediate banner, a one-tap restore, and blocks hand-in until fixed.

**Context.** v2 marked every wrong step red and counted slips per problem, which the user judged
too direct: it removed the detective work the individual stage exists for. The guard came from
the question of what happens when a student "fixes" a problem that was right.

**Alternatives considered.** Keep per-problem slip counts but hide the line (still says where to
look). Hint only from two wrong problems (the user chose to hint at one as well). Let the broken
rework through and count it (would make history and compare truthful but sends worse work
forward; the user chose to block, with the force-submit grace as the escape). Silently keep the
original as final (history would lie).

**Tradeoffs.** A student with one wrong problem is told the subskill, which points fairly
precisely at the problem. Blocking hand-in needs the teacher's force-submit (ticket 22) as the
release valve. The guard needs a scripted "wrong rework" line for a correct problem to be
demonstrable, added for Q4.

**Defence.** The sentence keeps discovery conversational rather than prescriptive; the guard is
narrow by construction (it cannot fire on an originally-wrong problem, so it cannot leak where
real mistakes are) and its copy is fixed. Both are pure functions with tests.

## 2026-09-09 · Teacher advances are a deadline in the classroom store, applied by each student tab

**Decision.** A teacher advance (force submit now; whole-class start next) is written to the
classroom store as `{ id, kind, deadline = now + 60 s }`. Every student tab shows the countdown
from the same deadline and, when it passes, applies the advance to its own session through an
idempotent reducer action keyed by the advance id. Nothing on the teacher side touches the
student session directly.

**Context.** Spec v3 gives every teacher-driven move a universal one-minute grace, and the guard's
hand-in block relies on that minute as the student's chance to restore. The demo has one student
today and many tomorrow.

**Alternatives considered.** The teacher tab writes the hand-in into the student session after a
timer (works for one student, breaks for many, and fails if the teacher tab closes). A timer in
the reducer (reducers are pure; a deadline is data). Apply on the teacher's side without a grace
(the user chose a visible minute so students can finish a line or restore a broken problem).

**Tradeoffs.** A student tab must be open at the deadline to apply the advance; one opened later
applies it if the deadline passed within the last minute, otherwise ignores it as stale. Clocks
across machines would need to agree; in the one-laptop demo they do.

**Defence.** The same mechanism carries the whole-class freeze in ticket 24 with a different
`kind`, the countdown is one component on each side, and idempotence by id means reloads and
extra tabs converge on one hand-in.

## 2026-09-09 · The board sees letters, lines and counts; names stop at the setup view

**Decision.** The examples module returns two shapes: candidates (with names and buckets) for the
private setup view, and a board view model of `{ letter, lines, count, denominator }` for the
projected route. The board route imports nothing that carries a student name, avatar, ink or
verdict, and a unit test asserts the view model's keys and that no name or verdict word appears
in its JSON.

**Context.** Spec v3 projects the board on the class smartboard: anonymity is a hard requirement,
and "which one is right?" only works if the board doesn't answer it. Buckets are coarse (correct,
or the first wrong step's subskill) because the user asked for "similar error type, even if not
exact".

**Alternatives considered.** One shape with names and a `hideNames` flag on the board (one missed
flag leaks a name to the projector). Exact-line buckets (too fine: two students with the same
misconception and different arithmetic would count separately).

**Tradeoffs.** The denominator is students who handed in that problem, not the roster, so a
student who matches none of the shown examples is simply not represented. Classmates' correct
work is the model solution, since the fixtures only script their mistakes.

**Defence.** Anonymity is enforced by the type at the seam rather than by discipline in the
screen, and the same candidates feed the private setup and the public board without duplication.

## 2026-09-09 · The freeze is derived from the classroom, and Project is one atomic action

**Decision.** A student tab freezes when the classroom says a whole-class session is active and
no grace is counting down, and releases when it stops being active. Project is a single
classroom action that both activates the session and starts the grace. The frozen screen renders
from a pure view model that reads the board's current slide and view.

**Context.** Spec v3: everyone freezes after a one-minute grace, follows the board, sees marks on
their own work only while the board shows marks, and is released to the report when the teacher
ends the session, which must work even if the board tab was closed.

**Alternatives considered.** Freezing only through the timed advance (a tab opened late would
never freeze). Two messages, "project" then "start the grace" (the first run did exactly this and
students froze in the millisecond between them). The board pushing each slide into every student
session (writes fan out per student; the classroom already holds the slide).

**Tradeoffs.** A student tab must be open to freeze, and its own clock decides when the grace has
run out. Marks on the student's own work are computed on the student side from the same tables
the board uses, so the two can only disagree if the tables do.

**Defence.** One source of truth (the classroom) drives the board, the escape hatch and every
student, so closing the board tab changes nothing and End works from anywhere; the atomic Project
removed a real race found in the click-through; and the first time a student sees red on their own
line is the moment the class has just seen the same mistake on an anonymous example.

## 2026-09-09 · Taxonomy as code

**Decision.** The Methods skill taxonomy is a const TypeScript tree with a version field. Leaf,
group and category id types are derived from the tree, so an unknown id at an authored site
(a solution step, a verdict, a practice) is a compile error. At runtime an unknown id read from
data is dropped with one logged warning, never silently and never fatally.

**Context.** Ticket 26 replaces six flat subskills with seven categories, fourteen groups and
thirty-odd leaves, tagged across ten problems, forty verdict lines and eleven practices. Any
mismatch between tagger and dashboard would be invisible on a dot grid.

**Alternatives considered.** JSON data loaded at runtime (editable, but no compile-time check and
a validation layer to write). A database table (right for the real product, wrong for a fixture
demo with no backend).

**Tradeoffs.** Editing the taxonomy is a code change. The derived types make the tree file a bit
dense to read.

**Defence.** Every one of the hundred-plus tags in the fixture is checked by `tsc`, the test
suite re-checks resolution at runtime, and the version field leaves room for a General or
Specialist tree beside it.

## 2026-09-09 · Worst-first roll-up over averaging, on a five-level scale

**Decision.** A leaf's status is the proportion of held lines over attempted lines tagged with
it: 100 % secure, at least 80 % solid, at least 60 % developing, otherwise gap; no evidence is
unseen. A group or category is the worst of its children; a parent with only unseen children is
unseen. Half dots are a separate marker for "submitted but skipped a problem here", never a rank.

**Context.** A teacher scanning a grid needs one real gap to stay visible through two hops of
aggregation, and one slip in four attempts to read differently from two in four.

**Alternatives considered.** Averaging children (a gap in one leaf disappears behind three secure
siblings). Three levels (one slip in four and two in four both read as developing). Counting
skipped problems as failures (a student who ran out of time turns red).

**Tradeoffs.** Worst-first makes a category look as bad as its worst leaf, which is the point but
can surprise on a first glance; the drill is one click away to explain it. Thresholds are a
judgement call, kept in one function.

**Defence.** The demo's scripted run shows exactly the intended contrast, Algebra developing and
Reasoning a gap from one line each, and the rule is two pure functions with tests at every
threshold.

## 2026-09-09 · A single evidence path for every student

**Decision.** Classmates' statuses are derived from their scripted attempts (or the model
solution where they got a problem right) through the same evaluator and roll-up as the live
student's. The frozen per-subskill status literals on the classmate fixtures are gone.

**Context.** The drill shows the work behind a dot. If a classmate's dot came from a literal and
their popup from their lines, the two could disagree.

**Alternatives considered.** Keep literals and add lines beside them (two sources, drift).

**Tradeoffs.** Every classmate slip needs a known line in the evaluation table; a test enforces
that none is "unclear". Correct work is the model solution, so classmates look uniform where
they are right.

**Defence.** A dot and its popup can never disagree, and the multi-student build gets the same
function per student with no special case.

## 2026-09-10 · The warm-up keeps its own lines and ink

**Decision.** The warm-up on the pad stores its recognised lines, ink and help state in a
`warmup` slice on the session, apart from the marked `lines`/`ink`, and reveals lines through
`RECOGNITION_WARMUP` with no evaluation table entry.

**Context.** Ticket 27 makes the warm-up the working screen with a pad. Every consumer of
`session.lines` (evidence for the teacher grid, feedback, versions, "problems started") iterates
its keys, so warm-up lines in the same map would be marked, counted and shown to the teacher.

**Alternatives considered.** Keying warm-up problems into `lines` under their own ids and
filtering them out at every consumer (five call sites today, and each new one a leak). Local
component state only (a reload or a teacher tab loses the warm-up, unlike every other stage).

**Tradeoffs.** Four more reducer cases that mirror the working ones. The mirror is deliberate: the
pad behaves identically, the data goes somewhere identical in shape but separate in meaning.

**Defence.** Nothing written in the warm-up can reach marking by construction, and the warm-up
survives reloads and mirrors to the teacher tab like every other stage.

## 2026-09-10 · Confidence before the warm-up, offer stays on the overview

**Decision.** The confidence survey comes before the warm-up. The overview keeps the offer
("Warm up" / "Start"); the survey's button then names what comes next.

**Context.** The user wants the confidence question to be about how the student feels before any
help, not a debrief after the warm-up.

**Alternatives considered.** Moving the offer onto the survey itself (a single "Continue" on the
overview). Kept for later: it would let the confidence answer drive which warm-up is offered
(see FUTURE_FEATURES).

**Tradeoffs.** A student who chose "Warm up" answers a question before getting it; the survey's
button ("Warm up") makes the sequence legible.

**Defence.** Smallest change to the flow that meets the requirement, and it leaves the
confidence-driven warm-up as a clean follow-on rather than a rewrite.

## 2026-09-10 · The warm-up chooser is a pure function of selection and words

**Decision.** The chooser stores only what the student did (`selected` problem ids and the chat
`messages`). The focus, the light-blue chips, the tutor's reply and the served problem are all
derived by pure functions in `lib/warmup.ts`: a regex table from skill words to leaves, a union
rule, and a coverage score over a small bank of composite and single-leaf problems.

**Context.** The user wants the student to point at problems and say in words what worries them,
and get one problem that tests those skills. A language model and a problem bank are the real
implementation; neither exists in the demo.

**Alternatives considered.** Storing the derived focus and chosen problem in the session (two
sources that can drift, and no way to re-score when the bank grows). A free-form "tutor" that
composes prose (unpredictable in a demo). Serving one practice per focus leaf (three worries →
three problems, which is what the user explicitly did not want).

**Tradeoffs.** The regex table is English-only, order-sensitive and will misread some phrasing;
the reply is honest about what it matched and what one problem leaves for the set, so a miss is
visible rather than silent. Composite problems are hand-authored (three today).

**Defence.** Every rule is unit-tested against the user's own example sentence, the seam for the
real interpreter is one function (`interpret`), and the seam for the bank is one array
(`WARMUP_BANK`) plus one scorer (`chooseWarmup`).

## 2026-09-10 · Warm-up skills in isolation, easiest first, not one composite problem

**Decision.** The chooser's focus is warmed up as a sequence: one short single-skill problem per
focus leaf, ordered by a fixed perceived-ease list (`EASE`), with the chip strip on the pad
marking each skill done. The composite problems and the coverage scorer from earlier the same
day are removed.

**Context.** The composite that covered "factorising and fractions" (a rational equation) was
harder than anything in the set. A warm-up must be easier than the set, and a student who
names three worries should meet them one at a time.

**Alternatives considered.** Keeping composites but capping difficulty (no measure of difficulty
exists for practices). Letting the student order the skills (more choices before any maths).

**Tradeoffs.** Three worries mean three problems; "Skip to the set" is one tap away throughout.
The ease list is a judgement call kept in one array.

**Defence.** Every problem served is a single-leaf practice already used mid-set, so nothing in
the warm-up can be harder than the isolated practice the set itself would offer.

## 2026-09-10 · Practice is offered on moves only, never on a whole-task skill

**Decision.** `NOT_ISOLATED` names the leaves that describe the whole task rather than one move
(today: quadratic equations). No practice exists for them, the help picker never lists them, the
warm-up never sequences them, and a wrong line tagged with one raises no practice prompt.
`isolatable(leaf)` is the single gate.

**Context.** A practice "on quadratic equations" is a quadratic equation, i.e. the set. Offering
it produced problems as hard as, or harder than, the set (the composite warm-up, then the
quadratic practice in the help picker).

**Alternatives considered.** Keeping the practice but ranking it last (still offered). Marking the
distinction in the taxonomy as a group-level node (a data migration for one rule).

**Tradeoffs.** A slip whose first tag is the whole-task leaf (Q4's formula denominator) now
prompts nothing; the counter still records it per group. If that proves too quiet, tag such lines
with the move first.

**Defence.** One list, one predicate, tested at every surface that offers practice.

## 2026-09-10 · One practice pad, two runs

**Decision.** The warm-up and the mid-set isolated practice share `PracticePad` and a
`PracticeRun` slice each (`warmup` and `overlayRun`), driven by `run/*` actions carrying the run
key and reduced by one `runReducer`.

**Context.** The mid-set practice was the old reveal-a-step card; the user wants it to behave
exactly like the warm-up (pad first, help on request).

**Alternatives considered.** A second copy of the pad screen wired to `overlay/*` actions (two
sets of rules to keep in step). One run slice shared by both (the warm-up's strokes would leak
into a mid-set practice and back).

**Tradeoffs.** The reducer dispatches on the run key, one indirection more than before.

**Defence.** The pad's behaviour is one component and one reducer; a change to help lands in
both places at once, and each run keeps its own ink.

## 2026-09-10 · Hint words point at the problem through phrase → TeX-fragment pairs

**Decision.** A practice problem may carry `hintTerms: { phrase, tex[] }[]`: a word as written in
the hint, and the fragments of the problem's TeX it stands for. The hint is split at every whole-
word occurrence of a phrase (`hintSegments`), and every fragment is wrapped in a KaTeX
`\htmlClass{hint-term}` group at all times, with `hint-term-lit` added to the hovered term's
fragments (`termTex`). Fragments are found as whole tokens (`findFragment`), never a superscript,
part of a longer number or a command name, and nest when one lies inside another. The links render
only in `PracticePad` (warm-up and mid-set practice); a set problem never carries them.

**Context.** The user wants "constant" and "middle coefficient" to read as pointers and, on hover,
to light the 12 and the 7, and the same for "a", "b", "c" and "ac" on every warm-up hint. The
hint and the expression are plain strings, so something had to say which word means which part.

**Alternatives considered.** Markup inside the hint string (`[constant](12)`): mixes content and
wiring, and one phrase used twice would need writing twice. Positional indices into the TeX:
brittle under any edit of the expression. A structured expression tree with addressable terms:
the right long-term answer but a rewrite of every fixture and the renderer for one feature.
Re-typesetting only the lit fragment on hover: measured, and a wrapped group changes no KaTeX
spacing, but wrapping everything always is simpler and provably layout-stable (a test compares the
spacing of every problem with every term lit against the plain expression).

**Tradeoffs.** Fragment matching is textual: a fragment must appear verbatim in the TeX, and the
first whole occurrence is taken, so an author must pick a fragment that is unambiguous (the follow-
up's "middle term" is `- 7x`, sign included, because KaTeX keeps binary spacing inside the group).
Every occurrence of a phrase links, so a hint that uses "constant" in two senses would need
rewording. Hover has no meaning on the iPad's touch input (deferred).

**Defence.** The data stays two readable strings plus a small list per problem; the invariants
(every phrase found whole in its hint, every fragment found as a token in its TeX, spacing
unchanged lit or not) are enforced by tests over every practice, so a broken link fails the suite
rather than silently not lighting.

## 2026-09-10 · Confidence is for the teacher; practice triggers on the second mistake for everyone

**Decision.** The confidence answer (confident / not confident with up to seven named skills /
not confident) is recorded and shown to the teacher in the live view and the report. It never
changes when practice is offered: the second mistake on a group triggers it, for everyone. The
practice goes to the most fundamental leaf slipped on in the group since its last practice.

**Context.** A first-mistake trigger for low-confidence students was built during the day and
reverted at the user's request: it intervened too early, and the teacher, not the program, is the
right one to respond to a low-confidence answer (a message to the student is the intended use;
see FUTURE_FEATURES).

**Alternatives considered.** Threshold 1 for a named skill (reverted). Threshold 1 only for
"not confident" overall (the same objection).

**Tradeoffs.** A student who said they are not confident gets no earlier help from the program;
the teacher sees the answer and can act.

**Defence.** One rule for practice, easy to explain to a student; confidence stays an honest
signal to the teacher rather than a lever.

## 2026-09-10 · Practice is offered on moves only, never on a whole-task skill

**Decision.** `NOT_ISOLATED` names the leaves that describe the whole task rather than one move
(today: quadratic equations). No practice exists for them, the help picker never lists them, the
warm-up never sequences them, and a wrong line tagged with one raises no practice prompt.
`isolatable(leaf)` is the single gate.

**Context.** A practice "on quadratic equations" is a quadratic equation, i.e. the set. Offering
it produced problems as hard as, or harder than, the set (the composite warm-up, then the
quadratic practice in the help picker).

**Alternatives considered.** Keeping the practice but ranking it last (still offered). Marking the
distinction in the taxonomy as a group-level node (a data migration for one rule).

**Tradeoffs.** A slip whose first tag is the whole-task leaf (Q4's formula denominator) now
prompts nothing; the counter still records it per group. If that proves too quiet, tag such lines
with the move first.

**Defence.** One list, one predicate, tested at every surface that offers practice.

## 2026-09-10 · One practice pad, two runs

**Decision.** The warm-up and the mid-set isolated practice share `PracticePad` and a
`PracticeRun` slice each (`warmup` and `overlayRun`), driven by `run/*` actions carrying the run
key and reduced by one `runReducer`.

**Context.** The mid-set practice was the old reveal-a-step card; the user wants it to behave
exactly like the warm-up (pad first, help on request).

**Alternatives considered.** A second copy of the pad screen wired to `overlay/*` actions (two
sets of rules to keep in step). One run slice shared by both (the warm-up's strokes would leak
into a mid-set practice and back).

**Tradeoffs.** The reducer dispatches on the run key, one indirection more than before.

**Defence.** The pad's behaviour is one component and one reducer; a change to help lands in
both places at once, and each run keeps its own ink.

## 2026-09-10 · Hint words point at the problem through phrase → TeX-fragment pairs

**Decision.** A practice problem may carry `hintTerms: { phrase, tex[] }[]`: a word as written in
the hint, and the fragments of the problem's TeX it stands for. The hint is split at every whole-
word occurrence of a phrase (`hintSegments`), and every fragment is wrapped in a KaTeX
`\htmlClass{hint-term}` group at all times, with `hint-term-lit` added to the hovered term's
fragments (`termTex`). Fragments are found as whole tokens (`findFragment`), never a superscript,
part of a longer number or a command name, and nest when one lies inside another. The links render
only in `PracticePad` (warm-up and mid-set practice); a set problem never carries them.

**Context.** The user wants "constant" and "middle coefficient" to read as pointers and, on hover,
to light the 12 and the 7, and the same for "a", "b", "c" and "ac" on every warm-up hint. The
hint and the expression are plain strings, so something had to say which word means which part.

**Alternatives considered.** Markup inside the hint string (`[constant](12)`): mixes content and
wiring, and one phrase used twice would need writing twice. Positional indices into the TeX:
brittle under any edit of the expression. A structured expression tree with addressable terms:
the right long-term answer but a rewrite of every fixture and the renderer for one feature.
Re-typesetting only the lit fragment on hover: measured, and a wrapped group changes no KaTeX
spacing, but wrapping everything always is simpler and provably layout-stable (a test compares the
spacing of every problem with every term lit against the plain expression).

**Tradeoffs.** Fragment matching is textual: a fragment must appear verbatim in the TeX, and the
first whole occurrence is taken, so an author must pick a fragment that is unambiguous (the follow-
up's "middle term" is `- 7x`, sign included, because KaTeX keeps binary spacing inside the group).
Every occurrence of a phrase links, so a hint that uses "constant" in two senses would need
rewording. Hover has no meaning on the iPad's touch input (deferred).

**Defence.** The data stays two readable strings plus a small list per problem; the invariants
(every phrase found whole in its hint, every fragment found as a token in its TeX, spacing
unchanged lit or not) are enforced by tests over every practice, so a broken link fails the suite
rather than silently not lighting.

## 2026-09-10 · Confidence sets the practice threshold; the demo student stays confident

**Decision.** A student who answered "not confident" (overall, or naming this skill among up to
seven of the set's most relevant) is offered practice on the first mistake there; everyone else
on the second. The practice goes to the most fundamental leaf slipped on in the group since its
last practice. A named skill covers its group (naming "Factorising" covers non-monic too), as the counter counts per group. The demo student names factorising, so the demo shows the rule and
the teacher grid shows the caution it leads to (user's call, 2026-09-10).

**Context.** The user's rule (FUTURE_FEATURES, 2026-09-09; built 2026-09-10): acknowledge the
confidence answer by intervening earlier. The demo's scripted run was "not confident when
algebra", which under the new rule would prompt at Q1, practise twice, and raise the teacher's
caution flag on factorising, changing the teacher grid the last two days of work were built on.

**Alternatives considered.** A confident demo student, keeping the teacher grid as it was (tried
for an hour, reverted at the user's request). Count confidence-triggered practices as half an
entry toward caution (a second rule to explain). Naming a category rather than skills (too
coarse: "algebra" made every algebra slip an early trigger).

**Tradeoffs.** Sam's Algebra column reads as a gap on the teacher grid and the report lists two
practices. The seven-skill list is per assignment, ranked by how many problems lean on each.

**Defence.** One threshold parameter and one predicate; the demo now shows the rule end to end,
student prompt to teacher caution.

## 2026-09-10 · One individual review screen: feedback and correction together

**Decision.** The rework stage is folded into the individual review screen. The student sees
what they submitted, corrects it on a pad beside it, and hands in from the same screen; the
guard and its restore live there too. The rework *version* (lines, ink, guard, hand-in
transition) is unchanged; only the stage and its screen are gone.

**Context.** The user found no way to correct work from the review screen: the separate rework
stage read as a different place, reached by a button. Correction is what individual review is
for, so it belongs on that screen.

**Alternatives considered.** Keep both screens and add a shortcut (two places doing one job).
Rename the rework stage (still two screens).

**Tradeoffs.** The review screen is denser: three columns beside the list. The `rework` deep link
is gone; `?stage=feedback` shows the same run.

**Defence.** One screen per review stage, matching the pathway model (individual · group ·
whole-class); nothing downstream reads a stage name, only the rework version.

## 2026-09-10 · Whole-class review: the mode is per problem, the teacher's ink rides the classroom store

**Decision.** During whole-class review a student's pad is either a mirror of the teacher's
writing ("screens frozen") or their own ("write with me"). The teacher picks one before
projecting and can switch the current problem from the board; the choice is stored per
projected problem. The teacher's strokes are classroom state, broadcast like every other
classroom change; the student's write-along strokes are a session slice of their own, never a
version and never marked.

**Context.** The user wants two distinct classroom moves: everyone watches, or everyone copies.
Both need the teacher's working in front of the student, and the second needs the student's
pen live without that writing counting as work on the set.

**Alternatives considered.** One mode for the whole session (the teacher cannot open a problem
up for copying mid-review). The teacher's strokes in the student session (they belong to the
class, not to one student). Recognising the student's write-along ink (it is a copy of the
teacher's working, not evidence).

**Tradeoffs.** Every teacher stroke broadcasts the whole classroom state; fine for a demo, a
stroke channel later. The mirror is one-way: nothing a student does in frozen mode reaches
anyone.

**Defence.** Mode and ink live where their owner is (classroom for the teacher, session for the
student), the per-problem switch is one action, and older stored sessions read as frozen.

## 2026-09-10 · Split view: the real routes in scaled iframes, inside the app

**Decision.** `/split` shows the student iPad, the teacher view and the board in one tab by
rendering each real route in an iframe, laid out at that surface's design viewport and scaled
with a transform to fit its pane. It is a route of the app, not a file beside it. The choice of
panes and layout lives in the URL and is remembered in localStorage.

**Context.** The user wanted to watch all three sides at once while presenting or developing.
The routes already sync through localStorage and a BroadcastChannel, which same-origin iframes
share, so the only work is the frame.

**Alternatives considered.** A static HTML harness opened from disk (the user's first idea): no
build step, but a `file://` page cannot read the app's styles or tokens, has to hard-code the
port, and drifts from the app. Rendering the three apps in one React tree: they would share a
document, so `h-screen`, `fixed` presenter controls, the iPad stage's viewport fit and the
teacher's `zoom` would all fight, and the stores would need in-document plumbing they don't have.
Reflowing each route to its pane's width instead of scaling: the product would show layouts it
never shows on a real screen.

**Tradeoffs.** Side by side, text is small at three panes on a laptop (about a third scale). A
scrolling stack of full-size rows was tried and rejected the same day (the iPad alone filled the
window). The default is now stacked and fitted: the student over the teacher in a three-fifths
column, the board letterboxed down the right at two fifths, everything on screen at once; the
board is small in its portrait column, and the per-pane "Open in a tab" remains for a focus. Every pane is a full app instance, so three
panes do three times the work. A scaled iframe is a real document with real input, so drawing
on a pad works, but a very small pane makes the pen fiddly.

**Defence.** One page, no new state to sync, the product's real screens at true proportions,
and a link that reproduces a presenter's setup.

**Addendum, 2026-09-10 · dividers.** Every boundary is draggable (a handle in a 12 px gutter
track), with the sizes kept in localStorage beside the pane choice but not in the URL: a link
should reproduce which surfaces are shown and how they are arranged, while how wide someone
dragged a pane on their monitor is theirs. The stacked layout keeps two shares (column, row);
side by side keeps a weight per pane, so a drag moves width between its two neighbours only and
the setting survives toggling a pane off and on. Shares are clamped at 15 % so a pane can be
made small but never disappear; double-click restores a boundary. Alternatives: sizes in the
URL (long, and wrong for another screen size); CSS `resize` on the panes (one-sided, no gutter,
no minimum); a library splitter (a dependency for a hundred lines).

## 2026-09-10 · Seating groups are teacher-set classroom state; lightweight classmates borrow known slips

**Decision.** The five review groups are static, set by the teacher on a groups page (drag
between five colour columns) and kept on the classroom state per class, with a seating-chart
fixture as the default. A group's only identity is its colour. The platform-generated grouping
from shared mistakes stays as a read-only "suggested" section. The thirteen new classmates are
lightweight entries whose wrong problems reuse a known slip per problem, so every line of theirs
is still one the evaluator can follow.

**Context.** The leaderboard needs five groups; real groups are the seating chart, not a
computed clustering; and the demo needs twenty believable rows without twenty hand-written
attempt sets.

**Alternatives considered.** Groups formed by the existing shared-mistake rule (not how a
classroom works, and unstable as evidence changes). Groups on the assignment rather than the
class (they would be re-set every lesson). Lightweight classmates with no attempts at all (their
wrong problems would read as unattempted, and the "one evidence path for every student" rule
would break).

**Tradeoffs.** The thirteen share slips, so the teacher's mistake view shows the same working
under several names; a full version per student is logged for later. Groups of any size are
allowed with a flag rather than refused, so a class of twenty-one is fine.

**Defence.** One data file for the colours and the default, one pure module for the rules, one
classroom action to move a student, and the evidence path unchanged.

## 2026-09-10 · Group review starts for the whole class at once

**Decision.** Every student who hands in corrections waits at a class-level gate ("waiting for
the class · n of 20 handed in"). Group review starts on its own when everyone is in, or when the
teacher's "start group review now" grace runs out. Individual review is still entered per
student. Arrivals are classroom state; for the demo the classmates arrive on a scripted timeline
anchored to the demo student's arrival, so the count climbs while the room watches.

**Context.** The group review to come is a race between groups on the smartboard; a race is
meaningless if one group starts minutes ahead. The gate also gives the teacher one moment to
address the room before groups begin.

**Alternatives considered.** Per-group gates (a finished group starts early; leapfrogging by head
start). Teacher-only start with no automatic open (one more thing to press every lesson).
Arrivals as session state (they are a fact about the class, and the teacher's card needs them).

**Tradeoffs.** A fast student waits for the slowest; the teacher's start bounds that at one
minute. A student still writing the set when the teacher starts is left alone, since force
submit exists for that.

**Defence.** One pure readiness rule read by both surfaces, one classroom action per arrival, the
existing advance mechanism for the teacher's start, and the scripted timeline lives in one table.

## 2026-09-10 · Group review is one shared whiteboard, and the run lives on the classroom

**Decision.** A group reworks the union of its members' mistakes on a single shared board, one
problem at a time, one pen-holder per problem drawn by a reshuffling shuffle; only the holder
checks; a wrong check and "we're stuck" both show work only up to the first mistake. The run
(pen, board, attempts, resolved) is classroom state; a peer's turn in the demo is a timed script
of synthetic ink and lines, replayed once by index so tabs and reloads converge.

**Context.** The first design had four students reworking the same problems in parallel with
lockstep waits and retries at every step. One board removes the parallel work and the waiting,
makes the confident student explain and the unsure one ask, and gives the smartboard one stream
per group to measure.

**Alternatives considered.** Pass-the-pen or multi-cursor (the random draw is the point).
Recognising the board live (the user wants transcription only at the check, matching where OCR
is credible). Storing the run on the demo student's session (three other members and the teacher
read it). Synthetic turns as derived state from the clock (the turn start depends on the group's
own actions, so a replayed script with an index is simpler and idempotent).

**Tradeoffs.** Weaker signal on the quiet student; an individual check afterwards was dropped
and is logged. The synthetic ink is scribble, not text. Every board stroke broadcasts the
classroom state, as with the teacher's pad.

**Defence.** One pure module for the rules, one reducer for the board, one script table for the
demo, and the same evaluator judging the check as everywhere else.
## 2026-09-10 · The laptop guard is a browser script against a running build, not a vitest test

**Decision.** The teacher's surface is a laptop, frameless and full width (no stage like the
student's iPad). What keeps it fitting is `scripts/laptop-check.mjs` (`npm run check:laptop`): a
dependency-free CDP script that opens every teacher route at 1440 × 900 and 1280 × 800 in a
headless Chrome, and fails if the document scrolls sideways or any visible element's box ends
more than 1 px past the viewport. A box an `overflow: hidden` or `clip` ancestor cuts off is
measured at the cut (KaTeX draws `\sqrt` as a 400 000-unit path inside a clipping svg, and a
truncated line is `overflow-hidden whitespace-nowrap`); a scrollable ancestor is not a cut,
since content past its edge is a scrollbar inside the page. It expects a production build already serving on a port; it
refuses a CDP port something else answers on, and it ends its browser and deletes its profile
whatever happens.

**Context.** A reviewer met a horizontal scrollbar on the assignment-creation page at a normal
laptop width. Nothing measured layout: vitest covers `lib/` only, and the teacher pages are grids
with fixed side columns (`320px`, `380px`, `420px`, `440px`, `400px`) plus a `min-w-[980px]`
table, any of which could tip over the edge with one more column.

**Alternatives considered.** A vitest test with jsdom: no layout engine, so it cannot measure
anything. Playwright: a real browser harness with a fixture and a config, but a new dependency
for one measurement, when the demo's other browser checks already run over plain CDP. Starting
Chrome and Next from the test itself: hides the build step and doubles the run's time on every
`vitest run`; keeping the app's start explicit (`next build && next start -p 3121`) matches how
the other browser checks are run and how the demo is presented. A CSS-only defence (`overflow-x:
hidden` on the teacher root): would hide the symptom and clip content instead of failing.

**Tradeoffs.** The check is a separate command with a running app as a precondition, so it
does not fail on `npm test` alone; the README lists it beside the other verification steps and
the ticket rule is to run it before calling a teacher screen done. It measures a fresh load of
each route, not every state (an open drill, a pending diagnostic push, a half-built assignment).
It is macOS-shaped by default (the Chrome path), overridable with `CHROME`.

**Defence.** One file, no dependencies, the real layout engine at the two sizes the demo runs
on, and a failure that names the element and how far past the edge it sits.
## 2026-09-10 · The board is a display-only third surface; the laptop keeps the controls

**Decision.** The smartboard is its own surface at `/board`, opened once at the start of the
lesson and left on the projector: no button, no link, no pad that takes the pen. What it shows
is one pure rule over the classroom state, the pathway and the session (`lib/board.ts`): blank
(the class name and the assignment title, nothing else) while students work and through
individual and group review, and again after whole-class review ends; a holding placeholder once
group review is over until the teacher advances (ticket 42 puts the final standings there); the
whole-class slide while projecting, with a read-only mirror of the teacher's working. Every
control of whole-class review (previous, screens frozen / write with me, marks, End, next) and
the teacher's pad stay on the laptop at `/teacher/board`, which shows what the board is showing
instead of the examples; the live view carries the same indicator.

**Context.** Until now the projected board and its controls were one page under the teacher's
routes, so the projector showed buttons and the teacher had to drive from the projected window.
Tickets 40 and 42 want a board that is up all lesson (the group-review standings), so the room
needs a screen that is always on and never shows a control. The blank state shows the class and
the title so a projector that is on doesn't read as broken, and nothing student-specific ever
reaches it.

**Alternatives considered.** A presenter mode on the projected page (a query flag that hides the
controls): one route with two faces, easy to open the wrong one on the projector, and the
laptop still shows the examples it doesn't need. Keeping the examples on the laptop beside the
pad: the teacher would read from the laptop rather than the room's shared object. Rendering the
board's content into the teacher's page as a live thumbnail: extra work on every store change
for a picture the teacher can see on the wall. Driving the holding state from a new classroom
flag: state that the group session of ticket 40 will own anyway; for now the demo student's
session (their group review ending) is the class's clock, which the note and the code say.

**Tradeoffs.** The teacher no longer sees the examples on the laptop and points at the wall
instead; if that turns out to matter, a small read-only strip of the examples can come back on
the controls page. The board reads the session unbatched (a new `useLiveSession`), so it moves
the moment the class does while the teacher's views keep their 3 s batches; two cadences to
know about. The board mirrors the teacher's ink, so a private scribble is on the wall; the
teacher's pad has Clear. With a pathway that ends at group review the board holds the
standings for good, which is what ticket 42 asks for ("hold until the teacher advances"), and
with none it stays blank.

**Defence.** One pure function decides what the wall shows, tested per stage and for naming no
student; the projector's route has zero interactive elements by construction, so nothing can
be pressed on it by accident; and the controls, the pad and the mirror to frozen students are
unchanged in behaviour, only moved. The same rule feeds the indicator on both teacher pages, so
the teacher never has to look at the wall to know what is on it.

## 2026-09-10 · The debrief is per student, the group's clock is the next pen-holder's

**Decision.** After a correct check each student debriefs alone: a note against a prompt chosen
from their own history, then the marks for at least twenty seconds. The note is session state
and reaches only the teacher's report. The group moves on when the next pen-holder writes (a
peer's scripted first stroke, or Sam's Next), not when every member has finished; a student who
lingers keeps their debrief and rejoins the live board on Next.

**Context.** The shared board loses the individual moment; the debrief restores it without
reintroducing a group-wide wait. The user asked that the marks stay in view for a forced
minimum and the note stay editable throughout.

**Alternatives considered.** Waiting for all four debriefs before the next problem (a wait at
every step, which the shared board was chosen to remove). Showing notes to the group (a
reflection becomes a performance). Marking only to the first mistake here (the detective phase is
over once the group has the correct working).

**Tradeoffs.** A lingering student can fall a problem behind the board; the next problem's board
is live when they rejoin. The hold is a fixed twenty seconds, not adaptive.

**Defence.** Two pure rules (the prompt and the pending debrief), three session actions with
their order enforced, and the group's own clock untouched.
## 2026-09-10 · The race is derived from timestamps; the lock and the medals are consequences, not flags

**Decision.** A group's progress during group review is its members' original mistakes on the
problems the group has resolved over all of their original mistakes on the union (`groupProgress`),
so a problem two members had wrong moves the bar twice as far as one only one had wrong. The
demo student's group is live from the whiteboard run; the other four groups follow a scripted
table (`data/race.ts`: seconds from the start at which each union problem checks correct), a pure
function of the clock. The leaderboard sorts by percent, then by the moment that percent was
reached, then by seating. A finished group's moment is its finish and nothing sorts above 100 %,
so the first home stays first and medals fall out of the ranks: gold, silver, bronze for the
first three at 100 %, nothing for fourth and fifth. The run gains `startedAt` (the race's clock)
and `resolvedAt` per problem (the tie-break); the store stamps `at` on the check actions.

**Context.** The ticket asked for a lock ("a group at 100 % locks its position") and for ties
to go to whoever got there first, on a board that any tab may open or reload mid-race, with a
teacher card and an iPad bar that must agree with it.

**Alternatives considered.** A `locked` / `medal` field written onto the group session when a
group finishes (the ticket's own sketch): a second source of truth that a reload or a fast-forward
in the demo could contradict, and the scripted groups have no session to write it on. A timeline
driven by `setInterval` ticks accumulated in component state: not reloadable, and three surfaces
would drift. Resolved counts as a fraction of the finish time with no table: nothing to tune per
group, and every group would move in lockstep.

**Tradeoffs.** The scripted rows are sized to the fixture's unions; if the teacher reseats
students the union changes and a row carries on at its last gap (or finishes early), which is
tuned only by reading the table. Sam's own check without a moment (an older screen) falls back to
the turn's start, so a tie against a scripted group in that window could resolve the wrong way;
the store's stamp makes that a non-case in this build. The reorder is a `transform` transition on
rows positioned by rank, which is simple and robust but means the rows are absolutely positioned
inside a fixed-height area, so the leaderboard is a full-screen surface, not a component that
flows.

**Defence.** One pure function (`standingsAt`) gives the board, the teacher and the iPad the same
picture from the same state and clock; the lock and the medals cannot disagree with the order
because they are the order; the demo's fast-forward is a one-field edit of `startedAt`; and the
whole race is tested against exact percentages and finishing times.

## 2026-09-10 · The warm-up's focus is the confidence answer; the chat's questions are derived, only the answers are stored

**Decision.** Drop the warm-up chooser page. The skills a student ticks under "not confident
with…" are the seed of the warm-up; the only screen between that answer and the pad is a chat
whose questions are a pure function of the seed (`concernPrompts`), one per skill in the order
ticked. The session stores the student's answers alone (`warmup.messages`, all `from: "student"`),
and the transcript is rebuilt from seed and answers on every render. The last answer moves the
stage to `practice` in the reducer; there is no "begin" button. On the pad, the sequence buttons
read a `done` list of problem ids rather than a position: "Next" opens the nearest skill not yet
done, wrapping, and the set opens only once every skill is done.

**Context.** The user asked to skip the picker page: the confidence screen already collects the
skills, and the page asked for them a second time as problems and words. They wanted to keep the
chat, with exact wording per skill ("Let's do a warm up on a, b, & c. First, tell me a little bit
about your concerns with a." … "Next, tell me about your concerns with b."), the warm-up starting
after the last skill is addressed, and the pad's skill chips as buttons that go dark blue as each
skill is worked through.

**Alternatives considered.** Storing tutor lines in the session as before (the transcript as data):
a scripted question would then be frozen at the moment it was generated, so a change of wording, or
of the seed on a reload of an older snapshot, would leave stale or mismatched lines; the transcript
already had to filter them. Keeping the `warmup-pick` stage name and swapping the screen: a stage
named for a picker that no longer exists, read by the teacher's before-hand-in lists and the URL.
A "start warm-up" button after the last answer: one more tap that changes nothing the student
decides. Keeping `step` as the only position with done = "before step": a tap back to an earlier
skill would have un-done every skill after it, and the strip would lie.

**Tradeoffs.** A student with nothing to say about a skill must still type something; there is no
skip on the chat (deferred, see FUTURE_FEATURES). An overall "confident" / "not confident" answer
has no seed, so the chat asks one open question and the warm-up is whatever the answer names, or
the default problem; that path is real but thin. The seed order is the tick order on the confidence
screen, so the first question is about whichever skill was ticked first, not the easiest. The
`done` list plus `step` is two fields where one index used to do; both are needed and both are
tested.

**Defence.** Every line the chat shows is reproducible from two small inputs, so the wording is
tested to the character and can change without migrating stored sessions; the reducer, not the
screen, decides when the warm-up starts, so a reload mid-chat resumes at the right question; and
the pad's buttons cannot disagree with what the student has done because they read the record of
it. The removed page took a component (`ProblemCard`'s selection) and two actions with it.

## 2026-09-10 · The smartboard takes the pen in whole-class review; it stays a reader of the same classroom actions

**Decision.** In whole-class review the board's working pane is a live pad, and the board's
header carries the students' screens frozen / write with me toggle. The board dispatches the
exact classroom actions the laptop does (`wc/stroke`, `wc/ink-undo`, `wc/ink-clear`, `wc/mode`)
into the one classroom store; nothing about how students or the laptop read the ink changes.
The board remains display-only in every other stage, and previous / next / marks / End stay on
the laptop.

**Context.** The teacher stands at the board while reviewing with the class. The pane on the
wall was a mirror of the laptop's pad, so writing meant walking back to the laptop, and so did
changing the students' mode. The user asked for drawing on the board to project to frozen
students, and for the mode toggle on the board.

**Alternatives considered.** A separate `boardInk` beside the laptop's, composed on read: two
arrays to undo and clear, and the laptop would show a mirror of the board's writing beside its
own pad, which is not what a teacher expects from "my working". Moving every control to the
board: the wall would then show "Show marks" and "End" to the class. Making the board the only
writer and the laptop the mirror: a teacher seated at the laptop (ticket 38's original case)
loses the pen.

**Tradeoffs.** Two surfaces append to one stroke list, so Undo on either removes the last stroke
regardless of which surface drew it (logged as a future feature). The board's doc comment and
`lib/board.ts` had promised "nothing on it is a control"; that promise is now scoped to the
stages outside whole-class review. `BoardContent` grows a `mode` field so the board can render
the pressed pill.

**Defence.** One store, one set of actions, one reducer: the board became an input surface by
adding four dispatch calls and no new state, so every existing test of the ink and the mode
covers the board's writing too, and the student's mirror cannot disagree with the wall.

## 2026-09-10 · A problem's outcome on the report is one of four, decided by the first stage that got it right, and only stages in the pathway count

**Decision.** `lib/report.ts` classifies every problem as `first`, `individual`, `group` or
`wrong` with a fixed precedence: right when handed in; else right after the student's own
rework, if individual review is in the pathway; else resolved by the group's rework, if group
review is in the pathway; else wrong. "Right" means at least one line and no wrong line, the
same rule as "every step held". The columns on the student's report are derived from the
pathway, so a stage the teacher did not set has no column, and an empty column still shows.

**Context.** The user asked for the "What happened" text to become tiles in four columns tied
to the assignment's settings, so a class without group review never sees a "correct after group
review" column. The data for the three stages lives in three places (the session's `lines` and
`rework`, the classroom's `GroupRun.resolved`), and each stage has its own notion of correct.

**Alternatives considered.** Deriving the outcome from the debrief's `functional` check
(`checkBoard`: no wrong line *and* the last line a known correct one): stricter, but it would
call a handed-in version with all-correct lines "incorrect" on the report while the feedback
screen said every step held. A per-stage record written by the reducer at each transition:
simpler to read but a third copy of the truth that the demo fixtures and stored sessions would
have to carry. Counting the group's success only when the student's own version matches the
group's line for line (the debrief's green rule): would leave most group-resolved problems
"incorrect" for the members who did not hold the pen, which is not what the column means.

**Tradeoffs.** A version that is all-correct but stops short of the answer counts as correct
(the "correct but dysfunctional" question, logged in `FUTURE_FEATURES.md`). The group column
credits the group's rework to every member, so a student who wrote nothing right sits in a green
column if their group got it; that is the column's stated meaning. Whole-class review has no
column because nothing per student is checked there.

**Defence.** The classification is one pure function over inputs that already exist, with the
precedence written once and tested per pathway; the screen renders whatever columns it is given,
so changing the rule for dysfunctional versions, or adding a fifth outcome, touches
`problemOutcome` and the label map and nothing else.

## 2026-09-10 · The app is the repo root; the Sept 7 mockup is deleted, not archived

**Decision.** Move everything in `curr_version/` up to the repo root with `git mv` and delete
`roughdraft_sept7/` outright. One `package.json`, one `README.md`, one `.gitignore`. The mockup's
own `decisions_log.md` and `ARCHITECTURE.md` are not copied anywhere; its last commit is
`e40040c`.

**Context.** The two-apps-in-one-repo layout was the transitional state chosen on 2026-09-08 so
the roughdraft's kit could be ported without extending it. Sixty tickets later the mockup had not
been opened since 8 Sep, every root script was a one-line `npm --prefix` delegation, every doc
path carried a `curr_version/` prefix, and each worktree had to `npm ci` one level down.

**Alternatives considered.** Keep the mockup in an `archive/` folder (still in the working tree,
still in every grep and every search-in-editor, for a thing git already keeps). Keep the
delegating root `package.json` with the app in a folder (the status quo; the extra level buys
nothing once there is one app). Move the app but carry the mockup's decision entries into this
log (they are product and pedagogy notes from a design that was replaced; anyone who wants them
can check out the commit).

**Tradeoffs.** Every branch cut before this commit conflicts on merge, so the three stale
worktrees are removed rather than rebased. Old tickets and notes that named the folder as a fact
now say "the app folder, since flattened" rather than being rewritten as if it never existed.
Recovering the mockup means a checkout of an old commit rather than a folder open.

**Defence.** The repo is one Next app and now looks like one: `npm ci`, `npm run dev` and every
path in every doc work from the root, worktrees are plain checkouts, and rename detection keeps
`git log --follow` intact for every moved file.

## 2026-09-11 · The help chat is the one live model call; the ways in are fixture data, the rules are the prompt

**Decision.** The "chat" option under "I need help" on the practice pad talks to a real model:
`POST /api/help-chat` (a Next route handler) streams `claude-opus-5` through the Anthropic SDK,
with the server-side refusal fallback on, and the pad reads plain-text chunks. The tutor's brief is
built server-side in `lib/helpChat.ts` from the problem id the pad sends: the problem, its skill, the
reference working, the pad's hint, the lines read so far, and a per-problem list of **ways in**
(`PracticeProblem.approaches`) written into `data/practice.ts` by hand. The rules that make it a
hint chat (never the answer or the next line; where two ways in exist, lay out two and ask which
makes more sense, then stay on that one; the smallest next nudge; two or three sentences) live in
the prompt text and are pinned by tests. The chat's lines are session state on the run
(`PracticeRun.chat`, per problem id) through the same reducer as everything else; the tutor's opener
is fixed app copy and is not stored. With no credentials on the server the route answers 503 and
the pad says the chat is not connected; nothing else in the demo depends on the network.

**Context.** Everything else in the demo is simulated from fixtures (recognition is scripted,
evaluation is a lookup table). The user asked for a chat "where the student can just talk in natural
language", hint-oriented, and for problems with several approaches "at least expose the student to
the 2 possible options at that stage & ask 'which hint makes more sense to you?' & then continue
down that path". A scripted chat cannot do the first; the second is the part most worth making
reliable.

**Alternatives considered.**
- *A scripted chat like the warm-up's concerns chat.* Keeps the demo offline, but the student's
  words would only be pattern-matched; "talk in natural language & resolve their issues" is exactly
  what a script cannot do.
- *Call the API from the browser.* No server code, but the key would ship to every iPad; the SDK
  refuses this by default for that reason.
- *Let the model invent the approaches every time.* Simpler data, but the choice of two ways is
  the feature; hand-written ways in per problem make it dependable and reviewable by a teacher, and
  the prompt still lets the model add ways it knows.
- *A first model turn when the chat opens.* Would let the tutor open with the two ways straight
  away, but costs a call per open and speaks before it knows what the student is stuck on. The fixed
  opener asks; the ways come in the first reply.
- *Structured output (a JSON of approaches, a chosen approach id).* Would let the pad render the two
  ways as buttons. Deferred to FUTURE_FEATURES: the user asked for a conversation, and buttons would
  turn "which makes more sense to you?" back into a menu.
- *A modal chat over the pad.* Blocks writing; the right column keeps the pad in reach and the
  tutor reads the lines anyway.

**Tradeoffs.** The demo now has one network dependency and one secret to configure (documented in
the README; `.env*` is gitignored). Replies cost money and take seconds; the pad streams so the
first words arrive quickly. The rules are prose in a prompt, so they are enforced by the model, not
by code; the tests pin the prompt's wording, not the model's behaviour, and the real conversation
was not exercised in this ticket (no credentials on the build machine). The problem is looked up
server-side from its id, so the route cannot be fed an arbitrary problem, but a student who edits
the request can still send any transcript; the brief keeps the tutor on the problem regardless.

**Defense.** The user's ask is a conversation, so a model is the right tool, and one narrow route
that receives an id and returns text is the smallest honest way to add it. Keeping the brief, the
ways in and the transcript mapping pure and tested means the tutor's rules are readable in one file
and change without touching the route or the UI. Storing the chat on the run through the reducer
gives reload, reopen and a future teacher's-eye view for free. Failing to a clear 503 keeps the
offline demo intact on any laptop without a key.

## 2026-09-11 · The warm-up is offered on the confidence screen, after the answer, as a callout beside the empty Submit spot

**Decision.** The start screen has one button, START. The confidence screen's button reads
"Submit" for every answer. "Confident" opens Q1. Either not-confident answer records the answer,
dims and locks the list, and a callout rises just above the spot Submit occupied: the tutor's
question naming the ticked skills, a line counting one short problem per skill, and "Warm up"
(accent) / "Start the set" (secondary). The spot itself is left empty. The recorded answer and the
open offer live in the session (`warmupOffered`), not in component state.

**Context.** Tickets 27 / 47 / 48 offered the warm-up on the start screen, before the student had
said how they felt, and the confidence button then announced the destination ("Warm up" / "Start
Q1"). The student the warm-up is for is the one who has just said they are not confident, and the
offer belongs at that moment. The user's brief: eliminate the start-screen warm-up; after a
not-confident answer, trigger the choice; keep it seamless and low-friction, but make the student
move to reach either button so nobody clicks through without a thought.

**Alternatives considered.**
- *A stage of its own (a screen between confidence and the chat).* Cleanest for stage lists and
  deep links, and one tap either way. Rejected by the user: the whole screen changing is what the
  student expects, and the choice should arrive where their attention already is.
- *A bottom sheet or modal over the confidence screen.* Draws the eye by force. Rejected as not
  seamless: a scrim interrupts, and the design brief across the app avoids modals for a one-line
  choice.
- *Submit turning into the two buttons in place.* Fewest taps, but the button changes under the
  finger, which is exactly the click-through the user wants to prevent, and it breaks "Submit does
  not say where you are going".
- *Two buttons in Submit's row, to its left.* Same row as the habit's next tap. The callout above
  the empty spot is close but off the line.
- *Local component state for "answered, choosing".* Simpler, but a reload would show the empty
  form again and the teacher's mirror would not see the answer. The session already holds the
  confidence answer; adding the not-yet-chosen state to it costs one derived predicate.

**Tradeoffs.** The confidence screen now carries two states and the reducer a guard
(`confidence/set` is ignored once answered; the offer actions only while it is open), which is more
than a stage transition. The callout floats over the dimmed list and hides its last rows on a
two-skill answer. The list cannot be un-submitted (FUTURE_FEATURES). The pulse and dim are motion
and opacity, so a screen reader hears only the new group's label; the group has `role="group"`
and an `aria-label`.

**Defense.** The offer arrives at the moment the student has given the reason for it, in the
tutor's voice the chat continues, and it costs a confident student nothing. Keeping the student
on the same screen means the answer they just gave is still in view, dimmed, so the offer reads as
a consequence of it. Leaving Submit's spot empty makes the choice a deliberate reach without
adding a confirmation. Holding the state in the session keeps reload, the teacher's mirror and the
demo fixtures honest for free, and `warmupOffered` is a one-line predicate the tests pin.

## 2026-09-11 · The chat's rhythm is played by the screen from pure steps; the session records only answers and the "begin"

**Decision.** The tutor's turns are derived lists of bubbles (`concernTurns`), and how a turn plays
(bubble, beat, dots, bubble) is a pure function of its bubble count (`turnSteps`). The screen runs
timers over those steps for the one turn after the last answer and derives "your turn" from the
step reached; the box is disabled until then. The session stores only the student's answers plus
one new action, `warmup/begin`, sent by the screen after the closing bubble. Timers and the step
reached are component state, keyed on the answer count.

**Context.** The user wants the opening in two bubbles a second apart, the typing dots between
bubbles, an unmistakable off/on state on the box, and a closing line before the pad. The
session-mirrors-everything rule (ticket 05) raised the question of whether the playback position
belongs in the session.

**Alternatives considered.**
- *Playback position in the session (a `bubblesShown` counter advanced by timed actions).* Would
  let the teacher's mirror see the dots. Rejected: it writes a dozen actions per turn into a store
  that is persisted and broadcast, for a cue nobody but the student needs; a reload replaying the
  current turn from its start is the better behaviour anyway.
- *Storing the tutor's bubbles as messages.* Would make the transcript a plain list. Rejected in
  ticket 48 already: the wording is derived so it can change without migrating stored runs.
- *The reducer opening the pad on the last answer, the closing bubble shown on the pad.* Keeps
  the reducer as it was, but the closing line belongs in the chat, and the pad would need its own
  timer. One explicit `warmup/begin` after the bubble is simpler and testable.
- *Send button only (the help chat's convention).* Rejected by the user: the whole box must read
  as off while the student should be reading.

**Tradeoffs.** Two conventions now coexist (the help chat keeps its box open while a reply streams;
noted in FUTURE_FEATURES). The reducer has one more action and one more guard. The timings are
constants, untuned. A keystroke while the box is off is lost.

**Defense.** Everything that decides what is said and when is pure and unit-tested (`concernTurns`,
`turnSteps`, `closingLine`, the reducer's guards); the screen only schedules and renders. The session
keeps recording exactly what it did (answers) and learns one honest fact (the chat is over), so the
teacher's mirror, reload and the demo fixtures are unchanged. The "your move" pulse reuses the
offer's, so the flow teaches one cue.

## 2026-09-11 · The demo's Q7 rework is a second, different slip, and the group's correct version is the model solution

**Decision.** `RECOGNITION_REWORK.q7` is no longer the corrected path but a new wrong one: every
term scaled by 3 (fixing the first slip, which scaled two of three), then the third never put back.
The evaluation table carries the new first line as a fractions slip. The group script's second Q7
attempt reads the model solution directly rather than the rework constant, so Liam still resolves
the problem.

**Context.** The scripted rework fixed all five slipped problems, so nothing of Sam's reached the
group column on the report, the Q7 debrief always asked about peers' mistakes, and the stuck reveal
never showed a reworked version that was still wrong. The user wants to see the struggle the group
review is for.

**Alternatives considered.**
- *Leave Q7 with no rework at all.* Simplest, and the report test already simulated it. Rejected:
  a student who skips a problem in the rework is a different story from one who tries again and
  slips again, and the debrief and reveal would show one own version, not two.
- *Rework Q7 with the same slip again.* Shows persistence, not struggle; the two panes would be
  identical and the "Reworked" label would add nothing.
- *Slip on a second problem too (Q2 or Q10).* Makes the notice plural and fills the group column
  with two. Deferred (FUTURE_FEATURES): one is enough to see every screen change.
- *Script "we're stuck" on Liam's Q7 turn.* Would put the reveal in front of a presenter who only
  watches. Left as the student's own press so Q3 stays the one scripted stuck.

**Tradeoffs.** `RECOGNITION_REWORK` now means "what the rework reads" rather than "the corrected
path", so its doc comment carries the exception and anything wanting Q7's correct lines must read
the model solution. Five tests changed expectations; the post-rework sentence in the demo is no
longer "Every problem holds now.", which was the nicer line to end the individual review on.

**Defense.** The whole change is data: no screen or rule moved, which is the test that the group
review, debrief, report and history were already reading the outcomes honestly. The second slip is
the natural next mistake after the first (the student fixes the scaling and forgets to undo it),
so the two versions read as one student learning, and the group's Q7 is now the one place in the
demo where a student meets their own still-wrong work beside a right one.

## 2026-09-11 · A hint term names a repeated piece of the problem by scope, not by count

**Decision.** A `HintTerm`'s TeX fragments are `TexFragment = string | { tex, within }`. The string
form is unchanged (first whole occurrence). The object form is the first whole occurrence of `tex`
inside the first occurrence of `within`: `{ tex: "2", within: "\dfrac{9}{2}" }` is the 2 under the 9
even though two 2s come before it. `termTex` resolves every fragment to a `[at, end)` span first and
wraps by position; two terms that resolve to the same span share one box.

**Context.** The fractions warm-up writes 2 twice as a denominator; "denominators" could light only
the first, and the user asked for all three (ticket 77).

**Alternatives considered.**
- *An occurrence index* (`{ tex: "2", nth: 2 }`). Shortest to write, but it counts occurrences the
  reader has to count too, and a later edit to the TeX silently moves it to a different 2.
- *Every occurrence* (`{ tex: "2", all: true }`). Right for this problem, wrong in general: "2" in
  `2x + 2` would light the coefficient with the constant, and nothing in the data would say which
  was meant.
- *A regex or TeX-position literal.* Precise and unreadable; the data is hand-written by teachers.

**Tradeoffs.** One more shape in the fixture data, and `termTex` now works on positions rather than
re-finding strings, which is a rewrite of a function that was working. A scope has to be a fragment
the problem writes, so a piece that repeats inside identical scopes (two `\dfrac{x}{2}`) still
cannot be told apart; nothing in the set needs that.

**Defense.** The scope reads like the hint's own `within` on the phrase side ("a" inside "4ac"), so
the two halves of a `HintTerm` now use one idea. A scoped fragment says which piece it means in the
problem's own notation, survives edits elsewhere in the line, and resolves to -1 (left alone) rather
than a wrong piece when its scope is gone.

## 2026-09-11 · A problem's hints are an ordered list given one per ask, and the session keeps only the count

**Decision.** `PracticeProblem.hints: Hint[]` (each `{ text, terms? }`) replaces the single `hint` and
`hintTerms`. A run stores `hinted[problemId] = n`, the number shown; "hint" on the help menu shows
hint `n + 1` and is a no-op at the end. The shown hints stack under the problem and the problem
wraps the terms of all of them together.

**Context.** The user wants the fractions warm-up to teach like terms first (move the 6) and a
shared denominator second, and asked for "multiple hints" generally (ticket 78).

**Alternatives considered.**
- *Keep one hint and make it longer.* Two moves in one sentence is the prescriptive hint the user
  dislikes; the point of a second ask is that the student chose to hear more.
- *Store which hints were shown as a set of indices.* Allows skipping, which nothing offers; the
  count is the whole state and hydrates from the old id list trivially (each id → 1).
- *Replace the first card with the second.* Loses the first hint just when the second builds on it;
  the column has room and both stay hoverable.
- *A tree keyed on the student's lines* (the user's later question). The right long-term shape, but
  it needs a reader of the lines that today only the help chat has; the ordered list is the fallback
  such a tree would need anyway. Logged in FUTURE_FEATURES.

**Tradeoffs.** Every fixture changed shape (a one-off script did the migration; the terms moved
inside the hint object). Wrapping all shown hints' terms at once means a second hint can add boxes
inside pieces the first already boxed; the spacing test covers the union, and lighting still moves
nothing. Labels "Hint 1 / Hint 2" imply a fixed sequence, which a conditional hint would break.

**Defense.** One field, one count, one reducer case: the menu, the cards, the chat brief and the
hydration all read the same list in the same order, and "how many has this student asked for" is
now a number the teacher's side could show. The pedagogy the user asked for (move first, then a
denominator only for the terms being combined) is expressed purely as data, with the worked example
following the same path.


## 2026-09-11 · A warm-up's scripted lines are one step each, and two cases are always an "or" line

**Decision.** Every step in the warm-up bank (`data/practice.ts`) is one row of working: one
equation, one chain of equalities, or one point. A step with two cases is written as `A
\;\text{or}\; B` with nothing in front of it, so the read-back and the worked example card both
show the two boxes side by side. A test over the whole bank and every follow-up enforces it (any
"or" branches in two, no "⇒ … = … = …" chain, no `\quad`). The card learned the branch layout;
`lib/branches.ts` and its rule ("an or behind a ⇒ stays whole") did not change.

**Context.** The graph-features warm-up read back `(x − 4)(x + 2) = 0 ⇒ x = 4 or x = −2` as one
row, which neither split into steps nor branched, and the user asked that every warm-up problem
read one step per row with two solutions side by side (ticket 79). The sketch, monic, follow-up and
non-monic problems had the same shape on other lines.

**Alternatives considered.**
- *Change the read-back rule so an "or" behind a "⇒" splits too.* Would have branched the row
  without splitting it; the factorisation would have sat inside the left box. The row was two
  steps mushed, so the fix belongs in the data.
- *Keep the pair check as one row ("3 × 4 = 12, 3 + 4 = 7").* It is one thought, and the set's
  Q7 still writes it that way. Rejected for the warm-up: the user's rule is one step per row, and
  the guard is simpler with no `\quad` at all. The set's rows are keyed into the evaluation table,
  the classmates' scripts and the group review, so they stay (FUTURE_FEATURES).
- *Leave the worked example card inline ("x = 4 or x = −2").* The card and the read-back would then
  show the same step two ways. The card now boxes the cases too.

**Tradeoffs.** Longer scripts: graph features is six bursts instead of three, sketch seven, the
default warm-up five; a student writing the warm-up draws more bursts before the pad is "done".
The session tests that step through the example count from the data instead of a literal. The
guard forbids `\quad` in any warm-up step, so a future step that wants two facts on one line must
argue with the test.

**Defense.** A row per step is what the pad's whole reading of the student depends on (each burst
is one line, each line is one evaluation key), so a fixture that packs two steps into one row is
the pad reading two things it cannot tell apart. Putting the rule in a test over the bank means the
next problem written follows it without anyone remembering the screenshot.
## 2026-09-11 · A hint is chosen by where the student's lines have got, by rule, with the ordered list as the fallback

**Decision.** `Hint.at?: number[]` says how many lines of the reference working the student has
written when the hint fits (`[0]` a blank pad). `pickHint` finds the position from the last line the
pad placed and gives, in order of preference: an unshown hint for that position; an unshown general
hint (no `at`); the first unshown hint for a later position; nothing. A hint for a position already
passed is never offered. The session keeps the indices shown, in the order shown, so the cards and
their labels follow the order the student received them.

**Context.** The user asked for hints that read the student's work instead of a prescriptive list
(ticket 80). The pad's recognition is scripted (each burst reveals the next line of the reference
working), so the lines are always a prefix of the steps and the position is exact.

**Alternatives considered.**
- *A predicate per hint* (`when: (lines) => boolean`). Most general, and the only option that
  would survive a real recogniser producing lines the script did not write. Rejected for now:
  fixtures become code a teacher cannot write, and there is no recogniser to justify it.
- *Attach each hint to the step it follows* (`steps[k].hint`). Reads well, but a hint that fits two
  points (the denominator hint after line 1 or 2) would be duplicated, and the opening hint has no
  step to live on.
- *A model-written hint from the help chat's brief.* The product answer; deferred to a ticket of
  its own so the mockup works offline and deterministically. The list built here is the fallback
  that version would need.
- *Fall back to the nearest earlier hint when nothing fits here.* Rejected: a hint about a move the
  student has already made is the prescriptive hint the user dislikes; falling forward is at least
  about what comes next, and "None for this step" is honest when nothing does.

**Tradeoffs.** `at` counts lines, which is only as meaningful as the recogniser: with real ink,
`positionOf` matches the last line to a step and otherwise trusts the count, so a wrong line puts the
student "at" its position. The five fractions hints are hand-written for one path; a student on a
different valid path (clearing every denominator first) gets hints for a path they are not on.
Every problem but fractions still has one general hint, so nothing changes there.

**Defense.** The whole mechanism is one pure function with a five-line preference order, unit-tested
on every branch and driven end to end with pen strokes. It gives a real-feeling "read my work" on the
mockup with no model call, keeps the chat brief honest about which hint fits where, and leaves a
clean seam (the same `pickHint` signature) for a version that reads the lines more deeply.

## 2026-09-11 · A hint's linked words point at the student's line it is for, derived from the lines, not stored

**Decision.** `hintAnchor(hint, lineCount)` decides what a hint's linked words point at: the problem
statement (0) for a blank-pad hint, a general hint, or one given ahead of its point; otherwise the
latest of the hint's `at` lines the student has written (k). The problem wraps only the terms
anchored to it and each read-as line wraps only the terms anchored to it; the fixture writes a hint's
fragments against the line it is for. The anchor is computed from the current lines on every render,
never saved in the session.

**Context.** Four hints in, "4" and "other side" lit pieces of the original problem the student had
rewritten three lines ago (ticket 82). The user: reference the student's work, in the read-as column.

**Alternatives considered.**
- *Keep lighting the problem statement.* What the user rejected: after the first move the problem is
  no longer what the student is looking at.
- *Store the anchor line with the shown hint* (`hinted[id] = [{ hint, at }]`). Exact, and survives
  an undo; but then a hint can point at a line that no longer exists, and the session's `hinted`
  would change shape a third time in a day. Deriving it means a hint always points at something on
  the screen.
- *Write the student's line into the hint text.* Reads on its own, but the hint would have to be
  written per line, and the pad already shows the line; the eyebrow's "your line 4" is the text
  reference, the lit fragment the pointer.

**Tradeoffs.** A hint whose lines are all undone falls back to the problem, where its fragments may
not resolve, so its words light nothing (logged). Fragments are written against the reference
working's TeX, which is exactly the student's line only while recognition is scripted. `ReadAs`
gains two props for one caller.

**Defense.** The rule is four lines of pure code with tests, and every hint's fragments are checked
against the TeX they point at by the fixture test, so a hint that points at nothing cannot ship.
The first hint still lights the problem, the later ones light the student's own line, and the tint
on that line makes the far column findable. The fraction fix is one CSS declaration: an inline box
paints a line's height, an inline-block paints its content.


## 2026-09-11 · The chat's tutor lines carry their emphasis as `**…**` in the string

**Decision.** `concernTurns` keeps returning plain strings, with the skill's name wrapped in `**…**`
where the bubble is about one skill; `emphasis(text)` splits a tutor line into plain and bold runs
and the screen renders the bold runs as `<strong>`. Student lines are never split. The later
skills are asked by `howAbout(word)`: "How about the **null factor law**?" for a named rule (a word
ending in law, rule, identity, formula or distribution, or already starting with "the"), "How about
with **fractions**?" for everything else.

**Context.** Ticket 84: the user wants the skill under discussion bold in each ask so the student
sees which skill the question is about, and the second and third asks reworded to "How about with
fractions?" / "How about the null factor law?", two shapes that depend on the skill's name.

**Alternatives considered.**
- *A structured bubble type* (`{ text, skill }` or a list of runs) from `concernTurns`. Typed, no
  parsing; but `concernTranscript` builds `ChatMessage`s (whose `text` is a string) from the same
  turns, the tests read as prose, and every consumer would carry the shape for one bold word.
- *One follow-up shape for every skill* ("How about fractions?" / "How about null factor law?").
  Uniform, but the user wrote two shapes and "How about null factor law?" reads wrong without its
  article; "How about with the null factor law?" reads wrong with the preposition.
- *A per-skill phrasing in the taxonomy* (each leaf declares how it is asked about). Exact, but
  forty entries to write for two shapes a short suffix rule separates.

**Tradeoffs.** `**` is a convention the rest of the app does not use; a student who types `**x**`
sees it as typed because only tutor lines are split. The suffix rule is a heuristic: a future skill
name that is a thing without one of those suffixes gets "How about with …?", and the fix is one
more word in the regex, pinned by a test.

**Defense.** The string convention keeps the chat's script readable as sentences in the code and the
tests, keeps `ChatMessage` a string, and costs one four-line splitter. The rule is pure, tested over
every shape in the taxonomy that matters today, and lives beside the script it serves.

## 2026-09-11 · A warm-up's hints cover every point in its working, each readable ahead of its point, and the last one is spelt out

**Decision.** Every point in a warm-up's reference working gets a hint of its own (`at: [k]`), the
factorising warm-up included: five hints for five lines, the follow-up four. Two rules for writing
them: (1) a hint reads on its own ahead of its point ("Once you have a pair that multiplies to
12, …"), because `pickHint` falls forward to the next hint when the one for here is spent; (2) the
hint for the last point before the answer spells the move out (x + 3 = 0 and x + 4 = 0), since it is
also the second hint a student stuck at the brackets receives. A linked phrase is written once and
paraphrased elsewhere ("0" boxed once, "zero" after), since every whole-word occurrence is boxed.

**Context.** The factorising warm-up had one hint (ticket 30's), about finding the pair; a student
with (x + 3)(x + 4) = 0 on the pad and no idea what to do next got "another hint · Shown" (ticket 85).
The user: "even once the student has figured out (x+4)(x+3), they might get stuck there".

**Alternatives considered.**
- *One hint spanning the brackets and the check (`at: [3, 4]`).* One fewer hint, but the fixture
  test requires a hint's fragments to locate in every line it names, and the check line has no
  brackets; and a student stuck at the brackets would get one hint then "None for this step".
- *Add only the null-factor-law hint.* Covers the case in the screenshot, but leaves a student stuck
  after the pair ("do these add to 7?") or the sum ("where do the numbers go?") with nothing, and
  the fractions warm-up already set the one-hint-per-point shape.
- *Let the pad's hint fallback reword an ahead-of-point hint.* Machinery for a wording problem;
  writing the hint so it stands alone costs nothing.

**Tradeoffs.** A blank-pad student who asks five times is walked through the whole method one hint at
a time, which is what "another hint" promises but is more than before. The spelt-out hint has no
linked words: it is written for after the check and offered ahead of it, where its fragments would
point at nothing. The hint texts name the fixture's numbers, so they are per problem, not per skill.

**Defense.** No code changed: `pickHint` and `hintAnchor` already do the work, and the fixture tests
(fragments locate, spacing unchanged, `at` lists) hold every hint to the same standard. The rules are
recorded here so the next warm-up's hints are written the same way.

## 2026-09-11 · A hint not yet acted on blocks the next: "another hint" opens the chat on it, with the pad's own tutor line stored in the transcript

**Decision.** `stalledHint`: the latest hint shown is stalled while the student's lines have not moved
past every point it is written for (`positionOf(lines) <= max(hint.at)`); a general hint never stalls.
While stalled, the help menu's hint row reads "Talk it through →" and opens the chat instead of
giving a hint, and the reducer refuses `run/hint` too. The tutor's first line is scripted by the pad
("Let's talk more about hint 2 before another one. What is it asking you to do here, in your own
words?") and stored as a tutor message in `run.chat`; the brief names whatever the chat actually
opened with and carries a rule for a pad-said hint line. Two same-side lines in a row are folded into
one API turn.

**Context.** Ticket 85 gave the factorising warm-up a hint per point, and with it a blank-pad student
could tap "another hint" five times and be walked through the method without writing a line. The user
(ticket 86): open the chat instead, the agent starts it with "let's talk more about hint X", so the
student either applies the hint or works on understanding it.

**Alternatives considered.**
- *Store the position each hint was given at* and stall while it is unchanged. Exact, but a third
  shape for `hinted` in a day, and "unchanged position" is the wrong test: a hint for lines 1 or 2
  is not acted on by writing line 2. "Past every point the hint is for" needs nothing stored.
- *Let the model write the opening line* (a first API turn with no student message). A better
  sentence, perhaps, but a network round trip before the chat can show anything, a 503 on a device
  with no credentials, and a stored line that differs per run. The pad's fixed sentence is on screen
  instantly and identical everywhere; the model takes over from the student's reply.
- *Keep the opener unstored, like "What's got you stuck?"*, and send a flag with the request. The
  flag would have to be stored anyway to survive a reload and a reopen; storing the line itself is
  the same persistence and also the transcript the student sees.
- *Hide the hint row while stalled, or leave it "Show →" and surprise the student with the chat.* The
  row is what the student reaches for; keeping it, relabelled, is honest about what the tap does.

**Tradeoffs.** A student who writes a wrong line has "moved on" (an unplaced line counts by position)
and gets the next hint; only the chat can tell them the line is wrong. A hint's `at` now carries a
second meaning (where it fits, and what counts as acting on it); the two agree for every hint written
so far. The brief's opener rule depends on the fixed sentence's opening words. `helpChatSystem` has a
third parameter for one caller.

**Defense.** The rule is one function on data the pad already has, enforced in the reducer as well
as the menu, and the pad's tutor line is ordinary chat state, so a reload, a reopen and the API all
see the same transcript. Tests pin the stall on the two warm-ups with per-point hints, the reducer's
refusal, the brief's opener and rule, and the folded turns; the browser check confirms the bubble
appears once and the request carries it.

## 2026-09-11 · The skill in a chat ask is a light blue box, in the standout blue

**Decision.** The skill a tutor bubble is about renders in a rounded box (`bg-standout-soft`,
`border-standout-line`, `text-standout`) at the bubble's normal weight, instead of bold (ticket 89
replacing ticket 84's rendering). The `**…**` mark in the script stays; only what the mark means on
screen changed, so `emphasis` became `skillRuns` and its runs say `skill`, not `bold`.

**Context.** The user, on seeing the bold: "unbold them. put each skill in a light blue box."

**Alternatives considered.**
- *The accent's soft tint* (`accent-soft`, lavender). The app's usual chip colour, but it reads as
  indigo, not blue, and the user said blue.
- *A new light-blue token.* The palette already has one blue, the standout mark's, with a soft fill
  and a line colour; a second blue for one chip would be a palette decision the user did not ask for.
- *Keep bold as well.* The user said unbold; the box alone carries the signal.

**Tradeoffs.** The standout blue also marks a curated correct step on the pad and the board; a
student who has seen both may read the chip as a mark. The chat has no marks, so the two never
share a screen.

**Defense.** One class string on one span, tokens the app already ships, and the script untouched:
the wording tests from ticket 84 still pin every sentence.

## 2026-09-11 · The skill box's text is ink, the box is fill and edge only

**Decision.** The chat's skill box (ticket 89) keeps `bg-standout-soft` and `border-standout-line`
but its text is `text-ink`, the bubble's own colour, not `text-standout` (ticket 91).

**Context.** The user: "have the actual text be black to make reading the line more seamless."

**Alternatives considered.**
- *Blue text, as shipped in 89.* Read as a chip, which broke the sentence into two colours.
- *Ink text and a stronger fill* to keep the box visible without the blue text. The soft fill and
  the line already outline the word; a darker fill would fight the ink.

**Tradeoffs.** The box is now the only cue, and at the bubble's size it is a subtle one; the point is
that the sentence reads first and the box second, which is what was asked.

**Defense.** One utility class swapped on one span; the box tokens still come from the palette.

## 2026-09-11 · The worked example is maths alone, and the chat beside it may explain the steps on screen

**Decision.** A worked example step is the maths only, set in display mode at the problem's size and
centred under it; the caption that named the move is gone from every worked example (the one playing
in place of the pad and the compact one beside the follow-up). While the example plays, the pad's
right column is the help chat headed "Question about a step?", not the read-as column, with its own
opener ("Which step, and what about it?") and no close. Each chat turn sent from there carries
`shown`, the number of steps on screen, and the tutor's brief marks each step "(on screen)" or "(not
yet shown)": a step on screen may be explained in full, hints-only holds for the rest. The step
`label` stays on the data, since the brief still reads it.

**Context.** The user (2026-09-11): delete the captions, make every step the same size and aligned,
put a chat headed "question about a step?" to the right, drop the read-as column while in the example,
and delete "Guess the next step before you show it". The captions had made each step a two-column
row with inline-sized maths, so a step with fractions was smaller than the problem and the column
did not line up; the read-as was an empty box while nothing was being written.

**Alternatives considered.**
- *Keep the captions in a tooltip or on tap.* The user asked for them gone; the chat is now where
  "what does this step do?" is answered, in the student's own words and at the student's own pace.
- *Align the steps on their equals signs (one KaTeX `aligned` block).* The proper typeset column, but
  one block cannot reveal a step at a time, box a two-case step, or take a per-step hover later;
  centring each display-mode step under the centred problem gives one axis for the same eye.
- *Leave the chat's brief as it is (the working "for your eyes only").* The tutor would refuse to
  discuss a step the student can see, which is the one thing this chat is for. Sending `shown` is
  the smallest honest signal: the tutor knows exactly what is on the screen and nothing more.
- *Store the example opener like the hint opener (ticket 86).* Nothing about it is per problem, so
  it is a fixed line like "What's got you stuck?", derived from the mode, never stored.

**Tradeoffs.** The chat now has two openers and two briefs, chosen by a flag; a transcript begun on
the pad continues beside the example with the pad's opener already stored, which is right (the
transcript is the student's) but means the opener bubble does not change with the heading. The
brief's freedom to explain a shown step is a rule the model is briefed on, not enforced server-side,
like the rest of the brief. The captions are lost as on-screen text for a student who never asks.

**Defense.** One prop on `HelpChat` and one optional field on the request, validated like the rest;
the brief's example variant is pinned by tests alongside a test that the pad brief is unchanged. The
card is simpler than before (one branch fewer, no width for a caption), and the browser check
measures every step and the problem at one size on one axis.

## 2026-09-11 · The help chat shares the right column with the read-as lines rather than replacing them

**Decision.** While the chat is open, the read-as column stays at the top of the pad's right column,
capped at 45% of it (its own list scrolls), and the chat takes the rest below a "Chat · close" strip.
The bubbles gather at the foot of the chat, directly above the box to write in, and grow upwards.

**Context.** Since ticket 69 the chat replaced the read-as column while open. Ticket 86 opens the
chat on a hint that points at the student's own line, which the chat then hid. The user (ticket 92):
keep the student's transcribed work in view; put the chat lower, right above the message box.

**Alternatives considered.**
- *Chat as a floating panel over the pad* or a fourth column. Keeps every line visible, but covers
  the ink or squeezes the pad the student is writing on; the right column is the help column already.
- *Collapse the read-as list to its last line while chatting.* Loses exactly the lines a hint's
  linked words point at.
- *Split the column half and half.* Wastes the chat's room when there is one line and the read-as
  room when there are many; a cap that yields to few lines and holds against many does both.

**Tradeoffs.** A long read-as list scrolls behind a hard edge while the chat is open, and a lit line
may be scrolled out of view (logged). The chat has less height than before, so a longer conversation
scrolls sooner.

**Defense.** Two layout changes, no logic: `ReadAs` swaps `flex-1` for a cap, `HelpChat` takes a
class and anchors its list to the bottom with an empty first item. The browser check shows the one
line still in place with the chat open, the bubble against the box, and five lines capped and
scrolling; a hint word still lights the line above the chat.

## 2026-09-11 · Left-aligned display maths is an unlayered rule, not a utility

**Decision.** The worked example card is left-justified by a `math-left` class whose rules live
unlayered in `app/globals.css` (`.math-left .katex-display` and `.math-left .katex-display > .katex`
are `text-align: left`), beside the existing KaTeX overrides. The card's flex rows (the two-case
boxes, the reveal button) simply drop `justify-center`.

**Context.** The user asked for the example "all left justified". KaTeX centres display maths with
two rules of its own, on the display wrapper and on the `.katex` block inside it, in an unlayered
stylesheet.

**Alternatives considered.**
- *A Tailwind arbitrary variant on the wrapper (`[&_.katex-display]:text-left`).* Generated into the
  utilities layer, which any unlayered rule beats regardless of specificity; it would not take.
- *Render the steps inline (`display={false}`) and left-align the line.* Loses display-mode
  fraction sizing, which ticket 90 chose for the one-size column.
- *A `text-align` on `.katex-display` only.* Tried first; it moves nothing, since the `.katex`
  block inside is full-width and centres its own content. The glyph measurement caught it.

**Tradeoffs.** One more global class to know about; it sits with the other KaTeX overrides so the
next person finds it. Nothing else opts in yet.

**Defense.** Two selectors, one place, and the browser check measures the first glyph of the
problem and of every step on the card's content edge, in both sizes of the card.

## 2026-09-11 · A wrapped hint fragment gets a thin space beside a flush glyph, at rest as well as lit

**Decision.** `termTex` writes `\,` between a wrapped fragment and a glyph typeset flush against
it (a letter, digit or bracket on either side, not a command name), whether or not the fragment is
lit. The box's sides (`.hint-term` padding, 0.12em) stay inside that space, so the lit box never
covers the neighbour; the same-colour 2px ring is folded into the padding.

**Context.** The user's screenshot of the monic warm-up: the lit 7 of 7x had the x a third inside
its box. Ticket 30 set the rule that lighting changes colour only, never the layout, and the
sweeps in `lib/hint.test.ts` hold every warm-up to it; ticket 88 already writes a permanent
`\kern0.7em` between two wrapped fragments that abut.

**Alternatives considered.**
- *Add the gap only while lit.* Keeps the resting problem exactly as typeset, but the x jumps
  right when the word is hovered and back when it leaves, the very flicker ticket 30 ruled out.
- *Shrink the box to the glyph.* No padding at the sides, the box hugs the 7: no overlap, but the
  12, the fractions and the factors lose the air that makes the box read as a box.
- *Paint the box under the neighbour (z-order).* The x would sit in ink over blue; still an overlap
  to the eye.
- *An exact kern (`0.1em` plus `2px`).* Two kerns per side or a px unit in TeX; the thin space is
  one token, idiomatic, and within 1px of exact once the ring is padding in em.

**Tradeoffs.** A hinted problem shows "7 x" with a thin space at rest, where an unhinted one shows
"7x". Noticeable to a typesetter, not to a student; the gap is the same one TeX authors write by
hand between a coefficient and a function. The box's total size changes by well under a pixel at
either text size.

**Defense.** One rule in one function, named (`GLUE`), tested on both sides and for the cases that
get no gap, with the layout sweeps still holding lit against rest for every warm-up and read line;
the browser measurement shows 1px of air before the x.

## 2026-09-11 · The lit hint box has no side padding; the problem's TeX gets no extra spacing

**Decision.** Reverses the entry above. `termTex` writes nothing between a wrapped fragment and a
glyph flush against it; the only gap it ever writes is the one between two wrapped fragments that
abut (ticket 88). The box instead has no side padding (`.hint-term` `padding: 0.2em 0`), so its
edge is the fragment's own edge and it cannot reach the x.

**Context.** The user, on the thin space: "too big of a gap; problematic for idea that 7x is 'one
term' … go back to the og 7x spacing & just make the blue box not as wide". The coefficient and
the variable are one term in the maths the hint is teaching; a gap between them, however thin,
says otherwise.

**Alternatives considered.**
- *A thin space (ticket 96).* Kept the box's side air; rejected by the user for splitting the term.
- *Side padding only where no glyph is flush.* Two box shapes for one class of thing; the box
  would be wider round the 12 than round the 7 for no reason a student could see.
- *Air on the left side only.* The "+" before the 7 leaves room; the box would be lopsided.

**Tradeoffs.** A glyph with no right bearing (Computer Modern's 7) touches the box's edge; a glyph
with bearings (1, 2, 0) sits with a little air. The box is the fragment's width, so it reads as a
highlight of exactly that fragment, which is what it is.

**Defense.** The TeX the problem renders is untouched; the fix is one CSS value. The browser
measurement shows the box's right edge on the x's cell edge and the layout sweeps compare lit
against rest for every warm-up.

## 2026-09-11 · The lit hint box fits its surroundings per axis; `termTex` never changes the TeX's spacing

**Decision.** The hint machinery wraps fragments and nothing else: no kern, no thin space, no
gap of any kind is written into a problem's or a read line's TeX. The box adapts instead, per
axis, from what the TeX shows is beside the fragment: it has side air unless a glyph, a
superscript or another wrapped fragment is typeset flush against it (`hint-term-tight-x`), and
air above and below unless the fragment is a numerator or denominator, which sit against the
fraction bar (`hint-term-tight-y`). Two fragments that abut are wrapped flush, the second clipped
1px on its left so two lit boxes read as two (`hint-term-abut`). Reverses ticket 88's `\kern0.7em`
and ticket 97's all-boxes-narrow rule.

**Context.** Two corrections in one evening. The null factor law warm-up at rest showed a wide
gap between the factors: ticket 97 had removed the thin space for 7x on the principle that the
maths keeps its own spacing, then left ticket 88's kern in place as a future item. Then a
read-as line showed the lit denominators' boxes, tall and narrow, running up into the fraction
bar: ticket 97's fix had taken the side air off every box and left the tall top and bottom on
every box. The user: "we're going back & forth & making rules that are too general that then
fuck something else up".

**Alternatives considered.**
- *One box shape for every fragment.* Tickets 83, 96 and 97 each tried one; each fitted the case
  in the screenshot and broke a neighbour. A single shape cannot both clear the x of 7x and give
  the 12 air.
- *A smaller kern between the factors (0.5em), or a gap only while lit.* Still spacing added to
  the maths, or factors that slide on hover; ticket 30's rule that lighting moves nothing stands.
- *Let the two factor boxes merge.* One block reads as "the product"; the hint says "factors".
- *Detect neighbours from the rendered DOM instead of the TeX.* Would need a layout pass after
  KaTeX renders and a re-render; the TeX already says what is beside a fragment, and the same
  code runs on the server.

**Tradeoffs.** The classes are one more thing on the wrapped span, but they are decided where the
fragment is located and used in three CSS rules. "Flush" is a fixed list (letters, digits,
brackets, scripts; fraction bars); a construct outside it (a radical, a matrix) gets the default
air until a case is added. A hairline is faint at 1× on a low-density screen.

**Defense.** The TeX rendered is exactly the TeX in `data/practice.ts` for every problem and read
line, asserted by the layout sweeps in `lib/hint.test.ts` with no exemptions; the classes are
tested per case; and the browser sweep writes every line of every warm-up on offer, opens every
hint, hovers every word, and finds no lit box touching a glyph or fraction bar outside it and no
glyph moving between plain, wrapped and lit.

## 2026-09-11 · The chat on a hint is reached from the hint itself; the help menu names its four options and nothing else

**Decision.** The latest hint card carries a "Talk it through" pill that opens the help chat on
that hint with the pad's stored opener (ticket 86's `hintOpener`). The "I'd like a…" menu is four
bare pills, "another hint", "worked example", "video", "chat", with no side notes; a pill that
cannot be taken is greyed. While the latest hint is stalled (ticket 86: the student's lines have not
moved past what it asks for) the "another hint" pill is greyed rather than relabelled to open the
chat: the chat is one press away on the hint card the student is looking at.

**Context.** The user (ticket 99): "the talk it through option is dumb. it's hidden away in the
i need help screen. add a pill button to the light purple hint 1 box"; and of the menu, "ONLY
'another hint', 'worked example', 'video', 'chat'". Ticket 86's row relabelling ("Talk it
through →") was honest about what the tap did but put the conversation about a hint two taps
away, behind a button that reads as asking for something else.

**Alternatives considered.**
- *Keep the stalled row opening the chat, silently.* With the notes gone the row would say
  "another hint" and open a chat: the surprise ticket 86 rejected.
- *Hide the hint row while stalled.* The menu would change shape between opens; a greyed pill
  keeps the four options in place and says the hint is not on offer yet.
- *Show the pill on every open hint, reopened earlier ones too.* The opener says "hint n before
  another one", which is only true of the latest; earlier hints have been moved past.
- *Keep the pill while the worked example plays.* The chat is already on screen there
  ("Question about a step?") and `chatOpen` has no column to open; like "I need help" (ticket 95)
  the pill goes while the example plays.

**Tradeoffs.** A stalled student who opens the menu sees a greyed "another hint" with no word
about why; the pill on the hint card beside it is the explanation. The menu's pills are the
width of the widest ("worked example"), so the popup is 248px wide and the heading nearly spans it.

**Defense.** The pedagogy of ticket 86 stands (no second hint until the first is acted on; the
reducer still refuses `run/hint` while stalled); only the door to the chat moved to where the
hint is. The menu now matches the spec's rule of labels over sentences: four words, no helper
text, and disabled state carried by greying alone.

## 2026-09-11 · "hint" while the previous hint is unacted on is answered with a notice, not a greyed pill

**Decision.** The help menu's first pill reads "hint" always (never "another hint"), and while the
latest hint is stalled it stays live. Pressing it then shows a notice over the pad, "Let's talk
through the previous hint before giving you another.", with one pill, "Talk it through", wired to
the same `talkHint` as the hint card's pill: the pad's opener stored once, the chat open. Escape
or the scrim closes the notice with nothing said. The help overlay is one three-way state
(`closed | menu | stall`) rather than two booleans.

**Context.** The user, on ticket 99's greyed row: "if the student clicks on hint in the setting
currently analogous to 'you can't have one…', a pop up says 'let's talk through the previous
hint before giving you another'. then that opens the same thing that 'talk it through' would."
A greyed pill told the student nothing; a live pill that answers with the reason and the way on
does.

**Alternatives considered.**
- *Open the chat straight from the "hint" press* (ticket 86's behaviour, without the relabel).
  The student asked for a hint and gets a chat with no word between; the notice is that word.
- *Put the sentence inside the menu* (swap the pills for the sentence and one button). The menu
  would change shape under the pointer; a second, smaller card reads as an answer to the press.
- *Auto-open the chat after a pause on the notice.* Motion the student did not ask for, and the
  notice would need a timer; one press is clearer.

**Tradeoffs.** Reaching the chat from the menu is now three presses (help, hint, talk it through)
against ticket 86's two; the hint card's pill remains one press for a student who has read the
hint. The notice's sentence is fixed copy on the pad, like the opener it leads to.

**Defense.** The stall rule and the reducer's refusal of `run/hint` are untouched; the pad only
decides what the press shows. The click-through checks that a stalled press gives no second hint,
that the notice's copy is exact, and that the opener is stored once whichever pill opened the chat.


## 2026-09-11 · The concerns chat reflects before it asks; the reflections are fixed lines, derived like every tutor line

**Decision.** After each of the student's answers the tutor's next turn opens with a
reflective-listening bubble and only then asks the next question: "Gotcha. It sounds like…",
"Agreed: that's a tricky skill.", "A lot of students share that struggle.", in answer order, the
third line repeating for every later answer. The closing turn is the reflection on the last
answer, then "Thank you for those insights. Let's start with ___." ("that insight" when there was
exactly one answer). The lines live in `lib/warmup.ts` (`REFLECTIONS`, `reflection`), are folded
into `concernTurns` and `closingTurn`, and are never stored: the session keeps only the student's
lines, as before.

**Context.** The user (ticket 102): "this chat doesn't feel very responsive for a student that's
low confidence. i want to incorporate an empathetic model. that framework involves reflective
listening… after each student response -- a restatement in their own words. for the demo, this
will just be fixed." The live version, a model restating the student's actual words, waits on an
API key.

**Alternatives considered.**
- *A reflection-only turn that reopens the box.* The student could then reply to "Gotcha" and
  the turn count would drift from the skill count. The reflection is the head of the question's
  turn instead, so the box stays off until the question lands (the chat's "your move" sign, ticket
  74, is unchanged).
- *A canned restatement naming the skill* ("It sounds like factorising is a sticking point").
  Rejected by the user: the trailing "It sounds like…" is the demo's visible marker that a live
  restatement plugs in there.
- *Cycling the three lines, or no reflection after the third answer.* "Gotcha" twice reads as
  a loop; the most general line repeating is the least jarring for a student who ticked five.
- *Storing the reflections as tutor messages.* Every other tutor line is derived from the seed
  and the answer count, so a reload replays the same chat; storing some lines and deriving
  others would give two sources of truth. When the reflection is live it will be stored, since
  it cannot be re-derived (see FUTURE_FEATURES).

**Tradeoffs.** Each later turn is a beat and a dots pause longer (2.8s to the question instead
of 1.4s), and the closing turn likewise, so a five-skill chat is about seven seconds slower.
"Gotcha. It sounds like…" is a sentence that does not finish; a reviewer who does not know the
demo's intent may read it as a bug.

**Defense.** The chat now has the shape of a conversation (acknowledge, then ask) with a
one-line change to the turn model and no change to the store, the reducer or the teacher side,
and the live version drops in by replacing `reflection(i)` with a stored line.

## 2026-09-11 · The chat under the read-as lines is content-sized to a cap, not the column's remainder

**Decision.** With the chat open under "Read as", the read-as list keeps `flex-1` and the chat
box is `max-h-[42%] shrink-0`: as tall as its bubbles and the box to write in need, no taller
than 42% of the column (about the bottom third of the page once the footer is counted). Past the
cap the transcript scrolls, kept at its end by the existing scroll-to-end effect, so the latest
exchange is what shows. Beside the worked example the chat is still the whole column.

**Context.** The user (ticket 103): "change chat from taking up all the space not taken up by
read as to being minimal -- only takes up as much space as chat currently needs -- approx the
bottom 1/3 of the page. have the chat scroll as it goes, so usually only see most recent message
from chat & your most recent response to avoid chat growing huge." Ticket 90 had capped the
read-as list at 45% and given the chat the rest, so a one-bubble chat was a tall empty box.

**Alternatives considered.**
- *Cap the transcript list at a fixed pixel height (say 170px).* Holds the "latest exchange"
  promise regardless of window height, but on a short window the fixed list plus the box to
  write in could push the read-as lines to nothing; a share of the column scales with it.
- *A third of the column (33%).* Tried at 36%: the list was 125px, which cut the student's own
  line off above a four-line reply. 42% gives the list about 167px, the last line and the reply.
- *Let the chat grow with the transcript and scroll the whole column.* The box to write in
  would leave the screen as the chat grew: the thing the user asked to avoid.

**Tradeoffs.** A long tutor reply (five lines and more) fills the visible list on its own and
the student's line scrolls just out of view above it; the cap is a share of the column, so on a
short window the chat has less room than on a tall one. The read-as list, no longer capped,
scrolls on its own once the chat takes its share.

**Defense.** The chat's data path is untouched (lines said, streaming, reload, reopen); the change
is two `className`s and the removal of the spacer item that pushed bubbles to the foot. The
click-through measures the share at one, six and reopened exchanges and checks the latest reply is
inside the scrolled list.
## 2026-09-11 · The conjured 1 is painted at zero width; the pixel sweep is part of the repo

**Decision.** The one fragment the hint machinery shows that the problem does not write (the 1 in
front of x² on the discriminant warm-up) is typeset with `\llap`, so it hangs to the left of x² at
zero width and no glyph of the problem moves while it shows. "Lighting a hint word moves nothing"
now holds with no exception, and the test sweep asserts it for every warm-up. The headless-browser
sweep that checks the lit box against its neighbours pixel by pixel is checked in as
`scripts/hint-box-sweep.mjs`, run by `npm run sweep:hint-boxes`, and CLAUDE.md names it as part of
done for any change to `lib/hint.ts` or the box's CSS.

**Context.** Settled in a grilling after tickets 96–100. The user confirmed the two rules (the maths
keeps its own spacing; lighting moves nothing) as permanent and chose, for the conjured 1, "keep it
but paint it in the margin with no shift" over keeping the shift or dropping the 1; and chose to
check the sweep in over leaving it as a scratchpad tool or rewriting it as a jsdom test.

**Alternatives considered.**
- *Keep the shift (the 1 pushes the equation right while hovered).* The teaching moment survives
  but it is the very jiggle rule 2 forbids, and the only exemption in the test sweep.
- *Drop the conjured 1 and light x² with the hint saying a is 1.* Loses the moment where the
  student sees the invisible coefficient appear.
- *Position the 1 absolutely with CSS.* Works, but `\llap` is KaTeX's own zero-width primitive,
  renders on the server, and needs no rule of its own.
- *A jsdom vitest for the pixels.* jsdom does no layout; the check has to run in a browser.

**Tradeoffs.** `\llap` paints over whatever precedes the fragment; fine at the start of a line,
which is the only use, and noted for a future mid-line conjure. The sweep needs a production build
and Chrome, so it is a step a person or agent runs, not part of `npm test`.

**Defense.** The discriminant problem rendered plain, wrapped and lit measures identical glyph
positions with the 1 in the margin; the checked-in sweep passes every check on the build; and the
rules are now written where the next agent reads first (CLAUDE.md), not only in a memory file.

## 2026-09-11 · The fractions working shows the 6 as 12/2; the hint beside it stretches rather than splits

**Decision.** The fractions warm-up's reference working gains "x/4 + x/2 = 9/2 + 12/2" between
moving the 6 and combining the numbers (ticket 106). No new hint is written for it: the
common-denominator hint's `at` list grows to `[1, 2, 3]` and the later hints move down one line.

**Context.** The user: "add the step in this worked example of 6 becoming 12/2". Hints are placed
by line number against the working (`at`), so a step inserted mid-working shifts every hint after
it; the question was whether the new line also gets a hint of its own.

**Alternatives considered.**
- *A hint for the new line* ("Write the 6 over 2 first"). It would be the one hint about the
  numbers on a working whose hints are about the x terms, and it would stall a student at the
  12/2 line who is happy to add 9/2 + 6 in their head. Deferred (see FUTURE_FEATURES).
- *Placing hints by step content rather than line number.* Would make inserts free but replace a
  number the author can read against the working with a match rule; not worth it for one insert.

**Tradeoffs.** A student who writes the 12/2 line and asks for help is told about the common
denominator of the x terms, which is the next move but skips the addition they are in the
middle of. The stall for that hint now spans three lines, so it releases one line later.

**Defense.** The worked example is what the user asked for and reads as a student would write it;
the hint machinery needed no code change, only the `at` lists; the tests pin the working and the
lists, and the sweep passes with the new line written.

## 2026-09-11 · The "full sentence" ask is a per-problem flag and a derived box, not stored state

**Decision.** `Problem.answerAs?: "sentence"` marks the problems asked in words (Q9, Q10). The
working screen shows the box when the flag is set and `scriptDone` holds for the problem's read
lines; nothing about the box is stored. It lives in `PadSection` as a `note` prop at the foot of
the pad card, the canvas giving up the height (ticket 111).

**Context.** The user, on Q9 with its three lines read: "after this student has finished their
work, add a text box into the draw pad (at the bottom) that says 'Provide your final answer as a
full sentence.'" "Finished" on this pad means the scripted recognition is exhausted; the question
was which problems ask, how "finished" is known, and where the box goes.

**Alternatives considered.**
- *Every problem.* "Provide your final answer as a full sentence" under "Solve for x" asks for a
  sentence no marker wants; the box would lose its meaning by Q2. A flag on the two worded
  problems reads as the user's screenshot does.
- *Inferring wordedness from the stem or the tags.* One assignment is too little to trust a rule
  with; a flag is read at a glance in `data/assignment.ts`. Logged in FUTURE_FEATURES.
- *A stored "done" flag set by the reducer on the last reveal.* It would need clearing on undo
  and clear, a second source of truth for what `lines.length` already says.
- *An overlay on the canvas (absolute, pointer-events none).* Ink would pass under the box; and
  a box the pen writes through is not a box. The flex column keeps the paper and the box apart.
- *Shrinking the canvas moves the ink?* No: strokes are stored in canvas coordinates from the
  top-left and redrawn on resize, so the rows above stay where they were; only paper at the foot
  is given up, and the click-through pins the canvas top.

**Tradeoffs.** A student who has undone their last line loses the box until they write it again,
which is the derived-state rule working as intended. The box is per-problem data a new assignment
has to set by hand. The pad's ruled lines end 44px above the box rather than under it.

**Defense.** The user's ask is met exactly on the screen they showed; the two worded problems are
the only ones whose answer is a sentence; derived state means undo, clear and reload need no new
code; and every other `PadSection` caller is unchanged.

## 2026-09-11 · The factorising row expands to leaves at submit; the stored answer is unchanged

**Decision.** The "not confident with…" list shows factorising as one row with "monic" and
"non-monic" under it, but the session still stores `Confidence.leaves: LeafId[]`. The screen's
draft is a list of row ids (`PickId`, a leaf or the `factorising` row); `pickedLeaves` turns it
into leaves when the student submits (the row alone means both kinds), and `pickedRows` turns a
stored answer back into rows for the locked view. Both live in `lib/confidence.ts` with tests.

**Context.** Ticket 112: the user wants the student to name "factorising", then optionally say
which kind, and a bare "factorising" to warm up both kinds. The concerns chat, the warm-up offer
and the warm-up sequence all read `Confidence.leaves` as a list of leaves in tick order.

**Alternatives considered.**
- *Store the row: `leaves: (LeafId | "factorising")[]`.* Every reader of the answer (the chat's
  turns, the offer's words, `focusLeaves`, the teacher's view of the answer, `hydrateSession`)
  would have to expand it; a stored "factorising" whose meaning is "both, unless…" is a rule in
  the data instead of in one function.
- *A separate `kinds` field beside `leaves`.* Two fields to keep consistent, and the order the
  student ticked in (which the chat follows) would be split across them.
- *List both kinds as top-level rows ("monic factorising", "non-monic factorising").* Simpler,
  but the user's point is that the student names factorising first and the kind second; a
  student who cannot tell the kinds apart should still be able to say "factorising".
- *Pre-tick both kinds when the row is ticked.* Then "one kind only" is two taps (untick one)
  instead of one, and the list can no longer tell "meant both" from "ticked both". Leaving the
  kinds clear until tapped keeps the tap count at one for every case; the locked view after
  submit shows both ticked, so the assumption is visible.

**Tradeoffs.** The row's position in the list is where the first factorising leaf ranked, which
means the non-monic kind is offered even for a set whose top seven has only the monic leaf (as
this one does). The locked view cannot show "factorising, unspecified": it shows both kinds
ticked, which is what the answer means. Any future rule that folds other leaves into a row
("graphs" over sketch and features) goes in the same module.

**Defense.** One pure function each way, tested, and nothing downstream changes: the chat, the
offer and the sequence were verified on a bare factorising tick without a line of theirs
touched. The session shape is stable across the change, so stored sessions load as before.

## 2026-09-11 · The final-answer field is the chat's box, focused on mount, its text in the session

**Decision.** Ticket 111's tinted card becomes a textarea with the chat box's classes and the
instruction as its placeholder; it takes focus in a mount effect; Enter blurs; the text lives in
`session.answers[problemId]` via `answer/set`, untouched by undo and clear (ticket 114).

**Context.** The user could not type into the card and asked for "same functionality as here"
(the warm-up chat's box: the cursor already in it) and "same visual … the faded grey
instructions", the only difference the placeholder's wording. "Text box" meant an input.

**Alternatives considered.**
- *Local component state for the text.* Lost on a reload and on a move to another problem; the
  rest of the working survives both, so the sentence should too.
- *A shared `ChatBox` component for the three textareas.* The warm-up and help boxes carry their
  own disabled states, send pills and key handling; a fourth prop set for the pad's field would
  be more surface than the one class string it shares. Deferred until a fourth box appears.
- *`autoFocus` on the textarea.* React's `autoFocus` fires only on the initial client render of
  the element, which is the same moment here, but the mount effect is explicit and is what the
  chats already do (`box.current?.focus()`).
- *Enter inserts a newline (the default).* A full sentence is one line; a newline in a sentence
  field reads as a slip. Enter ending the typing matches the chat's Enter-sends without a send.
- *Clearing the sentence on `lines/clear`.* A clear restarts the working, not the conclusion; if
  the student's answer was right it should still be there when they get back. Logged.

**Tradeoffs.** The field is focused the moment the last line is read, so a student mid-scribble
who lifts the pen for 850ms sees the cursor jump into the field; the next pen-down on the paper
takes it back. After a reload with the working already read, the field mounts with the page and
takes the cursor again, right for a student coming back to finish; a pen-down on the paper blurs
it as before. Nothing reads the sentence yet.

**Defense.** The user's two asks are met exactly (cursor there, same look); the session keeps the
text where everything else the student writes lives; the classes are copied from the chat, so a
later change to the chat's box is a one-line change here too; the click-through pins the focus,
the typing, Enter, the reload and the undo.

## 2026-09-11 · The hand-in check is a reducer rule with a persisted mode, not a screen-local dialog

**Decision.** `hand-in` over a set with a blank problem does not hand in: the reducer sets
`handInCheck: "open"` and the working screen shows the card (ticket 115). "Confirm submit" is its
own action (`hand-in/confirm`) that records the blanks as not attempted; a way back sets
`handInCheck: "returning"`, which the footer reads to offer Hand in on every problem with a jump to
the next blank one, until the set is handed in. The field is part of the stored session.

**Context.** The user asked for a pop-up on Hand in when problems were skipped, a way back to each,
and a different footer once the student has gone back ("hand in as it would appear normally when
doing Q10", plus "jump to Q2"). The footer's state has to outlive the pop-up and any number of
tile presses, and the teacher's force submit already computes the same blank list.

**Alternatives considered.**
- *A `useState` in the working screen.* The card would close on a reload and the "returning" footer
  would be forgotten with it; the teacher's force submit, which must dismiss the card, could not
  reach it; and the rule "a blank set asks first" would be tested only through the DOM.
- *A blocking scrim modal (like the practice prompt).* The user asked for a card in the bottom
  right; a scrim would also stop the student from answering the card by writing on the pad or
  pressing a tile, which are natural ways back.
- *Refusing Hand in until every problem has a line.* Simpler, but the user wants "Confirm submit" to
  exist, and a student who cannot do Q7 must be able to hand in.

**Tradeoffs.** One more field in the session shape (hydrated to `null` for older snapshots) and
two more actions. The screen still holds a little logic of its own: which blank problem the jump
goes to (the next after this, wrapping) and whether the three footer buttons fit the column.
`hand-in` no longer hands in unconditionally, so the routing tests start from a set with every
problem attempted; anything else that dispatches `hand-in` over a blank set now gets the card.

**Defense.** The rule lives where the blank list and the force submit already live, the card and
the footer survive a reload, every state is reachable through the reducer in seven tests, and the
headless click-through drives the whole flow from Q1 to feedback the way a student would.
## 2026-09-11 · "Finished" is a flag on answer lines in the marking table, read from both versions; the mistakes count reads the first hand-in only

**Decision.** A problem is finished when any of its lines, in the first hand-in or the rework,
carries `answer: true` in `EVALUATION`, or a sentence is typed under its working (ticket 114's
field; ticket 116). The incomplete count and the row labels derive from that live. The mistakes count, the double-check chips and the post-rework notice keep
reading the first hand-in's problems; a problem blank at hand-in is skipped by the notice even
though the rework may have put wrong lines on it.

**Context.** A student who hands in with problems untouched read "Every problem held.", which was
true of the lines and false of the set. The user wants "N problems are incomplete." that resolves
as problems are finished on the rework pad, and a slip made while finishing one to add nothing
to the mistakes.

**Alternatives considered.**
- *Incomplete = no lines at all.* Matches the stored `notAttempted` list, but Q2 with one line of
  working would count as complete, which the user rejected.
- *Compare the latest line with the model solution's last step.* Misses answers written in
  another form ("x = 2, 3", the roots in the wrong sign after a wrong factorisation) and undoes
  itself when a check is written after the answer (Q8). The marking table already knows every
  line the pad can read, so a flag beside its verdict is one place, per line, reviewable.
- *A separate `ANSWER_LINES` table.* Two tables to keep in step for the same keys.
- *Count rework slips on blank problems in the mistakes box and the notice.* The user said not
  to; and the student would be told of a mistake in a box that says "first submission".
- *Skip every problem without a first-hand-in mistake in the final notice.* Would also drop a
  problem with correct working that the rework broke under a forced hand-in, which the guard
  (ticket 12) deliberately surfaces there; so only problems blank at hand-in are skipped.

**Tradeoffs.** Every new problem must mark its answer lines or it can never be finished (a test
checks every model solution reaches one). The scripted demo run now shows "2 problems are
incomplete." because Q9 and Q10 stop at working (ticket 111's premise), and Q9 has no rework
script, so the demo's box never reaches zero. A wrong answer counts as finished, so a student who
answers everything wrongly sees no incomplete box and every slip in the mistakes box, which is
the division the user asked for.

**Defense.** One predicate (`progressOf`) feeds the box and the rows, so they cannot disagree. The
summary's copy is a pure function with the outstanding flag as an input, tested for every branch.
The marking table's flag is data, not inference, and reads beside the verdict it qualifies.

## 2026-09-11 · The "we're stuck" mode is deleted outright, not fixed or hidden

**Decision.** The group board's "we're stuck" button, the reveal of everyone's earlier work, the
`group/stuck` action and the run's `stuck` list, `earlierVersions`, the `"stuck"` turn event and the
scripts' `stuckAfter` are removed. The action row under the board is Check alone (the pen-holder) or
"… checks when ready" (everyone else), at the right.

**Context.** Ticket 117. The user: "it's fucked up -- just shows the right answer if somebody in the
group got it wrong. remove it entirely". `earlierVersions` stood the model solution in for a member
with no recorded attempt on the problem, so the reveal handed the group the answer whenever one
member had never slipped on it; on the scripted Q3 that member is Jordan, who never reached Q3.

**Alternatives considered.**
- *Fix the stand-in: show "not attempted" for a member with no slip.* Keeps the mode. Rejected: the
  user asked for it gone, and with the give-away removed the reveal shows at most one or two
  members' wrong first lines, which the debrief after a correct check already does better with
  three versions side by side.
- *Hide the button behind a flag and keep the code.* Leaves a `stuck` list in every stored run, a
  reducer case, a turn event and a script field that nothing exercises, and a reveal that would rot.
  Rejected: dead code in the run's shape is the kind of thing the next ticket trips over.
- *Keep the scripted press on Jordan's Q3 turn without the button.* Would show a presenter the
  reveal with no way to reach it themselves. Rejected with the rest.

**Tradeoffs.** A group with no way to ask for help while the pen-holder is wrong; the wrong check's
first-mistake view and the pen-holder's next attempt are all there is until the teacher steps in.
The freed spot at the left of the action row is noted in FUTURE_FEATURES for a stuck mode that does
not give the answer away. Runs persisted before this change keep a `stuck` key nothing reads.

**Defence.** The mode's one behaviour was to reveal, and its reveal was wrong in the common case.
Deleting it is smaller than fixing it, the run's shape loses a field, and the peer turn loses a
seven-second pause that only existed for the reveal.

## 2026-09-11 · Typed maths is detected by token, not delimited, and read into the card's shape

**Decision.** On the create screen a question is one free-text box. `lib/mathInput` finds the
maths by token: a token is *strong* (a digit, one of `^ * / = < >`, a bare operator, a call like
`sqrt(`) or *weak* (a single letter), and a run of them with at least one strong token is maths; a
token ending in sentence punctuation can only close a run; a weak tail is prose unless an operator
holds it. The last run that ends the text is the centred expression, the rest render inline in
the prose, and a newline forces the split. The shorthand grammar (`**`, `/` as a stacked fraction
bound to the atoms either side, `*`, `sqrt()`, `pi`, `<=`, …) is converted to TeX; whatever KaTeX
still rejects is shown as typed. The draft is saved to the classroom store on every change as the
typed text plus the parsed stem (inline maths as `$…$`) and expression.

**Context.** Ticket 119. The user: "i'll type in basic like coding language, eg x**2 & want that
to render as KaTeX", and the student's card is prose over one display expression (`Problem.stem`
+ `tex`), which the typed line has to be split into.

**Alternatives considered.**
- *Two boxes per question, words and maths.* Matches the data shape exactly, but the bank's own
  Q10 has maths inside its prose ("the graph of y = x² + 4x + 5"), and a teacher writes in
  sentences. Rejected.
- *An explicit delimiter (backticks or `$`).* Unambiguous, but it is the "inputting LaTeX
  concern" the user set aside, one more convention to teach. Rejected for now; noted in
  FUTURE_FEATURES beside the `**` convention itself.
- *A single letter always as maths.* Would set the "a" of "a ball" and the "x" of "for x." in
  italic; the weak/strong rule keeps them prose while "y = x**2" is maths.
- *Store only the typed text and let the next screen parse.* The parser is pure and exported, so
  it could; the parsed shape is stored as well so the review screen (another agent's work) has the
  card's shape in hand without reaching for the parser.

**Tradeoffs.** Detection can guess wrong ("as in Q3" sets Q3 in maths; "2 marks" sets the 2), and
the live preview is the only correction, plus Shift+Enter for the split. Storing the parsed shape
beside the text is a derived copy that could drift if the grammar changes; the draft is short-lived
(one sitting), so a stale stem is a reload away from fresh.

**Defence.** A single box with live rendering is what "fantastic user experience" for typing
questions means; the rule is small, tested against the bank's ten questions, and every mis-detect
is visible in the tile as it is typed.

## 2026-09-11 · The create screen is a new route; the old screen stays as a reference

**Decision.** `/teacher/assignments/create` (and `…/create/review` as a stub) are new; the
"New assignment" pill points at the create route; `/teacher/assignments/new` is left as it was,
reachable by URL only.

**Context.** Ticket 119. The user wants the old screen kept so a second agent, building the
review screen, can reference its unit-focus and pathway sections.

**Alternatives considered.** *Rewrite the old screen in place* (loses the reference); *nest the
new screen under the old route* (the pill would still land on the old flow). Rejected.

**Tradeoffs.** Two creation entry points exist until the review screen lands, one of them
unlinked. The old screen's `assignment/create` is still the only thing that sets the assignment
in force; the draft does not, by design.

**Defence.** The smallest change that gives the teacher the new flow from the pill and the other
agent an untouched reference.

## 2026-09-11 · The create screen seeds the demo draft from one shared fixture

**Decision.** With no draft in the classroom store, the create screen seeds one from
`data/draft-seed.ts`: the title and the demo teacher's ten questions in the typed shorthand. The
seed is written to the store on mount like any edit. A draft that exists but is empty is not
reseeded. The review step (ticket 120) pastes the same lines, so the fixture is one file both
import.

**Context.** Ticket 121. The user, on the blank first load: "i don't want this blank view -- i
want it prefilled for now, & for genuine assignment creation to be a next round concern". The
phase-2 session had already written the paste with two deliberate differences from the bank (Q1
with +5x, a repeat in the ball problem's slot) for its recommendations to act on.

**Alternatives considered.**
- *Seed from the bank (`PROBLEMS`) by rendering each problem's stem and TeX back into the
  shorthand.* Round-trips TeX to shorthand, a second grammar to maintain, and the review step
  wants the two differences anyway. Rejected.
- *Keep the blank screen and let the review step's fixture be pasted by hand.* The user asked
  for prefilled. Rejected.
- *Seed in the store's `INITIAL_CLASSROOM`.* Would put ten typed questions into every tab's
  initial state, including the student's. Rejected: the seed is the create screen's.
- *Reseed whenever the draft is empty.* A teacher who removes every tile would watch them come
  back. Rejected: only a missing draft seeds.

**Tradeoffs.** The seed's ids (`seed-1…10`) are stable across reseeds, so a stale tile key is
never an issue, but the same ids reappear after Reset demo in every tab. The seed's two
differences from the bank are the review step's premise; a presenter reading the create screen
alone sees a +5x Q1 that is not the bank's, which the fixture's comment explains.

**Defence.** One fixture, two readers, no round-trip; the screen the user sees on arrival is the
one they asked for; the blank flow of ticket 119 is unchanged once the draft has been emptied.

## 2026-09-11 · The review step matches the draft by expression, never by position

**Decision.** Labels and recommendations (ticket 120) are keyed by the normalised TeX of a
question's expression (`normTex`: spacing, braces and `\tfrac`/`\dfrac` removed): a typed
question gets the bank problem's label when its expression matches one, a fixture label for the
two draft-only expressions, and a heuristic otherwise; a change or removal fires on the question
whose expression it names and is not shown when none does; the addition always applies. The
finalised set maps to bank ids the same way.

**Context.** The create screen is a free-text editor with no link to the bank, and its draft
(seeded by ticket 121, or typed) can be in any order with anything added or removed. The demo
needs the three recommendations to land on the +5x Q1 and the repeated Q9.

**Alternatives considered.** *By position* (always Q1, always Q9): breaks the moment a teacher
reorders or removes a tile, and recommends changing whatever happens to be first. *By question
id* (the seed's `seed-1`, `seed-9`): breaks for a pasted or retyped draft, which has fresh ids.
*A small model call*: the real thing, out of scope for a fixture demo.

**Tradeoffs.** Two questions with the same expression and different stems get the same label
and the same card; a bank match trusts the expression alone (a "Show that" over `x^2+4x+5=0`
and a "Solve" over it would both map to Q10). Normalisation is a short list and can miss a
spelling (`\frac` versus `\tfrac` is handled; `x^{2}` versus `x²` relies on `toTex`).

**Defence.** Expression matching is the only rule that survives reordering, retyping and
pasting, keeps the student side on bank problems it can run, and degrades to "fewer cards"
rather than wrong cards.

## 2026-09-11 · The review's decisions live in the classroom store, keyed to the draft

**Decision.** `classroom.review` holds the step reached, the relabels, the answers, the
alternative shown, the pathway, the reassessed unit and the confirmation, with `forDraft`, a
hash of the questions as typed. `reviewFor` returns the stored review only when the hash
matches; otherwise a fresh one carrying over the relabels (by question id) and the pathway.
The assessing run is local component state and never stored.

**Context.** A reload mid-review should land on the same step with the same decisions (the
user's answer to "persisting the review step"); a teacher who goes back and edits the questions
should not see answers about a set that no longer exists.

**Alternatives considered.** *Local state only*: a reload restarts at labels. *URL state*
(`?step=`): the answers do not fit, and a shared link would carry decisions. *Reset on every
`draft/set`*: the create screen dispatches on every keystroke and again on Continue, so the
review would reset whenever the teacher so much as opened the create screen.

**Tradeoffs.** The hash is of ids and text, so retyping a question identically keeps the
decisions while the seed's stable ids mean the relabels survive a round trip; an edit anywhere
clears the answers even when the recommendations' targets are untouched. The store is mirrored
to every tab, so two tabs on the review step follow each other.

**Defence.** The same home as the draft, with the same lifetime, and one rule (the hash) that
decides when decisions still apply.

## 2026-09-11 · Create carries the finalised questions beside the bank ids

**Decision.** `assignment/create` stores `questions: ReviewedQuestion[]` (the set as typed and
reviewed, each with its label and origin) alongside `problemIds`, the bank ids the finalised
expressions match, in bank order. The student side still runs `problemIds` only.

**Context.** A finalised set can hold questions the bank does not: the +5x Q1 if the change is
kept as is, the garden or rocket alternative, anything the teacher typed. The student flow needs
a bank problem (solution, hints, scripted slips) for every problem it runs.

**Alternatives considered.** *Bank ids only, unmatched dropped silently*: the teacher's view
loses questions with no trace. *The student side running on typed questions*: needs a model
solution per typed question, a separate back-end concern (FUTURE_FEATURES).

**Tradeoffs.** Two lists that can disagree in length; nothing on the teacher's views reads
`questions` yet. Keeping the change as is leaves the +5x question on the assignment while the
student sees −5x (ASSUMPTIONS).

**Defence.** Nothing the teacher decided is lost, the student side keeps its guarantee, and the
gap between the two lists is visible data rather than a silent drop.

## 2026-09-12 · One push slot; a push belongs to the panel it came from

**Decision.** The mistake view's per-problem diagnostic panels share the session's single
`diagnostic` slot with the class view's card. Which panel a push (waiting or answered) belongs
to is decided by `pushBelongsTo`: a fixture push by its id, a teacher-written one by the
`problemId` it was written under (none on the class view). Only the owning panel shows the
waiting band, Withdraw and the response; the other panels' send buttons are off while a push
waits.

**Context.** Ticket 127 puts the push panel beside every problem of the mistake view, so ten
panels and the class view's card can each push. The student side answers one modal at a time.

**Alternatives considered.** *A slot per panel* (`diagnostics: Record<problemId, …>`): the
student could face several modals, and the reducer, the modal and the class view's card all
change. *A queue*: same student-side question, plus ordering rules nobody has asked for.
*No ownership, every panel shows the band*: the teacher could not tell which question is out,
and Withdraw would appear in ten places.

**Tradeoffs.** A teacher cannot have two checks out at once; the disabled buttons say why in a
title only. A fixture push shows on two panels when they share the fixture (the class view and
Q2's panel), by design: it is the same question.

**Defence.** The student-side contract (one modal, answer, back) holds unchanged; ownership is
a pure function with tests; the ten panels and the class view's card are one component.

## 2026-09-12 · The class's stage is the stage the class entered, derived, not stored

**Decision.** `lib/classStage.ts` derives where the class is on its pathway from state that
already exists (the whole-class session's status, the group gate, the live student's stage) and
counts the students done with that stage from the same sources. Nothing new is written to the
classroom; no stage transition is recorded.

**Context.** Ticket 129: the Pathway card marks the current stage, counts the class through it,
and darkens stages the class has moved on from. The student side already knows its own stage;
the teacher side needed one for the class.

**Alternatives considered.** (1) A `stage` field on the classroom advanced by explicit actions
(teacher-driven or automatic). (2) The furthest stage any student has reached. (3) The stage most
students are in.

**Tradeoffs.** Derivation means every tab agrees without a new action and older stored state
needs no migration, but the rule has to name a class-level moment for a stage that students
enter one by one (individual review), and the fixture classmates have no stage of their own.
An explicit field would be simpler to read but would need writers on the student side and
could drift from what the whole-class session and the gate already say. "Furthest student"
would light individual review the moment one student hands in and never let the working
stage look over while one is missing; "most students" hides a straggling class.

**Defence.** The gate and the whole-class session are already the class-level moments for
group and class review; individual review's moment is the live student's hand-in, which is
what the demo's scripted classmates are anchored to. The counts stay honest about who is
behind (the grid's MISSING marker and Force assignment submit's count use the same lines).
If the classmates become live, only `stageDone` and `currentClassStage` change.

## 2026-09-12 · A mistake's identity is its wrong line's entry in the evaluation table

**Decision.** Two students have made "the exact same mistake" on a problem when their wrong
line is the same key of `EVALUATION[problem]`, whatever the lines around it. The fixtures
(ticket 130) are shaped on that identity: every problem with a slip has at least two distinct
wrong lines, Q7 three, and Q9's four "h = 6" students, who reach it by a four-line and a
three-line route, are one mistake. Ticket 131 draws a box per identity.

**Context.** The user asked for more and more varied mistakes and, on the mistake view, a
second grouping inside the skill pill by exact mistake. The skill pill already keys on the wrong
line's first tag; the model had no finer identity. The table entry carries the teacher's note
and the student's clue, so it is already "the mistake" on every other screen.

**Alternatives considered.** *Line-for-line identical working*: separates students who made
one mistake by different routes, which is working, not error, and makes the Q9 fixture four
singletons. *Wrong line plus its tags as one key*: the tags are a function of the line, so it
is the same partition with a longer key. *A hand-authored mistake id per entry*: allows two
different lines to be one mistake (Q7's two fraction slips as "fractions cleared wrongly") but
adds a field nobody reads and a judgement per line; the tag already gives that coarser grouping.

**Tradeoffs.** Two lines that a teacher would call one mistake (a sign flipped in `(x + 2)(x + 3)`
versus in `(x − 1)(x − 6)`) are two identities; the pill above them says they are one skill.
The identity is only as fine as the table: a student whose line is unknown has no identity.

**Defence.** No new field, no new judgement; the partition is a pure function of data that
every screen already reads, testable by counting keys. The fixtures were shaped with the
user in an interview, and the shape (twelve / one / none, six / four / two on Q7) is pinned
by a test so a later fixture edit that flattens it fails first.

## 2026-09-12 · The mistake box is drawn by its cells, and the working shrinks by measurement

**Decision.** On the mistake view the box around the students on one exact mistake is not an
element: each student's working cell draws its share (top and bottom edges on every cell, the
left edge, corners and a 10 px margin on the group's first, the right on its last, a plain
divider between). And a problem's working is sized by one measured factor (`FitGrid`, a layout
effect that compares every line's KaTeX width with its box and writes `--fit` to the grid),
17 px down to a 13 px floor, with the columns at `minmax(186px, 1fr)`.

**Context.** Ticket 135. The box has to sit on the same column lines as the name row above and
the pill between them, and the user wanted a crowded problem's columns to narrow with the
maths shrinking to fit rather than wrapping or scrolling early. The teacher chrome is zoomed
0.8, which rules out mixing client rects with layout units.

**Alternatives considered.** *One element per box spanning its columns, with an inner grid*:
its inner tracks drift from the outer ones by the box's margin, visibly against the name
row's dividers. *A subgrid*: aligns, but a subgrid's own margins reduce its edge tracks, and
the box's margin then narrows the first and last students' cells unevenly. *An absolutely
positioned outline over the cells*: needs measuring on every resize and open. *Pure-CSS
shrink* (`font-size` in `cqw` from the cell as a container, clamped): tried; a rule of the
column's width alone cannot serve Q5 (four columns of short lines, fine at 17 px) and Q10 with
the live student (four columns of sentences, 14 px needed) at once. *Wrapping the pair-check
line at its gap*: the user chose shrink over wrap.

**Tradeoffs.** A box is several elements, so anything that wants "the box" (a hover, a label)
addresses its first cell. The fit is a layout effect that writes a style, re-run on resize and
font load: a few DOM reads per open problem, no state, but not something CSS alone
expresses. The floor means twelve columns still scroll; see FUTURE_FEATURES.

**Defence.** Alignment holds by construction, with no measurement, on every column count.
The fit measures in layout px only (`offsetWidth`, `clientWidth`, computed padding) so the
zoom cannot skew it, and one measurement suffices because KaTeX scales linearly with the font
size. The click-through asserts every line on one row inside its box on every problem at
1440 and 1280, with and without the live student.

## 2026-09-12 · A column on the mistake view is a working, not a student

**Decision.** The mistake view's grid has one column per distinct working (every line's TeX,
in order, `workKey`), not one per student: students whose working is identical line for line
share the column, their names all over the one copy of the work. The partition sits under the
exact-mistake groups (`groupByMistake` → `groupByWork`), and every `start` in the model counts
columns, since pills and boxes span grid columns.

**Context.** The user, on Q7 (thirteen columns scrolling) and Q9 (Ethan's and Harper's
columns showing the same three lines): "if students share EXACT same work, don't write each
of their work individually. write it ONCE & group them together." Ticket 135 had just made
the maths shrink to fit more columns; that keeps every column and reaches seven or so before
scrolling, but Q7 has thirteen.

**Alternatives considered.** *Keep a column per student, hide duplicates' lines* ("same as
Tomas"): keeps thirteen columns and the scroll. *Group by exact mistake* (ticket 135's key,
the wrong line only): merges Q9's four-line and three-line routes to "h = 6" into one column
with no honest single copy of the work to show. *A fuzzy key* (ignoring right steps): the
user asked for exact; a teacher reading "the same work" must be able to trust it.

**Tradeoffs.** A student whose working differs by one right line from a neighbour's gets a
column of their own inside the same box, which can look like a duplicate. The header row
grows with the longest list of names in the problem (seven wrap to four rows at 1280). The
compare footer belongs to a column, not a student, so it sits under a column six classmates
share.

**Defence.** Identical working implies the same wrong line, so the column nests cleanly under
the mistake box and the box still reads as one mistake; the fixtures collapse from thirteen
columns to three on Q7 and five to three on Q9 with no scroll at 1280, and the tests pin the
column counts so a fixture edit that splits them fails first.

## 2026-09-12 · The roster aligns pills with a fixed name slot, and the avatar moves to the row's end

**Decision.** On the class roster every student's name sits in a 142 px slot (the widest
name at 16 px plus 10 px); the **in progress** pill follows in the same line, so every
in-progress pill starts at one x. The avatar leaves the front of the row for a new last
column after Set. Category columns are sized to their header chip (96 px, or 132 for a chip
past ten letters), and the table's minimum width is the 1280 × 800 laptop's card less 4 px.

**Context.** The user asked for a bigger name, the pill beside it rather than under it, a
rule that keeps several in-progress pills vertically aligned rather than staggered by name
length, and the avatar at the far right so the eye can find its row after crossing the skill
columns. The teacher's surface must fit a 1280 px laptop with no horizontal scroll (ticket 37,
guarded by `scripts/laptop-check.mjs`), and the roster's student cell also holds two stacked
hover buttons (ticket 46).

**Alternatives considered.** *Pill 10 px after each name*: what the user ruled out; pills
stagger. *A separate table column for the pill*: aligns too, but the column's width is then a
second constant and the hover buttons still need their own room. *Measuring the widest name at
runtime*: exact for any roster, but a layout pass for a constant the demo roster fixes. *Keeping
the avatar at the front as well as the end*: the student cell would need 20 + 32 + 12 + 142 +
88 + 12 + 96 + 20 = 422 px with Sam's row hovered, and the roster would then be about 40 px
wider than the 1280 laptop's card, so either the Pathway column narrows from 320 or the card
scrolls, which the guard forbids. *Hover buttons in the avatar's column*: the same width, just
elsewhere; the sum is the constraint. *Even 100 px category columns*: "Communication" is
126 px and ran under "Reasoning" whenever the card was at its minimum, as in the user's own
window; per-chip widths fix that within the same budget.

**Tradeoffs.** The 142 px slot and the ten-letter rule are constants tied to the demo roster
and taxonomy; a longer name pushes one pill right, a second long chip overlaps. The roster is
4 px inside the laptop budget; the next column is a trade. Only one avatar per row: the user's
words were "place the avatar there", and if both ends are wanted the trade above is the cost.

**Defence.** One flex line with a fixed-width first item is the smallest rule that gives the
alignment the user asked for and needs no measurement; moving the avatar is the one change
that pays for the bigger name and the inline pill inside the laptop budget without touching
the Pathway column or the guard. Both constants are named in one place each (`min-w-[142px]`
with its comment, `columnWidth`) and every geometry claim is asserted by `verify.mjs` at 1280
and 1400.

## 2026-09-12 · The live diagnostic is classroom state, and the class's answers are a function of time

**Decision.** A pushed diagnostic is a `DiagnosticRun` on the classroom store (`diagnostics`,
oldest first), not a slot on the student session. The demo student's answer is written into the
run; the nineteen classmates' answers are not stored at all: `tally(run, now)` derives who has
answered (a fixed arrival offset per classmate from the push time) and what they picked (an
authored pick per fixture distractor, a rule for a teacher-written question). The board shows the
latest run when its tally is complete or the teacher has put it up, never while cleared.

**Context.** Ticket 137: the result has to be on the class view, in the mistake view's flyout and
on the projector at once, counts climbing live, the board joining on its own at 20/20. The
session store is the student's own state and the board already reads the classroom for
everything class-level (the race, the slides).

**Alternatives considered.** (1) Keep the push on the session and add a board flag to the
classroom: two writers for one feature, and the board would read two stores to draw one slide.
(2) Store every classmate's answer as it "arrives" through timed dispatches from whichever tab is
open: a background timer per tab, duplicate writes when two tabs are open, and a reload mid-trickle
that either loses answers or replays them. (3) Random arrival order and picks: unrepeatable
click-throughs and a demo that reads differently each time.

**Tradeoffs.** Derivation means a tab whose clock differs sees a different count for a second,
and the counts can only ever be what the fixtures say (a teacher cannot see "who" picked what,
which the product will want). The picks are authored once per fixture, thirty phrases and lists
to keep true to the classmates' wrong lines when those change. The session loses a feature it
had, and stored sessions from before keep a harmless `diagnostic` field.

**Defence.** One store, one writer per action, the same numbers in every tab and after a reload
without a single message; the whole behaviour is a pure function with 27 tests, and the demo
tells the same story every time. When answers become real, `tally` is the one seam to replace.

## 2026-09-12 · The right count on the mistake view is over the whole class, and "right" means finished and clean

**Decision.** The box left of each problem's label reads "n/20": the class of twenty
(`CLASS_SIZE`) is the denominator, and a student counts as right only when they reached the
problem and are not wrong on it (a classmate: `index < done && !wrong.includes(pid)`, the
rule that already gives them the model solution on the skill grid) or, for the live student,
when the first hand-in on it is clean and finished (`feedbackFor(...).clean` and
`progressOf === "finished"`). The rest split into the wrong (the rows under the label) and the
unfinished, and the tooltip says so.

**Context.** The user: "to the left of the Q box, add a little box saying how many students
got the problem correct." The fixtures make the choice real: Jordan finished three problems,
Liam two, Chloe none, Grace four, and Sam's own Q9 working stops at the axis of symmetry
("Axis of symmetry, height not shown"), so on Q9 he is neither right nor wrong.

**Alternatives considered.** *Over the students who reached it* ("15/18"): a truer rate, but
the denominator then changes from problem to problem and the eye cannot compare two boxes
without reading both numbers; the class view's fractions are already x/20 (ticket 129). *Right
= not wrong*: would count Sam right on Q9 with no answer written, and Chloe right on everything.
*Right = the rework's result*: the rows are the first hand-in's mistakes, so right and wrong
would overlap once a rework fixed a slip. *Counting in the view*: the rule belongs beside the
rows it complements, in `lib/mistakes.ts`, where the test can pin it.

**Tradeoffs.** A problem few students reached reads as a low score ("8/20 right" on Q9 when
eleven reached it and eight of those were right); the tooltip carries the split, but only on
hover. The live student's "finished" reads the rework too (`progressOf`), so a student who
answered only in the rework counts finished but is right only if the first hand-in was clean,
which is the same reading the rows use.

**Defence.** One denominator across every box makes the column of boxes comparable at a
glance, which is what a count "to the left of the Q" is for; and defining right as reached,
finished and clean keeps the three numbers in the tooltip a partition of the class, so the box
never contradicts the rows beneath it.

## 2026-09-12 · The avatar returns to the front of the roster's row; category columns are sized to their chips

**Decision.** The roster's row opens with the student's avatar again, as before ticket 136, and
still closes with it. The 44 px that needs at the 1280 × 800 laptop comes from sizing each
category column to its header chip (80 / 88 / 96 / 132 px by letter count instead of 96 or 132
for all), 8 px off the Confidence column, 8 off the closing avatar's column and 6 off the pill's
padding. Column widths and the table's minimum are numbers in one place (`columnWidth`,
`STUDENT_COL` … `AVATAR_COL`, `rosterMinWidth`), set as inline styles.

**Context.** The user asked for the avatar "in both places": ticket 136 had moved it and spent
the freed width on the 16 px name and the inline pill. The teacher's surface must fit 1280 px
with no horizontal scroll (ticket 37's guard), and ticket 136 had left 4 px.

**Alternatives considered.** *Narrowing the Pathway column from 320*: the count beside the
current stage pill would sit 7 px from the card's edge at 1280. *A 15 px name*: reneges on the
size the user asked for. *The card scrolling at 1280*: the guard forbids it, and the roster is
the screen the teacher reads most. *Measuring the chips at mount and setting the columns from
that*: exact for any taxonomy, but a layout pass and a visible shift after hydration, for six
static labels. *Even 96 px columns with the Communication chip's tracking reduced*: the chip
is 126 px at the shared header style; no single style change gets it under 96.

**Tradeoffs.** Column pitch is uneven (80 to 132) so the dots are not on one grid; the chips are
what the eye reads, and the dots sit centred under them. The letter-count rule is calibrated to
this font and can misjudge a future chip. Four px of slack at 1280 is all that remains.

**Defence.** Every px came from something that had more than it used (chips in 96 px columns
with 3–21 px to spare, a Confidence head word of 60 px in 92) rather than from anything the
user has asked for; the numbers are named once and summed by code, so the next change to a
column changes the minimum with it; and the geometry is asserted at 1280 and 1400 by
`verify141.mjs` and the laptop guard.

## 2026-09-12 · The teacher chrome is zoomed 0.72, and the flyout clears the card by margin, not by moving its chip

**Decision.** `TeacherChrome` zooms every teacher route at 0.72 instead of 0.8, and the mistake
view's diagnostic gets a 20 px margin on top of the row's 16 px gap, so the open flyout (laid
25 px left of its chip so its own chip lands where the closed one was, ticket 132) starts 11 px
clear of the problem card. The "n/20 right" box moves out of the card into the row, in a wrapper
exactly as tall as the card's border plus header (`PROBLEM_HEADER = 69`, exported from
`DiagnosticPush` where the chip already used the number), centred.

**Context.** The user, with the mistake view at 100% and at 90%: "i want the 100% default view
changed to this, currently the 90% view"; "a little gap in between the question box & the live
diagnostic box when it pops up"; "i want it out of the Q1 box -- to the left, same height as the
Q1 row." 0.8 × 0.9 = 0.72. The old flyout overlapped the card's right edge by 9 px (16 − 25).

**Alternatives considered.** *A zoom on the mistake view alone*: the Class and Mistakes tabs
would change size on every switch; the chrome is one frame. *Shrinking the flyout's padding
(p-6 → p-4) to clear the card*: touches the panel's look the user had just approved, and still
only reaches the card's edge. *Laying the flyout right of its chip*: the chip would jump on
open, which ticket 132 was written to prevent. *A `min-h` on the header with the box inside the
card's flow*: the user asked for it outside the card. *Measuring the header at runtime for the
box's centre*: a layout pass for a constant the chip already relies on.

**Tradeoffs.** One more constant (`PROBLEM_HEADER`) that a change to the header's padding or
the maths line's height must follow; the click-through pins it at 69. The teacher's surface is
28% smaller than CSS px on every route, so any older measurement noted at 0.8 (the roster's
1204 px budget on a 1280 laptop is now 1778 layout px wide) is loose rather than tight. The
chips column moves 20 px right, the cards 20 px narrower.

**Defence.** The zoom is what the user measured with their own browser; a margin is the one
change that gives the gap without moving the chip or restyling the panel; and one shared
constant keeps the chip and the box level with the header by construction rather than by two
measurements that could drift apart.

## 2026-09-12 · The student's pathway strip shows the class's stage, from the teacher's function

**Decision.** The strip in the student's header (ticket 151) lights the same pill as the teacher's
Pathway card: `pathwayStages` in `lib/classStage.ts` returns the pathway's stages as over,
current or ahead, and `classStages` (the card) adds the counts on top of it. The strip carries no
count. It is pinned in the header's right-hand group, 24 px before the student's name.

**Context.** The user: "just as the teacher has transparency into the review process, want the
student to, as well. same exact idea with the light blue & then dark blue … have it be a part of
every student screen, in the edexia header." The class's stage is already a pure function of the
classroom, the live student's session and the clock (ticket 129).

**Alternatives considered.** *The student's own position* (feedback screen = individual review
current, the gate and the board = group review, waiting and frozen = class review, the report =
everything over): it reads as "where am I" and would say all done on the report even while the
class is still in group review. *A count beside the current pill* as on the card: the header is a
56 px strip that already carries the brand, the crumb and the name; a count there would crowd
the long crumbs. *Centred between the crumb and the name*: it moved sideways as the crumb changed
length between screens (the class name, the set's title, "Where the class is finding it hard").

**Tradeoffs.** With the class's stage, a student on the report while other groups are still
finishing sees group review ringed rather than everything over; the same is true on the teacher's
card and the two sides can never disagree, which is what "transparency into the review process"
asks for. The student's own position, if it is wanted, is a second function beside this one and
a one-line swap in `StudentApp`; it is in `FUTURE_FEATURES.md`. No count keeps the strip one
row at 15 px and clear of every crumb; the class-wait screen still shows the readiness count.

**Defense.** One function, two views: the teacher's split view shows the card and the strip
side by side and they always agree; a change to when a stage begins is made once. Pinning the
strip beside the name means the header's only moving part is the crumb, and the pills sit at
identical coordinates on every screen (asserted in the click-through).

## 2026-09-12 · A class review example stands for a mistake, and the mistake has a name

**Decision.** On the class review setup an example slot is chosen by exact mistake (the wrong
lines' TeX, the same identity as the mistake view's boxes), not by student. Each option's
working is the largest column of identical working among the students on that mistake; the
board's count is the students on that mistake. Every wrong line of the evaluation table carries
a `name` of five words or fewer, the teacher's word for the mistake, authored beside its clue
and note.

**Context.** Ticket 148: the user wants the taxonomy to drive "the selection of a student's
work" for class review instead of a dropdown of names. The setup suggested one student per
skill leaf and counted by leaf, so two different Q7 mistakes both read "12/20".

**Alternatives considered.** (1) Keep the leaf as the unit and improve the suggestion: two
mistakes on one leaf (Q7's three fraction slips) stay one bucket, which is the teacher's actual
choice. (2) Name the option from the classmates' notes (the most common note among its
students): grounded, but the live student has no note and two students on one mistake can
carry differently worded notes. (3) The `clue` or `note` already on the line: written to the
student, a sentence, not a label. (4) A mistake-level list instead of the problem list:
rejected by the user; the problem stays the unit of a slide.

**Tradeoffs.** Nineteen names to keep true when the table changes (a test pins the length). The
example is the *most common* working, so an unusual route to the same mistake never shows
unless the teacher picks the student by another path (none today). A group-fixed badge reads
the demo student's group only; the other groups have no run.

**Defence.** One identity for a mistake across the mistake view, the diagnostic and the board
keeps the counts consistent everywhere the teacher looks, and the picker's menu is exactly
the list a teacher would make by hand from the mistake view.

## 2026-09-12 · Force submit is one control per stage beside the current pill, and the gate is folded into it

**Decision.** The teacher's force submit moves from the class view's title line to the Pathway
card, directly right of the pill for the stage the class is on, and exists for the three stages
the students work through: `force-submit` (the set), `force-review` (the corrections) and
`force-group` (the board), one advance kind per stage (`FORCE_KIND` in `lib/classStage.ts`).
The `group-start` kind and the "start group now" line are gone: forcing individual review to a
close is what opened the gate, so the same advance does it. The button starts the grace at once
(no confirmation step); the minute with Cancel is the undo. Ending group review also marks the
classroom's shared run done with an `endedAt` at which the scripted race holds.

**Context.** The user: "move 'force submit' to be directly to the right of 'indiv working'.
change to 'force submit' from force assignment submit. have this be a feature for each of
'indiv working', 'indiv review', 'group review'. 1 at a time -- only the one that's currently
being worked through. keep the x/20 done & put it right under the button". FUTURE_FEATURES had
carried "explicit end individual review now and end group review now with the same grace" since
2026-09-09.

**Alternatives considered.**
- One generic `force` kind with the stage as a field. The student reducer would switch on the
  stage anyway, and the readiness gate and the pill wording key on the kind; three kinds keep
  every consumer a string comparison and the stored advance self-describing.
- Keep `group-start` beside `force-review`. Two advances that both end individual review and
  open the gate, one of them a text link under the other's count: confusing to press and to code.
- Keep the confirmation ("N still working · 1 minute to finish"). It does not fit beside a pill
  in a 320 px card, and the one-minute Cancel is a stronger undo than a confirm (the user's
  standing correction: no confirm gates on the primary action).
- End group review from the teacher's tab (dispatch `group/end` when the grace runs out there).
  Advances are applied by student tabs everywhere else; the student tab that ends the run is the
  same one that begins it, and a teacher tab that is closed at the deadline changes nothing.

**Tradeoffs.** The button is a compact 12 px pill rather than the standard `Button`, because the
space beside "indiv working" is about 100 layout px. A student forced out of individual review
with group review next goes straight onto the board without passing the gate, so their arrival
is never recorded; nothing reads it after the gate has opened. The race held at `endedAt` shows a
mid-problem group's bar short on the final standings.

**Defense.** One control, in the place the eye already goes to see where the class is, that
means the same thing at every stage: end this for everyone in a minute. The model stays pure
and per-tab agreement holds: the kind on the classroom, `canForce` and `standingsAt` derived from
state and the clock, and every student tab applies the advance by id as before.

## 2026-09-12 · The primary action stays put between screens: the same frame, not a shared component

**Decision.** The confidence screen (ticket 153) takes the start screen's outer frame (`px-10 pt-6 pb-5`,
an `mt-auto … pt-4` button row, a `size="lg"` button) so Submit sits on the exact rect START had;
the question and the answers keep a centred `max-w-3xl px-9` column nested inside that frame. The
alignment is repeated classes plus a click-through that measures both buttons, not a new shared
layout component. The empty spot after a not-confident answer is the Submit button itself rendered
`invisible`, so the row's height is the button's by construction.

**Context.** The user: "move submit to the bottom right. look at the 'continue' button from the last
screen & ensure that it's in the same position on the ipad as in that view, otherwise the jump is
random." The two screens are consecutive taps; the student's thumb is where START was.

**Alternatives considered.** *A shared `ScreenFrame` with a primary-action slot* used by both screens:
right in principle, but only two of the student screens place a lone button this way today (the
working screen's actions are in the pad's toolbar, the board and report have their own rows), so the
abstraction would have one real second user and would have to grow a variant per screen. *Moving the
whole confidence column to the screen's width*: the answers would stretch to 1100 px and the radios
would sit far from their labels' reading line. *A fixed-position button*: it would escape the flex
frame and the offer that rises above it.

**Tradeoffs.** Two screens now share a frame by convention; a change to one screen's padding silently
breaks the alignment, which is why the click-through asserts the two rects are equal rather than
asserting either one's numbers alone. The invisible button renders one extra `Button` after the
answer, hidden from assistive technology and the tab order.

**Defense.** The measurement is the contract: the ticket's script compares START to Submit on the
iPad stage at scale 1 and fails on any drift. A shared frame is the natural next step if a third
screen wants the same corner (noted in `FUTURE_FEATURES.md`); until then the nested column keeps
the content's geometry to the pixel (x 242 → 938 before and after) while only the button moves.

## 2026-09-12 · The goal is a stage of the session, and blank means no screen

**Decision.** The teacher's goal for the class (ticket 154) is a `Stage` of the student session
(`goal`, between `overview` and `confidence`), entered by `overview/start` only when the goal in
force is non-blank and left by `goal/continue`. The goal reaches the reducer through
`SessionEnv`, beside the pathway, from the active assignment. A blank goal is a blank goal: no
screen, CONTINUE opens the check-in. The fixture's never-rendered `intro` is replaced by `goal`
rather than kept beside it, and the six copies of the "stages before hand-in" list become one
exported constant.

**Context.** The user wants a goal written at creation, broadcast to every student once, after
the overview's button and before the confidence check-in; the button renamed CONTINUE because
the student is not starting yet. The goal lives on the classroom (the assignment), the screen
sequence on the session.

**Alternatives considered.** A `goalSeen` flag on the overview stage (no new stage, but every
reader of `stage === "overview"` would have needed the flag too, and the deep link and the
skip-to fixture would have had to fake it). Always entering `goal` and letting the screen skip
itself when blank (a one-frame flash, and a stage the student never sees in the stored run).
Keeping `intro` next to `goal` (two descriptions that mean nearly the same thing). Leaving the
six stage lists as they were and adding `"goal"` to each (a seventh copy next time).

**Tradeoffs.** A new stage touches every stage list, which is why the lists were unified first;
`SessionEnv` grows a field every test that builds one by hand must spread from `DEFAULT_ENV`. An
assignment stored before the field reads the fixture's goal (so running demos keep showing the
message) rather than none, a choice about old localStorage, not about product.

**Defence.** One dimension for "where is the student", read the same way by the deep links, the
skip strip, the reload and the teacher's live row; the reducer decides the skip from the same env
that already decides the pathway, so the rule is a unit test, not a screen's effect.

## 2026-09-12 · Reordering is press-and-hold on pointer events, in-house, with the review keyed to the set not its order

**Decision.** Drag to reorder (ticket 150) is one hook, `useReorder`, over a pure module,
`lib/reorder`, written here rather than taken from a library, and driven by pointer events
rather than the HTML5 drag API the groups page uses. The gesture is a press held still for
300 ms; a press that moves first is a click, a caret or a text selection. While held, the item
follows the pointer by transform and the others slide by transform, so nothing resizes; a
column of uneven cards is re-laid from its heights, a grid by its slots. The click that ends a
hold is swallowed, so a hold never also edits. `draftKey` now leaves the questions' order out,
so a reorder keeps the review's labels, answers and step. On the class review setup the
problem list keeps ranking by who struggled and the example cards stand in the assignment's
order; dragging a card changes the order Project sends.

**Context.** The user: "click to edit, click & hold to reorder"; "the rows being in order of
'who struggled the most' & the tiles being in order for the assignment … it'd be weird for the
student to go 7->2->3 … just want the option for the teacher to change"; the review's grid too;
one ticket. The create screen's tile is an editor whose whole face already takes a press, and
the teacher chrome is zoomed 0.72, so pointer deltas and layout px differ by that factor.

**Alternatives considered.** *The HTML5 drag API* (as `TeacherGroups`): no touch, the browser's
own ghost image, no control over the slide, and a `draggable` tile fights the text box's
selection. *dnd-kit or another library*: a dependency and its abstractions for two lists whose
only hard part, which slot and who slides, is forty pure lines that vitest covers. *A grip
handle or the Qn label as the handle*: the user chose hold-anywhere. *Reordering the problem
list on the setup page and projecting in list order*: the list is for choosing (ranked by
struggle) and the default projection would have become struggle order, which the user ruled
out for the students' sake. *Leaving `draftKey` order-sensitive*: a reorder after starting the
review would have thrown the teacher back to step one and dropped their answers for no reason
they could see; the decisions are all by id.

**Tradeoffs.** A 300 ms hold is a discoverable-by-accident gesture with no visible handle; the
lift (scale, shadow, cursor) is the only feedback that the hold took. Alt+arrows in a focused
text box override the word-jump keys. Touch is pointer events too, but the page can still pan
under a held finger; auto-scroll near the viewport's edge, a long-press context menu guard and
`touch-action` are not done. The hold suppresses the click that follows it by a capture-phase
handler on the item, which any nested control that relies on that click would need to know.

**Defense.** One gesture on three screens with one implementation, no dependency, the geometry
pure and tested against every from/to pair, the order stored where it already was (the draft's
array, the setup's `ordered`), and the review's decisions untouched by a move.

## 2026-09-12 · The review pad always reads something: a scripted correction, else the hand-in's own lines again

**Decision.** In individual review (ticket 158) the pad's script for a problem is `reworkScript(id)`:
its scripted correction from `RECOGNITION_REWORK` when it has one, otherwise the first hand-in's
script from `RECOGNITION`. Q9 gets a scripted correction of exactly one line, the greatest height
the scripted run skipped, so a single burst finishes the problem on screen. The deep-linked run past
the rework (`reworkedSession`) still leaves Q9 unfinished.

**Context.** The user, on Q9 with strokes on the pad and the "Read as" column still on its
placeholder: "the 'read as' feature isn't simulating in individual review. please fix. want to show
how the incomplete problem update happens." The simulation only had corrections for the five
problems that slipped and for Q10; on the other five the pad silently read nothing.

**Alternatives considered.** *A scripted correction for every problem*, each a different second
version: more data to keep in step with the marking tables for problems whose rework has no story
to tell (Q5, Q6, Q8 held). *A generic "unclear" line for unscripted problems*: the pad would read
something, but a line the marking table doesn't know would show as unclear in every later view and
could not finish anything. *Finishing Q9 in the deep-linked run too*: it would change the group and
class stages' fixtures (the board's n/20, the teacher's counts) for a demo moment that belongs to the
review screen alone. *A two-line rework for Q9* (substitute, then evaluate): the substitution line
is not in the marking table and the box counting down on the first burst is the clearer demo.

**Tradeoffs.** Re-reading the hand-in on Q5/Q6/Q8 is a plausible simulation, not a scripted story:
a demo that reworks one of them shows the same lines twice. Q9's rework is a continuation, not a
second version, so the row's label after finishing reads the first hand-in's count ("3 lines"), the
existing rule for a problem that had lines at hand-in.

**Defense.** Every pad now answers the pen, which is what a student expects from any pad on the
screen, and the one problem the demo needs to finish finishes in one burst with every dependent
count updating live (the incomplete box, the row, no guard, the mistakes box untouched). The
fallback is one line of data code and needs nothing kept in step; the marking tables already know
every line it can read.

## 2026-09-12 · The drag hold is 150 ms

**Decision.** `HOLD_MS` (ticket 150) goes from 300 ms to 150 ms (ticket 160).

**Context.** The user, after using it: "you wait too long before recognizing it as a 'click &
hold to drag'." A click's press-to-release is about 80–120 ms.

**Alternatives considered.** *100 ms*: inside the range of a slow click, so a deliberate click on
a tile could lift it. *200 ms*: still a visible wait. *A hold that shortens once the pointer has
not moved for a few frames*: more machinery for the same feel.

**Tradeoffs.** A slow, deliberate click (a trackpad press held a beat) now lifts the tile; the
release with no move drops it back where it was and the swallowed click means the tile does
not open for editing, so the cost is one wasted press.

**Defense.** One constant, tested to stay in the 120–200 band, and the click-through proves both
sides of it (80 ms clicks, 200 ms holds).

## 2026-09-12 · The group board is read live, in a column beside it

**Decision.** The group whiteboard shows its transcription as it is written (ticket 162): the
board takes the left two thirds of the row and a "Read as" column the right third, the same
column as the working screen, showing the run's shared `lines` on every member's iPad. A wrong
check's cut (the first mistake red, the rest a count) sits at the top of that column, under
"Not yet", and the next attempt's lines read in beneath it. No new state: the run's lines were
already classroom state, kept for the check.

**Context.** The 2026-09-10 whiteboard decision listed "recognising the board live" as an
alternative set aside, "transcription only at the check, matching where OCR is credible". The
user now wants the live column here as everywhere else the pad appears: the watchers otherwise
see ink and nothing read, and the pen-holder gets no sign that a line was taken before pressing
Check. The wrong-check panel above the board also pushed the pad down when it opened.

**Alternatives considered.** Keeping the transcription hidden and showing the column only after
the check (the same blind writing as before, for the sake of a credibility argument the working
screen does not make). Showing the wrong check's marks in place in the live list (the reducer
empties the lines on a wrong check so the next attempt starts clean; marking the old lines would
mean keeping two lists in the column). A full-width wrong panel above the grid as before (it
squeezed the board and put the marks nowhere near the lines). A `1fr_320px` column like the
working screen's (the row is 1116 px with no problem column; a third reads as the same
proportion and gives the two-case line room).

**Tradeoffs.** The board's paper is narrower (730 px instead of 1116), which the synthetic
scribbles and the demo's lines fit with room. The wrong check now stays in the column while the
second attempt is read beneath it, two lists in one column for that stretch. The 2026-09-10
rationale about OCR credibility is dropped for this screen; the demo's recognition is scripted
on every screen anyway.

**Defence.** One component (`ReadAs`) reads the pad on the working screen, the practice pad and
now the group board, and one list (`run.lines`) is both what the column shows and what the next
burst reads on from, so the column can never disagree with the check.
## 2026-09-12 · The teacher bar's tabs are indigo pills at the right, the current one filled deep; "black" is ink (ticket 163)

**Decision.** The Class · Mistakes · Groups tabs move to the right end of the teacher bar as pills in
the soft indigo "New assignment" wore (`bg-accent-soft text-accent-deep`), the current page's tab
filled deep indigo with white text, and "New assignment" becomes a white pill with a 1 px `ink`
border and `ink` text. Every pill carries a 1 px border (transparent on the tabs) so all are the
same height.

**Context.** The user: "move Class Mistakes Groups to the right, over towards 'New Assignment'.
also make those have the current coloration New Assignment has. change New Assignment to a white
pill with black border & black text." Before, the current tab was the only indigo pill and the
others plain text, so the colouring itself said where you were; with all three the same colour that
signal needs another form.

**Alternatives considered.** *All three tabs identical, no current mark*: the bar would no longer
say which page is open. *An underline or bold label for the current tab*: a second visual language
in a row of pills. *A darker soft fill (`accent-line`)*: too close to the hover tint to read as
"current" rather than "hovered". *`#000` for "black"*: the only pure black on either side of the
app; every heading, label and body text is the navy ink.

**Tradeoffs.** The deep-filled current tab is the strongest element in the bar, stronger than the
white "New assignment" beside it; the action reads by its contrast in shape (bordered, white) rather
than by weight. Reading "black" as ink is a judgment on the user's words; it is flagged in the
ticket and a one-token change if wrong.

**Defense.** Pills of one colour with the current one filled is the pattern every segmented
control uses, so it needs no learning; the hover tint (`accent-line`) sits between the soft and deep
fills so the three states stay distinct. Ink keeps the bar in the design's palette.

## 2026-09-12 · One examples component for the board and the student, fitted rather than wrapped, and the tag keyed on the exact mistake

**Decision.** The examples of whole-class review are one component, `ExampleColumns` (ticket 161),
rendered by the smartboard (`size="board"`) and by the student's frozen screen (`size="student"`),
each passing what goes in an example's corner (the count; the tag). Lines are `whitespace-nowrap`;
the component measures every line at the size's maximum against its box and, only when the columns
are narrower than the widest line, scales every column's lines down together by the one ratio that
fits. The sizes (board 21 px with a 380 px pad, student 16 px with a 310 px pad) are chosen so that
at the design widths (1440, 1180) no fitting happens. The student's "your initial response" tag
goes on the example whose exact mistake key (`mistakeOf`, the wrong lines' TeX) equals that of the
student's first hand-in (`session.lines`), not their rework.

**Context.** The user, with a screenshot of the board at Q2 where every first line broke in two:
make the student's class-review screen show the same as the board, reorganise the board so no line
spills, and replace the board's "13/19" with a light blue "your initial response" tag on the
student's screen. The student's screen had shown their own handed-in and reworked lines instead.

**Alternatives considered.** *Two renderings kept in step by hand* (the board's markup and a copy in
`FrozenScreen`): the two had already drifted (the student split two-case lines, the board did not).
*Fixed sizes only, no fitting*: the board is designed at 1440 but the user looks at it in a 1396-wide
window, where the widest line fit by 0 px; a fixed size that also holds at 1280 would be 17 px on a
projector. *`FitText` per line*: lines in one column at different sizes read as different weights;
the column set must shrink as one. *Tagging by identical lines*: Sam's four-line Q2 working is the
same mistake as the three-line example on the board and would go untagged. *Tagging by the rework*:
the rework is correct, so the tag would sit on the model answer for every student who fixed their
work in individual review; the user asked for the initial response. *Sam's own lines in the tagged
column*: the user asked for the board's view; deferred in `FUTURE_FEATURES.md`.

**Tradeoffs.** The fit is a layout effect that measures a dozen boxes on mount, on a change of what
is shown and on resize (a re-render with the same lines, the board's once-a-second tick, does not
re-fit); the server renders at the maximum, so a narrower window sees one frame at the maximum. The
board's lines are 21 px where they were 26 px, and the pad 380 where it was 400. The tagged
example's lines can differ from the student's own by a step. `FrozenView` lost `versions` and
`attempted`; the student's own class-review versions are gone with them.

**Defense.** One component makes "the same as the board" true by construction, including marks
and any future change to the cards. Fitting the set rather than the line keeps every column at
one size and guarantees no line ever wraps at any width, while the chosen sizes keep the design
widths exactly as laid out. Keying the tag on the exact mistake is the same identity the picker
and the counts already use (DECISION_LOG 2026-09-12, ticket 148), so what the student sees tagged
is what the teacher chose to put up for their mistake.

## 2026-09-12 · The teacher bar's tabs sit at the left beside the brand again; the pill colouring from ticket 163 stays (ticket 165)

**Decision.** The Class · Mistakes · Groups pills move from the right end of the teacher bar to
directly right of the "Edexia · Maths" wordmark, in one `gap-5` row with the brand (the student
header's brand-to-crumb gap). Their colouring (soft indigo, the current page filled deep with
white text) and "New assignment" as a white ink-bordered pill are ticket 163's, unchanged. This
supersedes the placement half of the 2026-09-12 ticket 163 entry; its colouring half stands.

**Context.** The user, with a screenshot of the Groups page: "move the purple tabs to left --
directly right of Edexia Maths". Ticket 163 had moved the tabs right on the same day's earlier
request; with the pills coloured, the user wanted them back beside the brand.

**Alternatives considered.** *The tabs at the left as plain text again (pre-163)*: the user asked
to move the pills, not to undo their colouring. *A larger gap or a divider after the brand*: the
student header puts its crumb a `gap-5` after the same brand, so the two bars match with no new
element. *Keeping `ml-1.5` on "New assignment"*: it separated the action from the tabs; with
nothing before it, the group's own `gap-3` is the spacing.

**Tradeoffs.** The deep-filled current tab now sits at the left, where the eye lands first, so the
bar leads with "where you are"; the white "New assignment" at the right reads as the one action.
The right group is shorter, so on the roster page (1204 of the 1280 laptop's 1208 px) nothing
changes in the content beneath.

**Defense.** Places at the left, actions and identity at the right is the shape of the student
header (brand and crumb, then the pathway strip and the name), so the two sides of the app now
share one bar layout; the pill classes did not move, so the current mark, hover and heights are
exactly what ticket 163 verified.

## 2026-09-12 · The roster's heads stick under the bar; the roster card stops being its own sideways scroller (ticket 167)

**Decision.** Every header cell of the class view's roster is `position: sticky; top: 0` on paper at
`z-20`, with its bottom line drawn as an inset shadow, so the row sticks to the top of the teacher
frame's scroll region (directly under the Edexia · Maths bar) while the teacher scrolls to later
students. To make that possible the card around the table is `overflow: clip` instead of
`overflow-x: auto`: it still clips to its rounded corners, but it is no longer a scroll container.

**Context.** The user, with a screenshot of the roster scrolled to its later rows: "as i scroll down
in the table, i want 'algebra', etc. with category headers to remain visible as kind of a sub header
to the Edexia Maths header." A sticky element sticks within its nearest scrolling ancestor; with
`overflow-x: auto` on the card, that ancestor was the card, which never scrolls vertically, so the
heads could never reach the frame's scroller (`main[data-teacher-scroll]`, ticket 68's only scroller).

**Alternatives considered.** *A cloned header rendered in the bar once the row scrolls out*: a
second copy of the row to keep in step (column widths, the open column, hover controls) and a
scroll listener, for what one CSS property does. *Sticky on the `thead` element*: works in current
browsers, but the collapsed border and the per-cell background are the parts that go wrong, so the
cells carry the styles themselves. *Keeping the card's sideways scroll and giving the table its own
vertical scroller*: the page would then have two nested vertical scrollers and the rubber-band the
frame was built to avoid. *Making the bar itself taller with the categories in it*: the categories
belong to the table (they are its columns, with the open-column controls), not to the app's bar.

**Tradeoffs.** In a window narrower than the roster (below the 1280 laptop, where the roster is
1204 of the card's 1208 px) the whole frame now scrolls sideways instead of the card alone, since a
clipped card takes its content's minimum width; at both laptop sizes nothing overflows
(`check:laptop`). The header `tr`'s collapsed 1 px border is gone in favour of the inset shadow,
so the table is 1 px shorter. The heads sit in a `z-20` stacking context: anything inside a row
that wants to rise above them (a flyout opening upward) would need a higher index; the row flyouts
open downward and none does today.

**Defense.** The user asked for a sub-header of the bar, and a stuck row flush under the bar on the
same paper is exactly that with no second copy of the row: the hover controls, the open column, and
the column edges stay the real ones. One class string (`HEAD`) on the cells and one overflow
keyword on the card is the whole change, and the frame-scrolls-sideways case is one the laptop
guard measures on every route.

## 2026-09-12 · The teacher's student report is the class view's full dot view, fixed (ticket 169)

**Decision.** The Skills card on the teacher's individual view renders the same column view the
student's own report uses (`SkillColumns`), in the class view's "see dot skills" state (`expanded`:
every category's groups, every group's skills) and `locked`: the group rows are plain text, not
toggles, so nothing on the card opens or closes. A skill is still a button that opens the work
behind it beneath the columns, and the commentary's idea filter still narrows the lit skills in
the same fixed view. The old browse drill (`HierarchyDrill`'s default export: six category rows,
one branch open at a time) is deleted rather than kept beside it.

**Context.** The user, on Sam's report: "automatically open to full dot view. don't have
functionality for collapse or expand here. just show full dot view fixed". The report is the
place a teacher reads one student in full; a drill that shows one branch at a time hid five of the
six categories' detail behind clicks, and its category rows did not look like the row the teacher
had just left on the class view.

**Alternatives.** *Keep the browse drill and start it fully open*: its layout is an outline with
the work beside it, not the columns under pills the teacher knows from the roster, and its rows
would still be toggles to disarm. *A third component for the report*: the column view already
draws exactly the class-view row, with the per-column text fitting; one more `mode` and a
`locked` flag is the whole difference. *Locked groups as disabled buttons*: a disabled button
still reads as a control (cursor, focus order, aria-pressed); a `div` with the same layout and an
image role is what a fixed row is. *Locking the skills too*: the work behind a skill is the
report's reason to exist; opening it is not "collapse or expand", the columns never change.

**Tradeoffs.** The column text fits per column at 9.5–11.5 px here (the class view's row fits at
9–10.5), small at the teacher frame's 0.72 zoom; the columns are equal sixths of the card, so the
longest label in each decides. Group rows are no longer in the tab order. The browse drill is gone
from the codebase (in git at `ebd613d` if a compact one-branch view is wanted again). The card
loses its uniform padding: the chip band runs edge to edge and the eyebrow and key carry their
own insets.

**Defense.** The report now shows what "see dot skills" shows, at once and for good, which is the
request word for word; the shared component means the report and the roster cannot drift apart;
and the one interaction kept (a skill's work) is the one that adds information rather than
rearranging it. Deleting the browse drill removes a second way of drawing the same tree that no
screen uses.

## 2026-09-13 · One extraction funnel: typed, pasted, dropped and uploaded problems all become streamed drafts in unconfirmed tiles (tickets 170–173)

**Decision.** Every way a question enters an assignment (a typed line, a pasted screenshot or list,
a dropped image or PDF, a Finder upload) feeds one API route, `POST /api/extract`, whose output is
always a stream of problem drafts: a stem and its TeX, with the worksheet's own label, the page,
and a figure box when a diagram belongs to the problem. No solution or answer is extracted (see
`ASSUMPTIONS.md`, the grading engine). Drafts from a file land inline on the create screen as
tinted unconfirmed tiles, one per problem (sub-parts one each with the stem repeated), each with
keep and discard; the pinned bar gains "Add N" and "Discard" while Continue stays live and confirms
everything on the way through. A typed tile keeps the local shorthand parser (`lib/mathInput.ts`)
as its instant preview and the model's TeX replaces it on Enter or blur, confirmed at once. A bad
extraction is corrected by editing the TeX or by a one-line plain-language "Fix" the model applies
(with the source crop in hand), never by re-cropping the image. Caps: twenty images or five PDFs
per drop, ten MB a file, ten pages a PDF; extras are left out and named, not the whole drop
refused. The route is modelled on the help chat's (credentials, the first event awaited before the
response commits, typed failures) with a separate model constant and a fixture mode behind
`EXTRACT_FIXTURES=1` that matches sources by hash to drafts rendered from the demo set.

**Context.** The user (2026-09-12): a teacher should be able to screenshot a problem elsewhere and
drop it in, or click to upload; "the type a question doesn't really work … needing to type in
python … won't work in practice"; and "drag & drop a whole doc … the program can auto split it
into problems". An interview of thirty questions on 2026-09-12/13 settled the shape above. Until
now the create screen's only contract was the shorthand grammar, the app's only model call the
help chat, and nothing typed had a model or a file behind it.

**Alternatives.** *Three features* (a typed path, an image path, a document path) each with its
own output: a screenshot of four questions would then be one problem or need its own splitter;
one extractor seeing more content is the same code. *A separate review screen for extracted
drafts*: a second place to learn, when the tile grid is already where questions are added and
read. *Gating Continue on confirming the drafts*: against the standing rule that the primary
action stays on; a discard per tile is the correction. *Retiring the shorthand parser*: typing
would wait on a round trip for every preview; kept as the preview, the model is the final word.
*Cropping a region as the fix tool*: heavy to build and rare; a sentence fixes a denominator.
*The model emitting worked solutions for the teacher to check*: the engine assumption makes them
dead weight in the prompt and the stream. *A region or page-range picker before extraction*:
with the ten-page cap, extracting everything and ticking what to keep is cheaper and simpler.
*Building the screens against a stub first*: the UI would be rebuilt when the real output was
shaped differently; the real route with a fixture mode gives both.

**Tradeoffs.** A model in the typing path means a typed tile can change after the teacher looks
away (on blur); the parser's preview and the model's TeX can differ, and the teacher's own words
are kept as `text` so re-editing starts from them. Streaming JSON lines from text output (rather
than one tool call) means a malformed line is dropped, never fatal, and counted. Fixture mode by
hash means a fixture file edited by hand stops matching; the render script is the source of
truth. Sub-parts as separate tiles lose the parts' grouping on the screen (label "4(a)" carries
it). The caps are round numbers chosen for a laptop and one teacher, not measured.

**Defense.** One funnel means every input, present and future (a bank search, "three more like
Q4"), ends in the same drafts and the same tiles, and the whole thing is proved once on the
simplest input (a screenshot) before PDFs and typing join it. Inline unconfirmed tiles keep the
teacher on the screen they know with one new state to learn, and the tint plus keep/discard is
the review. The fixture mode keeps the click-throughs deterministic without a key while the
real route is the one the screens are built on.

## 2026-09-13 · PDFs go to the API natively and are drawn in the browser by pdfjs-dist; sources live in IndexedDB (tickets 171–172)

**Decision.** A dropped PDF is sent to the model as a document block, untouched; the browser
draws its pages itself with `pdfjs-dist` (a new dependency, loaded only on the create screen) for
the tile thumbnails and the figure crops. Uploaded files, page thumbnails and figure crops are
kept in the browser in IndexedDB (`lib/sources.ts`), and the classroom store's draft holds ids
and small data URLs only. Docx is not accepted; the bar says "export it as a PDF".

**Context.** The API takes PDFs directly, so no server rasterising is needed for extraction. But
the create screen needs pixels: a tile shows the page its draft came from (Q8) and a figure in a
worksheet is cropped from the page (Q11), and a browser cannot draw a PDF page without a library.
Sources have to be kept for those crops and for a later "Fix" that sends the region along; five
files of ten MB do not fit localStorage, which is where the classroom store lives.

**Alternatives.** *Rasterise on the server and send images*: a sharp/pdf dependency on the server
plus a second copy of every page over the wire, when the API reads the PDF itself. *No thumbnails
or crops for PDFs this round, text labels only*: a worksheet PDF with a graph is the common case
for figures; a feature that works for screenshots and not PDFs would confuse. *Sources in
localStorage as data URLs*: over its limit on the first real drop. *Server-side file storage*: a
separate build (auth, buckets, lifetimes) deferred to future features; nothing here needs a file
to outlive the browser. *Accept docx via a server conversion*: a heavy dependency for a file a
teacher exports to PDF in one step.

**Tradeoffs.** `pdfjs-dist` is a large package with a worker to bundle; it is dynamically imported
so no other screen pays for it. IndexedDB is asynchronous, so a tile's thumbnail is a data URL on
the draft (synchronous render) and the Blob is read only for crops and Fix. Sources are per
browser: a draft opened on another machine has tiles but no thumbnails or crops. The page
count is read client-side before sending, which needs the library before the first request.

**Defense.** The API does the reading and the browser does the drawing, each with what it is good
at, and nothing is stored twice on the server that has no storage. IndexedDB is the one browser
store sized for files, and putting only references in the classroom store keeps that store as
small and synchronous as every reducer expects.

## 2026-09-13 · The category pill is the header: one labelled pill per column, one width per row (ticket 174)

**Decision.** On the teacher's student report and the student's own report the row of category
chips above the columns is removed and each column's pill carries the category's name in white
uppercase on the status colour (grey in a hollow not-seen pill). Every pill in a row is the same
width, the width the widest name needs, and that is achieved without measuring: each pill stacks
all six names in one grid cell and shows only its own. The text size is fitted to the row from
11 px down to 9 px so six equal pills always clear each other; the student's reflection panel is
320 px instead of 440 so the report's card has the room.

**Context.** The user: "instead of the category header as separate, take the category pill, make
it wider, & put the category name there in white text. remove category headers. use the widest
necessary pill to fit text to set the width for all pills", and "the reflection panel can be made
narrower to make more room for the heart of the report". The chips and the pills had said the same
thing on two lines, and on the iPad the chips overlapped (GRAPHING COMMUNICATION REASONING ran
together in the user's screenshot).

**Alternatives.** *Measure the widest pill in JS and set a width on the others*: a second layout
pass and a state for something CSS grid does exactly (stacked names in one cell). *One fixed pill
width*: the widest name changes with the unit's categories. *Keep 11 px text everywhere and let
the student's pills overlap or wrap*: the request is one width per row and the names must read;
fitting the size is what the trees beneath already do. *Per-category column widths, as the
roster has*: the request is equal pills, not equal columns, and the trees' columns stay equal
sixths. *Keep the reflection panel at 440 and shrink the pills further*: the user asked for the
panel to give way; two or three sentences fit a 256 px textarea.

**Tradeoffs.** Six equal pills at the widest name cost more row width than six chips sized to
their own names, so the student's report drops to 9 px text (the teacher's stays at 11); the fit
is a canvas measure of the name as set, and a font that loads late would be measured in the
fallback (the effect re-runs on resize, not on font load). Every pill carries six spans, five
invisible. The class view's roster keeps its bare 28 × 13 pills under header chips: the two
surfaces no longer draw the category marker the same way.

**Defense.** One element now says what two said, in the colour that is the point of the row, and
the equal width the user asked for comes from the grid itself rather than a measurement that can
lag a render. The fitted size keeps the rule true on both surfaces without a per-surface constant,
and the narrower panel is the user's own call on where the room should go.
## 2026-09-13 · Extraction streams JSON lines as the model's text, not a structured output; fixtures are matched by hash (ticket 170)

**Decision.** The extractor's brief asks the model to write one JSON object per line and nothing
else, and the route cuts the text stream into lines as it arrives, parses each with
`parseDraftLine`, and sends it on at once as an NDJSON event; a line that is not a draft (a
fence, a stray word, bad JSON) is dropped and counted on the `done` event, never fatal. The route
takes a PDF as a native document block and an image as an image block, so nothing is rasterised
or OCR'd on the server. In fixture mode the route answers from `fixtures/extract/manifest.json`
by the SHA-256 of the dropped bytes (typed text goes through the shorthand parser, with a small
table of plain-English lines), one draft per 120 ms beat, so the client's streaming path runs
without a key.

**Context.** The interview settled that drafts stream in one at a time so a teacher watching a
worksheet turn into tiles knows it is working (Q16). The API's structured outputs
(`output_config.format`) guarantee a schema but arrive as one object at the end of the turn;
a tool call streams its input as JSON deltas that are not parseable per draft. The help chat
route already streams text deltas, so the same shape carries drafts one line at a time.

**Alternatives.** *Structured outputs*: schema-guaranteed, but the first tile would appear only
when the last problem was read; for a ten-page PDF that is the "blank grid for a minute" the
interview rejected. *One tool call per draft*: a round trip per problem, ten model turns for
ten problems. *Rasterise PDFs server-side and send page images*: a sharp/pdf dependency and a
second copy of every page over the wire when the API reads the PDF itself; the browser draws
pages for thumbnails with pdfjs (ticket 172), the API reads the document. *Fixtures by file name*:
any file called `worksheet.png` would match; by hash, only the rendered bytes do, and a wrong
fixture shows on screen as "No fixture for …" rather than as silence.

**Tradeoffs.** A free-text line is only as well-formed as the model makes it: the parser is
strict (a draft with neither stem nor TeX is dropped, a bad figure is dropped with the draft
kept) and the count of dropped lines rides on `done` so the screen can say "n lines unread".
The server-side page cap is best effort (`pdfPageCount` counts page objects; compressed object
streams read as unknown and pass); the browser's pdfjs count is the real gate (ticket 172).
Re-rendering the fixtures changes their hashes, so the manifest and the files move together
and a vitest test fails if they drift. The live model has not been run on the fixtures from this
machine (no key here); the parser and the brief are tested, the model's actual output is not.

**Defense.** The stream is what the tiles need (a problem at a time, in reading order), the
parser is tested against everything a model might write around its lines, and the fixture
mode exercises the same client code the model does, so the screens in tickets 171–173 are built
against the real route's shape with deterministic content.

## 2026-09-13 · Category history on the class view: pills named in place, five dated pills above, a cream sheet cut through a pill (ticket 175)

**Decision.** History mode is one student's and lives in the roster itself: their category pills
widen to carry their category's name (each to its own name's width, at least double the pill, the
height unchanged) and a click on one stacks that category's last five results above it, sized by
the pill's own width so the dates' pills match it exactly. The cream that hides the rows above is
one `cream-deep` sheet from the Algebra column through Set, its top edge always on the midline of
a pill (or, for the top two rows, the heads covered whole and the sheet risen out of the card to
the "due" line's midline); it is drawn beside the card in a `relative` box, not inside it, and
measured from the table by a ResizeObserver rather than set in a layout effect. The five
results are simulated by a seeded mix around today's status, an average rather than a trend.

**Context.** The user: "a short color history trail … the last 5 assignments/assessments of that
skill … open up OVER the other students that it comes to block, so don't add white space to shift
down … block it for the whole width … have the white space intersect an above student halfway
through a pill in order to clearly indicate that it's hiding things … that cream color for more
contrast". In the interview: every pill the widest name's width was chosen, then found impossible
(Inter's uppercase COMMUNICATION is 88 px at 9 px; the Algebra column is 80), so each pill takes
its own name's width with a 56 px floor. The trend idea was refused: "showing dark green on an
assignment 1 week ago will be bc that skill was easier … not like each student goes from 80% avg
to 90% avg".

**Alternatives.** *A flyout panel beside the row* (a card with five rows per category): leaves
the pills where they are but puts the history somewhere other than over the pill it belongs to;
the request was a trail rising from the pill. *Pills all one width with the text shrunk*: the
widest name at 5 px is unreadable; per-name widths keep 9 px everywhere. *The stack and sheet
both inside the card*: the card clips its overflow (ticket 167), so the top rows' sheet could not
rise over the "due" line; the stack stays in the cell (it is never clipped: the top row's stack
ends 10 px inside the card) and only the sheet moves outside, which also lets it sit under the
stacks (z-25 under z-30) and over the stuck heads (z-20). *A layout effect that sets state* for the
sheet's box: the repo's lint forbids it; the observer fires once on observe and again when a
drill opens or the window resizes, which are the only times the box changes. *A genuine trend in
the simulated colours*: refused as unrealistic; a fixed mix keyed on today's status with one
student dark green throughout. *Hiding the sheet's step*: the wide part stops at the student's row
top so their confidence word and set count stay clear, and an apron over the category columns
carries the cream down to 2 px above the pills so the whole stack stands on cream; the notch this
leaves at the row top is the price of hiding nothing of the student's own.

**Tradeoffs.** Three row buttons in the old two-button height means 14 px buttons (11 px text at
its own line height) instead of 21; the header's stack keeps its taller buttons, so the two stacks
no longer match in height. The pill names read at 9 px, 6.5 px on screen at the teacher frame's
0.72 zoom: legible, small. The width animation needs `interpolate-size: allow-keywords` (Chrome
129+); elsewhere the pill snaps wide. `historyFor` is deterministic but invented; the day real
evidence exists it is the one function to replace. The sheet is measured, so a change in row
height without a table resize (none exists today) would leave it misplaced until the next
observer event.

**Defense.** The trail rises from the pill it describes, the other students are hidden by a sheet
that visibly hides (its edge through a pill, never a clean gap), nothing on the roster moves, and
the student's own drill can stay open beneath it all, which is the request in full. Per-name pill
widths are the only readable way to name every pill inside its column; the observer is the
lint-clean way to measure; and an average of colours around today is what a teacher would actually
see across five sets of differing difficulty.

## 2026-09-13 · The row buttons' grace ends at the row's first pill, measured on pointer move (ticket 180)

**Decision.** Ticket 131's one-second grace (the row buttons stay away after the pointer leaves a
category pill or drill dot, so a sweep across markers never flashes them) ends the moment the
pointer is left of the row's leftmost pill button, read from the pointer's x on every `pointermove`
inside the student's tbody, off every marker. The line is the first pill *button's* left edge, per
row, and ending the grace quiets the grid's one clock; to the right of that line the second holds.

**Context.** The user: "once teacher moves left of leftmost pill, there is no lag & the 3 options
auto pop up". The buttons sit in the name cell, left of every marker; a teacher heading that way
has left the pills behind, and the wait reads as lag.

**Alternatives considered.** (1) Hover on the name cell (`onPointerEnter` on the first `td`): the
Algebra cell's ~16 px of padding left of its pill would keep waiting, and a pointer crossing the
cell boundary is the only signal, so a pointer already in the name cell when the clock starts
(it cannot be: the clock starts on leaving a marker) is moot but the padding is not. (2) A per-row
clock: rejected in 131 and still wrong here, since a row entered from another row's pill would
show at once whatever the x. (3) Shortening the grace: the gaps between pills are the case the
grace exists for.

**Tradeoffs.** A `pointermove` listener per student tbody with a `closest` and one
`getBoundingClientRect` while the grid is not quiet; nothing while quiet (the first check) or over
a marker. The threshold is the pill button, not the visible pill graphic (6 px narrower each side):
the button is the hover target and takes the cream hover fill, so it *is* the pill under the pointer.

**Defense.** The rule is stated in the teacher's terms: the pills are to the right, the buttons to
the left, so heading left is the exit. Everything 131 verified still holds to the right of the line
(the click-through re-checks the gap, the return after the second, the column, the drill, and
history mode's faded rows).
## 2026-09-13 · An uploaded question's tile text is its stem then its TeX; `$…$` is an explicit inline delimiter; TeX passes through the shorthand (ticket 171)

**Decision.** A question the model read out of a picture becomes a tile whose text is the
model's stem on the first line and its TeX on the second (`draftText`), the newline form the
create screen's parser already had for "prose, then the expression". To make that text round
trip, `lib/mathInput` gained two rules: a run between dollars in the stem is maths by
declaration, kept as written and always inline (never the centred expression); and a line that
is already TeX (a `\command` or a brace group) passes through `toTex` untouched instead of being
read as calculator shorthand. A prose-only draft's text ends in a newline so its last word is
never taken as the expression. The tile itself is otherwise the same tile: one textarea, one
render, one parser.

**Context.** The interview settled that an uploaded tile holds the model's TeX for direct
editing with the same tile shape as a typed one (Q18). A typed tile's text is one shorthand
line; the model returns two things, prose and TeX, and TeX like `\frac{1}{3}x^2` would be
mangled by the shorthand's fraction and power rules while inline maths in the prose (`$y = x^2
+ 4x + 5$`) has no place in the shorthand grammar at all. The explicit delimiter was itself a
deferred idea ("Teaching the typing convention").

**Alternatives.** *A second tile shape for uploads* (stem field + TeX field): two editors to
maintain and two reviews to learn; the newline form already carries both halves. *Storing stem
and TeX only and never showing text*: the teacher could not edit an uploaded question in place,
and the review step's grid, the draft key and the store all read `text`. *Reading TeX through the
shorthand anyway*: `x^2` survives (as `x^{2}`) but `\frac` and `\sqrt` do not; the pass-through
keeps the model's TeX exact and costs typed users nothing, since shorthand never contains a
backslash or a brace.

**Tradeoffs.** A TeX line with no command and no brace (`x^2 + 5x + 6 = 0`) is the shorthand's
own subset and comes back normalised (`x^{2}`), harmlessly. A prose stem with a bare number in it
("after 5 seconds") still gets that number set inline as maths by the token rule, as typed prose
always has; the model writes real inline maths as `$…$` so it is explicit. The trailing newline on
a prose-only tile shows as an empty second line in the editor. `$` is now special in a typed
line: a teacher typing a price loses the dollar sign into a maths run when a second `$` follows on
the line (an unmatched `$` is plain text).

**Defense.** One tile, one text, one parser for both origins is the smallest thing that gives
the teacher direct editing of what the model read, and the two parser rules are ones typed
input wanted anyway: an explicit way to say "this is maths" and TeX accepted as TeX.

## 2026-09-13 · pdfjs-dist is loaded on first use with its own worker bundled by Next; a PDF's pages are drawn for thumbnails only (ticket 172)

**Decision.** `lib/pdfPages` imports `pdfjs-dist` dynamically the first time a PDF is opened and
points it at its own worker through `new URL("pdfjs-dist/build/pdf.worker.min.mjs",
import.meta.url)`, which Next bundles as a static asset. The browser opens a PDF once per drop:
to count its pages (refused on the tile past ten, never sent) and to draw, once per page, the
160 px thumbnail each of that page's tiles shares. The bytes themselves go to the route as a
native document block; nothing is rasterised for the model.

**Context.** The interview's decision (above, "PDFs go to the API natively and are drawn in the
browser by pdfjs-dist") left the mechanics open: how the library and its worker reach the page,
and how much drawing is done. pdfjs needs a worker script URL; the package ships one; a copy in
`public/` would be a second copy of a 1 MB file to keep in step with the dependency.

**Alternatives.** *A copy of the worker in `public/`*: simple, but it drifts from the installed
version and is committed weight. *No worker (pdfjs's fake-worker mode)*: parsing on the main
thread, which stalls the grid while a ten-page PDF opens. *Drawing every page up front*: ten
canvases for a file whose drafts may all be on page one; drawing on demand per draft's page
costs one render per page that has a draft. *Counting pages on the server only*: the route's
count is best effort (compressed object streams read as unknown); the browser's is exact and
comes before the upload.

**Tradeoffs.** The worker is a separate 1 MB fetch the first time a PDF is dropped, then cached.
A page thumbnail at 40 px in the tile's corner is an A4 page at 28 × 40, almost blank at that
size; it tells the teacher which page, not what is on it. `renderPage` at full scale exists for
ticket 173's figure crops but nothing calls it yet. The document is closed after the read, so a
"Fix" that wants the page again reopens the file from IndexedDB.

**Defense.** One dependency, loaded only where it is used, with its own worker kept in step by
the bundler; the model reads the document, the browser draws only what a tile shows.

## 2026-09-13 · History mode: one StatusDot for every pill, the five spread over a white sheet that stops at New skills (ticket 181)

**Decision.** Today's named pill in history mode is the roster's own `StatusDot` given a `label`, not a
separate element, so its height and place are the plain pill's by construction; the five dated pills
are the same `StatusDot` with the date as label. They are drawn by `HistoryBlocker` beside the card,
from measured pill rects, in a column from the sheet's top to today's pill with `justify-evenly`, so
the five fill the sheet's height with equal space rather than huddling 2 px apart above the pill. The
sheet is `paper` (white) and spans the category columns only, Algebra through New skills.

**Context.** The user, on Jordan's Algebra history: "make it evenly spaced from bottom to top of box …
change box color to white … have it extend through new skills, not all the way through set … the
pill is shorter than the og category pill. make it the same height as the category pill & make all
history pills that height as well". The named pill measured 13 px like the plain one, but it was a
different element (`inline-grid` inside an `inline-flex` wrapper) at a fractionally different place, and
at the teacher frame's 0.72 zoom 13 px is 9.36 device px: two elements a fraction apart can snap to 9
and 10. One element removes the question.

**Alternatives.** *Keep `HistoryPill` and pad its height*: a second pill drawing to keep in step with
`PILL_SIZE`; the label as a `StatusDot` prop means there is one. *Spread the five inside the cell*: the
stack lived in the cell and could not know the sheet's height; the sheet's measurer already has every
number, so the stacks moved to it. *Stop the sheet at the row top and drop the 2 px apron*: with the
sheet no longer over Confidence and Set there is nothing of the student's to protect; one rectangle
to 2 px above the pills is simpler and the five's bottom gap is then the same as every other gap.
*Cream for contrast*: asked for and reversed; the cut pills at the top edge and the page the top
rows' sheet rises over are what show the sheet now.

**Tradeoffs.** A white sheet on a white card is visible only by what it hides (logged in
FUTURE_FEATURES with a hairline as the fix if wanted). The five's spacing depends on the sheet's height:
about 15 px on a mid-roster row, 12 over the "due" line, more under a drill (a ceiling is logged).
`StatusDot` gains a prop and a labelled branch; every other caller passes no label and is unchanged.
The stacks are measured once per mount and on table resizes, so a named pill whose width changed
without a table resize would leave its stack misaligned; nothing does that today.

**Defense.** The user's four asks are met in the way that cannot drift: one element for every pill,
one measurer for the sheet and the stacks, one rectangle over exactly the columns that carry pills.
## 2026-09-13 · The model's reading of a typed line sits beside the text, not in it; a Fix replaces the text; figures are cut in the browser (ticket 173)

**Decision.** A typed tile keeps the teacher's own words as its `text`; the model's reading
(`model: { for, stem, tex }`) is a second thing on the item, used for the render and the stored
stem and TeX only while `for` still equals the text, and dropped the moment the text changes.
A read is sent once per change as the focus leaves the tile (Enter or blur), never per
keystroke. A Fix, by contrast, replaces the tile's text with the corrected stem then TeX
(`draftText`) and clears the reading: the teacher asked for a change, so the words change. The
picture sent with a Fix is the whole source (the image, or the PDF page drawn at 1.5×), since
the model boxes figures, not problems. A figure is cut in the browser from the image or the
page drawn at 2×, the full PNG kept in IndexedDB and a ≤ 480 px JPEG data URL on the draft.

**Context.** The interview settled the parser as the instant preview with the model's TeX
replacing it on blur (Q9, Q17), Fix as a one-line correction with the source in hand (Q5,
Q28), and figures kept as crops (Q11). Open were where the reading lives, what a Fix does to
the text, and what "the source crop" means when the model returns no box for the problem.

**Alternatives.** *Writing the model's reading into `text`*: the teacher's shorthand would
turn into TeX under their hands after every blur, and re-editing would start from the model's
words, which the interview's "re-editing starts from what they typed" ruled out. *Reading per
keystroke*: a round trip per character; the parser is the instant preview for a reason. *A Fix
that keeps the old text and stores only a new reading*: the textarea would still show the wrong
line the teacher just corrected. *Sending a crop of the problem's region with a Fix*: there is
no such box in the model's output; asking for one would cost every extraction a box per
problem for a rare use. *Cropping figures on the server*: the page would have to be rasterised
there; the browser already draws pages for thumbnails.

**Tradeoffs.** A stored typed question's stem and TeX can differ from what re-parsing its text
gives; `itemOf` rebuilds the reading from that difference on reload, and the review grid renders
the stored stem and TeX rather than re-parsing (`GridItem.stem/tex`), so both screens agree.
The shorthand preview and the model's reading can disagree visibly for a moment (a bare "3"
then ½x² + 3); that is the interview's choice. A Fix on a typed tile turns its shorthand into
TeX. A figure's full crop lives only in this browser; the small copy in the draft is what
survives. The fix picture for a PDF page at 1.5× is a few hundred KB per Fix.

**Defense.** The teacher's words stay theirs, the model's reading is a layer that lifts off on
the first keystroke, and a Fix is the one place the words are meant to change. Figures cost
one draw per boxed draft and show where the problem is, on the tile and on the review grid.

## 2026-09-13 · The help button's border is a Button variant, not a className (ticket 182)

**Decision.** `Button` gains a `deep` variant (paper, ink text, 1 px `accent-deep` border,
`accent-soft` fill on hover) and both student "I need help" buttons use it.

**Context.** The user asked for a dark purple border on each "I need help" button. Both were
`variant="secondary"`, whose own classes set a grey border and a darker grey border on hover.

**Alternatives.** A `border-accent-deep` in each button's `className`: the same-property
utilities then fight on source order in the compiled CSS, and the secondary hover would still
flip the border grey. An inline `style={{ borderColor }}`: wins, but duplicated on two screens
and invisible to the variant system. Changing `secondary` itself: recolours every secondary
button on both sides, which was not asked.

**Tradeoffs.** One more variant to know about. The variant's name says the look, like `sky`,
not the use, so a third button can adopt it without a rename.

**Defense.** The two buttons cannot drift from each other, the hover is designed rather than
inherited, and no rule depends on Tailwind's utility order.

## 2026-09-13 · A primary action's hit area is a pseudo-element on the Button, not padding or a wrapper (ticket 183)

**Decision.** `Button` gains `hit`: the button is `relative` and draws an absolute `::before`
12 px beyond its box on every side (`-inset-3`, empty content). A press in that band is a
click on the button itself. The eight Continue / Submit / Send buttons in a bottom-right
corner carry it; the two chat sends narrow the textarea side to their 8 px gap.

**Context.** The user asked for 12 px of extra hit area around each Continue, Submit and Send,
with the click handler on the outer element, the visible pill unchanged, and a fingertip-sized
target. The pills are 46–48 px tall, so the visible target already clears 44 pt; the band
makes a press that lands just off the pill count too.

**Alternatives.** *More padding on the pill*: grows the visible pill, which the user did not
want, and moves every neighbour. *A wrapper element with padding and negative margins holding
the `onClick`*: the click handler leaves the button, `disabled` and focus stay on the inner
element, and every call site gains a second element to keep in step. *Negative margin plus
padding on the button with the look on an inner span*: the same split between the element
that looks like the button and the one that is it. *A global rule on every `Button`*: a 12 px
band around a button in a tight row (the create bar's Discard · Add · Continue at 12 px gaps,
the warm-up offer's two buttons at 8 px) would cover its neighbour's edge; opting in per
button keeps the band where there is room, and lets a caller trim a side.

**Tradeoffs.** One more prop to know about, and a hover tint that starts 12 px early on the
buttons that carry it. The band is invisible, so a reader of the markup learns of it from the
prop, not the screen. Under the teacher's 0.72 zoom the band is 8.64 screen px, and Chrome
snaps its edge one pixel wider on the left and top.

**Defense.** The button that looks pressed is the button that fires, with its own `onClick`
and `disabled`; nothing on screen moves; and each call site says in one word that it has a
band, so the next primary action can adopt it in a word too.

## 2026-09-13 · The class is named from the 2025 QCAA syllabus and a Queensland timetable code (ticket 184)

**Decision.** The class is "11 Methods" with the code "11MAM2"; the unit line is "Unit 1 · Topic 1 ·
Surds and quadratic functions"; the set is "Problem Set 2 — Roots of a quadratic". The header's
suffix reads the class's short name from the fixture instead of the constant "Maths".

**Context.** The user asked for a class name that fits a Year 11 Queensland (QCE) class doing Unit 1,
ahead of the Edexia Classroom page (tickets 185–189). The old line "Unit 1 · Topic 2 · Functions and
graphs" came from the 2019 syllabus; the QCAA Mathematical Methods 2025 syllabus (v1.3) applies to
students completing in 2026 or later, and places roots of a quadratic in Unit 1 Topic 1.

**Alternatives.** *Keep "11 Methods B"*: a letter group is plausible but not how a Queensland
timetable codes a class. *"Year 11 Mathematical Methods"*: the subject, not a class group. *A code
only ("11MAM2") in the header*: accurate but cryptic to anyone outside the school.

**Tradeoffs.** The code is inferred from one school's published subject codes (MAM) and the common
year + code + group pattern; no public timetable confirmed a class code. The header now depends on
the fixture, so a second class (deferred) would need the chrome to know which class it is showing.

**Defense.** Teachers say "11 Methods" out loud and see a code in their timetable, so the page can
use both where each belongs (the header and the Classroom's eyebrow), and the syllabus line is the
one a 2026 teacher would recognise.

## 2026-09-13 · Assignments are a registry of bundles read through a route-scoped context (ticket 185)

**Decision.** The teacher side holds assignments by id in `lib/assignments.ts`: a registry of
definitions (a fixture, the classmates' results, `kind` live or finished, and when the Classroom holds
it) and one pure `assignmentBundle(id, classroom)` that returns everything a screen shows about a set,
including its own frozen groups. Each set's pages live under `/teacher/a/<id>/{class,mistakes,groups}`;
`app/teacher/a/[id]/layout.tsx` 404s an unknown id and wraps the pages in `AssignmentProvider`, which
recomputes the bundle live from the classroom store and hands it down by React context
(`useAssignmentBundle`). `/teacher/a/<id>` itself is the landing: it replaces itself with Class or
Mistakes by `landingTab`. Each set's groups are stored per id in `ClassroomState.assignmentGroups`,
frozen from the class defaults (`ClassroomState.groups`, edited at `/teacher/groups`) on
`assignment/create`; `migrateClassroom` gives a classroom stored before this its one set of groups as
Problem Set 2's copy. "Submitted" has one meaning (`lib/progress.ts`): anyone who handed the set in,
whole or in part, so the Pathway card's working count is now the class who handed in (18/20 in the
fixture, was the 10 who finished all ten).

**Context.** The Edexia Classroom run (tickets 185–189) needs a second, finished set (187), a set
that exists only after Create (188) and classmates whose results are a function of time (189). Until
now every teacher screen imported `ASSIGNMENT` and `CLASSMATES` directly and there was one set of
groups. The ticket put Class at `/teacher/a/<id>` and the landing redirect at the same URL, which
cannot both hold while the class works (the Class tab would always bounce to Mistakes).

**Alternatives.** *Pass the id to every lib function and let screens call them* (no context): every
screen and card repeats the lookup and the live/finished branching. *A server-side redirect for the
landing*: the state is in localStorage, the server cannot see it. *Class at `/teacher/a/<id>` with the
landing at a query (`?open`)*: the Classroom's links would carry a flag, and a bookmark of the plain
URL during working would show Class, not the landing. *Keep one set of groups and snapshot on read*:
a later edit of the defaults would move a running assignment's groups. *Keep "finished all ten" as
the working count*: the landing, the rows and 189's "17/20 submitted" would each mean something else.

**Tradeoffs.** A client provider means the landing paints the chrome for a frame before it replaces
itself, and after 188 a set that is not yet created would render "Not in the Classroom" on the server
snapshot before hydration. The live set's bundle still composes `activeAssignment` (the student side's
reader), so a created title or subset shows on both sides from one place, at the cost of two readers
of `c.assignment`. The Pathway card's working count jumps from 10/20 to 18/20 on the unchanged
fixture. The per-assignment groups add a key to the stored classroom that every older store needs
migrated.

**Defense.** The bundle is the one seam every later ticket needs: 187 registers `pset-1` with
`kind: "finished"` and its classmates, 188 flips `PROBLEM_SET_2_BEFORE_CREATE`, 189 replaces the
classmates' snapshot inside `rosterProgress` with the stream at `now`, and no screen changes shape.
The screens read one object from context instead of five module constants, and the pure functions
(landing, progress, stages, groups) are tested without React.

## 2026-09-13 · The Classroom's cards are derived from the assignment's own readers (ticket 186)

**Decision.** `lib/classroomCards.ts` builds each card from the same inputs and functions the
assignment's tabs use: its section comes from `assignmentStages` (LIVE while a live set's current
stage is individual working, PAST otherwise; "in review" while a stage is current, "done" once none
is), "n/20 submitted" from `submittedCount`, "n mistakes so far" is `mistakeCount` = the number of rows
on the set's Mistakes tab (one per student per problem answered wrong, Sam's live rows included), and
"top gap" is `topGap` over the same `mistakesByProblem`: a cluster is the exact set of leaves a
student slipped on in one problem (the Mistakes tab's slip pill), gathered across problems, counting
different students; a tie goes to the cluster seen first in problem order. The page renders the
sections only after the first session batch and clock tick. A card is titled by the registry
entry's optional `name` (sentence case, "Problem Set 2 — Roots of a quadratic"), falling back to the
title; the upper-cased fixture title is never lower-cased at runtime.

**Context.** Ticket 189 streams classmates' submissions into `rosterProgress` and
`mistakesByProblem`; the live card must tick with it without changes. Ticket 187 adds a finished set
whose card needs a computed top gap. The ticket defined the top gap as "the cluster with the most
students across all problems; ties by problem order", which reads either as the single biggest
per-problem cluster or as a cluster aggregated across problems.

**Alternatives.** *Count mistakes as wrong lines*: a student with two wrong lines on one problem
would count twice, and the number would match nothing on the Mistakes tab. *Count only handed-in
work*: the Mistakes tab shows Sam's wrong work while he writes, so the card and the tab would
disagree. *Top gap as the biggest single-problem cluster*: names a problem's slip, not the set's
gap; a leaf missed by six students on three problems would lose to four on one. *Top gap by leaf
(a two-leaf slip counted under both leaves)*: closer to "skills", but no longer the clusters the
teacher sees as pills. *Store the card's numbers when the set finishes*: a second source of truth.
*Render the cards on the first paint*: the counts flash the empty class (Sam missing) for a frame.

**Tradeoffs.** Every render of the Classroom evaluates every set's work (`mistakesByProblem` per
set, cheap at two sets of ten problems and twenty students, linear in both). A student whose one
problem slips on two leaves forms a cluster of their own, so a common leaf can be split across
clusters. The sections appear a microtask after the header.

**Defense.** One definition per number means the card, the Mistakes tab and the Class tab can never
disagree, and 189's stream reaches the card for free. Aggregating the Mistakes tab's own clusters
across problems keeps the insight in the teacher's vocabulary (the chip reads like the pills they
open) and is pure and tested.

## 2026-09-13 · Problem Set 1 is a second fixture beside Problem Set 2, and history reads it as the newest past result (ticket 187)

**Decision.** Problem Set 1 lives in `data/pset1/` as data in Problem Set 2's shapes: `Problem`s with
their own ids (`ps1-q1` … `ps1-q10`, labels Q1 … Q10), an evaluation table `PS1_EVALUATION` that
`evaluateLine` reads beside `EVALUATION`, and twenty `Classmate` records, Sam's included
(`PS1_SAM`). The registry entry is `kind: "finished"` with `sam`, and `AssignmentBundle.sam` carries
Sam's record on a finished set (null on the live one), so Class View rows, the Mistakes rows and
counts, and the report read Sam exactly like a classmate there. Every set's individual view is
`/teacher/a/<id>/report`; `/teacher/report` redirects to Problem Set 2's. A finished set hides the
live-lesson cards (group progress, class review, live diagnostic) and force submit. History on a
set's Class View is `categoryHistory(id, student, category)`: the student's category status on
each earlier finished set in the registry (Problem Set 1's, dated "Sep 3", from
`classmateHierarchy` of their record), after simulated results dated before it, the last five; the
simulated ones are drawn around the oldest real result (the student's Problem Set 1 status), so
Problem Set 1's own five and Problem Set 2's older four are the same pills on the same dates.

**Context.** The user asked for one previous assignment, finished and reviewed, with all twenty
students and Sam's answers, one student missing, and Problem Set 2's newest history pill per skill
being that student's real Problem Set 1 result with the older four still generated. Every table
keyed by problem id (evaluation, diagnostics, standouts) is global, and Problem Set 2's ids are
`q1` … `q10`. Ticket 175's history was a mix drawn around today's status.

**Alternatives.** *Reuse `q1` … `q10` and key the tables by set*: every caller of `evaluateLine`
(the drill, the examples, feedback, peers, groups) would need a set id threaded through for no gain
while ids can simply differ. *A separate Sam row type for finished sets*: two code paths for one
row. *Keep history drawn around today's status and swap in the real pill*: Problem Set 1's own
history and Problem Set 2's would disagree on the same August dates, which a teacher flipping
between the two sets would see. *Store a history table per student*: a second source of truth that
could drift from the records the Class View colours. *Leave `/teacher/report` as Problem Set 2's
only and add a second URL for past sets*: two report URL shapes.

**Tradeoffs.** Problem Set 2's history no longer centres its simulated pills on today's status: a
student red today can show green August pills if they were green on Problem Set 1 (the history is
"what came before", not a mirror of today). A student who missed Problem Set 1 (Liam) gets a hollow
Sep 3 pill. Problem Set 1 carries no practice problems, standouts or diagnostics, so it could not
run live without more authoring.

**Defense.** The data is in the shapes every screen already reads, so Class, Mistakes, Groups, the
report and the Classroom card worked for Problem Set 1 with small, typed changes and no set-specific
branches beyond "finished hides the live lesson". History is computed from the same records the
Class View colours, so the newest past pill cannot disagree with Problem Set 1's own row, and the
simulated pills are consistent across both sets. All of it is pure and tested (data integrity,
counts, top gap, history across both sets).

## 2026-09-13 · Blank create screen is a separate component over a `generated` draft flag; confirmed groups live on the review state (ticket 188)

**Decision.** The create screen shows `BlankStart` until the stored draft carries `generated: true`,
then the existing editor over that draft. Generate stores the seeded set (`generatedDraft`) through
the same `draft/set` action; Create and Reset demo clear the draft, so the next visit is blank. The
pathway step's "Confirm groups" edits `ReviewState.groups` (absent: the class defaults as they stand)
through a `SeatingBoard` component shared with the Groups page, and Create passes those groups to
`assignment/create`, which freezes them under `pset-2`. Problem Set 2 exists once `c.assignment`
does; `CreatedAssignment.startedAt` records when it went live (a skip sets it an hour back), read
through `liveStartedAt`.

**Context.** The user wanted the create screen to open blank with one pulsing "Generate simulated
assignment", Q1 shown but not usable, and moves in Confirm groups to apply to the new assignment only.
Before this, an empty store was seeded straight into the editor, and `assignment/create` always froze
the class defaults.

**Alternatives.** *A blank mode inside the editor* (flags on every input, the grid, the paste listener,
the drop zone and the bar): many conditionals across a 500-line component whose upload paths would
still be wired. *A `generated` flag in the editor's React state only*: a reload would drop back to
blank. *Write Confirm-groups moves to `c.assignmentGroups["pset-2"]` before Create*: the set would
have groups before it exists, and a draft abandoned mid-way would leave them behind. *Write them to the
class defaults*: rejected by the user (a one-off absence would pollute future sets). *A separate
`startedAt` store key*: two places to clear on reset; the created assignment is already the thing
Reset removes.

**Tradeoffs.** `BlankStart` duplicates the editor's title and goal markup so the geometry matches;
a style change to one must be copied to the other (the click-through checks nothing moves on
Generate). A draft stored before this ticket opens blank. `CreatedAssignment` has both `createdAt` and
`startedAt`, equal on a real Create. The review state now carries twenty student ids.

**Defense.** The editor is untouched apart from the flag it saves and the fade, so the typing, upload
and Fix paths keep working once generated. The confirmed groups follow the review's own lifetime
(kept across reloads, cleared with it on Create or Reset) and reach the classroom only through the one
action that creates the set.

## 2026-09-13 · A confidence label too long for its column names what fits and counts the rest (ticket 190)

**Decision.** Class View's Confidence column never shrinks a label. `confidenceForms(label)` lists
its forms, longest first: every named skill ("low: fractions, non-monic factorising"), each skill
alone with the others counted ("low: fractions +1", "low: non-monic factorising +1"), then
"low +2". `ConfidenceCell` lays every form out unseen inside the cell and shows the first whose words
fit the cell's width and three 17 px lines at 13 px; a shortened form carries the whole answer as its
`title` and as screen-reader text. The cell's side padding drops from 8 to 4 px.

**Context.** `FitText` shrank each named skill to one line, so "non-monic factorising" rendered near
5–7 px and read as broken (user's screenshot, ticket 187's note). The cell is 87 layout px wide
(71 px of content), rows 82 px (54 px of content). At 13 px, Mia's two skills need four lines, and
"discriminant" alone (75 px) overflowed 71 px.

**Alternatives.** *Wrap freely with no cap*: Mia's and Lucas's rows would grow by a line, pushing every
row below. *Widen the column*: the roster is 1204 of the 1280 laptop's 1208 px, any width is a trade
with another column. *CSS `line-clamp` with an ellipsis*: cuts mid-skill ("low: fractions, non-…"),
and hides that there is a second skill. *Grid-only short names per leaf*: a third name to author per
leaf and still no guarantee for a future long one. *A fixed character-count rule in the lib*: breaks
the moment the font, zoom or column changes (the column is 84 or 87 px by viewport already).
*Line-height `leading-snug`* (53.6 px for three lines): grew a three-line row by a pixel, hence 17 px.

**Tradeoffs.** A student's second skill is sometimes only on hover (native tooltip: delayed, not on
touch). Each named label renders its forms twice (visible + probes, at most four short spans) and a
layout effect measures them, so the first client paint of a long label can briefly be the full form
before the layout effect picks (before paint in practice). Which skill survives follows tick order,
not importance. Three-line labels sit on a 17 px leading, 0.9 px tighter than the one-line labels.

**Defense.** Every label is legible at the size of its neighbours, the column and row geometry are
unchanged, and the rule is measured, not guessed, so it holds for any label length (ticket 189 rewrites
several answers) and any column width. The teacher still sees that a student is low and on what, with
a clear "+1" when there is more.


## 2026-09-13 · The live stream is a pure function of the start time and now over the classmates' final records (ticket 189)

**Decision.** Each classmate's record in `data/classmates.ts` stays what they hand in at the end. A script
(`data/stream.ts`: warm-up, ms per difficulty unit, an optional rushed first problem, the hand-in time or
never) turns it into a schedule (`lib/stream.ts` `scheduleFor`), and every teacher read goes through
`classmatesAt(set, session, now)`: the visible record at `now` (`recordAt`: done = problems answered,
their wrongs, working and notes so far, no clarification before hand-in), the row's progress, and when each
problem's work arrived. `AssignmentBundle.startedAt` (from `liveStartedAt`) switches it on; a finished set
has none. `rosterProgress`, `classStages`' working count and `mistakesByProblem(session, set, now)` read it,
so the landing, the Classroom card, the Pathway card, Class View and Mistakes follow without their own
timing. The stream is over once Sam hands in (on his own or through force submit): every classmate who
started has then handed in, Jordan's Q1–Q7 included, and every later stage reads the full records as it did.
Jordan's record grows to Q7 with Q4–Q6 right and Q7 the unchecked 1 × 8 pair (the same habit as his Q2),
so Sam's group union and quick pass are unchanged; the group's progress becomes thirteenths.

**Context.** The user wants the teacher to sit on Mistakes and watch mistakes arrive per problem
submission, with five warming up first, Jordan stalling at Q8, Chloe never starting, a 17/20 end state,
reload continuity, Reset clearing and skips landing at the end. Every downstream flow (group review,
readiness arrivals, standings, examples, the board, the diagnostic trickle) reads the static records.

**Alternatives.** *Store events in the classroom as a timer fires them*: needs an owner tab running the
clock, duplicates across tabs, and a reload with no tab open loses time. *A second, per-moment fixture per
student*: double the data to keep consistent. *Keep streaming after Sam hands in*: individual review's
scripted arrivals and group review would read students who are still on the set. *Make Jordan wrong on
Q4–Q6 too*: changes Sam's group's discussion problems and every scripted group review moment.

**Tradeoffs.** A presenter who hands Sam in two minutes after Create sees the counts jump to the end
state. Sam's live session is not part of the script, so "still working" (`pending`) counts him until he
hands in, where before he counted as skipped. Work a student hands in unfinished (Liam's Q3, Ethan's and
Harper's Q9) arrives with the hand-in, not as its own event. Jordan's Q7 changes the class's Q7 counts,
the Q7 example picker (a third "pair adds to nine") and the group bars (15, 38, 62, 85, 92, 100 %).

**Defense.** One pure function of stored data keeps every tab, a reload and the tests in agreement with
no timers to own, and the end of the stream is exactly the records the rest of the product already runs
on, so nothing after individual working needed to change.

## 2026-09-13 · Arrivals on Mistakes are held above the pointer, and a name glows from its arrival time (ticket 189)

**Decision.** While the pointer is over the problem list, every card whose top is at or above the pointer
keeps the names it shows and no new card is inserted above the pointer (`lib/arrivals.ts`
`holdAbovePointer`, fed by `usePointerGuard`: pointer moves and scrolls count the problem rows whose top is
at or above it, outside render). Their correct / skipped counts still tick (fixed-width tabular figures).
Cards below the pointer update at once. When the pointer moves on, held names land and glow from that
moment. A name's glow (`.arrive`, background and ring only) runs 8 s from `MistakeRow.arrivedAt`, its
animation delay fixed at the name's first render, so a reload never replays an old arrival. Rows come in
arrival order and columns are keyed on their first student.

**Context.** A new name appends to its cluster, but a new working is a new grid column (every `1fr` column
narrows) and a problem's first slip is a new card (the cards below move down): both would move a name the
teacher is pointing at.

**Alternatives.** *Show all ten cards from the start*: no insertion, but a new column still reflows the
card, and cards with no slips would clutter the finished layout. *Freeze the whole list while hovered*: a
teacher resting the mouse sees nothing arrive. *Scroll anchoring*: does not apply at scroll top and not to
horizontal reflow. *Fixed-width columns*: breaks ticket 138's even columns.

**Tradeoffs.** A teacher reading one card for a long time does not see that card's new names until moving
off it (the count beside it does tick). The guard measures rects on pointer moves (≤ ten rows). The glow
can run up to a second long (the 1 s clock).

**Defense.** Nothing moves under the pointer by construction, the rest of the page stays live, and the
held arrivals still announce themselves when they land.

## 2026-09-13 · Typeset maths never wraps: one global `.katex { white-space: nowrap }` (ticket 194)

**Decision.** `app/globals.css` sets `white-space: nowrap` on `.katex`, so every KaTeX expression in the
app stays on one line and moves to the next line whole. Containers that could be too narrow scale the
maths (`FitText`) or are sized for it; the flyout also holds a trailing `?` to its maths.

**Context.** The user (2026-09-13): "ensure that a latex equation never splits lines -- make this a rule
throughout", after Q7's diagnostic read "⅓x² + / 2x + 8/3". KaTeX 0.18 renders each run between
operators as a separate `.katex-base` inline box, and browsers may break a line between them; KaTeX's
own CSS makes only each box nowrap. A sweep of every route found splits in three diagnostic flyouts
at every width and in nine mistake headers at 400 px.

**Alternatives.** *`whitespace-nowrap` per call site* (the pattern `DiagnosticResults` already used): a
rule that every new `<M>` must remember, which is how the flyout's stem slipped. *A `nowrap` prop on
`M`*: same, opt-in. *KaTeX's `\mbox` / a `{...}` group around each expression*: changes the TeX and its
spacing, which the hint-box rule forbids. *Scaling every inline expression with `FitText`*: a measure
per expression on every screen for a problem nowrap solves in CSS.

**Tradeoffs.** An expression wider than its box now overflows (or is clipped) instead of wrapping, so a
narrow container needs a deliberate fit; at 400 px the teacher mistake headers clip by up to 26 px
(laptop-only page, logged in FUTURE_FEATURES). A long expression beside prose leaves a larger ragged gap
at the end of the line before it.

**Defense.** One rule, enforced everywhere with no call-site discipline, matching how maths is typeset in
print; the laptop check (30), the hint-box sweep (30) and the all-route wrap sweep show no overflow at
the laptop sizes and no layout movement in the practice maths.

## 2026-09-13 · The chat request carries the hint cards on screen (ticket 198)

**Decision.** `HelpChatRequest` gains an optional `hinted: number[]`: the pad's hint cards in the order they
were given, as indices into the problem's hints. `helpChatSystem` lists them as "Hint 1: …, Hint 2: …",
numbered as the pad numbers them, the last being the latest. The two lines the pad says for the tutor
are recognised in the brief: `hintOpener(n)` (from the stall notice) and `TALK_OPENER` (from the card's
pill, which names no hint).

**Context.** The user split one opener into two: the card's "Talk it through" now says only "What is
the hint asking you to do, in your own words?". Before this the brief listed every hint the problem
has, never which ones the student had seen or in what order. "Hint 2" in the stall line was therefore
ambiguous, since cards are numbered in the order given, which is not the index when a student jumps
ahead. The card's new line names no hint at all.

**Alternatives.** *Name the hint in the card's line* ("What is hint 2 asking…"): the user specified the
wording. *Put the hint text into the stored tutor line*: the student would see it twice, and the stored
chat would carry display text the brief then has to parse. *Derive the cards server-side from the lines*:
`pickHint` depends on the order of asks, not just the lines, so it cannot be replayed from the lines
alone.

**Tradeoffs.** One more client-supplied field the route trusts for prompt content, though it is only
indices, checked as non-negative integers, and out-of-range ones are dropped. Earlier cards the
student collapsed are still listed, since the brief does not know what is expanded.

**Defense.** The tutor now sees what the student sees, so either opener leads into talking about the
right hint. The field is optional, so an old client's request still parses and gets "(none yet)".

## 2026-09-13 · Every warm-up has a hint for every point in its working (ticket 203)

**Decision.** Every problem in the warm-up bank, follow-ups included, carries one hint per point in its
reference working (`at: [k]` for k = 0 … steps − 1). A unit test enforces it, and none of them has a
general hint (no `at`). Each later hint's linked words point at the student's own line. The hint-box
sweep reads its warm-up list from `scripts/warmup-leaves.json`, which a test holds to the bank.

**Context.** 13 of 15 warm-ups had one general hint. A general hint never stalls, and once shown it
leaves nothing to pick, so "hint" greyed out after one press. The stall notice and the chat on a
hint, the core of the practice pad's help, were unreachable on those warm-ups. The sweep hid it: it
opened only the default sequence (4 warm-ups) and stopped silently at the first stall notice.

**Alternatives.** *Let a general hint stall until the last line*: the student would get one hint for
the whole problem and then only the chat, where fractions gives a hint for each step. *Let "hint" open
the chat once the hints run out*: it changes the pill's meaning per problem, and a student on line 1 of
6 would be sent to talk through a hint about the whole method. *Generate the hints from the step
labels*: the labels describe what was done ("Grouped"), not the next move, and would read as answers.

**Tradeoffs.** About 35 more hand-written hints to keep in step with the working. A change to a step's TeX
now breaks the terms test, which is intended. Hints for later points are less general, so a student
who writes a different valid line gets the hint for the reference position (`positionOf` counts
unplaced lines by position), as fractions already did.

**Defense.** One behaviour for every warm-up, checked by test and by the pixel sweep across all 15.
The demo's three warm-ups no longer work better than the rest.


## 2026-09-13 · The group debrief asks for nothing; the marks open on a timer from the check (ticket 218)

**Decision.** The debrief's written note is removed along with its two prompts ("Describe the mistake
you made." / "…your peers most likely made."). The unmarked comparison shows for five seconds from the
group's `resolvedAt`, then the marks open on their own, and Next waits the ten-second hold. Session
state per problem is only `{ done }`, and the teacher report no longer lists group notes. This
supersedes the note half of "The debrief is per student" (2026-09-10).

**Context.** The user found the note too much cognitive demand straight after the group's rework.
They asked for the green view, a five-second pause, the marks automatically, then the existing hold.

**Alternatives considered.** *Keep the note optional beside a timed reveal*: the box would still ask
for writing, which the user wanted gone. *Time from the component's mount or a session `openedAt`*:
the first resets on a reload, and the second needs an effect to dispatch on mount. *Keep the report's
notes block*: it would always read "Nothing written yet".

**Tradeoffs.** The teacher loses the student's words about each group problem. A student who opens a
debrief more than five seconds after the check (a reload, a late join) sees the marks at once. Older
stored sessions keep extra note fields, which are now ignored.

**Defense.** One clock, the check the whole group saw, drives both phases for every member and survives
a reload. Two pure functions replace a prompt rule and two session actions.

## 2026-09-13 · Sets renamed in place, old names mapped at the edges (ticket 208)

**Decision.** Problem Set 2 becomes Problem Set 6 and Problem Set 1 becomes Problem Set 5 everywhere: ids (`pset-6`, `pset-5`), titles, the data folder (`data/pset5/`) and Set 5's problem ids (`ps5-q*`). One import-free module, `lib/renamedSets.ts`, lists the old ids and the old seeded titles. Two readers use it. `next.config.ts` sends `/teacher/a/<old id>/…` to the new id with a temporary redirect. `migrateClassroom` renames a stored classroom on every load: group copies' keys, and the created set's and draft's titles when they are exactly the old seeded ones.

**Context.** The Classroom grows to six sets (tickets 208–217), so today's two sets take numbers 6 and 5. Demo browsers and bookmarks hold the old ids. The classroom store keys each set's frozen groups by id, and it keeps the seeded title as the created set's title, which the student's header and the Class View show.

**Alternatives.** *Keep the ids, change only the display names*: the smallest change, but `pset-2` would mean Problem Set 6 for good, and every later ticket and URL would carry the mismatch. *Redirect in a proxy or in the `[id]` layout*: the layout cannot see the sub-path, and a proxy runs on every request for two fixed routes. *Rename stored state once and write it back*: saves a lookup per read, but it writes to storage from a read path and races another tab's write. *Drop stored state on a version bump*: simplest, but it throws away a presenter's mid-demo progress, which the ticket rules out.

**Tradeoffs.** Every classroom load checks the map, which is trivial for two entries. The map and its tests must keep the old names, so a grep for "pset-2" is never quite empty. The redirects are 307, not 308: a permanent redirect cached by a browser would outlive any later rename. A title the teacher typed as "Problem Set 2 — Roots of a quadratic" by hand would also be renamed. That is unlikely, and it is the name the set now has.

**Defense.** The code names the sets by their real numbers from here on. The old names live in one small file that says why it exists, and old links and old demo state keep working without a migration step or storage writes.

## 2026-09-13 · Classroom pinning: a sticky region in the chrome's scroll, not a fixed top with an inner scroll box (ticket 216)

**Decision.** The Classroom's eyebrow, title row and Live section are one `position: sticky; top: 0` region inside the teacher chrome's existing scroll region (`main[data-teacher-scroll]`). Past follows in normal flow and scrolls under the region's bottom edge. The region pulls itself out over the chrome's padding (`-mt-12 pt-12`, `-mx-6 px-6`) with the page's cream ground, and its bottom padding is the gap Past used to open with, so every rect at scroll 0 is unchanged. A `ResizeObserver` writes the region's height to `--classroom-pinned`, which each card reads as `scroll-margin-top`. With nothing live the Live section is dropped, not left as an empty note.

**Context.** The user asked for the Live set to stay visible "as a fixed header, in the position it is now" while the Past list scrolls (tickets 211–214 bring the Classroom to six sets). The chrome already makes `main` the only scrolling element (ticket 68), and the Class View's side column already sticks inside it.

**Alternatives considered.** *A fixed-height top and a Past box with its own `overflow-y: auto`*: the wheel or trackpad over the heading would do nothing, Home/End/Page keys need focus inside the box, the scrollbar would start below the Live card, and the box's height would be `100vh` arithmetic under the 0.72 zoom. *Sticky with `top: 48px` and no padding trick*: the cards would show through the strip above the eyebrow. *Pin the heading and Live separately*: two sticky offsets to keep in step for no gain.

**Tradeoffs.** The region's negative margins assume the chrome's `py-12 px-6` container; a change there must move them too (the comment in `Classroom.tsx` says so, and the click-through measures the scroll-0 rects). A keyboard-focused card needs the measured scroll margin, a small effect. The dashed "Nothing live" note is gone before Create.

**Defense.** One scroll region keeps every native scroll input, the rubber-band behaviour of ticket 68 and find-in-page working exactly as on every other teacher page, and the pinning is a few classes on one wrapper rather than a second scroll container with its own height maths.

## 2026-09-13 · A problem a group cannot get climbs a ladder of wrong checks (tickets 221–223)

**Decision.** The group whiteboard counts wrong checks per problem. After one the group sees its
attempt up to the first mistake, as before. From two, a hint for the latest first mistake sits
under it: the evaluation table's clue, which names the move and never the answer (ticket 221). A
third leaves the problem for now; the board comes back to it after the last problem, with the next
pen in the deal. A wrong check on that return closes it unsolved, the progress bar counts it, and
the teacher and the report say so (tickets 222 and 223). In the demo Sam's group never solves Q7.

**Context.** A group that kept checking wrong was stuck on the problem until the teacher ended group
review for everyone, and nothing told the teacher. The user agreed the ladder on 2026-09-13 and
asked for the bar to reach 100% without the problem and for the demo group never to solve Q7, which
gives class review its reason.

**Alternatives considered.** *Bring back a "we're stuck" reveal*: it showed the right answer and
was removed in ticket 117. *Pass the pen after a wrong check*: the random draw is the point of the
board (FUTURE_FEATURES). *A time limit instead of a count*: a slow careful group would be moved on
while working; the count only moves on a group that has checked and been wrong. *Write a new hint
for the board*: the table's clue already exists for every wrong line and was written not to give
the answer; linked words (the practice pad's) would need per-problem terms for the set.

**Tradeoffs.** A hint from the latest attempt changes with each wrong attempt, so a group that
tries something new sees a new hint. The thresholds are fixed numbers, not tuned per problem. The
clue is a general sentence with no pointer into the working.

**Defense.** Each step adds a little help without handing over the answer, no group can be stuck for
ever, and the one rule (count the wrong checks) drives the board, the bar and the teacher's view.

## 2026-09-13 · The group intro is a timed read inside group review, carried by the run's start (ticket 220)

**Decision.** Before the shared whiteboard, every student reads a short screen about working as a team, over the group's problems as tiles. There is no button. The screen is not a new session stage: the group run's `startedAt` (and first `turnStartedAt`) is set to when the board opens, `GROUP_INTRO_MS` after the class went into group review (`readiness.startedAt`: the last hand-in, or the end of the teacher's grace), and `GroupBoardScreen` shows the intro while `now < startedAt`. The read time comes from the words: 130 words a minute plus a 4 s look, 39 s for the agreed 75 words.

**Context.** The user wanted the motivation for working the union of mistakes explained, without showing who got what wrong (students would otherwise know which problems they had right and copy), and a forced read so no group gets onto the board ahead of another in the race. It must also show when the teacher ends individual review, which today sends a correcting student straight to `group`, skipping the class gate.

**Alternatives considered.** *A new `group-intro` stage between `class-wait` and `group`*: every entry route (the gate, the forced end, deep links, demo jumps, the class stage and progress maps, the pathway strip) would need to learn it, and the run, peers' scripts and race would still need a delayed start. *A Continue button per student*: fair only if the board waited for all four, and a student who taps at once reads nothing. *A fixed duration*: goes stale the moment the text is edited. *Explaining on the class-wait screen*: the last student in, or a forced one, never sees it.

**Tradeoffs.** A run's `startedAt` is now in the future for 39 s, so any new reader of it must not assume it has passed (the three existing readers already clamp). The slowest readers may still want longer, and the fastest wait up to half a minute. The read is counted from the class's start, so a tab that arrives late reads only what is left. The forced hand-in notice ("N of your problems still contain a mistake") is held until the board opens, since on the intro it would name the student's own mistakes.

**Defense.** One number, the run's start, already drove the board, the peers and the race; moving it gives the read to every group at once with no new stage and no change to those clocks, and a reload lands exactly where the class is.

## 2026-09-13 · New skills per set: one home per skill, a per-set list, an inferred list for Create (ticket 209)

**Decision.** Every skill has exactly one home in the taxonomy. The Unit Focus category and its leaves are gone: the null factor law lives in Functions › Zeros & solving, the discriminant in Algebra › Equations, and the binomial identity in Algebra › Expanding & factorising, merged with special products into one leaf (`algebra.expand-factor.binomial`). Surds stay in Number. The unused Unit 2–4 leaves got homes too, including a Calculus category. "New skills" is a column, `NEW_SKILLS = "new"`, with no leaves of its own. Each assignment lists its `newSkills`. `hierarchyFor(evidence, set)` rolls a listed skill up under New skills on that set and leaves it out of its home group and category. On a set that does not list it, the skill counts under its home. Retired leaf ids resolve through `LEAF_ALIASES`. A created set's list is inferred and switchable on Create's pathway step, never confirmed. The rule: a skill at least two of the set's problems invoke is new, unless one of the class's last two sets assessed it under its home.

**Context.** The user (2026-09-13): "new skills is PER ASSIGNMENT -- so i dont' want to see surds as a new skill in PSet 6". The agreed lists are PS1 surds, PS2 surds and binomial identity, PS3 binomial identity, PS4 binomial identity and null factor law, PS5 null factor law and binomial identity, PS6 discriminant and null factor law. Before this ticket, Unit Focus was a fixed list of `unit.u1` leaves, shown on every set that touched them. Tickets 210–215 add four finished sets that each declare their own list, plus a history whose New skills pill is each earlier set's New skills result.

**Alternatives considered.** *Keep a Unit Focus category and add surds to it*: surds would then show as new on every later set, which is the mistake the user corrected. *Tag a leaf twice (home and unit) and pick one per set*: every fixture would carry duplicate tags, and evidence could be counted in both places. *Route by a per-set map from home leaf to column in the evaluation tables*: this spreads one set-level fact across every line. *Keep special products as its own leaf beside the binomial identity*: both name perfect squares and the difference of two squares, so a set could list one as new while the other still counts under Algebra. *Infer "new" literally, as not tagged in the last two sets*: this never makes the null factor law new on Set 6, because Set 5 uses it, and it contradicts the agreed lists. *Add a confirm step for the inferred list*: this is ruled out by the no-confirm-gates correction (2026-09-12).

**Tradeoffs.** Escalation and practice prompts group by the home now. A null factor law slip counts toward "finding zeros", and a binomial-identity slip counts toward factorising, where both used to count under "the unit's rules". The New skills column has no group layer, so a set with many new skills lists them flat. The inference reads "met" as assessed under its home and needs two problems. That is a judgment the teacher may disagree with, so the chips stay switchable. Stored sessions and created sets from before this ticket are read through the alias map on every load, which costs a small lookup. The "Unit 1" label beside an open New skills pill is removed: renamed "New skills", it overlapped the Confidence cell and repeated the header. Class review's badge now reads "new skill".

**Defense.** One home per skill means a skill's evidence has one path and one place in the drill. The per-set list is a single field on the assignment, so tickets 211–214 only declare it, and the history can read an earlier set's `categories.new`. The inferred list gives Set 6's agreed list from Set 5, and the rule is consistent with the other agreed lists. Tests check that no evidence is counted twice on either set.

## 2026-09-13 · The board's itinerary is derived from what was left, and "closed" is resolved or unsolved (ticket 222)

**Decision.** The run stores only what happened: `left` (problems left for now, in order),
`unsolved` and `unsolvedAt`, the `seed`, and `turnFrom` (attempts before this visit). The visits
are computed (`visitsOf`): the union in order, then one return per left problem, each pen the next
in the same deal. `resolved` keeps meaning "checked correct"; a problem is closed when it is
resolved or unsolved, and every consumer that meant "finished with" (progress, the debrief, moving
on, the standings) reads closed. Leaving happens from the demo's clock loop with the visit's index
in the action, so two tabs leave once.

**Context.** The ladder needs a second visit to a problem, with another member's pen, after the rest
of the union; the bar must reach 100% without the problem correct; the report and class review must
still tell correct from not.

**Alternatives considered.** *Store the visit list* (branch 118's itinerary): every reader of `pen`
changes and a stored list can disagree with `left`. *Append the left problem to `problems`*: the
union's count ("4 of 6"), progress and the teacher's union would all double-count it. *Mark an
unsolved problem resolved with a flag*: every existing "resolved" reader (report columns, the
"fixed in group review" badge) would need the flag or silently count it as fixed. *Leave in the
reducer at the check*: the group would never see the third "Not yet" or the notice.

**Tradeoffs.** `visitsOf` recomputes the deal on each read (a handful of shuffles; cheap). A problem
gets exactly one return. The pause before leaving is a fixed 6 s from the check's stamp.

**Defense.** State stays minimal and replayable, old stored runs read as a first pass, and "closed"
is one question with one answer for the board, the bar and the debrief.

## 2026-09-13 · The group intro's time is a fixed 30 s, not derived from the words (ticket 224)

**Decision.** `GROUP_INTRO_MS` is 30 000, written as a number. The reading-pace calculation from ticket 220 (75 words at 130 wpm plus a 4 s look, 39 s) is removed. This supersedes "The read time comes from the words" in the ticket 220 entry.

**Context.** The user asked for 30 seconds after seeing the 39 s read.

**Alternatives considered.** *Keep the formula and raise the pace to about 173 wpm so it lands on 30 s*: a made-up pace that would silently move the time again when the message is edited. *Keep the formula beside a 30 s cap*: two numbers where one decides.

**Tradeoffs.** Editing the message no longer retimes the screen; a much longer message would need the number changed by hand. At 30 s, a slow reader (130 wpm) may not finish the second paragraph.

**Defense.** The time is a classroom-pacing choice the user made, so it is stated directly where it is used; everything else (the board, peers, race, reload) still runs off the one run start.

## 2026-09-13 · The student's report shows the teacher's key, bands included (ticket 225)

**Decision.** The student's "Your report" renders the shared `StatusKey` under its skills: every status with its word and its band (secure 100%, solid 80–99%, developing 60–79%, gap under 60%, half incomplete, not seen yet).

**Context.** The student's report coloured skills with the same dots as the teacher's report but had no key. The screen's design note said "No scores anywhere", so the user was asked whether the student's key should drop the percentages; they chose the teacher's key as it is.

**Alternatives considered.** *A words-only key for students* (a `bands={false}` prop on `StatusKey`): keeps percentages off the student side, but the two reports would describe the same dots differently and a student could not tell where solid ends. *A separate student key component*: a second copy of the rows to keep in step.

**Tradeoffs.** Students now see the percentage bands behind each colour, which softens the "no scores" framing of the screen (their problems still show no score).

**Defense.** One key, one meaning: the student reads their report exactly as their teacher does, which is what "What Ms Okafor sees" above it promises.

## 2026-09-13 · History pills read the registry, simulated pills walk one step, real jumps are listed, not fixed (ticket 215)

**Decision.** A category's history on a set's Class View is the last five earlier sets in the Classroom's registry that assessed the category (New skills: every earlier set with New skills), oldest first; each real pill reads "PS5 · Mon 7 Sep" and links to that set's Class View opened on the same student's history (`?history=<student>&open=<category>`, read by the page and handed to `TeacherLive` as `init`). With fewer than five, simulated pills fill the top: a seeded walk that moves at most one colour step between neighbours and ends within one step of the oldest coloured real pill (else today's), dated from a week before the class's first set over the weekdays up to it. The history core (`historyFrom`) takes a list of sets, so tests feed it a synthetic registry; the app feeds it the registry through `earlierAssignmentIds` and `assignmentBundle` only. In history mode a category's pill fills its column (less 1 px a side) and history labels drop padding and tracking so the longer labels fit. Real results that jump (20 pairs from Set 5 to Set 6 today) are listed in the test, not changed.

**Context.** The user (2026-09-13) wanted simulated pills to read as pre-Edexia work dated before the first set, real pills to name and open their set, and no "dark green today, red a week ago". The old history shuffled a fixed mix, dated five fixed August days, and only the newest pill was real. Ticket 210 is reshaping the registry and owns the real results through a class story sheet, running in parallel.

**Alternatives considered.** *Keep the mixes and reject shuffles that jump*: still a mix centred on today, not a walk, and a rejection loop is harder to reason about. *Date simulated pills at a fixed cadence (every Tuesday and Friday)*: would land on or after the first set for short gaps; spreading over the weekdays in the week before always fits. *Change the jumping fixtures now*: the story sheet (ticket 210) owns them and a parallel edit would conflict; the list makes the gap visible and fails on anything new. *Let a stack be wider than today's pill*: stacks in neighbouring columns would touch and the ticket 175 rule (the stack is the pill's width and left) would break; widening the pill in history mode keeps it. *Read the query with `useSearchParams` in `TeacherLive`*: the project's convention is that pages read the URL and hand an `init` to the client screen. *Lowercase labels*: saved only 3 px and broke the pills' uppercase look.

**Tradeoffs.** The labels are tight in the Algebra column (73 of 76 px); a two-digit set number will not fit. The simulated walk is seeded by student and category only, so a set's own history and a later set's do not agree pill for pill on the simulated part (different counts and dates). Real jumps stay on screen until the story sheet lands. A linked pill's query is dropped on arrival, so the link is not a shareable deep state after load.

**Defense.** Every rule the user set is one small function (`simulatedWalk`, `simulatedDates`, `assessed`), the core is tested against a synthetic registry today and picks up Sets 1 to 4 without code changes, and the jump test covers every registered set, student and category, so real data that breaks the rule is named rather than hidden.

## 2026-09-13 · A link that names group review starts it over (ticket 226)

**Decision.** `/student?stage=group` and `?stage=class-wait` dispatch `group/restart` on mount: the classroom's group run and the student's arrival are dropped, so group review begins again with the description. The gate and board effects in `StudentApp` do nothing until `useNow` has ticked (it reads 0 during hydration), and the board effect skips a render whose run is not the store's.

**Context.** The user wanted the description every time group review starts. The skip bar already did this (it builds a fresh classroom), but stage links reset only the session: they resumed a stored run (a finished one moved the student straight to the report), and a run begun in the hydration render had `startedAt` = 30 s after the epoch, so its board was open.

**Alternatives considered.** *Reset the whole classroom on a stage link, like the skip bar*: would also drop a `?pathway=` assignment, the teacher's groups and whole-class setup made in another tab. *Clamp `startedAt` in the reducer (ignore times before some date)*: hides the symptom; the arrival at 0 would still open the gate at once. *Keep resuming a stored run on a link*: matches plain `/student`, but the page's rule is that a named stage starts a fresh run.

**Tradeoffs.** A teacher tab watching a run in progress sees it vanish when someone opens a `?stage=group` link in the same browser. A link opened while the class is mid-board restarts the demo group's run. Both are demo-only paths.

**Defense.** The rule is the one the page already states, applied to the classroom half of the state that group review lives in, and the clock guard removes the only way a run could begin with its board already open.

## 2026-09-13 · A page sets its own teacher zoom, bar included; skill names wrap at most twice (ticket 227)

**Decision.** `TeacherChrome` takes a `zoom` (default `TEACHER_ZOOM`, 0.72) applied to the whole frame, and the student report asks for 0.72 × 1.25. Separately, `fitLabels` counts each node's own padding and wraps at 10.5 px only when every name takes two lines at most without splitting a word; otherwise 9 px.

**Context.** The user asked for the teacher's student report at "125% view compared to current", and for the student's report to show every skill. Six full columns in the iPad's Skills card broke names as "sketching / a / parabola" and "zero- / finding", because the fit ignored the row's 9 px of padding and only checked single words.

**Alternatives considered.** *Zoom only the page body under the bar*: the bar would match the other teacher pages, but on a wide window the bar's 1640 px frame and the body's would no longer line up (about 150 px apart at 1960 px). *Change the global zoom*: every teacher page grows. *A shared text size across all columns*: steadier looking, but every column would drop to the narrowest one's size.

**Tradeoffs.** The bar is 25% larger on the report than on Class view, so it changes size as you move between them. Narrow columns can still give a three-word name three lines at 9 px.

**Defense.** A zoomed frame behaves exactly like the browser zoom the user described, and keeps bar and content aligned at every width; the fitting rules remove the broken wraps without touching the maths or the layout of wider columns.

## 2026-09-13 · Finished sets are one list, the class story sheet is typed data, and Set 5 bends to it (ticket 210)

**Decision.** A finished set is a folder `data/psetN/` whose `index.ts` exports a `FinishedSet` (fixture, name, pathway, Sam, classmates, evaluation, optional groups), registered by one `export { PSN } from "./psetN";` line in `data/finishedSets.ts`; `lib/finishedSets.ts` reads every export and orders by due date, and the registry, the evaluation index and frozen groups are built from that list. The list has commented slots for PS1–PS4 separated by blank lines. The class story sheet is `data/story.ts` (typed statuses, habits with problem numbers, hand-in counts, outlines), rendered to `specs/class-story.md` by `npm run story:sheet`, with a test that fails while the markdown is stale. A shared suite runs over every registered set and requires its results to equal its sheet column. To make Set 5 → Set 6 obey the one-step rule, Set 5's data changed (nine students' work, one retag); Set 6 did not.

**Context.** Four agents (211–214) author Sets 1–4 in parallel. Each needs to register a set without editing the same lines, pass the same checks, and agree with the others and with Sets 5 and 6 on every student's arc; the user's rule is variation but never more than one step between neighbouring results. Sets 5 and 6 as they stood had 20 jumps of two or three steps (for example Harper's algebra dark green on Set 5, red on Set 6).

**Alternatives considered.** *A hand-maintained array of sets in `lib/assignments.ts`*: four branches appending neighbouring lines conflict (verified in a scratch repo; blank-separated slot lines merge in any order), and the evaluation and groups indexes would each need their own edit. *Self-registration through side-effect imports*: still needs an import line, and hides the order. *Markdown as the single source, parsed by the test*: readable, but untyped (a misspelt status or student id is a parse error at best), and the set tests would parse prose; typed data with a generated sheet gets both. *Fix the jumps on Set 6*: Set 6's classmates drive the live stream, Mistakes, group review, board and many click-throughs. *Allow the Set 5 → 6 jumps as known exceptions*: the user's rule has no exceptions, and the four new sets would be authored against a history that already jumps.

**Tradeoffs.** Set 5's card now reads top gap graph features (9) instead of non-monic factorising (7): the axis-for-height slip is a graph feature on both sets now, so the parabola set's own topic leads. The sheet constrains 211–214 tightly (every status, the problems that carry each habit, the top gap); a row that cannot be authored means editing `data/story.ts` and regenerating, not the markdown. `import *` over a barrel is slightly indirect; the doc comment points at it. Statuses computed by worst leaf make some cells (solid on a thin leaf) awkward to hit; the tickets say how.

**Defense.** Adding a set is one folder and one uncommented line, every problem-keyed and set-keyed index follows from it, and the shared suite plus the story equality test make "agrees with the class" a failing test rather than a review comment. The sheet is data the tests read and markdown people read, from one source.

## 2026-09-13 · The group intro's bar is drawn from an animation-frame clock, not a CSS animation (ticket 232)

**Decision.** The intro's bar width and its time left are both computed in render from one `now`: the larger of `useNow` (1 s) and a new `useFrameNow` (`requestAnimationFrame`, subscribed only while the intro shows). The label rounds to the nearest second. The CSS keyframe drain (ticket 220) is removed.

**Context.** The user saw the bar at 45% beside "0:15" and read it as non-linear. The animation was linear, but the label rounded up on a one-second tick and the animation's start was set from that lagging tick, so the two disagreed by up to 2 s.

**Alternatives considered.** *Keep the CSS animation and derive the label from the animation's `currentTime`*: needs the Web Animations API read in an effect and a state update per second, which the lint rule forbids. *Tick `useNow` faster app-wide*: re-renders every screen that reads it. *Label with `Math.floor` or `Math.ceil`*: whichever way, the bar sits a whole second off half at "0:15"; nearest keeps it within half a second.

**Tradeoffs.** A render of the intro per frame for 30 s instead of a compositor-only animation; the intro is light (text and six tiles) so this costs nothing visible on an iPad, and the frame loop stops when the board opens. The label shows 0:00 for the last half second.

**Defense.** One number drives both marks, so they cannot disagree, and a reload is in step from the first frame with no mount-time bookkeeping.

## 2026-09-13 · The debrief ends itself, only the latest one waits, and the demo pins its pens (ticket 228)

**Decision.** Group review's debrief moves on by itself when its hold ends, driven by the student
app's clock from the problem's close, so it survives a reload. Only the most recently closed problem
can hold a debrief; an earlier one the student had not finished is dropped when a later problem
closes. For the simulation, `group/begin` takes fixed pens by problem (`DEMO_PENS`: Sam on Q1 and on
both visits to Q7), stored on the run and read by `visitsOf`; the shuffle (`dealPens`) stays the rule
and a real run never passes pens.

**Context.** The user saw finished questions come back. Reproduced: `pendingDebrief` queued every
unfinished debrief behind the newest, so a student still reading Q1's when Q2 closed went Q1 → Q2 → Q1.
The user also wanted no press on Next, and to write Q7 themselves to see the ladder at their own pace,
while keeping equitable random pens as the product rule.

**Alternatives considered.** *Keep the queue but auto-advance*: the timer makes lingering rare but a
reload or a slow tab could still send a student back. *Auto-advance inside the debrief component with
an effect*: the lint rule on effects, and it would stop when the component unmounts; the clock loop
already drives the group. *Change the demo seed until the shuffle deals Sam Q1 and Q7*: no seed gives
Sam both visits of Q7 without breaking "nobody twice before everyone once", and it would hide that
the demo is an exception. *Hard-code Sam in `visitsOf`*: the rule and the exception would be mixed in
the product code.

**Tradeoffs.** A student who wanted longer on a debrief cannot have it; the hold is the time. The
demo's pens are a table to keep in step with the union if the demo's mistakes change (pins outside
the union or the group are ignored).

**Defense.** The debrief is one screen at a time, in close order, never behind the board; the product
rule for pens is untouched and the exception is visible and named.

## 2026-09-13 · A set stays in Live until class review ends (ticket 234)

**Decision.** On the Edexia Classroom a live set is in the Live section while any stage of its pathway is current (working, individual review, group review, class review) and moves to Past only once class review has ended. From individual review on its card carries the "in review" tag in Live; "done" is the only status Past holds for the live set. Replaces ticket 186's rule (Live only during individual working).

**Context.** The user saw Problem Set 6 in Past partway through the demo and asked for it back in Live: "want Live until class review has concluded. when in review tag is on, should never move out of live". The lesson is still running during review; Past read as over.

**Alternatives considered.** *Keep 186's rule and reset the demo*: the set would leave Live again at the next hand-in. *Always Live for the demo's set*: a set whose class review has ended would sit in Live with nothing left to do. *A third "In review" section*: another pinned band on a laptop whose Classroom is already pinned top to Live.

**Tradeoffs.** Live can now hold a set nobody is individually working on, so the pulsing "live" line is not what every Live card shows; the tag says which. With more than one live set in review at once the pinned region grows by a card each (one class, one live set today).

**Defense.** Live means the lesson is not over, which is how the teacher reads it; the stage model already says when it is over (`currentStageOf` null), so the rule is one expression with no new state.

## 2026-09-13 · The student report's working opens in the side column, closed by any press outside it (ticket 233)

**Decision.** On the student's report, a Q tile or a skill row shows its marked working in the right-hand column in place of the key and the reflection. The state is one value in the screen (`ReportWork`); a capturing document click closes it unless the press lands in the working's content, a tile, a skill row or Send. Send is never `disabled`: faded with no reflection, it closes the working and nudges (focus, accent ring, a line of text). `WorkPanel`'s per-problem block became `ProblemWork`, and `RowDrill` can hand the picked skill to its caller instead of opening work beneath.

**Context.** The user asked for the report to fit without scrolling, for tiles to open a marked transcription, and, "as a rule", for working to take over the key and reflection column; a press elsewhere closes it, another tile or skill switches it, and the faded Send closes it and tells the student to write the reflection.

**Alternatives considered.** *A modal or popover over the page*: covers the tiles and skills the student is meant to switch between. *Keep the work panel beneath the skills*: pushes the report off the screen, which is what the user asked to end. *A transparent backdrop to catch outside presses*: the press that switches to another tile would land on the backdrop, so switching would take two presses. *Keep Send `disabled`*: a disabled button receives no click, so it could not close the working or nudge.

**Tradeoffs.** A document-level listener must name what keeps the working open (`KEEPS_WORK`); a future control that should keep it open needs adding there. The side column is 320 px, so long maths shrinks to fit (FitText) rather than wrap. Only the final lines show, not earlier attempts (Your working → has those).

**Defense.** One place on screen for working, beside everything that opens it, keeps the report on one screen; the outside-press rule is the one the user specified, and the shared `ProblemWork` keeps the teacher's and the student's marked lines identical.

## 2026-09-13 · A wrong check on the group board wipes it, and Not yet shows the whole attempt (ticket 235)

**Decision.** On group review's shared whiteboard a wrong check empties the board's strokes as well as its transcription, and the Not yet card above the hint shows every line of that attempt with the first mistake red. Replaces tickets 162/221's rule (the board kept so a line could be fixed; the card cut at the first mistake with the rest as a count).

**Context.** The user saw Sam's Q7 after a wrong check, one red line and "2 more lines" in the card, four strokes on the board beside an empty Read as, and asked: "don't collapse the 'not yet' thing. keep it fully visible. also, auto erase the board after an incorrect submission."

**Alternatives considered.** *Keep the ink but grey it out*: the old attempt would still sit under the new one and the transcription (which restarts) would not match what is on the board. *Show the lines after the mistake muted or struck through*: marks something the user did not ask to mark. *Collapse the card only once the hint arrives*: the user asked for it always fully visible.

**Tradeoffs.** A group that only needed to change one line rewrites the whole attempt; the card is the only record of the old one on screen. The card grows with the attempt's length, so a long attempt pushes Read as down the column.

**Defense.** Board and Read as now always agree (both empty after a check), the attempt the group is correcting stays in full view beside the clean board, and the stored attempt already held every line, so the rule is one field in the reducer and no new state.
