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
