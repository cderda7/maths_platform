# Decisions log — QCE Methods mockup

Design-only mockup of a step-aware maths feedback product for QCE Year 11 Mathematical Methods,
built around one topic: finding the roots of a quadratic. Everything is simulated with static data.
This log records assumptions and judgement calls made while building, so they can be revisited
when the real build starts.

## Product and pedagogy

**Feedback pattern for maths: a worked-solution trace with per-step markers.**
Instead of edexia's essay pattern (inline highlights + labelled sidebar cards), each line of the
student's working is laid out as a vertical derivation. Each step gets a margin marker (✓ sound,
~ shaky, × slip, ? unclear), a plain-language label of what the step does ("Rearranged to standard
form"), a subskill chip, and an optional note. A step that is logically correct but built on a
wrong line above is still marked sound, with a note saying so ("Right move — this step is sound,
it's just built on the line above"). Rationale: procedural maths is judged step by step, and a
slip early on shouldn't erase credit for correct reasoning afterwards. Alternatives considered:
side-by-side student/model solution (too prescriptive, violates the divergent-thinking principle);
inline red-pen corrections (does the thinking for the student).

**Marker vocabulary: sound / shaky / slip / unclear.** Deliberately not right/wrong. "Shaky" means
the step holds but wasn't justified (e.g. dropping the negative root of k² = 36); "unclear" means
the evaluator can't tell yet and asks the student to say more. This keeps the cognitive load with
the student rather than issuing verdicts.

**Subskill status vocabulary on the teacher side: secure / developing / gap / not seen yet.**
"Not seen yet" is distinct from "gap" so teachers don't read absence of evidence as a deficit.

**Differentiated pacing is framed as "a natural next step", never as remediation.** When Jordan
slips on non-monic factorising in Q2, the next-step card says "A quick one before Q3 — Q3 leans on
the same factorising move as Q2. Here's a short warm-up that has the expand-back check built in —
it'll make Q3 quicker." The student can decline ("Go straight to Q3 instead"). The path strip only
shows what has been visited plus a dashed "next" so the adaptive route isn't given away in advance.
For a cruising student (Priya) the same mechanism offers a stretch ("Skip ahead to Q6?"), also
declinable. A small "Why this was offered (design note)" line is shown under the card in the mockup
only, to make the logic legible to reviewers; it would not ship.

**Two sample students on one screen.** The "Working through" screen has a Priya/Jordan toggle
with independent state per student so the contrast in pacing is visible without leaving the page.

**Help picker order: example, hint, video.** Example is marked "suggested". Each is designed to keep
the thinking with the student: the example is a parallel problem with different numbers, the hint is
a set of three "ways in" phrased as questions with no single prescribed route, and the video explains
the idea rather than the item ("Pause it and try yours"). Help use is recorded as "noted, not
penalised" and reported to the teacher as a fact, not a flag.

**Confidence check-in: four levels, before and after.** "not sure / a bit unsure / fairly sure /
certain" before a problem, plus optional reason chips; "easier / about / harder than I expected"
after. Calibration is fed back as a sentence next to the evaluation ("You said 'certain'. One step
didn't hold — the check that would have caught it is quick"). No numeric calibration score anywhere.
Assumption: the check-in lives inside the working flow and also has a standalone screen for review.

**No gamification.** No points, streaks, badges, leaderboards, percentages or grades on any
screen. The only counts are completion ("4 of 10 done") and class pattern counts ("5 of 12 guessed
a factor pair without expanding back"), which describe work rather than reward it.

**Transparency panel shows the teacher report verbatim.** The student page is the same text the
teacher sees, plus a "Not reported" list (no score, no time-on-task except abandons, chat messages
not sent — only highlights) and a note field that travels with the report. Assumption: showing the
report verbatim is more trustworthy than a summary of it.

**Teacher hint suggestions come in two kinds.** "Might need a hint" (evidence of a shared
misconception) and "reads as complicated" (time, abandons, low pre-confidence, tutor questions about
the wording). Both cite their evidence so the teacher can disagree.

**Difficulty tags follow the QCE degree-of-difficulty categories** (simple familiar, simple
unfamiliar, complex familiar, complex unfamiliar). Each problem in the assignment builder explains
why it got its tag, and the tag is editable in principle.

**Curriculum framing.** Assumed Unit 1, Topic 2 (Functions and graphs) of QCE Mathematical Methods
for the roots-of-a-quadratic topic. Class name "11 Methods B", teacher "Ms Okafor", assignment
"Roots of a quadratic — Set 3". Five prerequisite subskills: rearranging & standard form, working
with fractions, factorising quadratics, binomial expansion, reading the graph.

**Sample content is plausible, not vetted.** Seven core problems and three warm-ups with worked
solutions, two scripted student flows, one scripted tutor conversation (Jordan on Q4, exact roots
of 3x² − 5x − 1 = 0), and a twelve-student roster. The maths has been checked by hand but the
pedagogy has not been reviewed by a teacher.

## Technical

**Stack: Next.js 16 App Router, React 19, Tailwind 4, KaTeX.** KaTeX was added (the only
non-scaffold dependency) because rendered maths matters for fidelity; plain-text equations would
undermine the whole evaluation UI. Rendered via `katex.renderToString` in a small `M` component,
so it works in server and client components alike.

**Typography and palette.** Playfair Display (display serif) over Inter (body), loaded through
`next/font/google`. Palette tokens in `app/globals.css` under Tailwind's `@theme`: deep navy ink,
indigo accent, warm off-white ground, and four semantic marker colours (sound green, shaky amber,
slip red, unclear blue) with soft/line variants. Matches the edexia product page in feel without
copying its component patterns.

**All data is static TypeScript under `/data`.** Types in `data/types.ts`; problems, subskills,
students, scripted flows, chat script and teacher-side aggregates in sibling files. No fetching,
no persistence — page state resets on reload by design.

**Deep links for review.** `/student/work?who=jordan&stage=1&phase=evaluated` and
`/student/tutor?turn=5&help=example` preload mid-flow state. These exist so reviewers (and
screenshots) can land on a specific moment without clicking through; they read query params in the
server page and pass initial state to the client component, avoiding setState-in-effect.

**Lint rule `react/no-unescaped-entities` is off.** The mockup is prose-heavy and literal
apostrophes in JSX text are intentional; escaping them everywhere hurts readability for no benefit.

**Git.** Per the project CLAUDE.md, commits are made locally after each screen is verified. Commit
messages carry no co-author trailer, per the user's global instruction.

**Verified by:** `npm run build`, `npm run lint`, `tsc --noEmit`, and headless-Chrome screenshots of
every route (including the deep-linked mid-flow states) at 1440px.

## 2026-09-08 · A student who hasn't started: live attempt with a simulated step evaluator

**Decision.** Add a third sample student, Sam Okonkwo (0 of 10 done, every subskill "not seen
yet"), whose "Working through" screen starts blank. Working is typed one line per move, typeset
live, and checked by a small simulated evaluator in `lib/evaluate.ts`. The next step is planned
from that evaluation with the same rules Jordan's scripted path follows (slip on a subskill that
has a warm-up → offer it as preparation; three clean core problems → offer the stretch; declinable
either way).

**Context.** Reviewers landing on Jordan's evaluated Q2 saw fixed working and could not tell what
the moment *before* feedback feels like: the blank page, the confidence check, the first "check my
working". The user asked for a student who hasn't submitted yet.

**Alternatives considered.**
- *A scripted "blank" student whose lines appear on a button press.* Cheapest, but it is still
  fixed working and doesn't let a reviewer try a wrong line and see what happens.
- *A real evaluator (call a model).* Out of scope for a design-only mockup and would make the
  screen non-deterministic for review.
- *Free-text answer box with right/wrong on the final answer.* Contradicts the whole step-trace
  pattern.

**How the simulated evaluator works.** Each typed line is normalised (spacing, `x^2` vs `x²`,
`1/2` vs `\tfrac{1}{2}`, `+-` vs `\pm`, order of "or" alternatives) and compared with the
problem's known solution steps and a new `missteps` list per problem. A solution match is
*sound*; a misstep match is *slip* or *shaky* with the note written for it; lines that follow a
slip and are listed as its consequences are *sound* with the "built on the line above" note; a
correct line whose justifying step was skipped is *shaky*; anything else is *unclear* and the note
asks the student what they did. Summary, exercised subskills and next step are derived from the
markers. Every solution step now carries the same `label` and `subskill` the scripted traces use,
so a live trace reads identically to a scripted one.

**Tradeoffs.** The evaluator only recognises lines it has been told about; an unusual but valid
route is marked "unclear" rather than sound. That is acceptable here because "unclear" is the
honest state for an evaluator that can't follow a line, and it is the behaviour the real product
should have too. Typed-only input; the photo path is described in copy, not built. Class-pattern
counts stay "of 12" because they describe students who attempted the item; Sam is a 13th roster
row who hasn't.

**Defence.** The reviewer can now type a plausible attempt (or prefill one from the design-note
links), pick a confidence, check it, revise it and continue through the set, and every screen of
that loop uses the same components and vocabulary as the scripted students. The evaluator is a
pure function with unit tests (`lib/evaluate.test.ts`, vitest), so the real build can replace it
with a model call behind the same `Evaluation` type.

**Verified by:** vitest (11 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and
headless-Chrome screenshots of `/student/work?who=sam` blank, typing, evaluated (slip, unclear),
plus Jordan's original deep link as a regression check and `/teacher` for Sam's roster row.
