# 313: The warm-up starts each skill with a worked example

**What to build:** each skill in the warm-up runs worked example → completion problem (the student writes the blank last lines) → a problem alone, in place of today's problem-first flow.

**Blocked by:** 312 (shares `PracticePad` and the session's practice run).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

Today each warm-up skill opens on a problem attempted cold. The worked example is one option in the help menu and the follow-up opens only after it. The user (2026-09-15) agreed the warm-up should model first, with the same three steps as help from a set question (ticket 312), on the skill itself since there is no Q yet.

Who gets a warm-up does not change. The user: a student who says they are confident is not offered a warm-up ("if a student self-reports as confident, but then we tell them 'go warm up on X' … they will not feel heard"). The student's own answer decides; past sets are for the teacher. Every skill a not-confident student ticks or names gets all three steps. The skill map does not pick a starting step.

## Acceptance

- [ ] Each warm-up skill, in today's easiest-first order: step 1, today's practice problem as a worked example (with chat beside it, as ticket 312); step 2, ticket 310's completion problem with its blank lines checked (ticket 311), a wrong line marked and chat only on press, a blank filled in after two wrong lines; step 3, today's follow-up done alone, with hint, chat and "see the example again"
- [ ] A student can move on from any step (the skill chips and the warm-up's existing way to the set stay)
- [ ] A student who answers confident is never offered a warm-up (a test holds it); "I need help" inside the set is still there for them
- [ ] The warm-up may use any skill the set uses, New skills included (New skills means assessed for the first time this week, not first exposure)
- [ ] The session records each warm-up skill's step and when it started; ticket 314's place model shows it on the teacher's laptop
- [ ] No video option; no difficulty tags on any student screen
- [ ] `scripts/warmup-leaves.json` and the hint-box sweep cover every completion problem
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900: a not-confident student through two skills (every step, a wrong line marked then corrected, moving on early), a confident student with no offer; nothing scrolls sideways
- [ ] Ticket docs: `architecture/313.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES
