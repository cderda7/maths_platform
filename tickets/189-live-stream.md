# 189: Problem Set 2's class works through the set live, one problem at a time

**What to build:** From the moment the teacher presses Create, the 19 classmates work through Problem Set 2 on a schedule, and every teacher screen updates as each problem submission lands. Each event is one student submitting one problem: that problem's correct/skipped counts tick on Mistakes and the student's name drops into its mistake cluster (with a faint highlight that fades, nothing reflowing under the cursor); on Class View the student's row tag reads "Q<n> in progress" and their dots appear once they submit; the Classroom card's "x/20 submitted · n mistakes so far" ticks. The first submission lands within ~10 s; most students finish in 4–6 minutes, each at their own pace.

The script:
- Five low-confidence students warm up first ("warming up" tag): Jordan, Tomas, Amelia, Mia, Oliver. Jordan's confidence becomes "low: non-monic factorising"; Ethan, Lucas and Sofia become "confident" (so exactly five read low).
- After the warm-up, Amelia, Mia and Oliver work at an average pace; Jordan and Tomas are slow throughout.
- Jordan answers Q1–Q7, then stays "Q8 in progress" indefinitely (never Q9/Q10, never submits). His Q4–Q7 answers get written at full depth.
- Chloe never starts (missing).
- The other classmates submit with their existing answered counts (Liam 2/10, Grace 4/10 … half-dots as today).
- Sam is not simulated: he is the real student tab, as today (Sam in the student tab can start any time, even before Create).
- End state: 17/20 submitted, still individual working, so the assignment lands on Mistakes until the teacher force-submits.

A reload continues from the stored start time. Reset demo clears it. A presenter skip past creation fast-forwards the stream to its end state.

**Blocked by:** 186, 188 (and 187 for merge order).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "also i'd like to see student data coming in dynamically -- so teacher sits in this view, but it updates -- more student mistakes come in"; round 1 Q7 "yep -- & just to clarify, mistakes populate per problem submission, not per assignment"; round 2 Q3 "yep but Chloe doesn't submit -- still missing. Jordan stalls out at Q8 & doesn't get to Q9 or Q10"; Q5 "also have 5 students who answered low confidence (overall or particular skills) do the warm up -- so they'll have a warm up in progress tag to start, & have 3/5 students move through set at avg pace after warm up & have 2/5 be slow throughout -- Jordan will be one of those students"; round 3 Q1 (the five, the confidence changes), Q2 (end state), Q5 "change warm up in progress to 'warming up'".

Facts: teacher screens re-render off `useNow` (1 s tick) and the classroom store (localStorage + BroadcastChannel); Sam's session arrives in 3 s batches (`useBatchedSession(3000)`); arrivals are already scripted off Sam in `lib/readiness.ts` (`ARRIVAL_OFFSETS_MS`); `lib/classStage.ts` `stageDone` counts classmates by static `done`.

## Solution

- A pure `lib/stream.ts`: `scheduleFor(classmate)` → timed events (warm-up end, each problem submitted, final submit); `visibleAt(assignment, now)` → each classmate's state at `now` (problems answered, submitted?, current problem, warming up?). Deterministic, unit-tested (every event order, Jordan's stall, Chloe's absence, the five warm-ups, end state 17/20 at t = ∞).
- `lib/mistakes.ts`, `classStage`, Class rows and the Classroom card take the stream's view at `now` instead of static `done`/`wrong`.
- The arrival highlight: a CSS fade keyed on the event time; list growth appended at the end of a cluster.

## Acceptance

- [ ] Tests for the schedule and end state
- [ ] Click-through (real minutes, or clock override): at ~10 s the first submission shows on Mistakes; the five read "warming up" at the start; Jordan stuck at "Q8 in progress" at the end; Chloe missing; 17/20 on Class and on the Classroom card; reload mid-stream continues; reset clears
- [ ] Nothing moves under a hovered name when an event lands (geometry before/after)
- [ ] vitest, eslint, tsc, next build, check:laptop
