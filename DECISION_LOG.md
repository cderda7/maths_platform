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

## 2026-09-13 · The old id pset-1 is Problem Set 1's own again; history's jump test waits for unregistered sets (ticket 211)

**Decision.** `pset-1` is the real Problem Set 1 — Surds. Ticket 208's map `pset-1 → pset-5` is removed from `lib/renamedSets.ts`, so `next.config.ts` no longer redirects `/teacher/a/pset-1/…` to Set 5 and `migrateClassroom` no longer moves seating stored under `pset-1` to Set 5 (`pset-2 → pset-6` is left for ticket 212). Separately, the registry-wide "no jumps" test in `lib/setHistory.test.ts` skips a pair of real pills only when the class story sheet has a set between them that is not registered yet.

**Context.** Ticket 211 is told to use `id: "pset-1"`, the id ticket 208 retired the same day when the old Set 1 became Set 5. With the map in place Set 1's Class, Mistakes, Groups and report routes all redirected to Set 5, and any regrouping on Set 1 would move to Set 5 on the next load. Sets 1–4 land on four branches one at a time; with only Sets 1 and 5 registered, fourteen students' histories put Set 1 beside Set 5 two steps apart, a gap the sheet fills with Sets 2–4.

**Alternatives considered.** *Give Set 1 another id (`ps1`, `pset-1b`)*: the ticket, the sheet, the shared suite and history links all expect `pset-N`, and a different id for one set is a lasting oddity to save a same-day demo migration. *Keep the redirect for old links only*: a redirect cannot tell an old Set 5 link from a new Set 1 link. *Author Set 1 to be one step from Set 5*: breaks the agreed sheet and the arcs through Sets 2–4. *Leave the history test failing until 214 merges*: every branch would commit red.

**Tradeoffs.** A browser holding a classroom saved before ticket 208 with seating edited on the old Problem Set 1 now sees that seating on Set 1 rather than Set 5 (a demo state from a few hours earlier). Until 212–214 merge, Sets 5 and 6's history can show a two-step neighbour between Set 1 and Set 5, and the test allows exactly those pairs.

**Defense.** The six-set Classroom the user agreed names its sets `pset-1` … `pset-6`, so the retired id has to come back; the test skip is keyed to the sheet and the registry, allows nothing once every sheet set is registered, and needs no one to remember to remove it.

## 2026-09-13 · Problem Set 2 takes back the id pset-2; its sheet column gains two habit problems (ticket 212)

**Decision.** `pset-2` is the real Problem Set 2 — Rationalising and expanding with surds. It leaves `RENAMED_SET_IDS`, which is now empty (ticket 211 took `pset-1` out the same way; see its entry on old ids reused), so `/teacher/a/pset-2/…` no longer redirects to Set 6 and `migrateClassroom` keeps seating stored under `pset-2` as Set 2's. The old seeded titles ("Problem Set 2 — Roots of a quadratic") still migrate. In the story sheet's Set 2 column, Amelia's New skills habit sits on Q7 and Q8 (was Q7) and Grace's communication habit on Q5, Q6 and Q7 (was Q5, Q6); no status changed.

**Context.** Ticket 208 mapped the old ids to Sets 6 and 5 the same day ticket 210 planned Sets 1–4 under those ids. With the map in place Set 2's Class, Mistakes, Groups and report routes all redirected to Set 6, and a teacher's moves on Set 2's Groups tab would be moved onto Set 6 on the next load. On the sheet: one slip on the conjugate reads solid for Amelia whatever the working (the binomial identity has eight or more lines), so developing needs her habit twice; Grace's one-line answers on two problems leave eleven of fourteen lines complete (solid), a third gives developing.

**Alternatives considered.** *Keep the redirect and give Set 2 another id*: every set is `pset-N` by the shared suite and the history links, and the old links date from one day of demo use. *Detect a pre-rename classroom and rename `pset-2` only there*: nothing in the stored state marks it reliably (a new classroom can hold `pset-2` seating without Set 6 created). *Change Amelia's or Grace's status instead of the habit's problems*: would break one-step neighbours on the sheet; adding a problem to an existing habit changes nothing else.

**Tradeoffs.** A bookmark or browser state from before ticket 208 that named the old live set `pset-2` now opens Set 2, and its seating copy is read as Set 2's (the live set falls back to the class default). Amelia now repeats "conjugate on the bottom only" (Chloe's Q8 slip), and Grace's note names three problems.

**Defense.** The ids name the sets by their real numbers, as ticket 208 intended; the redirect only ever served a same-day rename. The sheet stays the single contract with every habit on a problem where it shows.

## 2026-09-13 · The student header shortens "Problem Set N" to "PSET N" at display time (ticket 236)

**Decision.** The crumb beside the wordmark in the student header reads `crumbTitle(title)`: a leading "Problem Set N" becomes "PSET N", so "PSET 6 — ROOTS OF A QUADRATIC" fits beside the four-stage pathway strip. The stored title and every other place it shows are unchanged.

**Context.** The user saw "PROBLEM SET 6 — ROOTS OF A QU…" during individual working and asked for "PSET 6 -- ROOTS OF..." so the truncation doesn't need to happen.

**Alternatives considered.** *Rename the set's title to "PSET 6 — …" in the data*: the overview's heading, history's eyebrow and every teacher card would change too, and titles a teacher writes would still truncate. *Add a separate short title field to each set*: every finished set and created draft would need one written by hand for one header. *Shrink the crumb's font or narrow the strip*: the brand and strip are measured on every student screen (tickets 151, 185).

**Tradeoffs.** Only titles that start "Problem Set N" shorten; a long created title in another shape still truncates (the `truncate` stays as the fallback). The header and the overview's heading now word the set differently.

**Defense.** One pure function at the one place the space is short, testable on its own, with the rest of the product reading the title as the teacher wrote it.

## 2026-09-13 · On Problem Set 3 an identity line is the binomial identity, the line simplifying it is expansion (ticket 213)

**Decision.** In Problem Set 3's model solutions and evaluation table, the step that applies (a ± b)² or (a + b)(a − b) (`(2x)^2 - 2(2x)(3) + 3^2`, `(3x)^2 - 5^2`, `x^2 - 7^2`, the squares in Q10) is tagged the binomial identity, the set's New skill; the next line that simplifies what it produced (`4x^2 - 12x + 9`, `9x^2 - 25`) is tagged distributive expansion. A built-on line after a wrong identity step is expansion too, so it never counts against the identity.

**Context.** A status is held ÷ attempted lines on a leaf. Tagging both lines of every identity problem with the binomial identity gave ten identity lines per hand-in, so one slip read solid (0.9) and two read solid (0.8) as well; the sheet has four students developing on New skills with a single habit on Q2. Ticket 213 must equal the sheet without changing another set's column.

**Alternatives considered.** *Tag both lines with the identity and author three identity slips for each developing student*: three unrelated slips on a set that tests one idea read as a weaker student than the sheet describes. *Change the four students to solid in the sheet*: breaks the arcs Sets 2 and 4 are authored to (Amelia, Tomas, Noah, Oliver developing), for a tagging convenience. *Tag the simplifying line with indices*: a leaf the set's outline does not name, adding an Algebra leaf a slip on it would turn into a gap.

**Tradeoffs.** Eight identity lines instead of ten, so New skills on Set 3 moves further per slip; a teacher drilling into New skills sees fewer lines under it than under Algebra's expansion. A "4x² + 9" line reads as a right expansion built on a wrong identity rather than a second identity slip.

**Defense.** It is what the two lines are: the first uses the identity, the second multiplies out (2x)² and collects. Each developing student then needs a second real slip where their habit would show again (Amelia's x² − 49 as (x − 7)², Noah's (x + 3)² on Q10, Tomas's (x + 5)², Oliver's perfect square as a difference of squares), which is how a student who misreads the identity actually goes wrong.

## 2026-09-13 · Problem Set 4's sheet column bends to its top gap (ticket 214)

**Decision.** In the class story sheet's PS4 column, Q1's outline is 2x² + 3x − 2 (was 2x² + 5x + 2), Zara's "added the square, never took it away" habit also names Q9, and Ruby's "a pair that multiplies but doesn't add" also names Q4. No status, hand-in count or other set's column changes.

**Context.** The Classroom card's top gap is the largest cluster of students with the same set of slipped leaves on a problem. As written, nine students' PS4 graphing habits were all single graph-features slips on Q8 or Q9, and eight students guessed non-monic pairs, so the card could only read "graph features", not the sheet's "non-monic factorising". Separately, Sam's habit "right split, the signs put into the wrong brackets (Q1, Q2)" cannot happen on 2x² + 5x + 2, which has no minus.

**Alternatives considered.** *Change the sheet's top gap to graph features*: Set 5's is already graph features, and the set is named for non-monic factorising. *Tag some turning-point slips as sketching*: mislabels the mistake for the teacher. *Add unlisted slips to students*: the sheet would no longer describe their work. *Rely on the tie-break (first problem wins) at eight each*: the ticket asks for a clear lead.

**Tradeoffs.** Zara now slips twice on Q9 (the square and then the x for the minimum), a busier problem than her arc's "mostly right"; Ruby's guessed pair on Q4 is the same working as Jordan's. The lead is one student (nine to eight).

**Defense.** Both extensions reuse a habit each student already has on the set, in the category the sheet already gives it, so every status and arc stays as authored and the card reads the set's real subject.

## 2026-09-13 · "Try again" and the hint's ring are derived from the wrong check's moment, timed in CSS (ticket 238)

**Decision.** The group board's "Try again" pill and the hint's one ring hold no state of their own: `tryAgainAt` reads the moment already stored on the wrong attempt, the pill renders while `now < at + TRY_AGAIN_MS` (keyed by that moment), and the animation itself (pop, pulse, fade; the ring delayed by the pill's life) runs in CSS from custom properties set from the same constants.

**Context.** The user asked for a pop-up "Try again" pill after a wrong check, a single pulse in the middle of the screen, then for the hint to ring once after the second one fades. Every member's iPad must show it at the same moment, and it must not replay on a reload.

**Alternatives considered.** *A `tryAgainUntil` field in the run set by the reducer*: a second copy of the check's moment. *A per-tab `useEffect` timer that shows and hides the pill*: fails the lint rule against setState in effects, and a reload mid-life would restart it. *Driving opacity and scale from the frame clock (`useFrameNow`) as the intro bar does*: a React render per frame for a 1.6 s cosmetic effect.

**Tradeoffs.** The class guard runs off the one-second clock, so the pill's element (invisible after its animation) stays in the page up to a second past its life; the ring's CSS delay counts from when the class lands, which is the check's render on every tab, not the stored moment, so a reload in the middle of the 2.5 s would not resume it (it would simply not show if past, or restart its delay if within).

**Defense.** No new state, one source for the timings, and the browser runs the motion smoothly; the rule for which checks prompt a retry sits beside the ladder it follows (`LEAVE_AFTER_WRONG`, `HINT_AFTER_WRONG`) with unit tests.

## 2026-09-13 · An earlier set's report opens inside the later set's Class View route (ticket 237)

**Decision.** A history pill links to `/teacher/a/<this set>/class?report=<earlier set>&student=<id>&open=<category>`. The Class View route then renders the earlier set's student report under this set's chrome (its tabs, with Class current), inside a nested `AssignmentContext` for the earlier set, and a pulsing "← Return to PSet N" links to `?history=<id>&open=<category>`. Simulated history points are removed: a stack holds only earlier sets that assessed the category, and the first set offers no history.

**Context.** The user asked that a pill "simply open the student report from that assignment — NOT taking me to that other pset page", with a pulsing way back. They also asked that history show only previous assignments, with the pill reading the day.

**Alternatives considered.** *Link to the earlier set's own report route* (`/teacher/a/pset-4/report`): its bar carries Set 4's tabs, so the teacher is on the other set's pages. *An in-page overlay held in React state*: no URL, so reload and the browser's Back lose it, and the report's 0.9 zoom would nest inside the roster's 0.72. *Every earlier set in every stack, hollow where not assessed*: the user chose only assessed sets.

**Tradeoffs.** The Class View route now has two faces keyed by the query. Browser Back from the report lands on the plain roster, because history mode drops its query on arrival; the return button restores history mode. Stacks of different heights share one spacing, so a short stack has empty sheet above it.

**Defense.** It is a real URL (reloadable, shareable, and Back works), and the chrome makes it plain the teacher is still in this set. `ReportBody` is the same component as the ordinary report, so nothing is duplicated, and `earlierReportSet` falls back to the roster for anything that is not an earlier set the student sat.

## 2026-09-13 · The history jump test is strict again; Sam's live row stays outside the one-step contract (ticket 217)

**Decision.** With Problem Sets 1–5 all registered, `unregisteredBetween` (ticket 211's skip for a real pair with an unregistered sheet set between them) is removed from `lib/setHistory.test.ts`: every set × student × category pair, and every newest pill against today's classmate result, must be at most one step. Sam's row on Problem Set 6 is not held to the newest-vs-today rule: his today is his live session, and the class story sheet records it as *live*. The click-through reports his two current two-step pairs (after a presenter skip: reasoning Set 5 secure → today gap, graphing Set 5 developing → today secure) instead of failing on them, and they are listed in FUTURE_FEATURES.md for the user's call.

**Context.** Ticket 211's decision promised the skip would be inert once 212–214 merged; ticket 217 checked that it now skips nothing and deleted it rather than leave dead code that could hide a future gap. Checking every student on screen showed Sam's scripted Set 6 run (the demo's story: Q10's negative discriminant read as two crossings, every graph feature right) two steps from his authored Set 5 in two categories.

**Alternatives considered.** *Keep the skip as a guard for future sets*: a set added to the sheet before its data would silently relax the test, the opposite of what the sheet is for. *Re-author Sam's Sets 3–5 now* (a reasoning slip on Sets 4 and 5, one fewer graphing slip on Set 5): changes Set 5's card counts, top gap test and reports from tickets 187, 210 and 214, and picks Sam's story without the user. *Change Sam's scripted Set 6 run*: it is the demo's central narrative on every student screen. *Fail the click-through on Sam*: the check would be red for a data choice no one has made.

**Tradeoffs.** A teacher who opens Sam's history on Set 6 after a skip sees two two-step neighbours until the story is decided. Any live play by a presenter can also land anywhere, so the rule cannot hold for Sam's live row in general.

**Defense.** The unit test covers every fixed record with nothing skipped, which is the contract the user asked for; Sam's live row is by construction not a fixed record, and the one visible exception is named, reported on every run and deferred to the user rather than hidden or patched with a story nobody chose.


## 2026-09-14 · A new set's pathway default is separate from the demo's (ticket 239)

**Decision.** Create's review state starts on `NEW_SET_PATHWAY = []` (individual working alone); `DEFAULT_PATHWAY` (individual → group review) stays what the student and teacher screens assume when no set has been created. The map's stage descriptions show only for the last column, beside the pill when at least 200 px remain in the map and under it otherwise.

**Context.** The user asked for the map to start with only individual working filled in, and for a grey description beside a hovered review stage. They agreed the demo keeps its pathway and that the line shows only while nothing is to the right of the pill.

**Alternatives considered.** *Change `DEFAULT_PATHWAY` itself to `[]`*: the demo with no created set would skip every review screen and its deep links and click-throughs. *Show the line for every column as a flyout over the arrows*: covers the arrows the teacher is reading. *Always beside the pill*: class review in the third column has about 60 px before the card edge, so the line would wrap one word a line or spill out of the card.

**Tradeoffs.** Two pathway constants that read alike; the third column's line sits under the pill rather than to its right, the one place the user's "to the right" is not kept. Hover-only text is unseen on touch (focus shows it for keyboards).

**Defense.** The demo's behaviour is untouched and the new set's default is named for what it is; the placement rule is pure geometry from fixed widths, so it cannot drift from the layout.


## 2026-09-14 · A live diagnostic is a problem's steps on a similar problem, each distractor tied to the wrong line it mirrors (ticket 240)

**Decision.** `data/diagnostic.ts` holds, per problem, a similar problem and an ordered list of `DiagnosticStep`s (a `Diagnostic` plus a teacher-side `name`, id `d-<problem>-<step>`). A distractor that mirrors a real slip carries `slip`: the exact wrong line from the evaluation table. A classmate's pick is derived: the option whose `slip` is a line of their own work on the problem, else a common slip `picks` names them on (only students who have not reached the problem), else the correct one. The flyout's "n slipped here" counts the mistake view's rows with a wrong line one of the step's distractors mirrors. A push carries only the step id; teacher-written questions and their travel with the run are gone. Stems may hold inline `$…$` maths. Every option's maths is checked by a small TeX evaluator in the tests.

**Context.** The user found every diagnostic repeated its problem, then asked for atomic step questions whose wrong answers come from the class's real slips so the teacher sees where and why students went wrong. The old authored `picks` had drifted from the data (Chloe picking on problems she never started, Liam on problems he never reached).

**Alternatives considered.** *Author every classmate's pick per step by hand*: the ticket's wording, but it duplicates the slip data and drifts exactly as the old list did. *Tie a distractor to a slip label or taxonomy leaf*: several slips share a leaf (Q7's two fraction slips), so a leaf cannot say which analogue a student picks. *One step per slip only*: rule 2 asks for every thinking step, with common slips where no student slipped. *Keep a teacher-written tab*: the user removed it.

**Tradeoffs.** A slip whose wrong line was written at the factorised line (Q1's pair) is tied to both "Find the pair" and "Factorise", so those two steps both read 4 slipped; the line does not say which thought failed. The derived picks use each student's end-of-set work, not their work at the moment of the push in the live stream. Common-slip picks remain a short hand list. A push stored before this ticket names an id that no longer exists and renders nothing.

**Defense.** The wrong line is the one fact the data really records about a slip, so tying to it makes a false attribution impossible by construction, and tests pin it against `mistakesByProblem`. Ticket 242's "repeated their own slip" is then one comparison (the student's wrong line equals the option's `slip`), and 241's chain needs only ordered step ids. Checking the maths mechanically is the only honest guard for 132 options that go on a projector.

## 2026-09-14 · The review pathway is a line of toggles with an explicit undecided state (ticket 246)

**Decision.** Create's review pathway is one fixed-order line of three switchable stops between individual working and done, and `ReviewState.pathway` is `Pathway | null`: `null` until the teacher chooses, `[]` only when they press "No review, working only". Create looks off and takes the press while `null`, answering by scrolling to the card and ringing it. Switching the last stop off returns to `null`.

**Context.** The user found the branching map (ticket 197–239) unclear: it read as "pick one branch", not a sequence, and nothing said the teacher had to choose. Grilled the same day, they took a fixed order, a line of toggles, an explicit No review choice, three distinct looks and a waiting Create.

**Alternatives considered.** *A chain built with "+ add review step"*: hides the options until pressed. *Named presets*: eight combinations to name, and a custom mode that is the line anyway. *Keep `[]` as the start with Create on*: a teacher who never sees the card creates a set with no review by accident. *A boolean `decided` beside the array*: two fields that can disagree (`decided: false` with stages). *Last stop off → No review*: turns an undo into a choice nobody made.

**Tradeoffs.** Every reader of `review.pathway` must handle `null` (two did: Confirm groups and `create`). The line is fixed at five 156 px columns, so a fourth review stage would need a new layout. The waiting Create is a gate, which the no-confirm-gates rule allows only because the pathway is not inferred.

**Defense.** Undecided and No review are different facts and now have different values, so the gate and the looks follow from the data; the fixed order is built into the layout, so the line can never show an invalid pathway.

## 2026-09-14 · A mistake group's label is its wrong line, and a too-wide label widens its columns (ticket 245)

**Decision.** On the Mistakes view every mistake group (students on the same wrong line) carries a label over its names: the wrong line(s) as written, in the open working's red, spanning the group's columns, collapsed and open. `FitGrid` sets the labels first, one factor per problem from 17 px down to 13 px, and where a label still does not fit, raises its group's per-column minimums (re-checking, since a widened column takes flexible width from its neighbours) before it fits the working on the settled columns.

**Context.** An outside review said the view's name clusters are distinct wrong answers but collapsed they look arbitrary. The user chose the wrong line over the final answer, over the names, on every group, kept when open, both lines when two, widening over truncation, on this view only.

**Alternatives considered.** *The final answer*: in 68 of 122 groups on Sets 1–5 it is a knock-on of the slip, and different mistakes can share it. *Truncate with an ellipsis and a hover*: a cut maths expression reads as a different expression. *One label font per label*: labels in one card would differ in size for no reason the teacher sees. *Fitting labels with the working in one pass*: opening a problem would change the factor and move the labels.

**Tradeoffs.** Each collapsed card is one label row taller. Widening is measured in a layout effect, so it runs on every render and resize (six problems at 800 px, none at 1280 or 1440). A group whose students share a wrong line but not their working spans columns whose names wrap unevenly under one label.

**Defense.** The label is the grouping's own key, so it can never disagree with the clusters it names; the fit is deterministic from the DOM, writes no React state, and the click-through proves nothing moves on open at four widths.


## 2026-09-14 · A problem's review is one shape for both kinds of student, and its working takes the skills card's place (ticket 243)

**Decision.** `lib/report.ts` reads a student's work on a problem as `ProblemReview` (first submission, second submission, the group's version once the group closed it), built from the live session and group run (`sessionReviews`) or from a set record (`recordReviews`, with `Classmate.review` optional until ticket 244 writes it). Tiles, outcomes, the not-solved note and the versions shown all read that one shape; the session-based functions the student report uses sit on top. On the teacher's report a tile's or skill's working is drawn in an absolutely placed panel over the skills, which stay laid out but `invisible`, so the card cannot resize. Versions shown follow the outcome: first try alone, individual first and second, group all that exist up to the group's rework, incorrect every version there is.

**Context.** The user wanted the student report's tiles on the teacher's report for every student on every set, with working inline on the left (not the right column), versions side by side like the group debrief, only the relevant ones, and nothing to scroll on the laptop. Measured at 1280×800 the space under What happened was about 50 px against the ~250 a problem needs; the user chose the skills card's place.

**Alternatives considered.** *A second outcome function for records*: two rules for which column a problem is in, free to drift. *Working under What happened with the page scrolling*: breaks the no-scroll rule the user set. *Unmounting the skills while working is open*: the card would take the working's height and What happened would jump. *Showing every version always*: the user said a group's rework on a problem the student already had right is no use.

**Tradeoffs.** The skills are rendered (hidden) while working is open. Records fill only two columns until 244. Fitting the longest commentary meant tightening the right column (idea rows, box padding, the quote at 19 px) and splitting the key into two lists; a live run with many practices could wrap the notes line and need a few more pixels.

**Defense.** One shape means the teacher's and the student's report can never disagree on a column, and 244 only adds data. The hidden skills fix the card's size by construction, so nothing moves when working opens, which the click-through asserts to the pixel.

## 2026-09-14 · A diagnostic chain is stored as moments; every close and reveal is derived (ticket 241)

**Decision.** A chain's run (`lib/diagnosticChain.ts`) stores only what people did and when: the step ids in solution order, when each step opened, the demo student's pick per step with its moment, the moment force submit was pressed per step (removed on cancel), and when the chain ended (back to work, or a withdraw flagged `withdrawn`). Nothing is stored when a step closes. `closedAt(run, i)` is the earlier of the twentieth answer (the last classmate's scripted arrival, or the demo student's answer if later) and force submit plus ten seconds; `isRevealed`, the tallies (arrivals before the close; totals over the responders after a forced close), the countdown and the control are all functions of the run and `now`. The reducer refuses each action outside its phase against the stamped `at` (an answer or force after the close, next before the reveal or past the last step, back to work before the last reveal, a push while a chain is out). Ended runs stay on the classroom: the flyout reads a step's latest result, and each chain's push-to-end span is a pause the classmates' stream clock leaves out (`streamElapsed`, `wallAt`). The chain code lives in its own module so `lib/classroom` (which stores runs) and `lib/diagnostic` (which tallies them) both read it without an import cycle.

**Context.** The laptop, the board and the iPad are separate tabs that share the classroom store by localStorage and BroadcastChannel, each ticking its own clock once a second. The ticket needs the reveal to land on every surface at the twentieth answer or at the countdown's zero, the countdown to be cancellable, and a reload to replay nothing.

**Alternatives considered.** *Store a phase per step (answering → revealed) and a `closedAt` written when it happens*, as the ticket's sketch put it: some tab has to notice the moment and write it; with no tab open on the laptop the board would never reveal, two tabs could write different moments, and a reload in between would disagree with its neighbours. *A timer in one tab (the teacher's) that dispatches the reveal*: the same single point of failure, and the iPad and board lag by the broadcast. *Per-step records (`{ stepId, openedAt, answer, forcedAt }[]`) instead of parallel maps*: equivalent; the maps keep the run flat and step lookups by id, which ticket 242's pickers and repeated-slip marks use. *Drop a withdrawn run*, as ticket 137 did: the stream would lose the pause and the classmates would jump ahead by the discussion's length.

**Tradeoffs.** Each surface sees a close up to one clock tick (≤1 s) after it happens, as everything driven by `useNow` does. The rules for closing live in one pure function every surface must call; a surface that read `answers` alone would reveal early. The reducer's refusals depend on the dispatching tab's `Date.now()`, fine on one machine, not across devices without a shared clock. Runs accumulate for the lesson (a few small objects). A stored pre-241 run is converted to an ended chain of one; an old run that was still open is treated as ended.

**Defense.** Deriving rather than recording the close is what makes "every tab agrees and a reload replays nothing" true by construction rather than by coordination, and it is the same pattern the classmates' arrivals, the live stream and the group race already use in this codebase. It keeps the stored shape small and testable (the unit tests walk the whole chain with explicit moments), and it gives 242 everything it needs without new state.

## 2026-09-14 · Who picked an option comes from the same arrivals as the counts; a repeated slip reads the mistake view's rows (ticket 242)

**Decision.** `lib/diagnostic.ts` computes a step's answers once (`arrivalsAt`: each classmate whose scripted answer landed after the step opened and before it closed, plus the demo student's pick, in arrival order) and derives both `tally` (counts) and `pickersAt` (student ids per option) from it. `repeatedSlip(step, studentId, option, rows)` is true when the option carries a `slip` (ticket 240's original wrong line) and that exact line is wrong in the student's row among the problem's mistake-view rows, the demo student's live row included. The flyout maps ids to names and initials and passes pickers to `DiagnosticResults`, which draws them only at `size="panel"`.

**Context.** The ticket asks for avatars whose number always equals the cell's count, live as answers land, and a mark when a student's pick is the analogue of their own slip on the original problem. The demo student's original work is the live session, not the classmates' fixture, and on a live set the classmates' records are the stream's at `now`.

**Alternatives considered.** *A second loop for pickers beside the tally*: two copies of the close and cutoff rules, free to drift. *Tally counts as the pickers' lengths only*: same thing, but the arrivals shape keeps the order the avatars need. *`repeatedSlip(step, studentId, option)` reading `CLASSMATES[i].attempts`*, as the ticket's sketch named it: it cannot see Sam's live work, and it would mark a classmate whose problem has not arrived in the live stream, against the Mistakes rows the teacher is looking at. *Marking any distractor with a misconception when the student slipped anywhere on the problem*: marks a different slip as "the same".

**Tradeoffs.** A classmate who has not handed the problem in yet on the stream picks the analogue of their scripted slip (240's rule) without a mark. The flyout recomputes pickers per render (twenty students, trivially cheap). `repeatedSlip` takes the rows as an argument rather than finding them itself.

**Defense.** Counts and avatars cannot disagree because they are one list; the mark says "same slip as on Q1", so it is judged against exactly the Q1 working the teacher can see beside the flyout, which is also what "n slipped here" counts (`slippedAt`).

## 2026-09-14 · In-class work keeps every decision with the teacher; the program raises each one when it is due (tickets 250–259)

**Decision.** The answer to the CTO's "too many permutations" is guidance, not removal. The teacher still chooses the review pathway at Create (ticket 246) and can change any stage the class has not reached during the lesson (254); the live view raises each decision at the moment it is due, with its evidence (255), including "add class review?" halfway through the stage before it so problems and examples can be picked in time. An absent student leaves every count and their seating group for the day (250). Between-assignment evidence is one student page served on two routes, one under Edexia Classroom and one under a set, so Back always returns to the origin (251–253). After the reflection, problems a student ever got wrong go into a homework bank as problem types (256).

**Context.** Outside feedback read the screens as snapshots without cause and effect, the product as a lesson format with about twenty mechanics, and suggested automation, a delete pass and error-derived groups. The user rejected automatic defaults ("a reliance on defaults we arbitrarily set instead of teacher judgement"), the delete pass and error grouping (groups are seating, mixed-ability), and kept the scope period-shaped in-class work, homework later.

**Alternatives considered.** *The system decides, teacher overrides*: less teacher time, but replaces judgement with our defaults. *Delete or hide mechanics*: fewer concepts, loses tools the user wants. *Decide only at Create*: predictable lesson shape, but the teacher decides before seeing work. *Decide only live*: best evidence, but the teacher walks in without a plan. *Absent students counted as not handed in (x/20)*: stable denominators, but punishes the class's numbers for an absence. *Two separate holistic pages*: simple Back, two designs to keep in step.

**Tradeoffs.** A pathway that can change mid-lesson makes student routing depend on the moment of change (a stage is only switchable before anyone present enters it). Prompts add something on the live view that must never cover the grid. Denominators vary by assignment (x/19 on PS6). The homework bank promises practice the product does not yet deliver.

**Defense.** Plan at Create plus change when due gives the teacher both the lesson shape up front and the evidence at the moment, and it cuts what the teacher must remember without cutting what they control. Absence is a fact about the room, so counts that leave absent students out are the honest ones. One page on two routes keeps a single source of truth with correct history.


## 2026-09-14 · Escape is one stack of open layers, not a listener per popup (ticket 247)

**Decision.** Everything closable registers a layer on one per-window stack while it is open (`lib/escape.ts`, bound by `components/useEscape.ts`). One bubble-phase keydown listener closes the top layer with that thing's own close action and returns focus to its opener. A layer with no close is a wall: while one is open (the student's quick check), Escape closes nothing. An Escape a control has already used (`defaultPrevented`) is left alone, so the reorder drag's cancel and the Fix box's clear keep working.

**Context.** The user wanted Escape on every popup and collapsible view, one layer per press. Three things had their own window listeners that knew nothing of each other; under the quick check, Escape closed a help card hidden behind the modal.

**Alternatives considered.**
- *A listener per component, stopping propagation*: order depends on listener registration, not on what opened last, and a window listener cannot stop a sibling window listener reliably.
- *A dialog library (Radix, react-aria)*: brings focus traps and portals the iPad frame's absolute layers do not want, and still would not cover expanded views (drills, open problems, filters).
- *Native `<dialog>`*: its Escape closes only modal dialogs, not flyouts or expanded rows.
- *Ordering by DOM depth*: siblings opened in sequence (three open problems) have no depth order.

**Tradeoffs.**
- Order is open (registration) order. Two layers that mount in the same commit register child first, so a Class View drill opened straight onto a skill closes whole in one press.
- Focus returns to the element focused when the layer opened. Where that element is re-created (the diagnostic chip, a hint card's button, the chat opened from the menu) the component names its successor.
- A wall blocks layers opened after it too, which is right only because walls are whole-screen modals.

**Defense.** One small, pure, unit-tested rule decides what Escape does on every screen, and adding a closable thing is one hook call with its existing close. The click-through drives every layer with real key presses at two laptop sizes.

## 2026-09-14 · A fresh demo starts with Problem Set 6 not yet sent; Sam's Classroom is the student landing (tickets 263, 264)

**Decision.** On a fresh demo PS6 has not been sent: Sam's Classroom (/student) shows PS1–PS5 under Completed and an empty To do, and the teacher's Edexia Classroom has no live PS6 card. Create or the teacher's new skip to "send assignment" sends it. Teacher skips (send assignment, students done with current stage, activity completed) move every surface together, Sam included.

**Context.** /student opened on whatever stage the stored session held, often the final report, so a cold visitor's first screen had no context. The user asked for a student Classroom as Sam's landing with PS6 in To do "after teacher has pushed assignment", and chose not-sent as the default and Sam moving with the teacher's skips.

**Alternatives considered.** *PS6 already sent on a fresh demo*: no setup step and no test churn, but the student landing never shows the moment an assignment arrives, and Create has nothing to change. *Teacher skips move classmates only*: the presenter can drive Sam live, but the iPad, board and teacher views disagree about the lesson's stage.

**Tradeoffs.** Every screen, deep link and click-through that assumed a live PS6 must send it first; the teacher side is empty of a live set until someone does. A presenter who wants Sam to lag behind the class must use the student skip afterwards.

**Defense.** Sending is the product's real first event, so the demo now starts where a lesson starts, and one shared state for every surface keeps the tabs consistent, as the rest of the demo already guarantees.

## 2026-09-14 · Sam's Classroom and the set are two routes under one iPad layout; deep links send the set (ticket 264)

**Decision.** `/student` is Sam's Classroom and `/student/a/pset-6` the set, both under `app/student/layout.tsx`, whose `StudentShell` holds the device and everything that runs on it whichever screen is open (teacher advances, the gate, the whiteboard's scripted turns, class review's freeze, the countdown, the diagnostic, SKIP TO). `/student?stage=…` redirects there with its query. A deep link that names a stage sends Problem Set 6 when nothing is sent (`deepLinkClassroom`: `DEFAULT_PATHWAY`, live an hour ago like a skip); `?pathway=` sends as before; a plain link to the unsent set goes back to the Classroom. The teacher's Create resets Sam's session to the start. The blank board names no set before one is sent.

**Context.** The default is now "not sent" (entry above), so the student side can no longer assume the fixture set, and plain `/student` stops meaning "continue the stored run".

**Alternatives considered.**
- *One route with the open screen in the session store* (`view: classroom | set`): a teacher skip could move the iPad into the set, but the URL would never say where Sam is, Back would not return to the Classroom, and every reader of the session would carry a UI field.
- *The Classroom and the set as sibling pages without a shared layout*: simpler tree, but the iPad re-fits on every navigation (a frame at the wrong scale) and while Sam sits on his Classroom nothing applies a teacher's advance (it goes stale after a minute) or plays the group's turns.
- *Deep links render the set at `/student?stage=…` in place*: no redirect hop, but two URLs for one screen.
- *Deep links under the skips' three-stage pathway*: one fixture, but `?stage=frozen`, `?stage=class-wait` and friends would change behaviour from what they did before any set was sent (`DEFAULT_PATHWAY`).
- *Leave Sam's session alone on Create*: a stale run from before a Reset would open PS6 mid-lesson from To do.

**Tradeoffs.** One redirect round trip for the old deep links; the set route renders nothing for a moment on a cold load until the store is read; Create now clobbers a run a presenter had put Sam in before creating.

**Defense.** A URL per screen matches the teacher's `/teacher/a/<id>`, and keeping the device and its clockwork in the layout means the lesson moves the same on every student screen, as the tabs already guarantee across surfaces.

## 2026-09-14 · `/` redirects to `/teacher`; the chooser moves to `/demo` (ticket 265)

**Decision.** `app/page.tsx` is a server `redirect("/teacher")`, prerendered by Next as a 307; the presenter's chooser moves unchanged to `app/demo/page.tsx`.

**Context.** Outside review: a cold visitor's first click from the landing was the Student card, so their first impression was the student's final report. The user: "/ goes to teacher's edexia classroom".

**Alternatives considered.** *Render `Classroom` at `/` too*: two URLs for one page, the address bar reads `/` while every link and "← Edexia Classroom" say `/teacher`, and the Classroom tab's active state would need both. *A `redirects()` entry in `next.config.ts`*: equivalent at runtime, but the route would vanish from `app/` and a reader of the tree would not find what `/` does; the repo already redirects old URLs from `page.tsx` (`/teacher/mistakes`, `/teacher/report`). *A client redirect*: a flash of an empty page and a history entry for `/` that Back would bounce off.

**Tradeoffs.** A 307 (temporary), not 308: browsers do not cache it, so `/` can become something else later without stale redirects; the cost is one extra round trip on every visit to `/`. The chooser is one hop further for the presenter (`/demo`).

**Defense.** One URL per page, Back behaves (it skips `/`), and the route stays discoverable in `app/` beside the other redirects.

## 2026-09-14 · Absent students leave the counts, per set, read live from the classroom (ticket 250)

**Decision.** The classroom keeps each set's absent students (`ClassroomState.absences`, read through `absentOf` in `lib/absence.ts`); a set the teacher has never touched reads the demo's list (`data/absences.ts`: Chloe on Problem Set 6). Every count on that set is over the class in the room: the absent student is out of numerator and denominator (x/19), their work is not a Mistakes row, they answer no diagnostic, the gate into group review does not wait for them, and their seat stays but they are out of their seating group for that set's group review. The Class View roster keeps their row in place, greyed, with the toggle under the name. The group union takes a member's wrong problems and the problems they started and left incomplete, never ones they did not attempt.

**Context.** The user, on real lessons: an absent student needs a "grey out"; seating groups are fixed fours, and today a student not in the room counts against the class as not handed in. Asked about the counts, the user chose to leave the denominator, which makes Chloe (nothing handed in on PS6) the demo's absent student. The union rule was settled in the same conversation.

**Alternatives considered.**
- *Absent counted as not handed in (x/20)*: stable denominators, but punishes the class's numbers for an absence (rejected in the ICW plan).
- *Snapshot the absent list onto each diagnostic run at push*: no threading of the list through the chain's functions, but a student marked absent mid-step would hold the step open until force submit.
- *Remove the absent student from the set's stored groups*: one list fewer, but the seating chart would change, and marking them present again would have to remember where they sat.
- *Grey an absent student's rows on Mistakes instead of dropping them*: shows everything, but the counts beside each card would no longer add up to the class present, and their work would be suggested as class review examples.
- *The toggle as a fourth row button*: one place for row actions, but three stacked buttons already set the row height (ticket 177); a fourth would grow every row.

**Tradeoffs.**
- The absent list threads through the live set's pure functions as an argument (readiness, stage counts, diagnostics, standings, examples), a few more parameters in exchange for every tab agreeing from the one stored list.
- A group run already begun keeps its members: marking a groupmate absent mid-run changes the other groups' race, not the live board's pens.
- On Problem Set 6 two diagnostic distractors whose only picker was Chloe (the one student who had reached no problem) are picked by nobody while she is away.
- Sam's unfinished Q9 now counts towards his group's progress (14ths, not 13ths); it was already in the union through Zara.

**Defense.** Absence is a fact about the room, so counts that leave absent students out are the honest ones; reading the list live keeps the laptop, the board and the iPad in step the moment the teacher corrects it, and keeping seats intact makes an absence a one-day change that undoes cleanly.

## 2026-09-14 · The homework screen changes a question into its similar one by stacking two same-shape KaTeX renders (ticket 256)

**Decision.** Every similar problem's question is written in its original's exact shape: only the numbers differ, digit for digit (`texShape` in `lib/homework.ts`, enforced by tests). The screen typesets both, each changed number wrapped in `\htmlClass{hw-diff}`, stacks them, shows the original whole and the similar one's changed numbers only, and a CSS variable rolls the old numbers out and the new ones in (`.hw-aligned` in app/globals.css). Stems may differ in any words; their changed runs cross-fade with the room easing between the two widths. The whole sequence is derived from the moment the report was sent (`homeworkAt`) and the clock, not from component state, and one absolutely positioned element does all the moving.

**Context.** The user wanted a student to see the question "change live, like can see it's similar type, but diff numbers / diff set up", with the tile expanding in place (nothing beside it moving) and then flying into a folder; maths must never split or gain spacing.

**Alternatives considered.**
- *Cross-fade the whole expression*: simple and any shape works, but the shared structure blurs too, which is exactly what should visibly stay.
- *Typeset each segment separately*: KaTeX's operator spacing depends on neighbours, so the segments would set differently from the problem as written (extra spacing in maths).
- *Measure glyph positions and FLIP each glyph*: handles different digit counts, but is fragile against KaTeX's nested markup and sub-pixel layout.
- *CSS keyframe animations per phase*: smooth without React renders, but a reload or a skip mid-way cannot resume at the right frame, and a click-through cannot assert a moment.
- *Reuse ticket 240's diagnostic similar problems*: already written, but students have seen them in class, several change the digit count, and they have steps, not whole solutions.

**Tradeoffs.** Authoring is constrained (the same digit counts and the same signs, so Q1's new roots had to be 1 and 7); a data slip that breaks the shape falls back to a whole-expression cross-fade, and the test fails first. A frame-driven overlay re-renders the flight every frame for about half a minute; the skill dots are memoised out of it.

**Defense.** Same-shape stacking makes "same type" literally visible: every shared glyph sits on its twin (the click-through checks their positions match to 0.15 px and that Q1 sets at the width of the bare TeX), with KaTeX untouched. Deriving from `homeworkAt` makes reloads, SKIP TO and reduced motion one code path.

## 2026-09-14 · A problem goes into homework if it was ever wrong, and not attempted counts (ticket 256)

**Decision.** `everWrong`: the first submission does not hold (a wrong line, or nothing written), or the student's own second submission has a wrong line. Fixed in review still goes. The group's version never decides it. The tiles are marked by the same rule.

**Context.** The user agreed "wrong at any point (first submission, even if fixed later)". The ticket's unit list names "not attempted" without saying which way.

**Alternatives considered.** *First submission only* (a later wrong rework stays out): the same for every current run, but a student who broke a right answer would see nothing go. *Not attempted stays out*: the student never showed the type, so there is nothing to practise from; but the report already files it under Incorrect, and a blank is no evidence of the skill.

**Tradeoffs.** A skipped problem reaches homework though the student may know it; a right tile could in principle turn red only because of a later wrong rework.

**Defense.** It matches the report's Incorrect column for blanks and the user's "at any point" for reworks, and every scripted run gives the same five problems for Sam and none for the strong run.

## 2026-09-14 · The holistic page reads finished sets from the story sheet and the live set as its Class View does (ticket 251)

**Decision.** `lib/holistic.ts` builds one student's page from `data/story.ts` for every finished set, and from `rosterEvidence` (the Class View's own reading, moved out of `TeacherLive` into `lib/assignments.ts`) for the live set: Sam from his session, each classmate as far as the stream has reached, with the sheet's habits kept only on problems the teacher has seen. Absence comes from the set's own `absent` list (ticket 250), on any set, not from the sheet's absent cells, so the teacher's toggle on the Class View moves this page too. Columns are the sets the Classroom holds, so Problem Set 6 appears once it is created. A habit worded the same on several sets in one category is one row with a ref per set. The per-assignment report opens on a problem's working from `?work=` and goes back through `?from=`, accepted only when it is a holistic path.

**Context.** The ticket asks for a pure view model over the story sheet with Sam's Set 6 live, and for grid cells equal to the sheet. Set 6's sheet rows are the classmates' end state, which the Class View only reaches once the stream is over; mid-lesson the sheet would show results the class has not produced. Problem Set 6 does not exist for the teacher on a fresh demo (tickets 188, 263).

**Alternatives considered.**
- *Every cell from the sheet, Set 6 included*: simplest and always equal to the sheet, but mid-lesson the page would show Jordan's Q7 habit before he reaches Q7, and a teacher arriving from the Class View (ticket 253) would see two different Set 6 rows.
- *Every cell computed from the records (`classmateHierarchy`) on every set*: one code path, but habits exist only in the sheet, so the page would still need it, and the finished sets already equal it by test.
- *A Set 6 column before Create reading "not set"*: shows the full grid shape, but offers a column header that leads to "Not in the Classroom".
- *Each habit per set, never merged*: literal, but the same slip on PS4 and PS5 reads as two unrelated habits, the opposite of the page's purpose; ticket 252 collapses them on the tiles too.
- *Opening the working through report state in localStorage*: no URL change, but the link would not survive a reload or a new tab.

**Tradeoffs.** Two sources: finished sets from the sheet, the live set from evidence; they agree only because `data/finishedSets.test.ts` and `data/story.test.ts` hold the records to the sheet. Merging habits depends on identical wording; near-identical words ("signs in the wrong brackets" vs "the signs put into the wrong brackets") stay two rows. The report gains two query parameters.

**Defense.** The page never contradicts the Class View a teacher just left, never shows a result from the future, and still equals the story sheet whenever the lesson is over, which the click-through checks for all twenty students on both routes. Sharing `rosterEvidence` means the two screens cannot drift. A URL for the working keeps Back and browser back honest.

## 2026-09-14 · A sent diagnostic chain takes the Mistakes page as a focused view; long chains fit by narrowing, not scaling; the flyout's state lives outside React (ticket 260)

**Decision.** Sending a chain from the Mistakes flyout turns the Mistakes page into the chain's focused view, under the same chrome, tabs and eyebrow, until done or a withdraw. The view is derived from the stored chain (`liveDiagnostic`). The problems stay mounted but `hidden`, and the page's scroll is saved at the send and restored afterwards. Every step of the chain sits in one centred row. When the row is wider than the page the cards narrow equally (`flex: 0 1 460px`). A narrow card stacks its options in one column, and a stem whose widest maths would pass the card scales as a whole (`FitStem`); the text otherwise keeps the flyout's sizes. The flyout's open state and step selection move from `DiagnosticPush`'s React state to a module store with no app imports (`app/teacher/diagnosticFlyout.ts`).

**Context.** The user asked for a "new window pop up" that shows only the sent questions side by side, persists once pushed, and returns to Mistakes on done. The follow-up questions settled on the page itself rather than a floating box, Q2's five steps fitting one row at 1280 with no scroll or wrap, and a fix for the flyout "collapsing when a new mistake comes in". On a production build that collapse never reproduced: the hold above the pointer (ticket 189) keeps everything under the flyout still. It reproduced on the user's own setup, `next dev` running from the main checkout that other sessions merge into. A merge touching `data/diagnostic.ts` remounted the Mistakes tree through Fast Refresh, closing the flyout and dropping its selection, and the held names landed in the same instant.

**Alternatives considered.** *A modal or floating panel over the Mistakes page*: it keeps the page's scroll for free, but the user's "return to mistakes page view" and the tab-switch requirement read as a page state, and a modal over a zoomed, scrolling page fights the chrome. *Unmount the problems during the chain*: simpler, but loses what was expanded and makes the scroll restore depend on the stream rebuilding the same heights. *Scale the whole row uniformly (CSS `zoom` or transform) to fit five cards*: one number and no reflow, but at 1280 the text falls to about 7.5 screen px under the teacher's 0.72 zoom. *Horizontal scroll or a second row*: ruled out by the user. *Keep the flyout's state in React and blame the dev server*: the demo runs on that server, and the same remount comes from anything that re-renders the tree (a provider flash, a route refresh).

**Tradeoffs.** The hidden page keeps rendering every second behind the view (cheap: the stream is paused during a chain). Cards on a five-step chain are tall with one column of options, so on a 1280×800 laptop the control's band sticks to the window's foot over the cards' lower edge until the page is scrolled. One narrow card's stem can read a size smaller than its neighbours'. The flyout store is per tab, not per page mount: a flyout left open on one problem is still open when the teacher comes back to Mistakes, and closes on the pointer's first move off it.

**Defense.** The focused view is a function of the stored chain, like the board and the iPad, so every tab and a reload agree without a message. Narrowing keeps the maths at a size a teacher can read across the room, and the checks prove nothing splits, overflows or scrolls sideways at both laptop sizes. The store removes the collapse at its cause (state tied to a mount), not just the symptom on one server, and the reproduction runs against the setup where the user saw it.

## 2026-09-14 · Review outcomes are the sheet's, held to the agreed rules read literally; a group's version is one (ticket 244)

**Decision.** Every set record carries `Classmate.review`: a second submission (the model solution's working) exactly where the student fixed the problem alone, and on every wrong problem its seating group's version, stored once per group and written onto each member by `withReview` (`data/recordReview.ts`). Where each problem ends and why is the class story sheet's review part (`STORY_REVIEW` in `data/story.ts`, rendered into `specs/class-story.md`), and `lib/reviewRule.ts` applies the rules the user agreed literally so a test holds the sheet to them: a *one-off* (that mistake on one problem of the set, the sheet's habit naming only it) is fixed on the student's own rework; a *repeated* slip is fixed in group review when a groupmate handed that problem in without making it; a *habit* (a gap in the slip's category on that set) stays wrong, the group's last try being the first habit-holder's own working. A group's version is one fact, so when its rework checks every member still wrong there reads "Correct after group review", a habit included; the demo group's Set 6 versions are its scripted run. On the live set `recordReviews` takes the review stages the class has finished (`reviewStagesOver`: over, or current with everyone done), so a later fix sits in Incorrect until its stage ends. On the teacher's report the not-solved note moves to Incorrect's second label line, one line wide, and "· Not solved in group review" beside the open problem's outcome; the skills card grows to the page's spare height (a layout effect writing `min-height`), and a problem's versions still too tall for it are scaled down together (CSS `zoom`, two readings of the panel's height) rather than scrolled.

**Context.** Ticket 243 put the tiles on the teacher's report, and every record filled only Correct first try and Incorrect. The user agreed the rules on 2026-09-14 (one-off, repeated with a groupmate who did not make it, habit from the sheet), the working behind every version, the sheet pinning outcomes as it pins statuses, the live stage gating, and no change to any status, pill or mistake view. 236 wrong problems across the six sets: individual 149, group 42 (9 where a habit is carried by the group's single rework), still wrong 45. With the unsolved note under the tiles, three Set 6 reports and one Set 5 report scrolled by 14–18 px and every one-line note by 1 px. Opening every tile of every report at 1280×800 and 1440×900 showed the working scrolling inside the card in over 700 of the opens, most of them already so under ticket 243 (Sets 1–3 have short skills cards, Set 4's Q10 model solution is nine lines).

**Alternatives considered.** *Outcomes computed by the rule at runtime*: the reasoning would live nowhere a reader can check, and a later hand decision would have nowhere to go. *"One-off" as not seen on the previous set too*: needs fuzzy matching of habit texts across sets (Aiden's "√2 into the first term" and "the 2 on x² only"); the per-set reading is the literal one and testable. *A habit wins over the group's rework (the group unsolved, a groupmate's repeated slip left wrong)*: contradicts the other rule for that groupmate and, on Set 6, the demo group's own scripted run, which Sam's report shows. *A version per member*: members of one group would disagree about what their board said. *A second submission on every wrong problem*: a student who did not find their slip would hand the same working back, a duplicate column; the rule allows "if written". *Hiding group versions until class review*: on a pathway without class review, group review never becomes "over". *The note on its own row, or wrapping under the tiles*: adds 15–30 px the laptop does not have. *A fixed tall skills card*: blank space on every Set 4–6 report whose skills already fill it, and still too short at 1280 for nine lines. *Two columns of lines for a long single version*: reads across instead of down a working. *Letting the working scroll*: the rule is nothing to scroll.

**Tradeoffs.** Every fixed version is the model solution, not the student's own route. The group's last try repeats the habit-holder's first submission, so for them two columns match. The rules are per set, so a slip a student makes on every set (Aiden) is still a one-off each time. The gating is class-wide: a group that finished early still waits for the class, and a teacher who ends group review early shows no group versions until class review starts. Groups are the frozen seating: moving a student on a set's Groups tab does not rewrite its review. The note's column floor grows 28 px per unsolved problem (three at most in the data). The skills card on Sets 1–3 now has blank space under its skills. A nine-line working at 1280 reads at about 88%. The commentary's idea rows lose a pixel of padding each side (py-1 to 3 px): after ticket 266 raised the page's head, Ethan's six-idea Set 4 commentary scrolled the 1280 page by 10 px.

**Defense.** The sheet stays the single contract, now for outcomes as for statuses, and the checker (`reviewMismatches`) ties sheet, rules and working together, with a test that it bites. One version per group makes "identical across the group" true by construction. The first submission is never touched, so the Class View, history and Mistakes view read exactly what they did, and the existing suites prove it.

## 2026-09-14 · The Class View's "did you know?" lies over the Student head, and its dismissal is its own localStorage key (ticket 253)

**Decision.** A student's name and both of their avatars on a set's Class View link to the holistic page under the set. The one-time note ("Did you know? A name opens that student's Holistic Assessment, also in Edexia Classroom." with Dismiss) is laid absolutely over the blank space in the roster's Student head, right of the "STUDENT" label and clear of the first category chip, two lines at the row buttons' 11.5 px. Dismissal is a stamp under its own key, `edexia-demo-holistic-note-dismissed`, read through `useSyncExternalStore` (`null` until the client has read it, so a dismissed note never flashes in).

**Context.** The ticket puts the note "next to the names" as an overlay that never reflows the grid, and says a dismissal lasts for good, through Reset demo. At 1280 × 800 the roster is 1204 of its card's 1208 px and the side column is full, so there is no free column beside the names; the Student head's 420 px column carries only its label. Reset demo writes only the classroom and session keys (`edexia-maths-demo/…`).

**Alternatives considered.**
- *In the 40 px gap between the due line and the roster card*: one line fits, but it reads as part of the due line rather than beside the names, and would crowd both the line above and the card below.
- *A flyout down and right of the Student head over the first rows*: roomier, but it covers Sam's name, pill and pills, which the teacher reads first.
- *A field in the classroom state*: one store, but Reset demo returns the classroom to its start, which would bring the note back against the ticket.
- *Only the leading avatar as a link*: literal to "name and avatar", but the closing avatar (ticket 136) is the same student's mark at the other end of the row, and pressing it would open the row's drill instead of the student.
- *An underline on hover for the name*: the usual link cue, but it sits 3 px over "mark absent" and crowds it; the accent ink moves nothing. The teacher side keeps the arrow cursor (ticket 61), so the colour is the only cue.

**Tradeoffs.** The note is small (11.5 px under the 0.72 zoom) because the head is 53 px tall; it rides along with the sticky head as the roster scrolls. A second browser or a cleared storage shows it again (per browser, not per teacher account; there are no accounts). Three links per row, one in the tab order.

**Defense.** Every roster rect (row, cells, name, avatars, toggle, buttons, heads) measures the same as main's with the note shown, after Dismiss, and after hovering, for every set at 1280 × 800 and 1440 × 900 in the click-through; the note stays where the eye already finds the names, and the dismissal survives exactly what the ticket names while the demo's own reset stays untouched.

## 2026-09-14 · Tile tags are the habits on two sets or more, collapsed by an authored label per habit (ticket 252)

**Decision.** A Holistic Assessment tile shows a student's recurring habits: a habit that shows on two sets or more, as "label · n sets" under its category, most sets first. The story sheet words a habit for its set, so `data/habitTags.ts` lists, per student and category, the wordings that are one habit with one short label (Sam's "right split, the signs put into the wrong brackets" on PS4 and "right split, signs in the wrong brackets" on PS5 read "signs in the wrong brackets · 2 sets"); a habit worded alike on every set needs no entry and reads its own words. The set count comes from `holisticView`'s refs, so it is what the student's page shows (the live set only on problems seen, a set marked absent gone). A habit on one set stays on the student's page only.

**Context.** The ticket: tags come from the sheet's habits, "where a habit's wording differs by set, the view model picks one label per habit (a short label field in the data if needed; never grep-count or guess)", and the tile shows "their recurring habits". The sheet has 217 habits; Tomas alone has 21, so every habit as a tag would make a tile a list, not a glance. The arcs name each student's recurring slips ("turns fractions over and copies the sign printed in a bracket"), which the labels follow.

**Alternatives considered.**
- *A `label` on every habit in `data/story.ts`*: one source, but 217 call sites edited in the file tickets 211–214 and the generated sheet were authored against, and most habits never recur.
- *Merging by similar words (shared tokens, edit distance)*: no authoring, but it would join "a sign lost" with "a sign copied" and miss "solved 2x + 1 = 0 as x = −2" as a fraction turned over; the ticket says never guess.
- *Every habit as a tag, one-set ones without a count*: complete, but tiles of fifteen to twenty tags, and the between-sets picture (what keeps happening) buried under one-off slips.
- *Labels on the holistic page's rows too*: would make the page match the tiles, but the page's rows name each set's own slip with its problems, which a teacher opening a working needs; left for later.

**Tradeoffs.** Which wordings are one habit is an authoring judgement (Tomas's "multiplied by the same bracket, not its conjugate" counted as copying the bracket's sign), made reviewable in one file and held to the sheet by `data/habitTags.test.ts`, not proven. A new or reworded sheet habit that recurs under different words shows as two one-set habits until the table gains it. A student with only one-set habits (Liam before Problem Set 6) has a tile with no tags.

**Defense.** The tag text and count are always the sheet's own habits on the sets the student's page shows, never inferred, and the grouping is explicit data a teacher-facing reviewer can read line by line. Keeping the tile to what recurs is what "between-assignment" means.

## 2026-09-14 · A tile's strengths are the categories secure on every set that assessed the student in them (ticket 252)

**Decision.** A strength is a category whose every result is secure, with at least one: a set that does not assess the category ("—"), a set the student was marked absent for, and the live set while it has nothing of the student's in the category ("not seen" there) are passed over; "not seen" on a finished set (missing, or never reached those problems) is a set with nothing secure, so it rules the strength out.

**Context.** Agreed with the user: "strengths = the categories the student is secure in on every set that assessed them." Liam's communication is secure on the four sets he handed in and not seen on PS3 and PS5; Jordan's reasoning is secure on PS1 and PS2 and not seen after (he never reaches the worded problem); Chloe is away for PS6; at the start of the lesson every classmate's PS6 column reads not seen.

**Alternatives considered.**
- *Pass over every "not seen"*: Liam's communication and Jordan's reasoning become strengths on two or four sets of evidence, although four sets saw no reasoning from Jordan.
- *Count every "not seen" and absent against*: Chloe loses every strength for being away, and every student loses theirs when Problem Set 6 goes live, returning as the stream reaches them.
- *Secure on the latest set only*: a trend, not the whole record the page is about.

**Tradeoffs.** The rule treats the live set differently from a finished one, so a strength can appear once the class has handed in if a classmate never reached a category on PS6 (Grace's functions: secure on PS4 and PS5, not seen on PS6). A strength says nothing about how many sets back it.

**Defense.** A strength is a claim to a teacher; it is made only where every set that could have shown the category and has finished showed it secure, and an absence or a lesson still running never takes one away.

## 2026-09-14 · The tiles keep their scroll in sessionStorage, restored on mount (ticket 252)

**Decision.** A tile press stores the teacher scroll region's `scrollTop` in sessionStorage; the tiles page, once drawn, sets it back; the Classroom's entry forgets it, so arriving from the Classroom opens at the top. Back ("← Holistic Assessment") and the browser's back both land where the teacher left.

**Context.** Teacher pages scroll `[data-teacher-scroll]`, not the window (ticket 68), and each page draws its own `TeacherChrome`, so the router's scroll restoration never applies and Back is a link push, not a history pop.

**Alternatives considered.** *`router.back()` for Back*: restores nothing here (the element remounts) and breaks Back for a student page opened directly. *The student id in Back's URL, scrolling that tile into view*: returns near, not exactly where, and puts the tiles' state in the student page's link. *A module variable*: lost on reload, and stale across the demo's tabs.

**Tradeoffs.** Arriving at `/teacher/students` by typing the URL after opening a student returns to the old scroll. One more storage key.

**Defense.** Exact return by both ways back, with no change to the student page and one line on the Classroom's entry.

## 2026-09-14 · Mark absent is disabled, not hidden, once the student has handed in; the guard is in the roster, not the reducer (ticket 270)

**Decision.** A present student whose set is handed in (`isSubmitted`) keeps the "mark absent" button in its place, disabled and grey with a "has handed this set in" tooltip. An absent student's "mark present" always acts. The `absence/set` reducer is unchanged.

**Context.** The user: "disable mark absent for an assignment already submitted -- otherwise, teacher might accidentally click on it & erase student work." On a finished set nineteen of twenty rows handed in.

**Alternatives considered.** *Hide the button for those rows*: nothing to press, but the teacher can no longer tell the control exists or why it is missing on most rows. *A confirm step on mark absent*: a gate on every mark, including the legitimate ones. *Refuse in the reducer too*: the reducer knows the classroom state but not the live stream's progress at `now` or the finished records, so it would need the assignment bundle passed in.

**Tradeoffs.** A disabled control on most rows of a finished set shows on hover. A student marked absent before handing in (then handing in on the live set) stays absent until the teacher presses mark present. A dispatch from outside the roster could still mark a handed-in student absent.

**Defense.** The ask is to disable; the grey button with its reason explains itself, the one way in is guarded with the same progress the row already shows, and undo is never blocked.

## 2026-09-14 · The holistic view names its axes by content: `sets` and `categories` (ticket 269)

**Decision.** With the grid turned (sets down, categories across), `HolisticView.columns` and `rows` are renamed `sets` (`HolisticSet`) and `categories` (`HolisticCategory`); each category still carries one cell per set. The page reads `categories[k].cells[j]` for set `j`. The category chip is extracted to `CategoryChip` and used by Class View and the holistic grid.

**Context.** User 2026-09-14: "swap rows for columns & columns for rows", and the category headers should look like Class View's chips. The model's field names described the old drawing.

**Alternatives considered.** *Keep the names and transpose only in the page*: `view.columns` would mean the page's rows, a trap for the next edit. *Transpose the model too (cells per set)*: the tiles' strengths and the tests read per category, so they would each re-transpose. *Copy the chip's classes into the page*: two copies drift.

**Tradeoffs.** A rename across five files for a presentational change; the chip now sets its own type, so on Class View it no longer inherits from the head row (tracking written as 0.6 px, the head's computed 0.06 em at 10 px, so nothing moved).

**Defense.** Names that say what they hold survive the next re-layout, and one chip means "looks like Class View's" stays true.

## 2026-09-14 · A problem on a teacher screen reads as its whole question, in one wrapping line (ticket 271)

**Decision.** Wherever a teacher screen names a problem, it shows the stem's words followed by the expression as one line of prose (`ProblemQuestion`), wrapping between words; the expression never splits and a hyphenated word never breaks. The live diagnostic view's display header drops the expression ("Q2 · Live diagnostic") and carries the question on a line under it. A problem with a figure (PS6 Q8's graph) carries a small thumbnail of it after the expression, 64 px wide in rows and headers.

**Context.** The user could not tell from "y = 2x² + 5x − 3" what the student had been asked to do. Every problem already has a stem; the teacher screens dropped it. Stems either lead into the expression ("…of the graph of") or are whole sentences ("Solve for x."), and most fit one line of a Mistakes header at 1280; PS5 Q10's is 201 characters.

**Alternatives considered.**
- *Stem on its own line above the expression*: every Mistakes header grows by a line (the 69 px row the counts and the Live diagnostic chip centre on), and a short stem like "Solve for x." sits alone on a line.
- *Truncate the stem with a tooltip*: what Board controls did; hides exactly what the user asked to see.
- *No figure*: the first cut; the one problem with a figure says "The graph of the following is shown", and the user asked for a small thumbnail of the graph.
- *The figure full size*: a 300×190 graph in a header row doubles the row.

**Tradeoffs.** A long stem makes a two-line header (PS5 Q10: 87 px), where the counts and the chip stay centred on the first 69 px. A sentence-ending stem reads "…state the y-intercept. y = 2(x − 3)² − 5", the expression after the full stop, as on the student's card.

**Defense.** One component and one reading order everywhere, the same order the student saw; short questions keep every row its old height.

## 2026-09-14 · The teacher's jumps step the lesson as it stands, move both stores as one change, and live in a strip of their own (ticket 263)

**Decision.** `teacherSkip` in `lib/demo.ts` is a pure step from the current classroom and session, not a rebuild from nothing like Sam's skips: "students done" reads the stage the class is on (`currentClassStage`) and enters the next stage of the pathway in force, with Sam's scripted work for that stage; the last stage, or a lesson already over, is "activity completed". A lesson can now end outright: `ClassroomState.lessonEndedAt`, read through `lessonOver` wherever "class review ended" was read, stamped only by the presenter for now. A sent set (`assignment/create`, from Create or a jump) starts a new lesson, dropping the earlier lesson's gate, whiteboard, chains, class review and end. The two stores move together through `setLesson`: one message on its own channel and one storage write, adopted by every other tab in one task. The bar sits in a presenter strip below the teacher's scroll region, with Reset demo, instead of floating over the page.

**Context.** The user asked for send assignment, students done with current stage and activity completed on the teacher side, every surface moving together, Sam too. Three things surfaced building it. (1) Nothing in the product ends a lesson whose pathway has no class review: `currentClassStage` stayed on group review (or individual review, or the working) forever, so the card could never reach Past. (2) The first click-through had the iPad on homework after "activity completed" in one run and on the report in another: the teacher tab's classroom and session went out as two broadcasts, the iPad rendered class review ended against Sam still frozen, its clockwork released him to the report, and that write overwrote the jump's homework in every tab. (3) A fixed bar bottom-left covered a roster row's avatar and name on the Class View at rest (1280×800).

**Alternatives considered.**
- *Rebuild the demo from the fixture on every jump, like Sam's skips*: simpler and already tested, but drops what the teacher set up (the pathway Create chose, absences marked on the roster, a class review they set up) and could not honour "the stage the class is on by the current pathway".
- *Support only the demo pathway, disabling done or completed on others*: no model change, but a Create with individual and group review would leave the presenter with a card stuck in Live.
- *End a lesson without class review by faking an ended class review*: no new field, but the board, the Groups tab and the stage reader would treat a pathway without class review as having had one.
- *Order the two writes (session first, or classroom first) and guard the reducers*: session first makes Sam frozen with nothing projected (released to the report); classroom first makes the old session freeze and overwrite the fixture work. No order is safe for every jump without a delay.
- *Debounce the iPad's clockwork effects*: works in practice, but slows every real transition and still depends on timing.
- *Keep the bar fixed and pad the page*: padding clears the bottom of a scroll only; at rest a control can still sit under a fixed bar.

**Tradeoffs.** `lessonEndedAt` is state the product itself never sets yet (logged in FUTURE_FEATURES). Clearing lesson state on Create changes a second Create in one session (it used to inherit the old run's group and class review; that was never intended). `setLesson` adds a third channel and key, and a tab without BroadcastChannel depends on storage events arriving in write order. The strip takes about 40 screen px of height from every teacher page at 1280×800. A presenter jump replaces Sam's live session with the scripted one, as his own skips do.

**Defense.** A step from the state as it stands is the only reading of "students done with current stage" that respects the teacher's own choices, and the tests hold each done equal to Sam's own skip to that stage on the demo pathway, so both bars agree. `lessonOver` names the one idea (every stage behind the class) that four readers had spelled as "class review ended". One message per jump removes the race at its cause rather than by timing, and Reset and Sam's skips get the same guarantee. A strip is the only placement that can promise, and the click-through measures, that no teacher control is ever under the bar on any route at either laptop size.

## 2026-09-14 · "see history" opens every stack, and the `open` query goes (ticket 279)

**Decision.** Pressing "see history" stands the earlier results above every category that has any (`historyCategories`). The way back from a history pill's report opens the same way, so the `open=<category>` query (pill link, return link, page, `ClassViewInit`) is removed. The separate Escape press that closed only the stacks is removed; one press closes history mode.

**Context.** The user found the second step (press each category pill to see its column) slow: the teacher pressed "see history" to see the history.

**Alternatives considered.**
- *Keep `open` so the return restores exactly what was standing*: the teacher may have hidden a stack before opening a report; restoring that needs the whole open list in the URL, for a rare case.
- *Keep two Escape presses (stacks, then mode)*: with the stacks opening with the mode, the first press would leave named pills with nothing above them, a state the teacher never asked for.

**Tradeoffs.** A teacher who hid some stacks and opened a report comes back to all of them standing. On a top row the sheet covering the rows above is as wide as every column with history rather than one.

**Defense.** "see history" now shows the history in one press; one rule (`historyCategories`) decides what stands on both ways in, and there is no query state left that only mattered for the old one-at-a-time flow.

## 2026-09-14 · The homework sequence spends its time on the change, and the folder counts nothing (ticket 274)

**Decision.** Each problem takes 2 s: expand 250 ms, original 250, change 650, similar 350, fly 450, gap 50 (`MOTION` in `lib/homework.ts`); reduced motion shows each pair for 1950 ms with a 50 ms gap, the same 2 s clock. The line naming the type fades in over the end of the change rather than waiting for the hold. The folder shows no number at all: no badge, no count in its accessible label, no count attribute; `bankedCount` is replaced by `lastLanded`, which names the problem that landed last so the folder icon can bump.

**Context.** The user found ticket 256's 5.6 s a problem (about 30 s for Sam's five) slow: the student is not meant to read the question and think how to solve it, only to see it is the same type with different numbers; and "0" on the folder read wrongly, since other problems will join these. Frames captured every ~60 ms through Q1 and Q10 at 1280×800 showed the original readable for about 350 ms (the body is in by the last 100 ms of the expansion and the eased change starts slowly), both old and new numbers mid-roll for about 300 ms, and the new question settled with its line for about 500 ms before the fly.

**Alternatives considered.**
- *Scale every phase down evenly (×0.36)*: keeps 256's proportions, but the change drops to 320 ms, too quick to see numbers moving, while the expansion and fly keep time the ticket wants spent on the change.
- *Keep the line appearing only in the hold*: with a 350 ms hold the line would be up for well under half a second before the fly takes it away.
- *A total on the folder, or the count of types from this set*: either reads as "your homework is these five", which the user said it is not.
- *Keep `bankedCount` internally and just not render it*: works, but leaves a number one prop away from the screen; naming the last landed problem gives the bump what it needs and nothing more.
- *Drop the lead too*: the ticket budgets "plus the lead", and the 1.2 s lets the student take in the tiles before the first one leaves.

**Tradeoffs.** A student who wants to read a question cannot: it is on screen for about 1.3 s. The folder no longer says how much went in; the dashed slots in the tile row are the only record of which problems went. Reduced motion's pair is up for under 2 s, which may be short for a student relying on it.

**Defense.** The change is the only thing the screen teaches, so it gets the longest phase and the holds are cut to what it takes to see before and after; the frame captures show both states and the roll clearly. With no number the folder cannot misstate the homework, and the tiles landing in it still show where the problems went.

## 2026-09-14 · A holistic result opens its tree as a flyout; the patterns move beside the grid and zoom to fit (ticket 277)

**Decision.** On a student's holistic page a coloured result opens, as a flyout under its row and over the rows below, the category's whole skill tree on that set, read from the Class View's evidence (`holisticWork`); a skill picked there shows its problems in the side column in the patterns' place. The patterns move from under the grid to a 540 px column beside the header and grid that runs to the bottom of the scroll region, and anything taller than that column is zoomed down to fit (`FitHeight`), never scrolled. Sets are newest first. Communication's working, which no model solution tags, is read from every problem the student wrote on (`problemsBehindLeaf`), here and in Class View's drill.

**Context.** The user wanted to see the problems behind a result "similar to functionality elsewhere" (Class View's drill), the dots directly below the pill, the problems top right, the summary narrower, and every pattern line visible at 1280×800 with the table only marginally smaller. Measured: 75 layout px were free under the table; Tomas's 18 lines needed ~680 in two columns, ~450 in three. The user chose patterns beside the table.

**Alternatives considered.**
- *A drill row inserted under the set's row, as Class View does*: pushes the later sets and the patterns down, against the no-scroll goal and the "expand as overlay" rule.
- *Patterns under a much shorter table (one-line set heads, 3 columns)*: the user asked for the table only marginally smaller.
- *Problems stacked above the patterns in the side column*: both compete for one column's height; the patterns would zoom to unreadable while problems are open. The side column swaps instead, as the student report's working replaces its side column.
- *Scroll inside the side column*: the user asked for no scroll and to shrink text to fit.
- *A fixed font scale per student*: every student's count differs and the live set adds lines as the stream arrives; a measured fit handles any count and any window.
- *Showing no problems for Communication's working*: its panel was empty in Class View too; the result is read from every line written, so every problem written on is its evidence.

**Tradeoffs.** Zoom to fit makes the heaviest lists small (a 10-problem skill at ~0.7, Tomas's patterns at ~0.85 at 1280×800) and the user may ask for a different trade. The flyout covers the rows below it while open, and at the grid's right edge its tree starts left of the pill rather than under it. The grid's columns are narrower (272 px set column, results ~107 px) to make room. Arrows are drawn from measured layout, not by React.

**Defense.** One tree, the Class View's, for one result means the flyout can never disagree with the pill (tested for all twenty, three lesson states). Nothing on the page moves when a result opens, and the patterns stay whole on a laptop for every student however many lines they have.

## 2026-09-14 · A click on another row only closes an open skill tree; one click opens the full tree; the pressed row is anchored (ticket 280)

**Decision.** On the Class View roster, with a student's tree open, a click on another student's row that is not a button, pill or link only closes it; pills and row buttons act at once. A category pill opens the category's full tree (`expandAll`), and a row tap the full tree (`expanded`), where both used to open groups and needed a double-click for the rest; the double-click handlers are removed. When a tree above the pressed row opens or closes, the teacher frame scrolls by the row's move so the row stays under the pointer.

**Context.** The user wanted the tree to behave like history mode, which closes on a click in another row, and spelled out each target: buttons open at once, a pill opens that category's dot skills, anywhere else closes, a second click opens the full tree. Testing showed that closing a tall tree above the clicked row moved the page, so the pointer landed on a different student and the "second click" would have opened the wrong row.

**Alternatives considered.**
- *Close-only for pills too*: exactly history's rule, but the user asked for pills to open at once.
- *Keep double-click for the full tree*: redundant once one click opens it, and a double-click would otherwise open then shut.
- *CSS `overflow-anchor`*: the browser's scroll anchoring picks its own anchor node (often inside the closing tree) and does not reliably hold the row the teacher pressed inside the zoomed frame.
- *Scroll the pressed row into view after the change*: moves the row to a fixed place instead of leaving it where the pointer is.

**Tradeoffs.** A teacher comparing students by row taps needs two clicks per switch. The groups-only view (`RowMode` "groups") is no longer reachable from the roster (the student's report still uses it through `SkillColumns`). Near the top of the scroll a row can move slightly if there is not enough scroll left to take up the change.

**Defense.** One rule across history and skill trees (another row's empty space closes), with the targets that are clearly actions still acting at once; anchoring makes "click again" hit the same student, which the rule depends on.

## 2026-09-14 · Patterns surface from the class's five most recent sets, as one rule the page and the tiles share (ticket 276)

**Decision.** What ticket 251 and 252 called habits are **patterns**, in the UI and the code (`data/patternTags.ts`, `Pattern`, `PatternRef`, `PatternGroup`, the review rule's `pattern` basis). A pattern is a tag's wordings in a category (`patternTagLabel`: an authored label, else the words). `lib/holistic.ts` holds the rule: `recentSets(sets)` is the ids of the class's latest `RECENT_SETS` (5) sets by due date (`dueOrder`), and `surfacing(patterns, window)` keeps a pattern when one of its occurrences is on a set in the window, with every wording and occurrence, older sets included. `holisticView` applies it; `holisticTile` reads the view (each row carries its `tag`), so the tiles show exactly the page's patterns, one-set ones included ("· 1 set"). The live set is in the window, but its occurrences are only those the teacher has seen (as before). The page loses its Habits eyebrow and the live pill on Sam's live set; `HolisticSet.live` goes.

**Context.** The user (2026-09-14): one-set patterns belong on tiles; call them patterns; "a pattern that hasn't shown up in 5 assignments doesn't surface. IF it's a pattern that's happened in more recent assignments, then yes show the earlier pset as part of that pattern." With PS1–PS6 in the Classroom the window is PS2–PS6, and ten PS1-only patterns leave (Amelia 2, Oliver 2, Chloe 2, Tomas, Liam, Isla, Ruby 1 each). Before PS6 is sent the Classroom holds five sets, so the window is all of them and those ten still show.

**Alternatives considered.**
- *The student's latest five sets with a result* (skipping sets they missed or were absent for): kinder to Liam, who missed PS3 and PS5, but "assignments" in the user's words are the class's, and a window that differs per student makes two tiles side by side mean different spans.
- *Count only sets with results for the live set* (leave PS6 out of the window until its results are in): keeps PS1-only patterns on screen through the lesson, but the user's rule counts assignments, and PS6 is assigned the moment it is sent.
- *A window by date (the last N weeks)*: closer to a real term, but the demo's sets are days apart and the user named a count.
- *Apply the rule per wording instead of per tag*: simpler, but would drop PS1's wording of a pattern that came back worded differently (Tomas's "the fraction turned over dividing surds"), the exact case the user said to keep.
- *Tiles apply their own filter*: two copies of a rule that must agree; the page's model already groups by category and now carries the tag.

**Tradeoffs.** Sending PS6 hides ten patterns at once, before anyone has handed PS6 in. A student who missed recent sets can lose an old pattern they never had the chance to repeat. Tiles now carry every recent pattern (Tomas twelve tags once PS6 is in, three before ticket 276), so rows grow taller. The review rule's basis is renamed with the rest (`"pattern"`), so the generated story sheet and the review reasoning read "Pattern:" too.

**Defense.** One pure function, one window for the whole class, the user's words as the rule: "5 assignments" is a count of the class's sets by due date, a surfacing pattern keeps its history, and the page and the tiles cannot disagree because the tiles read the page's model.

## 2026-09-14 · Group review takes every problem a member did not get right; the demo group's board keeps today's records (ticket 278)

**Decision.** A member brings to their group every problem they did not get right first time: a wrong line, started and left incomplete, or not attempted. One rule serves the live student (`reviewProblemsOf`) and every record (`recordReviewProblems`), and every reader of a group's problems (board, intro, standings, the teacher's card, the leaderboard, the class stage's count, the skip fixtures) reads it through `lib/group.ts`, so none changed on its own. With today's records Sam's group works all ten problems. The scripts follow the rule: the group solves a problem when a present member had it right, and a problem nobody had right is left for now and closed unsolved on its return. Q9, which nobody had right, is scripted by the exception the user agreed for ticket 281 (one member wrong on a single line, the hint after the second wrong check naming it, the third try holds). Q4, Q5, Q6 and Q8, on the board only because Liam and Jordan never reached them, hold on the first try. The race is re-timed and the demo pathway becomes individual → group → class review.

**Context.** The user: "have all non-attempted, incomplete, or mistake problems surfaced in group review" and "surely a group member would be able to convince him of their functional strategy & get the group to get the right answer within 2 or 3 rounds of tries". Ticket 281 will change Liam's records (at least five attempts per set), which shrinks this union, and this ticket was told not to touch records. Under the rule read literally, Q9 would close unsolved. That would change Zara's Set 6 record, the story sheet's review part and Sam's report.

**Alternatives considered.**
- *Q9 closed unsolved now*: the rule without its exception. It moves Zara's and Sam's Q9 to Incorrect and edits a record and the sheet ahead of 281, which re-derives them anyway.
- *Q9 left as it was (two tries)*: no visible change, but the script would break the rule the tests now hold every outcome to.
- *A class slip as the first try on Q4–Q8*: nobody at the table made one, so the board would show a mistake no member made.
- *Sam holding the pen on an added problem*: more for the presenter to write on a longer board; Liam and Jordan, who never reached those problems, write them instead.
- *Keep the race schedule and let the longer unions carry on at each row's last gap*: coral and violet would finish near 13 minutes, and the report jump's holding board would show groups not home.

**Tradeoffs.** Sam's board is longer: about 5:40 at the quickest against about 4:30 before. Four more debriefs follow problems Sam had right (his first submission beside the group's rework, both green). Q9 now leans on a rule 281 owns, and the intro's first sentence changed by four words. Scripts written against today's records will be pruned when 281 lands.

**Defense.** One rule in one place is what the user asked for, and every screen agreeing follows from it. The exception keeps records and reports steady until 281 re-derives the data in one pass, and the tests hold every scripted outcome to the rule so 281 cannot drift from it. The pens stay named simulation data beside the shuffle, as ticket 228 set.

## 2026-09-14 · "send assignment" puts the demo back before its Create; a jump opens the set on Sam's iPad (ticket 272)

**Decision.** The teacher's "send assignment" no longer sends. It puts the demo in the moment before sending: no set out and no lesson (`unsent`, simulation only), Create's draft on its last step (`readyDraft`: Generate's set with the three scripted recommendations accepted, which is Problem Set 6's ten problems, and the demo pathway chosen), Sam on his Classroom with nothing to do; the bar opens that step. Pressing Create sends as a real Create does, through `lib/create.ts` (`createAction`), which `ReviewAssignment` now uses too. Separately, a lesson another tab moves with a set out (the teacher's done and completed) opens the set on the iPad when Sam is on his Classroom, through a listener on adopted lesson moves (`subscribeLessonMoves`).

**Context.** The user pressed "send assignment" and stayed on the Classroom: it had sent PS6 silently (reproduced at 1280x800 in a fresh profile). Asked where it should land they chose Create's last step, ready to send, and answered ticket 263's open question (open the set on Sam's iPad from his Classroom) "yep".

**Alternatives considered.**
- *Send, then navigate to the set's page*: lands somewhere, but the presenter cannot show the moment of sending, which is what the user asked for.
- *Fill in the step but leave a sent set in place*: no "unsend" in the model, but a Live card and Sam's To do would already show PS6 before Create, and Create would then look like it did nothing.
- *Leave the pathway undecided on the step (Create waits, ticket 246)*: truer to the product rule, but the user asked for the pathway filled in and ready; the demo's pathway is named simulation data passed from `lib/demo.ts`, the rule in `PathwayStep` untouched.
- *Duplicate Create's action in the demo tests*: the tests would pass while `ReviewAssignment` drifted; one `createAction` makes the test and the button the same code.
- *An explicit "open the set" flag in the lesson message*: explicit, but the iPad can read the fact itself (a set is out after the move); Reset and send leave nothing out, Sam's own skips happen in his tab and already navigate.
- *Open the set from `StudentShell` for any route*: the shell would need the pathname; only the Classroom needs it, inside the set the screen already follows the session.

**Tradeoffs.** `unsent` is a state change the product never makes (named simulation only). Pressing send mid-lesson replaces whatever draft the teacher had with the demo's. A second jump from another tab within the same navigation is ignored by the Classroom's once-guard (it would open the same route). A future lesson move from another tab with a set out opens the set too, by design.

**Added the same day.** The presenter now always lands on this step, so two things it showed became their own fixes. (1) An accepted addition takes the slot of a removed question (first addition, first freed slot), else comes last: the scripted assessment removes a repeat and adds the worded problem, which the seed's own comment calls a replacement, so the set reads Q1 to Q10 in the students' order; the alternative, reordering the draft seed, cannot work (the ball problem is not in the draft), and sorting the finalised set by bank order would ignore a teacher's own reorder (ticket 150). The addition's card names where it went ("added as Q9"). (2) The Create steps' floating bar and the clearance under their content are one pair of constants (`createBar.ts`): the clearance is the bar's whole reach above the window's bottom edge (`bottom-16` plus a size-lg button, `pb-28`, was `pb-24`), so the last row clears it at the end of the scroll whatever the presenter strip's height. Moving the bar into its own row would clear it at rest too but takes about 70 px from every step; logged in FUTURE_FEATURES.

**Defense.** The user's own words set the landing; Create is the real product path, so the presenter demos exactly what a teacher does. Lifting Create into a pure function made the skip's draft provable (the ten problem ids, goal and New skills equal PS6's) and kept one definition of sending. Reading "a set is out" on the iPad keeps the lesson message a pure state transfer.

## 2026-09-14 · A student's skill tree is a sheet over the rows below, not a row in the table (ticket 284)

**Decision.** The Class View's single-student skill tree renders in `DrillSheet`, an absolute sheet in the roster box laid over the rows under the student's row, instead of a `<tr>` inserted after it. The table never changes height for it. The sheet ends on a row line, grows the roster box's bottom padding when it runs past the card, and closes on a click on its blank paper.

**Context.** Ticket 280 kept the pressed row under the pointer by scrolling the frame when a tree above it opened or closed; the user found the page jumping around "not great" and asked for the tree to pop up over the next students' rows, as history's results stand over the rows above.

**Alternatives considered.**
- *Keep the row and anchor harder (animate the scroll)*: the page still moves; the user rejected moving.
- *A floating panel beside the roster*: breaks the trees' alignment under their category pills, which the drill's columns are built on.
- *A sheet sized to the tree alone*: its bottom edge cut a covered row through its middle, a strip of that row peeking out.
- *Fading every other row, as history does*: history is a mode about one student; a tree is a quick look, and the rows above and below stay in use (their pills and buttons act at once).

**Tradeoffs.** Rows under the sheet cannot be clicked until it closes (a click there closes it, the next acts). A tree near the bottom adds scroll room under the card while open. The column view still inserts rows under every student, so it still reflows (logged). The sheet is outside the student's `tbody`, so the row buttons' hover needs `sheetHover` state.

**Defense.** The same overlay idea as history, mirrored downward, means one mental model for both, and nothing on the roster moves under the pointer, which removes the problem ticket 280's anchoring only patched.

## 2026-09-14 · A set score counts the first submission only (ticket 285)

**Decision.** The Class View's Set column reads problems right on the first submission over the set's problems (`lib/setScore.ts`): finished with no wrong line, the rule group review already uses (ticket 278). A second submission, the rework and the group's version never raise it. A student still on the set reads a dash.

**Context.** The column read problems handed in, so a student who wrote all ten with three wrong read 10/10 (Sam on Problem Set 5). Carson: the set score should be based on the initial submission, not post-review stages; a dash before hand-in was agreed in chat.

**Alternatives considered.**
- *Score after review (the report's final state)*: rewards the review, hides what the student could do alone; rejected by Carson.
- *Keep problems handed in beside a score*: two numbers in one narrow column; the progress tag beside the name already shows how far a student has got.
- *A running score while working*: a number that climbs mid-set reads as a result before there is one.
- *Counting a finished-looking problem with all lines right but no answer as right*: the group union counts it against, and two definitions of right first time would drift.

**Tradeoffs.** Unfinished and unattempted problems score as not right, so a student who ran out of time reads low with no wrong answers (Grace 7/10 on Problem Set 5); the missing and progress marks tell those apart. The live student's score reads his session's lines and typed answer directly rather than `reviewProblemsOf`, because `progressOf` also reads rework; a test holds the two equal on the demo runs.

**Defense.** One definition of right first time across group review's union, the report's Correct first try and the score, each checked against the others in tests, so the Class View never tells a teacher a different story from the student's report.

## 2026-09-14 · "End lesson" is a fifth teacher advance with the same grace, stamped by whichever tab reaches the deadline first (ticket 273)

**Decision.** The Pathway card's last stage (when it is not class review) gets an "end lesson" pill in force submit's look, laid over the blank room above force submit so nothing on the card moves. It starts an `end-lesson` advance with the one-minute grace, as every teacher-driven advance (spec v3). When the deadline passes, each student tab applies it to its session (anyone still in the lesson lands on the report with the work as it stands) and dispatches `lesson/end` at the deadline; every teacher tab dispatches the same action (`LessonEnds` in `TeacherChrome`). `lesson/end` stamps `lessonEndedAt` and ends a group run still going; it is idempotent. While the minute runs the pill's room goes blank and "ending lesson", how many of the class are not done with the stage and the countdown with Cancel lie over force submit and its count, which keep their room.

**Context.** Ticket 263 gave `lessonEndedAt` but no product control; a set on individual → group stayed Live "in review" once groups finished. The user said yes to a real end lesson (2026-09-14). The ticket asked for force submit's look, its kind of confirmation with the count, the grace, and no movement on the card.

**Alternatives considered.**
- *End the lesson from the teacher's tab only.* Simple, but the student tabs would need a second rule ("lesson over while I am on the board → report") that fires on every later state with `lessonEndedAt` set, including presenter jumps back into the lesson. Applying an advance by id is the existing idiom and happens once.
- *Student tabs only, as force-group's `group/end`.* The set would stay Live if no student tab were open at the deadline; ending a lesson is the teacher's record, so the teacher's tab stamps it too, at the same moment (the deadline), and the action is idempotent.
- *A confirmation dialog stating the count (spec v3's wording).* Ticket 145 dropped it for force submit (no room in a 320 px card; the minute with Cancel is the undo; no confirm gates). The count is shown in the countdown instead.
- *End lesson in force submit's place on the last stage.* Nothing to stack, but it removes a control the teacher has today and the ticket asked for a pill beside the stage; kept both, logged in FUTURE_FEATURES.
- *The countdown growing upward from the pill.* On individual-only the three lines rose beside "indiv working", 4.6 layout px from it; laid over force submit and its count (hidden while ending, since force submit cannot start then) they stay level with the current stage.

**Tradeoffs.** The idle pill on a two-stage pathway sits 4.6 layout px (individual only) or 9.4 (group only) right of the stage pill above's corner, their rows overlapping 10 px; the rounded corners keep a visible gap. Force submit and its count vanish for the minute. A student tab opened more than a minute after the deadline does not move that student. Two tabs can stamp the end, so the student tab holds back its own group done while the advance is still to be applied (`endLessonAwaited`); otherwise a teacher tab a clock tick ahead ended the run and the student reached the report without the notice.

**Defense.** One more advance kind reuses the grace, the countdown banner, apply-once-by-id and the Cancel undo that every other teacher move has, so the model stays pure and tested by replay; the end is stamped at a deterministic moment whichever tab gets there, and every surface that already read `lessonOver` (Classroom Past, board, Class View, Sam's Classroom) follows with no change.

## 2026-09-14 · The class data follows the realistic group rules: a group solves what one member had right, keeps what nobody could do, and class review covers it (ticket 281)

**Decision.** `lib/reviewRule.ts` applies the rules the user settled on 2026-09-14, literally. A member brings to their group every problem not right first time (a mistake, one left incomplete, one not attempted; ticket 278). A one-off slip is still fixed on the student's own rework (ticket 244). Everything else is the group's: solved when a present member had the problem right *first time*, a pattern at the table included; otherwise unsolved, closed on the group's own freshly written last try (never anyone's first submission, sharing a slip a member made). At most once a set a declared exception solves a problem nobody had right (one member wrong on a single line, the hint naming it); only Set 6's Q9 at sky uses it. The records were re-derived to match: Liam hands in five problems on every set, one or two groups per set meet the hardest problem with nobody able to do it (violet's Q10 on Set 1; Harper's slips give mint no helper on Q10 of Sets 2–4; mint already had none on Set 5's Q9 and Q10 and Set 6's Q10), class review runs on Sets 1, 3 and 6 and records which problems it covered with one or two real wrong first submissions each (`ClassReview`, built from picks off the records), and Sam's live board loses Q4 and gains Liam's slip on Q5. The review data and the sheet's reasoning are generated from the rule with hand-written last tries, and `reviewMismatches`, `classReviewMismatches` and `hardestUnsolved` hold records, sheet and rule together.

**Context.** Ticket 244's rules left Jordan's Set 5 Q8 unsolved beside two groupmates who had it right and reused his lines as the group's try; 278 made every problem a member did not get right join the group. The user asked for groups to model problems nobody at the table can do and for class review to cover them (ticket 282 shows the column). Two settled constraints could not both hold everywhere: Liam attempting five on every set and every status on the sheet staying exactly as it is. On Sets 3 and 5 he had handed nothing in, so every category read *not seen*, and any working changes that; on Sets 1, 2, 4 and 6 the new work was chosen line by line (only lines tagged in categories the sheet already saw, a slip in a gap category) so every status stays, *not seen* included.

**Alternatives considered.**
- *"Had it right" counting a problem fixed on the member's own second submission*: fewer strange cases (a student who fixed a problem alone beside a group that could not), but the exception the user agreed for Zara's Q9 only makes sense if a member's rework does not count, and it would leave no set with a hardest problem unsolved on Set 5's natural data.
- *Liam's five as started-and-left work (right lines only, `done` unchanged)*: keeps "handed in 2/10" on screen and every status, but the finished-set contract forbids wrong lines past `done`, right-only lines lift his ratios, and "attempts" read as hand-ins in the user's words.
- *Keep Sets 3 and 5 missing for Liam*: honours "statuses unchanged" and breaks "at least five on every set"; the user named Sets 1–6.
- *Store every group try on the records*: the rule "a real slip before the try that holds, within two or three" would be checkable on finished sets, but nothing reads tries and the report shows only the rework or last try; the live board keeps its scripts.
- *Choose hardest-problem groups by converting helpers to one-off slips* (the only kind that kept most statuses): each would fix the problem on their own rework beside a group that could not, so conversions use repeated slips (a name the student already makes on the set) where statuses allow.
- *Hand-write every sheet reason*: 332 cases; generated from the rule with the one-off reasons 244 wrote kept verbatim.

**Tradeoffs.** Liam's Sets 3 and 5 now read results (algebra gap, communication secure, New skills developing or gap, functions and graphing secure on Set 5), so his history pills, holistic page and tile change there (communication becomes his one strength); the Classroom cards read 20/20 on those sets. Four existing one-off slips became repeated when a new slip shares their name (PS1 Finn Q9, PS2 Harper Q3, PS3 Harper Q1, PS4 Harper Q5 move from own rework to group review). The literal rule leaves students who fixed a problem alone beside a group that left it unsolved (listed in FUTURE_FEATURES). Two Mistakes problems now take five columns (PS3 Q10, PS4 Q4); both measured with nothing wider than its box. The sky Q7 return's last try (278's script, the signs flipped) shows no slip a member made; the presenter's own scripted writing was left as it is.

**Defense.** The rules are one pure function the sheet, the records and the live script are all held to, so the demo data cannot drift from what the user settled. Where the settled constraints collide, the data keeps the explicit ones (five attempts, unchanged statuses where the sheet saw work, the one-step rule everywhere) and every exception is named in the ticket and the future features rather than hidden in a special case.

## 2026-09-15 · The report covers class review from what the board actually showed, and an unfinished first submission is never right first time (ticket 282)

**Decision.** Both reports (the teacher's student report and Sam's own) sort a problem into one of five columns: Correct first try, Correct after individual review, Correct after group review, **Covered in class review** (new, grey), Incorrect. A problem is right first time only when its first submission is finished (an answer on it, `firstFinished` / inside `done`, the Set column's rule from ticket 285) with no wrong line. It is covered when the pathway has class review, class review showed it, and the student's group closed it unsolved; Incorrect keeps the rest. On a finished set "showed" is the set's record (`FinishedSet.classReview`, ticket 281). On the live set it is the board: `WholeClassSession.reached` records the furthest slide the teacher reached, and once class review has ended (`boardCovered`) the covered problems are those slides and their examples are the refs the board resolved. Until then the report reads the pathway without class review (`reportPathway`), so the column appears, and the covered tiles leave Incorrect, once, at the board's End. A not-attempted problem goes where its later versions put it (a group that solved it: Correct after group review) and each column names the ones it holds ("Q9, Q10 not attempted"); the "not solved in group review" note and tag are gone. The examples reach the report as lines only, so no name can. The presenter strip is drawn at the teacher side's zoom on every page and the student report keeps a 16 px bottom padding, which is what makes every report fit 1280×800 again.

**Context.** The user settled the column, its colour, its panes, the notes and the removals on 2026-09-14. Two things were left to build: what "covered" means on the live set ("the problems the teacher actually put on the board"), and when the column shows. Ticket 278 found Sam's unfinished Q9 under Correct first try (`holds` counted a first submission with nothing wrong in it). Ticket 281 found every teacher report scrolling 35–42 px at 1280×800: ticket 263's presenter strip took 56 of the report's layout px (the report draws its whole frame at 125%, strip included), and the tallest reports (Ethan's Set 4: six skill columns wrapping, six commentary ideas) had no slack for it.

**Alternatives considered.**
- *Covered = every problem set up for class review, or every projected problem*: simpler, no new state, but a teacher who ends after one slide of three would see three problems "covered". `reached` costs one optional field and matches the words.
- *Covered = the slide the board is on (`slide`)*: needs nothing new, but Back uncovers a problem the class already saw.
- *Show the column from the moment class review is projected*: the tiles would move out of Incorrect slide by slide while the teacher is at the board; ticket 244's rule is that a stage's results show once the stage is finished.
- *The live set reading its recorded class review (`SET6_CLASS_REVIEW`)*: the story sheet's picks, not what the teacher chose in the lesson; the user asked for the board.
- *Use `progressOf` for right first time*: it reads the rework too, so a problem finished only on the rework would count as finished first time; `firstFinished` is the same notion over the first submission alone.
- *Fix the scroll by narrowing the right column*: the tallest reports are tall in both columns (Ethan's commentary is as tall as his skills). *Removing the strip on the report*: the presenter needs it on every page. *Shrinking the skills or maths*: ruled out.
- *The Class review pane always on its own row*: two-version problems (Ruby's Q10) would have their maths scaled down for no reason; sharing the row while it holds four columns keeps them large, and past four a line's ⚠ chip ran out of its pane.

**Tradeoffs.** The strip is 20% smaller on the report than before (the same size as on every other teacher page). The report's What happened card sits 16 layout px above the strip rather than 48. On the live set the column is absent through class review itself; a teacher opening a report mid-review sees the pre-review columns. A class review ended without ever being projected covers nothing. The teacher's note floors are measured label widths in code (`LABEL_WIDTH`), checked by the click-through rather than measured at run time.

**Defense.** Every rule is one pure function over data the app already keeps (`outcomeOf`, `boardCovered`, `reportPathway`), shared by both reports and tested directly; the live rule follows what happened on the board, and the moment the columns change is a single, named event (End). The fit fix touches only presenter chrome and blank padding, leaving every piece of content at its size.

## 2026-09-15 · `/` is the presenter's chooser again; `/demo` redirects to `/` (ticket 286)

**Decision.** The chooser moves back from `app/demo/page.tsx` to `app/page.tsx`, rendered at `/` with no redirect; `app/demo/page.tsx` becomes a server `redirect("/")`. Reverses ticket 265.

**Context.** The user opens `localhost:3000` expecting to pick the student iPad, the teacher view, the board or the split view, and asked for it back. Ticket 265 had sent `/` to `/teacher` after an outside review found a cold visitor's first click was the Student card.

**Alternatives considered.** *Keep the chooser at both `/` and `/demo`*: two addresses for one page. *Delete `/demo`*: links and bookmarks from tickets 265–285 would 404. *Put the Teacher card first on the chooser* (to answer the outside review): not asked for, and the cards' order is the demo's story (Sam's iPad, then the teacher, then the board).

**Tradeoffs.** A cold visitor lands on the chooser again, and can still pick the Student card first; the concern ticket 265 answered returns. `/demo` costs one redirect round trip.

**Defense.** The site is a presenter's demo and `/` is where the presenter starts; one URL per page, with the old one kept working. A 307 (not 308) so `/demo` is never cached and can be reused.

## 2026-09-15 · The create strip is a pipeline per kind of set, and Send is a 600 ms light on Create, not a page (ticket 288)

**Decision.** The strip's steps live in `lib/createPipeline.ts` as data, `PIPELINES: Record<CreateKind, PipelineStep[]>` (today `pset`: Questions, Difficulty, Refine, Pathway, Send), and `Steps` renders whatever list it is given. Refine is only a new label: the step's id stays `assessment`, so the review state, the assessing run and every stored review are untouched. Send is the last label on every step; pressing Create (with a pathway chosen) marks it current for `SEND_LIGHT_MS` = 600 ms with the strip locked and Back and a second Create ignored, then sends exactly as Create did and lands on the set. At the send the page freezes the draft it sent on screen until the route changes, which also removes a one-frame "Untitled assignment · Nothing drafted yet" flash that Create has always shown between clearing the draft and the new page.

**Context.** The user (2026-09-15) wanted "Pathway – Send" on the strip "for visual clarity of the pipeline", Assessment renamed Refine (a teacher reads "assessment" as a school assessment), and "+In-Class PSet" in place of "+ New assignment". Ticket 291 will add `+Homework`, whose pipeline is Questions, Difficulty, Refine, Send with no Pathway.

**Alternatives considered.**
- *Keep the fixed list in `Steps` and add a `homework` flag later*: the least code now, but each new kind adds a branch to the strip and to the current-step logic; a table per kind makes 291 one entry.
- *Rename the internal id to `refine`*: consistent names, but touches the stored review, the strip's `data-step` attributes the click-throughs read and several comments for no user-visible gain; the ticket allowed the id to stay.
- *Send as a real step/page*: explicitly rejected by the user.
- *Send immediately and light Send on the next page*: the light would appear on a page with no strip.
- *Dispatch first, light after*: clearing the draft empties the page under the light.
- *Clear the draft on unmount instead of freezing the view*: leaves a created set with its draft still stored if navigation fails, so a second Create could send twice.

**Tradeoffs.** Create now takes 600 ms longer to leave the page; a reload inside that window sends nothing (the draft is still there to press again). PATHWAY starts 32 px further left on screen (44 layout px) because REFINE is shorter than ASSESSMENT, and on the Classroom the shorter button moves Holistic Assessment 16 px right (the button's right edge stays put); everything else on the strip and both pages keeps its geometry, checked before/after at 1280×800 and 1440×900. The frozen view uses `flushSync` inside a timer callback.

**Defense.** The pipeline is one table the next kind extends, the step logic is a pure tested function, and the send path is Create's own code run after a light, so what Create does and where it lands cannot drift.

## 2026-09-15 · A Completed set opens Sam's read-only report at its own route, from the records the teacher's report reads (ticket 287)

**Decision.** A press anywhere on a Completed card on Sam's iPad Classroom opens `/student/a/<id>/report`, a read-only copy of the report he gets at the end of in-class work. The layout is split out of `ReportScreen` as `ReportLayout` (skills, What happened, the side column's working) and used by both the live report and the new `CompletedReport`; the data is one pure function, `studentReport(id, classroom, session, now)`, which returns null unless the set is Completed for him. Problem Sets 1–5 read his handed-in record (`AssignmentBundle.sam`) with every review stage over and the set's recorded class review; Problem Set 6 reads his session once the report is sent. His reflection is the record's `clarification`, the same words the teacher's report shows under "In their words"; Problem Set 1's record, the only one without one (all ten right), gains one.

**Context.** The user (2026-09-15): students could not open completed sets at all; clicking one should bring them to the student report they get in the in-class workflow. The grilling settled whole-card press (ticket 290 puts homework cells to the right of the cards), read-only, the sent reflection as text, PS6 after sending opening the same report and not the homework folder, Missing cards unpressable, a back control.

**Alternatives considered.**
- *Render the report at `/student/a/<id>` for a Completed set*: PS6's own route is the homework folder right after Send (it plays once), so the same address would have to mean two screens by timing. A separate `/report` route keeps both and makes the deep link unambiguous.
- *Reflections as separate named story data* (the ticket's wording): Sam's records on PS2–PS5 already carry his words as `clarification`, which the teacher reads as "In their words"; a second text would show the teacher one reflection and Sam another. One field, one source; PS1 gets its missing sentence in the same place.
- *A copy of `ReportScreen` with the box and Send removed*: two copies of the working pane, the close-on-press rule and the layout would drift. *A `readOnly` flag on `ReportScreen`*: it is session-shaped (dispatch, mastery, history) and a finished set has no session.
- *Keep the tiles' one-row floor as it was*: PS1's ten right-first-time tiles beside four more columns pushed Incorrect 21 px out of the card on the iPad (the live report would do the same on a strong run with class review). The floor now holds only while the grid has room (`min(row, 100% - other floors - gaps)` in CSS), so the teacher's reports, which have room, are unchanged (swept: all 20 students on PS1–PS5 at 1280 and 1440).

**Tradeoffs.** Sam's PS1 report on the teacher side now shows his reflection under "In their words" where it said "Not sent yet". The read-only report has no "Your working →" history screen and no "Where the class is stuck →" (both session-bound). Whether a set is Completed is only known in the browser, so a stale link renders the chrome for a frame before going to the Classroom.

**Defense.** The student and the teacher see one record through one set of pure functions (`recordReviews`, `columnsOf`, `setClassReview`), tested against each other; the layout exists once; each screen has one address that survives reload.

## 2026-09-15 · A due date is stored as a calendar day with its year, shown as cards show it, and picked in a shared calendar with no gate (ticket 289)

**Decision.** Create's Questions page gets a due-date picker beside the title (`components/DuePicker.tsx`). The chosen day is stored on the draft and then on the created assignment as an ISO calendar day (`IsoDay`, "2026-09-17"), and turned into the cards' form ("Thu 17 Sep", `dayLabel`) once, where the live set's bundle is built (`activeAssignment` → `assignmentBundle`). Everything that shows or sorts a due date keeps reading the bundle's `due` string. The demo's today is a constant, `DEMO_TODAY` = Thu 10 Sep 2026, and the in-class default (`DUE_DEFAULT.pset`) is that day's lesson. Days before today are shown greyed and cannot be chosen. A set sent without a day (a presenter skip, a deep link, an assignment stored before this ticket, a malformed stored value) is due on its fixture's day. The picker is a component with `min`, `today`, `note` and `label` props so ticket 291's homework (default Mon 14 Sep, nothing on or before Mon 7 Sep, a note under the date) is a second caller, not a fork.

**Context.** The user (2026-09-15): "actually implement 'due date picker' in this iteration, don't defer to F_F". Problem Set 6's "Thu 10 Sep" was fixed data; every existing flow and skip had to stay due Thu 10 Sep.

**Alternatives considered.**
- *Store the label ("Thu 17 Sep")*: matches the fixtures, but names no year and has to be parsed back for every calendar operation; a stored day is unambiguous and the label is derived.
- *Convert every fixture's `due` to an ISO day*: one format everywhere, but touches six fixtures, the story sheet, the history pills and many tests for no visible change; left for when a second term or year exists.
- *The machine's clock as today*: the demo would drift (shown on 20 Sep, Problem Set 6's own day could not be picked).
- *A native `<input type="date">`*: free keyboard and locale support, but its popup cannot be styled in Edexia's look, reads "10/09/2026" rather than "Thu 10 Sep", and differs per browser.
- *A date-picker library*: a dependency for one small grid whose behaviour is fully covered by ~200 lines and pure tested helpers.
- *Confirming the default before Create*: rejected by the no-confirm-gates rule; the field always holds a day.
- *Monday-first vs Sunday-first weeks*: Monday first, as an Australian school week reads.

**Tradeoffs.** Two representations of a due date exist (fixtures' labels, created sets' ISO days) until the fixtures move; `dueOrder` still sorts by month and day only, fine for one term. The calendar is taller than the blank space right of the goal and overlaps the top of Q5's tile while open (it is an overlay, so nothing moves). "Today" is fixed in code.

**Defense.** The stored value is exact, the display path is the one every screen already used, the default keeps every existing flow and skip unchanged, and the shared component with `min`/`note` makes homework's picker a call site.

## 2026-09-15 · A dev-only design tuner edits tokens, never components (ticket 296)

**Decision.** Design experiments run through a panel inside the app under `next dev` (⌥C). Everything it can tune is a CSS custom property in `app/globals.css`; the panel lays one unlayered `:root:root` rule of proposed values over the page, holding Space disables that rule to show the saved design, and Save rewrites only the changed values in the file through a dev-only route. Colours are tuned in OKLCH. The status markers' corners and incomplete fill, which were Tailwind classes and inline gradients in `StatusDot`, became tokens (`--marker-*`) read by one `.marker-half` rule, and Tailwind's corner steps are declared in `@theme` so they can be written. The layout imports the tuner inside a development-only branch.

**Context.** The user (2026-09-15) tried a deeper red in Chrome DevTools: the colour picker closed on every click because the Class View re-renders, and comparing old against new took checkboxes and a hand-made rule. "Creators need an immediate connection to what they create." They also wanted to try the incomplete marker as a diagonal (the split pill reads as a pharmaceutical capsule) and less rounded corners, and asked for the most useful design controls beyond those.

**Alternatives considered.**
- *DevTools with a workflow* (select `<html>`, Shift-click to HSL, arrow keys, a `.proposed` class toggle): no install, but four steps before the first change, no families, no link between gap and wrong, and the values still had to be copied by hand.
- *A Storybook or a separate style-guide page*: tunes components out of context; the question is always how the real Class View or report reads.
- *Tuning component props (a `diagonal` flag on `StatusDot`)*: each experiment becomes code, Save becomes a code edit, and a proposal cannot be compared by switching one stylesheet off.
- *HSL sliders*: lightness in HSL shifts perceived hue and saturation; darkening the red in OKLCH keeps it the same red.
- *A save that writes the proposal as a separate override file*: two sources of truth for the design; the file would diverge from what the tokens say.
- *Rendering the tuner behind `NODE_ENV` at the JSX only*: tried first; the production bundle still carried the panel's chunk on every page. Importing inside the branch drops it (checked: no tuner code in `.next`, the route 404s, the same 14 prerendered routes as main).
- *`process.cwd()` for the file path* (Next's documented way): a worktree's dev server started from the main checkout read the main checkout's stylesheet. The route resolves `app/globals.css` beside its own source instead.

**Tradeoffs.** Only what is a token can be tuned: `rounded-full` chips, font choices and sizes, spacing and the SVG figures' literal colours are out of reach until they become tokens (listed in FUTURE_FEATURES). A shade follows its main by a fixed rule (hue shift and chroma ratio; `-deep`/`-dark` also take the lightness shift, `-soft`/`-line` keep theirs), which is a design opinion; editing a shade directly detaches it. The route writes a source file on a POST from the page, which is acceptable only because it answers under `next dev` alone and refuses non-JSON and cross-site requests. `StatusDot` now depends on a global class for half markers.

**Defense.** One file stays the single source of truth for the design, the page and the file cannot disagree after Save, and the comparison is exact because it is the same page with one stylesheet on or off. Nothing reaches production, and at the defaults the markers render pixel-identical to before.

## 2026-09-15 · Student profiles describe behaviour and cite the work, never a trait; a test bans the words (ticket 298)

**Decision.** Every summary, pattern wording, review reason and tile tag in the class story sheet describes what the student's work shows, and the patterns column cites the set and problem. Trait words and states of mind are banned: careless, confident / low in confidence (the student's self-report in the chat box), slow, rushes, guesses, hopes, unsure, "out of reach". Sam's summary names the one sign pattern behind his seven patterns across five topics. `data/story.test.ts` fails on a trait word. Students' own reflections keep their words.

**Context.** An outside review, endorsed by the user: Sam's seven patterns are one transferable error (a minus belongs to the term that follows it), which no human marker and no topic-binned mastery model would see, yet his profile called him "careless". That gets the fix wrong and blames the child for something the platform's own evidence shows is systematic. The user: ban trait words, describe the behaviour, cite the line; "put one of those sentences in front of a parent".

**Alternatives considered.**
- *Soften the words* ("tends to rush"): still a judgement about the child, and still unsupported by the ink.
- *Keep the confidence self-report in the summary, labelled as self-reported* ("rates herself low"): it is data from a chat box, not from the work, and in a profile it reads as a trait. It stays where it already lives, in the report's confidence line.
- *Detect cross-topic signatures in code and show them as a first-class pattern*: that is the real product feature; for now the summary names Sam's by hand (FUTURE_FEATURES).
- *A review-time checklist instead of a test*: the first pass missed Lucas's "unsure"; the test caught it.

**Tradeoffs.** Wordings are a little longer ("not expanded back to check" instead of "guessed"). The regex is a blunt list: a new trait word it doesn't cover still gets through, and a legitimate use of a banned word (a maths "jump" in a function) would need rewording or a narrower pattern. The per-set Mistakes tab's short labels ("guessed pair, not expanded back") and hint copy were outside this ticket and still say "guessed".

**Defense.** The platform's claim is that it reads the work. A profile that describes the work and points at the line can be shown to a teacher, a student or a parent, and it points at the fix. A trait label can't be checked, and it points at the child.

## 2026-09-15 · Homework is a weekly assignment kind covering the sets due since the last one, and missing it is final (ticket 290)

**Decision.** Homework is its own kind of assignment (`HomeworkDef`, `kind: "homework"`, in `data/homeworks.ts`), not a row in the in-class set registry (`lib/assignments.ts`). A homework has a due date and covers the in-class sets due **on or after the previous homework's due date and before its own** (`homeworkForDue` in `lib/homeworks.ts`): Homework 1 due Tue 1 Sep covers Problem Sets 1–2, Homework 2 due Mon 7 Sep covers 3–4, Homework 3 due Mon 14 Sep (ticket 291) covers 5–6. Its contents are the teacher's 10 plus each student's own problems ever wrong on its sets (ticket 256's `everWrong`). A student's status is `completed` when it was finished by the due date, `missed` once the due date passes with it unfinished, and missed is final: a later finish never turns it green (`homeworkStatus`). A missed homework's own undone problems join the next homework, deduplicated by skill (ticket 294); its contents freeze when it opens (ticket 292). Homeworks never overlap (ASSUMPTIONS.md). Sam's history is named simulation data (`SAM_HOMEWORK_STORY`: HW1 finished Mon 31 Aug, HW2 nothing), read on the demo's day (`DEMO_TODAY`, Thu 10 Sep, ticket 289). On Sam's iPad Classroom the Completed cards gain a homework column: one cell per homework spanning its Completed sets' rows (a CSS grid row span, so the cell's top and bottom are the first and last card's), an empty space beside a set no homework covers yet.

**Context.** The user (2026-09-15) asked for an "HW{N} completed" or caution cell beside each set, then: homework once a week, the cell to the right of the set, spanning the relevant sets ("HW1 right of PS1 & PS2; height spans both"). The model (weekly, date coverage, own mistakes plus the teacher's 10, missed is final, carry-over with dedupe, freeze at opening, no overlap) was agreed in the same session and split into tickets 290–294.

**Alternatives considered.**
- *The date rule read inclusively ("up to its own due date")*: Problem Set 3 is due Tue 1 Sep, the same day as Homework 1, and Problem Set 5 the same day as Homework 2, so an inclusive window puts PS3 in HW1 and PS5 in HW2, contradicting the agreed grouping (PS1–2, PS3–4, PS5–6). The half-open window matches it and makes sense in class: a set due on a homework's due day is worked in that day's lesson, after the homework's problems were fixed, so its mistakes go to the next homework.
- *Homework as a third `AssignmentKind` in the set registry*: every teacher screen reading `assignmentIds` (Class View, Mistakes, Groups, reports, history, the stream) assumes a set with problems, classmates, a pathway and a lesson; a homework has none of those in this demo (HW1 and HW2 carry only a name, a due date and Sam's status). A separate registry keeps those screens untouched; ticket 291 lists homework cards on the teacher's Classroom from it.
- *Coverage stored per homework (a list of set ids)*: simpler to read, but it can disagree with the due dates and has to be edited whenever a set is created; ticket 292's freeze wants the rule plus a snapshot at opening, not a hand-kept list.
- *Status from a count of problems done*: the demo has no homework problems for HW1 and HW2; one `finishedOn` date per student per homework is all the column needs, and "finished after the due date" expresses missed-is-final directly.
- *Cells measured in JS and absolutely positioned beside the cards*: a grid row span aligns exactly by construction, with no resize observers, and the cards' widths come from the same grid in every section.

**Tradeoffs.** Date strings without a year (`dueOrder`) are the whole calendar, so the model only works inside one term (already assumed). A homework whose covered sets are all Missing has no cell. The demo's day is a constant, not the clock. The Classroom's content column widens from 860 to 1066 px, so the heading, the section labels and To do / Missing move 103 px left; the cards keep 780 px and their vertical positions.

**Defense.** One pure rule decides coverage and status for every later ticket (291's Homework 3, 292's opening, 293's list, 294's carry-over), tested on the story's real dates; demo data stays separate from the rule; the layout aligns by construction and the triangle is literally the Class View's component.

## 2026-09-15 · A declined practice offer stays armed; the count resets only when practice is taken (ticket 297)

**Decision.** The escalation counter no longer resets a topic's mistake count when practice is offered. It resets when practice is taken: the student presses Yes on the offer, or asks for help (which goes straight to practice). After "Not now" every further mistake on that topic offers practice again. "Same mistake" stays the taxonomy group (topic). Entries, and the caution flag at the second, still count offers, declined or not.

**Context.** A simulated student reviewing individual working said nothing stopped a sign error being carried through the set and asked for a tripwire. Reproduced in the browser: the offer did fire on Sam's second factorising slip (Q2), but a student who declined it would pass the next factorising slip in silence and need a fourth. The user chose: same topic, and after Not now the offer returns on the very next same-topic mistake. Supersedes the "2nd = trigger + reset" reading in the 2026-09-08 caution entry for declined offers.

**Alternatives considered.**
- *Count by kind of error (a sign error in factorising, then a sign lost solving a linear factor)*: what the simulated student described; it needs an error-kind tag on every wrong line in every set's evaluation table and a second sign slip in Sam's script. The user kept topic (FUTURE_FEATURES).
- *Keep the reset on offer, re-arm on decline (`declinePractice` setting the count back to one)*: the same behaviour, but it rebuilds the slipped leaves the offer threw away and puts the rule in two places; resetting on the event that actually ends the episode (practice taken) keeps one rule.
- *A declined offer does not count as an entry*: then declining and slipping again would never caution the teacher, and a student could decline indefinitely unseen. The existing behaviour already counted declined offers (help after Not now cautions); kept.
- *Offer at most once more after a decline, then stay quiet*: less nagging, but it reopens the unguarded silence the review complained about.

**Tradeoffs.** A student who declines and keeps slipping on the same topic is asked after every slip, and the teacher's caution goes up on the second offer, sooner than before for a decliner. The practice the re-offer points to can move to a more fundamental leaf than the first offer named (all slips since practice was last taken count). Sam's scripted demo has no third factorising slip, so the re-offer is proven in the reducer, not on screen. The offer's sentence now counts ("third mistake"), read from the escalation state, so the counter's reset timing is visible to the student.

**Defense.** The policy the user stated ("on second same mistake, gets offered subskill practice") now holds at every point of a run, including after a decline, with one reset rule on one event, tested at the reducer and in the browser.

## 2026-09-15 · Mistakes are named by misconception from one taxonomy with permanent ids, and counted by id (ticket 299)

**Decision.** A mistake's name and cluster is its misconception, one entry of `data/misconceptions.ts` (37 entries, each with a name of five words or fewer and an `about` sentence precise enough to sort a new line in or out). Every wrong line of every evaluation table carries its id; the per-problem `name` is gone. The Mistakes tab's pills, the class review picker, the repeated-slip rule, the class story checks and the Classroom's top gap all read the id and show its name. Ids are permanent: a name can be reworded, but an id is never renamed, reused or split (a split retires the old id). `lib/misconceptionCounts.ts` turns a set's Mistakes rows into sightings (cohort, student, set, problem, id) and counts them by id. A name says what is wrong, never what the student is supposed to have done.

**Context.** An outside review, adopted by the user: the Mistakes tab labelled clusters by skill ("null factor law") while class review labelled them by misconception ("guessed pair, not expanded back"). The review's point was that misconceptions are the right grain, and a stable taxonomy is what lets a question like "how common is null factor law without zero" be answered across classes (Eedi's advantage). The old names were per problem: 105 strings for what is about 37 misconceptions ("wrong pair, adds to seven", "pair adds to nine" and "pair multiplies, doesn't add" were one thing), so nothing could be counted. The user chose the taxonomy name on the pill, one name everywhere including class review and "repeated", the Classroom top gap, chips and diagnostics (tickets 301, 302), and evaluation lines only for now.

**Alternatives considered.**
- *Keep per-problem names on the pill and link them to an id behind the scenes*: more concrete ("pair adds to nine"), but the label would differ from what is counted, and the same misconception would read differently on two cards. The wrong line above the names already gives the instance.
- *Both on the pill (taxonomy name, per-problem line under it)*: doubles the pill's height on every cluster for information the wrong-line label already shows.
- *Skill leaves as the cluster, names as a sub-label (the old shape, DECISION_LOG 2026-09-12)*: the review's complaint; a skill says where, not what went wrong, and two misconceptions under one skill looked like one (Q7's "fractions" pill held both the unscaled constant and the factor never restored).
- *A hand-authored id per wrong line with no shared list* (rejected on 2026-09-12 as "a field nobody reads"): now something reads it, the count, and the list is what makes ids comparable across sets and classes.
- *Tag story patterns and tile tags with ids in the same ticket*: hundreds of free-text wordings; the user scoped it to the evaluation tables (FUTURE_FEATURES).
- *Keep "repeated" on the exact name*: two lines under one misconception on two problems would be a one-off, which is exactly the pattern the taxonomy exists to see.

**Tradeoffs.** Grouping judgement is now concentrated in one file: a misconception drawn too wide lumps distinct errors ("applied to some terms only" covers √2 on the first term, a scale on two of three terms and a conjugate on the bottom only), and one drawn too narrow splits a count. Some pills read more abstractly than the old names. More slips are repeated: 14 past review cases moved from the student's own rework to the group, and the sheet and records changed with them. Top gaps are less varied (PS3, PS4 and PS5 all read "brackets don't expand back"), and PS1's is a three-way tie at three students broken by problem order. Pills are longer than skill names, so a pill group's columns widen and some cards scroll sideways sooner. The counts are one class's today; nothing is aggregated across schools.

**Defense.** A mistake gets one name, the same wherever a teacher meets it, and that name is the thing counted. Permanent ids are the precondition for any cross-class statistic; the version field and the no-rename rule keep those counts honest as wording improves. The data change is real behaviour, not noise: under the agreed rules a student making the same misconception on two problems brings it to the group.

## 2026-09-15 · A red line's chip names its misconception and opens nothing (ticket 301)

**Decision.** The ⚠ chip on a red line shows the line's misconception, on every red line, as plain text: the teacher's report, Sam's own report, the Class tab's drills and the holistic page's skill work all draw `MisconceptionChip`. Compare shows it on the handed-in side's red lines and nothing on lines that hold. The class review picker shows no skill chip. The chip's old link to a skill is deleted end to end.

**Context.** Ticket 299 made misconception the name of a mistake. The user chose to switch these chips too, with the blame chip no longer linking to a skill. Before, the chip appeared only when a red line's skill differed from the skill open ("Identified as monic factorising. Open that skill.") and jumped there.

**Alternatives considered.**
- *Keep the link and change only the label*: the chip would name a misconception and open a skill, so pressing it lands somewhere its words don't describe.
- *Show the chip only when the skill differs, as before*: that condition was about where the skill lives, which the label no longer mentions. The misconception is worth reading on every red line, including in the skill's own drill.
- *Chips on every Compare line (label + skill)*: a line that holds has no misconception, and the skill chip was the thing being retired.
- *A chip on the rework side's still-wrong lines in Compare*: that side is never marked red by design, and a chip there alone would contradict it.

**Tradeoffs.** A teacher can no longer jump from a red line to the skill it was tagged to; they reach that skill through the tree. Every red line now carries a chip, so drills and reports are a little busier, and a narrow column puts the chip on its own row under the line. Sam sees misconception names on his own report, which are teacher vocabulary.

**Defense.** One name for a mistake everywhere, and a control that does nothing unexpected. The removed callbacks existed only for the link, so the components are simpler for it.

## 2026-09-15 · Homework is created through the same flow as a set, by kind, and a sent homework is classroom state beside the fixtures' (ticket 291)

**Decision.** The create flow is parameterised by a kind (`CreateKind`: `pset`, `homework`). Each kind has its own two routes (`CREATE_ROUTES`: `/teacher/assignments/create…`, `/teacher/homework/create…`), its own pipeline (`PIPELINES.homework` has no Pathway), its own draft and review in the classroom (`homeworkDraft`, `homeworkReview`, with `kind` on `draft/set` and `review/set`) and its own scripted assessment (`SCRIPTED_RECOMMENDATIONS`). The same components render both. A sent homework is a `SentHomework` in `classroom.homeworks` (the ten as Refine left them, an ISO due day, `sentAt`, and `openedAt` for ticket 292), sent by its own action (`homework/send`), which changes nothing else; `classHomeworks(c)` reads the fixtures' Homework 1 and 2 and the sent ones as one list for every homework rule. Homework 3's earliest due day is the day after Homework 2's and never before today; the picker starts a week after Homework 2. Refine's last button is Create for a kind with no pathway. On the teacher's Classroom homework cards sit in Past among the sets, newest due first, and open nothing. The editor never focuses a tile when it opens.

**Context.** The user (2026-09-15): "+ HW work very similar to how + New Assignment works -- same 'generate simulated assignment', finalize set. skip entirely the 'new skills' & 'review pathway' screen ... the HW one should end in 'send'." Ticket 288 already made the strip data per kind; ticket 289 made the picker shared with `min` and `note`; ticket 290 made homework its own list with a date rule. Tickets 292–295 open, list and carry over the homework sent here, so it has to be stored where every tab and reload sees it and read through the same model.

**Alternatives considered.**
- *A `?kind=homework` query on the existing routes*: one route pair, but the client components would need `useSearchParams` under a Suspense boundary, the strip's Questions link and Back would carry the query everywhere, and a pasted URL without it silently opens the other kind's draft. Separate routes pass `kind` from the server page.
- *One shared `draft`/`review` with a `kind` field inside*: fewer fields, but pressing +Homework in the middle of an in-class draft would replace it (or ask), and the presenter's `readyDraft` and every existing reader of `c.draft` would need to check the kind. Two slots keep the in-class flow byte-for-byte as it was.
- *Homework 3 as a fixture switched on by a flag*: simplest to read, but the title, due date and Refine's answers the teacher chose would be lost, and a Homework 4 could not exist. Storing what Create sent keeps the teacher's choices and makes the list open-ended.
- *Homework 3 on the teacher's Classroom in Live, or in its own section*: Live is the lesson under way and is pinned (a second pinned card leaves little room for Past on a 1280×800 laptop); the ticket keeps Live unchanged. A separate Homework section would split each homework from the sets it covers. In Past, newest due first, Homework 3 sits on top with "sent", and each homework reads next to its sets.
- *Focusing the ghost tile only on a fresh visit, or with `preventScroll`*: `preventScroll` leaves an off-screen tile in its editing state with the caret in it, so typing goes somewhere the teacher cannot see. Focusing nothing matches what Generate already did (ticket 188) and costs a keyboard user one Tab.
- *Keeping the goal box for homework*: the goal is shown to students before an in-class set starts; the homework screen (ticket 293) has no goal step, so the box would collect text nothing shows.

**Tradeoffs.** Every create component takes a `kind` prop and branches in a few places (goal box, picker range and note, Refine's button, where Create lands). The classroom state grows three optional fields. Homework cards in a section named Past include one not yet due. +Homework can create Homework 4 while Homework 3 is still open, which the no-overlap assumption says a teacher does not do; the date windows still never overlap. The PSet note is only reachable once ticket 292 stamps `openedAt`.

**Defense.** The in-class flow is unchanged (its click-through passes as before), homework reuses every screen and rule already built, what the teacher sent is stored once and read through one list by the teacher's and (from ticket 292) Sam's screens, and each new rule is pure and tested.

## 2026-09-15 · A homework opens by a deterministic stamp the store applies on every write, and freezes its sets (ticket 292)

**Decision.** A sent homework opens when the lesson of every set it covers is over. `openHomeworks(c)` in `lib/homeworks.ts` is a pure, idempotent function that, for each unopened sent homework whose covered sets all have their lesson over, stamps `openedAt` (the lesson's `lessonEndedAt`, never earlier than `sentAt`) and `setIds` (the sets it covers at that moment). The classroom store applies it on every write (`setClassroom`, `setLesson`, `adoptClassroom`), and every homework reader reads through it (`classHomeworks`, memoised per state object), so a state stored before the stamp still reads as open. Which homework a set belongs to is `homeworkForSet`: the homework whose frozen `setIds` hold it, else the date rule's homework, skipping any homework that opened without it. The covered sets include Problem Set 6 before its Create (it is the lesson already timetabled for the week); its lesson is over once it is sent and `lessonOver` holds.

**Context.** Ticket 292 (the user, 2026-09-15): Homework 3 sits greyed in a Future panel "after PSet6, then moved to TODO & clickable", opening when the lesson ends however it ends (the teacher's end lesson after its one-minute grace, the presenter's activity completed, class review's End), live in every tab, and its contents freeze at opening so a set created later goes to the next homework. Ticket 291 left `openedAt` on `SentHomework` for this.

**Alternatives considered.**
- *Derive "open" from state on every read, no stamp*: simplest, but a new lesson (`assignment/create` clears `lessonEndedAt`, which the presenter's "send assignment" does) would close an open homework again, and there would be nothing to freeze the sets against.
- *Stamp inside `classroomReducer`*: the reducer is where state changes, but the presenter's jumps build the classroom by spreading fields (`completeLesson` sets `lessonEndedAt` directly) and other tabs adopt states they did not reduce; each path would need its own call. The store's write is the one place every change passes. Putting it in the reducer would also have `lib/classroom.ts` import `lib/assignments.ts`, which imports it back.
- *Stamp with `Date.now()` in whichever tab notices*: two tabs (the teacher's `LessonEnds` and Sam's `StudentShell`) apply the lesson's end at its deadline independently; the lesson's own moment is identical in both, a wall clock is not.
- *Count only sets already sent*: Homework 3 sent before Problem Set 6's Create would open at once with Problem Set 5 alone, which would break the demo's order and ticket 295's "send homework" skip on a fresh demo.
- *Freeze the problems too*: the teacher's ten are fixed at Send and nothing edits them; the student's own problems come from the frozen sets' records, which do not change once those lessons are over. Freezing the set list is enough.

**Tradeoffs.** Homework rules now read the assignments registry (`lib/homeworks.ts` imports `lib/assignments.ts`), and the store runs `openHomeworks` on every write (a quick check that returns the same object when no homework is waiting). A homework opened by class review's End (which carries no time) is stamped at its `sentAt`. Once open, a homework stays open: the presenter's "send assignment" no longer returns Homework 3 to the Future (Reset demo does). Counting a set that has not been sent assumes the week's in-class set is known ahead, which holds for the demo and is recorded as a future feature for real timetables.

**Defense.** The rule lives in one pure, tested function; every change goes through one store write; and every tab computes the same stamp from the same lesson moment. Readers never need to know whether a state was stamped.

## 2026-09-15 · The named kind of factorising is the kind practised, and every practice skill has exactly one follow-up (ticket 300)

**Decision.** When the confidence ticks hold both factorising kinds and the warm-up chat's answers name exactly one in words, the warm-up practises that kind only. Non-monic said without the word ("the coefficient in front of the x²", "leading coefficient", "a isn't 1") counts. A question the student mentions never narrows it but can still add a kind, and a kind ticked on its own is never dropped. Every one of the 15 practice skills has exactly one follow-up on the same leaf, opened after its worked example as monic's already was: the same working with one thing changed, its own hint per point, and the same choice of ways in.

**Context.** An outside review said "I need help" gave a monic example to someone whose trouble was the coefficient on x², and that one item teaches nothing, asking for five minimally different items. Reproduced: ticking factorising means both kinds, the chat could only add skills, and easiest-first put monic ahead; the coefficient wording read as nothing. The user kept the scope small ("subskill review has become its own mini lesson"): the named skill must be the skill practised, and every skill should behave alike. They chose one follow-up per skill after the worked example over none anywhere and over follow-ups with no gate.

**Alternatives considered.**
- *Five-item variation runs*: the reviewer's proposal. Deferred to FUTURE_FEATURES by the user; it lengthens a detour from the set.
- *No follow-up anywhere* (remove monic's): the smallest consistent change, but it drops practice the user wanted kept.
- *Follow-ups opening straight after the first problem, worked example or not*: more practice and more pressure to finish; the user kept the worked example as the gate.
- *Narrow by a question's skills too* ("Q2 looks hard" → non-monic): a question carries several skills, so mentioning one isn't naming a kind; it adds skills, as before.
- *Store "no kind picked" separately from "both picked"*: the rule is the same either way (a student who ticked both and then said which has told us), so the stored answer stays a list of leaves.
- *Change the mid-set nudge's most-basic-slip rule too*: a detected slip isn't a named skill, and ticket 297 is reworking that nudge; recorded for Carson's call.

**Tradeoffs.** Fourteen more hand-written problems to keep correct (the bank tests, the spacing and anchor tests and the pixel sweep cover them, and the sweep now takes about twice as long). Skill words stay a regex list, so other phrasings still read as nothing. The chat still asks about the kind the warm-up has dropped. A student who reads both kinds as trouble and names only one in the chat loses the other from the warm-up.

**Defense.** "I told it my problem and it gave me a different one" breaks trust in the whole help route, and a rule that differs by skill reads as a bug. Both fixes are small, testable data and one pure function, and neither closes the door on sequences later: `followUp` is already the seam a run of items would extend.
## 2026-09-15 · The homework jumps show after +Homework, are pure steps from the demo as it stands, and "homework open" names Sam's Classroom as where his iPad lands (ticket 295)

**Decision.** Pressing +Homework stamps `homeworkStartedAt` on the shared classroom (first press only); the teacher's strip and Sam's SKIP TO add "send homework" and "homework open" while it is set. Reset demo clears it; every other change keeps it, including Sam's skips, which otherwise rebuild the classroom from nothing (`keepHomeworkStarted`). "send homework" runs +Homework's own pure Create (`homeworkSent`) on Generate's draft with every Refine recommendation accepted, replacing any homework already sent, and writes only the classroom. "homework open" sends Homework 3 when none is sent and ends Problem Set 6's lesson exactly as "activity completed" does (`completeLesson`), then writes the lesson with `land: "classroom"`, which Sam's iPad obeys from any student route.

**Context.** The user wanted the homework shortcuts only once the teacher starts creating homework. Presenter jumps from the teacher's tab that leave a set out pull Sam's iPad into Problem Set 6 (ticket 272), but homework's moments are shown on Sam's Classroom (the Future panel, the To do card, the HW3 cell, HW2's note).

**Alternatives considered.**
- *Mark on arriving at `/teacher/homework/create`*: also catches a typed URL or a reload, but it is not what the user described, and Reset demo on that page would immediately re-mark it.
- *Show the jumps once a homework is sent*: the teacher would have to walk Create first, which is what the shortcut saves.
- *Per-tab state (sessionStorage) for the mark*: Sam's iPad and the teacher's laptop are different tabs; they must agree, and Reset demo must clear it everywhere.
- *"send homework" rebuilds a moment (lesson not over) so Homework 3 always waits in the Future*: it would roll back a lesson the presenter just ended. As a step, a send after the lesson has ended opens at once, as the real send does.
- *Append a new homework each press*: a second press would send Homework 4 due Mon 21 Sep, which no demo moment needs.
- *"homework open" leaves Sam where the lesson's end leaves him (in Problem Set 6)*: the presenter would have to navigate to his Classroom to show what the jump is for.
- *Let Sam's skips carry the sent homeworks too*: a homework opened against the old lesson would stay open over a lesson that starts again; Sam's skips keep their rebuild-from-nothing meaning, only the demo-control mark survives.

**Tradeoffs.** A simulation-only field on the product's classroom state (as `lessonEndedAt` was for ticket 263). `Lesson` carries an optional landing, which only the homework jump sets. From the teacher's tab, "homework open" moves Sam's iPad from whatever screen it is on, including the live set.

**Defense.** Both jumps reuse the real flow's pure steps (`homeworkSent`, `completeLesson`, the store's `openHomeworks`), and tests hold each jump equal to walking the real flow from every demo moment, so the shortcuts cannot drift from what the teacher's own presses produce.

## 2026-09-15 · A homework's list is a pipeline of small pure steps, and Problem Set 6's own problems read the session as it stands (ticket 293)

**Decision.** Sam's homework screen reads one pure function, `homeworkList(id, classroom, session)` in `lib/homeworkList.ts`, built as separate steps: `ownSets` (the homework's frozen `setIds`, newest first) → `ownProblems` (each set's ever-wrong problems with their similar problems) → `groupBySet` (empty groups omitted), then Everyone from the sent homework's questions; every question is numbered on from 1 in the order he does them. Ever-wrong reads the same sources as his report on each set: a finished set's handed-in record, and for Problem Set 6 his session as it stands. Problem Set 5's similar problems live in their own data file (`data/homework-similar-ps5.ts`), read by the same `similarFor`. `ProblemQuestion` learns a typed question's shape (inline `$…$` maths, a null expression, an uploaded diagram) so the teacher's ten show in the same whole-question look.

**Context.** Ticket 293 (the user, 2026-09-15): the homework is "the list of problem mistakes from the PSet that get added to the HW bank -- custom to each student", done before "the teacher's 10", "grouping by the set it came from". Ticket 294 next carries a missed homework's own problems in and removes duplicate skills among them; ticket 292 froze the sets at opening but not the problems.

**Alternatives considered.**
- *One function that builds the groups directly*: shorter now, but 294 would have to reopen it to add carried sets and a dedupe that must run across groups before grouping.
- *Snapshot Sam's Problem Set 6 ever-wrong problems into the homework at opening*: the stamp is computed by `openHomeworks` on the classroom in every tab, and the classroom does not hold the student session, so the teacher's tab could not stamp the same list. After the lesson ends no stage writes first submissions or rework, so reading the session later gives the same list.
- *Number each section from 1 (own 1–8, Everyone 1–10)*: matches the teacher's Q1–Q10, but two "3"s on one screen make "problem 3" ambiguous; a single run follows the ticket's order (his own first, then the ten).
- *Show original problems beside their similar ones*: the ticket says never the original.
- *Put Problem Set 5's similar problems in `data/story.ts` or the set's fixture*: the story is being edited in parallel and describes what happened, not what homework gives; the fixture is teacher-side data for the set.

**Tradeoffs.** A reset of Sam's session while Homework 3 is open (a SKIP TO into the lesson) changes his Problem Set 6 group, since nothing is snapshotted. The teacher's ten are numbered 9–18 for Sam in the demo while the teacher sees Q1–Q10. A problem with no similar problem is left out of the list silently; a test keeps every one of Sam's covered.

**Defense.** Each step is small and tested on its own, 294 inserts rather than rewrites, the screen stays a thin reader, and Problem Set 6's list is provably the folder animation's (tested on the weak run, the strong run and activity completed).

## 2026-09-15 · Error signatures are families over the misconception taxonomy, checked against the ink, on two sets or more (ticket 303)

**Decision.** Each pattern in the story sheet names one misconception (`data/misconceptions.ts`, ticket 299). A test checks it against that student's wrong lines on the pattern's problems: the id is on one of them, and every problem shows a misconception of the same family. `data/signatures.ts` groups all 37 misconceptions into 14 families, each named for what is wrong ("Minus signs wrong", "Factor pairs wrong", …). Communication patterns form `steps`, because right working with steps left out has no wrong line. A family on two or more of the sets the page surfaces is a signature. The holistic page shows signatures as a line of chips under the summary, and the tiles show them as the first tag group. Pattern wordings, tags, review reasons and summaries say what is wrong, never why.

**Context.** An outside review (endorsed by the user): Sam's patterns sit in different chapters and weeks and read as separate slips, but they are one error, and a topic-binned model can't see it. The user asked for this for every student, with no speculation about process ("not 'guessed' or 'rushed', just a pure diagnostic"). They approved the family names and a threshold of 2+ sets, chose a banner under the name, then compact chips once full rows were measured to scroll the page.

**Alternatives considered.**
- *A second, hand-made rule list per pattern*: two taxonomies would drift. The Mistakes tab and the holistic page would name the same error differently.
- *Derive each pattern's misconception from the lines alone*: 210 of 222 patterns resolve on their own, but 12 are ambiguous (a problem carrying two patterns' errors, or one line showing two misconceptions). Authoring the id and testing it against the ink gives the same honesty with no ambiguity.
- *Signatures only across categories (2+ categories)*: Aiden's partial scaling (algebra only, every set) and Grace's steps would not count, yet they are the clearest cross-topic signals in the class.
- *Full-width rows*: 2–5 rows pushed the grid's last row below a 1280×800 laptop's fold for most students (up to 213 px after PS6). Chips add one line (two for Ethan), and the lit description opens as a flyout rather than a new line.

**Tradeoffs.** Families are coarser than misconceptions: "Minus signs wrong" gathers eleven kinds of sign error, and the chip does not say which. The patterns column does, when a chip is lit. Sam's conjugate pattern stays outside his signature, because its line is a rationalising misconception in the taxonomy; the review's "all seven are one" is six-plus-one on the page. Because a tag's wordings are one family, every pattern on two or more sets reads under a signature, so a tile's category groups now hold one-set patterns only. Four authored tags that lumped different errors together were dropped or trimmed. Three families (Surds, Fraction parts, Roots) exist only so every taxonomy id is placed, and 302 or 304 adding ids must place them.

**Defense.** One error vocabulary from line to profile, each link tested: line → misconception (299), pattern → misconception (checked against the lines), misconception → family (every id placed), family → signature (pure, from what the page shows). The signal the review called the demo is computed, not asserted, and it says what is wrong without guessing why.

## 2026-09-15 · A diagnostic's distractors carry a misconception id and keep their own line (ticket 302)

**Decision.** Every distractor of every live diagnostic step carries a misconception id, so a student's pick counts against the same misconception as a wrong line (`diagnosticSightings`, kept apart from work by `source`). A distractor that mirrors a real slip carries that line's own id, which a test enforces. Its old free text stays as `detail`, the exact thing this option does. On the teacher's laptop an option reads the misconception's name with the detail beneath; the board shows neither. Seven entries join the taxonomy for distractors no student wrote.

**Context.** The user chose to switch diagnostics to the taxonomy (ticket 299). Mapping the 105 distractors put two or three wrong options under one misconception on 23 of 37 steps: Q4's a, b and c step would have read "a, b or c wrong" three times. Asked, the user chose name plus line, on the teacher's laptop only.

**Alternatives considered.**
- *Name only*: one label everywhere, but options sharing a misconception become indistinguishable, which defeats a diagnostic's purpose of telling the teacher which wrong idea the class holds.
- *Line only, id behind it*: the options stay distinct, but the diagnostic would name mistakes differently from the Mistakes tab and class review.
- *Split the taxonomy until no step has duplicates*: "signs dropped" and "b and c swapped" are different, but most duplicates are one misconception in two forms ("Δ < 0" and "Δ = 1" for one root). Splitting for the layout of one question would fragment the counts.
- *Derive a slip-tied option's id from its line at build time*: one source, but it would pull the evaluator into the data layer. An authored id plus a test catches the same disagreement.

**Tradeoffs.** Results cells on the laptop are one line taller. Details are now teacher-facing, so four were reworded and a test bans speculative words in them. The seven new entries (for example "wrong feature given") are broader than the ones real work produced. Diagnostic sightings on a step with no problem (the fallback check) carry an empty problem.

**Defense.** The count is by id, which is what the taxonomy is for, and the screen keeps what a teacher needs in the moment: which option means what. The board, which students see, still shows only the question and the options.

## 2026-09-15 · A missed homework's own leftovers carry into the next homework, deduplicated by one skill per problem against that homework's own problems, and its cell's note shows only when something carried (ticket 294)

**Decision.** When a homework opens, the homework before it, if the student missed it, adds its undone own problems (every problem ever wrong on its sets; its teacher's ten never). A leftover is dropped when its skill is already held by one of the new homework's own problems, or by a leftover from a newer set. Each problem has exactly one skill (`primarySkill`): Problem Sets 1–4 take the first leaf of the problem's line in the story sheet's outline; Problem Sets 5 and 6, which predate the outline, are tagged in `data/problem-skills.ts` by the outline's own conventions (solving by factorising is the factorising; making one side zero first is quadratic equations; completing the square is the binomial identity; a feature is graph features; a worded problem is worded problems). The new homework's own problems never knock each other out. Carried problems group under their own set's name, newest set first, with no mark of origin. The missed homework's cell reads "problems added to current HW" only if at least one problem carried; with every leftover dropped it shows just the caution triangle and its name; before the next homework opens, "problems added to next HW" when it has leftovers at all. To make the demo show a carry, Sam's Problem Set 4 gains a Q10 slip (the right split, signs in the wrong brackets, his existing pattern).

**Context.** The user (2026-09-15): "they're already penalized by the missing assignment; having them double up on problems will be double penalization", only the student's own problems carry, and on the note: "'covered in current HW' won't reassure the student; it will make them feel like they have more work to do without getting credit for it." With the first rule as written (dedupe across all own problems), every one of Sam's Homework 2 leftovers was a duplicate and Problem Set 5's Q4 dropped from ticket 293's agreed list; the user chose to compare leftovers only against the current homework (B) and to add a Problem Set 4 slip on a new skill (D).

**Alternatives considered.**
- *Dedupe across all own problems, current sets included*: drops Problem Set 5's Q4 (non-monic, like Problem Set 6's Q2) from the list the user agreed in ticket 293; the rule's purpose is the missed homework's double penalty, not trimming the current week.
- *Duplicate = any shared leaf*: every factorising and quadratic problem shares several leaves (quadratic equations, the null factor law), so nearly everything would be a duplicate of everything.
- *Duplicate = the most-tagged leaf, or a finer "problem type" name*: most-tagged gives the same answer here but shifts with how many steps a solution writes; a type name is not in the taxonomy the user named.
- *A "covered in current HW" note when all dropped*: rejected by the user (reads as more work without credit).
- *Sam's slip on Problem Set 4 Q3 (null factor law) or Q9 (minimum value)*: Q9's skill is the binomial identity, a duplicate of Problem Set 5's Q6; Q3's slip moves Sam's New skills cell from solid to developing, a two-step jump from Problem Set 3's secure. Q10's primary skill (worded problems) is new to his Homework 3, and a non-monic sign slip there keeps every Problem Set 4 cell where it was and is his existing pattern.
- *Carry across a chain of missed homeworks*: only the homework directly before carries; recorded in FUTURE_FEATURES.

**Tradeoffs.** A problem's one skill is a judgement per problem (tested to be a leaf its solution carries), and the dedupe hinges on it. Sam's list depends on his Problem Set 6 session (nothing handed in makes every PS6 problem his own and drops every leftover). The record keeps no per-problem progress, so a missed homework left partly done carries all of its own problems. The student never does the missed homework's teacher ten (FUTURE_FEATURES). Before the next homework opens the cell says "next HW" even if every leftover will later be dropped, since that is settled only at opening.

**Defense.** The dedupe does exactly what the user asked (no double penalty, own problems only, newer kept) as one small pure step between the lists ticket 293 built, tested on the demo, the strong run, the nothing-handed-in run and synthetic cases; the one-skill rule reuses the story sheet's authored outline rather than inventing a second vocabulary; and the story change is a slip Sam already makes, held to the ink by the existing sheet tests.

## 2026-09-15 · A distractor's student-facing meaning lives on the option, and shows only at the reveal (ticket 304)

**Decision.** Each distractor carries `ifChosen`, a student-facing clause that completes "If you chose A, you…". It sits beside the teacher-facing `detail` and `misconception` in `data/diagnostic.ts`. The board shows every wrong option's line once the step is revealed. Each iPad shows only the student's own ("You chose A, meaning you…", or "You chose C, correct."), at the same moment and never straight after the tap. Before the reveal the board's lines are laid out invisibly, so the cells already have their revealed height.

**Context.** An outside review, endorsed by the user: "No explanation attached to any distractor… At the moment the teacher supplies all the meaning." The user asked for all lines on the board and each student's own on the iPad, with the right answer's green fill. Asked, they chose to show the line at the reveal, "correct" for a right pick, and no mark on a wrong pick beyond the line.

**Alternatives considered.**
- *Reuse `detail`*: one text to keep. But it is the teacher's shorthand ("product right, sum wrong", five words), and it doesn't complete "you…" for a student. Two audiences, two texts.
- *A separate map of lines keyed by step and option*: it would have avoided editing the same lines as ticket 302 while that was in flight. But an author would have to change an option in two places, and a map can drift from the options it names. The test would catch drift, but co-location avoids it.
- *Show the iPad line straight after the tap*: immediate feedback, but the right answer would leak to neighbours while the class is still answering, and the board and iPads would disagree.
- *Board lines appear on the reveal with no reserved space*: simpler, but the cells would grow and the centred question would jump up at the moment the class is looking.
- *Let a board line wrap as prose*: most lines run a word or two past one row of a cell, so "not −7" or "means none" was left alone on the second row (`text-balance` halved short lines instead, and `text-pretty` did not help). Two set lines, "If you chose A," then the clause scaled to its row, give every wrong cell the same shape; no clause needed scaling below 21 px at 1280×800.
- *Wrap the iPad line*: the status row would need two lines' height from the push. Instead each line is kept to one iPad line (tested at 72 characters with the prefix), with `FitText` as a guard.

**Tradeoffs.** 105 more strings to author and keep in step with their options: a line is not checked mathematically against its option the way `detail` is, only for coverage, typesetting, length and wording. Board cells are one or two lines taller from the push, even on a step never revealed. A set made through Create still falls back to the one fixed question, which has its lines. Generated steps will need lines generated too.

**Defense.** The meaning travels with the option it explains, the student sees only what concerns them and only when everyone else does, and the board reads itself. The teacher talks through the lines, not writes them.

## 2026-09-15 · The teacher's homework is a column beside Past with a class count, reusing the student's span rule (ticket 305)

**Decision.** The teacher's Classroom drops ticket 291's homework cards from Past. Every card narrows by 230 layout px (a 214 px column and a 16 px gap) and a homework column sits to the right of Past only: each homework's cell spans its covered Past sets' rows, computed by the same `homeworkColumn` Sam's iPad reads, and a Past set no homework covers keeps an empty space. Live cards take the same grid template with the column left empty, so every card on the page is one width and the due dates and arrows line up. A cell reads "Homework N", its due date, and the class's count "done/20", where done means finished by the due date (and by today while it is still open); sent and not yet open it reads "sent · opens after Problem Set 6" behind a dashed line. No student's status shows. The other nineteen students' Homework 1 and 2 records are authored as named demo data (`CLASS_HOMEWORK_STORY`) from their story arcs.

**Context.** The user (2026-09-15), with a screenshot of the teacher's Classroom: "you didn't accomplish the 'homeworks as column' idea, representing what psets it covered." The agreed design fixed the span rule, the Past-only column, the class count without a triangle or missed count, the sent state and non-pressable cells.

**Alternatives considered.**
- *Keep the homework cards and add a "covers" line*: that was ticket 291, which the user rejected; the coverage must read spatially.
- *Column across Live too (HW3 spanning PS6 while it is Live)*: the user agreed the Past-only rule, the same as Sam's Completed-only column; a Live set's homework is not settled.
- *Narrow only the Past cards*: the Live card would be 230 px wider than the cards under it, its arrow and due date out of line.
- *A cell taller than one card when its words wrap*: a sent homework beside one set would grow that row and push every card below; the cell's type and padding are sized to one card's height and the click-through holds every card one height.
- *Counting late finishers ("17 done, 2 late")*: the user asked for it to go to FUTURE_FEATURES.
- *Deriving classmates' homework from their set hand-ins*: a rule would hide the story; named data per student keeps the demo exception separate from the counting rule (the demo-exceptions rule).

**Tradeoffs.** Cards lose 230 px of width at every size; the longest title (Problem Set 4) still fits on one line at 1280×800 with room to spare, and titles truncate with an ellipsis if a longer one comes. The count total is the records' student count, which must be kept at twenty with the class (tested against `STORY`). Homework 3's count is 0/20 until homework answering exists.

**Defense.** One span rule serves both sides, the teacher sees which sets each homework covers at a glance with the one number a class view needs, nothing moves as homework is sent or opens, and the class data stays authored and testable beside Sam's.

## 2026-09-15 · A homework cell on Sam's Classroom shows its dates, not what happens to its problems (ticket 307)

**Decision.** The missed cell reads the caution triangle, "HW2 missing" and "due Mon 7 Sep"; the completed cell reads "HW1 completed", "due Tue 1 Sep" and "submitted Mon 31 Aug". A cell shows "submitted …" whenever the record has a finishing day, so a homework handed in late stays missing and shows both dates. The "problems added to next/current HW" note (tickets 292, 294) is removed with `missedNote`; the leftovers still carry into the next homework.

**Context.** The user (2026-09-15): "take away the 'problems added to next HW' tag. just have the caution triangle & 'HW2 missing'. also add due date & submission date (or just due date if missing)"; asked, the user chose dates on both cells.

**Alternatives considered.**
- *Dates on the missed cell only*: offered; the user chose both, so the two cells read alike.
- *Keep `missedNote` for a later screen*: nothing else reads it, and an unused rule about when a note shows is a trap for the next change; the carry-over rules it read (`leftovers`, `carryOver`) stay tested on their own.

**Tradeoffs.** Sam no longer reads on the Classroom that his missed problems went into the next homework; he finds them in that homework's list under their sets.

**Defense.** The cell states facts the student can check (when it was due, when he handed it in) in the words the user gave, and the carry-over is visible where it matters, in the homework itself.

## 2026-09-15 · Help is example first: Q, then Q* worked, then Q** finished, then back to Q (tickets 310–320)

**Decision.** A student who asks for help on a set question (or takes the practice offer after a repeated slip) goes through three steps before returning to the question. Q* is a whole question like Q, fully worked. Q** is a second one, where the student writes the lines for the skill they named, each line checked. Then back on Q. The warm-up runs the same three steps on each skill: worked example, completion problem, a problem alone. Who gets a warm-up stays the student's own answer: a confident student is never offered one. A wrong line is marked, and chat opens only when the student presses it. Video comes off the help menu. Practice taken during the set leaves a marker on the teacher's report and never changes the score. The teacher's laptop gains a live "Where students are" column beside the mistakes, one row per place, reused in the review modes.

**Context.** An outside review, discussed with the user: worked examples existed behind a flat help menu, so no student was guaranteed to see a method modelled, and no example-problem pair was ever formed. The strongest-evidenced structure is faded guidance (example, completion, independent problem), and the unit of instruction is an example followed by a minimally different problem. The user also said the teacher cannot see where students are during the set ("critical infrastructure & insight that's currently missing").

**Alternatives considered.**
- *A mandatory worked example for everyone before the set*: worked examples cost students who already have the method (expertise reversal) and teach them to click through.
- *The skill map chooses the starting step (secure skips, solid starts at completion)*: evidence-driven, but it overrides what the student said. The user: asking a student if they are confident and then telling them to warm up means they "will not feel heard". Past sets inform the teacher instead; only today's work prompts the student.
- *Q* and Q** as isolated skill problems*: reusable per skill (15 items rather than 20 per set), but the jump back into the full question is left to the student, the transfer the pair exists to support. The user chose whole questions.
- *A required "explain it in your own words" chat after the example*: prompted self-explanation, but slow to type on an iPad and easy to answer with "idk". The completion step does the same job with a line that can be checked.
- *Tutor speaks up on a wrong line*: faster help, but the user chose the line marked and chat on the student's press.
- *Help unlocks only after the student has written a line*: guards against using the example as a shortcut, but the user rejected it: a student may want support before writing.
- *One row per student on the teacher's column, sorted by progress*: rows reshuffle while the teacher reads; one row per place keeps rows still and shows a crowd on one question.

**Tradeoffs.** Two whole questions to author per set question (20 for Problem Set 6; sets made through Create will need them generated). A student who asks for help spends three steps before returning, where today they could get one hint and go. Right first time on a question after practice means right after seeing a near-identical one worked, so the report marks it. The classmates' demo story grows (warm-ups, hints, help at their real slips).

**Defense.** Every help route now models before asking and closes the pair on the question itself. The student's voice decides whether they warm up and whether they ask. The teacher sees both where students are and what is going wrong without leaving the page. And the score stays the honest first-submission measure it was.

## 2026-09-15 · Where each student is: one place model, the classmates' warm-ups, help and hints inside the stream's existing times (ticket 314)

**Decision.** `lib/place.ts` names every student's place at a moment (not started, confidence check, warm-up chat, warm-up on a skill at step 1–3, a question with a hint or practice at step 1–3, handed in, absent) and when that step began. Sam's comes from his session through one function, `sessionPlace`, which tickets 312 and 313 extend; the classmates' from a timeline built from their records and `data/stream.ts`, read on the stream's own clock. The script gains warm-ups for the five who answered not confident (on the skills they named, easiest first; Amelia, who named none, on the discriminant), help for four students on a question they really slipped on (the practice skill is the one their wrong line is tagged with: Liam Q1 monic, Sofia Q2 non-monic, Harper Q3 expanding, Finn Q5 turning points), and hints for three (Noah two on Q3, Ethan one on Q4, Ruby one on Q9, each a question they slipped on). All of it falls inside the times the stream already had: the warm-up inside `warmUpMs`, help and hints inside the question's time between the answers around it. Every student opens on a short confidence check (6 s, or 40% of the time to their first move). Sam's question is the one on screen (`problemIndex`).

**Context.** The user (2026-09-15) wants to see where students are during the set ("good to see Billy's on warm up for non-monic factorising in the moment"); the screen is ticket 315. The stream only knew answers and hand-ins, and every existing test of it (hand-in times, answered problems, Mistakes, later stages) had to pass untouched. The rule from 2026-09-14 is that a student is never given a slip they did not make.

**Alternatives considered.**
- *Lengthen the warm-ups and help so their steps last minutes*: more readable minutes on ticket 315's pills, but every answer and hand-in would move and the settled stream (most finish four to six minutes in) with it. Kept the times; the steps last seconds at the demo's pace.
- *Help and hints on questions the student got right (the help worked)*: a nicer story, but no record says who struggled on a question they got right; a slip is evidence, so help sits where the ink shows trouble. The help does not change the answer, which the records already fix.
- *Amelia's warm-up on the default practice (monic)*: what the product does for an open chat answer that names nothing. Her record shows no factorising trouble; her clarification opens on the discriminant and her Q6 and Q10 lines are tagged with it, so her chat is taken to name it.
- *Oliver on monic only*: his label reads "factorising", the student's word for monic; but the confidence list's factorising row with neither kind picked means both (`pickedLeaves`), and he slipped on both Q1 (monic) and Q2 (non-monic).
- *No confidence check for students who go straight to the set*: keeps the roster pill ("Q1 in progress") and the place in step for the first seconds, but the check is a real screen every student passes, and the Starting row would only ever hold Sam. The pill and the place differ for at most six seconds at the start.
- *Sam's question as the roster pill's (the first with nothing written)*: agrees with the pill, but a student writing on Q2 would show on Q3; the place is where he is, so it reads the problem on screen.
- *Step times recorded for Sam now*: `since` is null for Sam until tickets 312 and 313 add step start times to the session; `carrySince` lets a screen hold the first time it saw a place meanwhile, rather than this ticket adding session fields those tickets will reshape.

**Tradeoffs.** At the stream's pace a warm-up step lasts 5 to 40 seconds and a help step 4 to 9, so minutes on the teacher's pills mostly read 0 in the demo. The model's first seconds say "confidence check" where the roster pill says "Q1 in progress". The step split (35/40/25 of a warm-up skill, help at 20/45/75% of a question, hints at 45/70%) is a fixed shape, not per student.

**Defense.** One pure model feeds the teacher's column, so the column never disagrees with itself across tabs or reloads, and every part of the classmates' story can be traced to their own answer or their own ink, which the tests check, while nothing any earlier screen shows has moved.

## 2026-09-15 · A blank step is checked by form, not by value (ticket 311)

**Decision.** A line written into a blank step is right when it is the same statement as the step's line, decided by form. Both lines are read with the app's one TeX grammar (`lib/texEval.ts`, split into a tokenizer and a tree reader; typed shorthand goes through `toTex` first) into a canonical form, and the line is right exactly when the two forms are equal. The form forgets the writing: spacing; `\cdot`, `\times` or side by side; the order of factors, of terms and of an equation's sides (an inequality turned with them); brackets that group nothing; `a - b` as `a + (-b)`; a minus in front of a bracket standing alone, carried in; which fraction command; a minus on a fraction's top or bottom; the cases joined by "or", "and", a comma or a colon, in any order; `x = 2, 3`; the case and punctuation of words. It keeps the step: nothing is multiplied out, collected or worked out. A wrong line is compared with the step slip by slip. A slip either rebuilds the step as that slip would have written it, or finds the one place the lines differ and reads it. The first that fits names its misconception; a wrong line no slip fits has no id. A line the grammar cannot read is unreadable. The demo pad's script takes wrong lines per step index (`padScript(steps, slips)`), and writes exactly the steps when there are none.

**Context.** Tickets 312 and 313 leave the named skill's lines blank in a near-identical problem and mark each line the student writes (the user, 2026-09-15: a wrong line is marked, and chat opens only on the student's press). A blank has one known line, so the question is narrower than general marking. The set's own lines are judged by authored tables keyed by exact TeX (`lib/evaluate.ts`), which cannot follow a line written in another order.

**Alternatives considered.**
- *Equal by value (sample both sides at several x, as `sameFunction` does).* It accepts `x^2 - 5x + 6 = 0` in the blank for `(x - 2)(x - 3) = 0` and `b^2 - 4ac = 37` for `b^2 - 4ac = 25 + 12 = 37`. The blank is there to have the student write that step, so value equality marks a skipped step right.
- *Exact TeX with whitespace removed (what `positionOf` does).* It marks `(3x - 1)(x + 2)` wrong for `(x + 2)(3x - 1)`, and `x = -2 or x = 1/3` wrong for the other order. That fails the ticket's own examples, and a student would see a correct line in red.
- *Authored accepted lines per blank, like the evaluation tables.* Exact, but every blank needs every order and spelling written out, and a missing one shows a right line as wrong. It also scales badly to sets made through Create.
- *A computer-algebra library.* It would bring its own parser beside the one the tests already use, and a notion of "simplified" that is not "the same step". It is also a dependency for what one grammar and a canonical key do.
- *A model call per line.* Slow on a pad that marks each line as it is written, not deterministic, and not testable against the tables.
- *Misconceptions from the evaluation tables.* Only lines already written by the class are there; a Q** blank is new.

**Tradeoffs.** A line that means the same thing in another form is wrong: `(2 - x)` for `-(x - 2)` inside a product, `\tfrac{6}{2}` for `3`, `0.5` for `\tfrac{1}{2}`, a sentence in other words. Eleven misconceptions are named; others show as wrong with no chip. Four older table entries label a line "brackets don't expand back" where the check names the narrower misconception whose description it fits; the test lists them, and the tables are unchanged. Refactoring `evalTex` onto the tree touches the diagnostic and homework tests' evaluator; they pass unchanged.

**Defense.** The rule is the one the ticket states: the same statement, a step still a step. It is one pure function with no knowledge of where a step came from, so ticket 310's questions, the practice bank and a created set's steps are all checked the same way. It reuses the app's normalisation and grammar rather than adding a second parser. It is held by 706 tests: every Problem Set 6 and practice step, and every line of every set's evaluation table. Its misconceptions are those the teacher-facing tables already count, so a chip on a Q** line means what it means everywhere else.

## 2026-09-15 · Tuner borders are an inward outline over a clear 1px border, per kind (ticket 321)

**Decision.** The Classroom's problem set cards and homework cells each get their own border tokens (width, style, colour) in `app/globals.css`, tuned in a Borders section of the design tuner. The line is an outline of the token width at `outline-offset: -width`, over a transparent 1px border that keeps each box's old layout. State colours (hover, To do, completed, missed) become outline colours; the teacher's sent cell keeps its own dashed border.

**Context.** The user wanted to add borders to the problem set and homework boxes from the tuner and chose separate controls per kind with width, colour and style. The boxes' 1px `line` border was shared with ~160 hairlines, and width was a literal.

**Alternatives considered.**
- *A real border of the token width, the extra width taken back out of the padding*: built first. A border's width snaps to whole screen pixels under the teacher's 0.72 zoom where padding does not, so at 4px each teacher card came out 2.3 px short and the fifth card rose 9 px: toggling Space made the list jump.
- *A real border with no compensation*: simplest CSS, but every card grows and every word moves as the slider drags, the opposite of a tuner you compare with Space.
- *Real 1px border plus an outline for the extra width*: pixel-identical at 1px, but a dashed or dotted line would be two dash patterns side by side.
- *One control for every large card*: offered; the user chose per kind.
- *Border colours following `line`*: a token file of hex values cannot say "follows"; the two colours start at `line`'s hex and part from it once tuned.

**Tradeoffs.** At the saved 1px an outline antialiases slightly differently from the border it replaced: the teacher's rounded corners differ by at most 6/255 and Sam's scaled iPad edges by at most 4/255, invisible but not byte-identical. The outline is also the focus ring's property: Sam's pressable cards show their 1px border under the focus ring instead of the tuned line, and the teacher's card turns its line accent on focus. Two token-named utilities replace plain `border` classes on these boxes.

**Defense.** No width, style or zoom can move a box or a word, which is what makes live tuning and the Space comparison trustworthy; each kind moves alone, and every state keeps its meaning.

## 2026-09-15 · The worked example-problem pair's data: whole questions as Problems, one blank-line rule by skill tags (ticket 310)

**Decision.** Q* and Q** are written as `Problem`s (Q** adds `hints` and `approaches`), one `QuestionPair` per set question in `data/pairs.ts`, and the warm-up's completion problems are `PracticeProblem`s in `COMPLETIONS`, keyed as `PRACTICES`. Which lines the student writes is one pure function, `blankSteps(steps, leaf)` in `lib/pairs.ts`: the steps tagged with the named skill, and when every step or no step carries it, the last two (the last one of a two-step working). Q** carries a hint for every point in its working, not only the lines that can be blank. Every maths fact is held by `lib/pairs.test.ts` through `lib/texEval.ts`, and no question may repeat any problem in the app, compared both as written and as a function of x.

**Context.** The user (2026-09-15) set help as Q → Q* → Q** → back to Q and the warm-up as worked example → completion → problem alone, and asked not to check the questions himself. Tickets 311 (the line check), 312 and 313 (the screens) read this data, built in parallel.

**Alternatives considered.**
- *A new question type for the pair's questions*: a narrower shape (no difficulty, no label), but every existing reader of a question (`ProblemQuestion`, `problemLeaves`, the hint helpers through `{ steps, hints }`) would need an adapter. As `Problem`s they work with what exists, and the tests hold difficulty and figure kind to Q's.
- *Blank lines stored per pair and skill*: exact control per question, but 20 questions × up to 7 skills of hand-kept lists that drift from the tags. The rule reads the tags the set already carries, so a new question needs no list.
- *The warm-up's blanks always the last two lines*: the ticket's parenthetical, and the classic faded example. Most warm-up problems carry other skills on their last lines (monic's are the expand-back check and the null factor law), so a student who named monic would never write a factorisation. The tag rule keeps "named skill = practised skill"; its cost is that fractions leaves five of seven lines blank.
- *Hints only at the blank points*: less to write, but a change to the rule would leave blanks with no hint.
- *Repeats checked by exact TeX only*: the homework tests' way, but `(x − 5)(x + 1) = 7` passed while being `x(x − 4) = 12` rearranged. Comparing as functions caught it.

**Tradeoffs.** Two whole questions per set question to author (sets made through Create will need generation). A fraction warm-up's completion step is long. Q10's and the conclusions skill's blanks are sentences, which ticket 311 judges word for word. Exported figure specs make `components/Figure.tsx` a data source for a test.

**Defense.** The screens get one obvious shape they already know how to draw and one rule for blanks written once, the questions are held by tests to Q's structure and to true maths rather than by anyone's reading, and nothing a student sees has changed until the screens use it.

## 2026-09-15 · A Classroom card's top gaps are three misconceptions, each under the skill it sits under (ticket 323)

**Decision.** A card reads "top gaps:" ("top gaps so far:" while live) and the set's three most common misconceptions, ranked by how many different students slipped with each (ties by first seen). Over each red pill sits a blue skill tag, the Class View's `CategoryChip`. The tag names the skill most of that misconception's own wrong lines are tagged with: its home category's short name ("Algebra"), or, when that skill is one of the set's New skills, the skill itself ("surds", "binomial identity"). Gaps sharing a tag sit together under one tag spanning both. The groups are ordered by their best gap, so the top gap stays first. The live card no longer counts mistakes. `partial-distribution` is renamed "not multiplied into every term".

**Context.** The user (2026-09-15) asked for the blue topic tag over each gap, never "New skills", three gaps on every card, one wide tag over gaps of the same skill, no "47 mistakes so far", and a precise name for "applied to some terms only".

**Alternatives considered.**
- *Keep ranking exact clusters (ticket 299's "A + B" pills)*: a cluster of two misconceptions can sit under two skills, so it has no one tag, and three clusters often repeat one misconception. Ranking single misconceptions gives three distinct gaps, each with one skill.
- *Tag by the misconception alone*: misconceptions are independent of skills by design (a root sign wrong happens on zeros, turning points and intercepts), so the tag has to come from the lines the set's students actually wrote.
- *Always the home category, even for a new skill*: the user asked that the tag specify the skill; the Class View's "New skills" column is a per-set bin, not a place a teacher can act on.
- *Keep the gaps in strict rank order and repeat a tag*: a shared tag could then not span its pills; grouping moves at most one lower-ranked gap left.
- *Collapse the empty tag row*: the Live card would grow 28 px under the pinned header when the first mistake arrives (ticket 234 keeps it one height).
- *Splitting `partial-distribution`*: ids are permanent and splitting needs a grain review (already in FUTURE_FEATURES); the name and `about` now say what every line under it shares, a multiplier not reaching every term (dividing and taking out a factor are named in `about`).

**Tradeoffs.** Every card is 28 px taller. A gap's tag is a majority of its lines, so a misconception spread across two skills shows only one. The top gap on PS6 once done includes Sam's live slips, so it can differ from the sheet's classmates-only row. Three long names fill the line at 1280×800 with the due date still clear; a longer name could crowd it.

**Defense.** The teacher sees what went wrong and where it sits in the course in one glance, grouped the way the Class View's columns already teach, with a count that means something in place of one that doesn't.

## 2026-09-15 · A demo placeholder on a real control: the teacher's homework cells press to a timed "HW insight scoped in FUTURE_FEATURES" (ticket 324)

**Decision.** Every homework cell on the teacher's Classroom is a real button (focus ring, Enter and Space, a polite announcement) whose only effect is a 2.5 s placeholder: the cell turns `ink-soft` with white "HW insight scoped in FUTURE_FEATURES" in its own box, then reads normally. One cell at a time; a second press restarts the timer. The homework insight view it stands in for is scoped in full in FUTURE_FEATURES. The cursor stays the teacher side's arrow. Sam's iPad cells are untouched.

**Context.** The user (2026-09-15): "just for the purpose of the demo, add functionality where clicking in HW tile leads to tile temp changing to dark grey background & white text that says 'HW insight scoped in FUTURE_FEATURES'. also read through F_F & ensure that it's actually scoped there". Ticket 305 had made the cells plain divs because no results view exists; in a demo, a presenter pressing a cell and getting nothing reads as broken.

**Alternatives considered.**
- *Leave cells inert*: honest, but the user asked for a visible answer to the press.
- *A toast or tooltip elsewhere on the page*: the message is about this cell; a toast away from the pointer is easy to miss, and a tooltip needs hover, which a projector audience does not see.
- *A permanent "coming soon" label on each cell*: clutters the count the cell exists for, and speaks to the teacher all the time rather than only when they reach for the feature.
- *A stub results page*: a route with nothing true to show would have to be deleted or rewritten when the view is designed.
- *A pointer cursor*: asked for in the brief, but the teacher side sets the arrow everywhere, unlayered (ticket 61), and the Classroom's own cards show the arrow; a hand on one cell would be the only one on the teacher's screens.

**Tradeoffs.** A product control with demo copy ("FUTURE_FEATURES" is an internal file name) ships in the real screen; it must be replaced, not forgotten, when the insight view is built. The button semantics are the view's, so only the handler and the overlay change then. Overlaying keeps the cell's size fixed but hides its count for 2.5 s.

**Defense.** The press, focus and keyboard are what the real feature needs, so the placeholder is a small, isolated handler (`lib/hwInsight.ts`) on the right control, and the message points the audience at a scoped plan instead of a dead end. Nothing on the page moves, and Sam's side, which the user said is not pressable, stays as it was.

## 2026-09-15 · Where students are beside the mistakes: one split frame, rows from the place model, the diagnostic over the left (ticket 315)

**Decision.** While the live set is on individual working, the Mistakes tab is a two-column frame (`StageSplit`): Where students are on the left, the mistake cards on the right, the stage pills on the eyebrow line. The left column is data first (`lib/whereStudents.ts`: rows of pills from ticket 314's `classPlaces`) and a generic table (`PlaceTable`, `StudentPill`), so a review stage (tickets 318–320) supplies its own rows to the same frame. Inside a row, pills stand in the order students came into it, read from each classmate's timeline (a hint or practice step keeps their spot) and, for Sam, carried from the tab's first sight. The time on a step is one formatter: seconds under a minute, whole minutes from a minute, plain muted. Empty question rows fold into a range only when the unfolded column would not fit the window, decided before paint from a measurement of the unfolded rows, and only empty rows fold. The Live diagnostic becomes a button at each card's top left; its flyout draws over the left column below the headers (`DiagnosticOverlay`) with the same steps and send as the side flyout (`DiagnosticSteps`, shared), and closes on Escape, a press outside or send rather than on the pointer leaving. Maths on the split is set upright by a scoped style on KaTeX's italic letters. The difficulty tag leaves the cards' header on the split.

**Context.** Mockup agreed with the user on 2026-09-15 (one row per place, names move between rows, headers of one size, the diagnostic top left of the card and opening over the left table, no italics). The demo's set runs in about seven minutes, so steps last seconds. The column must fit 1280×800 with all twenty in play; at the teacher chrome's 0.72 zoom that is about 990 layout px of scroll region.

**Alternatives considered.**
- *Pills in roster order inside a row*: stable identity order and one rule for every tab, but a student arriving mid-roster pushes every later pill along; arrival order moves nobody already there, and matches names landing in a mistake card.
- *Row entry held in client state for classmates too*: simpler, but a reload would reorder rows; reading it from the timeline keeps every tab and reload in agreement. Only Sam, whose session keeps no step times yet, is carried.
- *Always fold empty question rows, or fold by a row-count rule*: cheaper, but the ticket allows a fold only when the column would not otherwise fit, and a count rule cannot know how pills wrap at a window width. Measuring the unfolded rows every render cannot flip back and forth, since the decision never reads the folded layout.
- *Fold rows that hold students, each pill naming its question (the mockup's "Q7–Q10")*: saves more height, but a pill would leave its question's row; the tighter row sizing makes that unnecessary across the whole demo stream at 1280×800 (checked every 5 s).
- *The side flyout anchored on the card's button, closing when the pointer leaves*: today's behaviour, but on the split the flyout lives across the page from the button, so the pointer must cross the gap; closing on a press outside, Escape or send keeps it open while the teacher reaches it.
- *Reuse `DiagnosticPush` whole with a placement prop*: fewer components, but the chip, the anchoring footprint and the leave handling all differ; splitting out `DiagnosticSteps` keeps one copy of what the teacher chooses and sends.
- *Upright maths by changing the TeX (`\mathrm`)*: the TeX is shared with the student side and the fit rules; a scoped font rule changes only this screen and adds no spacing.
- *Keep the difficulty tag in the half-width header*: the question wrapped under it at 1280; the mockup has no tag, and the tag returns once working is over.
- *Minutes only on the pills*: what the ticket first said, but at the demo's pace nearly every pill would read 0.

**Tradeoffs.** Pills after a student who leaves a row shift left. The fold measures layout every render (thirteen rows, cheap). Sam's time on a step restarts when the teacher's tab reloads, and a step spanning a diagnostic chain reads the chain's time too. The split's maths is upright while the chain view and the later Mistakes tab keep italic maths. The table's rows are tighter than the mockup's (a 24 px avatar) so the tallest moment of the stream fits.

**Defense.** One place model feeds rows that never reorder, and the order inside a row is as reproducible as the model itself. The frame is ready for the review stages without a second layout. The teacher can choose and send a diagnostic without the mistakes being covered, and nothing the teacher reads on the right moves when a student moves on the left (checked on every move in the click-through).

## 2026-09-15 · A blank step compares its numbers by value (ticket 325)

**Decision.** Ticket 311's line check keeps the shape of the statement (same factors, same cases, same terms up to order, nothing multiplied out, collected or rearranged) and now compares each number inside it by value, exactly. A written number is read as a whole-number fraction (BigInt), so `0.5`, `0.50`, `1/2`, `\tfrac{1}{2}` and `\dfrac{2}{4}` are one number and `0.33` is not ⅓. A fraction of one lone number over another is its value (`6/2` for 3). A bracket in a product is read either way round with its minus on the product (`-(x - 2)(x + 3)` is `(2 - x)(x + 3)`). One exception: a fraction of two numbers the step itself writes not in lowest terms (`\dfrac{6}{2}` in `\dfrac{3}{2} + \dfrac{6}{2}`) is kept as a fraction in both lines, so `3` written there is wrong. `checkStep`'s signature and result shape are unchanged.

**Context.** The user (2026-09-15), asked whether right maths in another form (`0.5` for ½, `6/2` for 3) should be accepted, get a gentle third result, or stay wrong, chose to accept equal values, but not a skipped or undone step. Ticket 312's help ladder marks every line written into a Q** blank with this check.

**Alternatives considered.**
- *Whole lines equal by value (sample both sides, as `sameFunction` does).* Accepts `x^2 - 5x + 6 = 0` for `(x - 2)(x - 3) = 0` and `b^2 - 4ac = 37` for `25 + 12 = 37`: the skipped steps the user excluded.
- *A third result, "right, written differently".* The user chose acceptance; a third result needs a screen for it, and ticket 312 marks right or wrong.
- *Every fraction by value, no exception.* Then in the fractions warm-up's "Wrote the 3 over 2" blank, the line before it (`… + 3`) is marked right: the undone step. The test over every blank's neighbours catches exactly this.
- *An authored list of steps whose fractions are held.* Exact, but one more thing to author per blank and per created set; the rule "a fraction the step writes not in lowest terms is written that way on purpose" covers it with nothing to author.
- *Collapse products of numbers too (`2 \times 4` as 8).* Multiplying is a step (the stated pair `2 \times 4 = 8, 2 + 4 = 6` would read as `8 = 8`), and ticket 311's slip for a stated pair needs the two factors.
- *Floats for numbers.* `0.50000000000000000001` would equal ½ and a long `0.333…` could collide with ⅓; whole-number fractions cannot round.

**Tradeoffs.** A fraction the step writes not in lowest terms also holds wherever the same fraction appears in the written line, and an equal fraction written with other numbers there (`\dfrac{12}{4}` for `\dfrac{6}{2}`) is wrong. Shapes that are equal but written differently still read wrong: `\tfrac{x}{2}` for `\tfrac{1}{2}x`, an equation with both sides turned by −1. A number too long to hold exactly equals only itself.

**Defense.** It does what the user chose with the rule they gave (same shape, numbers by value) and keeps every one of ticket 311's "a different step" cases wrong: every existing test and every evaluation-table verdict stands, with one test changed that asserted the old strictness. Every blank a student can be asked to write is tested both ways, right in other numbers and not right as its neighbouring step.

## 2026-09-15 · A pill's time names itself: "here" in a row, "took" once handed in (ticket 327)

**Decision.** On Where students are, a pill for a student still working reads "N here", the time since they came into the row (a hint or practice step inside a question does not restart it); a handed-in pill reads "took N", from the student's check-in to their hand-in. "Nobody yet" goes. The check-in time is a new session field (`checkInAt`) recorded by the two actions that reach the check-in; a classmate's check-in is the stream's start, where their timeline opens. The span includes any time the stream stood still for a diagnostic.

**Context.** Carson, 2026-09-15, looking at the column long after the set went live: every hand-in read ~90 min (the time since the hand-in, as the step time counted on), which read as time since the set was released. He chose check-in to hand-in for a finished student, time on the current question for the rest, and asked how to make the two unmistakable; of words naming the question ("3 min on Q8"), short words ("3 min here") and a clock icon with a key, he chose short words.

**Alternatives considered.**
- *Keep the time on the step (ticket 315)*: a practice step or a hint restarted the clock, so a student stuck on a question for minutes read seconds; the row entry is what "on the current question" means, and it is already held for the pills' order.
- *"3 min on Q8"*: self-explanatory, but repeats the row's label on every pill and widens a pill by the question name; Carson preferred the shorter word.
- *A clock icon with a key under the header*: narrowest, but needs a legend (the design keeps screens legend-free).
- *Time on the whole set so far for a student still working*: comparable with "took", but not what Carson chose and hides a student stuck on one question.
- *"Took" from Q1*: excludes the warm-up; Carson chose from the check-in.
- *Sam's check-in carried from the teacher's first sight of him*: no session change, but lost on a reload of the teacher tab and wrong when the tab opens late; the session is where the rest of his times live.
- *The stream's clock (pauses taken out) for a classmate's "took"*: matches their script, but Sam's is wall time and the teacher watched the wall clock; one rule for both.

**Tradeoffs.** A new session field (hydrated as 0 for older snapshots, so an older run's hand-in shows no time). Deep-linked student stages (`sessionAt`) have no check-in, so Sam's hand-in there shows no time. The "here" figures keep a fixed slot, so a short time leaves a gap before it. Sam's "here" still restarts when the teacher's tab reloads (his session keeps no row entry yet).

**Defense.** The two times differ in kind (one ticks, one is a result), and each pill now says which it is in a word a teacher reads at a glance, without a key. Both come from times the model already has or records at the moment it happens, so every tab and reload agree on them.

## 2026-09-15 · A student's work so far opens from their pill, over the left column, read from the place model (ticket 316)

**Decision.** Pressing a pill on Where students are opens a panel in the split's overlay slot, the one the live diagnostic's steps use. It shows the student's avatar and name, their confidence answer as the Class view's column words it, every question moved past (the whole question with the report's marked `WorkLines`), and the question they are on with the roster's in-progress pill. "Moved past" comes from ticket 314's place carried on the pill (`lib/studentWork.ts`): the questions before the one the place is on, all of them once handed in, none before the questions. A classmate's lines are the stream's record at `now`; Sam's are his session's. The open student lives beside the open diagnostic in `diagnosticFlyout.ts`, one overlay at a time. The panel scrolls inside itself and closes on Escape, a press outside or a diagnostic; another pill switches it. The card's hover "expand" on the split moves beside the counts and shows on keyboard focus, not on any focus.

**Context.** The user (2026-09-15): Finn on Q4 should show Q1–Q3 marked and Q4 only "in progress", the confidence answer, the marked transcription outright rather than the report's tiles, and no skill status or history pills yet. Ticket 315 left `onPress` on the pill and an overlay slot over the left column. Ticket 312 was changing `lib/place.ts` and the student screens in parallel.

**Alternatives considered.**
- *"Moved past" from the answered count (the stream's `answered`) or Sam's lines*: simpler for classmates, but the pill's row and the panel could disagree for a moment (Sam writing on Q3 after skipping Q2, or a student on help) and Sam would need his own rule; reading the same place the row uses keeps one meaning.
- *Show every question, later ones greyed*: more context, but the user asked for nothing after the current question.
- *The student report's working panel (`Versions`, Q tiles)*: reuses more, but the user asked for the problems outright, and the report's tiles, versions and outcome columns mean nothing mid-working.
- *Panel state in `TeacherMistakes`' own state*: less code, but "opening one closes the other" would then need an effect across two stores, and a remount would drop the panel the way ticket 260 found the flyout dropped; one store holds the one overlay.
- *A panel as tall as its content, the page scrolling (as the diagnostic's flyout does)*: no measuring, but a long transcript would push the page's scroll past the mistakes column and leave the head behind. A capped panel keeps its head and scrolls its questions, and nothing behind it moves.
- *`WorkLines` at its own size*: exactly the report's classes, but the report sits at 125% of the teacher zoom, so at the split's zoom its lines read about 10 px on a laptop beside 17 px questions; the panel takes the 125% back with CSS zoom, so the lines keep the report's proportions.
- *A pointer cursor on the pill*: the ticket says "a pointer", but the teacher side sets the arrow everywhere (ticket 61) and ticket 324 kept it; the lift, border and focus ring carry the cue.
- *Leave the split card's "expand" where it was*: it trails the question, so on the half-width card it floated mid-header, and `group-focus-within` kept it up after a mouse press on Live diagnostic; moving it beside the counts and keying on `:focus-visible` fixes both without touching the Mistakes tab after working.

**Tradeoffs.** A classmate on the check-in reads "—" in the panel while the Class view already shows their record's answer. The panel reads `classmatesAt` for the whole class on every tick while it is open (twenty records, cheap). The capped height is measured against the page as it lies, so on a page scrolled down the panel's foot can sit below the window until scrolled back. The overlay store now names two kinds of thing.

**Defense.** The panel is the pill's own place made readable: it cannot disagree with the row, it updates as the student moves, and it reuses the report's lines, the roster's pill and the Class view's words, so the teacher meets nothing new. Nothing on the screen moves when it opens, updates or closes, and the diagnostic keeps its behaviour.

## 2026-09-15 · Sam's homework cells that open nothing take the teacher's placeholder; the open homework's cell keeps its link (ticket 326)

**Decision.** On Sam's iPad Classroom, every homework cell that goes nowhere (completed, missed, or sent and waiting in the Future) is a button showing ticket 324's placeholder: `ink-soft` over the whole tile, white "HW insight scoped in FUTURE_FEATURES" centred in its own box for 2.5 s, one cell at a time, a second press restarting. The open homework's cell keeps opening the homework screen with no message, and the Future panel's card stays unpressable. The same `flasher` and message as the teacher's; which cells take it is one function, `studentCellShowsInsight`.

**Context.** The user (2026-09-15), right after ticket 324: "also add to student, if they go to click on their HW tile". Sam's completed and missed cells were plain divs (tickets 290, 307); HW3's cell was inert in the Future and a link once open (ticket 292).

**Alternatives considered.**
- *Every cell, the open one included*: would replace a working link to the homework screen with a placeholder; a demo would lose the way into Homework 3 from its cell.
- *Completed and missed only, leaving the waiting HW3 cell inert*: it is the same tile, and a presenter pressing it would get nothing, which ticket 324 exists to avoid.
- *The Future panel card too*: it is a notice of what is coming, not a homework tile, and ticket 292 made it deliberately unpressable to read as off his list.
- *A lift on hover as the open cell has (paper ground, strong line)*: would repaint the completed cell's green and the missed cell's dark red line under the pointer; the shadow alone signals pressable without changing what the state colours say.
- *324's 17 px type*: "FUTURE_FEATURES" at 17 px nearly fills the 190 px cell; 15 px medium (the cell title's size) keeps both lines with room and fits HW3's one-row cell.

**Tradeoffs.** Internal demo copy now shows on a student screen too; it must go when either insight view is built. Sam's cells become focusable, adding up to three tab stops on his Classroom. For 2.5 s a cell's dates are hidden under the message.

**Defense.** The press, focus and announcement are what his real insight view needs, the rule for which cells take it is a tested pure function, the working link is untouched, and nothing on the page moves: at rest every element sits exactly where it did before the change (compared with a build of main), and during and after each press.

## 2026-09-15 · Pill times in whole minutes; three minutes in a row turns dark purple (ticket 328)

**Decision.** Every time on Where students are reads in whole minutes ("<1 min", "1 min", "2 min" …), and a student three minutes or more in their row has "N min here" in dark purple (`accent-dark`). The rule is data (`PillTime.checkIn` against one constant, `CHECK_IN_MS`), and the pill only colours it. "Took" is never coloured.

**Context.** Carson, 2026-09-15: the second counts ticking on every pill were overwhelming; organise by minutes, and at "3 min here" write the text in dark purple, a signal the student could use a check-in. This settles ticket 315's open question on colouring the time.

**Alternatives considered.**
- *Seconds under a minute (ticket 315)*: honest at the demo's pace, but nearly every pill ticked every second, which is what Carson found overwhelming.
- *Round to the nearest minute*: "1 min" at 30 s would overstate a short stay, and "3 min" would turn purple at 2:30; floor keeps "3 min" meaning three full minutes.
- *Colour in the pill, not the text (a tinted border or ground)*: louder, but the pill's ground already says warm-up or practice; Carson asked for the text.
- *The accent (#5b4ae8) or accent-deep*: nearer the Live diagnostic button's purple, which means "press me"; accent-dark is the darkest of the family and reads as a note rather than a control.
- *A limit per question or against the class*: fairer for a long question, but Carson gave one number; noted in FUTURE_FEATURES.

**Tradeoffs.** Under a minute every pill reads the same "<1 min", so the order within a row carries who arrived first. At the demo's pace (a set in about seven minutes) few students reach three minutes in one row; Jordan, stuck on Q8, does. Dark purple on the accent-tinted warm-up pill is less contrasty than on white.

**Defense.** A time that changes once a minute is readable at a glance, and one colour at one threshold turns the column from a clock into a to-do list the teacher can act on, with the threshold in one place to tune.

## 2026-09-15 · Class review markup is pinned to the maths it was drawn on (ticket 330)

**Decision.** The teacher's strokes over the class review slide are stored against the piece of the slide under them (an anchor: an example line's maths, an example letter, the problem label, expression or stem), as points in ems of that anchor's font size from its top left, and drawn on each surface at that anchor's position there. They share the pad's ink list per problem, in drawing order, so one Undo takes the last stroke wherever it was. Every student sees them, in screens frozen and write with me.

**Context.** Carson, 2026-09-15: the teacher should be able to draw anywhere, above all to mark up the A/B/C examples, with the pad kept, and the marks projected to the students. Settled the same day: the board and the laptop both take the pen, students see marks in both modes, one Undo / Clear, the pad's navy ink. The board (1440, 21 px maths), the laptop (0.72 zoom) and the iPad (1180 scaled, 16 px maths) set the same slide at different sizes, each fitting its columns (ticket 161).

**Alternatives considered.**
- *One canvas over the whole slide in screen or percentage coordinates*: simplest, but the columns, the header and the pad have different proportions on each surface, so a circle round a term on the board would land beside it on the iPad, and drift further as a window resizes.
- *Show the student a scaled picture of the board's slide while frozen*: coordinates would match exactly, but it throws away ticket 161's per-surface fit and the "your approach" tag, and write with me needs the student's own layout anyway.
- *Pin to the example column (fractions of its width and height)*: survives resizing, but a column's height is set by the screen, not the maths, so a mark on a line slides up or down between surfaces.
- *Pin to the line's box (`li`) instead of its maths*: the box's padding differs by surface (12 px vs 8 px) and does not scale with the font; the maths' own box does, exactly as the glyphs do.
- *A separate list for marks with its own Undo / Clear*: Carson chose one set; a single ordered list makes "the last stroke" unambiguous without a second order to keep in step.

**Tradeoffs.** A stroke belongs to one anchor: a long arrow from A to C is pinned where its middle is and drawn relative to that piece only, so on a surface whose gaps are proportionally wider its far end lands a little off. Letters and stems scale slightly differently from the maths across surfaces (44/30 vs 21/16), so a circle round a letter sits a few pixels off-centre on the iPad. On the board and the laptop the slide takes the pen outright, so a finger can no longer scroll an overflowing example column there (the mouse wheel still does). The ink list now holds two shapes, told apart by `Array.isArray`, so ink stored before this ticket needs no migration.

**Defense.** The marks exist to point at maths, and pinning to the maths is the one reference that means the same on all three screens. It holds through zoom, iPad scaling, the columns' font fit, resizes and marks view (verified in the browser at 1440×900 and 1280×800 on each), the geometry is a pure tested module, and the rendering is one component every surface wraps its slide in.

## 2026-09-15 · Help on a question: the step in the session, Q** derived from its lines, one table per mark (ticket 312)

**Decision.** The three steps of help on a set question live in the student session beside the overlay that was already there: `ladder: { problem, step }` (Q* worked, Q** being finished, or Q* opened again from back on the question) and, on the practice entry, `steps: { worked, completion, back }`, the time each step began. Nothing about Q**'s progress is stored: `completionState(steps, blanks, lines)` in `lib/ladder.ts` re-reads the lines the pad has read, in order, against the blank being written (right fills it, wrong counts, two wrong lines fill it in, unreadable counts for nothing), and says how much of the working is on screen: the given lines up to that blank and the blank itself, never a later line. Every check result becomes a mark in one function (`markLine`), what a mark does is one table (`MARK_RULES`), how it looks is one table (`MARK_LOOK` in the screen). Back on the question, the set question gets its own hints (`data/questionHelp.ts`, written from Q**'s) and a hint-and-chat run of its own (`questionRun`) that reads the set's lines and writes none. On a question with Q* and Q**, the repeated-slip offer is on the skill of the slip itself.

**Context.** Ticket 312 turns I need help into Q* → Q** → back on Q with a reload landing on the same step and the teacher's place model showing the step and its time (ticket 314's `sessionPlace`). Ticket 311's check has three results today; ticket 325 (landing beside this one) makes numbers written another way right, and a further result ("right, written differently", shown with the step's own form) may still come. Ticket 313 will run the same completion step in the warm-up. Set questions had no hints and the chat served practice problems only.

**Alternatives considered.**
- *A new stage for the three steps*: clean on the stage machine, but the teacher's force submit, freeze and end lesson already close the overlay, and a stage would have to reproduce every one of those paths.
- *Storing each blank's status and tries in the session*: quicker to read, but undo would have to rewind it, and two writers (the reducer and the pad) could disagree; derived from the lines, undo and reload need nothing.
- *Q**'s given lines all on screen from the start*: simpler, but Q2**'s null factor law line shows the factors the student is asked to write.
- *Marks as booleans on the line (`right: boolean`)*: fewer types, but a "right, written differently" result would then touch every place that reads the boolean.
- *Hint and chat back on Q from Q**'s own hints*: no new data, but Q**'s hints name Q**'s numbers and fragments, which are not on Q.
- *The offer on the most fundamental skill slipped on (as before)*: Sam's Q2 offer would read monic while Q2's Q* and Q** are non-monic, so the skill named would not be the skill practised.

**Tradeoffs.** `completionState` runs the line check on every render of Q** (a handful of short lines; cheap). Hints for the ten set questions are more data to keep true (held by the same tests as Q**'s and swept). The back-on-question hint and chat exist only after practice on that question, so a student who never asks sees none. Sam's demo offer changes from monic to non-monic.

**Defense.** The session holds only what the student did (the step, when, the lines); everything shown is a pure reading of it, testable without a screen and identical on a reload and in the teacher's tab. The one-place mark and rule tables are what let a later decision about other forms land without reshaping the screen.

## 2026-09-15 · The warm-up's three steps: times per skill, one set of step screens (ticket 313)

**Decision.** Each warm-up skill runs worked example → completion problem → problem alone on the same machinery as help on a set question. The session records, per skill (by its practice problem's id), when each step began (`warmup.phases`); the step a skill is on is the furthest recorded (`phaseOf`), and the steps only go forward (`warmup/next`: the example seen in full, then every blank in). The completion problem's progress is derived from its lines by ticket 312's `completionState`, marked by `markLine`. The step screens moved out of `HelpLadder.tsx` into `app/student/screens/PracticeSteps.tsx` (`WorkedStep`, `CompletionStep`, `ExamplePeek`, `StepLine`), which both routes call with their own head and footer; step 3 is `PracticePad` on the follow-up with "see the example again".

**Context.** Ticket 313 (Carson, 2026-09-15): model first, with the same three steps as ticket 312, on the skill itself; every skill all three steps; a student can move on from any step; the session records each skill's step and start for the teacher's Where students are. 312 left the warm-up on the older problem-first `PracticePad` flow.

**Alternatives considered.**
- *A current-step field beside the times*: explicit, but two fields that must agree; with forward-only steps the times already say where a skill is.
- *Reusing `overlayRun` and `ladder` for the warm-up*: one run for both, but the warm-up keeps several skills' progress at once (chips go back and forth) and runs before the set, where the overlay's closing paths (freeze, force submit) do not apply.
- *A stage per step*: the stage machine would have to carry the skill and every chip jump.
- *Copying Q*/Q**'s screens into the warm-up*: quickest, but two copies of the Working column, marks and help menu to keep in step.
- *Step 3 marked line by line like step 2*: the ticket says "done alone", and a follow-up has no blanks; it stays the unmarked read-back.

**Tradeoffs.** A snapshot saved before the ticket lands on its skill's worked example (no times). "see the example again" is screen state only, so a reload returns to the pad. `HelpLadder.tsx` is now a thin caller; a change to a step screen changes both routes at once, which is the point but needs both click-throughs.

**Defense.** The student's actions (the steps reached and when, the lines) are all that is stored; everything shown is a pure reading of them, identical on a reload and on the teacher's laptop, and one set of step screens keeps help and the warm-up behaving alike, as Carson asked of practice.

## 2026-09-15 · Review control: one decision card when due, the pathway on the header line, group review after corrections (tickets 332–338, planned)

**Decision.**
- **The decision card.** The live lesson raises the next decision on one card, mounted once so it follows the teacher across Class View, Mistakes and Edexia Classroom:
  - "Most students are close to finishing" at over half the present class past the 70% question (335), where the teacher keeps or changes the pathway (336)
  - as individual review is about to end, the suggestion to move the two least-correct questions from group review to class review (337)
- **How the card behaves.** It never blocks the screen, tucks into a dot on the pathway strip ("Later"), and doing nothing keeps the plan.
- **The pathway strip.** The pathway moves from Class View's right-column card onto the back button's line on both tabs, built from one stage pill with four states (334).
- **Group review's questions.** A group works only what a present member still has wrong after individual review. A student who fixed a question in individual review counts as a helper, and a group with nothing left sits out (332; past sets 338).
- **Retired tickets.** 254 and 255 are deleted; these tickets carry what they held.

**Context.** Carson, 2026-09-15: teachers need control over review: some questions are better saved for class review ("only 5 students got to Q10"), without deciding twice, and with the program making the suggestion. The prompt should come "no matter where they are". The pathway should show on both tabs beside the back button. The CTO's feedback (2026-09-14) that the lesson's many permutations are hard to follow led to "the program raises each decision when it is due" (the 2026-09-14 entry above). Carson on the group rule: counting questions students fixed themselves "jeopardize[s] making indiv review seem pointless." The helper rule was settled in the 318/319 design session the same day.

**Alternatives considered.**
- *A blocking modal*: impossible to miss, but it interrupts a diagnostic or the Mistakes split mid-task.
- *A change in the pill only*: quiet, but easy to miss at the moment it matters.
- *A teacher-set threshold, or signal-based triggers*: more adaptive, but something to learn before the first lesson, and no data to tune a signal (FUTURE_FEATURES).
- *Projections in the card* ("about 7 will get there"): these can mislead mid-stream; counts so far are honest.
- *Any subset per group*: finer control, but a per-group decision is many presses. Every question in exactly one of group or class review keeps it one decision.
- *Keep the pathway card and add a strip*: two pathways on one screen, and the controls in two places.
- *Right first time as the group rule (ticket 278) and as "correct" on the card*: matches set score, but sends groups questions their members already fixed.
- *Only right-first-time students can help*: a fixer might not explain it well, but they have just found the slip themselves; Carson chose fixers count.
- *The gate into group review waiting on an unanswered card*: guarantees the decision is made, but moves a decision to the system's timing; ignoring the card keeps the plan, and the demo stretches its arrivals instead.

**Tradeoffs.**
- **Decision state.** The lesson gains a decision state in classroom state that every teacher screen reads.
- **Demo data.** The group rule change regenerates all review data (live and past sets), a large data ticket, and changes the demo's outcomes.
- **The gate.** The demo's gate arrivals get slower by design.
- **One card.** A second decision replaces an unanswered first one rather than queueing it.
- **Where the pathway changes.** Only from the card, not at any time from the strip.

**Defense.** Each decision appears once, at the moment the evidence exists, with the suggestion already made. The teacher keeps every choice and loses no work by ignoring it. One strip and one pill component mean the pathway looks and behaves the same everywhere it appears. Taking group review's list after corrections is what gives individual review its purpose.

## 2026-09-15 · The board launched from the laptop: sized to the projector, a heartbeat, cues from the class state (ticket 333)

**Decision.** The teacher header's Present board pill opens `/board` with `window.open`: in Chrome and Edge, after the Window Management permission, as a popup sized to the other screen's available area (a thin title bar stays); elsewhere, or refused, as an ordinary window to drag. The board tries `requestFullscreen` on load and offers a Fullscreen button. Whether a board is open comes from a heartbeat each open `/board` posts on its own BroadcastChannel, never stored in the classroom state. The pill's pulse is derived from the classroom state: a board moment (class review projecting, group review running, a diagnostic push) that appears while the laptop's page is watching, with no board open, pulses it; module state carries the last look across client navigation, and a page's first look never pulses.

**Context.** Ticket 259, grilled with Carson as ticket 333: the board is the laptop's second display, opened once at the start of the lesson; one press is the aim. Browser research (September 2026): Window Management places a popup on another screen with one press; nothing on the open web makes that popup fullscreen without a press inside it (Chrome's fullscreen popups origin trial ended unpursued; Automatic Fullscreen is Isolated Web Apps or the `AutomaticFullscreenAllowedForUrls` enterprise policy only); `requestFullscreen({screen})` moves the calling document only. Group review has no single teacher press (it starts when individual review's grace ends and the students arrive).

**Alternatives considered.**
- *A "tap to fill the screen" layer on the board*: true fullscreen with one more tap, but it is the first thing the class sees and needs someone at the board. Carson chose the title bar.
- *The laptop page itself fullscreen on the projector (`requestFullscreen({screen})`)*: one press, true fullscreen, but it moves the teacher's page off the laptop; the board must be a separate window.
- *Board-open state in the classroom store*: every tab would read it, but a closed or crashed window would leave it true, and a reload could claim a board that is gone. A heartbeat can only be stale for 2.5 s.
- *Calling a cue from each button (Project, force review, send diagnostic)*: explicit, but group review has no button, the student tab or a skip can start a moment, and every future entry point would need remembering. Deriving from the state covers all of them.
- *Asking for the permission ahead of time*: no "Press again", but a prompt out of nowhere on the Classroom. Carson chose the press.

**Tradeoffs.** A thin title bar on the projector unless someone presses Fullscreen (or the school sets the policy). A board opened from its URL in another browser or on another computer is invisible to the laptop (same-browser channel, like all demo state). The heartbeat costs one message a second per board. "Board open" cannot say which screen. The pulse also fires for a moment reached through the demo's skips, which is the same moment on the board.

**Defense.** The press does the most any browser allows today, degrades to the drag story 60 already assumed, and never blocks an action. Presence that can only be as stale as its heartbeat, and cues that are a pure reading of the class state, keep the header right on every path into a moment without a stored flag to fall out of step.

## 2026-09-15 · A question answered after practice is marked on the teacher's report, the score unchanged (ticket 317)

**Decision.** The teacher's report reads what practice a student took from one pure module, `lib/practiceMarks.ts`: per question the skills practised on it, and the warm-up's skills. Sam's comes from his session (every accepted practice entry, Q* reached or the older isolated practice, and each warm-up skill whose steps began or that he moved past once he took the warm-up); a classmate's from ticket 314's story through `classmateTimeline`, read at the stream's clock on the live set (the whole story before the set goes live and once the class has handed in); a finished set has none. On screen: a small muted dot on the marked tile's corner (absolute, no layout change) with the words in its name and tooltip, one note on What happened's line naming the questions ("● Q2 after practice"), the warm-up named once after the confidence answer, and "after practice on <skill>" beside the result in the question's working. `lib/setScore.ts` is untouched, and a test holds that practice never changes a score. Practice taken left the notes line (`reportFacts.practices` keeps offers declined).

**Context.** Since tickets 312 and 313, help runs a worked example of a question like Q just before the student answers Q, so right first time on Q means something different. Carson (2026-09-15) chose a marker on the report and no change to the score; warm-ups as one set-level note. The What happened card has no room beside a 36 px tile, and the report must fit 1280×800 with nothing moving.

**Alternatives considered.**
- *The words beside each tile*: what the ticket literally asks, but a tile column has no width for "after practice on non-monic factorising"; widening the column moves every tile.
- *The words on the column label's second line* (as "Q10 not attempted"): the narrow Incorrect column would have to widen, moving the others.
- *All the words on What happened's line* ("Q2 after practice on non-monic factorising"): with the confidence answer and a warm-up, Sam's line wraps at 1280 and the card grows.
- *Only in the opened working*: moves nothing, but a teacher scanning the tiles would never know to open Q2.
- *Lowering or annotating the score*: Carson chose not to.
- *A student-side marker*: out of scope, in FUTURE_FEATURES.

**Tradeoffs.** The dot means nothing until read against the line's "● Q2 after practice" or hovered; the skill is only in the tooltip and the working. A classmate's marker appears when the stream reaches the practice, while their tile already shows the result from the record (as the report did before). Sam's warm-up skills are the sequence's, so an older snapshot with no recorded steps names no warm-up.

**Defense.** Every piece of the report stays where it was for every student (measured against the report before the change for all twenty at both sizes), the words are there at a glance and in full one press away, and one pure module answers "what practice came before this" for both the session and the story, tested without a screen.

## 2026-09-15 · Maths is upright everywhere, by one font rule over KaTeX's letters (ticket 339)

**Decision.** Every typeset maths letter is upright on every surface: `.katex .mathnormal, .katex .mathit { font-family: KaTeX_Main, "Times New Roman", serif; font-style: normal }` in `app/globals.css`. Ticket 315's rule was the same declaration scoped to `.upright-maths` on the Mistakes split; the scope and the class go.

**Context.** The checkpoint review (2026-09-15) found the same expression italic on one teacher tab and upright on the next. Carson chose a global rule over a teacher-only one.

**Alternatives considered.**
- *Teacher and board only*: keeps the textbook look on the student's iPad, but the board and the iPad share one examples component with the laptop, so one example would be set two ways, and the student would see a different face in class review than on the board.
- *Italic everywhere, dropping 315's rule*: the mathematical convention (and QCAA papers'), but Carson asked for upright on 315 and again here.
- *`\mathrm{}` in the TeX*: exact, but rewrites every TeX string shared with evaluation tables, hint fragments and the line check, and changes spacing around operators.

**Tradeoffs.**
- **Convention.** Students see upright letters where their textbooks and exams set italic ones.
- **Italic correction.** KaTeX keeps each italic glyph's small right margin (0.11em after f, 0.04em after y) on the upright letter; no TeX in the app sets f today.
- **Lowercase Greek.** KaTeX_Main has no lowercase Greek, so a typed `\pi` would fall to Times New Roman; no stored TeX uses one.
- **Text maths.** Stems written as text ("y = x² + 4x + 5") stay in the sans face beside upright serif maths (FUTURE_FEATURES).

**Defense.** One rule, one face, on every screen that shows the same object. The TeX, and so every evaluation key, hint fragment and measurement, is untouched; the hint-box sweep and the laptop fit check pass as before.

## 2026-09-15 · The pathway strip: one stage pill, a fourth state derived from the count, one line on both tabs (ticket 334)

**Decision.**
- **One pill.** `components/StagePill.tsx` draws every lesson stage pill: `StagePill` takes a stage id, a state and a size (`ipad` 15 px, `laptop` 13.5 px) and an optional `badge`; `PathwayPills` lays a pathway out with arrows and a `beside` slot after the current pill. Sam's header strip and the teacher's strip both render through it.
- **The fourth state is derived.** `stagePillState(stage)` in `lib/classStage.ts` reads `finished` off the current stage whose count has reached the class in the room. `ClassStage.state` keeps its three values.
- **One line component.** `app/teacher/BackLine.tsx` is the first child of both tabs: the back button and, on the live set, the strip right-aligned on the column's edge, with force submit, the count and end lesson after the current pill. `ForceSubmit` and `EndLesson` lose their card variants and keep one one-line form each.
- **Geometry.** The row is `items-start` so the back button's top stays at ticket 268's 81.6 px, and the strip stretches to the row less the button's bottom margin so it is centred on the button. Pills at `leading-normal` are the button's 32 layout px.

**Context.** Carson, 2026-09-15: the pathway visible on Class View and Mistakes, "in line with the <- back button, right justified", at the back button's font size, today's colours, force submit "bigger text than the pathway text". The 318/319 design session asked for one shared pill with a fourth state (finished but still current), and Carson confirmed Sam's strip renders through it looking as today. Ticket 335 will put a dot on the current pill.

**Alternatives considered.**
- *A stored fourth state on `ClassStage`*: every consumer of `state === "current"` (the Classroom's cards, the landing rule, `currentStageOf`) would need to learn it; a derived look keeps the lesson model at three states.
- *Showing finished on Sam's strip too*: the student side would have to compute the classmates' counts, and Carson wants his strip unchanged.
- *The strip absolutely positioned over the back button's line*: nothing in flow changes, but the strip could slide under the button on a narrow window without the layout knowing; a flex row keeps them apart.
- *Force submit and the count to the left of the whole strip*: the pills would never move when a countdown starts, but the controls would sit away from the stage they act on; "beside the current stage" wins, with the pills left of it moving for the minute as Mistakes' stage group did.
- *Keeping the card variants of `ForceSubmit` and `EndLesson`*: nothing renders them any more.
- *A shared pill for Create's pathway line*: its stops are toggles, a different object with its own look.

**Tradeoffs.** While a countdown runs the pills left of it move left. The pills are small on screen (13.5 × 0.72 ≈ 9.7 px), as the back button is. The strip exists only on Class View and Mistakes of the live set.

**Defense.** One component and one pure state function mean the pathway looks and reads the same wherever it appears, and 318/319 and 335 build on a stage id plus a state rather than new pills. Rendering the same line component first on both tabs is what makes the rects identical by construction, which the click-through then measures.

## 2026-09-15 · A stem's maths is TeX, said once, and one component sets it everywhere (ticket 342)

**Decision.** A question stem never writes maths as text and never repeats the expression shown after it. A text copy of the expression is removed; maths the stem needs of its own is inline `$…$` TeX. Every screen that shows a stem sets it through `components/StemWords.tsx`, and a test reads every `stem:` under `data/` to hold the rule.

**Context.** After ticket 339 made maths upright, stems like PS6 Q10's "…the graph of y = x² + 4x + 5." read in the sans face above the same polynomial in serif KaTeX. Carson: "remove duplicates; keep TeX", and inline TeX for maths a stem needs of its own.

**Alternatives considered.**
- *Keep the words, drop the TeX*: the stem reads as a sentence, but the expression is what the pad, hints, evaluation and teacher screens key on; it stays.
- *Inline TeX for the duplicate instead of removing it*: one face, but still said twice.
- *Leave text maths where the TeX lacks it*: no renderer changes, but two faces on one card; Carson chose inline TeX.
- *`$…$` support per screen*: each screen parsing on its own drifts; one component already existed privately in `ProblemQuestion`.
- *Also every single letter in prose ("Solve for $x$.")*: textbook style, but ~50 stems and the Create shorthand parser reads "Solve for x." as prose; not asked.
- *A worded problem keeps its words and drops its TeX*: keeps the translation for the student to do, but the TeX is what the set shows and marks against; where the TeX already holds every relation, the words name the letters instead. The garden recommendation, whose TeX leaves the length out, keeps its words.

**Tradeoffs.**
- **Wording.** "given below" and "satisfy the following" in place of numbers in words; the three rectangle and tile problems read less like prose.
- **Glue removed.** `glueRuns`/`glueStem` kept text maths on one line in the homework change; with no text maths left they go, and a stem typed with text maths on a future path would wrap like prose (the guard test covers `data/`, not typed sets).
- **Hyphens.** Sam's screens now keep "x-intercepts" whole, as teacher screens already did.
- **Diagnostic chains.** Four "Given that …" steps carry the step before's result in their expression rather than their words; the chain test reads the whole question.
- **Upright letters.** An upright `l` beside `1` (PS4 Q10's `l = 2w + 3`) is closer than the italic was.

**Defense.** One place sets a stem, one test holds every stem, and the expression the whole product keys on is said once, in the face every other piece of maths is in.

## 2026-09-15 · Where students are during individual review (ticket 318)

**Decision.**
- **The split in individual review.** The Mistakes tab keeps ticket 315's split during individual review, and the set lands there.
- **Left column.** Not started, Q1–Q10 and Done reviewing. Each student appears once, at the problem they have open, with "fixed n of m" and the time open. Each question row has a count of everyone still to fix it (wrong, unfinished or not attempted, less corrections in and right), blank at none.
- **Right column.** The mistake cards keep only the students still to fix, with "n fixed · m still to fix". A card everyone has fixed shrinks in place to a thin "everyone fixed" line.
- **Fit.** When the column would not fit, the pills drop "fixed n of m", then the time, then the name. Rows never fold.
- **"Fixed".** A correction counts as fixed once it has lines, none wrong, and an answer.
- **What the model reads.** Sam's open problem is recorded in his session (`reworkOpenedAt`, `reworkIndex`). The classmates' review is named demo pacing (`data/classmates-rework.ts`) over what their records say they fix. Each is done at their gate arrival, or at once with nothing to fix. The stage's done count reads the same model.
- **The panel.** A pressed pill opens that student's problems to fix, with the first submission and the correction stacked.

**Context.** Carson, 2026-09-15, in the 318/319 grilling (mockup https://claude.ai/artifact/UX9eWozokBpAt3PUXn945x):
- The first mockup put a pill in every row a student still had to fix. Carson: "all the avatars are overwhelming". The pills became where each student is now, plus a count column, since the teacher already sees the problem cards.
- Individual review has no set order: a student picks any problem, so "the row they are on" means the one they have open.
- Until now nothing recorded which problem Sam had open, and the classmates had no review timeline, only their gate arrivals and final second submissions.
- The Q10 stem repeated its own equation in words; Carson asked for the words to go wherever that happens.

**Alternatives considered.**
- *A pill in every row still to fix (a checklist)*: shows everything, but twenty students missing several questions fill every row. Carson rejected it on the mockup.
- *Fold empty rows as in working*: rows in review are rarely empty and the Q1–Q10 order is what the count column hangs on. Shrinking the pills keeps the order.
- *"Fixed" when the rework holds (the report's `holds`)*: agrees with the report's "correct after individual review", but on the live screen a student's first right line would count before they reached an answer. The report reads the finished stage, where the two agree.
- *Classmates done on their own script time*: truer to a class, but the gate into group review, the stage count and ticket 332's stretched arrivals all key off Sam's arrival. Anchoring done to the gate keeps one count everywhere. Only a student with nothing to fix is done from the start, as Carson asked for Priya.
- *Classmates' corrections landing only at the gate*: simplest, but the counts would sit still for minutes and then collapse. A per-problem script lets them fall as the class works.
- *First submission and correction side by side in the panel*: easier to compare, but at half width with the report's line size the maths would not fit. Stacked keeps each line whole.
- *Keep the Live diagnostic on the cards in review*: nothing to push while students correct their own work, so the chip stays on working only.

**Tradeoffs.**
- **Demo timing.** The classmates' review is invented timing and could disagree with a real class. It is named demo data, derived from the records, so ticket 332's regenerated second submissions flow through it untouched.
- **A small jump at the gate.** A classmate whose script has not finished when they reach the gate lands their remaining corrections at once.
- **The count.** The stage's done count now counts a student with nothing to fix from the start, so the pill reads 1/19 before Sam hands in his corrections.
- **Fitting.** Dropping words to fit hides "fixed n of m" at 1280×800 for most of the stage. The panel and the count column carry it.
- **Deep links.** A deep link into `?stage=feedback` keeps its fixed 3:48 pm hand-in, so the classmates there read as far along as the clock says. The skips date the hand-in now.

**Defense.** Carson's words set the screen, and the design follows them. One model feeds the rows, the counts, the cards, the panel and the stage count, so no two numbers on the page can disagree. Recording Sam's open problem in his session makes his pill truthful across tabs and reloads. Deriving the classmates from their records keeps the demo honest when the review data is regenerated.

## 2026-09-15 · Q10 asks what that means for "its graph" (ticket 318)

**Decision.** Q10's stem (and its Q\*, Q\*\*, homework twin and the draft seed) ends "…and say what that means for its graph."

**Context.** Carson asked in ticket 318 for Q10's duplicated equation to go, in exactly those words. Ticket 342 (landed while 318 was in flight) had already removed every stem's text copy of its expression, ending Q10 "…for the graph." 318 keeps 342's rule and guard (`lib/stemMaths.test.ts`) and only sets Carson's wording.

**Alternatives considered.** *Keep 342's "the graph"*: equally clear, but not what Carson wrote.

**Tradeoffs.** None beyond one word in five stems.

**Defense.** "its" ties the graph to the expression shown right after the words, which is what the duplicated equation used to do.

## 2026-09-16 · Three older wrong lines relabelled to the narrower misconception, the story sheet following (ticket 343)

**Decision.** PS3 Q5's (x + 15)(x − 1) and Q8's (x − 2)(x − 12) take `pair-sum-wrong`, and PS5 Q8's y = (2x + 1)(x − 3) takes `pair-signs-swapped`, in place of `brackets-dont-expand`. PS4 Q4's (2x − 1)(x + 3) = 0 keeps the broad id. The class story sheet's patterns on those problems name the new misconception in what-is-wrong words, except Jordan's PS3 pattern over Q8 and Q9, which stays one pattern.

**Context.** Ticket 311's line check names the narrower id for four table lines. Carson (2026-09-15) said to relabel if helpful and accepted relabelling the three clear ones. Misconception ids feed the Mistakes pills, top gaps, counts, the review rule, holistic patterns and cross-set signatures, and the story sheet is tested against every student's real lines, so the sheet has to move with the table.

**Alternatives considered.**
- *Relabel all four*: PS4 Q4's line differs from the answer in one sign, and expands with both the middle term and the constant wrong; "signs swapped in the pair" would overstate it. Carson agreed to keep it.
- *Relabel none, keep `NARROWER`*: the teacher would keep reading a broad name where a precise one is true, and cross-class counts would file the lines under the wrong id for good (ids are permanent).
- *Split Jordan's PS3 pattern in two* (Q8 product right, sum wrong; Q9 brackets don't expand back): each would become a single-problem pattern, so the review rule would read both as one-offs and send them to his own rework, rewriting PS3's review record. Both lines are one family, and the pattern's words fit both.
- *Keep the story patterns' old words and only change their ids*: "non-monic brackets wrong" over PS5 Q4 and Q8 would name two families at once, which the sheet's test rejects, and "factor brackets wrong" would hide what the new name says.

**Tradeoffs.** Jordan and Oliver gain a Minus signs wrong signature (PS2's middle-term sign with PS5's swapped pair) and Ethan's Factor pairs wrong drops from 3 sets to 2; a teacher who had read those pages sees them change. PS5's Classroom card swaps "x given where y asked" for "signs swapped in the pair". Jordan's PS3 pattern still carries the broad id for a Q8 whose line is now the narrower one.

**Defense.** The names now say exactly what is wrong on each line, as the check does, and every consumer reads one id path, so the change is carried everywhere by data alone. Statuses come from right and wrong, not names, so no history pill moves, and the review part still equals the rules on every set.
