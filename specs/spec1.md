# Student & Teacher Closed-Loop Mockup — Simulated-Recognition Spec (v2)
QCE Math Methods Platform — Scoped Demo Build

## Problem Statement

The original demo spec (`qce-math-ipad-demo-spec.md`) treated real MyScript OCR as the centerpiece and cut most of the teacher-facing surface down to "one lightweight screen" to make room for it. That's backwards for what this demo actually needs to prove:

- The project brief is design-only — simulated grading and sample data are explicitly acceptable, OCR does not need to work.
- Against the products this mockup is meant to be compared to (Leibniz, Frizzle, Mathspace), working handwriting recognition isn't a differentiator — Frizzle already sells "reads every step of handwritten math, ~97% accuracy" as a headline claim. What none of the three offer is a *live, closed loop* connecting real-time in-assignment escalation, non-punitive student-facing framing, and teacher visibility, on both sides, at once. Frizzle has no student side; Leibniz and Mathspace have no teacher side.
- That loop is almost entirely a UI/UX and interaction-design problem, not an OCR-integration problem.

This spec re-scopes the demo around that loop: simulate the recognition, and spend the reclaimed time on the screens and interactions that actually carry the differentiation.

## Solution

Keep the original demo's shape — a single, real, scripted student loop, iPad dimensions in a desktop browser, mock groupmates instead of real multi-device sync, evaluation scripted against a specific demo problem — but with two changes:

1. **Recognition is simulated, not real.** Pre-author the "recognized" LaTeX/text for each line of the demo problem and reveal it progressively as the student draws (timed to stroke completion), rather than integrating the MyScript iink SDK. Visually indistinguishable to a demo audience; removes the one piece of the plan with real integration risk and no unattended-agent-buildable path.
2. **Restore most of the comprehensive spec's UI surface**, since none of it actually depends on OCR being real — it depends on fixture data and interaction design, both of which are cheap. The feature list below is pulled from `qce-math-drawpad-ocr-spec.md` and tiered by priority given the build window (see Implementation Decisions).

Laptop input (photo upload, typed text) and real multi-device sync remain out of scope — those are genuinely separate builds, not just OCR-adjacent, and cutting them is a clean call regardless of the OCR decision.

## User Stories

### Tier 1 — Core loop (must-have; this is what proves the differentiation)

**Input & simulated evaluation**
- As a student, I want to write my solution by hand on a drawpad, so the core interaction feels like the real product.
- As a student, I want my handwriting transcribed line by line as I write, so the platform's live reaction is visible — even though the transcription is scripted rather than truly recognized.

**Pre-assignment & confidence**
- As a student, I want to see the assignment's skill/subskill list and an offer to practice before starting, so the pre-assignment step is represented.
- As a student, I want to rate my confidence as "confident," "low confidence when [subskill] involved," or "low confidence," so the confidence-survey step is part of the flow.

**Escalation & help**
- As a student, I want a first subskill mistake to pass without interruption, and a second instance of the same mistake to trigger an isolated-practice prompt, so the escalation logic is demonstrated end to end.
- As a student, I want an "I need help" button available during the assignment, running the identical flow a system-detected trigger would, so self-identification is represented.
- As a teacher, I want a live (batched) view of the demo student's subskill status while they work, so the payoff for teachers is visible in real time.
- As a teacher, I want a red caution flag to appear if the demo student is about to enter subskill practice a second time, so this signal is demonstrated.

**Feedback layers**
- As a student, I want every incorrect step highlighted red, so the direct-feedback layer is visible.
- As a student, I want a curated set of correct steps highlighted blue — not just "correct," but genuinely novel ones for a strong run, or the harder correct steps for a weaker run — so the feedback philosophy (not just right/wrong) is demonstrated.
- As a student, I want "detective work" framing during review — a pattern-level clue, not an exact location — so this differentiator is demonstrated.
- As a student, I want to star a problem I got right but wasn't sure about, so this feature is represented.

**Review stages**
- As a student, I want to independently rework my submission before any group step, seeing only a pattern-level clue and no highlights, so the first review stage is demonstrated.
- As a student, I want to be walked through a simulated group review with pre-set (mock) groupmate data, so the group-phase mechanic (all-correct quick pass, then union-of-wrongs discussion) is demonstrated.
- As a student in the simulated group, I want to see no correctness markers during the union-of-wrongs discussion — only a shared count (e.g. "you've each gotten 2 of these wrong") — so that design choice is faithfully represented even in a single-user demo.

**Final report**
- As a student, I want a final report with the same skill/subskill color-coding my teacher sees, plus the option to write a 2–3 sentence reflection, so the final-report symmetry is demonstrated.
- As a teacher, I want the demo student's skill/subskill summary and reflection shown side by side, so the teacher payoff is visible.
- As a teacher, I want a "mistake view" organized first by problem then by student, with click-to-expand-inline transcription, so this signature teacher interaction is demonstrated (even with a single demo student, the interaction pattern is what's being sold).

### Tier 2 — Stretch (build only once Tier 1 is solid end-to-end)

- As a mastery-level student, I want a screen showing which skills peers struggled with and a couple of commonly-missed problems (aggregated, no raw peer work), so the mini-lesson support feature is represented.
- As a student, I want my default view of a reviewed assignment to show only my final work, with a dropdown to open earlier preserved versions in a scroll-synced side panel, so submission history is demonstrated.
- As a teacher, I want a "during review groups" view showing each student's one-line status plus a single shared note for why the group formed, so this teacher view is represented.
- As a teacher, I want to open a student's original and final submission side by side, so the before/after of the review process is visible.
- As a teacher, I want to push a live multiple-choice diagnostic that interrupts the (mocked) student screen, with a recorded/unrecorded toggle, so this differentiator is demonstrated. This one is lowest-priority: it's a real interaction pattern but adds a teacher-initiated push mechanic on top of an already-scripted single-student flow, and doesn't reinforce the core escalation loop the way everything else in this list does.

## Implementation Decisions

- **Simulated recognition**: a fixed mapping from stroke-completion events to pre-authored per-line "recognized" output for the demo problem(s). No SDK, no account setup, no recognition-accuracy risk. This is the direct substitution for the MyScript integration in the original demo spec.
- **Device scope**: iPad-drawpad path only, rendered at iPad dimensions in a desktop browser, mouse/trackpad input — unchanged from the original demo spec. Laptop photo/text input is a conscious cut, not an oversight: it's a genuinely separate input-and-evaluation path, and none of it is required to demonstrate the closed-loop differentiation this spec is built around.
- **Tiering is the primary scope-control lever.** Build Tier 1 fully end-to-end before starting any Tier 2 item — a complete core loop is worth more to the demo than a partial core loop plus a couple of stretch screens.
- **All data — fixtures, mock groupmates, confidence-survey options, scripted recognition output — is hardcoded, consistent with the design-only brief.** No backend, no persistence.
- **Everything else** (escalation counter/reset logic, highlighting rules, detective-work framing, group intersection/union computation, star behavior) follows the corresponding Implementation Decisions in `qce-math-drawpad-ocr-spec.md` — this spec changes the recognition layer and the feature list, not the underlying logic already agreed there.

## Testing Decisions

Manual click-through of the scripted demo path remains the primary QA method. Two pieces of pure logic are cheap to test and the least forgiving to get subtly wrong under time pressure, so both are worth automated tests if time allows:

- **Subskill-instance counter**: 1st = no-op, 2nd = trigger + reset, repeat-2nd-after-reset = caution flag. No UI or SDK dependency.
- **Group-phase computation**: given fixture wrong-problem sets per mock groupmate, verify the intersection (quick-pass set) and union (discussion set) are computed correctly and that no correctness data leaks into the discussion-phase view. Also no UI or SDK dependency, and it's exactly the kind of off-by-one-prone set logic that's easy to get subtly wrong.

## Out of Scope

- Real OCR / MyScript SDK integration (this is the change from the original demo spec).
- Laptop input modalities (photo upload, text upload).
- Real multi-device/multi-student synchronization for group review — simulated via mock groupmate data.
- General-purpose symbolic math evaluation — scripted per demo problem only.
- Backend persistence, percent/numeric grading, Supabase.
- Native iPad app or PWA packaging.
- Diagnostic MCQ push (Tier 2, and lowest priority within Tier 2 — see above).

## Further Notes

This supersedes `qce-math-ipad-demo-spec.md` as the working plan for the current build, without modifying `qce-math-drawpad-ocr-spec.md`, which stays the source of truth for the feature's full eventual scope (real OCR, laptop modality, real backend, etc. all still belong there for later).

The scoping principle here is different from the original demo spec's principle. That one asked "what's real vs. simulated." This one asks "what actually needs a real screen and a real interaction to be believable, regardless of whether the data behind it is real" — which is why the teacher-facing surface grew and the OCR shrank.
