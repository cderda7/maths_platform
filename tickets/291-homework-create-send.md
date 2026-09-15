# 291: +Homework creates and sends Homework 3

**What to build:** the teacher's Classroom gains "+Homework" beside "+In-Class PSet". It runs the same create flow minus the pathway step (Questions – Difficulty – Refine – Send), with "Generate simulated assignment" filling in Homework 3; Create sends it to the class. The teacher's Classroom lists Homework 1–3 as homework cards.

**Blocked by:** 289, 290.

**Status:** done

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

## Solution

- **Kinds.** `lib/createPipeline.ts`: `CreateKind` = `"pset" | "homework"`, `PIPELINES.homework` = Questions, Difficulty, Refine, Send, `CREATE_ROUTES` (homework's own `/teacher/homework/create` and `/review`), `hasPathway`. The Questions and review components take `kind` from their route; each kind keeps its own draft and review in the classroom (`homeworkDraft`, `homeworkReview`; `draft/set` and `review/set` carry `kind`), so an in-class draft and a homework draft never overwrite each other.
- **Generate.** `data/homework-draft-seed.ts`: "Homework 3", ten new problems (x-intercepts, turning point and max/min, monic and non-monic factorising, exact roots, y-intercept and axis of symmetry, the discriminant with k, a sketch), none a copy of Problem Set 5's or 6's (tested by normalised TeX). Two seeded flaws: Q8 asks for the x-intercepts of `y = (x-3)^2 + 4`, which has none; Q9 is Q3 with the numbers changed. Refine (`HOMEWORK_RECOMMENDATIONS`) recommends changing Q8 to `(x-3)^2 - 4`, removing Q9, and adding a rule-from-features problem (three options) in Q9's slot. No goal box: nothing shows a homework's goal to students.
- **Due date.** `nextHomework(c)`: Homework 3's earliest day is the day after Homework 2's Mon 7 Sep and never before today (so Thu 10 Sep), and the picker starts a week after Homework 2, Mon 14 Sep (`DUE_DEFAULT.homework`). `HomeworkDef.day` carries each homework's due date with its year.
- **Create.** Refine's button reads Create for homework (no pathway) and waits for every answer as Finalise set does. It lights Send for 600 ms with the strip locked, dispatches `homework/send` (`homeworkSendAction`: `SentHomework` `hw-3`, the ten as Refine left them, due as picked) and the draft clear, and lands on the Classroom. It starts no lesson, resets no session and leaves Problem Set 6 alone.
- **One list.** `classHomeworks(c)` = the fixtures' Homework 1 and 2 plus every sent homework, oldest first; `homeworkForDue` / `coveredSetIds` over it put Problem Sets 5 and 6 under Homework 3. Sam's Classroom still reads the fixtures (ticket 292 switches it to this list with the Future panel).
- **PSet note.** `psetDueNote(due, c)`: a date inside a homework that has opened (`openedAt`, stamped by ticket 292; the fixtures' past homeworks count as opened) reads "Mistakes from this set go into Homework N" under the picker. The note sits under the field's right edge out of the flow, so it moves nothing.
- **Teacher's Classroom.** `+Homework` beside `+In-Class PSet`, the same button. Past lists homework cards among the sets, newest due first, a set above a homework due the same day (`pastWithHomework`): chip "homework", "covers Problem Sets 3 and 4", then "sent" (Homework 3 until it opens), "open", or once due Sam's status with the green check or the caution triangle ("Sam completed it on time", "Sam missed it"). The card is a plain div: no link, hover, focus or arrow (the arrow's room kept so the due dates line up).
- **Bug fixed.** Reloading the Questions page (either kind) focused the ghost tile, which scrolled the page 512 px at 1280×800; the editor now focuses nothing when it opens.

## Acceptance

- [x] `+Homework` → generate → Difficulty → Refine → Create sends Homework 3 due Mon 14 Sep; stored, survives reload and tabs
- [x] The strip never shows PATHWAY for homework; the PSet flow unchanged
- [x] Picker blocks dates ≤ Mon 7 Sep for homework; the PSet picker note appears for a date inside an open homework (model tests, and on screen with the stored homework stamped open)
- [x] Teacher's Classroom shows three Homework cards that do not open; PS6's cards and Live unchanged
- [x] No difficulty tags on any student screen this touches (none is touched; Sam's Classroom checked)
- [x] vitest, eslint, tsc, next build, check:laptop (76: `/teacher/homework/create` added); click-through at 1280×800 and 1440×900
- [x] FUTURE_FEATURES: teacher view of homework results; an "opens" date for homework
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log
