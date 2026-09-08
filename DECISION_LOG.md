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
