# 291: +Homework creates and sends Homework 3

**What to build:** the teacher's Classroom gains "+Homework" beside "+In-Class PSet". It runs the same create flow minus the pathway step (Questions – Difficulty – Refine – Send), with "Generate simulated assignment" filling in Homework 3; Create sends it to the class. The teacher's Classroom lists Homework 1–3 as homework cards.

**Blocked by:** 289, 290.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "the teacher will have 10 problems ALL students do ... what is currently the + New Assignment Button will become + ICW PSet, & then add a + HW ... have + HW work very similar to how + New Assignment works -- same 'generate simulated assignment', finalize set. skip entirely the 'new skills' & 'review pathway' screen. so 'questions - difficulty - assessment' is the pipeline ... the HW one should end in 'send'."

## Decisions

- Button label exactly `+Homework`, same style as `+In-Class PSet`; no "NEW HW" eyebrow.
- Strip: QUESTIONS — DIFFICULTY — REFINE — SEND. No New skills, no Review pathway, no groups. Refine's "Finalise set" leads straight to Create; Create lights SEND (ticket 288) and sends.
- **Generated draft**: "Homework 3", 10 new problems (not copies of PS5/PS6) across the week's topics, features of a parabola and roots of a quadratic, with a couple of seeded flaws (as the PSet draft has) so Refine has recommendations.
- **Due-date picker** (ticket 289) defaults to Mon 14 Sep; rejects a date on or before the previous homework's due date (Mon 7 Sep).
- **Covered sets** by the date rule (ticket 290): Homework 3 covers PS5 and PS6.
- **Freeze at opening** (ticket 292 opens it): on the PSet picker, when the chosen date falls inside a homework that is already open, show a note under the date: "Mistakes from this set go into Homework N" (the next one).
- Teacher's Classroom: Homework 1, 2 (past) and 3 (once sent) as cards marked Homework; **they open nothing** (a teacher view of homework results → FUTURE_FEATURES). HW1 and HW2 need only name, due date and Sam's status, not problems.
- Sending a homework does not start a lesson and does not touch Problem Set 6's run.

## Acceptance

- [ ] `+Homework` → generate → Difficulty → Refine → Create sends Homework 3 due Mon 14 Sep; stored, survives reload and tabs
- [ ] The strip never shows PATHWAY for homework; the PSet flow unchanged
- [ ] Picker blocks dates ≤ Mon 7 Sep for homework; the PSet picker note appears for a date inside an open homework
- [ ] Teacher's Classroom shows three Homework cards that do not open; PS6's cards and Live unchanged
- [ ] No difficulty tags on any student screen this touches
- [ ] vitest, eslint, tsc, next build, check:laptop 74; click-through at 1280×800 and 1440×900
- [ ] FUTURE_FEATURES: teacher view of homework results; an "opens" date for homework
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log
