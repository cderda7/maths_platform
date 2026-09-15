# 314: Where each student is, moment to moment

**What to build:** a pure model of where every student is in the lesson right now (which place, which step, how long on it) for Sam from his session and for his classmates from the live stream, plus the demo story that moves the classmates through warm-ups and help the way their records say they would.

**Blocked by:** none (can start immediately).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The teacher's laptop cannot say where students are during the set. The roster pill reads only "warming up" or "Q4 in progress" (`lib/progress.ts`). The user (2026-09-15): seeing where students are is "critical infrastructure & insight that's currently missing … good to see Billy's on warm up for non-monic factorising in the moment, less helpful after". The screen comes in ticket 315 (mockup: https://claude.ai/artifact/VqKBobvLqcd1ftSauepHkH). This ticket builds what it reads.

The classmates' stream (`lib/stream.ts`, `data/stream.ts`) only knows when each problem was answered. It has no warm-up steps, no hints and no help.

## Acceptance

- [ ] A pure model (for example `lib/place.ts`) gives each of the 20 students, at `now`: the place (not started, confidence check, warm-up chat, warm-up, Q1–Q10, handed in, absent), the detail (the warm-up skill; hint 1 or 2 on a question; practice on a skill), the step of three for warm-up and practice (worked example, finishing the steps, on their own / back on Q), and when that step began
- [ ] Places in lesson order, the order ticket 315's rows use: Starting (not started, confidence check), Warm-up (chat and skills), Q1 … Q10, Handed in; absent students (Chloe on Problem Set 6, `data/absences.ts`) are named but in no row
- [ ] Sam's place comes from his session as it is today (confidence, warm-up chat, warm-up, working, the overlay practice). Tickets 312 and 313 extend it with their steps; leave one clearly named function they change
- [ ] The classmates' schedules (`data/stream.ts`) gain warm-ups and help, consistent with their own data. Students who answered not confident on Problem Set 6 (`data/classmates.ts`: Jordan, non-monic factorising; Mia, fractions and non-monic; Oliver, factorising; Tomas, fractions; Amelia, no skill named) take a warm-up on those skills, three steps each. Some students ask for help on a question where they really made the slip (check `data/evaluation.ts` and `data/story.ts` for who slipped where before choosing; never give a student a slip they did not make). A few ask for a hint. Everyone else works straight through
- [ ] Everything a pure function of the records, the start time and `now`, as the stream is today: a reload continues, every tab agrees, the diagnostic pause still stops the clock, a presenter skip lands on the end state
- [ ] Hand-in times and answered problems stay as they are: every existing test of the stream, the Mistakes tab and the later stages still passes unchanged
- [ ] vitest (the model at several moments, including each place and step), eslint, tsc, next build
- [ ] Ticket docs: `architecture/314.md`, ARCHITECTURE, DECISION_LOG (the story's choices), FUTURE_FEATURES

## Notes

- Keep the model free of React.
