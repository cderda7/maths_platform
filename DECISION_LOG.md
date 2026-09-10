# Decision log — Edexia · Maths (current build)

Significant technical decisions for the closed-loop demo in `curr_version/`. Newest at the bottom.
Product and pedagogy decisions inherited from the Sept 7 mockup are in
`roughdraft_sept7/decisions_log.md`.

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
