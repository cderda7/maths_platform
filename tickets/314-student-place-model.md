# 314: Where each student is, moment to moment

**What to build:** a pure model of where every student is in the lesson right now (which place, which step, how long on it) for Sam from his session and for his classmates from the live stream, plus the demo story that moves the classmates through warm-ups and help the way their records say they would.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The teacher's laptop cannot say where students are during the set. The roster pill reads only "warming up" or "Q4 in progress" (`lib/progress.ts`). The user (2026-09-15): seeing where students are is "critical infrastructure & insight that's currently missing … good to see Billy's on warm up for non-monic factorising in the moment, less helpful after". The screen comes in ticket 315 (mockup: https://claude.ai/artifact/VqKBobvLqcd1ftSauepHkH). This ticket builds what it reads.

The classmates' stream (`lib/stream.ts`, `data/stream.ts`) only knows when each problem was answered. It has no warm-up steps, no hints and no help.

## Acceptance

- [x] A pure model (for example `lib/place.ts`) gives each of the 20 students, at `now`: the place (not started, confidence check, warm-up chat, warm-up, Q1–Q10, handed in, absent), the detail (the warm-up skill; hint 1 or 2 on a question; practice on a skill), the step of three for warm-up and practice (worked example, finishing the steps, on their own / back on Q), and when that step began
- [x] Places in lesson order, the order ticket 315's rows use: Starting (not started, confidence check), Warm-up (chat and skills), Q1 … Q10, Handed in; absent students (Chloe on Problem Set 6, `data/absences.ts`) are named but in no row
- [x] Sam's place comes from his session as it is today (confidence, warm-up chat, warm-up, working, the overlay practice). Tickets 312 and 313 extend it with their steps; leave one clearly named function they change
- [x] The classmates' schedules (`data/stream.ts`) gain warm-ups and help, consistent with their own data. Students who answered not confident on Problem Set 6 (`data/classmates.ts`: Jordan, non-monic factorising; Mia, fractions and non-monic; Oliver, factorising; Tomas, fractions; Amelia, no skill named) take a warm-up on those skills, three steps each. Some students ask for help on a question where they really made the slip (check `data/evaluation.ts` and `data/story.ts` for who slipped where before choosing; never give a student a slip they did not make). A few ask for a hint. Everyone else works straight through
- [x] Everything a pure function of the records, the start time and `now`, as the stream is today: a reload continues, every tab agrees, the diagnostic pause still stops the clock, a presenter skip lands on the end state
- [x] Hand-in times and answered problems stay as they are: every existing test of the stream, the Mistakes tab and the later stages still passes unchanged
- [x] vitest (the model at several moments, including each place and step), eslint, tsc, next build
- [x] Ticket docs: `architecture/314.md`, ARCHITECTURE, DECISION_LOG (the story's choices), FUTURE_FEATURES

## Notes

- Keep the model free of React.

## Solution

`lib/place.ts` (no React): `Place` is not started, confidence check, warm-up chat, warm-up (skill, step 1–3), a question (with a hint 1–2 or practice on a skill at step 1–3), handed in or absent; `StudentPlace` adds `since`, when that step began.

- **Sam:** `sessionPlace(session, problems)` reads the session as it is today: overview and goal are not started; the confidence screen; the warm-up chat; the warm-up pad on `warmupStep`'s skill (its first problem step 1, its follow-up step 3); the question on screen (`problemIndex`), with the overlay's skill at step 1 (its follow-up step 2) and step 3, back on the question, after the overlay closes until he moves to another question; handed in past working, since `handedInAt`. Tickets 312 and 313 change this one function. `since` is null otherwise; `carrySince(prev, next, now)` lets a screen hold the first time it saw a place.
- **Classmates:** `classmateTimeline` builds places in time order from the record and `data/stream.ts`, and `classPlaces(set, session, now, absent)` reads it on the stream's clock (`streamElapsed`, `wallAt`): a reload continues, a diagnostic chain stops the clock, a presenter skip is the end state. Once Sam hands in, everyone who started is handed in, no later than Sam. A finished set is its records.
- **Rows:** `placeRows` gives Starting (not started, check), Warm-up (chat, skills), Q1 … Q10 and Handed in, every row present; absent students are in no row.
- **The story** (`data/stream.ts`: `warmUpSkills`, `help`, `hints`) all falls inside the existing times, so no answer or hand-in moves (a test compares every schedule with and without the new fields).

| Student | Confidence answer | Warm-up (chat, then 3 steps per skill) | Help (3 steps) on | Hints |
| --- | --- | --- | --- | --- |
| Jordan | low: non-monic factorising | non-monic (15–115 s) | | |
| Mia | low: fractions, non-monic | fractions, then non-monic (24–80 s) | | |
| Oliver | low: factorising | monic, then non-monic (24–65 s) | | |
| Tomas | low: fractions | fractions (15–105 s) | | |
| Amelia | low (none named) | the discriminant (15–70 s) | | |
| Liam | confident | | Q1, monic (pair multiplies to 6, adds to 7) | |
| Sofia | confident | | Q2, non-monic (brackets don't expand back) | |
| Harper | confident | | Q3, expanding (sign lost collecting) | |
| Finn | confident | | Q5, turning point (height from the wrong line) | |
| Noah | confident | | | 2 on Q3 (null factor law without zero) |
| Ethan | confident | | | 1 on Q4 (a, not 2a) |
| Ruby | confident | | | 1 on Q9 (axis as the height) |
| Priya, Zara, Aiden, Isla, Lucas, Grace | confident | | | straight through |
| Chloe | | absent | | |

Verification: vitest 1169 (`lib/place.test.ts` 26), eslint, tsc, next build. No screen changes, so no click-through.

## Judgement calls

- **On the teacher's Where students are (ticket 315), Amelia's warm-up reads "discriminant".** She answered "not confident" with no skill named, so the skill comes from her chat, which the demo does not script. The discriminant is the skill of her Q6 and Q10 wrong lines and the first thing her clarification names. The product's default for a chat that names nothing would be monic, which nothing in her record supports.
- **On the same screen, Oliver warms up on monic and then non-monic.** His label reads "factorising". The confidence list's factorising row with neither kind picked means both, and he slipped on both Q1 (monic) and Q2 (non-monic).
- **Each classmate spends their first seconds in the Starting row as "confidence check"** (6 s, less for Ethan, Aiden and Grace, whose first move comes sooner). During those seconds the Class tab's pill already reads "Q1 in progress".
- **Sam's question is the one on his screen.** The Class tab's pill names the first question with nothing written, so while Sam writes on Q2 the pill says Q3 and Where students are says Q2.
- **Help and hints fall on questions the student still got wrong.** The records fix every answer, and a slip is the only evidence of trouble on a question.
- **At the demo's pace, a warm-up step lasts 5 to 40 seconds and a help step 4 to 9.** Ticket 315's minutes on a step will mostly read 0. Hand-in times could not move.
