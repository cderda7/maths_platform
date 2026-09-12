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

